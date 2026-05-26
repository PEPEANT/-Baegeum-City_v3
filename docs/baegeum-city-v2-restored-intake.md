# Baegeum City V2 Restored Intake

Conclusion: when the human provides a file, link, design draft, or character idea, first capture it as intake material, then promote it into manifests/catalogs only after source and fit are clear.

## Purpose

This document owns the receiving lane for future restored-build material.

Use it when the human gives:

- mp3, wav, ogg files
- png, jpg, jpeg, webp, svg images
- GitHub repository links
- HTML/CSS design drafts
- partner character ideas
- casino/table/game UI references
- phone app references
- raw notes that need to become catalog entries later

## Intake Locations

```text
assets/inbox/
  README.md
  *.intake.md
  raw files from the human

refs/intake/
  README.md
  github/reference/note intake cards

tools/intake-restored-material.cjs
```

`assets/inbox/` is quarantine. Files there are not runtime assets yet and should not be referenced from game code.

`refs/intake/` is reference-only. Links and notes there are not permission to copy code, art, or audio.

## Intake Command

Use this command to classify a provided item:

```bash
node tools/intake-restored-material.cjs "<file-or-url>"
```

Write an intake card:

```bash
node tools/intake-restored-material.cjs "<file-or-url>" --write
```

Useful examples:

```bash
node tools/intake-restored-material.cjs "assets/inbox/partner.png" --role=partner --id=image:partner:college-student:portrait-neutral --write
node tools/intake-restored-material.cjs "assets/inbox/casino-bgm.mp3" --role=bgm --id=audio:bgm:casino-night:loop --write
node tools/intake-restored-material.cjs "https://github.com/owner/repo" --kind=github --name=RepoName --write
```

The command does not make a file safe to ship by itself. It creates a clear next step.

## Promotion Flow

```text
human provides material
-> put raw files in assets/inbox or create refs/intake card
-> run tools/intake-restored-material.cjs
-> review source/license/fit
-> move or copy approved assets into assets/restored/*
-> register asset ids in src/restored/assets/asset-manifest.js
-> connect catalogs or UI by id
-> run npm run check
```

## Asset Promotion Targets

Audio:

```text
assets/restored/audio/bgm/
assets/restored/audio/sfx/
assets/restored/audio/voice/
assets/restored/audio/ambience/
```

Images:

```text
assets/restored/images/partners/
assets/restored/images/items/
assets/restored/images/backgrounds/
assets/restored/images/ui/
assets/restored/images/city/
assets/restored/images/casino/
assets/restored/images/phone/
```

Reference/source-only files:

```text
assets/restored/source/generated/
assets/restored/source/github/
assets/restored/source/screenshots/
```

## Rules

- Do not reference `assets/inbox/` from HTML, JS, CSS, or catalogs.
- Do not put GitHub code or assets into runtime folders before a license/structure review.
- Do not add new raw paths to `baegeum-city-v2-dice.html`.
- Do not promote a file without a stable id.
- Do not use a design draft as gameplay logic until the owning system is documented.

## Verification

`tools/check-restored-intake.cjs` guards the intake lane.

It should fail when:

- this document is not linked from `docs/INDEX.md`
- `assets/inbox/README.md` or `refs/intake/README.md` is missing
- `tools/intake-restored-material.cjs` is missing or cannot classify sample inputs
- runtime files reference `assets/inbox/`

`assets/inbox/` is intentionally excluded from the runtime asset-manifest coverage so the human can drop raw material there without breaking the whole project before review.
