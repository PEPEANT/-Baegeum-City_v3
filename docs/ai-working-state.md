# AI Working State

Date: 2026-05-28
Observed: The next Singularity Race online slice needed a real-provider flow boundary before attaching any WebSocket/Firebase SDK, so the client cannot hand-roll join/history/snapshot handling per provider.
Changed: Added `src/restored/online/marathon-server-provider-adapter.js` as a pure state machine for `hello -> hello_result -> join_request -> join_result -> chat_history -> state_snapshot`, requiring server-origin replay and server-owned snapshots. Wired the WebSocket dev server validation through that provider flow and changed dev `hello_result` envelopes to come from `server:ws-dev` with `targetClientId` metadata. Documented the provider adapter in the marathon plan and restored module README.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/smoke-singularity-race-server-load.cjs`, and `node tools/check-size.cjs` passed.
Blocked: This still does not open a public socket or Firebase connection. Real online still needs an actual backend process/provider implementation, auth, persistence, moderation, and reconnect storage.
Next: Add reconnect-grace handling around the provider adapter: reconnect should replay latest server room state, recent chat history, and the runner's authoritative snapshot before accepting new input.
Do not: Put API keys, Firebase config secrets, or provider-specific SDK calls into the generic contract layer.

Date: 2026-05-28
Observed: Singularity Race could enter a race and the server-load/full-race smokes proved 30 runners can finish, but the player-facing race screen did not yet have one final progression closure shared by local finish preview and connected server snapshots.
Changed: Added a minimal `race-result-panel` inside the clean in-game surface, added `finalizeRaceResult()` so local `race_finalized` rehearsal and connected `state_snapshot` finish rows share the same result path, stopped movement/skill controls after a result is shown, rendered the result layer without restoring the old HUD, and added the progression smoke to `npm run check`.
Verified: `node tools/smoke-singularity-race-progression.cjs`, `node tools/smoke-singularity-race-server-load.cjs`, `node tools/smoke-singularity-race-combat-full-race.cjs`, `node tools/check-restored-marathon-contract.cjs`, `git diff --check -- singularity-race.html tools/smoke-singularity-race-progression.cjs package.json`, and `npm.cmd run check` passed. Browser verification on `http://127.0.0.1:4173/singularity-race.html?devOnline=1&adminLaunch=1&resetProfile=1&t=final` confirmed the race-only screen loads with the three bottom controls, minimap, mobile controls, and no old lobby/HUD panels at both desktop and 390px mobile widths.
Blocked: Real public completion still needs backend-owned `race_finalized`, authenticated host start, reconnect-safe room snapshots, and server reward/ranking writes.
Next: Attach a real provider adapter behind the server transport contract, then move attack/skill/checkpoint/respawn/final ranking handlers fully server-side.
Do not: Treat the result panel as authority, or let clients publish final positions, rewards, rankings, or finish times.

Date: 2026-05-28
Observed: The next Singularity Race online step needed server-owned role/session assignment and chat history replay before a real WebSocket/Firebase provider is attached.
Changed: Added `src/restored/online/marathon-server-session-contract.js` for server-owned player/spectator/host/admin sessions, late-runner-to-spectator conversion, packet permission checks, trusted host/admin chat metadata, and channel-filtered chat replay. Wired the WebSocket-shaped dev server mock through that contract so spectator input is rejected by session permissions, host chat ignores spoofed sender metadata, late runner joins convert to spectators, and spectator clients can replay approved room chat. Added `chat_history` to the server transport packet vocabulary.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and `node tools/smoke-singularity-race-server-load.cjs` passed. The server-load smoke still finished 30 runners with 426 snapshots, 1881.6kbps server egress, a bounded 720-packet log, and 85 coalesced duplicate inputs.
Blocked: This is still a local contract/mock boundary. Real public online still needs an actual backend process, authenticated host/admin identity, server-persisted chat storage, moderation, reconnect replay, and real transport delivery.
Next: Attach the real provider adapter behind the existing server transport contract, starting with `hello -> join -> chat_history -> state_snapshot` before any public matchmaking is exposed.
Do not: Let client-supplied sender ids, sender roles, runner positions, host commands, or chat visibility decisions become authoritative.

Conclusion: the human has pivoted the active playable entry to a Dice City-derived single-file **배금도시 V2** restore. The previous modular city-core, multimap, ledger, and editor work remains preserved as reference/source material, but the current player-facing start is the restored economy-clicker HTML.

Current verified building shell presets: baegeum-city uses the `도시` infrastructure shells plus `building-shop-shell`, `building-home-shell`, and `building-civic-shell`; dice-city uses `building-casino-shell`, `building-alley-shell`, `building-loan-shell`, and `building-motel-shell`.
Current verified horse-racing interior sections: `horse-scoreboard`, `horse-track`, `horse-grandstand`, `horse-betting-station`, and `exchange-atm`.

Date: 2026-05-28
Observed: Singularity Race needed a spectator path that can enter during an active room, chat with players/host, and watch runners without receiving host or runner authority.
Changed: Added a visible spectator entry on the player page, allowed spectators to see/send shared room chat while keeping the admin channel hidden, routed spectator chat with spectator sender metadata, hid movement controls for spectator mode, blocked spectator movement/attack/skill packets, filtered spectator snapshots out of runner rendering, and rejected spectator/admin movement input in the server-owned state contract.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/restored/online/marathon-channel-adapter.js src/restored/online/marathon-dev-chat-transport.js src/restored/online/marathon-server-state-contract.js src/restored/games/singularity-race-dev-online.js`, and `npm.cmd run check` passed. Browser verification on `http://127.0.0.1:4173/singularity-race.html?devOnline=1&resetProfile=1` confirmed spectator entry lands on `race`, the shell has `is-spectator`, movement controls are hidden, chat opens, spectator room chat sends and persists in the message list, and console errors were zero. A second browser check confirmed the host/admin page can send a room-channel message and a spectator can see it in the race room chat.
Blocked: Real public spectator mode still needs server-authenticated role assignment, server-owned chat history/replay, moderation, and host-owned spectator capacity policy.
Next: When the real transport is attached, make late runner joins become spectator joins server-side and send spectator replay from authoritative room snapshots rather than local dev state.
Do not: Let spectator clients publish runner inputs or host commands, or rely on client-side channel filtering as the public security boundary.

Date: 2026-05-28
Observed: Singularity Race already separated player, spectator, and admin channels, but room capacity still only counted 30 runners and late joins were not explicitly routed into spectator policy.
Changed: Added separate marathon spectator capacity to the core room contract, allowed spectator mid-join during countdown/racing while blocking late runner joins, exposed spectator counts in dev room summaries, added a small `marathon-room-policy` host setting module, and added Korean spectator-capacity controls to the dev host page.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm.cmd run check`, `git diff --check` on the touched files, and browser verification on `http://127.0.0.1:4173/singularity-race-admin.html?devOnline=1` passed. Browser verified the `관전자 정원` controls, 0/32 default, 50명 change, stored host policy, and reset back to 32명 with no console errors.
Blocked: Real public spectator entry still needs server-authenticated host policy, server room snapshots, and real transport-backed join history.
Next: Add a real spectator join surface after the lobby/queue flow, backed by the same participant type and `maxSpectators` server policy, without letting spectators enter runner movement state.
Do not: Let late entrants become runners after countdown/racing, or store public spectator limits only in client localStorage once real online is attached.

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
47. `docs/plans/restored-life-minigame-system.md` and `src/restored/jobs/life-job-contract.js` now own the first life-job minigame lane: convenience-store and fast-food deterministic shift scoring, won wage envelopes, condition effects, relationship hooks, and optional inventory bonuses without live HTML mutation.
48. `src/restored/jobs/life-job-place-view.js` and `src/restored/jobs/life-job-result-application.js` now connect the first live place panels for convenience-store and fast-food shifts. The restored HTML only mounts the panel and calls `completeLifeJobShift`; wages, condition changes, inventory grants, and relationship hooks still flow through restored job envelopes.
49. `src/restored/jobs/life-job-catalog.js` now owns the starter job catalog, keeping `src/restored/jobs/life-job-contract.js` under the file-size gate. `job:labor-office` is the third starter life-job contract and uses the same live place adapter through the existing `labor_office` place action. It pays more than fast-food, costs more energy, and can grant `work_gloves` as a high-grade inventory reward.
50. `src/restored/career/study-career-contract.js` now owns the first study-gated career lane: library self-study, university night classes, Baegeum office qualification, company shift wages, and promotion state. The restored HTML mounts it only inside Baegeum City job places through `completeStudyCareerAction()`.
51. `src/restored/career/study-career-summary-view.js` now owns the My Info education/career summary card. My Info shows credits, study hours, intelligence, current company level, next level, and qualification/promotion progress without adding new action buttons.
52. Company work is no longer a single generic button. `study-career-contract.js` defines `documents`, `overtime-report`, and `team-support` company shift presets, and the Baegeum City job surface renders those choices without duplicating wage or promotion formulas in HTML.
53. `src/restored/phone/stock-app-view.js` now renders the live phone stock app from the Baegeum Electronics market snapshot. The visible stock app is DP-only and no longer renders the legacy NASDAQ/TSLA/AAPL/NVDA table.
54. `src/restored/systems/market-order-application.js` now owns the local Baegeum Electronics one-share order application path. The live stock app can call `tradeRestoredBaegeumStock('buy'|'sell')`, update `markets.portfolio.holdings`, preserve orders through storage, and reflect holdings in total asset selectors without reviving legacy stock rows.
55. `src/restored/career/study-career-place-view.js` now guards locked company-shift toast buttons against nested double-quote `onclick` breakage. Locked company actions render safe single-quoted `showToast(...)` calls and the study/career smoke check covers the regression.
56. `src/restored/systems/news-cycle-contract.js` now owns the realistic-looking fictional phone news cycle. The live restored HTML creates cycle, crash, and AI-flash news through that contract, and `src/restored/phone/news-app-view.js` renders source-labeled article cards instead of flat legacy messages.
57. Life-job and study/career money effects now use `currency: "WON"` and render wages/tuition as `원`. DPA remains reserved for Dice City exchange/casino token flows.
58. Starter labor surfaces now use Korean job/task copy and preview expected won wage, energy, mental, time, and reputation effects before the player chooses a work preset. News copy is also guarded so ordinary work is described as won/cash income, not DP/DPA income.
59. The Baegeum job-street surface now has building-entry buttons for starter work, study, and company buildings. The life-job catalog covers convenience store, fast-food, labor office, PC room, flyer, delivery, parking, car wash, cleaning, factory, port, and market helper work, while `enterRestoredPlaceBuilding(actionId)` opens the selected building panel without adding bottom tabs.
60. Life-job completions now write local `jobHistory` and `jobStats` state. My Info renders a `life-job-history-card` with total shifts, total won income, latest job result, current same-job streak, and recent completed shifts.
61. Fixed part-time work now has a first local contract slice. Job panels expose `고정 알바 등록`, `fixedJobContract` stores one active job with reliability/attendance/streak/fixed-job income, matching shifts update it through the life-job result application, and My Info renders the fixed-job summary inside `life-job-history-card`.
62. Marathon stadium now has a first online-ready restored contract and local 2D preview. `src/restored/games/marathon-contract.js` owns 30-runner caps, checkpoints, ranking, result envelopes, and online packet vocabulary; `src/restored/games/marathon-stadium-view.js` mounts a local player plus 29 bot runners from the Baegeum street surface.
63. `특이점레이스` now has a separate public local lobby entry at `singularity-race.html`. It is not the Baegeum City page; it shows 30 runner slots, local readiness, lobby chat, and Drawing World-derived skin cards through `src/skins/drawing-world-adapter.js`.
64. Singularity Race now has a dev-only connected marathon room adapter in `src/restored/online/marathon-room-adapter.js`. The normal lobby remains local; `?devOnline=1` opens the connected-only gate, and the UI switches to `DEV ROOM` only after `join_result ok`.
65. Singularity Race now has dev-only pre-created lobby, room, spectator, admin, and notice chat channels in `src/restored/online/marathon-channel-adapter.js`. The public lobby and separate `singularity-race-admin.html?devOnline=1` page share the local dev chat log under `singularity-race:chat:v1`.
66. Restored assets now have a promoted `assets/restored/` folder structure for audio, images, source material, manifest batches, shared characters, and Singularity Race-specific art. Runtime use still goes through `src/restored/assets/asset-manifest.js`, not raw paths.
67. Singularity Race server transport now has a WebSocket/Firebase-style config boundary and a server-transport-backed room adapter shape. It still does not open public online by default; a connected transport snapshot plus server-provided room list must be injected before the connected lobby opens.
68. Singularity Race now has a local WebSocket-shaped dev server mock in `src/restored/online/marathon-websocket-dev-server-mock.js`. It rehearses connected transport, room list, join result, client packet ingest, server snapshot creation, and packet pressure limiting without opening a public port.
69. Singularity Race now uses `src/restored/games/marathon-trail-geometry.js` for the public course shape: one shared log-curve 2D trail, five save points, SVG path generation, pointer-to-progress estimation, and matching marathon-distance checkpoints. `singularity-race.html` renders all available runners on that single trail instead of separate horizontal lanes.
70. The standalone Singularity Race lobby now has local-only race feedback on the trail: a player focus ring, progress/next-save pill, checkpoint/skill/hit/respawn/finish cue labels, and reset behavior when filling the 30-runner local practice slots.
71. Singularity Race local practice now has a deterministic bot pack and compact standings strip. Local bots advance after practice starts, runner slots show current progress, and the standings strip keeps the leaders plus YOU visible without changing server authority.
72. Singularity Race admin now has a direct dev game entry. The lobby still exposes `admin-page-link`, and `singularity-race-admin.html?devOnline=1` now exposes `admin-direct-game-link` to `singularity-race.html?devOnline=1&adminLaunch=1`; that query makes the lobby auto-join the dev room and show `DEV ROOM`.
73. Singularity Race admin now has a dev room packet monitor. `singularity-race-admin.html?devOnline=1` imports the dev room transport, reads the room-scoped relay log without writing packets, and shows packet count, latest packet source, and relay guard state beside the separated admin/chat channels.
74. Singularity Race local practice now starts with all 30 runners on one shared rail. The local preview uses single-rail collision spacing so runners bump and stall instead of visually passing through each other, and `T` focuses the current chat input while `Enter` still submits through the channel transport.
75. Singularity Race now renders the lobby trail inside a large camera-followed track world. The SVG rail uses non-scaling strokes for consistent width, runner sprites no longer sit on dark translucent cards, and the skin picker exposes all playable presets with `baegeum-hood`, `gpichan`, `robot`, and `kaguya` first.
76. Singularity Race now uses a wider two-column lobby layout, a `7600x2600` track world, a thicker visible rail, same-progress side-by-side start formation, smoother 60ms local preview ticks, persistent runner DOM nodes, and slower local pacing aimed at an 8-10 minute party race.
77. Singularity Race local practice now uses an extra-wide 5x-style road surface, keeps all 30 runners in one same-progress start row, gates the race behind a local countdown, and replaces hard runner blocking with local-only soft pass pressure.
78. Singularity Race track camera now centers directly on the player in the large `7600x2600` world instead of anchoring the player near the left edge.
79. Singularity Race now uses a free 2D start paddock instead of a one-row start. Runners own `progress` plus `laneOffsetPx`, the start gate stays closed until a dev admin 10-second countdown signal, and the gate disappears on `GO`.
80. Singularity Race staging bots now request their own render pass when their paddock simulation moves, so the visible bot pack no longer appears frozen when the local player stops moving before the admin countdown.
81. Singularity Race player movement now separates staging forward speed from race forward speed. `Shift` visibly boosts forward progress, while `W/S` lateral movement is slightly slower so moving down no longer reads like the real speed control.
82. Singularity Race now has an anti-teleport display guard for bots and future remote players. Netcode owns the visual step/snap policy, and the lobby smooths non-player runner coordinates instead of drawing every target correction instantly.
83. Singularity Race anti-teleport follow-up now cleans stale runner visual caches when runner DOM nodes disappear and guards the smoothing/HUD tokens in the marathon contract check.
84. Singularity Race local collision now uses soft body pressure instead of ghost pass-through: close runners get speed drag, a collision glow, a tiny lane push, and a tiny forward/back separation while staying smooth.
85. Singularity Race road-wall access now uses a wider lane clamp so runners can move close to the visible road walls instead of stopping at a transparent inner buffer.
86. Singularity Race runner names now live inside each runner avatar as a foot-level nameplate, keeping the head area free for future HP bars and preventing sprint/interpolation from visually separating names from sprites.
87. Singularity Race dev online rehearsal now marks connected `state_snapshot` packets as server-owned and carries snapshot id, server tick/snapshot cadence, ping sample, and reconciliation metadata. This is still dev-only and does not expose public matchmaking.
88. Singularity Race admin is now a simplified future host/spectator camera page: Korean visible copy, room list, direct game/lobby links, whole-course camera, per-player watch list, countdown control, and separated chat channels instead of raw packet metrics.
89. Singularity Race player entry now follows a simple first-use loop: nickname plus skin selection, compact room list, room waiting view, then race screen. Dev protocol, packet, netcode, raw room id, and server-lock labels are hidden from normal players unless `?debug=1` is used.
90. Singularity Race race screen now isolates in-game UI: after room ready/game entry, the top lobby status, room waiting sidebar, and chat sidebar are hidden so the stadium surface is not overlapped by lobby panels.
91. Singularity Race lobby now shows only a simple room list before room entry. Lobby chat, participant count, ready count, quick entry, and notice/debug rows are hidden from the lobby screen; those surfaces belong to the room, race, admin, or debug views.
92. Singularity Race room waiting is now a simple `대기열`: normal players see runner slots, `맵 미리보기`, and chat only. Top status metrics, participant/ready counters, ready button, duplicate room card, channel tabs, badges, and explanatory copy are hidden from the queue screen.
93. Singularity Race now separates `mapPreview` from `race`. The normal player path is `profile -> lobby -> queue -> mapPreview -> queue`; the map preview button no longer starts the race, and admin/direct start remains the path into `race`.
94. Singularity Race player screen ids and short flow copy now live in `src/restored/games/singularity-race-flow.js`. The player page imports those constants/helpers so `profile`, `lobby`, `queue`, `mapPreview`, and `race` do not drift back into duplicated string checks.
95. Singularity Race runner display helpers now live in `src/restored/games/singularity-race-runner-view.js`. Runner avatars, queue slots, standings rows, checkpoint dots, action packet rows, skill labels, and action status labels are no longer hand-built inline in `singularity-race.html`.
96. Singularity Race track effect helpers now live in `src/restored/games/singularity-race-track.js`. The player focus ring, start gate, countdown badge, progress pill, and short track cue labels are separated from movement, collision, and camera math.
97. Singularity Race player script is split along the requested boundaries: `singularity-race-flow.js` for screen state/copy, `singularity-race-queue.js` for queue slots/chat rows, `singularity-race-track.js` for track effects, `singularity-race-local-sim.js` for local bots/start paddock, and `singularity-race-dev-online.js` for dev relay wrappers. `singularity-race.html` remains the controller shell.
98. Singularity Race race-control signaling now lives in `src/restored/games/singularity-race-control.js`. The player page and host page share the same dev-only start-countdown command shape, local storage key, broadcast channel name, and race-control phase labels.
99. Singularity Race lobby/queue/chat/track styling now follows a Drawing World-inspired paper-grid direction: light panels, compact chat, pale stadium field, and muted green-gray rails instead of black outer curbs.
100. Singularity Race skin picker now keeps the requested named set in the normal profile flow: `kaguya`, `singularity-fan`, `robot`, `gpichan`, `pepe-runner`, `moderator-armband`, `yalrkun`, `lakers-wile`, `sam-altman`, and `demis-hassabis`; casino/general-citizen presets remain excluded.

