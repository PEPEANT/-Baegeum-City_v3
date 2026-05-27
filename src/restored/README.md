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
- `online/marathon-room-adapter.js`: dev-only Singularity Race room adapter and connected lobby gate helper; unavailable by default unless the caller enables dev mode or injects a connected server transport plus room list.
- `online/marathon-server-room-adapter.js`: server-transport-backed Singularity Race room adapter shape, kept separate from the dev adapter so future WebSocket/Firebase rooms can plug in without opening public matchmaking by default.
- `online/marathon-channel-adapter.js`: dev-only Singularity Race lobby, room, spectator, admin, and notice channel contracts plus local message shape.
- `online/marathon-dev-chat-transport.js`: temporary same-origin dev chat relay and latest-500-message local history for Singularity Race lobby/admin pages before the real server transport exists.
- `online/marathon-dev-room-transport.js`: temporary same-origin dev room packet relay for Singularity Race join/input/skill/attack/snapshot packets before WebSocket delivery exists.
- `online/marathon-netcode-contract.js`: 30-runner Singularity Race latency/bandwidth budget, input coalescing, snapshot cadence, interpolation, degraded-lane rules, and relay packet pressure guard.
- `online/marathon-server-transport-contract.js`: server-shaped Singularity Race WebSocket/Firebase-style transport config, snapshot, and packet envelope contract for future server delivery without embedded client secrets.
- `online/marathon-server-provider-adapter.js`: pure provider-flow state machine for the first real online bridge, enforcing `hello -> join -> chat_history -> state_snapshot` and server-owned replay/snapshot packets.
- `online/marathon-server-state-contract.js`: server-owned Singularity Race movement state, including room start, accepted input application, stale-input rejection, finish clamp, and server-owned runner snapshots.
- `online/marathon-websocket-dev-server-mock.js`: local WebSocket-shaped server rehearsal for connected transport, room join, client packet ingest, server-owned movement, server snapshot creation, and netcode rate limiting without opening public online.
- `games/singularity-race-dev-online.js`: player-page dev relay helpers plus the server `state_snapshot` to runner-display merge used before a real transport is attached.
- `games/marathon-input-contract.js`: pure Singularity Race WASD, Shift sprint, E skill, and mouse attack input contract.
- `games/marathon-character-skill-contract.js`: pure checkpoint meme-style character assignment and skill-use contract.
- `games/marathon-combat-contract.js`: pure mouse attack, hit, runner-down, and checkpoint respawn contract.
- `games/marathon-trail-geometry.js`: single log-curve trail geometry, five save point positions, SVG path helpers, and pointer-to-progress estimation for the standalone lobby.
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
- `assets/asset-manifest.js`: restored mp3/image ids, character/race asset roles, source/status metadata, and legacy asset registration.

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
