# AI Working State

Conclusion: the human has pivoted the active playable entry to a Dice City-derived single-file **배금도시 V2** restore. The previous modular city-core, multimap, ledger, and editor work remains preserved as reference/source material, but the current player-facing start is the restored economy-clicker HTML.

Current verified building shell presets: baegeum-city uses the `도시` infrastructure shells plus `building-shop-shell`, `building-home-shell`, and `building-civic-shell`; dice-city uses `building-casino-shell`, `building-alley-shell`, `building-loan-shell`, and `building-motel-shell`.
Current verified horse-racing interior sections: `horse-scoreboard`, `horse-track`, `horse-grandstand`, `horse-betting-station`, and `exchange-atm`.

## Last Known Project Shape

- Project: `baegeum-city-v2`
- Runtime: browser-based offline city-core prototype
- Main command: `npm start`
- Full check: `npm run check`
- Current priority source: `docs/baegeum-city-v2-work-queue.md`
- Foundation rules: `docs/baegeum-city-v2-foundation.md`

## Active Priority

Dice City full-restore playable prototype is the active priority:

1. Root `index.html` redirects to `baegeum-city-v2-dice.html`.
2. `baegeum-city-v2-dice.html` is the current player-facing build: a full Dice City-style single HTML renamed to 배금도시 V2.
3. The restored build owns its own localStorage key, `baegeum_city_v2_dice_restore`, so it does not mix with the previous modular city-core storage.
4. The previous ledger/action/multimap city-core remains in `src/`, `editor.html`, and docs, but it is paused unless the human explicitly redirects back to that architecture.
5. `docs/baegeum-city-v2-restored-growth-architecture.md` is the current growth architecture for AI lovers, emotion, gambling, ownership, conversation, and illustrations.
6. Near-term code changes should start extracting state/storage/catalog modules under `src/restored/` instead of adding more inline script to the restored HTML.
7. Asset additions for mp3 files, partner illustrations, phone art, casino art, and item images should go through `src/restored/assets/asset-manifest.js` and `docs/baegeum-city-v2-restored-asset-pipeline.md` before runtime use.
8. Restored read-only selectors for total asset, rank, ownership value, phone ownership, and smartphone ownership now live in `src/restored/state/selectors.js`.
9. Human-provided files, links, design drafts, and raw notes now have an intake lane: raw files in `assets/inbox/`, reference cards in `refs/intake/`, and classification through `tools/intake-restored-material.cjs`.
10. Restored UI, online expansion, ranking, and chat growth are now planned in `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`; phone remains the hub for news, markets, rankings, and chat, while bottom nav stays `myinfo / phone / realestate / casino / shop`.
11. New restored features should get a draft plan through `npm run plan:restored -- <slug> --write` before implementation. The plan template includes job/occupation impact so rankings can include jobs without mixing them into wealth rank.
12. `docs/plans/restored-ranking-job-system.md` is the first concrete restored feature plan. It keeps wealth title, leaderboard position, and job/occupation rank separate.

Multimap safety remains verified:

1. Pre-multimap backup exists at `C:\Users\rneet\OneDrive\문서\baegeum-city-v2-backups\pre-multimap-20260526-114932`.
2. `src/data/map-registry.js` owns `baegeum-city` and `dice-city` ids, scene ids, draft keys, spawn ids, and world channels.
3. `src/data/world-editor-draft.js` now reads map-specific draft keys first, allows baegeum-only legacy fallback, and keeps dice-city isolated from legacy draft data.
4. The current editor has an `activeMapId` selector and can edit both `baegeum-city` and the separate `dice-city-v0` base map.
5. `dice-city-v0` contains road/spawn/building-shell/scenery base data plus copied blackjack, odd-even, and horse-track venue anchors with doors and signs. It does not contain moved originals or betting logic changes.
6. `src/data/map-transitions.js` owns the baegeum-city -> dice-city and dice-city -> baegeum-city bus-terminal `map_transition` objects.
7. `src/systems/map-transition-runtime.js` creates a `map_transition` action and `player_state_patch` that switches `mapId`, `sceneId`, `spawnId`, and `chatChannelId` together.
8. The bus-terminal interactions are playable in-game from baegeum-city to dice-city and back to baegeum-city.
9. `tools/smoke-casino-copy-contract.cjs` now guards that copied casino anchors do not delete or reuse the baegeum-city originals.
10. `src/scenes/city-startup.js` supports dev-only `?map=dice-city&spawn=dice-blackjack-casino-01` style verification starts.
11. Browser verification confirmed the copied dice blackjack venue door, interior entry, venue channel, and online room state.
12. `src/renderers/simple-scenery-renderer.js` renders dice-city trees, brush, streetlights, and billboards.
13. `dice-city` building shells are intentionally not converted into enterable casinos by runtime generation.
14. `src/data/baegeum-city-compact-layout.js` applies `baegeum-city-compact-layout-v2` to runtime/editor maps. The browser Iron Line map is compacted from height 5600 to 2800 by scaling y positions, object heights/radii, spawns, bus terminal anchor inputs, scenery, roads, and nav nodes together.
15. `src/data/city-district-contract.js` now defines `life_hub` for `baegeum-city` and `gambling_night` for `dice-city`, including allowed new building types, district ids, and `legacy_preserved` status for current baegeum casino originals.
16. Do not shrink `baegeum-city` further by changing only `height`. `tools/smoke-baegeum-map-shrink-readiness.cjs` still guards that any future shrink must keep roads, walls, spawn, terminal, scenery, and nav inside the target height.
17. `src/data/baegeum-city-urban-layout.js` applies `baegeum-city-urban-layout-v1` to runtime/editor baegeum maps. It mutes the ground away from battlefield green, removes red/blue base overlays and legacy `base-wall` objects, replaces them with `city-boundary` outer tunnel/wall objects, and removes battlefield scenery such as sandbags, barricades, and rubble.
18. The map editor build palette is now city-role aware. `baegeum-city` exposes a `도시` tab for infrastructure shells plus lifestyle/civic `building_shell` presets, while `dice-city` exposes casino/back-alley/nightlife `building_shell` presets.

Current bug-first economy/code-health audit state:

1. Phase 1 inventory is recorded in `docs/ai-code-health-inventory-2026-05-26.md`.
2. The first runtime-state facade repair is implemented in `src/systems/runtime-state-facade.js`.
3. `src/scenes/city-scene.js`, `src/ui/world-chat-panel.js`, `src/ui/mobile-action-controls.js`, `src/ui/exchange-atm-panel.js`, `src/ui/odd-even-table-panel.js`, `src/ui/player-status-hud.js`, `src/devices/phone/mammon-phone-shell.js`, `src/devices/phone/dis-preview.js`, `src/systems/interior-interaction-runtime.js`, and `src/systems/local-action-runtime.js` now use the facade, with `tools/smoke-runtime-state-facade.cjs` in `npm run check`.
4. Venue metadata persistence now writes through `writeStoredVenueMetadata` instead of bypassing normalization.
5. `src/systems/local-storage-diagnostics.js` now starts the persistence bug-hunt pass with read-only localStorage status inventory.
6. Economy, ledger, venue metadata, and world-editor draft readers now expose corrupt-storage status without changing their fallback behavior.
7. Money-affecting ledger effect failures now flow through `src/systems/local-ledger-effect.js`, so exchange ATM and odd-even bet reservation can report `missing_effect`, `missing_economy_record`, or `record_failed` instead of silently returning `false`.
8. `src/systems/game-action-master.js` now exposes payload clone failures with `payloadCloneStatus` and `payloadCloneReason` while preserving the safe `{}` fallback.
9. `src/data/economy-loop-contract.js` now keeps the money source/sink/exchange/transfer/betting/time/market/server-authority gaps visible and smoke-verified.
10. `WorldClock` now exports `WORLD_CLOCK_DEFAULT_MINUTES_PER_SECOND = 1`, and `tools/smoke-world-clock.cjs` guards that the official default stays 1 game minute per real second.
11. `src/systems/odd-even-round-runtime.js` creates local `bet_settled` and `bet_refunded` action envelopes, and `src/ui/odd-even-table-panel.js` now uses them for local result/refund testing.
12. `src/systems/odd-even-round-state.js` persists odd-even round close state under `baegeum-city:v2:odd-even-rounds`; reconnect recovery is still not implemented.
13. `src/systems/local-storage-workflow.js` summarizes diagnostics into `clean`, `stale`, `corrupt`, or `unavailable` and marks blocking stale state for economy, ledger, odd-even rounds, editor drafts, and venue metadata.

Horse-racing venue work is paused before gambling logic:

1. The horse-racing venue should preserve the provided visual draft as a map/interior layout.
2. The design includes a golden scoreboard, 5-lane track, grandstand seating, ticket/betting windows, and an always-available exchange ATM.
3. This slice must stay "Map Design Only"; no race simulation, odds settlement, payouts, rankings, or online authority behavior should be added until the round/ledger contract is documented.

Construction UX remains a paused work-queue slice:

1. Pinned construction presets are implemented.
2. Construction palette category folding is implemented.
3. Current categories are `고정`, `도시`, `건물`, `자연물`, `거리 시설`, and `광고/간판`.
4. World-object taxonomy now separates `building_shell` from `venue_anchor`.
5. Building shell cards are implemented as placement-only `빈 상가`, `빈 카지노`, and `골목 상가`, with 소형/기본/대형 size cycling.
6. Odd-even `bet_reserved` is implemented and smoke-verified; do not settle results yet.
7. The first 10-minute play loop is now the product north star for deciding whether new slices belong in v0.

## Next Loop Candidate

Recommended next autonomous loop:

Economy loop closure:

1. Browser-check odd-even reserve, settle/refund, ledger projection, and HUD state.
2. Use the local-storage workflow report before and after intentionally stale state so economy, ledger, odd-even round, editor draft, and venue metadata persistence bugs are separated from gameplay bugs.
3. If the browser workflow stays explainable, choose the next contract slice: food purchase ledger or stat/time tick.
4. Do not implement player-to-player transfers, stock trading, food purchases, or hunger ticks until their ledger/effect types are explicitly added.

Paused city-role map-editor loop:

City role aware map-editor visual tuning:

1. Tune baegeum lifestyle blocks with the new role-filtered shells, without adding doors, interiors, economy, or online channels.
2. Tune dice-city casino/back-alley frontage with the new role-filtered shells, keeping copied venue anchors separate from `building_shell` objects.
3. Keep using `canPlaceNewBuildingType(typeId, mapId)` from `src/data/city-district-contract.js` for future editor presets.
4. Browser-verify editor palette switching between baegeum-city and dice-city after any visual tuning.
5. Preserve separate draft keys and keep baegeum casino originals as `legacy_preserved` until copied dice-city venues are stable.

If the human wants to shrink `baegeum-city` further, treat it as another relayout slice, not a numeric height edit:

1. Pick a target bottom boundary below 2800 and backup/export the current baegeum draft first.
2. Move or scale the baegeum spawn, bus terminal anchor, bottom roads, base walls, scenery, and nav nodes together.
3. Keep vendored Iron Line source untouched; apply project-owned layout transforms after vendor load.
4. Browser-verify spawn, terminal transition, minimap, NPC pathing, and editor loading.

Paused loops:

1. Multimap visual tuning can resume later from the city-role map-editor notes.
2. Horse-racing work is paused before round/ledger logic.
3. Construction UX is paused unless the human redirects back to map decoration work.
4. Git baseline still requires explicit `baseline 승인` before staging or committing.
5. Online lobby work should start from `docs/baegeum-city-v2-online-lobby-contract.md`: the lobby is an online-only gate, not an offline menu, and the next safe coding slice is a pure contract module plus smoke test before UI.

## Human-Approval Queue

- Installing `Q00/ouroboros` or running `ouroboros setup --runtime codex`.
- Any global Codex/WSL/home-directory configuration change.
- Large map draft format changes or schema migrations.
- Online authority, economy authority, or saved-data compatibility changes.