101. Singularity Race first-use profile screen now keeps the 12-skin picker compact on phone widths by using a denser mobile skin-card grid instead of a long one-column stack.
102. Singularity Race map preview is now a real whole-course overview: it hides runner/HUD overlays, disables the player-follow camera, and fits the full trail/save-point/finish schematic into the preview panel.
103. Singularity Race race screen is now stripped down to the stadium surface only while the in-game UI is being redesigned: lobby chrome, track header, bottom HUD cards, checkpoint strip, standings, packet rails, progress pill, map caption, and start-gate label are hidden in `race`.
104. Singularity Race phone-width race screen now has exactly three bottom controls over the clean stadium surface: `대기열 보기/닫기`, `채팅창 열기/닫기`, and disabled `플레이 시작 / 관리자 대기중`; queue and chat open as mutually exclusive overlays.
105. Singularity Race race screen now has PC-and-mobile auxiliary controls: a left circular `W/A/S/D` pad and right-side `스킬(E)` plus `채팅(T)` buttons. The touch/mouse pad feeds the same movement key state as the keyboard, and queue/chat overlays hide the movement controls while open.
106. Singularity Race local race progression now reaches the actual finish clamp at 100% instead of stopping at 96%. Local finish only rehearses a server-owned `race_finalized` preview packet, while `tools/smoke-singularity-race-progression.cjs` checks start-to-finish reachability, Shift+D sprint input, 30-runner bandwidth budget, degraded ping lane reduction, packet pressure blocking, anti-teleport smoothing, and bot movement while the player is stopped.
107. Singularity Race now has a first server-owned movement-state contract. `src/restored/online/marathon-server-state-contract.js` applies accepted `input_update` envelopes to server room participants, rejects stale input, prevents lateral-only input from increasing progress, stamps finish time, and emits server-owned runner snapshots. The WebSocket-shaped dev mock now starts a server-owned race, applies input during `racing`, and includes `movementAuthority: "server"` in snapshots.
108. Singularity Race connected display now consumes server-owned `state_snapshot` rows. `src/restored/games/singularity-race-dev-online.js` merges snapshot participants into runner display state, and `singularity-race.html` applies the newest snapshot to progress, lane offset, server sequence, race phase, standings, and camera rendering.
109. Singularity Race dev chat history now keeps the latest 500 local messages across lobby/race/admin refreshes. This is still development-only local history; public online chat must become server-owned, channel-scoped, paginated, and moderation-aware.
110. Singularity Race map preview now clears runner, HUD, gate, and minimap nodes at render time and sizes the track world to the preview panel, while the race screen locks to a full-viewport stadium surface with only in-game overlays and a top-right minimap.
111. Singularity Race race camera now has a first `soft-follow` road-rotation mode. It keeps the start straight stable, rotates the track world after the curve begins, counter-rotates runner sprites so names stay upright, and uses inverse camera math for mouse attack targeting.
112. Singularity Race camera math now lives in `src/restored/games/singularity-race-camera.js`, with `tools/smoke-singularity-race-camera.cjs` checking soft-follow rotation, fixed mode, counter-rotation, and inverse screen-to-track mapping.
113. Singularity Race hot movement loop now uses a lightweight `renderActionPreviewFrame()` path. Track rendering stays frequent, while HUD, standings, queue slots, chat, skin cards, channel tabs, and debug rails avoid full redraws during movement; the minimap now caches static SVG and moves only the player dot.
114. Singularity Race character rewards now have a future D/C/B/A/S grade layer on top of the existing rarity labels, and `tools/smoke-singularity-race-combat-full-race.cjs` guards a 30-runner start-to-finish race with checkpoint rewards, skills, mouse attacks, runner down, checkpoint respawn, and all runners finishing.
115. Singularity Race now has a 30-runner server-load smoke around the WebSocket-shaped dev mock. `tools/smoke-singularity-race-server-load.cjs` checks the 30-player packet budget, degraded ping lane choice, all 30 clients joining, server-owned snapshots, bounded packet logs, and every runner finishing on a scaled load-test course.
116. Singularity Race server cadence now has a dedicated loop contract. `src/restored/online/marathon-server-loop-contract.js` fixes the 20Hz server tick, 10Hz snapshot cadence, catch-up tick cap, and latest-input-per-participant coalescing so the future public transport does not apply noisy client frames directly.
117. Singularity Race now has a WebSocket-shaped dev loop harness. `src/restored/online/marathon-websocket-dev-loop.js` queues input envelopes, applies the 20Hz server loop to the dev mock, coalesces duplicate inputs inside a tick, emits due server-owned snapshots, and returns a stable next loop state.
118. Singularity Race player page now uses the dev loop harness behind `?devOnline=1`. Connected room join creates a same-room WebSocket-shaped dev mock with one local runner plus bot clients, starts it when the admin countdown opens, sends server-loop input internally, and renders periodic server-owned `state_snapshot` rows through the existing relay.
119. Singularity Race server loop now drops stale tick/snapshot backlog and initializes the in-page dev loop from the current browser time, preventing paused-tab or first-load `RangeError: Invalid array length` snapshot bursts.

Date: 2026-05-28
Observed: The reusable dev loop harness existed, but the player page still only displayed relay packets and did not run a deterministic server snapshot feed after connected join.
Changed: Wired `singularity-race.html` to create a same-room WebSocket-shaped dev server mock behind `?devOnline=1`, join 30 dev clients, emit an initial 30-runner server snapshot, start the dev server race when countdown finishes, and advance `advanceConnectedDevSnapshotFeed()` from the existing preview loop. The page now publishes server-owned snapshots into the dev room relay while keeping high-frequency player/bot inputs inside the server loop.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `node tools/smoke-singularity-race-server-load.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP checks returned 200 for `singularity-race.html?devOnline=1`, `singularity-race.html?devOnline=1&adminLaunch=1`, and `singularity-race-admin.html?devOnline=1`. Browser verification later reproduced and fixed an initial `RangeError: Invalid array length`; desktop and mobile reloads of `singularity-race.html?devOnline=1&adminLaunch=1` now report zero console errors.
Blocked: Real public online remains unavailable until a WebSocket/Firebase provider, backend room process, server chat persistence, auth, and moderation are chosen.
Next: Replace the dev relay with the real transport adapter boundary, keeping all position, attack, reward, respawn, finish, and ranking authority server-owned.
Do not: Store 30-runner high-frequency input packets in the relay log or render from local connected positions instead of server snapshots.

Date: 2026-05-28
Observed: The server cadence contract existed, but the WebSocket-shaped dev mock still needed a reusable loop harness so page/dev transport work can consume the same input queue and snapshot cadence.
Changed: Added `src/restored/online/marathon-websocket-dev-loop.js`, wired it into the marathon contract check, and refactored `tools/smoke-singularity-race-server-load.cjs` to drive 30 runners through that harness instead of duplicating the tick/snapshot loop inside the smoke.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/smoke-singularity-race-server-load.cjs`, `node tools/check-size.cjs`, `git diff --check -- src/restored/online/marathon-websocket-dev-loop.js tools/check-restored-marathon-contract.cjs tools/smoke-singularity-race-server-load.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. The load smoke still reports 30 runners, 426 snapshots, 42600ms scaled finish time, 1881.6kbps server egress budget, 720 bounded packets, and 85 coalesced duplicate inputs.
Blocked: The player page still uses the local relay path for visible packets; the next slice should connect this harness to a deterministic in-page dev snapshot feed.
Next: Run the full project check, then wire the player page connected preview to consume periodic server-owned snapshots from the dev loop harness.
Do not: Recreate ad hoc tick loops in page code or tie server snapshot emission to render frequency.

Date: 2026-05-28
Observed: The 30-runner load smoke existed, but it was still coarse at one accepted input per second. A real connected room needs explicit server cadence so lag mitigation does not depend on browser render timing.
Changed: Added `src/restored/online/marathon-server-loop-contract.js` for 20Hz tick planning, 10Hz snapshot planning, catch-up tick caps, and input coalescing. Wired the loop contract into `tools/check-restored-marathon-contract.cjs` and changed `tools/smoke-singularity-race-server-load.cjs` to run a 20Hz input loop with 10Hz server snapshots, duplicate-input coalescing, and a bounded packet log.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/smoke-singularity-race-server-load.cjs`, `node tools/check-size.cjs`, `git diff --check -- src/restored/online/marathon-server-loop-contract.js tools/check-restored-marathon-contract.cjs tools/smoke-singularity-race-server-load.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md package.json`, and `npm.cmd run check` passed. The 20Hz/10Hz load smoke reported 30 runners, 426 snapshots, 42600ms scaled finish time, 1881.6kbps server egress budget, 720 bounded packets, and 85 coalesced duplicate inputs.
Blocked: This is still a deterministic Node smoke, not real browser FPS or public network soak testing.
Next: Run the full check, then the next online slice should use this loop as the basis for a real periodic server snapshot transport path.
Do not: Tie server ticks to `requestAnimationFrame`, emit snapshots every render frame, or apply every duplicate client input directly.

