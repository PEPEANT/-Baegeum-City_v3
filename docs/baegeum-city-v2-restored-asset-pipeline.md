# Baegeum City V2 Restored Asset Pipeline

Conclusion: before the restored build adds partner illustrations, phone art, casino tables, or more music, every asset should enter through a manifest id and a clear folder role.

## Purpose

This document owns the pre-redesign asset workflow for the current player-facing build:

```text
index.html -> singularity-race-first launcher
sub mode -> baegeum-city-v2-dice.html
src/restored/assets/asset-manifest.js
```

The goal is not to move every existing file today. The goal is to prevent the next wave of mp3 files, portraits, event illustrations, item icons, and UI images from being hardcoded directly into HTML.

## Current Inventory

Current asset files are still mixed between legacy root files and the old OST folder:

```text
assets/
  abrams_style_tank_2d.svg
  abrams_style_tank_2d_preview.png
  abrams_style_tank_topview.svg
  abrams_style_tank_topview_preview.png
  audio/ost/reclaim-2.5/bgm_0.mp3
  audio/ost/reclaim-2.5/bgm_1.mp3
  audio/ost/reclaim-2.5/bgm_2.mp3
  audio/ost/VENDOR.md
```

These files remain in place until a deliberate migration is approved. The manifest can reference legacy paths while the code is being split.

## Target Folders

Future restored assets should land under `assets/restored/` by role:

```text
assets/restored/
  audio/
    bgm/
    sfx/
    voice/
    ambience/
    singularity-race/
      bgm/
      sfx/
      voice/
      ambience/
  images/
    characters/
      <character-id>/
        portrait/
        fullbody/
        chibi/
        emotion/
        cutscene/
    partners/
    items/
    backgrounds/
    ui/
    city/
    casino/
    phone/
    singularity-race/
      characters/
      skills/
      skins/
      stadium/
      ui/
  source/
    original/
    generated/
    github/
    human/
    references/
    screenshots/
  manifests/
    batches/
```

Primary roots:

- `assets/restored/audio`
- `assets/restored/images`
- `assets/restored/images/characters`
- `assets/restored/images/singularity-race`
- `assets/restored/source`
- `assets/restored/manifests`

Raw human-provided files can first land in `assets/inbox/`. That folder is quarantine and is intentionally excluded from runtime manifest coverage until a file is promoted.

Do not create a new one-off folder for a single feature. If the asset does not fit one of these roles, add the role here first and guard it in the manifest check.

## Asset Ids

Runtime code should use asset ids, not raw file paths.

Examples:

```text
audio:bgm:reclaim-2-5:0
image:partner:college-student:portrait-neutral
image:character:dororong:portrait-neutral
image:race:skill:slow-zone:icon
image:race:skin:mint-runner:chibi-run
image:item:ring:icon
image:casino:odd-even:table
image:phone:news:app-icon
audio:race:sfx:countdown-beep
```

Rules:

- Keep ids lowercase.
- Use colon-separated domains.
- Make the first segment the media type: `audio` or `image`.
- Make the second segment the gameplay role: `bgm`, `partner`, `item`, `casino`, `phone`, and so on.
- Use stable ids even if the file path changes later.
- Use optional `collection` metadata for feature-owned packs such as `singularity-race`.
- Store only asset ids in gameplay catalogs, packets, save data, and character definitions.

## Audio Rules

Audio files must be classified before use:

- `bgm`: looping or long-form music.
- `sfx`: short one-shot UI or game sounds.
- `voice`: spoken partner/NPC lines.
- `ambience`: location beds such as street, casino room, rain, or city noise.

Allowed runtime audio extensions:

```text
.mp3 .ogg .wav
```

The current `reclaim-2.5` mp3 files are registered as legacy `bgm` assets.

## Image Rules

Images must be classified before use:

- `partner`: portraits, outfits, mood states, date/event illustrations.
- `character`: shared character illustrations that can appear in several systems.
- `item`: inventory, gifts, luxury goods, and ownership icons.
- `background`: phone wallpaper, room backgrounds, city scene backplates.
- `ui`: app icons, buttons, badges, and interface-only art.
- `city`: buildings, district thumbnails, travel images.
- `casino`: tables, chips, cards, slot art, gambling venue images.
- `phone`: phone app surfaces and notification art.
- `race`: Singularity Race general art.
- `skill`: skill icons and effect cards.
- `skin`: playable skin and runner variants.
- `stadium`: race course, stadium, checkpoint, and finish-line art.
- `preview` or `reference`: local concept/reference images that should not become gameplay assets yet.