## Notes For The Next Agent

- The repository currently has many untracked files; do not treat untracked status as permission to delete or reset anything.
- Read `docs/ai-git-baseline-strategy.md` before staging, committing, deleting, moving, or mass formatting.
- `docs/INDEX.md` exists and should stay the document map, but avoid broad cleanup unless explicitly requested.
- `docs/ai-review-board.md` is the quick human-facing control panel for objective, risks, approval boundaries, and next safe action.
- Use the existing Korean project docs as the source of product truth.
- `docs/ai-agent-boot-packet.md` is now the portable first-message handoff for new AI sessions and other workspaces.
- `docs/ai-code-health-audit-plan.md` is now the active plan when the human asks to inspect spaghetti growth, whole-code bug patterns, or root causes.
- `docs/ai-code-health-inventory-2026-05-26.md` records the first audit inventory, completed runtime-state facade migration, and the first localStorage diagnostics tool.
- `docs/ai-spaghetti-bug-root-cause.md` explains why the spaghetti/bug pattern emerged and now fixes the next audit sequence around persistence, silent failures, and browser workflows.

## Loop Record

Date: 2026-05-26
Observed: The human asked to catch bugs first and, if the current work was done, move to the next step.
Changed: Ran the full check first, then created `docs/plans/restored-ranking-job-system.md` as the next planning draft. The plan defines phone-based ranking boards, local preview snapshots, job/occupation board ids, starter job candidates, online authority boundaries, and the rule that job rank must not merge with wealth rank. Linked the plan from `docs/INDEX.md` and strengthened `tools/check-restored-planning-kit.cjs` so the concrete plan stays present.
Verified: Initial `npm run check`, `node tools/check-restored-planning-kit.cjs`, final `npm run check`, and `git diff --check` passed.
Blocked: No runtime UI or gameplay changed, so browser verification is not expected for this planning slice.
Next: Extract restored static catalogs for ranks, assets, markets, and partner archetypes before any ranking/job UI implementation.
Do not: Implement rankings or jobs inside `baegeum-city-v2-dice.html`; do not show fake global rankings while offline.

Date: 2026-05-26
Observed: The human clarified that features should not be built first; the project needs a planning script or draft foundation first, and rankings should include jobs/occupations.
Changed: Added `docs/plans/README.md`, `docs/templates/restored-feature-plan-template.md`, `tools/create-restored-feature-plan.cjs`, and `tools/check-restored-planning-kit.cjs`. Added `npm run plan:restored` so future restored features can generate a planning draft before implementation. Updated the restored ranking roadmap to include job boards such as `jobRank`, `jobIncome`, and `jobReputation`, and strengthened roadmap checks to guard job ranking language.
Verified: `node tools/check-restored-planning-kit.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, generated job-ranking draft preview, `node tools/check-size.cjs`, and `npm run check` passed.
Blocked: No runtime UI or gameplay changed, so browser verification is not expected for this planning-tool slice.
Next: Generate a concrete `restored-ranking-job-system` plan before any ranking or job implementation, then continue catalog extraction.
Do not: Implement job rankings directly in `baegeum-city-v2-dice.html` or merge job rank with wealth rank.

Date: 2026-05-26
Observed: The human asked to prepare the overall UI/design improvement plan plus future online expansion, ranking system, and chat expansion before more restored features are added.
Changed: Added `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md` with UI surfaces, phone-first design draft, online authority rules, ranking split between local rank and online boards, and chat expansion from partner DM to public channels. Linked it from `docs/INDEX.md`, referenced it from `src/restored/README.md` and the recomposition plan, and added `tools/check-restored-ui-online-ranking-chat-roadmap.cjs` to guard the roadmap through `npm run check`.
Verified: `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs` and `npm run check` passed.
Blocked: No runtime UI changed, so browser verification is not expected for this docs/guard slice.
Next: Extract static catalogs for ranks, assets, markets, and partner archetypes before implementing ranking, chat, relationship, online, or illustration behavior.
Do not: Put news, stocks, futures, rankings, or chat back into bottom navigation; do not add fake offline lobby or client-authoritative online rankings.

Date: 2026-05-26
Observed: The human asked to make the project ready so that when they provide material, Codex can immediately receive it and turn it into usable project inputs.
Changed: Added `docs/baegeum-city-v2-restored-intake.md`, `assets/inbox/README.md`, and `refs/intake/README.md`. Added `tools/intake-restored-material.cjs`, which classifies provided files/URLs into asset, GitHub reference, or note intake cards and emits manifest/reference candidates. Added `tools/check-restored-intake.cjs`, linked the intake doc and reference intake index, added `npm run intake`, and wired intake checks into `npm run check`. Updated the asset pipeline so `assets/inbox/` is quarantine and excluded from runtime asset-manifest coverage until promotion.
Verified: `node tools/intake-restored-material.cjs --help`, asset sample classification, GitHub sample classification, `node tools/check-restored-intake.cjs`, `node tools/check-restored-asset-pipeline.cjs`, `node tools/check-reference-systems.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: No runtime UI changed, so no browser verification was needed for this slice.
Next: When the human provides a file/link, place raw files in `assets/inbox/` or create a `refs/intake/` card, then promote approved material into asset manifest or restored catalogs.
Do not: Reference `assets/inbox/` from runtime code or copy GitHub/open-source code/assets into runtime folders before review.

Date: 2026-05-26
Observed: The human clarified that the blackjack request was not to wire blackjack into the active restored game, but to create a separate design-test prototype.
Changed: Reverted the in-progress restored-game blackjack hookup from this session and added standalone `blackjack-design-test.html` with its own table UI, chips, deal/hit/stand/double controls, shoe, bankroll, result feed, and local-only round logic. The active `baegeum-city-v2-dice.html` gameplay remains intentionally unconnected to this prototype.
Verified: Local server returned `http://127.0.0.1:4173/blackjack-design-test.html` 200. Browser verification loaded the standalone page, placed a 1,000-chip bet, dealt a round, stood, settled to READY, and reported no console errors. `git diff --check` and `npm run check` passed.
Blocked: Direct `file://` navigation for the test page was blocked by the in-app browser URL policy, so verification used the existing local static server.
Next: Tune the standalone blackjack design, pacing, or rules in `blackjack-design-test.html` only.
Do not: Wire the standalone blackjack prototype into `baegeum-city-v2-dice.html` unless the human explicitly asks for game integration.

Date: 2026-05-26
Observed: The human identified selectors as the next bottleneck: total asset, rank, phone ownership, and smartphone ownership calculations needed to move out of `baegeum-city-v2-dice.html` before catalog extraction.
Changed: Added `src/restored/state/selectors.js` with restored total asset, stock value, ownership value, rank, rank index, phone, and smartphone selectors. Updated `baegeum-city-v2-dice.html` to import and call those selectors instead of owning local calculation functions. Strengthened `tools/check-restored-growth-architecture.cjs` so these selector functions cannot move back into the HTML, and updated restored docs/README to record the live selector module.
Verified: `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-asset-pipeline.cjs`, and `npm run check` passed. Browser verification reloaded `http://127.0.0.1:4173/baegeum-city-v2-dice.html`, clicked start, confirmed the game screen, rank/total asset rendering, and the no-phone phone tab gate with zero console errors.
Blocked: Pre-existing working-tree changes were present before this slice: `baegeum-city-v2-dice.html` already had blackjack UI/module rollback edits and `src/restored/games/blackjack-game.js` was already deleted. This slice did not restore or reverse those unrelated changes.
Next: Extract static catalogs for ranks, assets, markets, and partner archetypes so selectors and UI stop depending on HTML-owned catalog constants.
Do not: Add new rank/asset/market/partner data inline in `baegeum-city-v2-dice.html`, or mix blackjack repair into the catalog extraction slice.

Date: 2026-05-26
Observed: The human asked to create the extra tools needed before the fundamental redesign, especially how mp3 files and image folders should be classified and reorganized.
Changed: Added `docs/baegeum-city-v2-restored-asset-pipeline.md` with target audio/image/source folders, asset id rules, mp3/image role taxonomy, source/license expectations, and verification rules. Added `src/restored/assets/asset-manifest.js` with current legacy mp3/png/svg assets registered by id. Added `tools/check-restored-asset-pipeline.cjs` and wired it into `npm run check` so tracked asset files under `assets/` must be registered before use. Linked the asset pipeline from `docs/INDEX.md` and recorded the manifest in restored recomposition docs and `src/restored/README.md`.
Verified: `node tools/check-restored-asset-pipeline.cjs`, `node tools/check-restored-growth-architecture.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: No files were moved yet; the current asset manifest references legacy locations until a deliberate migration is approved.
Next: Extract restored selectors/catalogs or start moving future new art/audio through the manifest id flow before connecting illustration/conversation systems.
Do not: Add direct mp3/image paths to `baegeum-city-v2-dice.html`, or copy GitHub/open-source assets into `assets/` before source/license review.

Date: 2026-05-26
Observed: The human asked to finish the first live restored split and to pin GitHub open-source reference links so they can be shown quickly later. The active target remains `baegeum-city-v2-dice.html`, and the next safe split was restored state/storage.
Changed: Moved the live restored initial state into `src/restored/state/initial-state.js` and save/load plus cash-only save-code helpers into `src/restored/state/storage.js`. Updated `baegeum-city-v2-dice.html` to run as a module, import those helpers, and expose inline-handler functions back onto `window` so the existing buttons keep working. Strengthened `tools/check-restored-growth-architecture.cjs` so the restored HTML cannot re-own `INITIAL_STATE` or direct storage writes. Added `refs/github-reference-systems.md`, pinned `https://github.com/PEPEANT/MammonCity2`, listed it in `refs/open-source-candidates.md`, and added `tools/check-reference-systems.cjs` to `npm run check`.
Verified: `node tools/check-restored-growth-architecture.cjs`, `node tools/check-reference-systems.cjs`, `npm run check`, and `git diff --check` passed. Browser verification reloaded `http://127.0.0.1:4173/baegeum-city-v2-dice.html`, clicked the start button, opened the game screen, switched to the phone tab, and showed no console errors except the existing Tailwind CDN warning.
Blocked: The next live split is still pending: selectors/catalogs for rank, phone ownership, assets, stocks, crypto, and partners remain inside the HTML.
Next: Extract restored selectors (`totalAsset`, `rank`, `hasPhone`, `hasSmartPhone`) and then static catalogs for ranks/assets/markets before expanding AI conversation.
Do not: Add more inline state/storage/catalog data to `baegeum-city-v2-dice.html`, or import MammonCity2 code/assets before a license and structure review.

Date: 2026-05-26
Observed: The human asked to start recomposition now because future AI lovers/NPCs may roam through cities, and the restored HTML would become a bottleneck if UI, city, casino, ownership, and dialogue keep growing in one place.
Changed: Added `docs/baegeum-city-v2-restored-recomposition-plan.md` and linked it from `docs/INDEX.md`. Added pre-split contracts for `src/restored/actors/actor-contract.js`, `src/restored/data/place-catalog.js`, and `src/restored/ui/shell-contract.js`, then updated the restored architecture check so AI actor location, city/place actor slots, phone-app UI shell boundaries, bottom nav ids, and line budgets are guarded before live extraction begins.
Verified: `node tools/check-restored-growth-architecture.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: Live behavior is still mostly inside `baegeum-city-v2-dice.html`; this slice intentionally creates the recomposition rails before moving runtime code.
Next: Run the restored architecture check and `npm run check`, then start the first live extraction with restored `initial-state` and `storage` modules.
Do not: Split the whole restored HTML at once or add new inline AI/dialogue/casino systems before state/storage are extracted.

Date: 2026-05-26
Observed: The human wants the restored build to grow toward AI lovers, branching conversation, gambling, ownership, emotion, and illustrations, and asked to put the fundamental design/script structure into Markdown before coding more.
Changed: Added `docs/baegeum-city-v2-restored-growth-architecture.md` and linked it from `docs/INDEX.md`. The document records current structural risks in the 1371-line single HTML, a `src/restored/` module plan, script splitting rules, relationship/emotion state, conversation branching, gambling/ownership event flow, illustration manifest rules, and the next extraction order. Added the first real guardrail scripts/modules: `src/restored/README.md`, `src/restored/data/city-catalog.js`, `src/restored/state/save-contract.js`, and `tools/check-restored-growth-architecture.cjs`; `npm run check` now runs the restored architecture check.
Verified: `node tools/check-restored-growth-architecture.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: Full code split was not performed yet; the new guardrails intentionally create the safe starting line before moving live state out of the HTML.
Next: Start with `src/restored/state/initial-state.js` and `storage.js`, then extract partner/asset catalogs before expanding AI conversation.
Do not: Add more large inline script to `baegeum-city-v2-dice.html` for new lover/dialogue/illustration systems.

