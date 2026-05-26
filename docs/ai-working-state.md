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
6. Near-term code changes should continue extracting runtime contracts under `src/restored/` instead of adding more inline script to the restored HTML.
7. Asset additions for mp3 files, partner illustrations, phone art, casino art, and item images should go through `src/restored/assets/asset-manifest.js` and `docs/baegeum-city-v2-restored-asset-pipeline.md` before runtime use.
8. Restored read-only selectors for total asset, rank, ownership value, phone ownership, smartphone ownership, and carried inventory now live in `src/restored/state/selectors.js`.
9. Human-provided files, links, design drafts, and raw notes now have an intake lane: raw files in `assets/inbox/`, reference cards in `refs/intake/`, and classification through `tools/intake-restored-material.cjs`.
10. Restored UI, online expansion, ranking, and chat growth are now planned in `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`; phone remains the hub for news, markets, rankings, and chat, while current bottom navigation is location-aware instead of a permanent feature list.
11. New restored features should get a draft plan through `npm run plan:restored -- <slug> --write` before implementation. The plan template includes job/occupation impact so rankings can include jobs without mixing them into wealth rank.
12. `docs/plans/restored-ranking-job-system.md` is the first concrete restored feature plan. It keeps wealth title, leaderboard position, and job/occupation rank separate.
13. `docs/plans/restored-three-city-home-navigation.md` is the current navigation plan: start inside the player home, move to house-front, and expand through Baegeum City, Dice City, and Seosan City with location-aware tabs.
14. Static restored catalogs for ranks, assets, markets, partner archetypes, city ids, and place seeds now live under `src/restored/data/`.
15. `src/restored/data/location-catalog.js` and `src/restored/ui/location-nav-contract.js` define the planned home, house-front, travel, and first-city navigation contexts. The next code slice should make the playable shell consume these contracts in a reversible way.
16. Visible save-code backup UI has been removed from the restored HTML. The current start screen is a local guest login home, with online login explicitly unavailable until an online adapter exists.
17. `src/restored/account/session-contract.js` owns restored account/session and online availability state. MammonCity2 is pinned as a login/online/phone reference in `refs/`, but no Firebase config or runtime import should be copied without a separate adoption decision.
18. `src/restored/online/online-adapter-contract.js` now owns the unavailable-by-default online adapter snapshot and lobby availability guard. The next restored coding slice should move phone app rendering under `src/restored/phone/` before any Firebase or connected lobby work.
19. `src/restored/player/profile-contract.js` now owns the restored profile/job/residence/condition/core-stat shape. My Info is now a character sheet; money duplication and always-visible hunting/home actions should move to top bar, home, or outside-location surfaces instead.
20. `src/restored/phone/phone-app-contract.js` now owns phone app ids, labels, icons, and phone/smartphone gates, including the `relationships` app. The HTML still renders the app views, but visible app buttons are derived from the contract.
21. `docs/plans/restored-ui-surface-redesign.md` now owns the immediate pre-redesign checklist for the restored shell: My Info, home, outside/home-front, phone, city, ranking, chat, online, and asset boundaries.
22. The partner/lover list now belongs to the phone relationship app, not to My Info. My Info only shows a compact relationship summary, and the current playable phone tab exposes the `인연` app beside news/stock for folder phones. The MammonCity2-style phone registry/router/app-stage pattern remains the reference for relationship, market, ranking, chat, and online apps.
23. My Info now has a carried-item inventory preview for shop-owned devices, luxury goods, and consumables. Registered consumables can show a `사용` button through `src/restored/inventory/consumable-contract.js`; real estate remains excluded, and `docs/baegeum-city-v2-restored-inventory.md` records the restored inventory boundary.

24. Existing restored gambling is legacy scaffolding. The next gambling direction is a replacement system: each venue/game needs its own restored contract before UI work, and old odd-even/blackjack/casino scripts should be kept only as playable reference until replaced.
25. `src/restored/games/gambling-replacement-contract.js` now owns the restored gambling event/effect vocabulary: neutral gambling events, ledger bridge effects, relationship/emotion hooks, and online authority requests. The live restored HTML is still intentionally unconnected to this contract.
26. `src/restored/games/blackjack-contract.js` now owns pure blackjack scoring, outcome comparison, and bet/result envelopes on top of the restored gambling contract. It is not connected to `blackjack-design-test.html` or the live restored HTML yet.
27. `src/restored/games/blackjack-round-contract.js` now owns the pure blackjack round flow `ready -> player_turn -> dealer_turn -> settled`, including shoe consumption, initial deal, hit, stand, auto-settle, and settled result-envelope creation. It is still intentionally unconnected to UI.
28. `src/restored/games/roulette-contract.js` now owns pure single-zero roulette bet rules, color resolution, payout projection, and bet/result envelopes. It is still intentionally unconnected to UI.
29. `src/restored/games/baccarat-contract.js` now owns pure baccarat scoring, player / banker / tie bet normalization, banker commission payout, tie refund behavior, and bet/result envelopes. It is still intentionally unconnected to UI.
30. `src/restored/games/slot-contract.js` now owns pure provided-reel slot symbols, jackpot / triple / pair / loss classification, payout projection, and bet/result envelopes. It is still intentionally unconnected to UI and does not generate random outcomes.
31. `src/restored/games/pawnshop-contract.js` now owns pure pawnshop collateral quotes, pawn/redeem/forfeit envelopes, local item hold/return/sold effects, and local cash delta effects. It is still intentionally unconnected to UI and does not use the economy ledger until a debt/collateral ledger contract exists.
32. `src/restored/games/loan-office-contract.js` now owns pure loan quotes, borrow, payment, delinquency, default, and local debt/cash effects. It is still intentionally unconnected to UI and does not use the economy ledger until a debt ledger exists.
33. `tools/check-restored-game-contract-purity.cjs` now guards restored game contracts against DOM, browser storage, timers, direct random outcome generation, and missing smoke-check coverage before animated roulette, baccarat, horse racing, or slots are added.
34. `src/restored/economy/dpa-token-contract.js` now owns the DPA casino-token boundary: normal cash stays 원화, Dice City betting/exchange UI can refer to `DPA`, and `1 DPA = 1,000원` bridges to the current `chips` ledger field during migration.
35. Baegeum frontage rows are now guarded: job street shows 고시원/편의점/맥버거/인력소, shop street shows 디페이 ATM/배금증권/배금은행/중고차 매장, and Dice City casino street shows 룰렛카지노/바카라카지노/경마장/DPA 환전소 without adding more bottom tabs.
36. `docs/plans/restored-lover-relationship-system.md` now owns the relationship v2 planning boundary: My Info can show social/emotional summaries, the phone relationship app owns the full partner/lover flow, and future affection/trust/stability/risk changes must consume events instead of being mutated directly by casino, stock, loan, pawnshop, gift, or job handlers.
37. `src/restored/systems/relationship-contract.js` now owns pure relationship v2 helpers for legacy `love` migration, stage inference, affection/trust/stability/risk clamping, confession readiness, relationship summaries, and relationship log envelopes.
38. `src/restored/ui/relationship-summary-view.js` now turns that contract into a compact My Info summary card and phone app badge label. The full partner list remains inside the phone relationship app, and relationship mutations still need event boundaries.
39. `src/restored/phone/relationship-app-view.js` now owns the phone relationship app partner-card list and recent relationship-log HTML. The HTML shell only mounts the returned summary label, list HTML, and log HTML, preserving `openInteractModal(index)` as the current interaction entry.
40. Restored initial state and storage now seed and preserve `relationshipLogs`.
41. `src/restored/systems/relationship-event-runtime.js` now routes current walk encounters, interest, calls, AI talk, gifts, intimacy, marriage, and passive drift through relationship source events/logs while preserving legacy `love` compatibility.
42. `src/restored/phone/phone-app-ecosystem-contract.js` now separates the planned phone OS/app-store catalog from the live phone app registry. Planned apps include BaeTalk-style messenger, Baegeum Gallery-style community, rankings, bank/pay, map, and online lobby candidates.
43. `src/restored/phone/app-store-view.js` now renders the smartphone-only Baegeum Store shell from the ecosystem catalog. It shows installed, locked, planned, and online-prep app rows without mutating save data or adding phone apps to bottom navigation.
44. `src/restored/phone/news-app-view.js`, `src/restored/phone/stock-app-view.js`, and `src/restored/phone/futures-app-view.js` now own the restored phone news, stock, and futures renderers. The HTML shell mounts returned view HTML and still owns market ticks, trades, and futures open/close handlers.
45. `docs/plans/restored-stock-market-system.md` now owns the restored market expansion boundary: Domestic, United States, Crypto Spot, and Crypto Leverage tabs, realistic virtual candle charts, DP-only prices, Baegeum Electronics as V0.1, and no live financial data or real-company branding in the first slice.
46. `src/restored/systems/market-contract.js` now owns the first pure Baegeum Electronics market contract: virtual OHLCV generation, snapshot summary, DP formatting, holding P/L, and buy/sell order previews without DOM, storage, timers, random outcomes, or live money mutation.
47. `docs/plans/restored-life-minigame-system.md` and `src/restored/jobs/life-job-contract.js` now own the first life-job minigame lane: convenience-store and fast-food deterministic shift scoring, DP wage envelopes, condition effects, relationship hooks, and optional inventory bonuses without live HTML mutation.

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