Date: 2026-05-28
Observed: The next online-readiness risk was whether the WebSocket-shaped dev mock could carry a full 30-runner room through server-owned inputs and snapshots without packet pressure or packet-log growth becoming the bottleneck.
Changed: Added `tools/smoke-singularity-race-server-load.cjs` and wired it into `npm run check`. The smoke connects and joins 30 clients, starts a server-owned room, advances every runner from start to finish through accepted `input_update` packets, emits periodic `state_snapshot` packets, checks the documented 30-runner bandwidth budget, checks degraded ping lane selection, and verifies the dev server packet log stays bounded.
Verified: `node tools/smoke-singularity-race-server-load.cjs`, `node tools/check-size.cjs`, `git diff --check -- tools/smoke-singularity-race-server-load.cjs package.json docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. The load smoke reported 30 runners, 87 snapshots, 174000ms scaled finish time, 1881.6kbps server egress budget, and a bounded 240-packet dev log.
Blocked: This is still a deterministic scaled load smoke, not real browser FPS profiling or public network soak testing. The actual public server still needs a real transport loop and multi-client runtime profiling.
Next: Keep public-online work on the server snapshot loop/reconciliation path, then add an automated browser FPS/layout check once browser automation is available again.
Do not: Treat local dev mock finish times, local packet logs, or client-originated attack/skill packets as public race authority.

Date: 2026-05-28
Observed: The next risk was not another visual pass, but whether the current marathon contracts can survive future 30-runner combat, checkpoint skill rewards, and D-to-S character grades without causing finish or respawn regressions.
Changed: Added `RESTORED_MARATHON_CHARACTER_GRADES`, grade-gated checkpoint reward pools, and D/C/B/A/S validation to `src/restored/games/marathon-character-skill-contract.js`. Added `tools/smoke-singularity-race-combat-full-race.cjs` and wired it into `npm run check` so attack hits, down/respawn, skill usage, checkpoint rewards, and 30-runner finish reachability stay covered.
Verified: `node tools/smoke-singularity-race-combat-full-race.cjs`, `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- src/restored/games/marathon-character-skill-contract.js tools/smoke-singularity-race-combat-full-race.cjs package.json docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP checks returned 200 for `singularity-race.html?devOnline=1` and `singularity-race-admin.html?devOnline=1`.
Blocked: This is still deterministic contract smoke testing, not real 30-client browser or server load testing. Public online still needs server-owned attack, skill, reward, respawn, finish, ping, and reconciliation.
Next: Run the full `npm.cmd run check`, then keep the next optimization focused on a server snapshot loop/load harness rather than adding more UI.
Do not: Make D/S rewards, attack hits, skill charge use, respawn points, or finish order client-authoritative in public online.

Date: 2026-05-28
Observed: The 30-runner progression and netcode smoke checks passed, but the local 60 ms movement loop still called `renderAll()`, which can redraw chat, skins, slots, standings, and debug UI on every movement tick.
Changed: Added race render budget constants and `renderActionPreviewFrame()` to keep the hot path focused on track/runners while throttling HUD, standings, and queue slots. Cached the minimap static SVG so only the player dot moves during race frames. Added `tools/smoke-singularity-race-render-budget.cjs` and wired it into `npm run check`.
Verified: `node tools/smoke-singularity-race-render-budget.cjs`, `node tools/smoke-singularity-race-progression.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/smoke-singularity-race-render-budget.cjs package.json docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP check returned 200 and served the render-budget tokens for `singularity-race.html?devOnline=1&adminLaunch=1`.
Blocked: Real FPS/pixel QA remains blocked by the in-app browser Windows sandbox setup failure, so this is static/runtime-smoke confidence rather than captured-device profiling.
Next: Add D/C/B/A/S character grade catalog and a 30-runner attack/skill/down/respawn full-race smoke after the render-budget optimization is fully checked.
Do not: Put `renderAll()` back into the hot movement loop or make client-side attack/skill decisions authoritative for public online.

Date: 2026-05-28
Observed: The first road-follow camera slice worked but left rotation and inverse click math embedded inside `singularity-race.html`, increasing the chance of future camera/input spaghetti.
Changed: Added `src/restored/games/singularity-race-camera.js` for anchored race camera creation, soft-follow/fixed/road-follow target rotation, smoothing, and inverse screen-to-track mapping. Updated `singularity-race.html` to consume that module and added `tools/smoke-singularity-race-camera.cjs` to the full `npm run check` chain.
Verified: `node tools/smoke-singularity-race-camera.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-marathon-contract.cjs`, `git diff --check -- singularity-race.html src/restored/games/singularity-race-camera.js tools/smoke-singularity-race-camera.cjs package.json docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP check returned 200 for `singularity-race.html?devOnline=1&adminLaunch=1`.
Blocked: Browser screenshot/play QA remains blocked by the in-app browser Windows sandbox setup failure.
Next: Run the full project check, then manually reload the race page to feel-test camera rotation on the curve.
Do not: Put camera rotation math back into the HTML controller or rotate UI overlays with the track world.

Date: 2026-05-28
Observed: After the clean map-preview and in-game UI split, the next documented slice was the curved-track camera so the vertical finish section feels like the road is turning under the player.
Changed: Added `TRACK_CAMERA_MODE = "soft-follow"` to `singularity-race.html`, with tangent-based road rotation, per-frame smoothing/clamping, runner counter-rotation, full-viewport anchored race camera, and inverse screen-to-world coordinate conversion for mouse attacks.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP check returned 200 for `singularity-race.html?devOnline=1&adminLaunch=1`.
Blocked: Browser screenshot/play QA is still blocked by the in-app browser Windows sandbox setup failure, so the exact visual feel of the rotation still needs manual reload/testing.
Next: Run the full project check and HTTP page checks, then manually test the curve segment when browser control is available.
Do not: Rotate the UI overlays with the track world, or trust client-side camera math as online authority.

Date: 2026-05-28
Observed: The human clarified that map preview must show the whole map, not the character-follow camera, and that in-game must be only the game surface plus chat/mobile controls/minimap.
Changed: Hardened `singularity-race.html` so `mapPreview` renders no runners, start gate, progress pill, HUD, or minimap and uses preview-sized track world dimensions. The `race` screen now locks the page to a full viewport, removes the panel border/header/card layout from the play surface, and adds a top-right route minimap while keeping queue/chat/mobile controls as overlays.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html`, and `npm.cmd run check` passed. HTTP checks returned 200 for `singularity-race.html?devOnline=1`, `singularity-race.html?devOnline=1&adminLaunch=1`, and `singularity-race-admin.html?devOnline=1`; served HTML includes the new minimap and preview-size guards. Browser automation could not attach because the in-app browser setup failed twice with the same Windows sandbox spawn error.
Blocked: Visual browser screenshot QA is still blocked by the local browser automation failure; manual reload in the in-app browser is needed for pixel confirmation.
Next: Reload the player page and confirm `mapPreview` shows the whole route, then start the road-follow camera rotation slice after pointer/attack coordinate math is planned.
Do not: Let map preview reuse the player-follow camera, or put old status cards back onto the race screen.

Date: 2026-05-28
Observed: The human asked for chat records to keep remaining, and for the next real-online plan plus a road-follow camera plan for the curved track segment.
Changed: Raised Singularity Race dev chat retention to 500 messages in the chat transport, player page, and admin page; added a contract guard for latest-500 retention; documented real-online readiness blockers and the future curve-follow camera mode in the marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html singularity-race-admin.html src/restored/online/marathon-dev-chat-transport.js docs/plans/restored-marathon-stadium.md src/restored/README.md docs/ai-working-state.md`, and `npm.cmd run check` passed. HTTP checks returned 200 for `singularity-race.html?devOnline=1&adminLaunch=1` and `singularity-race-admin.html?devOnline=1`, with `messageLimit: 500` and the dev chat transport present on both pages.
Blocked: Camera rotation is planned but not yet implemented because it changes pointer-to-track math and needs visual QA. Public online is still blocked on a real WebSocket/Firebase transport and server-owned chat/state persistence.
Next: Verify chat history retention checks, then add the periodic server snapshot loop before implementing rotated camera rendering.
Do not: Treat local dev chat history as public persistence, rotate UI overlays with the track world, or let clients author authoritative race state.

Date: 2026-05-28
Observed: The server-owned movement contract existed, but connected race rendering still treated snapshots mostly as relay/debug packets.
Changed: Added `mergeSingularityServerSnapshotRunners()` to the dev-online helper module and wired `singularity-race.html` to apply initial and relayed `state_snapshot` packets into the connected runner display path.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/smoke-singularity-race-server-state.cjs`, and `node tools/smoke-singularity-race-progression.cjs` passed.
Blocked: The page still uses the dev room relay for visible connected packets; a real WebSocket/Firebase provider is not attached yet.
Next: Add the actual transport-backed snapshot loop or a deterministic in-page WS-dev harness so the connected UI receives periodic server snapshots instead of one-shot local relay rows.
Do not: Let client-owned progress, local finish, local collision, or local bot state become public online authority.

Date: 2026-05-28
Observed: The next online step was to stop treating connected movement as a packet log only and start proving server-owned position state before any public WebSocket/Firebase provider exists.
Changed: Added `src/restored/online/marathon-server-state-contract.js`, extended `input_update` envelopes to preserve normalized direction/mode, wired `singularity-race.html` connected input publishing to send that direction/mode, and updated `src/restored/online/marathon-websocket-dev-server-mock.js` so accepted input advances server-owned runner state during `racing`. Added `tools/smoke-singularity-race-server-state.cjs` to simulate a short server-owned race from start to finish.
Verified: `node tools/smoke-singularity-race-server-state.cjs` passed with server-owned finish at 120m, finish time 56000ms, last sequence 58, and `movementAuthority: "server"` in the snapshot. `node tools/check-restored-marathon-contract.cjs` and `node tools/check-size.cjs` passed.
Blocked: This is still a local dev mock, not a public socket. The player page does not yet render authoritative server movement snapshots into the connected race view.
Next: Feed server-owned `state_snapshot` rows into the connected race renderer with reconciliation so the player page can visually follow server authority instead of local movement when `?devOnline=1`.
Do not: Trust client progress, local collision, or local finish packets for connected ranking, rewards, or anti-cheat.

Date: 2026-05-27
Observed: The human asked Codex to keep running the game and self-verify what blocks starting at the line, avoiding ping problems, and reaching the finish.
Changed: Opened the race progress clamp from `96` to `100`, added `LOCAL_FINISH_PROGRESS`, changed local finish from a cosmetic "finish ready" cue to a local server-owned finalization rehearsal, added `createLocalFinishRanking()`, updated the local bot sim finish clamp, and added `tools/smoke-singularity-race-progression.cjs` for repeatable progression/netcode checks.
Verified: `node tools/smoke-singularity-race-progression.cjs` passed with normal run finish in 252 seconds, sprint finish in 91 seconds, 30-runner server egress at 1881.6 kbps, degraded lane on bad ping, and `rate_limited` spam blocking. `node tools/check-restored-marathon-contract.cjs` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?adminLaunch=1` confirmed race-only UI, exactly three bottom controls, no normal hidden debug/skin/chat residue, no mobile horizontal overflow, countdown signal to `GO`, Shift+D movement, bots moving while the player stops, chat overlay focus, queue overlay with 30 slots, and a saved mobile race screenshot at `C:/tmp/singularity-race-race-verify.png`.
Blocked: Real public online is still not enabled; final ranking and anti-cheat authority must move to the real server transport before public release.
Next: Add server-owned movement/reconciliation behind a real WebSocket/Firebase transport so the client sends only input and receives authoritative snapshots.
Do not: Let client-owned local progress, local bot state, or local finish ranking become public online authority.

Date: 2026-05-27
Observed: The human asked to add a mobile circular key plus chat-window and skill buttons, and wanted PC to have the same support.
Changed: Added `race-input-controls` to `singularity-race.html`: a circular directional pad, skill button, and chat shortcut button. Wired pointer down/up/cancel to the existing WASD action key state, routed the skill button through the same E-skill path, routed the chat shortcut through the race chat overlay, hid movement controls while queue/chat overlays are open, and guarded pointer capture so synthetic or unusual desktop pointer events do not break the controls. Updated the marathon plan and contract check.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed mobile 390px and PC 1366px show the circular pad, `스킬 E`, `채팅 T`, and the existing three bottom controls without horizontal overflow; synthetic pointer down/up on `W` toggled the held state; the chat shortcut opened the chat overlay, focused input, and hid movement controls.
Blocked: None.
Next: Tune final in-game HUD placement around these controls after the race HUD redesign direction is chosen.

Date: 2026-05-27
Observed: The human asked for a final mobile race-screen pass with only three buttons: a queue button, chat open/close, and play start with `관리자 대기중`.
Changed: Added `race-mobile-controls` to `singularity-race.html`, wired queue/chat toggles through `raceQueueOpen` and `raceChatOpen`, made queue/chat overlays mutually exclusive, kept the play-start status disabled for host/admin authority, and made race slot rendering populate the overlay when opened from the race screen. Updated the marathon plan and contract check to guard the new mobile control surface.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke at 390px width confirmed `screen: race`, no horizontal overflow, exactly 3 visible bottom buttons, labels `대기열 보기`, `채팅창 열기`, and `플레이 시작 / 관리자 대기중`, disabled play-start status, a 30-slot queue overlay, and a chat overlay that closes the queue and focuses chat input.
Blocked: None.
Next: Redesign the final in-game HUD on top of these three mobile controls without reviving the old bottom-card stack.

Date: 2026-05-27
Observed: The human said the race screen still showed unwanted UI under the stadium and asked to remove it before redesigning the in-game interface.
Changed: Updated `singularity-race.html` so `race` hides the track header, action HUD, checkpoint strip, standings, debug packet rail, runner slot grid, queue actions, progress pill, trail caption, and `START GATE` text while keeping the stadium surface and runner objects visible. Updated the marathon plan and contract check to guard the race-only surface.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke at 390px width confirmed `screen: race`, no horizontal overflow, a 372x826 stadium scene, hidden topbar/room/chat/header/action/checkpoint/standing/packet/slot/queue/progress/caption UI, and no start-gate text.
Blocked: None.
Next: Redesign the in-game HUD from a clean stadium-only baseline instead of patching the old bottom cards.

Date: 2026-05-27
Observed: The human pointed out that `맵 미리보기` was still showing a cropped player-follow view with runners and HUD instead of the whole map.
Changed: Updated `singularity-race.html` so `mapPreview` uses a full-panel course overview, hides runner avatars/effects/HUD, uses preview-specific trail stroke sizes, ignores race clicks outside the race screen, and resets the track camera to the origin for the overview. Updated the marathon plan and contract check to guard the overview behavior.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke at 390px width confirmed `screen: mapPreview`, no horizontal overflow, a 342x608 map scene, hidden runners/HUD, and `translate3d(0px, 0px, 0px)` camera transform while the full course was visible.
Blocked: None.
Next: Keep the race screen player-follow camera separate from the map-preview overview and tune map labels only if the final art style changes.