Date: 2026-05-26
Observed: The human clarified that news, stocks, and crypto futures feel like phone apps, not main bottom navigation tabs, and that they should be invisible before buying a phone.
Changed: Reworked `baegeum-city-v2-dice.html` bottom navigation to only show `내정보`, `휴대폰`, `부동산`, `도박`, and `상점`. Moved 뉴스/주식/코인선물 into the new 휴대폰 tab as app views. No-phone state now shows only a phone purchase prompt; app buttons are hidden with the phone shell. Folder phone unlocks 뉴스 and 주식, while 스마트폰 unlocks 코인선물.
Verified: `npm run check` passed, `git diff --check` reported no whitespace errors, and browser verification showed the five bottom tabs, `tab-phone` activation, no-phone locked prompt, hidden phone app shell, and zero console errors.
Blocked: Automated temporary purchase verification was not completed because the browser read-only evaluation context did not allow the planned localStorage backup access; runtime app-unlock behavior is implemented but not persisted-tested in this loop.
Next: Manually or safely browser-test buying 폴더폰/스마트폰 through the shop, then tune the phone app visuals if needed.
Do not: Put 뉴스, 주식, or 코인선물 back into the main bottom navigation unless the human explicitly reverses this phone-app direction.

Date: 2026-05-26
Observed: The human rejected a smaller redesign and explicitly asked to use the provided Dice City V10.5 HTML wholesale, only retitling it as 배금도시 V2.
Changed: Added `baegeum-city-v2-dice.html` as the active single-file restored game, changed visible Dice City branding to 배금도시 V2, gave it the separate localStorage key `baegeum_city_v2_dice_restore`, and made root `index.html` redirect to it. Existing modular city-core/editor files were preserved.
Verified: `npm run check` passed, `git diff --check` reported no whitespace errors, the local server returned `/health` 200, and browser verification loaded `index.html` into `baegeum-city-v2-dice.html`, showed title `배금도시 V2 (Safe Restore)`, clicked `배금도시 시작`, opened the game screen on `tab-myinfo`, and had zero console errors.
Blocked: The restored build intentionally bypasses the previous ledger/action/server-authority architecture and uses the original local single-file money mutations. This is accepted as the current product pivot, but it should not be confused with the paused online-ready city-core.
Next: Tune copy, balance, save/restore, and mobile polish inside `baegeum-city-v2-dice.html` as the active playable build.
Do not: Delete the previous modular city-core, editor, docs, or vendor sources unless the human gives a separate explicit cleanup request.

Date: 2026-05-26
Observed: The human pointed out that signs, entrances, buildings, and phone apps still feel like shells because the game does not prove which ones actually work.
Changed: Added `docs/baegeum-city-v2-feature-affordance-audit.md`, `src/systems/city-feature-audit.js`, and `src/devices/phone/phone-app-catalog.js`. The settings panel now shows building/app audit counts, DIS non-wired buttons are disabled instead of pretending to work, and `npm run check` includes `tools/smoke-city-feature-audit.cjs`.
Verified: Pending in this loop.
Blocked: The audit intentionally reports many baegeum-city lifestyle buildings as functionless because they are still placement-only `building_shell` objects. This is a product gap, not a smoke-test failure.
Next: Promote one lifestyle building, preferably convenience store or fast food, from visual shell to a real interaction slice with entrance/action/effect/save behavior.
Do not: Hide missing app/building functionality with nicer art, or attach money/door/channel fields directly to `building_shell` without the owning interaction/ledger contract.

Date: 2026-05-26
Observed: The human asked to compress baegeum-city vertically and make it a clearer lifestyle/infrastructure city before continuing gameplay systems.
Changed: Updated `baegeum-city` compact relayout to height `2800`, added layout-owned infrastructure building shells and sign labels for 집, 고급집, 편의점, 패스트푸드점, 자동차매장, 주유소, 백화점, 물류센터, 경찰서, 부동산, 주식시장, 버스정류장, and 시외버스터미널. Added a `도시` build palette group and matching baegeum-only infrastructure presets while preserving all as non-enterable `building_shell` objects with no doors, interiors, economy, venue channels, or online metadata.
Verified: `node tools/check-size.cjs`, `node tools/smoke-city-district-contract.cjs`, `node tools/smoke-world-editor-build-palette.cjs`, `node tools/smoke-baegeum-map-shrink-readiness.cjs`, `node tools/smoke-baegeum-city-urban-layout.cjs`, `npm run check`, and `git diff --check` passed. Browser navigation to `index.html?map=baegeum-city&infra-layout=20260526` and `editor.html?infra-layout=20260526` loaded with zero console errors.
Blocked: Browser click automation was limited to navigation/console in this session, so build-card opening was verified by smoke tests rather than a live click capture. Infrastructure buildings are visual/collision shells only; no store, vehicle, stock, home, or bus gameplay is attached.
Next: Visually tune baegeum-city block spacing in the editor/browser if needed, then continue with clean/stale browser workflow or the first ledger-backed lifestyle slice.
Do not: Convert infrastructure shells into enterable venues or add economy behavior without a separate interaction/ledger contract.

Date: 2026-05-26
Observed: The next spaghetti/root-cause risk was that browser workflow failures could still be caused by stale localStorage rather than current gameplay code.
Changed: Added `src/systems/local-storage-workflow.js` and `tools/smoke-local-storage-workflow.cjs`; `npm run check` now guards clean/stale/corrupt/unavailable classification and blocking stale state for economy, ledger, odd-even round state, editor drafts, and venue metadata.
Verified: `node tools/smoke-local-storage-workflow.cjs`, `node tools/smoke-local-storage-diagnostics.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: Browser workflow has not yet been rerun with intentionally stale storage after this module; no reset UI was added.
Next: Browser-run the first economy loop with the workflow summary, then choose food purchase ledger or stat/time tick.
Do not: Add reset buttons, payouts, rankings, stock, transfers, or hunger ticks before contracts.

Date: 2026-05-26
Observed: The first economy loop had local reserve and settlement/refund envelopes, but the table UI still did not close rounds or persist duplicate-close state.
Changed: Added `src/systems/odd-even-round-state.js`, wired 홀짝 테이블 result/refund buttons to `bet_settled`/`bet_refunded`, persisted local round state under `baegeum-city:v2:odd-even-rounds`, and added localStorage diagnostics coverage. Browser testing also exposed and fixed a UI bug where `requestAnimationFrame` timestamps overwrote the odd-even hint text.
Verified: `node tools/smoke-odd-even-round-state.cjs`, `node tools/smoke-odd-even-table-panel.cjs`, `node tools/smoke-local-storage-diagnostics.cjs`, `node tools/check-size.cjs`, and `npm run check` passed. Browser verification on `index.html?map=dice-city&spawn=dice-odd-even-casino-01&odd-even-close=20260526b` entered 홀짝카지노, sat at the table, reserved 10 chips, refunded the round, showed `환불 완료: 10칩 반환.`, kept HUD chips at 30, showed `다음 라운드`, and had zero console errors.
Blocked: Full reconnect recovery and server-authority settlement are still not implemented.
Next: Run clean/stale localStorage workflows, then decide whether the next contract slice is food purchase ledger or stat/time tick.
Do not: Add player-to-player transfer, stock trading, rankings, random online results, or hunger ticks before their contracts exist.

Date: 2026-05-26
Observed: The human asked to restart design, not by deleting work, but by reconsidering what must be fixed before the game grows further.
Changed: Added `docs/baegeum-city-v2-system-redesign-baseline.md` and linked it from `docs/INDEX.md`. The new baseline narrows the product back to one first playable loop: baegeum-city lifestyle prep, bus transfer to dice-city, casino exchange, odd-even reserve, settlement/refund, ledger/HUD check, phone/DIS readback, and return. It also defines data owners and economy/time/online/UI gates, and explicitly blocks stock trading, player transfer, food purchase, hunger ticks, job income, race payout, and admin payout until their contracts exist.
Verified: `git diff --check`, `node tools/check-size.cjs`, and `npm run check` passed.
Blocked: None.
Next: Connect odd-even UI to the existing settlement/refund envelopes with duplicate-close protection, then run clean/stale localStorage browser workflows.
Do not: Treat the redesign restart as permission to rewrite maps, delete existing work, or add broad economy features before the first loop closes.

Date: 2026-05-26
Observed: The previous audit found a dangerous time-contract mismatch: docs said 1 real second equals 6 game minutes while the code default was 1 game minute per real second. The next economy gap was that odd-even could reserve chips but had no local action envelope for settlement or refund.
Changed: Added `WORLD_CLOCK_DEFAULT_MINUTES_PER_SECOND = 1`, updated world-clock/economy docs to make the slower default official, and added `tools/smoke-world-clock.cjs`. Added `bet_settled` and `bet_refunded` action types plus `src/systems/odd-even-round-runtime.js`, which can close reserved odd-even rounds through `bet_settled` or `bet_refunded` ledger effects. Updated the economy loop contract status for settlement/refund to partial and documented that UI/persistence/reconnect recovery are still not connected.
Verified: `node tools/smoke-world-clock.cjs`, `node tools/smoke-odd-even-round-runtime.cjs`, `node tools/smoke-economy-loop-contract.cjs`, `node tools/smoke-game-action-master.cjs`, `node tools/check-size.cjs`, and `npm run check` passed.
Blocked: Odd-even table UI still only reserves bets; it does not yet call the settlement/refund envelopes or prevent duplicate close by persisted round state.
Next: Connect odd-even table UI to settlement/refund with duplicate-close protection, then browser-check HUD/ledger state.
Do not: Add player-to-player transfer, stock trading, food purchase, hunger ticks, or online authority behavior before the owning ledger/effect contracts exist.

Date: 2026-05-26
Observed: The human asked to inspect the game fundamentally before complete design, specifically whether online money transfer, grind income, exchange rate, economic loops, and time-driven systems were missing or tangled.
Changed: Added `src/data/economy-loop-contract.js` and `tools/smoke-economy-loop-contract.cjs` to make the current economy loop gaps explicit and testable. Added `docs/baegeum-city-v2-economy-loop-contract.md`, linked it from `docs/INDEX.md`, and linked it from the Economy Master next-doc list. The contract confirms current ATM exchange and bet reservation while keeping player transfer, food purchase, stat ticks, market orders, time-driven economy, and settlement gaps visible.
Verified: `node tools/smoke-economy-loop-contract.cjs`, `node tools/check-size.cjs`, and `npm run check` passed.
Blocked: None.
Next: Close the odd-even lifecycle gap with `bet_reserved -> bet_settled | bet_refunded` before adding player transfers, stock trading, hunger ticks, or food purchase loops.
Do not: Use `economy.update()` for production money changes, implement player-to-player transfers without server authority, or let client UI decide gambling results in an online-ready path.

Date: 2026-05-26
Observed: The next documented spaghetti repair target was `src/systems/game-action-master.js`, where an unclonable action/effect payload could still become `{}` without a visible reason.
Changed: Added `GAME_PAYLOAD_CLONE_STATUSES` plus `payloadCloneStatus` and `payloadCloneReason` to created actions/effects. Successful payloads report `ok`; circular objects, `BigInt`, and other unclonable payloads keep the old safe `{}` fallback but now report `clone_failed` with a reason. Strengthened `tools/smoke-game-action-master.cjs` with circular and `BigInt` failure cases.
Verified: `node tools/smoke-game-action-master.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Start the clean/stale localStorage browser workflow pass.
Do not: Add payouts, rankings, reset UI, or broad refactors in this observability slice.