Date: 2026-05-27
Observed: The human approved starting the stock-market direction after defining four market classes: Domestic, United States, Crypto Spot, and Crypto Leverage. The live restored app already has stock/futures phone views, but market ticks and trade handlers remain in the HTML shell and should not expand without a contract.
Changed: Added `docs/plans/restored-stock-market-system.md`, linked it from `docs/INDEX.md` and `docs/plans/README.md`, referenced it from the phone app ecosystem plan, and guarded it in `tools/check-restored-planning-kit.cjs`. The plan fixes Baegeum Electronics as V0.1, DP-only prices, virtual OHLCV candles, no live financial data, and a staged path for United States, Crypto Spot, and Crypto Leverage.
Verified: `node tools/check-restored-planning-kit.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: No market runtime code changed. Baegeum Electronics catalog fields, virtual candle generation, order/effect envelopes, and DP-only stock UI are still pending.
Next: Add a pure restored market contract/simulator for Baegeum Electronics before changing the live phone stock app or moving money through new handlers.
Do not: Implement all four markets at once, use real-company branding or live data, show KRW/USD in restored market UI, or add leverage outside the Crypto Leverage market.

Date: 2026-05-27
Observed: The stock-market plan called for a pure Baegeum Electronics simulator before any live phone UI or money mutation changed. The restored HTML still owns legacy stock/futures handlers, so the first code slice needed to stay isolated.
Changed: Added `src/restored/systems/market-contract.js` with the restored market contract version, four market ids, Baegeum Electronics metadata, deterministic virtual OHLCV generation, snapshot summaries, DP formatting, holding P/L quotes, and buy/sell order previews. Added `tools/check-restored-market-contract.cjs`, wired it into `npm run check`, and updated the stock-market plan.
Verified: `node tools/check-restored-market-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: The live phone stock app still renders the old catalog and the HTML still mutates cash for current stock trades. No UI wiring or save migration was attempted in this slice.
Next: Build a non-mutating phone stock-app adapter/view that can render the Baegeum Electronics snapshot and DP text from the market contract before replacing legacy trade handlers.
Do not: Wire the order preview to live cash, add market tabs, or rename the current saved stock fields until a save-compatible adapter exists.

Date: 2026-05-27
Observed: The human asked to add the other minigames and job experiences, including convenience store, pawnshop, and fast-food. Dice City gambling, pawnshop, and loan-office contracts already existed, while ordinary work minigames had no contract boundary yet.
Changed: Added `docs/plans/restored-life-minigame-system.md`, `src/restored/jobs/life-job-contract.js`, and `tools/check-restored-life-job-contract.cjs`. The new contract covers convenience-store and fast-food shifts with deterministic task decks, S/A/B/C/D/F scoring, DP wage envelopes, player condition effects, relationship hooks, and high-grade inventory bonus envelopes. It is wired into `npm run check` and the planning-kit guard.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: No live UI adapter was wired. Job results still need to flow through the existing action/effect ledger path before the restored HTML can mutate cash, energy, inventory, or relationship logs.
Next: Build a convenience-store UI adapter first, then fast-food, using `createRestoredLifeJobResult()` as the only wage/condition source.
Do not: Recreate job rewards as direct HTML cash buttons or mutate partner state directly from job minigame handlers.

## Next Loop Candidate

Recommended next autonomous loop:

Restored phone app ecosystem:

1. Keep planned apps in `phone-app-ecosystem-contract.js` until each has a view and gate.
2. Build BaeTalk partner DM and Baegeum Gallery community as separate apps; do not merge community posts with realtime chat.
3. Add install-state persistence to Baegeum Store only after the live registry and save contract can represent optional installs safely.
4. Move stock/futures action handlers only after their state/effect contract is documented.

Restored stock market system:

1. Start with the documented V0.1 slice: Baegeum Electronics in the Domestic tab.
2. Use `src/restored/systems/market-contract.js` as the source for Baegeum Electronics virtual candles, DP display, holding quote, and order previews.
3. The next market slice can be a non-mutating phone stock-app adapter that renders the Baegeum Electronics snapshot.
4. Do not add United States, Crypto Spot, or Crypto Leverage tabs until the Baegeum Electronics chart, holding, and P/L loop is stable.