Date: 2026-05-27
Observed: The requested named skin set made the first-use profile picker longer on phone-sized screens because the mobile CSS still forced skin cards into one column.
Changed: Updated `singularity-race.html` so the profile skin picker keeps three columns on mobile, trims profile-card spacing on narrow screens, and preserves the simple nickname/skin/start flow.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/skins/singularity-race-skin-presets.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke at 390px width confirmed the first-use profile screen shows the 12 race skins in a compact grid without horizontal overflow.
Blocked: None.
Next: Move on to the next visible simplification or gameplay/networking cleanup after the skin/profile entry stays stable.

Date: 2026-05-27
Observed: The human wanted Kaguya, Robot, GPichan, and the existing/additional `특붕이` back, renamed several meme skins, requested a blue armband on `완장`, and asked to add Sam Altman and Hassabis.
Changed: Updated `src/skins/singularity-race-skin-presets.js` with the requested skin names and ids, added Kaguya/Robot/GPichan/Sam Altman/Hassabis, changed `초록 밈러너` to `페페`, changed `차트 망령` to `완장` with a blue armband overlay, changed `떡상 기도맨` to `얀르쿤`, changed `물린 고양이` to `레이커즈와일`, and made the profile picker show up to 12 prioritized race skins.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/skins/singularity-race-skin-presets.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed the profile picker shows 카구야, 특붕이, 로봇, 지피쨩, 페페, 완장, 얀르쿤, 레이커즈와일, 샘 올트먼, 허사비스, 두머, and 도지 러너 without horizontal overflow.
Blocked: None.
Next: Verify the updated profile picker visually and keep casino/general-citizen presets out of Singularity Race.

Date: 2026-05-27
Observed: The human wanted the lobby, queue background, chat window, and race track to reference `PEPEANT/-drawing-world`, and said the black outer rail did not match the road surface.
Changed: Restyled `singularity-race.html` with a light paper-grid body, white glass panels, brighter room/queue/chat cards, Drawing World-like compact chat bubbles, a pale stadium field, and muted green-gray SVG rails around the warm road surface. Added `src/skins/singularity-race-skin-presets.js` and switched the race page to original meme-style skins so old casino/general-citizen, robot, GPichan, and Kaguya choices no longer appear in the normal race picker.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/skins/singularity-race-skin-presets.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed the profile screen uses the light paper-grid style with the new race skin names and no old casino/robot/anime skin labels, and direct race entry shows the pale stadium with muted green-gray rails instead of black curbs.
Blocked: None.
Next: Tune the exact race skin pack art/names and add mobile joystick/chat-bubble controls later if the Drawing World reference systems become part of the playable race input.

Date: 2026-05-27
Observed: After the requested HTML split, the next duplicated boundary was admin start signaling: `singularity-race.html` and `singularity-race-admin.html` both owned race-control storage keys, broadcast names, command parsing, and countdown command creation.
Changed: Added `src/restored/games/singularity-race-control.js` for dev-only start-countdown command creation, parse/read/write, broadcast publish/open, acceptance checks, and phase labels. Updated the player and admin pages to consume that module, and updated the marathon contract check plus marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html singularity-race-admin.html src/restored/games/singularity-race-control.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed an injected race-control `start_countdown` moves the player page to `race`, shows countdown `10`, keeps the start gate visible, hides chat and room panels, fills the 30-runner pack even from a fresh profile state, and has no horizontal overflow. Admin page smoke confirmed the host page loads, exposes the countdown button, and writes a future `start_countdown` command through the shared key.
Blocked: None.
Next: The next useful split is either collision/soft-pass math or action packet publishing, whichever starts growing first.

Date: 2026-05-27
Observed: After runner display helpers were separated, the remaining spaghetti risk was that queue/chat, track effects, local bot simulation, and dev packet relay all still lived inside the large `singularity-race.html` script.
Changed: Added `src/restored/games/singularity-race-queue.js`, `src/restored/games/singularity-race-track.js`, `src/restored/games/singularity-race-local-sim.js`, and `src/restored/games/singularity-race-dev-online.js`; updated `singularity-race.html` to consume those helpers; removed the old track-effect helper boundary from the contract plan; and updated the marathon contract check to validate the new modules.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/restored/games/singularity-race-queue.js src/restored/games/singularity-race-track.js src/restored/games/singularity-race-local-sim.js src/restored/games/singularity-race-dev-online.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed mobile `profile -> lobby -> queue -> mapPreview -> queue`, lobby chat/metrics hidden, 30 queue slots, queue chat visible, map preview showing 30 runners with chat/slots hidden, and no horizontal overflow.
Blocked: Final Playwright readback for a simulated admin countdown timed out after the storage event was sent; the race-control listener code was not changed by this split and remains covered by source/contract checks, but that manual browser readback should be repeated when the browser MCP is responsive again.
Next: After validation, the next meaningful split is race-control/admin start signaling or collision math, depending on which part grows first.

Date: 2026-05-27
Observed: After the player flow split, the next spaghetti risk was repeated runner/slot/HUD DOM creation inside the large `singularity-race.html` script.
Changed: Added `src/restored/games/singularity-race-runner-view.js` for runner avatar updates, queue slot rows, standings rows, checkpoint dots, packet rows, skill names, action status labels, and a validation helper. Updated `singularity-race.html` to consume those helpers while leaving camera, collision, and netcode smoothing math in place. Updated the marathon contract check and marathon plan to guard the new runner-view boundary.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and `npm.cmd run check` passed. Browser smoke confirmed `profile -> lobby -> queue -> mapPreview -> queue`, 30 queue slots, 30 runner avatars/nameplates in map preview, 30 runner avatars/nameplates in direct race entry, 5 standings rows, 5 checkpoint dots, hidden chat/room panels in race, and no horizontal overflow. The preferred browser runtime failed to start in this sandbox, so the smoke used the same in-app Playwright fallback.
Blocked: None.
Next: Keep the remaining gameplay math in `singularity-race.html` until a server snapshot/reconciliation adapter needs a cleaner state boundary; the next useful split is likely track effects or action packet publishing.

Date: 2026-05-27
Observed: Final browser verification passed for the simplified player flow, so the next root cleanup was preventing the same lobby/queue/map-preview/race strings from spreading through `singularity-race.html` again.
Changed: Added `src/restored/games/singularity-race-flow.js` for screen ids, flow order, compact Korean labels, and a validation helper. Updated `singularity-race.html` to import the flow module for screen setup, button labels, panel copy, and queue slot rendering. Updated the marathon contract check to import and validate the flow module, and refreshed the marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/restored/games/singularity-race-flow.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed `profile -> lobby -> queue -> mapPreview -> queue`, 30 queue slots, Korean flow copy/buttons, no horizontal overflow, and a simulated `start_countdown` signal moving the page into `race`.
Blocked: None.
Next: Split the remaining large `singularity-race.html` rendering/gameplay clusters only when they become risky; the most useful next target is runner rendering plus action HUD helpers, because those are the parts most likely to tangle with future server snapshots.

Date: 2026-05-27
Observed: The next root cleanup was that `맵 미리보기` still entered the actual race screen, while the internal player state still used a vague `room` name and kept a hidden ready/status-strip path.
Changed: Updated `singularity-race.html` so the normal waiting state is `queue`, added a separate `mapPreview` state, changed the map preview button to toggle `queue -> mapPreview -> queue`, removed the dead top status-strip DOM and stale render-metrics branch, and kept `race` entry for admin/direct start paths. Also changed remaining visible development/start/skill system messages in the player page to Korean. Guarded the new queue/map-preview split in the marathon contract check and refreshed the marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?resetProfile=1` confirmed `profile -> lobby -> queue`, no status-strip DOM, 30 queue slots, visible chat, hidden track scene, and no horizontal overflow. Clicking `맵 미리보기` moved to `screen: mapPreview`, showed the track scene, hid chat/slots/room panel/action HUD, did not start the race, then `대기열로 돌아가기` returned to `screen: queue`. A simulated admin `start_countdown` control moved to `screen: race` with the track scene and countdown visible while topbar, room panel, and chat stayed hidden.
Blocked: None.
Next: Run marathon checks, full check, and browser-smoke `profile -> lobby -> queue -> mapPreview -> queue`, plus admin countdown into `race`.
Do not: Use `room` as the normal player screen state or let `맵 미리보기` start the real race.

Date: 2026-05-27
Observed: The human said the room waiting view still had too much UI and should become a simple queue. The queue should not show `1/30`, ready counts, duplicate room cards, English/debug labels, or explanatory clutter; it should show slots, a map preview button, and chat only.
Changed: Updated `singularity-race.html` so `data-screen="room"` hides the topbar subtitle, status strip, room panel, queue copy, badges, and chat channel tabs. Moved `맵 미리보기` into the slot panel, changed the room title to `대기열`, made normal queue slots render all 30 slots with simple Korean labels, and removed visible English race cue/system text from the local collision/start-gate path. Guarded the queue-only UI shape in the marathon contract check and refreshed the marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?resetProfile=1` confirmed the profile-to-lobby-to-queue flow. Desktop `1480x900`, mobile portrait `390x844`, and mobile landscape `844x390` queue views had no horizontal overflow, showed 30 slots plus `맵 미리보기` and chat, hid the status strip, duplicate room panel, channel tabs, `참가자`, `준비 완료`, `방 대기실`, `1 / 30`, `READY`, `ROOM`, and `CHAT`, and the map preview button moved to the race/map screen without bringing back room or chat panels.
Blocked: None for the local queue UI trim.
Next: Run static checks and browser-smoke desktop/mobile queue layouts before moving on.
Do not: Put participant metrics, ready metrics, ready buttons, duplicate room cards, channel tabs, or English debug labels back into the normal `대기열` screen.

Date: 2026-05-27
Observed: The human said the lobby itself should have no chat and no participant or ready-complete metrics, only a simple room list.
Changed: Updated `singularity-race.html` so `data-screen="lobby"` hides the topbar subtitle, status strip, chat panel, quick-entry button, and notice box. The visible lobby action is now a single `입장` button on the room card, with debug-only transport/protocol controls still hidden unless explicitly enabled. Guarded the lobby-only simplification in the marathon contract check and refreshed the marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?resetProfile=1` confirmed `screen: lobby`, visible room panel, hidden status strip, hidden chat panel, hidden track panel, hidden quick-entry button, hidden notice, `입장` as the only visible room action, and no visible `참가자`, `준비 완료`, or `채팅` text.
Blocked: None for the local lobby simplification.
Next: Browser-smoke the profile-to-lobby screen and keep room waiting/chat separated from the lobby list.
Do not: Put chat, participant counters, ready-complete counters, quick-entry buttons, or packet/debug rows back into `data-screen="lobby"` for normal players.

Date: 2026-05-27
Observed: The human pointed out that the in-game view was still overlapped by the waiting-room sidebar and lobby chat, so the race screen did not feel separated from the lobby.
Changed: Added race-screen CSS separation in `singularity-race.html` so `data-screen=\"race\"` hides the topbar, room panel, and chat panel, makes the track panel occupy the full grid, and keeps only the in-game stadium surface visible. The room `준비하기` action now moves into the race screen instead of leaving the player in the waiting layout. Guarded the race-only separation in the marathon contract check.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke confirmed the second ready click moves to `screen: race`, with `.topbar`, `.room-panel`, and `.chat-panel` hidden, `.track-panel` visible, one full-width grid column, and zero captured console errors.
Blocked: None for the local UI split. Real server room state still needs backend transport later.
Next: Keep tuning the in-game HUD density separately from lobby screens.
Do not: Render room waiting controls or lobby chat sidebars inside `data-screen=\"race\"`.

Date: 2026-05-27
Observed: The human said the standalone Singularity Race page was too crowded because nickname, skin, lobby, room, race, chat, packet logs, netcode rows, and dev authority labels were all visible together.
Changed: Reworked `singularity-race.html` around a player-facing screen state: `profile`, `lobby`, `room`, and `race`. First entry now asks for nickname and skin, then shows a compact room list, then a room waiting view with participant/ready/chat, then the race view. Existing dev connected gate, packet rails, netcode budget, full skin grid, and action packet rail are still present but hidden behind `?debug=1`. Normal chat now hides system/dev messages and shows a short empty state instead of old internal relay messages.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?resetProfile=1` confirmed the first screen shows nickname/skin/start, the lobby, room, and race screens hide `Connected lobby gate`, `join_request`, `state_snapshot`, `net_lane`, `server_egress`, `SERVER LOCKED`, and `DEV ROOM`, race labels are Korean, mobile 390px lobby has no horizontal overflow, and captured console errors were 0.
Blocked: Real public online still needs the backend transport and server-owned room/session state. This loop only simplified the player UI over the existing dev adapter.
Next: Tune the exact mobile layout density, then connect the simplified room flow to real server-owned room/session state when transport work resumes.
Do not: Put protocol packet rows, raw netcode metrics, raw room ids, or server authority debug labels back into the normal player path.

Date: 2026-05-27
Observed: The human wanted the admin page simplified into a future host/spectator camera surface, with Korean UI and no visible raw `connection gate`, channel count, stored message, or room packet metric dashboard.
Changed: Reworked `singularity-race-admin.html` into a Korean 방장 페이지 with 방 목록, `게임 바로 보기`, lobby link, whole-course map camera, selectable player watch list, 10-second countdown control, and separated chat. The page still reads dev relay state internally but the visible operator UI is now room/camera/player focused. Updated the marathon contract check and plan to guard the host-page shape.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race-admin.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm.cmd run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race-admin.html?devOnline=1` confirmed the title `특이점레이스 방장 페이지`, visible `방 목록`, `전체 맵 감시카메라`, `플레이어 보기`, and `10초 카운트다운 시작`, with no visible old `connection gate` / `room packets` / `stored messages` / `visible channels` dashboard tokens in the current snapshot and zero captured console errors.
Blocked: This remains dev-only. Real room authority, host authentication, server-owned room start time, moderation, and true spectator camera feeds still need the backend transport.
Next: Browser-smoke `singularity-race-admin.html?devOnline=1`, then connect the host camera to real server snapshots when WebSocket/Firebase transport exists.
Do not: Reintroduce raw packet/channel/message metrics as the primary admin UI or let the dev host page become public online authority.