Date: 2026-05-26
Observed: The construction list could still appear visually tangled with the right editor panel because the build palette section was authored inside the panel, even though it was styled like a floating surface.
Changed: `syncBuildControls` now mounts the build palette section under `body` as a true floating bottom sheet. The CSS centers it in the canvas area, adds internal scrolling, and keeps the narrow-screen layout above the bottom editor panel. Added a smoke guard that the editor build entry owns this floating mount behavior.
Verified: `node tools/smoke-editor-entry.cjs`, `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `editor.html?build-popup-fix=20260526` showed `buildSection` parent `BODY`, `data-floating=true`, a bottom-center popup separate from the right panel, and zero console errors.
Blocked: None.
Next: If the human wants, tune the mobile/narrow-width build sheet visually after another browser resize pass.
Do not: Put the construction card list back inside the right control panel or change draft/building schema for this UI-only fix.

Date: 2026-05-26
Observed: The editor still showed old Iron Line war labels such as ally-base style markers because city maps could still feed `safeZones`, `baseExitPoints`, or `base-wall` data into the original renderer.
Changed: Removed baegeum urban `baseExitPoints`, removed dice-city terminal `safeZones`, changed dice-city edge walls from `base-wall` to `city-boundary`, and strengthened smoke guards so combat overlay/base labels cannot reappear in the visible city map data.
Verified: `node tools/smoke-baegeum-city-urban-layout.cjs`, `node tools/smoke-dice-city-venues.cjs`, `node tools/smoke-map-transition-interaction.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `editor.html?war-label-fix=20260526b` and `index.html?map=dice-city&war-label-fix=20260526` showed no ally/enemy base labels and zero console errors.
Blocked: None yet.
Next: Run targeted map-layout/venue smokes, full `npm run check`, then browser-verify editor/runtime console state.
Do not: Reuse Iron Line combat fields for bus terminals, spawn protection, or city boundary visuals.

Date: 2026-05-26
Observed: The human asked for a spaghetti/bug test and root-cause redesign pass. The existing audit docs pointed to silent money-affecting ledger failures as the next bug-hunt target.
Changed: Added `src/systems/local-ledger-effect.js` and `tools/smoke-local-ledger-effect.cjs`. Exchange ATM and odd-even reservation now use the shared helper so ledger application failures expose `missing_effect`, `missing_economy_record`, or `record_failed` instead of disappearing as `false`. Added empty favicon links to `index.html` and `skin-lab.html` so favicon 404 noise does not mask real browser errors. Updated the audit docs with the new root-cause state and next target.
Verified: `node tools/smoke-local-ledger-effect.cjs`, `node tools/smoke-exchange-atm-panel.cjs`, `node tools/smoke-odd-even-table-panel.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `index.html?code-health=ledger-effect-2` showed zero console errors.
Blocked: None for this observability repair.
Next: Make `src/systems/game-action-master.js` payload clone fallback observable, then run a clean/stale localStorage browser workflow pass.
Do not: Add payouts, rankings, reset buttons, broad refactors, staging, commits, deletion, moves, or mass formatting in this audit slice.

Date: 2026-05-26
Observed: The next documented autonomous slice was city-role-aware map-editor presets, so future baegeum lifestyle blocks and dice risk/nightlife blocks do not get mixed in the same build palette.
Changed: Added role metadata to building shell presets, added baegeum-only `building-home-shell` and `building-civic-shell`, added dice-only `building-loan-shell` and `building-motel-shell`, and filtered the editor build palette with `canPlaceNewBuildingType(typeId, mapId)`. Existing cards remain placement-only `building_shell` objects with no doors, interiors, economy, online channels, or venue metadata.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `editor.html?role-presets=20260526` showed baegeum-city cards `building-shop-shell`, `building-home-shell`, `building-civic-shell`; after switching to dice-city it showed `building-casino-shell`, `building-alley-shell`, `building-loan-shell`, `building-motel-shell`; console logs had zero errors.
Blocked: None for role-aware preset filtering.
Next: Tune baegeum lifestyle blocks or dice-city casino/back-alley frontage visually, without converting `building_shell` cards into venues.
Do not: Add doors, interiors, economy, online channels, or betting settlement to these placement-only building cards.

Date: 2026-05-26
Observed: The human said the city ground was too dark/green and looked like a battlefield, and asked to remove the old enemy/ally base walls before turning the edges into city outskirts/tunnels/walls.
Changed: Added `baegeum-city-urban-layout-v1`, applied it after baegeum draft/compact loading, added `city-boundary` tunnel/wall rendering in both runtime and editor, removed combat capture/safe-zone/base-wall/scenery marks from the baegeum city view, and added a smoke guard for the new city reskin contract.
Verified: `node tools/smoke-baegeum-city-urban-layout.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `index.html` showed the muted city ground, bus terminal, city edge props, and zero console errors. Browser verification on `editor.html` showed no city-boundary collision warnings and zero console errors.
Blocked: None for this visual city-reskin slice.
Next: Continue city district tuning with lifestyle buildings/outer streets, or tune the bus terminal/tunnel placement visually in a separate map-design slice.
Do not: Edit vendored Iron Line source, reintroduce red/blue combat zones into baegeum-city, or use `base-wall` for new city outskirts.

Date: 2026-05-26
Observed: The human approved moving from multimap mechanics into the world-structure plan: `baegeum-city` should become the life/hub city and `dice-city` should become the gambling/night/risk city.
Changed: Added `docs/baegeum-city-v2-city-district-contract.md` and `src/data/city-district-contract.js`. Added `cityRoleId` to the map registry, wired a new smoke guard into `npm run check`, and linked the new role/district/buildingType contract from the docs index, multimap contract, map-editor doc, and world-object doc.
Verified: `node tools/smoke-city-district-contract.cjs`, `node tools/smoke-map-registry.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. The new guard confirms baegeum can add lifestyle/civic buildings, dice can add casinos/loan/pawn/motel/nightlife buildings, and current baegeum casinos are `legacy_preserved` rather than new-placement permission.
Blocked: None for the role/district/buildingType contract.
Next: Split future map-editor building presets by city role without adding doors/interiors/economy.
Do not: Add new baegeum casino presets, add dice home/police/stock-market presets, delete original baegeum casinos, or attach gambling/economy behavior in the same slice.

Date: 2026-05-26
Observed: The human approved starting the real `baegeum-city` vertical shrink. Directly editing `height` would still cut roads/spawn/terminal, and editing `vendor/iron-line` would break the fixed vendor-source guard.
Changed: Backed up the relevant files to `C:\Users\rneet\OneDrive\문서\baegeum-city-v2-backups\pre-baegeum-relayout-20260526-134456`. Added `src/data/baegeum-city-compact-layout.js`, a project-owned compact relayout that scales baegeum y coordinates from height 5600 to 4600. Wired it into the game runtime and world editor after draft application, so old 5600 baegeum drafts are compacted in memory without deleting localStorage. Updated the shrink-readiness smoke guard to verify the compact map and bus terminal fit.
Verified: `node tools/check-size.cjs`, `node tools/smoke-baegeum-map-shrink-readiness.cjs`, `node tools/smoke-map-transition-interaction.cjs`, `node tools/smoke-world-editor-map-selector.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `index.html` showed the compact baegeum spawn at `x 562 / y 4101`, nearby `다이스시티로 이동 (시외버스터미널)`, then `E` switched to `dice-city`, `world:dice-city`, and the return terminal with zero console errors. Browser verification on `editor.html` showed separate draft keys for `baegeum-city` and `dice-city`, selector switching, and zero console errors.
Blocked: None for the 4600-height compact relayout.
Next: If the human wants more map-size work, run a separate relayout pass below 4600; otherwise return to dice-city casino-street tuning and copied venue visual checks.
Do not: Edit vendored Iron Line source, clear user drafts, or shrink below 4600 without a new relayout pass.

Date: 2026-05-26
Observed: The human asked whether `baegeum-city` vertical shrink should happen now. Runtime/editor pages load the vendored Iron Line browser map first, and that map is 8200x5600 after `map01-custom-layout.js`. Its lower road points reach y=5600, base-wall content reaches y=5588, and the player spawn is y=4992. The fallback `src/data/city-map.js` also has bottom roads/walls at its own height limit.
Changed: Added `tools/smoke-baegeum-map-shrink-readiness.cjs` and wired it into `npm run check`. The guard loads the actual browser Iron Line map, computes bottom bounds for roads, obstacles, scenery, nav nodes, safe zones, base exits, and spawns, and asserts that height-only shrink is currently not safe.
Verified: `node tools/smoke-baegeum-map-shrink-readiness.cjs` passed and reported `shrinkablePixelsWithoutRelayout: 0` for both the browser map and fallback map.
Blocked: No safe height-only shrink exists right now. A real shrink requires a coordinated baegeum-city relayout, not changing `height` alone.
Next: Either continue dice-city casino-street tuning, or if shrinking is still the priority, run a dedicated baegeum relayout slice that moves spawn/terminal/roads/nav/scenery together.
Do not: Edit vendored Iron Line dimensions, delete lower map content, shrink map height, or clear drafts as a shortcut.

Date: 2026-05-26
Observed: Dice-city already had scenery data, but non-baegeum maps were not drawing scenery, so extra street props would not show in the actual city view.
Changed: Added `src/renderers/simple-scenery-renderer.js` for non-original maps and wired it into `WorldRenderer`. Tuned `dice-city-v0` with a casino frontage road, one red-toned casino-street terrain patch, extra streetlights, and additional billboards around the copied blackjack, odd-even, and horse-track venues. Added `tools/smoke-simple-scenery-renderer.cjs` and wired it into `npm run check`.
Verified: `node tools/smoke-simple-scenery-renderer.cjs`, `node tools/smoke-dice-city-venues.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html?map=dice-city&spawn=dice-blackjack-casino-01` showed the dice-city street props rendering, kept `nearby: 블랙잭카지노 (dice-blackjack-casino-01-front)`, entered with `E` into `chat: venue:dice-blackjack-casino-01`, and had zero console errors.
Blocked: Visual screenshot shows the casino street is improved but not final; some billboard/sign overlap remains near the copied blackjack casino.
Next: Adjust billboard/sign placement around the copied blackjack casino, then browser-verify odd-even or horse-track copied entry.
Do not: Delete source casinos, shrink baegeum-city, add betting settlement, or convert `building_shell` objects into venues in the next slice.

Date: 2026-05-26
Observed: The casino-copy contract was safe, but browser verification was still awkward because dice-city copied venues had no direct dev spawn near their doors.
Changed: Added `src/scenes/city-startup.js` so startup URLs can choose a map and spawn target, e.g. `?map=dice-city&spawn=dice-blackjack-casino-01`. Wired `CityGame` to use the startup map before creating the player, added `tools/smoke-city-startup-query.cjs`, and included it in `npm run check`.
Verified: `node tools/smoke-city-startup-query.cjs`, `node tools/smoke-dice-city-venues.cjs`, and `node tools/check-size.cjs` passed. Browser verification on `http://127.0.0.1:4173/index.html?map=dice-city&spawn=dice-blackjack-casino-01` showed `scene: 다이스시티 v0`, `chat: world:dice-city`, `nearby: 블랙잭카지노 (dice-blackjack-casino-01-front)`, then after pressing `E`: `scene: 블랙잭카지노`, `mode: venue_lobby`, `chat: venue:dice-blackjack-casino-01`, `room: venue:dice-blackjack-casino-01`, with zero console errors.
Blocked: None for the copied blackjack entry path. Odd-even and horse-track copied entries are covered by data smoke tests but not yet individually browser-verified.
Next: Run full `npm run check`; then tune dice-city casino-street layout/sign placement or browser-verify the other copied entries.
Do not: Delete source casinos, shrink baegeum-city, add betting settlement, or turn `building_shell` objects into venues in the next slice.