Restored life minigames:

1. Build the convenience-store adapter before fast-food because it has lower wage, lower energy cost, and simpler early-game pressure.
2. Feed UI performance into `createRestoredLifeJobResult()` and consume returned effects instead of calculating wages in the HTML shell.
3. Route `relationship_event_hook` through the relationship event runtime before showing partner reactions.
4. Keep pawnshop/loan-office in the Dice City contract lane; do not mix collateral/debt state into ordinary job rewards.

Restored lover/relationship v2:

1. Add a deliberate date, DM, or confession surface that consumes the relationship event runtime instead of growing the old interaction modal.
2. Keep My Info as summary only; do not move the full partner list back out of the phone app.
3. Leave casino/loan/pawnshop reactions disconnected until the relationship event runtime has a non-modal date or DM loop.
4. Extract the next phone app renderer, likely news or stock, only after the relationship source-event slice stays stable.

Paused restored gambling replacement:

1. Pick the next replacement module or adapter: loan/debt state, slots, blackjack/roulette UI adapter planning, or pawnshop UI adapter planning.
2. Keep each module pure: rules, allowed inputs, output event/effect envelopes, and no DOM writes.
3. Add a smoke check before wiring any live HTML button to the module.
4. Keep the old odd-even/blackjack scripts playable only as reference. Do not continue the old settlement path as the future gambling architecture.

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

Date: 2026-05-27
Observed: The final phone-app rendering bottleneck was stock and futures. News, relationships, and app-store were already extracted, but stock rows, portfolio rows, chart bars, futures ticker, and futures position cards still rendered inline in `baegeum-city-v2-dice.html`.
Changed: Added `src/restored/phone/stock-app-view.js` and `src/restored/phone/futures-app-view.js`, rewired the restored HTML to mount returned view objects, preserved existing trade/close button entry points, kept futures margin-call mutation in the HTML shell, and updated docs/checks so news/stock/futures views stay extracted.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-phone-app-ecosystem.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, `npm run check`, and `Invoke-WebRequest http://127.0.0.1:4173/baegeum-city-v2-dice.html` passed. The restored HTML is now 1463 lines; new stock/futures phone view modules are under 100 lines each.
Blocked: In-app browser automation still could not attach because no active Codex browser pane was reported. Visual browser verification remains pending even though local HTTP and full static/project checks pass.
Next: Treat the core phone renderer extraction as complete. The next meaningful slice is a BaeTalk/date/confession surface through relationship events, or a separate stock/futures action-effect contract if market handlers need to move next.
Do not: Put news/stock/futures app rendering back into `baegeum-city-v2-dice.html`, add phone apps to bottom navigation, or move stock/futures action handlers without a separate contract.

Date: 2026-05-27
Observed: The phone app ecosystem next slice was renderer extraction. News still rendered cards inline in `baegeum-city-v2-dice.html`, while relationship and app-store views were already extracted.
Changed: Added `src/restored/phone/news-app-view.js`, delegated `renderNewsTab()` to `renderRestoredNewsListHtml(gameState)`, and extended phone app checks/docs so news stays a phone app view module. The restored HTML is now 1498 lines and stock/futures are the remaining inline phone renderers.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-phone-app-ecosystem.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, `npm run check`, and `Invoke-WebRequest http://127.0.0.1:4173/baegeum-city-v2-dice.html` all passed.
Blocked: In-app browser automation could not attach because no active Codex browser pane was reported, and the fallback Playwright target was closed before inspection. Visual browser verification is still pending when the app pane is available again.
Next: Extract the stock phone app renderer, then futures, before adding BaeTalk or Baegeum Gallery surfaces.
Do not: Put news back into inline HTML rendering, add phone apps to bottom navigation, or grow stock/futures UI before their renderers are split.

Date: 2026-05-27
Observed: Final verification found that the Dice City casino street still labeled baccarat as `계약 예정` even though the pure baccarat contract is now guarded.
Changed: Updated the casino street baccarat row copy in `src/restored/ui/place-surface-copy.js` from `계약 예정` to `계약 있음`.
Verified: `node tools/check-restored-city-frontage-contract.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest login, home-front navigation, bus stop, Dice City casino street, no captured browser errors, and baccarat shown as `계약 있음`.
Blocked: None.
Next: Continue with horse-racing as the next pure game contract, or start a UI adapter plan after the current contract layer is reviewed.
Do not: Treat casino street copy as authority; the contracts under `src/restored/games/` remain the source for game readiness.

Date: 2026-05-27
Observed: Blackjack, roulette, baccarat, pawnshop, and loan-office contracts were guarded, leaving slot machines as the next small Dice City game that needed a pure provided-result contract before animation.
Changed: Added `src/restored/games/slot-contract.js` with three-reel symbol normalization, jackpot / triple / pair / loss classification, payout projection, and restored gambling bet/result envelopes. Added `tools/check-restored-slot-contract.cjs`, wired it into the game-contract purity gate and `npm run check`, and documented `restored-slot-001`.
Verified: `node tools/check-restored-slot-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-restored-gambling-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Continue with horse-racing as the next pure game contract if the human keeps pushing Dice City game expansion.
Do not: Generate random slot outcomes, animate reels, or wire slot payouts to live UI before the adapter and authority boundary are explicitly guarded.

Date: 2026-05-27
Observed: Pawnshop and baccarat contracts were guarded, leaving Dice City's loan office as the next high-risk system that should not mutate cash/debt directly from UI.
Changed: Added `src/restored/games/loan-office-contract.js` with loan quotes, borrow envelopes, payment, delinquency, default, and local debt/cash effects. Added `tools/check-restored-loan-office-contract.cjs`, wired it into the game-contract purity gate and `npm run check`, and documented `restored-loan-office-001`.
Verified: `node tools/check-restored-loan-office-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-restored-gambling-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Continue with slots or horse-racing as the next pure game contract if the human keeps pushing Dice City game expansion.
Do not: Wire loan-office buttons to live cash, ledger, debt, partner emotion, or online state before the debt ledger boundary is explicitly guarded.

Date: 2026-05-27
Observed: The next safe Dice City gambling slice was baccarat, but only as a pure contract before any casino animation or live UI wiring.
Changed: Added `src/restored/games/baccarat-contract.js` with baccarat scoring, player / banker / tie bets, banker commission payout, tie refund behavior, and restored gambling bet/result envelopes. Added `tools/check-restored-baccarat-contract.cjs`, registered baccarat in the shared gambling game ids, wired it into the game-contract purity gate and `npm run check`, and documented `restored-baccarat-001`.
Verified: `node tools/check-restored-baccarat-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-restored-gambling-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Continue with slots or loan/debt as the next pure replacement contract, or plan a UI adapter that consumes blackjack/roulette/baccarat contract output without inventing money logic.
Do not: Wire baccarat into live casino UI, add card animations, or generate random outcomes inside `src/restored/games/`.