Date: 2026-05-27
Observed: The next online-ready slice was not public online; the current stage needed server-owned `state_snapshot`, ping measurement, and reconciliation before a real WebSocket/Firebase transport is attached.
Changed: Added ping sample and reconciliation helpers to the marathon netcode contract, stamped dev connected snapshots with `serverOwned`, snapshot id, server tick/snapshot cadence, ping sample, and reconciliation metadata, and made the WebSocket-shaped dev server mock emit the same server-owned snapshot shape. The lobby netcode HUD now shows server snapshot, ping sample, and reconciliation guard rows.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/restored/online/marathon-netcode-contract.js src/restored/online/marathon-room-adapter.js src/restored/online/marathon-websocket-dev-server-mock.js tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed. HTTP checks returned 200 for `singularity-race.html?devOnline=1` and `singularity-race-admin.html?devOnline=1`. Browser checks confirmed the netcode HUD rows `server_snapshot`, `ping_sample`, and `reconcile_guard`, admin auto-join produced a `state_snapshot` from `server:dev-adapter`, the admin room monitor saw the same server snapshot, and console errors were 0.
Blocked: The first Browser-runtime connection attempt timed out, but the Playwright browser surface verified the pages afterward.
Next: Use these server-owned dev snapshots as the handoff point for the real WebSocket/Firebase transport adapter; keep final race state, checkpoint rewards, and rankings server-owned.
Do not: Treat dev snapshots as public online authority or accept client-sent race finalization, checkpoint rewards, or authoritative positions.

Date: 2026-05-27
Observed: The human reported that runner names appeared detached while sprinting or moving fast, and asked whether names should sit above or below the character given future health bars.
Changed: Added `.runner-nameplate` inside each `.runner-avatar` in `singularity-race.html`, pinned under the runner's feet. The existing avatar image and the nameplate now share the same positioned parent so movement interpolation, sprinting, collision animation, and camera motion keep them together. The marathon plan now records that the head area is reserved for future health bars/status effects.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and HTTP 200 for `http://127.0.0.1:4173/singularity-race.html` passed before the final full check.
Blocked: The in-app browser connection reported no active Codex browser pane, so the live visual nameplate check still needs manual confirmation in the open browser.
Next: Open the race page, sprint with `Shift`, and confirm the foot-level nameplate remains attached. Add the future HP bar above the sprite, not above the nameplate.
Do not: Render runner names as a separate track overlay or place name text above the head where it will conflict with HP/status UI.

Date: 2026-05-27
Observed: The human said runners still could not approach the road walls because an invisible buffer seemed to block movement before the visible edge.
Changed: Increased `ROAD_LANE_HALF_WIDTH_PX` in `singularity-race.html` from the conservative inner lane to a near-wall clamp that matches the visible road surface more closely. Added a marathon contract check so the lane clamp cannot silently shrink back below the near-wall threshold. Updated the marathon plan to document that runners should reach close to the visible walls while their centers stay inside the road.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and HTTP 200 for `http://127.0.0.1:4173/singularity-race.html` passed before the final full check.
Blocked: The in-app browser automation timed out while trying to open the page from `about:blank`, so visual wall-distance tuning still needs a manual/live browser pass.
Next: Open `http://127.0.0.1:4173/singularity-race.html`, move with `W/S` to both wall sides, and tune `ROAD_LANE_HALF_WIDTH_PX` down slightly if sprites overlap the black wall too much or up slightly if a buffer is still visible.
Do not: Reintroduce a large invisible wall buffer or let runner centers leave the road surface in local preview.

Date: 2026-05-27
Observed: The human clarified that runner contact should still be felt; runners should not pass through each other too freely, but collision must stay smooth.
Changed: Added soft collision impulse constants and helpers in `singularity-race.html`. `resolveSingleRailCollisions()` now applies small lane and progress separation when runners overlap in progress and road position, while `calculateSoftPassPressure()` uses the same body radius for speed drag. Updated the marathon plan and contract guard so this soft-contact layer remains visible to future checks.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed. HTTP check for `http://127.0.0.1:4173/singularity-race.html` returned 200.
Blocked: In-app browser and fallback browser automation were unavailable/closed during this loop, so visual collision feel still needs a live browser pass by opening the game and starting the countdown. The implementation remains local/dev preview only; real online collision must be server-owned.
Next: Open `singularity-race.html`, start from the admin countdown or local race-control command, and tune `SOFT_COLLISION_LANE_PUSH_PX` / `SOFT_COLLISION_PROGRESS_PUSH` if contact feels too sticky or too ghost-like.
Do not: Reintroduce hard walls, remove soft collision impulses, or trust local collision order for public online results.

Date: 2026-05-27
Observed: The human asked to fix bugs and review whether anything was still missing after the ping/anti-teleport work.
Changed: Cleaned the runner render cleanup path so removed runners also clear their visual smoothing cache in one guarded branch. Strengthened `tools/check-restored-marathon-contract.cjs` so `smoothRunnerVisualPoint`, `runnerVisuals`, `resolveRestoredMarathonVisualStep`, and the `anti_teleport` HUD row cannot be accidentally removed without failing the marathon check.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs src/restored/online/marathon-netcode-contract.js docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed. Local HTTP checks returned 200 for `http://127.0.0.1:4173/singularity-race.html` and `http://127.0.0.1:4173/singularity-race-admin.html?devOnline=1`; the served admin page includes the start button, direct game link, race-control storage key, and `start_countdown` command, while the served game page includes the admin link, anti-teleport HUD token, visual smoothing import, and 60ms preview loop.
Blocked: The Codex in-app browser pane was not available during this follow-up, so the race-phase visual/admin-click browser sample still needs a live browser pass. Public online is still not implemented; current protection is local/dev display smoothing and packet-pressure rehearsal only.
Next: When the browser pane is available, run the admin countdown from `singularity-race-admin.html?devOnline=1`, watch `singularity-race.html` enter `GO`, and sample race-phase runner jumps/console errors. After that, continue toward server-owned snapshots and reconciliation.
Do not: Remove the smoothing cache/HUD guard, draw remote corrections directly to the screen, or treat the dev adapter as public matchmaking.

Date: 2026-05-27
Observed: The human said ping management is the top priority and asked to prevent AI/bot teleport-looking bugs or stutter before real online transport.
Changed: Added a netcode visual smoothing policy in `src/restored/online/marathon-netcode-contract.js` and wired `singularity-race.html` so non-player runner display positions move through that max-step/snap-cap guard. The netcode HUD now shows the anti-teleport limits, and the marathon plan records that future server snapshots must render through this smoothing layer.
Verified: Browser sampling on `http://127.0.0.1:4173/singularity-race.html` confirmed the gate-locked page showed the `anti_teleport` HUD row, kept 30 runners, had zero console errors, and moved sampled bot positions with max jump about 4.38px and no jumps above 90px over 24 samples. The later race-phase browser attempt lost the active Codex browser pane before completion, so race-start visual sampling still needs a follow-up browser pass. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html src/restored/online/marathon-netcode-contract.js docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed.
Blocked: This is still a local/dev visual guard. Real public online still needs server-owned snapshots, ping measurement, reconciliation, and a connected WebSocket/Firebase transport.
Next: Re-run a race-phase browser sample after the in-app browser pane is available, then keep moving toward authoritative server snapshots with this display guard in place.
Do not: Draw remote/server runner corrections directly to the screen, or send per-frame positions as the online fix.

Date: 2026-05-27
Observed: The human said the local runner felt too slow, `Shift` should be the real speed-up, and the current down-lane movement looked faster than forward running.
Changed: Tuned `singularity-race.html` movement constants so staging has quick forward movement for start positioning, race sprint is much faster than normal running, and lateral lane movement is toned down. Updated the marathon plan and contract guard for the staging sprint constant.
Verified: Browser reload of `http://127.0.0.1:4173/singularity-race.html` confirmed the local page still opens with 30 runners, gate locked, and zero console errors. The marathon contract guard now asserts race sprint is at least 2.5x normal run, staging sprint is at least 2x staging run, and lane sprint stays capped so `W/S` does not become the main speed control. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed.
Blocked: None for local feel tuning. Real connected rooms still need server-owned movement balance values.
Next: Tune exact public race duration later through server-owned movement balance once connected room snapshots exist.
Do not: Let lane movement become the main speed mechanic or treat these local constants as final public online balance.

Date: 2026-05-27
Observed: The human reported that Singularity Race bots appeared to stop whenever the player stopped, which made the staging area feel player-driven instead of independently simulated.
Changed: Updated `singularity-race.html` so local bot advancement returns a `botsMoved` signal and `advanceActionPreview()` renders when bots move even if the player is idle. Guarded the regression with `tools/check-restored-marathon-contract.cjs`.
Verified: Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed the gate-locked local page keeps 30 runners, has zero console errors, and moves idle non-player bot screen positions by roughly 10-30px over 1.4 seconds without player input. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/ai-working-state.md`, and `npm run check` passed.
Blocked: None for the local staging preview. Real online rooms still need server-owned bot/player snapshots and interpolation.
Next: Continue toward server-owned race start, input buffering, and movement authority after local staging feel is accepted.
Do not: Tie bot visibility updates to local player input, or treat local bot movement as public online authority.

Date: 2026-05-27
Observed: The human said the one-line start should be removed, 30 runners should freely occupy the wide start space, the path should stay blocked until the admin page starts a 10-second countdown, and WASD should move freely on the road instead of only along one line.
Changed: Reworked `singularity-race.html` from start-line formation to a broad start paddock. Local runners now have lateral road offsets, pre-start bot drift, free WASD staging movement, gate-locked skill/attack behavior, a visible `START GATE`, and a `10` second admin-start countdown via separated race-control local storage/broadcast. Added `경기 시작 10초 카운트다운` to `singularity-race-admin.html?devOnline=1`, recording a monitor packet while keeping the control dev-only. Updated the marathon plan and contract guard.
Verified: Browser smoke confirmed `singularity-race.html` shows 30 runners scattered across the start paddock, not one line: top spread about 332px, left spread about 482px, 11 visual row buckets, visible `START GATE`, `GATE LOCKED` phase/status, and zero console errors. Admin smoke on `singularity-race-admin.html?devOnline=1` confirmed the start button is enabled in `DEV ADMIN`; clicking it sends a fresh command, the game page reads `9` seconds remaining, shows `COUNTDOWN`, keeps the gate visible during countdown, then after about 10 seconds switches to `RACING`, removes the gate, and stays error-free. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and `git diff --check -- singularity-race.html singularity-race-admin.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md` passed before the final full gate.
Blocked: This is still dev/local race-control rehearsal. Real public online must move the start command, countdown time, gate release, position reconciliation, and collision pressure to server authority.
Next: Run the full gate, then continue toward server-owned start countdown, input buffering, authoritative 2D road position snapshots, and real WebSocket/Firebase transport.
Do not: Reintroduce a one-row start formation, let keyboard/attack/skill start the countdown, or treat the local admin control signal as public online authority.

Date: 2026-05-27
Observed: The human said the Singularity Race camera should be centered on the player.
Changed: Updated `singularity-race.html` to use centered X/Y camera anchors for the track world, refreshed the marathon plan language, and guarded the centered camera constants in `tools/check-restored-marathon-contract.cjs`.
Verified: Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed the player center was within about 0px horizontally and 0.2px vertically of the track-scene center at start and after preview movement to `YOU 6%`, with zero captured console errors. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed.
Blocked: None for the local camera. Real connected rooms still need server-owned movement while camera remains client-side display only.
Next: Continue toward server-owned start countdown, input buffering, and authoritative soft-collision reconciliation when the visual feel is accepted.
Do not: Move the camera anchor back toward the left edge unless the user explicitly asks for a look-ahead camera mode.

Date: 2026-05-27
Observed: The human said the road was still too narrow, the start should fit all 30 runners, runner contact should feel like sliding through pressure instead of hard blocking, and the start line should count down before release.
Changed: Updated `singularity-race.html` with 580px / 460px non-scaling trail strokes, a one-row 30-runner same-progress start formation, a local `3-2-1-GO` countdown triggered by preview/input/skill/attack, and soft pass pressure that slows and offsets crowded runners without clamping progress. Updated the marathon plan and contract check so the wide road, one-row start, soft pass, and countdown stay guarded.
Verified: Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed 30 runner avatars in one start row, row top spread under 1px, scene width 967px with runner bounds x=348..1252, `7600x2600` track world, 580px outline and 460px surface strokes, countdown `3` before movement, `LOCAL PREVIEW` after countdown release, preview movement to `YOU 6%`, and zero captured console errors. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed.
Blocked: Collision, countdown authority, and start placement are still local/dev previews. Real online rooms must own these rules on the server before public multiplayer.
Next: If the visual feel is accepted, move toward server-owned start countdown, input buffering, and authoritative soft-collision reconciliation.
Do not: Reintroduce hard local body blocking, split the start into separate progress positions, or let client-side countdown/collision become public online authority.

Date: 2026-05-27
Observed: The human said the race view was still too narrow, runners should stand side-by-side on the same starting line, walking looked choppy, and the track should feel long enough for roughly a 10-minute one-off race with content.
Changed: Updated `singularity-race.html` so the lobby stacks room/chat controls on the left and gives the stadium a much wider viewport. Expanded the track world to `7600x2600`, widened rail strokes, set all local/dev runners to `START_LINE_PROGRESS`, added a start-stretch visual spread that keeps 30 runners side-by-side before fading into the trail, kept the start pack collision-free until the release zone, reduced local run/sprint progress rates to long-race pacing, lowered the preview jump, and changed runner rendering to persistent DOM nodes with `left/top` transitions and a 60ms local tick. Updated the marathon plan and contract guard.
Verified: Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed a 967px-wide stadium viewport, `7600x2600` track world, 30 transparent runners spread from x=23 to x=951 on the same y=313 start line, `YOU 4%` at start, 118px/92px rail strokes, preview movement to `YOU 7%` with the player still visible, smooth avatar transition CSS, and zero captured console errors. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and `npm run check` passed.
Blocked: This is still a local/dev visual and pacing model. Real online movement duration, start formation, collision, interpolation, and checkpoints must be owned by the server simulation later.
Next: Re-run full checks after doc guard updates, then tune the course pacing or start camera only if the human wants a different race duration feel.
Do not: Compress the full course into the first viewport, stagger the initial pack by progress, or let the client-side 8-10 minute pacing become online authority.

Date: 2026-05-27
Observed: The human reported that the Singularity Race sprites had an unwanted dark translucent background, the map felt too small, the rail width looked wider near the top, the camera needed to follow the player on a huge map, and key skins such as `gpichan`, `robot`, and `kaguya` were not visible.
Changed: Updated `singularity-race.html` to wrap the SVG trail, effects, and 30 runner sprites in a `track-world` sized for a larger map and move that world with a player-follow camera. Converted the track strokes to non-scaling SVG strokes for a constant visible rail width, removed framed dark avatar backgrounds in favor of transparent sprite layers, widened the single-rail spacing for the larger world, corrected pointer-to-progress aiming for the moved camera, and changed the skin picker to render all playable presets with featured race skins first. Updated the marathon plan and smoke contract guard.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, `git diff --check -- singularity-race.html tools/check-restored-marathon-contract.cjs docs/plans/restored-marathon-stadium.md docs/ai-working-state.md`, and browser smoke on `http://127.0.0.1:4173/singularity-race.html` passed. Browser smoke confirmed 30 transparent-background runner avatars, a 2800x1180 camera-followed track world, player kept visible after preview movement, fixed 54px/42px trail strokes, all 15 playable skin cards, featured `gpichan`/`robot`/`kaguya` skin ids, and zero captured console errors.
Blocked: This remains a local/dev visual and collision preview. Real online cameras, interpolation, server-owned collision, and authoritative positions still need backend simulation.
Next: Tune the race scene width/side-panel layout only if the human wants more runners visible in the viewport at once; otherwise continue toward server-owned movement/collision.
Do not: Reintroduce dark sprite cards, fit the whole marathon route into the small viewport, or treat the client camera/collision preview as online authority.