Date: 2026-05-26
Observed: The human restated the casino relocation rule: moving casinos must mean backing up and copying first, not deleting or directly moving source buildings.
Changed: Added `tools/smoke-casino-copy-contract.cjs` and wired it into `npm run check`. The new smoke guard verifies that `bg-blackjack-casino`, `bg-odd-even-casino`, and `bg-horse-track` still exist in baegeum-city, while their dice-city copies use separate object ids, door ids, venue channels, and online room ids. It also confirms copies keep the Korean signs, game types, and proven interior scene ids. Updated multimap and gambling-venue docs with the guardrail.
Verified: `node tools/smoke-casino-copy-contract.cjs`, `node tools/smoke-dice-city-venues.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: Browser walk/entry verification for an individual copied dice-city venue is still pending because there is no safe debug spawn directly near a dice-city copied venue yet.
Next: Browser-verify at least one copied dice-city venue entry path, either by manual movement from the terminal or by adding a narrow dev-only spawn helper first.
Do not: Delete source casinos, reuse source channels for dice-city, shrink baegeum-city, or add betting settlement in this migration slice.

Date: 2026-05-26
Observed: Multimap transition was stable one way, but dice-city still had no safe return path, which made later casino-street verification awkward and risked testing from a trapped state.
Changed: Added `transition:dice-to-baegeum-bus-terminal` as a second `map_transition` object using the same v0 constraints: no fare, no ticket item, no schedule, and no online room handoff. Updated runtime/interaction/mobile smoke tests and docs so both directions use the same PC `E` / mobile `ACTION` candidate structure.
Verified: `node tools/smoke-map-transition-runtime.cjs`, `node tools/smoke-map-transition-interaction.cjs`, `node tools/smoke-mobile-action-controls.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html` pressed `E` from baegeum-city to dice-city and saw `scene: 다이스시티 v0`, `chat: world:dice-city`, `nearby: 배금시티로 이동 (시외버스터미널)`, then pressed `E` back and saw `scene: Iron Line 원본 도시맵`, `chat: world:baegeum-city`, `nearby: 다이스시티로 이동 (시외버스터미널)`, with zero console errors.
Blocked: The copied dice-city venues still need direct browser walk/entry visual verification, and the casino street layout is still rough.
Next: Browser-verify at least one dice-city copied venue entry path, then tune casino-street layout in the editor/runtime without moving or deleting baegeum-city originals.
Do not: Add bus fares, tickets, schedules, online room handoff, betting settlement, map shrinking, or casino deletion in the next slice.

Date: 2026-05-26
Observed: The human restated the multimap editor contract and highlighted the map-switch risk: if the current draft is dirty, switching `activeMapId` could discard unsaved edits or make the user think the wrong city was saved.
Changed: Added a dirty-switch guard to the map editor. `activeMapId` switching is blocked when the current editor history is unsaved, and the UI tells the user to save before switching maps. Documented the rule in the map-editor and multimap contract docs. Strengthened `tools/smoke-world-editor-map-selector.cjs` so dirty baegeum edits block switching to dice-city, while saved drafts can switch and still write map-specific draft keys.
Verified: `node tools/smoke-world-editor-map-selector.cjs`, `node tools/smoke-world-editor-draft-contract.cjs`, `node tools/smoke-editor-entry.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` placed a bench to make the baegeum draft dirty, attempted to switch to dice-city, and confirmed the selector stayed on `baegeum-city` with `저장 안 된 변경이 있습니다. 저장 후 맵을 전환하세요.` and zero console errors.
Blocked: None for the editor map-switch guard.
Next: Continue with return terminal or dice-city casino-street visual verification.
Do not: Change draft schema, delete legacy draft fallback, or make dice-city read legacy drafts.

Date: 2026-05-26
Observed: The next multimap slice was casino copy mode. The bus-terminal transition already reached `dice-city`, while dice-city still had only base roads, scenery, and placement-only building shells.
Changed: Added three copied venue anchors to `dice-city-v0`: `bg-dice-blackjack-casino-01`, `bg-dice-odd-even-casino-01`, and `bg-dice-horse-track-01`. Each copied venue keeps a new dice-city channel set with `world:dice-city`, reuses the proven base interior scene, and leaves baegeum-city originals untouched. Added `tools/smoke-dice-city-venues.cjs` and kept the transition smoke test focused on preventing `building_shell` auto-conversion. Also changed the settings-panel map debug label to show `mapId / mapVersion` so dice-city is not displayed as only the shared map version.
Verified: `node tools/smoke-city-hud-map-label.cjs`, `node tools/smoke-dice-city-venues.cjs`, `node tools/smoke-map-transition-interaction.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html` used the terminal action button and showed `scene: 다이스시티 v0`, `chat: world:dice-city`, and zero console errors; after the HUD label fix, browser reload showed `map: baegeum-city / baegeum-city-v2-map-001`.
Blocked: Browser entry into an individual dice venue still needs visual verification when movement/camera setup is convenient; there is still no return transition from dice-city to baegeum-city.
Next: Choose return terminal or casino-street visual tuning.
Do not: Delete or move baegeum-city originals, shrink baegeum-city, add betting settlement, or make building shells auto-enterable.

Date: 2026-05-26
Observed: The human clarified the teleport contract: `from: baegeum-city`, `object: intercity-bus-terminal`, `targetMapId: dice-city`, `targetSpawnId: dice-terminal-arrival`.
Changed: Added `objectId: intercity-bus-terminal` and readable `from` to the bus-terminal transition contract, rendered the terminal in baegeum-city, added a `map_transition` interaction candidate for PC `E` and mobile `ACTION`, and wired the transition to rebuild the runtime map, collision, camera, NPCs, player state, and chat channel for `dice-city`. Terminal placement now anchors to the current runtime map `playerSpawn`, not a brittle fixed coordinate. Also fixed a latent risk where dice-city `building_shell` obstacles would have been converted into enterable casinos automatically.
Verified: `node tools/smoke-map-transition-runtime.cjs`, `node tools/smoke-map-transition-interaction.cjs`, `node tools/smoke-mobile-action-controls.cjs`, `node tools/smoke-city-core.cjs`, `node tools/smoke-state-protocol.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html` showed `nearby: 다이스시티로 이동 (시외버스터미널)`, then after pressing `E`: `scene: 다이스시티 v0`, `position: x 520 / y 2620`, `chat: world:dice-city`, and zero console errors.
Blocked: There is no return transition from dice-city back to baegeum-city yet, and no casino venue has been copied into dice-city yet.
Next: Plan the dice-city casino copy slice without deleting baegeum-city originals.
Do not: Add fare/ticket/schedule systems, online matching, casino movement/deletion, or map shrinking in this slice.

Date: 2026-05-26
Observed: Draft storage separation, active map selector, and `dice-city-v0` were already verified, but runtime/player contracts still had the old single `world:city` default and no bus-terminal transition object.
Changed: Changed the runtime default world channel to `world:baegeum-city`, added per-map `playerState` fields (`mapId`, `sceneId`, `spawnId`, `worldChannelId`, `chatChannelId`), added `src/data/map-transitions.js`, added `src/systems/map-transition-runtime.js`, added `map_transition` action/interaction types, and updated docs to reject the legacy `world:city` channel in new contracts.
Verified: `node tools/smoke-state-protocol.cjs`, `node tools/smoke-map-transition-runtime.cjs`, `node tools/smoke-city-core.cjs`, `node tools/smoke-local-action-runtime.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html` showed `chat: world:baegeum-city`, `mode: city`, `map: baegeum-city-v2-map-001`, and zero console errors.
Blocked: The bus-terminal transition is currently contract/state-patch only; there is not yet an in-game terminal object, interaction prompt, or actual runtime map reload to dice-city.
Next: Add the in-game bus-terminal interaction and use the verified transition envelope to switch the runtime to `dice-city` without adding fare/ticket/schedule systems.
Do not: Shrink baegeum-city, move/delete casinos, add bus fees/tickets/schedules, or connect online matching in the next slice.

Date: 2026-05-26
Observed: The next multimap blocker was that `dice-city` existed only in the registry and editor selector, with no separate base map data to load.
Changed: Added `src/data/dice-city-map.js` as a separate `dice-city-v0` base map containing roads, spawn points, empty building shells, walls, scenery, safe zone, and nav nodes. Wired the world editor to load both `baegeum-city` and `dice-city` base maps. Strengthened the editor map selector smoke test so dice-city becomes selectable only when a base map exists, saves to its own draft key, and never reads baegeum legacy draft data.
Verified: `node tools/smoke-world-editor-map-selector.cjs`, `node tools/smoke-editor-entry.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` showed `dice-city` selectable, draft key `baegeum-city-v2-world-editor-draft:dice-city`, contract map `dice-city-v0-map-001`, and zero console errors.
Blocked: Runtime map switching is not implemented yet; dice-city is editor-ready but not reachable in-game.
Next: Add the baegeum-city bus-terminal `map_transition` contract and minimal teleport/state switch.
Do not: Move/delete casinos, shrink baegeum-city, add fare/ticket/schedule systems, or add online room matching in the transition slice.

Date: 2026-05-26
Observed: The next multimap blocker was that the editor had no visible `activeMapId`, so later dice-city work could still accidentally save into the wrong draft path.
Changed: Added an editor active-map selector and split map selection/load/save/reset helpers into `src/tools/baegeum-world-editor-maps.js`. The selector defaults to `baegeum-city`, shows its draft key, keeps `dice-city` disabled until `dice-city-v0` exists, and routes save/reset/read through the selected map id. Added `tools/smoke-world-editor-map-selector.cjs` and wired it into `npm run check`.
Verified: `node tools/smoke-world-editor-map-selector.cjs`, `node tools/smoke-editor-entry.cjs`, `node tools/smoke-world-editor-draft-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` showed `배금시티` selected, `다이스시티 (준비 전)` disabled, the baegeum draft key visible, and zero console errors.
Blocked: `dice-city-v0` base map does not exist yet, so dice-city remains intentionally disabled in the editor.
Next: Create the separate `dice-city-v0` base map data module, then enable dice-city in the editor with separate draft storage.
Do not: Shrink baegeum-city, move/delete casinos, or add bus-terminal transitions in the same slice.

Date: 2026-05-26
Observed: The human clarified the core multimap risk: one `cityMap` plus one `WORLD_EDITOR_DRAFT_KEY` would mix `baegeum-city` and `dice-city` editor saves.
Changed: Connected `world-editor-draft` to the map registry so map-specific draft keys are read first, baegeum-city alone can fall back to the legacy draft key, and dice-city cannot read legacy draft data. Changed the current editor save path to the default baegeum-city map-specific draft key and made reset clear both baegeum map-specific and legacy fallback drafts. Expanded localStorage diagnostics so baegeum-city, dice-city, and legacy world-editor drafts are listed separately.
Verified: `node tools/smoke-map-registry.cjs`, `node tools/smoke-world-editor-draft-contract.cjs`, `node tools/smoke-local-storage-diagnostics.cjs`, `node tools/smoke-editor-entry.cjs`, `node tools/check-size.cjs`, and `npm run check` passed.
Blocked: None.
Next: Add an editor `activeMapId` selector and wire load/save/reset through the selected map before creating `dice-city-v0`.
Do not: Create the dice-city map, shrink baegeum-city, move/delete casinos, or add map transitions before the editor active-map selector is implemented and verified.

Date: 2026-05-26
Observed: The human asked to start the multimap contract before creating `dice-city`, adding bus-terminal transitions, shrinking the current map, or moving casino buildings.
Changed: Added `docs/baegeum-city-v2-multimap-contract.md` and linked it from `docs/INDEX.md`. Added `src/data/map-registry.js` with `baegeum-city` and `dice-city` map configs, map-specific draft keys, split world chat channels, and a baegeum-only legacy draft fallback. Added `tools/smoke-map-registry.cjs` and wired it into `npm run check`.
Verified: `node tools/smoke-map-registry.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Make `src/data/world-editor-draft.js` accept map-specific draft keys from `map-registry`, preserving baegeum legacy fallback and keeping dice-city isolated from legacy draft data.
Do not: Create the dice-city map, add map transitions, shrink the current map, delete/move casinos, or change saved-data compatibility before draftKey separation is implemented and verified.

