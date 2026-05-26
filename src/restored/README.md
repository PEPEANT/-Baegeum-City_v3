# Restored Build Modules

This folder is for the active Dice City-derived `baegeum-city-v2-dice.html` build.

Do not mix this code with the paused canvas city-core modules in `src/scenes`, `src/systems`, or `src/data`.

Growth order:

1. Move state, storage, and catalog data here first.
2. Split relationship, conversation, ownership, gambling, and illustration systems into small files.
3. Keep UI renderers separate from state-changing systems.
4. Use `tools/check-restored-growth-architecture.cjs` to guard the split.

Current pre-split contracts:

- `account/session-contract.js`: login/account state, online availability state, and legacy save-code visibility rules.
- `online/online-adapter-contract.js`: unavailable-by-default online adapter snapshot, online state validation, and lobby availability guard.
- `player/profile-contract.js`: player profile, job title, residence, condition, and core stat shape for My Info.
- `phone/phone-app-contract.js`: phone app ids, display labels, and phone/smartphone access gates.
- `data/city-catalog.js`: restored city roles for `baegeum-city`, `dice-city`, and `seosan-city`.
- `data/place-catalog.js`: future place ids, UI surfaces, and actor slots.
- `data/location-catalog.js`: home, house-front, travel, and city location contexts.
- `data/rank-catalog.js`: wealth rank thresholds, rank emoji, and house flavor.
- `data/market-catalog.js`: stock/crypto seeds, market cycles, news messages, and crash messages.
- `data/asset-catalog.js`: real-estate and luxury/item seeds for initial state.
- `data/partner-catalog.js`: first partner archetypes for walk encounters.
- `inventory/consumable-contract.js`: restored consumable item use effects, starting with energy drink energy recovery.
- `inventory/inventory-view.js`: My Info carried-item preview renderer.
- `state/initial-state.js`: live restored initial state used by `baegeum-city-v2-dice.html`.
- `state/storage.js`: live save/load and cash-only save-code helpers.
- `state/selectors.js`: total asset, rank, ownership value, phone, smartphone, and carried-inventory selectors.
- `actors/actor-contract.js`: AI actor identity, location, and memory-event shape.
- `ui/shell-contract.js`: bottom tabs, phone apps, and major UI surfaces.
- `ui/location-nav-contract.js`: location-aware actions for home, house-front, travel, and first city contexts.
- `assets/asset-manifest.js`: restored mp3/image ids and legacy asset registration.

Planning docs:

- `docs/baegeum-city-v2-restored-recomposition-plan.md`: split order and bottleneck rules.
- `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`: UI surface, online, ranking, and chat expansion order.
- `docs/baegeum-city-v2-restored-asset-pipeline.md`: mp3/image folder roles and manifest rules.
- `docs/plans/README.md`: generated feature-plan drafts before implementation.
- `docs/plans/restored-login-home-online-phone-migration.md`: login home, online adapter, MammonCity2 reference, and save-code retirement plan.
- `docs/plans/restored-ui-surface-redesign.md`: pre-redesign surface checklist for My Info, home, outside, phone, cities, assets, ranking, chat, and online boundaries.

Phone direction:

- The relationship/lover list is a phone app entry, not a My Info section.
- The phone should grow through an app registry, launcher, and app-stage/window flow before individual app renderers expand.
- `docs/templates/restored-feature-plan-template.md`: feature plan shape, including job and occupation ranking impact.

Planning command:

- `npm run plan:restored -- <slug> --title="Feature Title" --surface=phone --domain=ranking --write`

Intake lane:

- Raw human-provided files start in `assets/inbox/`.
- Links and notes start in `refs/intake/`.
- Use `node tools/intake-restored-material.cjs` to create intake cards before promotion.