Date: 2026-05-27
Observed: The human clarified that when entering the stadium, everyone should run together on one rail, runners should collide instead of passing through each other, and chat should be opened with `T`.
Changed: Updated `singularity-race.html` so the local lobby starts with 30 runners, renders runner avatars directly on the trail centerline, applies local-only single-rail collision spacing and bump feedback, blocks player dash/run movement behind the nearest runner ahead, and focuses chat with `T`. Updated the marathon plan and smoke check to guard the no-pass rail and chat hotkey.
Verified: Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed 30 runner avatars, 30 runner slots, 5 standings rows, `T` focusing `#chat-input`, preview movement producing `BUMP` collision feedback, and zero captured console errors. `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and `node tools/check-restored-growth-architecture.cjs` passed before the final full gate.
Blocked: Collision is still local/dev preview. A real online room must resolve rail order, collision, stalls, and player positions on the server before rankings or rewards.
Next: Verify the lobby, then later move this no-pass rail rule into the server simulation when real WebSocket/Firebase transport exists.
Do not: Treat local collision order as authoritative online movement, send per-frame local positions as truth, or let chat/admin traffic share the race action packet lane.

Date: 2026-05-27
Observed: The human said to continue after the admin direct-entry page. The next useful operator slice was making the dev-only room packet lane visible from the separate admin page.
Changed: Added a read-only room packet monitor to `singularity-race-admin.html?devOnline=1`, including a packet metric, latest packet rows, and netcode relay guard status from `src/restored/online/marathon-dev-room-transport.js`. Updated the marathon plan and smoke check so the admin monitor remains guarded.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `npm run check`, `git diff --check`, and browser smoke passed. Browser smoke seeded the dev room through `singularity-race.html?devOnline=1&adminLaunch=1`, then confirmed `singularity-race-admin.html?devOnline=1` shows `DEV ADMIN`, room `room:singularity-race:dev-001`, 24 room packets, monitor rows for `join_request`, `join_result`, `state_snapshot`, relay guard `clear`, and zero console errors.
Blocked: The monitor reads local dev relay storage only. It is not production admin authentication, public matchmaking, persistent server history, or authoritative race control.
Next: Verify the page, then later replace this observer lane with authenticated server room telemetry once the real WebSocket/Firebase backend is chosen.
Do not: Let the admin page write authoritative race packets, merge admin chat with race action packets, or treat dev query flags as production admin auth.

Date: 2026-05-27
Observed: The human asked to confirm the admin page link and make the admin page able to enter the game directly.
Changed: Added a primary `게임 바로 입장` action to `singularity-race-admin.html?devOnline=1`, pointing at `singularity-race.html?devOnline=1&adminLaunch=1`. Updated `singularity-race.html` so `adminLaunch=1` automatically performs the existing dev room join flow. Updated the marathon plan and smoke check to guard the admin direct-launch path.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, and browser smoke passed. Browser smoke confirmed the lobby `admin-page-link`, the admin `admin-direct-game-link`, admin `DEV ADMIN` mode, direct launch URL, automatic `DEV ROOM`, `join_result ok`, joined room code, `SERVER LOCKED`, and zero captured console errors.
Blocked: This is still a dev-only shortcut. It does not authenticate real admin authority or expose public online.
Next: When real backend/auth is chosen, replace this query shortcut with server-authenticated admin session checks.
Do not: Treat `adminLaunch=1` as production admin auth or expose connected admin controls without server-side authority.

Date: 2026-05-27
Observed: The local single-trail preview had visual cues, but the 30-runner room still felt static unless the user pressed the coarse preview button.
Changed: Added local-only bot pack advancement after keyboard, skill, attack, or preview-button start; added a compact `race-standings` strip that shows the top local runners plus YOU; added local rank cue handling; and updated runner slots to show progress percent. Updated the marathon plan and smoke check to guard the standings/bot-pack layer.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and browser smoke on `http://127.0.0.1:4173/singularity-race.html` passed. Browser smoke confirmed 30 runners, five standings rows, bot progress changes after local practice starts, SAVE 1 clearing, next SAVE 2 display, focus ring, and zero captured console errors.
Blocked: Bot movement and standings are local/dev preview only. They do not create authoritative online movement, rank, checkpoint, finish, or reward state.
Next: Continue toward a connected runtime/back-end adapter after choosing provider/auth, or add more local race-feel polish without presenting it as public online.
Do not: Send per-frame local bot/player positions as authoritative online data or trust local standings for rankings/rewards.

Date: 2026-05-27
Observed: After the single-trail map landed, the next useful local preview slice was making progress, save points, and action results visible without changing online authority.
Changed: Added the `track-effects` overlay in `singularity-race.html` with a player focus ring, progress/next-save pill, and short local visual cues for checkpoint, skill, hit, respawn, and finish-preview moments. The preview advance button now runs checkpoint detection, checkpoint detection can catch multiple crossed saves, and filling 30 local runners resets the local action race state. Updated the marathon plan and smoke check to guard the visual race-feedback layer.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, and browser smoke on `http://127.0.0.1:4173/singularity-race.html` passed. Browser smoke confirmed 30 runners, one focus ring, `SAVE 1` cue after preview advancement, SAVE 1 cleared, next SAVE 2 shown, five trail labels, five save lines, and zero captured console errors.
Blocked: The feedback layer is cosmetic local/dev preview only. It does not replace server-owned checkpoint, hit, respawn, finish, ranking, or reward authority.
Next: Add real connected runtime delivery or a local backend process only after the WebSocket/Firebase provider and auth/session boundary are chosen.
Do not: Treat visual cues as authoritative online results or expose dev-only connected behavior without `?devOnline=1`.

Date: 2026-05-27
Observed: The human provided a sketch of the desired Singularity Race map: a log-scale style curved marathon stadium, one shared trail, five save points, and a finish at the upper end.
Changed: Added `src/restored/games/marathon-trail-geometry.js`, wired the marathon course checkpoints to that five-save geometry, and changed `singularity-race.html` to render an SVG log-curve trail with checkpoint ticks, labels, finish mark, pointer-to-progress attack aiming, and 30-runner placement on the same trail. Updated the marathon plan, restored README, and marathon smoke check so the geometry stays guarded.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, and `npm run check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed 3 trail paths, 5 save lines, labels 1-5 inside the scene, 30 filled runners on the shared trail, and zero captured console errors.
Blocked: The trail is still a local/dev preview. Real online authority, live ping measurement, reconciliation, and server-hosted snapshots are not connected yet.
Next: Add connected transport runtime wiring or a local backend process only after choosing the WebSocket/Firebase provider and auth/session boundary.
Do not: Split runners into lanes, make checkpoint/finish results client-authoritative, or bypass the dev-only connected gate.

Date: 2026-05-27
Observed: The human said to continue after the server transport boundary. The safest next online step was a local WebSocket-shaped server rehearsal, not public online or Firebase secrets.
Changed: Added `src/restored/online/marathon-websocket-dev-server-mock.js`. The mock creates connected `websocket` transport snapshots, exposes a server-backed room adapter, owns server-side join results and state snapshots, accepts only client-owned chat/input/skill/attack packets, rejects client-sent server-owned finalization packets, and applies the existing netcode packet-pressure guard. Updated marathon checks and docs.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: This does not open an actual WebSocket port, run on a deployed backend, authenticate sessions, persist room history, or perform server simulation/reconciliation yet.
Next: Wire a real local `ws://127.0.0.1` development transport or backend process behind this mock shape, then connect the dev-only lobby to it without exposing public matchmaking.
Do not: Treat the mock as public online, let clients send `state_snapshot`, `checkpoint_reward`, `respawn_notice`, `race_finalized`, rankings, or rewards as authority, or add API keys/secrets to client config.

Date: 2026-05-27
Observed: The human clarified that Singularity Race is still not public online; the next step is to plug a real WebSocket/Firebase-like server transport behind the existing dev adapter boundary.
Changed: Extended `src/restored/online/marathon-server-transport-contract.js` with provider config for `websocket` and `firebase`, auth-mode metadata, connected snapshot creation, capability flags, and rejection of embedded secret-like config keys. Added `src/restored/online/marathon-server-room-adapter.js` for the server-transport-backed room shape, so a connected lobby can open from an injected server transport snapshot and server room list while default/dev behavior stays unchanged. Updated the marathon contract check and docs.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-growth-architecture.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: No actual WebSocket server, Firebase app config, auth session, deployment, or public room registry was added. Those require explicit backend configuration and secrets outside this client contract.
Next: Add a local WebSocket dev server mock that consumes this transport contract, or choose Firebase/WebSocket backend details and auth/session rules before wiring a real provider.
Do not: Put API keys/tokens/secrets in client config, expose the server-backed adapter as public matchmaking without a connected backend, or make client-owned checkpoint/attack/finish data authoritative.

Date: 2026-05-27
Observed: The human expects to provide many MP3 files, photos, and character illustrations, and asked to start the structure plus likely bug-risk design before the asset volume grows.
Changed: Created the promoted `assets/restored/` folder guide structure for audio, images, source files, and manifest batches. Expanded `docs/baegeum-city-v2-restored-asset-pipeline.md` with shared character packs, Singularity Race-specific art/audio folders, optional collection metadata, and a bug-prevention plan. Extended `src/restored/assets/asset-manifest.js` with character/race/skill/skin/stadium image roles, source/status validation, collection helpers, and raw-inbox protection. Updated the intake tool so `--collection=singularity-race` routes character, skill, skin, stadium, UI, and audio files into race-owned folders. Updated asset/intake checks and related docs.
Verified: `node tools/check-restored-asset-pipeline.cjs`, `node tools/check-restored-intake.cjs`, and `node tools/check-size.cjs` passed.
Blocked: No actual new MP3/image files were provided in this loop, so no runtime asset entries were promoted yet.
Next: When files arrive, put them in `assets/inbox/`, run `node tools/intake-restored-material.cjs "<file>" --role=<role> --collection=<collection> --id=<asset-id> --write`, then promote approved runtime copies into `assets/restored/` and register manifest entries.
Do not: Reference `assets/inbox/` from runtime code, load high-resolution source masters directly, skip source/status metadata, or put feature-specific Singularity Race art into shared character folders unless it is truly reusable.

Date: 2026-05-27
Observed: The human asked to keep going after the 30-runner ping/optimization pass. The useful next online-before-real-online step was to block packet spam in the dev room relay, not add more visible race features.
Changed: Extended `src/restored/online/marathon-netcode-contract.js` with a packet pressure report and relay accept/reject helper for action packets. Wired `src/restored/online/marathon-dev-room-transport.js` to reject per-client `input_update`, `skill_use`, `attack_action`, `checkpoint_reward`, and `respawn_notice` spam above the 20 Hz input budget plus burst allowance while leaving join/snapshot room packets alone. `singularity-race.html` now renders a `relay_guard` budget row after the dev room joins. Updated the marathon plan, roadmap, restored README, index, plans README, and marathon smoke check.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?devOnline=1` confirmed `relay_guard`, `join_result ok`, room packet rows, and zero captured console errors.
Blocked: This still does not measure real network RTT/loss or perform server reconciliation. A real backend must consume this guard and add ping sampling, authoritative snapshots, reconnect recovery, lag compensation, and abuse logging.
Next: Add a backend-facing WebSocket adapter or a local dev server mock that can run the same packet pressure guard outside the browser before rankings/rewards.
Do not: Let clients bypass relay rate limits, mix chat/admin traffic into the action packet lane, or trust high-rate client input for hits, checkpoints, finish time, rankings, or rewards.

Date: 2026-05-27
Observed: The human called out that 30-player online racing will be limited by ping and optimization more than by raw feature count.
Changed: Added `src/restored/online/marathon-netcode-contract.js` to lock the 30-runner network budget before a real server exists: 20 Hz input requests, 10 Hz compact server snapshots, per-player upstream/downstream estimates, server egress estimate, input coalescing, interpolation delay, and adaptive network lanes (`smooth`, `buffered`, `degraded`, `critical`). Wired `singularity-race.html` to render the budget in the lobby so packet pressure stays visible during testing. Updated the marathon check, restored README, roadmap, index, plans README, and marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed the visible netcode rows: `net_lane`, `input_budget`, `snapshot_budget`, and `server_egress`, with zero captured console errors.
Blocked: Real network measurement, server-side lane decisions, packet loss simulation, rewind/reconciliation, and websocket transport are still future backend work.
Next: When a backend is chosen, make the server consume this netcode contract for tick rate, snapshot cadence, interpolation hints, and rate limiting before adding rankings or rewards.
Do not: Let clients send per-frame positions, raise snapshot rate without budget checks, mix chat/admin traffic into the race action stream, or make high-ping clients authoritative for hits/checkpoints/finish time.

Date: 2026-05-27
Observed: The human asked to finish the Singularity Race online-before-real-online slice. The remaining blocker was a dev-only room packet relay that could rehearse delivery between same-origin clients without claiming public server authority.
Changed: Added `src/restored/online/marathon-dev-room-transport.js` for room-scoped join/input/skill/attack/snapshot packet relay using local dev storage plus same-origin broadcast updates. Wired `singularity-race.html?devOnline=1` so after `join_result ok`, connected key and mouse inputs publish server-shaped request envelopes to the room packet rail while the action HUD remains `SERVER LOCKED`. Updated the marathon check, roadmap, restored README, and marathon plan.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html?devOnline=1` confirmed `DEV ROOM`, relay packet count, visible `join_result`, `state_snapshot`, `input_update`, `skill_use`, and `attack_action` rows, `SERVER LOCKED` action status, and zero captured console errors.
Blocked: This is still not a real backend. Public multiplayer still needs authenticated WebSocket/session handling, server-owned movement simulation, attack/checkpoint validation, moderation, reconnect recovery, and persistent room history.
Next: Choose and implement the real backend boundary for WebSocket room delivery, or keep building local race feel without presenting it as public online.
Do not: Treat dev room relay packets as authoritative race truth, expose it without `?devOnline=1`, or let client-owned action/checkpoint/finish results feed rankings or rewards.