Date: 2026-05-26
Observed: The human approved the first pre-multimap safety step before splitting `baegeum-city` and `dice-city`, shrinking the current map, or moving casino buildings.
Changed: Created a full project zip backup outside the workspace at `C:\Users\rneet\OneDrive\문서\baegeum-city-v2-backups\pre-multimap-20260526-114932`, copied raw in-app browser Local Storage LevelDB files read-only, and exported casino/building coordinates plus venue/interior metadata to `casino-building-coordinates-pre-multimap-20260526-114932.json`. Direct browser JSON localStorage export was blocked by `ERR_BLOCKED_BY_CLIENT`, so the raw LevelDB backup and report were preserved instead.
Verified: `backup-manifest.json` was regenerated with SHA-256 hashes, the project zip opened successfully, and the zip contains 366 entries. The source workspace was not staged, committed, deleted, moved, or reset.
Blocked: Direct automated browser localStorage JSON export is blocked in this session; raw LevelDB backup exists as the recovery source.
Next: Draft the multimap contract for `baegeum-city` and `dice-city`, including mapId, sceneId, draftKey separation, bus-terminal transition object, and casino relocation copy plan.
Do not: Shrink the map, delete or move casino buildings, alter draft schema, or implement map transitions before the multimap contract is written.

Date: 2026-05-26
Observed: The persistence bug-hunt pass still had world-editor draft storage as a silent fallback candidate: corrupt `baegeum-city-v2-world-editor-draft-v0` storage became `null` without a status object, which could make stale browser editor data look like a clean missing draft.
Changed: Added `inspectWorldEditorDraftStorage()` in `src/data/world-editor-draft.js` and made `readWorldEditorDraft()` delegate to it so existing fallback behavior stays `null`. Strengthened `tools/smoke-world-editor-draft-contract.cjs` to cover `ok`, `missing`, `corrupt`, unchanged corrupt raw storage, and the existing null fallback.
Verified: `node tools/smoke-world-editor-draft-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification loaded `index.html` and `editor.html` with zero console errors.
Blocked: None.
Next: Expose one money-affecting ledger effect failure path, preferably `src/ui/exchange-atm-panel.js` before odd-even, without changing successful exchange behavior.
Do not: Add payouts, rankings, reset UI, feature slices, schema migrations, or broad refactors before the first ledger-effect failure path is observable.

Date: 2026-05-26
Observed: The persistence bug-hunt pass still had venue metadata as a silent fallback candidate: corrupt `baegeum-city-v2-venue-metadata-v1` storage became `[]` without a status object, which could make stale browser data look like a clean city-editor state.
Changed: Added `inspectStoredVenueMetadata()` in `src/data/gambling-venues.js` and made `readStoredVenueMetadata()` delegate to it so existing fallback behavior stays `[]`. Strengthened `tools/smoke-venue-metadata-storage.cjs` to cover `ok`, `missing`, `corrupt`, unchanged corrupt raw storage, and the existing empty fallback.
Verified: `node tools/smoke-venue-metadata-storage.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/index.html` loaded `배금도시 v2`, showed `mode: city`, and had zero console errors.
Blocked: None.
Next: Add a read-status path for `src/data/world-editor-draft.js`, preserving `readWorldEditorDraft()` fallback behavior and not clearing local data.
Do not: Add reset buttons, feature slices, schema migrations, or broad refactors before world-editor draft status reporting is verified.

Date: 2026-05-26
Observed: The boot packet loop now starts after source-level `BaegeumCity` access was centralized and the read-only localStorage inventory exists. The money-adjacent readers still needed their own status path so corrupt JSON would not look like a clean money/chip reset during debugging.
Changed: Added `inspectPlayerEconomyStorage()` and `inspectEconomyLedgerStorage()` so economy and ledger storage can report `ok`, `missing`, `missing_storage`, or `corrupt` while `readPlayerEconomy()` and `readEconomyLedger()` preserve their existing fallback behavior. Strengthened the player economy and economy ledger smoke checks and updated the audit docs to move the next target to map/editor draft or venue metadata read-status.
Verified: `node tools/smoke-local-storage-diagnostics.cjs`, `node tools/smoke-player-economy.cjs`, `node tools/smoke-economy-ledger.cjs`, `node tools/smoke-runtime-state-facade.cjs`, `node tools/check-size.cjs`, `git diff --check`, `rg -n "window\\.BaegeumCity|globalThis\\.window\\?\\.BaegeumCity" src`, and `npm run check` passed. The `rg` command returned no source hits.
Blocked: No code blocker. Staging/committing still requires explicit human approval because there is no baseline commit.
Next: Add read-status helpers for either `src/data/world-editor-draft.js` or `src/data/gambling-venues.js`, then keep moving into silent-failure observability.
Do not: Add reset buttons, feature slices, staging, commits, deletion, moves, or broad refactors before the next narrow audit repair or explicit approval.

Date: 2026-05-26
Observed: The boot packet loop found the documented next action had already advanced past direct `BaegeumCity` migration; `rg "window\\.BaegeumCity" src` returned no source matches. The next root-cause risk was stale or corrupt localStorage state hiding behind silent fallbacks.
Changed: Added `src/systems/local-storage-diagnostics.js` with read-only inventory/status checks for world-editor draft, venue metadata, player economy, economy ledger, current skin keys, and legacy Drawing World skin fallback. Added `tools/smoke-local-storage-diagnostics.cjs` and wired it into `npm run check`. Updated the code-health inventory, root-cause plan, audit plan, review board, and working state so the next loop targets money-adjacent read-status rather than more facade migration.
Verified: `node tools/smoke-local-storage-diagnostics.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add one read-status path for corrupt player economy or economy ledger storage, without adding reset buttons yet.
Do not: Clear user data, add reset UI, add feature slices, or broad refactors before status reporting is verified.

Date: 2026-05-26
Observed: `src/scenes/city-scene.js` was the last source file publishing runtime state by directly touching `window.BaegeumCity`, and `src/devices/phone/dis-preview.js` still had a `globalThis.window?.BaegeumCity` read that was not caught by the narrower search.
Changed: Migrated `city-scene` runtime publication and player-state publication to `patchRuntimeState()`. Migrated DIS preview runtime reads to `getRuntimeState()`. Strengthened `tools/smoke-runtime-state-facade.cjs` to guard city scene and DIS preview. Updated code-health docs so the next pass starts stale localStorage status inventory instead of more facade work.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-phone-dis.cjs`, `node tools/smoke-city-core.cjs`, and `node tools/check-size.cjs` passed before final full check.
Blocked: None.
Next: Add a read-only localStorage status inventory for economy, ledger, world-editor draft, venue metadata, and skin.
Do not: Add reset buttons, feature slices, or broad refactors before status reporting is verified.

Date: 2026-05-26
Observed: The human asked to re-plan around spaghetti symptoms, whole-code bug symptoms, and root causes after the current repair sequence. Current inventory shows direct `window.BaegeumCity` use has narrowed to scene-owned publication in `src/scenes/city-scene.js`; the broader remaining risks are stale localStorage, silent fallbacks, browser-only workflows, hub-file pressure, and no Git baseline.
Changed: Updated `docs/ai-spaghetti-bug-root-cause.md` from a facade-migration plan into a post-facade bug-hunt sequence: finish one scene publication boundary, then audit runtime sync, persistence, silent failures, semantic browser workflows, and hub-file pressure with a bug record template. Updated the review board and working-state notes to point at this sequence.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-phone-dis.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None for planning. Staging/committing still requires explicit human approval.
Next: Repair one `src/scenes/city-scene.js` runtime publication shape through `patchRuntimeState()`, then start the persistence/silent-failure bug hunt.
Do not: Add feature slices, broad refactors, staging, commits, deletion, moves, or mass formatting before the next narrow audit repair or explicit approval.

Date: 2026-05-26
Observed: The phone shell remained the last read-heavy non-scene consumer of `window.BaegeumCity`.
Changed: Migrated `src/devices/phone/mammon-phone-shell.js` runtime context reads to `getRuntimeState()` and strengthened `tools/smoke-runtime-state-facade.cjs` so the phone shell cannot read `window.BaegeumCity` directly again.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-phone-dis.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. `Invoke-WebRequest` confirmed `index.html` returns HTTP 200 with phone markup.
Blocked: In-app Playwright browser was locked by another session, so console-level browser verification was not available in this loop.
Next: Treat `src/scenes/city-scene.js` as the remaining runtime-global owner and repair its publication boundary narrowly.
Do not: Change scene flow, player-state modes, or gameplay behavior while doing the publication-boundary cleanup.

Date: 2026-05-26
Observed: Runtime facade migration had cleared chat, mobile controls, exchange, odd-even, interior ATM, and local action publication; `src/ui/player-status-hud.js` was still publishing the economy API by writing `window.BaegeumCity` directly.
Changed: Migrated `publishEconomyApi()` to `patchRuntimeState()` and strengthened `tools/smoke-runtime-state-facade.cjs` to assert the player status HUD no longer writes `window.BaegeumCity` directly. The remaining direct runtime global surface is now `src/devices/phone/mammon-phone-shell.js` reads and `src/scenes/city-scene.js` scene-owned publication.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-player-economy.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Migrate the read-heavy `src/devices/phone/mammon-phone-shell.js` runtime reads through the facade with smoke coverage.
Do not: Migrate scene ownership or add gameplay/feature slices in the same broad change.

Date: 2026-05-26
Observed: The facade migration had cleared ATM, odd-even, mobile action, chat, and interior interaction paths, leaving `src/systems/local-action-runtime.js` as the smallest remaining direct publish write.
Changed: Migrated local action publication to `patchRuntimeState()` and strengthened `tools/smoke-runtime-state-facade.cjs` to assert `local-action-runtime` no longer writes `window.BaegeumCity` directly. The direct runtime global surface is now limited to `city-scene` and `mammon-phone-shell`.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-local-action-runtime.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Migrate the read-heavy `src/devices/phone/mammon-phone-shell.js` runtime reads through the facade with smoke coverage.
Do not: Migrate scene ownership or economy HUD publication in the same broad change.

Date: 2026-05-26
Observed: The root-cause audit plan was in place, and `src/ui/odd-even-table-panel.js` was the remaining low-risk UI surface still reading `window.BaegeumCity?.game` and `window.BaegeumCity?.economy` directly.
Changed: Migrated `src/ui/odd-even-table-panel.js` to `getRuntimeGame()` and `getRuntimeEconomy()`, confirmed `src/devices/phone/mammon-phone-shell.js` now reads runtime through `getRuntimeState()`, expanded `tools/smoke-runtime-state-facade.cjs` to guard both paths against direct global reads, and reconciled the audit plan, inventory, review board, and working state. The remaining direct source global is now `src/scenes/city-scene.js`.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-odd-even-table-panel.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: No code blocker. The repository still has no baseline commit, so staging or committing remains approval-only.
Next: Migrate one `src/scenes/city-scene.js` runtime publication shape through `patchRuntimeState()` with smoke and browser verification.
Do not: Add feature slices, horse-racing betting, venue editor UI, broad refactors, staging, commits, deletion, moves, or mass formatting before the next narrow audit repair or explicit approval.

Date: 2026-05-26
Observed: The human asked to restart the plan around spaghetti symptoms, whole-code bug symptoms, and root cause instead of continuing feature growth.
Changed: Added `docs/ai-spaghetti-bug-root-cause.md` and linked it from `docs/INDEX.md`. The document separates symptoms from causes: shared runtime globals, stale local persistence, hub-file pressure, silent fallbacks, smoke-only verification, and no Git baseline.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None for the analysis document. The no-baseline Git state still requires explicit human approval before staging or committing.
Next: Use the root-cause document before the next repair loop, then migrate the read-heavy `src/devices/phone/mammon-phone-shell.js` runtime reads through the facade with one smoke assertion.
Do not: Add feature slices, horse-racing betting, venue editor UI, broad refactors, staging, commits, deletion, moves, or mass formatting before the next narrow audit repair or explicit approval.

Date: 2026-05-26
Observed: The docs already intended the interior ATM interaction path to use the runtime facade, but `src/systems/interior-interaction-runtime.js` still had one direct `window.BaegeumCity.exchangeAtm` read.
Changed: Reconciled the code with the documented facade migration by importing `getRuntimeExchangeAtm()` and using it in the interior ATM bridge. Strengthened `tools/smoke-runtime-state-facade.cjs` with a regression assertion for this system file.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-interior-interaction-runtime.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Migrate the `src/systems/local-action-runtime.js` publish write through `patchRuntimeState()` with a narrow smoke assertion.
Do not: Migrate all remaining scene, phone, odd-even, and HUD globals in one broad refactor.

Date: 2026-05-26
Observed: The runtime-state facade already existed, and `src/ui/exchange-atm-panel.js` plus the interior ATM interaction path still had direct `window.BaegeumCity` access while using the same game/economy bridge pattern as other migrated UI.
Changed: Migrated exchange ATM open/render/exchange paths to `getRuntimeGame()`, `getRuntimeEconomy()`, and `patchRuntimeState()`. Migrated the interior ATM lookup to `getRuntimeExchangeAtm()`. Strengthened `tools/smoke-runtime-state-facade.cjs` to assert these files no longer read `window.BaegeumCity` directly.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-exchange-atm-panel.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Migrate `src/systems/local-action-runtime.js` through the runtime facade with smoke coverage.
Do not: Expand this into a broad migration of scene ownership, phone shell, player HUD, or gameplay behavior in the same loop.

Date: 2026-05-26
Observed: The code-health loop had the runtime-state facade v0 in place for `world-chat-panel`, and `mobile-action-controls` was still reading `window.BaegeumCity?.game` directly.
Changed: Migrated `src/ui/mobile-action-controls.js` to `getRuntimeGame()` and expanded `tools/smoke-runtime-state-facade.cjs` so both migrated UI files are guarded against direct `window.BaegeumCity` reads. Updated the audit inventory, audit plan, review board, and working state so the next loop targets remaining direct runtime read/write paths.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-mobile-action-controls.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Migrate one remaining direct runtime read/write path, preferably `src/systems/local-action-runtime.js` or `src/systems/interior-interaction-runtime.js`, with one smoke assertion.
Do not: Add gameplay, horse-racing betting, venue editor UI, staging, committing, deleting, moving, or broad refactoring before the next repair pass is verified.

Date: 2026-05-26
Observed: The code-health loop has the first runtime-state facade repair in place, and the venue metadata editor needed to prove it does not bypass the new storage normalizer.
Changed: Routed `src/tools/baegeum-city-editor.js` persistence through `writeStoredVenueMetadata` and strengthened `tools/smoke-venue-metadata-storage.cjs` to assert the editor does not write raw venue metadata directly.
Verified: `node tools/smoke-runtime-state-facade.cjs`, `node tools/smoke-venue-metadata-storage.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None for this repair. The no-baseline Git state still requires explicit human approval before staging or committing.
Next: Continue the audit with one more small facade migration, preferably `src/ui/odd-even-table-panel.js`.
Do not: Add new gameplay, broad refactors, staging, commits, deletion, moves, or mass formatting before approval or the next narrow audit repair.