Date: 2026-05-27
Observed: The human wanted the useful parts of the Baegeum City promo/design notes selected, with normal 원화 kept intact, betting chips renamed toward DPA, missing city buildings added, and the bottom tabs kept simple.
Changed: Added `src/restored/economy/dpa-token-contract.js` with `1 DPA = 1,000원` and a bridge to the current `chips` ledger field. Added Baegeum job/shop frontage places and rendered compact place-surface rows for 고시원, 편의점, 맥버거, 인력소, 디페이 ATM, 배금증권, 배금은행, 중고차 매장, plus Dice City 룰렛카지노, 바카라카지노, 경마장, and DPA 환전소. Kept bottom nav capped at five actions and made 상점가 open a frontage surface before the shop tab. Added `tools/check-restored-dpa-token-contract.cjs` and `tools/check-restored-city-frontage-contract.cjs`.
Verified: `node tools/check-restored-dpa-token-contract.cjs`, `node tools/check-restored-city-frontage-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, and `npm run check` passed. Browser verification confirmed 배금도시 상점가 shows 디페이 ATM/1 DPA = 1,000원/배금증권/배금은행/중고차 매장, and 다이스시티 카지노거리 shows 룰렛카지노/바카라카지노/경마장/DPA 환전소.
Blocked: None.
Next: If continuing visual redesign, add a dedicated city frontage/design-test surface or map scenery pass; if continuing systems, add baccarat or horse-racing pure contracts before animation.
Do not: Rename all money to DPA, add every building as a bottom tab, or wire DPA exchange to live casino cash mutation before the action/ledger path is guarded.

Date: 2026-05-27
Observed: The human wanted roulette, baccarat, horse racing, and other animated Dice City games, but asked to validate first so the expansion does not become another tangled inline script layer.
Changed: Added `tools/check-restored-game-contract-purity.cjs` and wired it into `npm run check`. The guard scans `src/restored/games/*-contract.js` for DOM/browser storage/timer/random dependencies, requires explicit contract versions and validation exports, and requires smoke-check coverage for each current game contract. Documented the anti-spaghetti gate in the gambling venues doc and recomposition guard list.
Verified: `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add baccarat, horse racing, slots, or loan/debt as pure contracts first; build animation adapters or design-test pages only after each contract has a smoke check.
Do not: Put wheel/card/race animations, DOM writes, timers, storage, or random result generation into `src/restored/games/` contracts.

Date: 2026-05-27
Observed: The restored gambling replacement path had blackjack and roulette contracts, but Dice City's planned pawnshop still needed a pure collateral boundary before any UI or inventory wiring.
Changed: Added `src/restored/games/pawnshop-contract.js` with pawnshop quote math, pawn/redeem/forfeit envelopes, and local item/cash effects. Added `collateral_redeemed` to the shared restored gambling vocabulary, added `tools/check-restored-pawnshop-contract.cjs`, wired it into `npm run check`, and documented that pawnshop is not connected to live UI yet.
Verified: `node tools/check-restored-gambling-contract.cjs`, `node tools/check-restored-pawnshop-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Continue with loan/debt state, slots, or a UI adapter plan for blackjack/roulette/pawnshop.
Do not: Wire pawnshop buttons to live cash or inventory before the debt/collateral ledger and UI adapter boundary are explicitly guarded.

Date: 2026-05-27
Observed: Blackjack now had a reusable round contract, but Dice City's planned casino street also needs roulette as a separate replacement module instead of inheriting the old casino tab.
Changed: Added `src/restored/games/roulette-contract.js` with single-zero roulette numbers, color resolution, straight/outside/dozen/column bet normalization, payout projection, and bet/result envelopes through the restored gambling contract. Added `tools/check-restored-roulette-contract.cjs`, wired it into `npm run check`, and documented that roulette remains unconnected to live UI.
Verified: `node tools/check-restored-roulette-contract.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add pawnshop collateral or loan/debt state as the next non-casino replacement module, or plan the eventual blackjack/roulette UI adapter.
Do not: Reuse the old casino tab as the long-term roulette runtime.

Date: 2026-05-27
Observed: Blackjack had pure scoring and result envelopes, but no reusable round state flow yet. Without that layer, the later UI hookup would have to re-invent shoe consumption, deal order, hit/stand transitions, and auto-settlement inside the screen code.
Changed: Added `src/restored/games/blackjack-round-contract.js` with deterministic shoe consumption, initial deal, hit, stand, auto-settle, and settled result-envelope creation. Added `tools/check-restored-blackjack-round-contract.cjs`, wired it into `npm run check`, and documented that the flow remains unconnected to both the standalone design page and live restored HTML.
Verified: `node tools/check-restored-blackjack-round-contract.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add either the next replacement gambling module, such as roulette/pawnshop/loan, or a later UI adapter plan that maps `blackjack-design-test.html` controls onto the restored blackjack round contract.
Do not: Put blackjack card drawing or result settlement directly into UI handlers.

Date: 2026-05-27
Observed: With the restored gambling event contract in place, blackjack was the right first replacement game because the human already approved the standalone table design as the future candidate.
Changed: Added `src/restored/games/blackjack-contract.js` with pure scoring, ace downgrade, natural blackjack, bust, push, win/loss comparison, and blackjack bet/result envelopes that flow through the restored gambling contract. Added `tools/check-restored-blackjack-contract.cjs`, wired it into `npm run check`, and documented that it remains unconnected to both the design prototype and live restored HTML.
Verified: `node tools/check-restored-blackjack-contract.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add either a blackjack shoe/round-state layer or the next replacement venue contract before any live UI wiring.
Do not: Attach the blackjack design page to live casino money before the restored gambling contract path is used.

Date: 2026-05-27
Observed: The restored gambling direction needed a contract before any live casino rewrite, otherwise blackjack, roulette, pawnshop, and loan-office work would each invent separate result vocabularies.
Changed: Added `src/restored/games/gambling-replacement-contract.js` with neutral events for venue visits, bets, wins, losses, refunds, debt, and collateral. Added effect vocabulary for event records, economy ledger bridge entries, relationship/emotion hooks, and online authority requests. Guarded it with `tools/check-restored-gambling-contract.cjs`, wired the check into `npm run check`, and updated the gambling/recomposition docs.
Verified: `node tools/check-restored-gambling-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Build the first replacement gambling module as a pure rules/event layer before connecting any live casino UI.
Do not: Let casino modules mutate partner emotions, cash, chips, debt, or collateral directly from UI handlers.

Date: 2026-05-27
Observed: After the standalone blackjack design pass, the next safe step was to keep that prototype from regressing while it stays disconnected from the live restored game.
Changed: Added `tools/check-blackjack-design-prototype.cjs` and wired it into `npm run check`. The check guards the Korean visible UI, circular chip/stack animation pieces, the documented future target `다이스시티 -> 카지노거리 -> 블랙잭카지노`, and the rule that the prototype is not connected yet.
Verified: `node tools/check-blackjack-design-prototype.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Keep `blackjack-design-test.html` as a standalone handoff page until the human explicitly asks to apply it in-game, then start from a restored gambling replacement contract.
Do not: Replace live casino behavior with this prototype before the betting/ledger/emotion/online boundary exists.

Date: 2026-05-27
Observed: The human liked `blackjack-design-test.html` enough to keep it as the future in-game blackjack candidate, but wanted no visible English, better chip visuals, and chip-click animation before later integration.
Changed: Reworked `blackjack-design-test.html` as a Korean-only visible prototype, redesigned the betting chips, added a table betting zone, and made clicked chips animate from the rail to the table stack. Recorded the future integration location as `다이스시티 -> 카지노거리 -> 블랙잭카지노` in the gambling venue document.
Verified: `git diff --check`, script parse check, `npm run check`, and browser smoke on `http://127.0.0.1:4173/blackjack-design-test.html` passed. Browser verification confirmed no captured runtime errors, no visible English UI labels from the old prototype, circular chip buttons, chip-click flight animation, table chip stacking, and a playable start/hit/stand/settle round.
Blocked: None.
Next: Browser-check the standalone prototype, then keep it disconnected until the human explicitly asks to apply it in-game.
Do not: Wire this prototype into `baegeum-city-v2-dice.html` before the restored gambling replacement contract exists.

Date: 2026-05-27
Observed: The human clarified that the existing gambling layer should be treated as a system to replace, not as the long-term base to extend.
Changed: Added the restored gambling replacement rule to `docs/baegeum-city-v2-gambling-venues.md`, updated the recomposition plan so gambling work starts from replacement contracts, and recorded the direction in this working state.
Verified: `git diff --check` and `npm run check` passed after the document-only update.
Blocked: None.
Next: Add a restored gambling replacement contract before touching roulette, blackjack, odd-even, pawnshop, or loan-office runtime behavior.
Do not: Keep expanding the old inline casino scripts as if they were the final gambling system.

Date: 2026-05-27
Observed: The human asked for a final bug pass and a check that the canonical docs still cover the conversation requirements before moving deeper into redesign.
Changed: Reconciled the restored recomposition, UI/online/ranking/chat roadmap, UI redesign, and ranking/job planning docs so they no longer describe the old fixed five-tab shell as current. The current docs now state that location-aware navigation is live, partner lists belong in the phone relationship app, My Info has carried inventory, and consumable use is owned by restored inventory modules.
Verified: `git diff --check`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, and `npm run check` passed. Browser smoke on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` verified home/outside/Dice City navigation, My Info inventory, capped energy-drink use, phone apps, relationship app placement, and zero captured runtime errors.
Blocked: None.
Next: Commit/push a backup when the human explicitly asks, or continue by moving shop purchases and phone app rendering toward restored action/effect modules.
Do not: Reintroduce permanent global tabs for news/stock/futures/relationships or put partner lists back into My Info.

Date: 2026-05-26
Observed: The previous inventory slice had display-only consumables, and the next safe step was to make energy drink usable without one-off My Info state mutation.
Changed: Added `src/restored/inventory/consumable-contract.js` for registered consumable effects, `src/restored/inventory/inventory-view.js` for the carried-item preview renderer, and wired the My Info `사용` button to `projectRestoredConsumableUse()`. Energy drink now consumes one item and restores `profile.stats.energy` by 20, capped at max. Updated restored inventory docs and module README.
Verified: `node tools/check-restored-player-profile.cjs`, `node tools/check-restored-growth-architecture.cjs`, `git diff --check`, `node tools/check-size.cjs`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed `에너지 드링크` showed `사용`, changed energy from `72/100` to `92/100`, removed the consumed item, and showed `에너지 +20`.
Blocked: None.
Next: Promote shop purchases and consumable use toward a restored ledger/action envelope when the restored economy path is ready.
Do not: Add direct per-item button mutations in HTML; new consumables should register effects in the inventory contract.

Date: 2026-05-26
Observed: The human wanted an inventory document and a My Info place to check bought items at once, especially convenience-store consumables like energy drinks, while excluding houses and real estate.
Changed: Added `docs/baegeum-city-v2-restored-inventory.md`, linked it from `docs/INDEX.md`, added `energy_drink` as the first restored consumable item, added `listRestoredInventoryItems()` to restored selectors, and rendered a compact My Info inventory panel. Consumables are shown in inventory but excluded from restored net-worth value preservation.
Verified: `node tools/check-restored-growth-architecture.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` bought `에너지 드링크` through the house-front convenience shop and confirmed My Info inventory showed `폴더폰` plus `에너지 드링크` with no real-estate item names.
Blocked: None.
Next: Move inventory use effects, gifting, or convenience-store item actions through the action/economy contracts before adding consume buttons.
Do not: Put real estate, cash, stocks, crypto/futures, or direct item mutation controls into the My Info inventory panel.

Date: 2026-05-26
Observed: The human pointed at the live DiceLand page as a stronger visual/game reference and suggested splitting Dice City into separate venues such as pawnshop, loan office, roulette casino, and blackjack casino.
Changed: Reworked the restored Dice City navigation from one generic casino tab into `카지노거리`, `전당포`, `사채업소`, `호텔`, and `이동`. Added casino-street place cards for 슬롯카지노, 블랙잭카지노, and 룰렛카지노, added restored place catalog entries for casino street, pawnshop, loan office, and hotel, and recorded the live DiceLand reference in the gambling venue document. Placeholder place buttons now safely route through exposed toast or existing tabs instead of failing on module-scoped handlers.
Verified: `npm run check` passed. Browser verification confirmed Dice City opens on `카지노거리`, shows 슬롯/블랙잭/룰렛 cards, and bottom navigation exposes 전당포 and 사채업소 place surfaces. The only browser noise remained the existing favicon 404/Tailwind CDN warning.
Blocked: None.
Next: Turn one separated venue into a real feature through a contract first: either blackjack panel extraction, roulette rules scaffold, pawnshop collateral contract, or loan/debt state contract.
Do not: Add direct cash/debt mutations from place buttons or copy DiceLand code/assets without a separate adoption/license decision.

Date: 2026-05-26
Observed: After location-aware navigation landed, browser verification exposed two UX bugs: the floating phone dock aligned to the viewport edge on desktop instead of the playable shell, and guest login could reopen at a previously saved outside/city location instead of starting inside the home.
Changed: Re-centered the phone dock inside the max-width playable shell, kept its hit target active through the pointer-events wrapper, made no-phone dock clicks jump directly to the house-front convenience shop, and reset restored guest entry to `home_inside` / `myinfo` on every start.
Verified: `npm run check` passed. Browser verification confirmed guest entry now starts at `우리집 안`, the bottom nav shows `내정보/집안/밖으로 나가기`, the phone dock sits above the app-width tab area, and no-phone dock access opens the 편의점 shop surface. Only the existing favicon 404/Tailwind CDN warning remained.
Blocked: None.
Next: Move the next real place action through a restored action/effect or ledger-compatible contract before changing cash, items, stats, or job state.
Do not: Let saved location override the home start, or wire fast-food/labor-office buttons to direct state mutation.

Date: 2026-05-26
Observed: The human approved starting the relationship phone-app migration. The previous code still rendered the full partner list as a My Info section while phone apps only covered news, stock, and futures.
Changed: Added the `relationships` phone app to `src/restored/phone/phone-app-contract.js`, moved the partner list DOM from My Info to `phone-app-relationships`, added `renderRelationshipPhoneApp`, and strengthened restored growth/profile/phone checks so the full partner list cannot move back into My Info silently.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-player-profile.cjs`, `node tools/check-restored-growth-architecture.cjs`, and full `npm run check` passed. Browser verification reloaded `baegeum-city-v2-dice.html`, entered as `Tester`, confirmed My Info has no `partner-list`, confirmed the phone grid shows `뉴스/주식/인연`, opened the `인연` app, confirmed `phone-partner-list` exists in the phone app, and saw zero console errors.
Blocked: None.
Next: Extract the relationship phone app renderer into `src/restored/phone/` or add the next small phone-app renderer extraction for news/stock without broad visual redesign.
Do not: Put the full lover list, partner DM, market apps, ranking, chat, or online lobby back into permanent bottom navigation or My Info.

Date: 2026-05-26
Observed: The human clarified that the lover list should move into the phone as an app, following the MammonCity2-style phone app flow where app icons open in-phone app screens for markets, chat, and relationship content.
Changed: Updated the restored roadmap, UI surface redesign plan, login/phone migration plan, recomposition plan, restored README, and planning checks so the partner/lover list is treated as a phone relationship app entry rather than a My Info section.
Verified: `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, full `npm run check`, and `git diff --check` passed. `git diff --check` only reported existing CRLF conversion warnings.
Blocked: None.
Next: Add the relationship/lover app id to `src/restored/phone/phone-app-contract.js`, then move the current partner list render path from My Info into the phone app stage.
Do not: Put the full lover list, partner DM, market apps, ranking, chat, or online lobby back into permanent bottom navigation or My Info.

Date: 2026-05-26
Observed: The human asked to re-check whether all markdown planning additions were present before starting the broader redesign. The planning README listed `restored-ui-surface-redesign.md` as a recommended draft, but the actual file was still missing.
Changed: Added `docs/plans/restored-ui-surface-redesign.md` as the pre-redesign checklist for the restored playable shell, linked it from `docs/INDEX.md`, `docs/plans/README.md`, the restored roadmap, recomposition plan, and `src/restored/README.md`, and strengthened `tools/check-restored-planning-kit.cjs` so the plan cannot silently disappear.
Verified: `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, full `npm run check`, and `git diff --check` passed. `git diff --check` only reported existing CRLF conversion warnings.
Blocked: None.
Next: Run planning-kit and full project checks, then begin redesign from phone renderer extraction or location-aware shell wiring.
Do not: Start broad visual redesign before the surface checklist and existing checks are green.

Date: 2026-05-26
Observed: The human identified My Info as the next readability bottleneck because it duplicated money and mixed identity, hunting, home travel, account, and relationship data.
Changed: Added `src/restored/player/profile-contract.js` for profile/job/residence/condition/core stats, added `profile` to restored initial/save/load state, and rewired My Info into a character sheet with core stats instead of duplicated cash/net-worth rows or always-visible hunting/home action buttons. Added `tools/check-restored-player-profile.cjs` to guard the profile contract and My Info boundaries.
Verified: `node tools/check-restored-player-profile.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, full `npm run check`, and `git diff --check` passed. Browser verification reloaded `baegeum-city-v2-dice.html`, logged in as `Tester`, confirmed the My Info stat grid, job/residence/condition/account fields, no visible hunting/home action buttons, no duplicated My Info money rows, and zero console errors.
Blocked: None yet.
Next: Run full check and browser-smoke the restored page, then continue with phone app extraction or location-aware navigation.
Do not: Put money summaries, hunting, or home travel back into My Info; those belong in the top bar, home surface, or outside-location actions.

Date: 2026-05-26
Observed: After the My Info slice was verified, the next small bottleneck was that phone app ids and device gates were still owned by the restored HTML.
Changed: Added `src/restored/phone/phone-app-contract.js` for news, stock, and futures app metadata plus phone/smartphone gates. Re-exported the app contract from the shell contract, rewired the phone tab to derive visible app buttons from the contract, and added `tools/check-restored-phone-app-contract.cjs`.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, full `npm run check`, and `git diff --check` passed. Browser verification reloaded `baegeum-city-v2-dice.html`, opened the phone tab with a folder phone, confirmed only `뉴스/주식` app buttons are visible, confirmed `코인선물` is hidden until smartphone ownership, and reported zero console errors.
Blocked: None yet.
Next: Verify folder-phone and smartphone button visibility, then continue with full phone renderer extraction.
Do not: Put news, stock, futures, rankings, chat, or online lobby back into global bottom navigation.

Date: 2026-05-26
Observed: The last restored loop removed visible save-code UI and left the next safe slice as a restored online adapter that returns `unavailable` by default before any Firebase, lobby, or phone-online work.
Changed: Added `src/restored/online/online-adapter-contract.js` with online status validation, an unavailable adapter, adapter snapshots, and a lobby guard. Re-exported online state helpers from `account/session-contract.js`, switched restored initial state to import online state from the online module, and guarded the adapter in `tools/check-restored-growth-architecture.cjs`. Updated restored roadmap, recomposition plan, login migration plan, and `src/restored/README.md`.
Verified: Initial `npm run check` was already green. After the change, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, and full `npm run check` passed. Browser verification reloaded `baegeum-city-v2-dice.html`, confirmed guest login and online login pending are visible, confirmed save-code UI is absent, logged in as `Tester`, saw `Tester · OFFLINE`, and reported zero console errors.
Blocked: Real online login and online lobby remain intentionally unavailable. No Firebase or MammonCity2 runtime code was copied.
Next: Move phone app rendering and phone app gates under `src/restored/phone/`, keeping news, stock, futures, rankings, chat, and future online lobby inside the phone surface.
Do not: Enable lobby UI from offline state, copy Firebase config, or put phone apps back into the global bottom navigation.

Date: 2026-05-26
Observed: The human wanted to remove the data backup center/save-code UX and move the restored build toward a login home, while using `PEPEANT/MammonCity2` as the reference for home login, online systems, and phone UI.
Changed: Replaced the visible restored start screen controls with a local guest login home and disabled online login state. Removed the visible data backup center, save-code copy/restore buttons, and save-code modals from `baegeum-city-v2-dice.html`. Added `src/restored/account/session-contract.js`, added `account` and `online` to restored state/save domains, preserved saved phone ownership during load, and guarded that legacy save-code UI does not return to the HTML. Added `docs/plans/restored-login-home-online-phone-migration.md`, pinned MammonCity2 HEAD/reference notes, and updated roadmap/planning checks.
Verified: `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, `npm run check`, and `git diff --check` passed. Browser verification reloaded `baegeum-city-v2-dice.html`, confirmed guest login and disabled online login are visible, confirmed backup/save-code UI is not visible, logged in as `Tester`, reached the game screen, and saw zero console errors.
Blocked: Real online login/cloud save is still intentionally unavailable. MammonCity2 has no detected top-level license file in the intake, so it remains a reference/adoption candidate rather than direct runtime copy.
Next: Add a restored online adapter contract that returns `unavailable` by default, then move phone app rendering under `src/restored/phone/` before any Firebase or connected lobby work.
Do not: Reintroduce save-code backup UI in normal play, copy MammonCity2 Firebase config directly, or create a fake offline online lobby.

Date: 2026-05-26
Observed: After static catalog extraction passed, the next safe step was to lock the home/house-front/travel/three-city navigation contract before touching runtime tabs.
Changed: Added `src/restored/data/location-catalog.js` for `home_inside`, `home_front`, `travel`, `baegeum-city`, `dice-city`, and `seosan-city`. Added `src/restored/ui/location-nav-contract.js` with the planned context-specific actions such as `go_out`, `fast_food`, `labor_office`, city travel, and city-local place actions. Initial restored state now starts with `location.contextId = "home_inside"`, and save/load preserves future location state. Updated docs and restored growth checks to guard these contracts.
Verified: `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, `npm run check`, and `git diff --check` passed. Browser verification reloaded the restored page, clicked the start button, reached the game screen, and reported zero console errors.
Blocked: The visible runtime still uses the old playable shell; location-aware tabs are contracted but not wired to the UI yet.
Next: Adapt the shell/nav rendering to read `location-nav-contract.js`, starting with a reversible home-inside facade.
Do not: Replace the whole restored UI in one patch or add every location action as a permanent global tab.

Date: 2026-05-26
Observed: After the three-city home-start plan was guarded, the next documented bottleneck was static catalog ownership still living in the restored HTML.
Changed: Extracted restored rank, market, asset, and partner archetype data into `src/restored/data/`, rewired `src/restored/state/initial-state.js` to seed state from those catalogs, and changed `baegeum-city-v2-dice.html` to import rank/market/partner catalogs instead of owning those constants. Promoted `seosan-city` into the restored city and place catalogs. Updated restored docs and checks so the new catalogs, `seosan-city`, and HTML no-inline-catalog rule stay guarded.
Verified: `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, and `npm run check` passed. Browser verification reloaded `http://127.0.0.1:4173/baegeum-city-v2-dice.html`, clicked the restored start button, reached the game screen, and reported zero console errors.
Blocked: Runtime navigation is still the old playable shell; the location-aware home/house-front/city shell is planned but not implemented.
Next: Add `src/restored/data/location-catalog.js` and a location-nav contract smoke check before changing bottom navigation behavior.
Do not: Add new rank, asset, market, partner, city, or place data inline in `baegeum-city-v2-dice.html`.

Date: 2026-05-26
Observed: The human shifted the restored build plan toward starting inside the player's home, then expanding through house-front, Baegeum City, Dice City, and Seosan City with context-specific tabs.
Changed: Added `docs/plans/restored-three-city-home-navigation.md`, linked it from `docs/INDEX.md` and `docs/plans/README.md`, updated the restored UI/online roadmap and recomposition plan away from permanent global feature tabs, refreshed the feature-plan template and generator, and strengthened planning checks around `home_inside`, `home_front`, and `seosan-city`. Split the planning-kit checker so the size check no longer warns about a long `main` function.
Verified: `node tools/check-size.cjs`, `node tools/check-restored-ui-online-ranking-chat-roadmap.cjs`, `node tools/check-restored-planning-kit.cjs`, `npm run check`, and `git diff --check` passed. `git diff --check` only reported existing CRLF normalization warnings for touched files.
Blocked: No runtime UI or gameplay changed, so browser verification is not expected for this planning slice.
Next: Keep the next coding step small: extract restored static catalogs, then add a location navigation contract before changing the playable shell.
Do not: Implement the three-city home-start UI directly as more inline buttons in `baegeum-city-v2-dice.html`, and do not turn every place into a permanent bottom tab.

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

Date: 2026-05-27
Observed: The phone ecosystem catalog existed, but `app_store` was still only planned and there was no store screen to show planned apps safely inside the phone.
Changed: Added `src/restored/phone/app-store-view.js`, promoted `app_store` to the smartphone-only live phone registry, wired the restored HTML to create the dynamic store app view, and updated the phone ecosystem/contract checks plus docs. The store renders installed, locked, planned, and online-prep rows without save mutation.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-phone-app-ecosystem.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification confirmed folder phone hides store/futures, smartphone shows store/futures, the Baegeum Store renders installed/planned/online-prep rows, and no captured browser errors were present.
Blocked: News, stock, and futures still render inside `baegeum-city-v2-dice.html`; BaeTalk, Baegeum Gallery, rankings, bank/pay, map, and online lobby remain catalog-only.
Next: Run the phone checks, full `npm run check`, and browser-verify folder-phone versus smartphone store gates; then extract news/stock/futures renderers before adding messenger/community UI.
Do not: Add planned apps to bottom navigation or make optional install state persistent until the save contract owns it.

Date: 2026-05-27
Observed: The live phone registry was separated from bottom navigation, but only the relationship app renderer was extracted. News, stock, and futures still render in the restored HTML, and planned apps such as messenger, app store, and virtual community had no explicit catalog boundary.
Changed: Added `src/restored/phone/phone-app-ecosystem-contract.js`, `docs/plans/restored-phone-app-ecosystem.md`, and `tools/check-restored-phone-app-ecosystem.cjs`. The plan separates live apps from planned app-store candidates and defines BaeTalk-style messenger, Baegeum Store, relationships, Baegeum Gallery-style community, rankings, bank/pay, map, and online lobby boundaries.
Verified: `node tools/check-restored-phone-app-ecosystem.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: No live app-store, messenger, or community UI has been wired yet. Planned apps must not enter the live phone registry until each has a small app view.
Next: Add a small Baegeum Store phone app shell that reads the ecosystem catalog, then extract news/stock/futures renderers before expanding BaeTalk or Baegeum Gallery.
Do not: Add planned apps directly to bottom navigation or the live registry without a view and gate.

Date: 2026-05-27
Observed: Relationship logs were visible in the phone app, but no live action wrote them and legacy modal actions still mutated `p.love` directly.
Changed: Added `src/restored/systems/relationship-event-runtime.js` for walk encounter, interest, call, AI talk, gift, intimacy, marriage, and passive drift events. Wired the restored HTML relationship handlers through `commitRelationshipAction()`, preserved legacy `love` compatibility, kept My Info summary-only, and extended relationship/growth checks plus docs.
Verified: `node tools/check-restored-relationship-contract.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, My Info relationship summary, phone relationship app switching, empty partner/log states, and no captured browser errors.
Blocked: Dedicated date, DM, confession, and inventory/economy-envelope gift surfaces are still pending. Casino, loan, pawnshop, stock, and job reactions remain intentionally disconnected.
Next: Add a deliberate phone date/DM/confession surface that consumes the relationship event runtime before casino/loan/pawnshop reactions.
Do not: Reintroduce direct `p.love` mutation, move the full partner list back into My Info, or let casino/loan/pawnshop handlers mutate relationship state directly.

Date: 2026-05-27
Observed: The phone relationship app could show partner cards from the v2 contract, but it had no visible place for `relationshipLogs`, so the next event slice would have nowhere to land in UI.
Changed: Added `relationshipLogs` to restored initial state and storage merge, expanded `src/restored/phone/relationship-app-view.js` to render recent relationship logs, mounted `phone-relationship-log-list` in the restored HTML, and updated relationship/phone/growth checks plus docs.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-relationship-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, phone relationship app switching, empty partner state, empty relationship-log state, no My Info `partner-list`, and no captured browser errors.
Blocked: No live source event creates relationship logs yet; DM/date/confession surfaces remain pending.
Next: Wire one safe source event, preferably a local job/date event, to create a relationship log before casino, loan, pawnshop, or gift reactions.
Do not: Let casino, loan, pawnshop, stock, or gift handlers directly mutate affection/trust/stability/risk or write private relationship logs without the event boundary.

Date: 2026-05-27
Observed: The phone relationship app still rendered its partner cards inline in `baegeum-city-v2-dice.html` after My Info started reading the v2 relationship contract.
Changed: Added `src/restored/phone/relationship-app-view.js`, delegated `renderRelationshipPhoneApp()` to that renderer, updated the phone/relationship checks, and refreshed the restored relationship/recomposition/UI planning docs.
Verified: `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-relationship-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, My Info relationship summary, no My Info `partner-list`, phone relationship app switching, empty partner state, and no captured browser errors.
Blocked: Relationship logs, DM/date surfaces, and source-event wiring are still pending.
Next: Add relationship log rendering or wire one safe job/date relationship event before casino, loan, pawnshop, or gift reactions.
Do not: Put partner cards back inline in the restored HTML or move the full partner list back into My Info.

Date: 2026-05-27
Observed: The relationship v2 contract existed, but My Info and the phone relationship badge still counted only legacy `isLover` values.
Changed: Added `src/restored/ui/relationship-summary-view.js`, wired My Info to render a compact relationship summary card from the v2 contract, and made the phone relationship badge use the same summary label. Extended the relationship check to guard the summary view and My Info DOM boundary.
Verified: `node tools/check-restored-relationship-contract.cjs`, `node tools/check-restored-player-profile.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, `relationship-summary-card`, no My Info `partner-list`, the phone partner-list still present, and no captured browser errors.
Blocked: Full phone partner-card extraction, relationship logs, and source-event wiring are still pending.
Next: Extract the phone relationship app renderer under `src/restored/phone/`, then connect one safe job/date relationship event.
Do not: Put the full partner list back into My Info or mutate affection/trust/stability/risk directly from casino, stock, loan, pawnshop, gift, or job handlers.

Date: 2026-05-27
Observed: The next documented relationship slice was a pure contract before UI, so the live restored HTML should stay untouched.
Changed: Added `src/restored/systems/relationship-contract.js` with legacy `love` migration, relationship stage inference, affection/trust/stability/risk clamping, confession readiness checks, summary selectors, and relationship log envelopes. Added `tools/check-restored-relationship-contract.cjs`, wired it into `npm run check`, and updated the relationship/recomposition docs.
Verified: `node tools/check-restored-relationship-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: Live My Info and phone relationship UI are not connected to the new contract yet.
Next: Add My Info relationship summary selectors/UI or extract the phone relationship app renderer under `src/restored/phone/`.
Do not: Mutate partner state directly from casino, stock, loan, pawnshop, gift, or job handlers.

Date: 2026-05-27
Observed: The human identified the lover/relationship system as a key next step, but explicitly asked to plan it first instead of implementing everything at once.
Changed: Added `docs/plans/restored-lover-relationship-system.md`, linked it from `docs/INDEX.md` and `docs/plans/README.md`, and guarded it through `tools/check-restored-planning-kit.cjs`. The plan keeps My Info as social/emotional summary tabs, keeps full partner flow inside the phone relationship app, and requires relationship changes to consume events rather than direct casino/stock/loan/pawnshop/job mutations.
Verified: `node tools/check-restored-planning-kit.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: None.
Next: Add a pure `src/restored/systems/relationship-contract.js` with migration, stage, clamp, selector, and relationship-log helpers before UI wiring.
Do not: Put the full partner list back into My Info, mutate partner state from money/gambling handlers, or make AI-generated dialogue a hard dependency.

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
Observed: The human asked to start the restored prototype from inside the home, make the bottom tabs change by location, and keep the phone UI above those tabs instead of as a fixed bottom tab.
Changed: Added location-aware bottom navigation for `home_inside`, `home_front`, transit, and the initial three cities. The playable restored HTML now starts from home actions, moves outside to fast food/labor/convenience/bus/home actions, opens city routes from the bus stop, and exposes the phone through a floating dock. Added `src/restored/ui/place-surface-copy.js` so place copy stays outside the HTML shell, and updated shell/growth/phone checks to enforce phone-dock plus location-nav wiring.
Verified: `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, home tabs, outside tabs, bus stop city tabs, Dice City tabs, and no runtime errors beyond the existing favicon 404/Tailwind CDN warning.
Blocked: None.
Next: Refine the visual design of the home/place surfaces and begin moving real actions into the new place shells through ledger/action contracts.
Do not: Reintroduce fixed bottom tabs for phone/news/stock/futures, or attach new economy effects to place buttons without the documented ledger/action flow.

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
