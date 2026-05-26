# Reference Intake

Use this folder for human-provided links, notes, design references, and open-source candidates before they become project docs or runtime assets.

Rules:

- Reference cards are not import approval.
- GitHub links stay reference-only until license and structure are reviewed.
- Runtime assets belong in `assets/restored/` only after promotion.

Create a card with:

```bash
node tools/intake-restored-material.cjs "https://github.com/owner/repo" --kind=github --write
```
