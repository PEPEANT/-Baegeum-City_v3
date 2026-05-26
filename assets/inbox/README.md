# Restored Asset Inbox

Drop human-provided raw files here before they are reviewed.

This folder is quarantine:

- Files here are not runtime assets.
- Game code must not reference `assets/inbox/`.
- Approved files should move into `assets/restored/` and be registered in `src/restored/assets/asset-manifest.js`.

Create an intake card with:

```bash
node tools/intake-restored-material.cjs "assets/inbox/example.png" --write
```
