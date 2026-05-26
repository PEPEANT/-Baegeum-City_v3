# Baegeum City V2 Restored Asset Pipeline

Conclusion: before the restored build adds partner illustrations, phone art, casino tables, or more music, every asset should enter through a manifest id and a clear folder role.

## Purpose

This document owns the pre-redesign asset workflow for the current player-facing build:

```text
index.html -> baegeum-city-v2-dice.html
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
  images/
    partners/
    items/
    backgrounds/
    ui/
    city/
    casino/
    phone/
  source/
    generated/
    github/
    screenshots/
  manifests/
```

Primary roots:

- `assets/restored/audio`
- `assets/restored/images`

Raw human-provided files can first land in `assets/inbox/`. That folder is quarantine and is intentionally excluded from runtime manifest coverage until a file is promoted.

Do not create a new one-off folder for a single feature. If the asset does not fit one of these roles, add the role here first and guard it in the manifest check.

## Asset Ids

Runtime code should use asset ids, not raw file paths.

Examples:

```text
audio:bgm:reclaim-2-5:0
image:partner:college-student:portrait-neutral
image:item:ring:icon
image:casino:odd-even:table
image:phone:news:app-icon
```

Rules:

- Keep ids lowercase.
- Use colon-separated domains.
- Make the first segment the media type: `audio` or `image`.
- Make the second segment the gameplay role: `bgm`, `partner`, `item`, `casino`, `phone`, and so on.
- Use stable ids even if the file path changes later.

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
- `item`: inventory, gifts, luxury goods, and ownership icons.
- `background`: phone wallpaper, room backgrounds, city scene backplates.
- `ui`: app icons, buttons, badges, and interface-only art.
- `city`: buildings, district thumbnails, travel images.
- `casino`: tables, chips, cards, slot art, gambling venue images.
- `phone`: phone app surfaces and notification art.
- `preview` or `reference`: local concept/reference images that should not become gameplay assets yet.

Allowed runtime image extensions:

```text
.png .jpg .jpeg .webp .svg
```

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
  status: "planned"
}
```

Open-source references belong in `refs/` first. Do not copy files from GitHub into `assets/` until the license and allowed use are recorded.

## Runtime Rule

The restored HTML should not grow new direct mp3 or image paths. Use this flow:

```text
UI or system wants art/audio
-> ask asset manifest by id
-> receive path and metadata
-> render or play with fallback
```

Future illustration and conversation systems should store only `assetId` values.

## Verification

`tools/check-restored-asset-pipeline.cjs` guards this pipeline.

The check should fail when:

- A `.mp3`, `.png`, `.jpg`, `.jpeg`, `.webp`, or `.svg` file exists under `assets/` but is not listed in `src/restored/assets/asset-manifest.js`.
- Exception: `assets/inbox/` is allowed to contain raw unpromoted files and must not be referenced at runtime.
- A manifest path does not exist.
- An audio file uses an image role, or an image file uses an audio role.
- Asset ids are duplicated.
- This document is not linked from `docs/INDEX.md`.

This gives the redesign a simple rule: add the file, register the id, then use the id.