Date: 2026-05-26
Observed: The first runtime-state facade repair is now present: `src/systems/runtime-state-facade.js` centralizes small `window.BaegeumCity` access helpers, and `src/ui/world-chat-panel.js` imports `getRuntimeGame` instead of reading the global directly.
Changed: Reconciled the active priority and next loop candidate so the next audit repair is no longer "create the facade" but "migrate one more low-risk UI surface through the facade."
Verified: `node tools/smoke-runtime-state-facade.cjs`, `git diff --check`, `npm run check`, and browser verification on `http://127.0.0.1:4173/index.html` passed with the world chat panel present and zero console errors.
Blocked: None.
Next: Migrate `src/ui/mobile-action-controls.js` through `runtime-state-facade.js` with a narrow smoke assertion.
Do not: Migrate every `window.BaegeumCity` caller in one broad refactor.

Date: 2026-05-26
Observed: The boot packet pointed to the active loop, and the current working state pauses feature growth for a bug-first code-health audit.
Changed: Added `docs/ai-code-health-inventory-2026-05-26.md`, linked it from `docs/INDEX.md`, and recorded the first audit inventory for large files, `window.BaegeumCity`, localStorage keys, and silent catches. Updated the audit plan and working state so the next loop starts with a runtime-state facade repair.
Verified: Inventory commands completed and `git diff --check` passed before final full check.
Blocked: None.
Next: Add a tiny runtime-state facade and migrate one small UI surface with smoke coverage.
Do not: Add new gameplay, horse-racing betting, venue editor UI, staging, committing, deleting, or broad refactoring before the first facade repair is verified.

Date: 2026-05-26
Observed: The boot-packet loop started from construction UX editability, but the local working state later advanced to a bug-first code-health audit. The completed construction sub-slice remained local and did not alter venue metadata or runtime economy.
Changed: Added a `building_shell` size action in the editor action strip. The action cycles selected placement-only buildings through 소형/기본/대형 by updating `w/h` and `collision.w/h` only, preserving the object center and avoiding doors, channels, interiors, economy, venue id, game type, or online room id fields.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and browser verification on `http://127.0.0.1:4173/editor.html` passed. Browser check placed a `골목 상가`, selected it in `건물` mode, showed `크기 기본`, changed it to `크기 대형`, and had zero console errors.
Blocked: None. Full `npm run check` later passed during the code-health audit documentation loop.
Next: Follow the active code-health audit plan before more feature growth unless the human explicitly redirects.
Do not: Mutate `building_shell` cards into venue anchors or stage/commit/delete/move files without approval.

Date: 2026-05-26
Observed: The human redirected from feature growth to a root-cause audit for spaghetti-like code growth and bug patterns. Current signals include a no-baseline Git state, large hub files, direct `window.BaegeumCity` reads/writes, multiple localStorage-backed state islands, silent catch paths, and smoke-heavy verification.
Changed: Added `docs/ai-code-health-audit-plan.md`, linked the code-health inventory from `docs/INDEX.md`, and moved the next loop candidate from inventory toward the smallest runtime-state facade repair.
Verified: `git diff --check` and `npm run check` passed.
Blocked: None for documentation. Actual baseline commit still requires explicit human approval.
Next: Create a tiny runtime-state facade around `window.BaegeumCity`, migrate one low-risk UI file, add or update one smoke check, then run `npm run check`.
Do not: Add new feature slices, broad refactors, staging, commits, deletion, moves, or mass formatting before the audit pass or explicit human approval.

Date: 2026-05-26
Observed: The next feature slice needed to start venue metadata editing without mutating placement-only `building_shell` cards.
Changed: Added normalized venue metadata storage helpers in `src/data/gambling-venues.js`, added `tools/smoke-venue-metadata-storage.cjs`, and wired it into `npm run check`. Stored drafts now keep only editable venue-owned fields; channels, online room IDs, doors, and building rects remain derived from the base venue contract.
Verified: `node tools/smoke-venue-metadata-storage.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None for the data guardrail. UI for editing venue metadata is still a later slice.
Next: Add the editor UI that calls the venue metadata helpers when returning to construction UX, or continue the current horse-racing slice with browser verification/round-contract documentation.
Do not: Convert `building_shell` cards into enterable venues or store online/channel ownership inside editor building cards.

Date: 2026-05-26
Observed: The human provided a horse-racing stadium HTML mockup and wanted it treated as a design draft, not as a prompt for unrelated redesign or immediate gambling logic.
Changed: Added a map-design-only horse-racing interior: golden scoreboard, 5-lane track, grandstand seating, ticket/betting windows, and the standard exchange ATM. Added renderer delegation and a smoke test so the draft sections stay present.
Verified: `node tools/smoke-horse-racing-interior.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `index.html?spawn=horse-track` entered the venue, showed the scoreboard/track/grandstand/betting windows/exchange ATM, and had zero console errors.
Blocked: None.
Next: Decide whether the next safe slice is visual tuning for the horse-racing interior or a documented horse-race round contract.
Do not: Add race results, payout settlement, ranking changes, or real betting loops before the round/ledger/server-authority boundary is written.

Date: 2026-05-26
Observed: The next feature candidate was to verify the `building_shell` editor placement contract end to end after the baseline strategy was documented.
Changed: Strengthened the build palette smoke test so building shell placement now passes through `createWorldEditorDraft`, stays on the obstacle layer, keeps `building:*` IDs through draft creation, remains non-destructible, and carries no doors, channels, interiors, game type, venue id, or online room id. Split the smoke test into small helpers so the size gate has no long-function warning.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/smoke-world-editor-draft-contract.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Choose venue metadata editing as a separate `venue_anchor` slice; baseline commit still needs explicit human approval.
Do not: Mix venue entry, interiors, economy, online state, staging, committing, deleting, or moving files into the next feature loop without approval.

Date: 2026-05-26
Observed: The Git baseline strategy and review board already describe the no-commit/no-tracked-files state, but the first-read operating rules and boot-packet source list did not yet point future agents to the baseline strategy before git operations.
Changed: Linked `docs/ai-git-baseline-strategy.md` from `AGENTS.md`, added it to the boot packet source-of-truth list, and added a next-agent note to read it before staging, committing, deleting, moving, or mass formatting.
Verified: `git diff --check` and `npm run check` passed.
Blocked: Creating an actual baseline commit still requires explicit human approval.
Next: Verify the building-shell draft/runtime contract, or wait for `baseline 승인` before staging and committing the initial project baseline.
Do not: Stage, commit, delete, move, or mass-format files without explicit human approval.

Date: 2026-05-26
Observed: The documented next governance slice was a Git baseline strategy. `master` has no commits, `git ls-files` is empty, and `git status --short --untracked-files=all` shows the project as untracked.
Changed: Added the observed Git state to `docs/ai-git-baseline-strategy.md` and kept it linked from `docs/INDEX.md`. No files were staged, committed, deleted, or moved.
Verified: `git status --short`, `git diff --check`, and `npm run check` passed.
Blocked: Creating an actual baseline commit requires explicit human approval.
Next: Either verify the building-shell draft/runtime contract, or wait for `baseline 승인` before staging and committing the initial project baseline.
Do not: Stage, commit, delete, move, or mass-format files without explicit human approval.

Date: 2026-05-26
Observed: Boot packet state pointed to construction UX. Placement-only `building-shop-shell` already existed, and the next safe feature action was to expand building-card variants without crossing into venue metadata.
Changed: Added `building-casino-shell` and `building-alley-shell` as placement-only `building_shell` presets. Updated build-palette smoke coverage so all building cards use `building:*` IDs and carry no venue, interior, economy, or game metadata.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `editor.html` showed the `building` group has `building-shop-shell`, `building-casino-shell`, and `building-alley-shell`, with zero console errors.
Blocked: None.
Next: Follow the documented governance loop and define the git baseline strategy for the many untracked files, unless the human redirects back to feature work.
Do not: Attach doors, channels, interiors, economy, or online state to building cards in the same slice.