Date: 2026-05-27
Observed: The next Singularity Race loop was to make the local action preview visible enough to inspect before real WebSocket delivery.
Changed: Added the standalone lobby action HUD for current checkpoint character, skill charge state, HP, local/server-lock status, cleared checkpoint strip, and a server-shaped action packet rail. The lobby now pushes `skill_use`, `attack_action`, `checkpoint_reward`, and `respawn_notice` envelopes from the existing restored contracts, while connected mode still locks local action authority. Updated the marathon plan and marathon check so the HUD remains guarded.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed title `특이점레이스 로비`, no public admin tab, 5 checkpoint dots, HP `100 / 100`, visible `skill_use` and `attack_action` packet entries after `E` and track click, and zero captured console errors.
Blocked: Real multi-user movement, checkpoint reward seeds, attack hit validation, down/respawn, moderation, and admin authority still need a backend transport. The current action rail is a local protocol preview only.
Next: Add the first real server transport adapter or a dev server mock that actually broadcasts movement/chat packets between two browser clients.
Do not: Treat the local action packet rail as real online authority, trust client-owned attacks/checkpoints/respawns, or expose admin/player channel writes without server-authenticated roles.

Date: 2026-05-27
Observed: The human defined the next Singularity Race gameplay direction: WASD movement, Shift sprint, E skills, mouse attacks that stall the attacker, N-stage checkpoint character assignment, rare one-use skills, and checkpoint respawn after down/death.
Changed: Added pure action-race contracts: `src/restored/games/marathon-input-contract.js`, `src/restored/games/marathon-character-skill-contract.js`, and `src/restored/games/marathon-combat-contract.js`. Extended the server transport contract with `skill_use`, `attack_action`, `checkpoint_reward`, and `respawn_notice` packet types. Wired the standalone lobby to a local action preview so `E` can use the assigned skill and mouse clicks run the attack contract, while connected mode remains server-authoritative. Updated the marathon plan, roadmap, restored README, indexes, and checks.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-game-contract-purity.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed the lobby still hides the admin channel, E skill use writes a local system message and advances the runner, mouse track click can hit a runner through the attack contract, and captured browser errors were zero.
Blocked: WASD hold movement was added as a local feel preview, but real online movement, skill validation, attack hit validation, checkpoint character seeds, and respawns still need the server transport/room authority. The meme-style characters are original homage labels, not copied external IP assets.
Next: Promote the local action preview into a dedicated race scene with visible checkpoints, HP/skill charge state, and a server-shaped packet rail for skill/attack/respawn before real WebSocket delivery.
Do not: Make client-side random character rewards, rare skill charges, attack hits, deaths, respawn positions, or final race ranking authoritative.

Date: 2026-05-27
Observed: After the dev chat relay, the next online-ready boundary was to define the server-facing transport shape without pretending a backend exists.
Changed: Added `src/restored/online/marathon-server-transport-contract.js` for unavailable-by-default server transport snapshots and validated packet envelopes for hello, join, chat, input, state snapshot, race finalization, and disconnect notices. Wired it into the marathon contract check and updated the marathon plan, roadmap, restored README, and plan indexes.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed.
Blocked: No real WebSocket endpoint, auth session, room registry, rate limit, moderation store, or cross-client history exists yet.
Next: Implement the first real server boundary only when the backend location and auth/session rules are chosen; until then, keep server transport unavailable by default.
Do not: Make the dev transport look like public matchmaking, or accept client-owned finish/chat authority as server truth.

Date: 2026-05-27
Observed: The next safe step after separate admin/channel UI was to stop having lobby/admin pages directly own the chat storage path before real server chat exists.
Changed: Added `src/restored/online/marathon-dev-chat-transport.js` as a dev-only same-origin chat relay around the existing channel contract. Updated `singularity-race.html` and `singularity-race-admin.html` to send, seed, save, and subscribe through that transport; the closed admin page now disables chat input until `?devOnline=1` opens the dev admin gate. Updated marathon docs, restored README, roadmap, and the marathon contract check.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke confirmed the dev lobby still hides the admin channel, the closed admin page has disabled chat controls, the dev admin page exposes lobby/room/spectator/admin/notice channels, and there were zero captured browser errors.
Blocked: The Codex in-app browser only exposed one active local tab during the smoke test, so simultaneous real-tab BroadcastChannel behavior is covered by the transport contract check rather than a two-visible-tab browser run. Real cross-client chat still needs a backend/WebSocket transport.
Next: Add the first server-shaped transport adapter for join/input/snapshot/chat delivery while keeping local dev transport behind the explicit dev gate.
Do not: Put lobby, spectator, room, and admin messages back into direct page-owned localStorage logic or expose admin chat without the dev/server authority gate.

Date: 2026-05-27
Observed: The human emphasized that admin pages must be separate and channel-separated, with an in-game way to check them, to avoid future lag or system coupling.
Changed: Added an in-lobby admin-page link to `singularity-race.html`, kept it pointing at the dev-gated `singularity-race-admin.html?devOnline=1`, and changed lobby chat startup to load the channel-contract initial message set by default instead of unchannelled legacy fallback messages.
Verified: `npm run check` and `git diff --check` passed. Browser smoke from `singularity-race.html` confirmed the in-game admin-page link opens `singularity-race-admin.html?devOnline=1`, the admin page shows `DEV ADMIN`, admin sees lobby/room/spectator/admin/notice tabs, the lobby still does not expose an admin tab, initial chat messages are stored with channel ids, and there were zero console errors.
Blocked: Real admin auth, server delivery, moderation, and cross-client chat history still require a backend transport.
Next: Keep replacing localStorage dev chat with server-owned channel delivery; admin controls must remain separate from player/observer channels.
Do not: Merge admin, spectator, room, and lobby messages into one untyped runtime feed.

Date: 2026-05-27
Observed: The human asked for a separate admin page, separate spectator channel, visible channels, and chat windows before real online work.
Changed: Added `src/restored/online/marathon-channel-adapter.js` for lobby/room/spectator/admin/system channels and message shape. Added `singularity-race-admin.html` as a dev-only admin surface, added chat channel tabs to `singularity-race.html`, and made the lobby/admin pages share local dev messages through `singularity-race:chat:v1`. Updated marathon docs, roadmap, restored README, and checks.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke confirmed the normal lobby has lobby/room/spectator/notice tabs without an admin tab, the dev lobby can write a spectator-channel message, the dev admin page opens `DEV ADMIN` with lobby/room/spectator/admin/notice tabs, admin can read the spectator channel, admin can write an admin-only message, and the public lobby cannot see the admin-only message. Console errors were zero on the checked pages.
Blocked: Real multi-user delivery, moderation, admin authentication, and server-owned chat history still need a backend transport.
Next: Replace localStorage dev chat with server-owned channel delivery once the real online transport exists.
Do not: Treat localStorage chat as real multiplayer, expose the admin channel without server-authenticated admin authority, or let players send admin-channel messages.

Date: 2026-05-27
Observed: The human asked to finish the next online-before-real-online loop: dev-only connected marathon room adapter plus connected-only lobby gate.
Changed: Added `src/restored/online/marathon-room-adapter.js` with unavailable-by-default and explicit `dev_mock` modes, room summaries, version-gated join, `join_request`, `join_result`, and `state_snapshot` packets. Wired `singularity-race.html` so default mode keeps the connected gate closed, while `?devOnline=1` enables the dev room join and disables local bot filling after server-owned room join. Updated the marathon plan, roadmap, restored README, index, and plans README.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke confirmed default `singularity-race.html` stays `LOCAL` with the connected gate closed and join disabled, while `singularity-race.html?devOnline=1` opens `DEV READY`, joins the dev room, switches to `DEV ROOM`, emits `join_request`, `join_result`, and `state_snapshot`, disables local bot filling, updates the room channel, and reports zero console errors.
Blocked: Real public matchmaking still needs a real backend/server adapter; this dev adapter is deterministic and query-gated only.
Next: Add a real transport-backed marathon server adapter or wire room chat delivery once backend authority exists.
Do not: Expose the dev connected adapter without `?devOnline=1`, trust local race finish times for online rankings, or present dev room state as public online matchmaking.

Date: 2026-05-27
Observed: The human clarified that opening `baegeum-city-v2-dice.html` was wrong for Singularity Race and asked for the correct server/page again.
Changed: Added `singularity-race.html` as a standalone one-page local lobby for `특이점레이스`, with room status, 30 runner slots, readiness, local chat, preview runners, online packet labels, and skin selection using the existing Drawing World skin adapter. Updated the marathon plan/index/plan README so future sessions point the human to the Singularity Race route instead of the Baegeum City restore.
Verified: `npm run check` and `git diff --check` passed. Browser smoke on `http://127.0.0.1:4173/singularity-race.html` confirmed the page title, 30/30 filled runner slots, ready state, local chat message, selected Drawing World skin persistence, 12 skin cards, 12 track preview sprites, responsive mobile layout without horizontal overflow, and zero console errors.
Blocked: Real connected rooms still need a server adapter; the new lobby is deliberately local preview and does not claim live matchmaking.
Next: Browser-verify `http://127.0.0.1:4173/singularity-race.html`, then add a connected-only server adapter when online authority is available.
Do not: Present the local lobby as real online matchmaking or route Singularity Race users to `baegeum-city-v2-dice.html`.

Date: 2026-05-27
Observed: The first marathon preview worked, but the user asked to keep building. The HTML shell was at the line limit, so further work needed to stay inside restored modules.
Changed: Kept HTML unchanged and improved `marathon-stadium-view.js` with one-minute strategic race ticks, a Next Split field, and a visible read-only online packet rail for `join_request`, `input_update`, `state_snapshot`, and checkpoint/finalization packets. Adjusted marathon stamina pacing so one sprint turn advances meaningfully without draining the runner to zero.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `npm run check`, and browser smoke passed. Browser smoke entered the stadium, clicked `sprint`, confirmed `1:00`, `516m / 42,195m`, `72%` stamina, visible `state_snapshot`, and no browser error logs.
Blocked: Real connected rooms still need a server adapter and connected-only lobby entry.
Next: Add a dev-only connected marathon room adapter or a local finish/medal result surface without trusting local results for online ranking.
Do not: Add more logic to `baegeum-city-v2-dice.html`, expose offline rooms as online, or make client finish times authoritative.

Date: 2026-05-27
Observed: The human approved building a large 2D online-ready marathon stadium and asked to avoid script/file sprawl while preparing online needs.
Changed: Added `docs/plans/restored-marathon-stadium.md`, a compact marathon contract, one local stadium preview view, a Baegeum place/catalog entry, HTML mounting from `marathon_stadium`, and a single smoke check wired into `npm run check`.
Verified: `node tools/check-restored-marathon-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, `npm run check`, and browser smoke on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` passed. Browser smoke entered guest mode, moved to Baegeum City, opened the marathon card, confirmed 30 runners, clicked `sprint`, saw progress update to 43m and stamina to 88%, and found no browser error logs.
Blocked: Real connected rooms still require a server adapter; the current stadium is local practice with online packet/authority vocabulary prepared.
Next: Add a connected-only marathon room adapter/mock test path or improve the local race with camera/finish pacing before live server work.
Do not: Show a fake offline online lobby, trust local finish times for online rankings, or split the first marathon system into many small protocol files.

Date: 2026-05-27
Observed: The next safe job-system slice after work history was fixed part-time reliability, not broader company or business jobs.
Changed: Added `src/restored/jobs/life-job-fixed-contract.js`, seeded and preserved `fixedJobContract`, exposed fixed-job registration from life-job panels, updated result application so matching shifts raise attendance/reliability, and documented the local-only boundary.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-size.cjs`, `npm run check`, and `git diff --check` passed. Browser smoke used the Chrome fallback because the in-app automation pane was unavailable; it registered fixed MacBurger work, completed two steady shifts, returned to My Info, and confirmed `2회`, `91,200원`, `고정 알바: 맥버거 알바`, `성실도 22`, and no browser error logs.
Blocked: In-app browser automation reported no active Codex pane, so the final UI smoke used the same browser plugin's Chrome surface instead.
Next: Add absence/missed-shift events or relationship trust/stability reactions that consume the fixed-job contract through an event boundary.
Do not: Trust local fixed-job reliability for online rankings or mutate partner state directly from job handlers.

Date: 2026-05-27
Observed: Short approval meant continuing the next safe job-system slice after building-entry verification. The next documented step was work history/streaks before fixed part-time contracts or broader company/business tiers.
Changed: Added persisted `jobHistory` and `jobStats` fields, recorded history when life-job result envelopes are applied, rendered the My Info work-history card through `src/restored/jobs/life-job-history-view.js`, and updated the life-minigame plan/checks.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-size.cjs`, `node tools/check-restored-player-profile.cjs`, and `npm run check` passed. Browser smoke completed two fast-food shifts and confirmed My Info shows 2 shifts, 91,200원 total work income, a 2-shift streak, and saved `jobHistory/jobStats` with no page errors.
Blocked: None.
Next: Add fixed part-time contracts or work absence/reliability events on top of this history state.
Do not: Trust local `jobStats` for future online rankings or make work history mutate relationships outside the event boundary.