Allowed runtime image extensions:

```text
.png .jpg .jpeg .webp .svg
```

## Character Pack Rules

Character assets should be grouped by stable character id before they are used in UI:

```text
assets/restored/images/characters/<character-id>/
  portrait/portrait-neutral.webp
  portrait/portrait-happy.webp
  fullbody/fullbody-default.webp
  chibi/chibi-idle.webp
  chibi/chibi-run.webp
  emotion/emotion-angry.webp
  cutscene/cutscene-intro.webp
```

Singularity Race can own race-only variants without polluting shared character art:

```text
assets/restored/images/singularity-race/characters/<character-id>/
assets/restored/images/singularity-race/skills/<skill-id>/
assets/restored/images/singularity-race/skins/<skin-id>/
assets/restored/images/singularity-race/stadium/
assets/restored/audio/singularity-race/sfx/
```

Rules:

- Shared `characters/` art can be reused by relationship, phone, city, and race systems.
- `singularity-race/` art is feature-owned and can be optimized for small runner sprites, chibi poses, skill icons, and stadium UI.
- Do not put copied meme or IP art directly into runtime folders unless source and rights are clear. Use original/parody-safe designs or keep references in `assets/restored/source/references/`.
- Character catalogs should point to manifest ids, not paths.

## Source And License Rule

Every external or generated asset needs a traceable source before it becomes active content.

Minimum manifest fields:

```js
{
  id: "image:partner:college-student:portrait-neutral",
  type: "image",
  role: "partner",
  path: "assets/restored/images/partners/college-student/portrait-neutral.png",
  source: "generated",
  status: "planned",
  collection: "relationship"
}
```

Open-source references belong in `refs/` first. Do not copy files from GitHub into `assets/` until the license and allowed use are recorded.

Recommended optional fields:

```js
{
  collection: "singularity-race",
  characterId: "dororong",
  variant: "chibi-run",
  width: 512,
  height: 512,
  durationMs: 1200,
  loop: false
}
```

Keep these fields metadata-only until a renderer needs them.

## Runtime Rule

The restored HTML should not grow new direct mp3 or image paths. Use this flow:

```text
UI or system wants art/audio
-> ask asset manifest by id
-> receive path and metadata
-> render or play with fallback
```

Future illustration and conversation systems should store only `assetId` values.

## Bug Prevention Plan

Likely issues and the guard to use:

- Inbox leakage: runtime must never reference `assets/inbox/`; intake and asset checks guard this.
- Duplicate names: manifest ids are stable and unique even when files are renamed.
- Wrong feature loading: use `collection: "singularity-race"` or another collection tag for feature-owned packs.
- Large files causing slow loads: keep masters in `assets/restored/source/original/`, then promote compressed runtime copies.
- Broken character variants: use the character pack folder shape and variant names such as `portrait-neutral`, `chibi-run`, and `skill-icon`.
- License/source confusion: every manifest entry needs `source` and `status`; copied external material stays reference-only until reviewed.
- Online sync bugs: online packets and save data should send asset ids only, never raw URLs or local paths.
- Audio autoplay errors: manifest registration does not imply automatic playback; runtime systems must request playback after user interaction.
- Case-sensitive deployment bugs: use lowercase kebab-case file and folder names.
- Missing runtime file bugs: `tools/check-restored-asset-pipeline.cjs` checks that manifest paths exist.

## Verification

`tools/check-restored-asset-pipeline.cjs` guards this pipeline.

The check should fail when:

- A `.mp3`, `.png`, `.jpg`, `.jpeg`, `.webp`, or `.svg` file exists under `assets/` but is not listed in `src/restored/assets/asset-manifest.js`.
- Exception: `assets/inbox/` is allowed to contain raw unpromoted files and must not be referenced at runtime.
- A manifest path does not exist.
- An audio file uses an image role, or an image file uses an audio role.
- Asset ids are duplicated.
- A manifest entry points at `assets/inbox/`.
- A manifest entry is missing source/status metadata.
- The restored asset README guard files are missing.
- This document is not linked from `docs/INDEX.md`.

This gives the redesign a simple rule: add the file, register the id, then use the id.