Date: 2026-05-26
Observed: The human asked what fundamental thing might be missing. Current docs had many feature tracks, but no compact product north star for the first 10 minutes of play.
Changed: Added `docs/baegeum-city-v2-first-play-loop.md`, linked it from `docs/INDEX.md`, and updated the review board and working state so future loops judge features against the first play loop before adding scope.
Verified: `git diff --check` and `npm run check` passed.
Blocked: None.
Next: Define the git baseline strategy for the many untracked files before broad feature work.
Do not: Stage, commit, delete, or move files without explicit human approval.

Date: 2026-05-26
Observed: The human asked to start the next runtime step after the DiceLand-style exchange ATM. The safe scope was odd-even betting reservation only, with no result settlement.
Changed: Added `bet_reserved` as a GameAction type, created `createOddEvenBetReserveEnvelope`, and wired the odd-even table start button to reserve chips through `economy_ledger_entry`. The panel now enables only after a valid 홀/짝 selection and enough chips, then locks the local reservation to avoid duplicate starts.
Verified: `node tools/smoke-odd-even-table-panel.cjs`, `node tools/smoke-local-action-runtime.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser reload of `index.html` had the hidden odd-even panel present, the start button disabled before table seating, and zero console errors.
Blocked: No settlement clock/round authority exists yet, so results, refunds, payouts, and rankings remain intentionally disconnected.
Next: Add a tiny local odd-even round state contract before any result UI: `round_pending`, `round_closed`, `settled`, and one ledger entry per transition.
Do not: Add random win/loss payouts or rankings before round-state and server-authority boundaries are documented.

Date: 2026-05-26
Observed: The human wanted the exchange booth to follow the original DiceLand ATM-style design and be present inside gambling venues, not only at a separate chip exchange building.
Changed: Added `exchange-atm` props to gambling interiors, rendered them as ATM objects, made interior interaction open the exchange panel instead of directly changing money, and wired 10/50/100 chip cash-in/cash-out buttons through `exchange_chips` plus `economy_ledger_entry`.
Verified: `npm run check` passed, including the new `smoke-exchange-atm-panel.cjs` and updated interior interaction smoke. Browser reload of `index.html` had no console errors.
Blocked: Browser page globals are isolated from the inspection scope, so deep runtime state was verified through smoke tests rather than direct in-browser game object mutation.
Next: Connect odd-even betting to `bet_reserved` only, now that chips can be acquired safely through the ATM path.
Do not: Implement random results, payout settlement, or ranking changes before bet reservation is separately verified.

Date: 2026-05-26
Observed: Boot packet default priority pointed to map-editor stability, but the human clarified the map editor is already being worked on. In-game docs identified the next safe runtime slice as odd-even table UI gated by `table_seated`.
Changed: Added a small odd-even table panel that appears only when seated at an odd-even casino table. The panel allows 홀/짝 and 10/50/100 chip selection but does not start bets or write ledger entries. Confirmed DiceLand vendor has reusable exchange/roulette references.
Verified: `npm run check` passed. Browser verification confirmed the odd-even panel is hidden in `venue_lobby`, appears in `table_seated`, keeps the start button disabled, and has no console errors.
Blocked: None.
Next: Wire the odd-even start button to `bet_reserved` only, with no result settlement yet.
Do not: Implement win/loss results, random settlement, or ranking updates before the bet reservation path is documented and verified.

## Loop Log

Date: 2026-05-26
Observed: The human wanted to move past verification and redesign the lobby so it only works after online connection, using Iron Line as a reference without copying the combat game.
Changed: Added `docs/baegeum-city-v2-online-lobby-contract.md` and linked it from `docs/INDEX.md`. The contract defines online-only lobby gates, allowed state flow, minimum session/room data, Iron Line concepts to reuse, concepts to reject, and the next safe implementation slice.
Verified: `git diff --check` and `npm.cmd run check` passed.
Blocked: Browser automation for localhost was blocked by the client in the previous verification attempt, so the next implementation should rely on smoke tests first and browser-check only when the app tab is available.
Next: Add a pure `online-lobby-contract` data module and smoke test before building any lobby UI.
Do not: Build a fake offline lobby, copy Iron Line combat/team/loadout systems, or allow city entry before `join_result.ok` and version checks.

Date: 2026-05-26
Observed: Boot packet state pointed to construction UX. Pinned presets, category folding, and the `building_shell` taxonomy were already documented, leaving placement-only building card v0 as the next safe map-editor slice.
Changed: Added `빈 상가` as a build preset under the new `건물` group. Placed building cards create `objectLayer: "obstacle"`, `kind: "building"`, `objectKind: "building_shell"` objects with `building:0001` IDs, without venue entry, interiors, economy, or online behavior.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` confirmed the `건물` group, `빈 상가` card, `빈 상가 배치 중` state, successful placement, draft item `building:0001`, `objectKind: "building_shell"`, and no doors/channels/interior/economy fields or console errors.
Blocked: None.
Next: Follow the current next loop candidate: define a git baseline strategy for the many untracked files, or continue feature work with building-card variants/venue metadata if the human redirects.
Do not: Attach entry/interior/economy behavior to building cards in the same slice.

Date: 2026-05-26
Observed: The human asked for a fundamental check before continuing. Current docs pointed to building card v0, but the missing safety rail was the taxonomy that prevents a visual building card from becoming an accidental venue/economy object.
Changed: Updated `docs/baegeum-city-v2-world-object-system.md` with object-layer, object-kind, capability, static-map, runtime-state, and event-ledger boundaries. Building card v0 is now explicitly `building_shell` placement only, not `venue_anchor`.
Verified: `git diff --check` and `npm run check` passed.
Blocked: None.
Next: Add placement-only building card v0 using the `building_shell` boundary.
Do not: Attach doors, channels, interiors, economy, or online state to building cards in the same slice.

Date: 2026-05-26
Observed: Boot packet directed the loop to construction UX. Category groups already existed visually, but their open/closed state was not owned by editor state, so the palette behavior was harder to verify or preserve across future re-renders.
Changed: Added explicit build category open-state helpers, wired category toggle state into `baegeum-world-editor.js`, and expanded the build palette smoke test to cover default collapse and category reopening.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` confirmed `고정` starts open, `자연물/거리 시설/광고/간판` start collapsed, `자연물` opens on click, and there are zero console errors.
Blocked: First `npm run check` attempts hit transient OneDrive/module visibility errors around odd-even files; rerunning the specific smoke and then the full check passed with the files present.
Next: Continue with placement-only building card v0, without venue/interior/economy behavior.
Do not: Change saved-map contracts, runtime economy, online authority, or public blog state in this slice.

Date: 2026-05-26
Observed: The human asked whether the autonomous loop was missing a more fundamental control structure. The boot packet starts new agents correctly, but the human still needed a one-page way to review objective, verification, risks, approval boundaries, and next safe action.
Changed: Added `docs/ai-review-board.md`, linked it from `docs/INDEX.md`, and added it to the next-agent notes.
Verified: `git diff --check` passed. `npm run check` first saw a transient missing-module state for `src/ui/odd-even-table-panel.js`, then passed on rerun with the file present.
Blocked: No git baseline exists yet; the repository still has many untracked files, so future agents need extra care when reviewing diffs.
Next: Continue either placement-only building card v0, reconcile stale odd-even state notes, or define the separate git baseline strategy.
Do not: Install external Ouroboros, change global Codex setup, or alter saved-data/economy/online contracts without approval.

Date: 2026-05-26
Observed: Work queue and map-editor docs pointed to construction UX. The previous map-editor loop already added pinned presets, leaving category folding as the smallest local follow-up. Runtime odd-even reservation remains queued separately.
Changed: Added editor-only preset categories and changed the build palette from `고정` plus `전체` to `고정`, `자연물`, `거리 시설`, and `광고/간판` collapsible groups. The `고정` group stays open and category groups start collapsed.
Verified: `node tools/smoke-world-editor-build-palette.cjs`, `node tools/check-size.cjs`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` confirmed the four groups, no console errors, opening `자연물`, and selecting `활엽수` hides the list and shows `활엽수 배치 중`.
Blocked: None.
Next: Add building card v0 as placement-only construction UX, or return to the queued runtime `bet_reserved` slice if the human points back to in-game economy.
Do not: Add venue entry/interior/economy behavior while adding building cards.

Date: 2026-05-26
Observed: The next documented safe slice was construction UX. Pinned presets were smaller than category folding and did not touch saved draft/runtime contracts.
Changed: Added pinned build preset metadata for streetlight, billboard, and bench. The build palette now renders a `고정` group above the full `전체` group. Added a build palette smoke check.
Verified: `node tools/check-size.cjs`, `node tools/smoke-world-editor-build-palette.cjs`, `node tools/smoke-editor-entry.cjs`, `git diff --check`, `npm run check`, and browser verification of `editor.html` showing `고정`/`전체`, pinned cards `가로등/광고판/벤치`, and zero console errors.
Blocked: None.
Next: Continue construction UX with category grouping/collapse.
Do not: Change draft schema or add building cards before the category/palette path is stable.

Date: 2026-05-26
Observed: Boot packet loop pointed to the remaining map-editor selection safety work. Return-to-original needed a concrete original-map baseline and browser verification.
Changed: Added the `원위치` selection action, kept the editor reset baseline in `state.originalMap`, and exposed a small read-only debug snapshot hook for future editor checks.
Verified: `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` dragged `a-tree-1` from x=1030 to x=1750, then `원위치` returned it to x=1030/y=2060.
Blocked: None.
Next: Continue with construction UX: grouped build categories or pinned presets.
Do not: Change draft schema, saved-data compatibility, or runtime gameplay contracts for this UI-only slice.

Date: 2026-05-26
Observed: The next documented map-editor slice was selection actionbar safety. Coordinate lock and return-to-original were already present, leaving layer lock as the smallest safe remaining action.
Changed: Added layer lock state for scenery/obstacle layers, wired a `레이어잠금` actionbar button, made layer locks block movement and coordinate input, and added a pure smoke check for selection/layer lock behavior. Trimmed one blank line in `src/renderers/world-renderer.js` so the existing 300-line gate remains green.
Verified: `git diff --check` and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/editor.html` confirmed `좌표잠금` changes to `잠금해제`, `레이어잠금` changes to `레이어해제`, X/Y inputs are disabled while locked, and there are zero console errors.
Blocked: None.
Next: Continue with construction UX: grouped build categories or pinned presets.
Do not: Change draft schema, saved-data compatibility, or runtime gameplay contracts for this UI-only slice.

Date: 2026-05-26
Observed: Boot packet and work queue pointed to map-editor stability. `npm run check` was green before new work.
Changed: Validation report rows now render as buttons when their targets can be resolved. Clicking a report item selects the matching scenery, obstacle, or road point and centers the editor camera on it.
Verified: `node tools/check-size.cjs`, `node tools/smoke-world-editor-draft-contract.cjs`, `node tools/smoke-editor-entry.cjs`, `git diff --check`, `npm run check`, and browser load of `http://127.0.0.1:4173/editor.html` with zero console errors.
Blocked: None.
Next: Continue map-editor stability with selection actionbar utility work or deeper saved-vs-current diff details.
Do not: Install external Ouroboros or change schema/global config without human approval.

Date: 2026-05-26
Observed: map editor already had draft contracts, ID prefix validation, and pre-save validation report.
Changed: added saved-vs-current draft comparison for object add/delete/edit, road point changes, and map size changes in the editor work history panel.
Verified: `npm run check` passed, and browser check on `editor.html` showed `오브젝트 추가 1` after placing a bench.
Blocked: none.
Next: selection actionbar utility work from the map-editor track.
Do not: rewrite the draft schema for this slice.

Date: 2026-05-26
Observed: return-to-original action already existed, while coordinate lock was still missing from the actionbar.
Changed: added session-local coordinate lock for selected scenery/building objects; locked selections disable X/Y inputs and ignore drag movement without changing draft schema.
Verified: covered by the later selection lock smoke test and browser check in the layer-lock loop.
Blocked: none.
Next: continue with layer lock or construction-list category UX.
Do not: persist lock state into saved map drafts.