Date: 2026-05-27
Observed: The human asked for a simple but broad minigame/job system where each building can be entered. The existing implementation had real panels for only a few location actions, and Baegeum job-street cards were informational rows rather than entry points.
Changed: Expanded the starter life-job catalog, mapped additional building actions to job minigame panels, added Baegeum job-street entry buttons, added a thin restored building-entry router in the HTML shell, and let library/university/company entry actions reuse the study/career panel.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-restored-study-career-contract.cjs`, `node tools/check-restored-city-frontage-contract.cjs`, `npm run check`, and browser smoke passed. Browser smoke confirmed 12 Baegeum job-street entry buttons and working PC room, delivery, library, company, and factory building panels with no page errors.
Blocked: None.
Next: Add work history/streaks or fixed part-time contracts after the building-entry path is verified.
Do not: Add more permanent bottom nav tabs for every building or describe ordinary wages as DP/DPA.

Date: 2026-05-27
Observed: Short approval meant continuing the next safe job-system slice. The labor/career contracts were mostly corrected to won, but one phone-news job story still described work as a DP supply source, and live starter job buttons still looked too much like wage-only choices.
Changed: Replaced the remaining job-news DP wording with won/cash income wording, guarded that rule in the news-cycle smoke check, localized starter job names/tasks to Korean, and made life-job preset buttons preview wage, energy, mental, time, and reputation before applying effects.
Verified: `node tools/check-restored-news-cycle-contract.cjs`, `node tools/check-restored-life-job-contract.cjs`, `git diff --check`, and `npm run check` passed. Browser smoke confirmed the fast-food and labor-office panels show Korean job/task copy, won wages, and energy/mental/time/reputation previews without `DP`/`DPA` leakage.
Blocked: None.
Next: Keep building the labor loop with work history/streak or a dedicated fixed part-time contract before adding broader company or business tiers.
Do not: Describe ordinary labor, company wages, or study tuition as DP/DPA income.

Date: 2026-05-27
Observed: The user corrected the job-system direction: ordinary work income should be 원, not DP. The live job/career contracts still labeled wages and tuition as DP even though normal cash is separate from DPA.
Changed: Switched life-job wages, study tuition, and company wages from DP labels to won/cash labels in contracts, place views, smoke checks, and planning docs. Kept DPA reserved for Dice City exchange/casino token flows.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-restored-study-career-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, and `npm run check` pass. Browser smoke confirmed the fast-food life-job panel and study/career panel render `원` labels and do not leak `DP`/`DPA` labels in those wage/tuition surfaces.
Blocked: None.
Next: Keep the first labor loop focused on 맥버거, 편의점, and 물류/인력소 work before adding broader occupation tiers.
Do not: Rename ordinary wages to DPA/DP or mix casino token balances with normal cash income.

Date: 2026-05-27
Observed: The live phone news app existed, but market cycle updates still pushed flat legacy message strings into `newsHistory`, so the phone did not feel like a real in-world news app.
Changed: Added the pure restored news-cycle contract, wired the HTML market/crash/AI news paths through normalized news items, upgraded the phone news renderer to source-labeled article cards, added a news-cycle check to `npm run check`, and refreshed the phone/market planning docs.
Verified: `node tools/check-restored-news-cycle-contract.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, phone news app visibility, one structured news card, AI reporter source label, headline/impact text, and no captured page errors beyond the existing favicon 404.
Blocked: None.
Next: Connect later AI supercycle and market regime changes to the news contract through neutral event envelopes before adding more market classes.
Do not: Pull live external news data, use real-company branding, or let news cards mutate market, relationship, credit, or mental state directly.

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
Observed: The Baegeum Electronics market contract existed, but the live phone stock app still showed legacy NASDAQ-style rows and KRW-formatted prices.
Changed: Rebuilt `src/restored/phone/stock-app-view.js` as a non-mutating Baegeum Electronics adapter. It now renders a DP-only Baegeum Securities ticker, virtual candle chart, Baegeum Electronics market row, and holding/P&L summary from `market-contract.js`. The stock app HTML label now says Market / 배금전자 instead of Market Cycle / NASDAQ, and checks now guard that the live adapter avoids legacy trade modal entry points and legacy symbols.
Verified: `node tools/check-restored-market-contract.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed the phone stock app opens to 배금전자, shows a DP price, renders one candle chart shell, has no legacy NASDAQ/TSLA/AAPL/NVDA symbols, and has no legacy `openTradeModal` buttons. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: Buy/sell still does not mutate DP or holdings. A market order application boundary and save-compatible holding state are still required before the buttons can become active.
Next: Add a market order application module that consumes `createRestoredMarketOrderPreview()` and returns state/effect envelopes for one-share buy/sell without putting formulas back into the HTML shell.
Do not: Add United States, Crypto Spot, Crypto Leverage, live financial data, or relationship/mental mutations before the Baegeum Electronics order loop is stable.

Date: 2026-05-27
Observed: The phone stock app showed Baegeum Electronics, but buy/sell was still disabled and no save-compatible market holding state existed.
Changed: Added `src/restored/systems/market-order-application.js` for local one-share buy/sell application, seeded and preserved `markets` state, added `getRestoredMarketPortfolioValue()` to total asset selectors, activated the phone stock app buy/sell buttons through `tradeRestoredBaegeumStock()`, and extended market/phone checks. Browser verification found and fixed a visible-price vs fill-price mismatch by sharing the Baegeum Electronics snapshot defaults between the phone view and order application.
Verified: `node tools/check-restored-market-contract.cjs`, `node tools/check-restored-phone-app-contract.cjs`, `node tools/check-restored-growth-architecture.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed stock-app buy reduces DP, creates a saved `domestic:baegeum-electronics` holding with 1 share, appends an order, matches the visible 72,741 DP price to the filled order price, shows the 1-share portfolio row, then sell restores the holding to 0 and appends the second order. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: The order path is still local-prototype authority and only covers Baegeum Electronics. It does not yet add fees, ledger entries, market tabs, AI-event price advancement, relationship hooks, or online/server order authority.
Next: Add a small order-history display or move toward market snapshot advancement before adding United States/Crypto tabs.
Do not: Add the other three markets or leverage before the Baegeum Electronics order loop and saved holding display are stable.

Date: 2026-05-27
Observed: The human asked to add the other minigames and job experiences, including convenience store, pawnshop, and fast-food. Dice City gambling, pawnshop, and loan-office contracts already existed, while ordinary work minigames had no contract boundary yet.
Changed: Added `docs/plans/restored-life-minigame-system.md`, `src/restored/jobs/life-job-contract.js`, and `tools/check-restored-life-job-contract.cjs`. The new contract covers convenience-store and fast-food shifts with deterministic task decks, S/A/B/C/D/F scoring, DP wage envelopes, player condition effects, relationship hooks, and high-grade inventory bonus envelopes. It is wired into `npm run check` and the planning-kit guard.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: No live UI adapter was wired. Job results still need to flow through the existing action/effect ledger path before the restored HTML can mutate cash, energy, inventory, or relationship logs.
Next: Build a convenience-store UI adapter first, then fast-food, using `createRestoredLifeJobResult()` as the only wage/condition source.
Do not: Recreate job rewards as direct HTML cash buttons or mutate partner state directly from job minigame handlers.

Date: 2026-05-27
Observed: The life-job contract was isolated and the next smallest useful slice was to make supported house-front place buttons feel playable without growing the restored HTML into another reward formula hub.
Changed: Added `src/restored/jobs/life-job-place-view.js` for convenience-store and fast-food job panels, added `src/restored/jobs/life-job-result-application.js` for applying returned envelopes to the current restored state, wired `completeLifeJobShift()` in `baegeum-city-v2-dice.html`, added `burger_coupon` as a known consumable item, and added a `job_completed` relationship event path.
Verified: `node tools/check-restored-life-job-contract.cjs`, `node tools/check-restored-relationship-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: Browser plugin verification could not access an active Codex browser pane, so no live click-through screenshot verification was completed in this slice.
Next: When browser access is available, visually verify house-front -> convenience-store/fast-food panels and shift buttons. Then choose either the labor-office adapter or pawnshop UI adapter as the next minigame surface.
Do not: Add another inline reward formula to `baegeum-city-v2-dice.html` or mutate partner state directly from a job button.

Date: 2026-05-27
Observed: The labor-office place already existed in the location navigation, but the life-job contract only covered convenience-store and fast-food work.
Changed: Split the starter job catalog into `src/restored/jobs/life-job-catalog.js`, added `job:labor-office`, mapped the `labor_office` place action in `src/restored/jobs/life-job-place-view.js`, made job result application read the title from the job contract, and added `work_gloves` as the labor-office high-grade reward item.
Verified: `node tools/check-restored-life-job-contract.cjs`, `git diff --check`, and `npm run check` passed.
Blocked: Browser plugin verification remained unavailable, so the live in-app labor-office click path still needs visual verification.
Next: Browser-verify house-front -> labor-office panel. After that, the next safe minigame direction is a pure pawnshop UI adapter or a delivery-rush contract.
Do not: Add more job rewards directly inside the HTML shell or expand into pawnshop/debt state through the ordinary life-job contract.

Date: 2026-05-27
Observed: The human asked to add a library, university, and company grind path so the player studies, qualifies for work, earns DP, and advances through job levels.
Changed: Added `docs/plans/restored-study-career-system.md`, `src/restored/career/study-career-contract.js`, `src/restored/career/study-career-application.js`, `src/restored/career/study-career-place-view.js`, and `tools/check-restored-study-career-contract.cjs`. Restored initial/storage state now seeds `education` and `career`, Baegeum place catalog now includes library/university/company district places, and `baegeum-city-v2-dice.html` mounts the study/career panel under Baegeum City jobs.
Verified: `node tools/check-restored-study-career-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry, bus travel to Baegeum City, visible library/university/company buttons, study-gated company unlock, and company shift display separating worked-level wage from promotion label. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: Company levels are still a compact deterministic lane; no university semester calendar, interview event, office minigame screen, resume UI, ranking integration, or relationship reaction has been added yet.
Next: Add a richer company-work choice view or My Info education/career summary before expanding into interviews, resumes, or ranking-by-job.
Do not: Bypass study gates, merge company level with wealth rank, add company wage formulas inside the HTML shell, or make university/company progression depend on online state.

Date: 2026-05-27
Observed: The new study/company loop was playable, but My Info did not yet show study credits, study hours, company level, or promotion progress, making the progression easy to miss.
Changed: Added `src/restored/career/study-career-summary-view.js`, expanded `tools/check-restored-study-career-contract.cjs` to validate it, and mounted a read-only `교육 / 커리어` card in My Info. The card renders credits, study hours, intelligence, current company level, next level, qualification status, and promotion progress without adding My Info action buttons.
Verified: `node tools/check-restored-study-career-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed guest entry and the My Info `교육 / 커리어` summary with current company level, next level, credits, study hours, intelligence, and promotion progress. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: No interview/resume UI, office minigame screen, semester calendar, job ranking, or relationship reaction was added.
Next: Add a richer company-work choice view or a small job-history/reputation selector before interviews, resumes, rankings, or relationship reactions.
Do not: Turn My Info into an action surface, bypass study gates, merge company level with wealth rank, or add company wage formulas inside the HTML shell.

Date: 2026-05-27
Observed: The company lane still had a single generic company work button, so it risked becoming a flat cash generator even though study gates and My Info summaries were in place.
Changed: Added company shift presets to `src/restored/career/study-career-contract.js`: `career:company-shift:documents`, `career:company-shift:overtime-report`, and `career:company-shift:team-support`. Rebuilt `study-career-place-view.js` so Baegeum City jobs shows a company work choice section, and updated `completeStudyCareerAction()` to route all company shift ids through `createRestoredCompanyShiftPresetResult()`.
Verified: `node tools/check-restored-study-career-contract.cjs`, `node tools/check-restored-planning-kit.cjs`, `git diff --check`, and `npm run check` passed. Browser verification confirmed Baegeum City jobs shows 도서관 공부, 대학 야간강의, and the three company work choices; clicking 야근 보고서 updated cash, job title, and My Info education/career summary. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: No job history, job reputation, interview/resume UI, office minigame screen, or relationship reaction has been added yet.
Next: Add a small job-history/reputation selector or event log before expanding to interviews, resumes, rankings, or relationship reactions.
Do not: Add wage/progression formulas inside `baegeum-city-v2-dice.html`, bypass study gates, or turn My Info into an action surface.

Date: 2026-05-27
Observed: Post-backup structure verification passed static checks, but browser probing of the Baegeum City job surface showed locked company-shift buttons with nested double quotes in their inline `onclick` attributes. Those buttons could be parsed as broken attributes before showing the condition-failure toast.
Changed: Updated `src/restored/career/study-career-place-view.js` so disabled study/career buttons emit safe single-quoted `showToast(...)` calls with escaped payloads. The exact Korean UI labels were preserved, while the validation moved from brittle label matching to stable action-id checks plus a regression guard for broken `onclick="showToast("` output.
Verified: `node tools/check-restored-study-career-contract.cjs`, `node tools/check-size.cjs`, `git diff --check`, and `npm run check` passed. Browser verification on `http://127.0.0.1:4173/baegeum-city-v2-dice.html` confirmed the locked company buttons render `showToast('회사 지원 조건 부족: 지능 48, 학점 8')`, clicking them shows the condition toast, and no page error appears. Console noise was limited to the existing Tailwind CDN warning and favicon 404.
Blocked: No broader structural bug was found in the checked stock, travel, Baegeum City job, study, or company-lock flows.
Next: If continuing structure hardening, add a focused smoke check for rendered HTML attributes from every extracted restored view module.
Do not: Reintroduce nested JSON double-quote payloads inside double-quoted inline HTML attributes.

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
3. The save-compatible one-share buy/sell order loop is now in place and browser-verified against the visible Baegeum Electronics DP price.
4. Next market slice should be either order-history display or market snapshot advancement. Do not add United States, Crypto Spot, or Crypto Leverage tabs until that V0.1 loop stays stable.

Restored life minigames:

1. Browser-verify the new convenience-store, fast-food, and labor-office panels once the in-app browser pane is reachable.
2. Keep feeding UI performance into `createRestoredLifeJobResult()` and consume returned effects instead of calculating wages in the HTML shell.
3. Use the new `job_completed` relationship event route for partner reactions to steady work.
4. Keep pawnshop/loan-office in the Dice City contract lane; do not mix collateral/debt state into ordinary job rewards.

Restored study/career lane:

1. Keep library, university, and company shifts inside `src/restored/career/`; do not add new wage or promotion formulas inline in the restored HTML.
2. Add a small job-history/reputation selector or event log before adding interviews, resumes, or rankings.
3. Keep company qualification tied to education credits and intelligence, with promotion state separate from wealth rank.
4. Route future partner/mental reactions through relationship events instead of having company or university buttons mutate relationship state directly.

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
