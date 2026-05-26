# Restored Build Modules

This folder is for the active Dice City-derived `baegeum-city-v2-dice.html` build.

Do not mix this code with the paused canvas city-core modules in `src/scenes`, `src/systems`, or `src/data`.

Growth order:

1. Move state, storage, and catalog data here first.
2. Split relationship, conversation, ownership, gambling, and illustration systems into small files.
3. Keep UI renderers separate from state-changing systems.
4. Use `tools/check-restored-growth-architecture.cjs` to guard the split.

Current pre-split contracts:

- `data/city-catalog.js`: restored city roles for `baegeum-city` and `dice-city`.
- `data/place-catalog.js`: future place ids, UI surfaces, and actor slots.
- `state/initial-state.js`: live restored initial state used by `baegeum-city-v2-dice.html`.
- `state/storage.js`: live save/load and cash-only save-code helpers.
- `state/selectors.js`: total asset, rank, ownership value, phone, and smartphone selectors.
- `actors/actor-contract.js`: AI actor identity, location, and memory-event shape.
- `ui/shell-contract.js`: bottom tabs, phone apps, and major UI surfaces.
- `assets/asset-manifest.js`: restored mp3/image ids and legacy asset registration.

Planning docs:

- `docs/baegeum-city-v2-restored-recomposition-plan.md`: split order and bottleneck rules.
- `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`: UI surface, online, ranking, and chat expansion order.
- `docs/baegeum-city-v2-restored-asset-pipeline.md`: mp3/image folder roles and manifest rules.
- `docs/plans/README.md`: generated feature-plan drafts before implementation.
- `docs/templates/restored-feature-plan-template.md`: feature plan shape, including job and occupation ranking impact.

Planning command:

- `npm run plan:restored -- <slug> --title="Feature Title" --surface=phone --domain=ranking --write`

Intake lane:

- Raw human-provided files start in `assets/inbox/`.
- Links and notes start in `refs/intake/`.
- Use `node tools/intake-restored-material.cjs` to create intake cards before promotion.
