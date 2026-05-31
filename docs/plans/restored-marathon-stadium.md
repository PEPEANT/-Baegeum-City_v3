# Singularity Race / Restored Marathon Stadium Plan

Conclusion: `특이점레이스` now has a standalone local lobby entry at `singularity-race.html`, while the marathon stadium race itself remains a local 2D preview with online-facing packets shaped for future server-authoritative rooms, checkpoints, finishes, and rankings.

## Feature Identity

- Feature id: `restored:minigame:marathon-stadium`
- Public title: `특이점레이스` / Singularity Race
- Internal title: Restored Marathon Stadium
- Domain: minigame / online-ready race
- Primary surface: standalone lobby page `singularity-race.html`
- Secondary surface: Baegeum city place local practice panel
- Related docs:
  - `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`
  - `docs/baegeum-city-v2-online-state-protocol.md`
  - `docs/baegeum-city-v2-online-lobby-contract.md`
  - `docs/baegeum-city-v2-operations-data-rules.md`

## Current Baseline

- Current playable behavior: the Baegeum city place opens a local 2D marathon preview, and `singularity-race.html` opens the public Singularity Race lobby preview.
- Current files or catalogs involved: restored game contracts live under `src/restored/games/`.
- Existing blockers: real online backend is unavailable. The current connected path is an explicit dev-only adapter opened by `?devOnline=1`, not public matchmaking.

## Intended Player Loop

```text
enter stadium
-> choose local practice or connected online room
-> countdown
-> move with WASD, sprint with Shift, spend stamina carefully
-> use E skills or mouse attacks only when the stop/stall risk is worth it
-> pass N checkpoints in order and receive server-seeded meme-style character assignments
-> if downed, respawn at the last safe checkpoint
-> finish
-> show local result or server-finalized online result
```

## Action Race Rules

- Movement: `WASD` moves freely inside the broad road surface: `A/D` moves backward/forward along trail progress, `W/S` changes the lateral road position, `Shift` sprints, and idle/recover frames restore stamina.
- Skill: `E` is locked on the base/profile skin. Each checkpoint reward replaces the current temporary D-to-S reward slot, and only that reward slot grants the current `E` skill. D skills are intentionally modest; S skills are rare and stronger. Rare, chaos, and legend effects can still be one-use.
- Basic attack: mouse click on the track or the mobile `공격` button performs the same short-range attack. The attacker stalls briefly and the attack has a cooldown, so spamming it should lose race pace. Before the gate opens, basic attack can only stun another runner for positioning practice and cannot reduce HP. After the race starts, hits can stun and deal limited damage; down/respawn still belongs to the combat contract and must become server-owned before public online.
- Soft pass pressure: local preview runners share one broad trail surface, but nearby runners no longer act like hard walls or ghosts. When bodies overlap in progress and lane position, each runner gets a brief speed drag, collision glow, small lane separation, and tiny forward/back separation so the pack feels like soft body contact. Real online collision, body pressure, and position reconciliation must be server-owned.
- Chat focus: `T` focuses the current lobby or room chat input, then `Enter` submits through the current channel transport. Player chat also creates a short runner-head bubble on the local avatar, with a capped display length and a small send cooldown/burst guard so chat spam cannot flood the running surface.
- Checkpoints: the course can have any N-stage checkpoint plan. Each checkpoint may assign a new server-seeded character from the meme-style original catalog.
- Down state: attack damage or strong skill effects can down a runner; the runner respawns at the last safe checkpoint instead of being eliminated.
- Balance target: attacks are for mid-pack chaos and clutch defense, not the main way to win. The fastest line should usually be clean movement, sprint timing, and checkpoint routing.

## Contract Status

- Core race contract: `src/restored/games/marathon-contract.js`
- Input contract: `src/restored/games/marathon-input-contract.js`
- Character and skill contract: `src/restored/games/marathon-character-skill-contract.js`
- Reward grade and placeholder skin helper: `src/restored/games/marathon-reward-grade.js`
- Combat and respawn contract: `src/restored/games/marathon-combat-contract.js`
- Single trail geometry: `src/restored/games/marathon-trail-geometry.js`
- Local preview view: `src/restored/games/marathon-stadium-view.js`
- Player flow and UI helpers: `src/restored/games/singularity-race-flow.js`, `src/restored/games/singularity-race-queue.js`, `src/restored/games/singularity-race-track.js`, `src/restored/games/singularity-race-local-sim.js`, `src/restored/games/singularity-race-prediction.js`, `src/restored/games/singularity-race-runner-motion.js`, `src/restored/games/singularity-race-dev-online.js`, `src/restored/games/singularity-race-control.js`, and `src/restored/games/singularity-race-camera.js`, with `src/restored/games/singularity-race-runner-view.js` as the shared runner DOM helper.
- Dev-only connected adapter: `src/restored/online/marathon-room-adapter.js`
- Dev-only host room policy: `src/restored/online/marathon-room-policy.js`
- Dev-only channel adapter: `src/restored/online/marathon-channel-adapter.js`
- Dev-only chat transport and room-scoped storage key: `src/restored/online/marathon-dev-chat-transport.js`, `src/restored/online/marathon-dev-chat-storage.js`
- Dev-only room packet transport: `src/restored/online/marathon-dev-room-transport.js`
- Netcode budget and packet pressure contract: `src/restored/online/marathon-netcode-contract.js`
- Server tick/snapshot loop contract: `src/restored/online/marathon-server-loop-contract.js`
- WebSocket dev loop harness: `src/restored/online/marathon-websocket-dev-loop.js`
- Server transport contract and adapter: `src/restored/online/marathon-server-transport-contract.js`, `src/restored/online/marathon-server-room-adapter.js`
- Server role/session and chat replay contract: `src/restored/online/marathon-server-session-contract.js`
- Server provider flow adapter: `src/restored/online/marathon-server-provider-adapter.js`
- Server-owned movement state contract: `src/restored/online/marathon-server-state-contract.js`
- Server-owned attack/combat state contract: `src/restored/online/marathon-server-combat-state.js`
- Server-owned skill state contract: `src/restored/online/marathon-server-skill-state.js`
- Server-owned checkpoint and finish state contract: `src/restored/online/marathon-server-race-state.js`
- Server start-position seeding: `src/restored/online/marathon-server-start-position.js`
- Local WebSocket dev server mock: `src/restored/online/marathon-websocket-dev-server-mock.js`
- Local WebSocket dev server validation: `src/restored/online/marathon-websocket-dev-server-validation.js`
- Standalone lobby entry: `singularity-race.html`
- Standalone admin entry: `singularity-race-admin.html`
- Contract version: `restored-marathon-001`
- Runner cap: `RESTORED_MARATHON_MAX_RUNNERS = 30`
- Spectator capacity: dev/default `maxSpectators = 32`, host policy clamps to the contract spectator cap and does not consume runner slots.
- First verification: `tools/check-restored-marathon-contract.cjs`

The contract owns both the local race math and the online-ready message vocabulary so the feature does not scatter small protocol files.

The action-race layer uses WASD movement, Shift sprint, checkpoint-reward `E` skill use, and mouse-directed attack. `src/restored/games/marathon-input-contract.js` normalizes movement inputs into server-checkable frames. The base profile skin has no `E` skill; the current D/C/B/A/S checkpoint reward grade owns the temporary skill pool and charges until the next checkpoint replaces it. Mouse attacks intentionally lock or stall movement, so running remains the best default strategy.

`src/restored/games/marathon-character-skill-contract.js` owns checkpoint character assignment and skill metadata. Each checkpoint can grant a deterministic server-seeded meme-style original runner such as `도로롱 주자`, `분노의 댓글러`, `추천요정`, or `새벽반 고인물`. These are parody/original labels, not a hard dependency on external character IP. Common characters have modest movement or disruption tools; rare and legend characters can have one-use skills.

The checkpoint reward contract now carries a live reward-grade layer: `D`, `C`, `B`, `A`, and `S`. The current race uses a three-stage reward loop so each character roll is spaced farther apart on the long course: stage 1 uses the low D/C pool, stage 2 unlocks stronger A-grade candidates, and stage 3 can expose S-grade characters while still using deterministic server-seeded assignment. Until final checkpoint skins are added, every checkpoint reward rolls a placeholder skin grade from D to S, shows it as an in-race reward cue, briefly applies a grade badge/aura to the runner avatar, and assigns the current `E` skill from that grade's pool. Reaching the next checkpoint replaces the previous temporary reward skin, skill id, skill grade, and charges. The server skill boundary also rejects any stored skill id that does not belong to the runner's current reward-grade pool, so a D-grade reward cannot fire an S-grade skill even if state is corrupted. The placeholder reward grade is intentionally separate from visible profile skin choice so future round rewards can change the runner ability set without rewriting the profile skin picker.

`src/restored/games/marathon-combat-contract.js` owns mouse attack hit tests, attacker stall, slow/knockback results, runner-down state, and checkpoint respawn envelopes. If a runner is downed, they return to the last safe checkpoint rather than being eliminated.

`src/restored/games/marathon-trail-geometry.js` owns the public course shape: one shared 2D maze-stadium trail, three save points, SVG path generation, pointer-to-progress estimation, and the matching marathon-distance checkpoint meters. The current single map follows the human draft: a long lower sprint, a folded right-side maze section, and a long upper finish straight while keeping one authoritative progress path for ranking and online snapshots.

The restored HTML now mounts the local preview view from the Baegeum street surface through `marathon_stadium`; this is a local practice panel, not an online lobby.

The local preview advances in one-minute strategic ticks, shows the next checkpoint split, and renders a read-only online packet rail (`join_request`, `input_update`, `state_snapshot`, and checkpoint or finalization packet) so later server work has visible protocol anchors without exposing a fake lobby.

The standalone `특이점레이스` lobby opens local-only by default. The player-facing flow is now intentionally simple: first online entry shows nickname plus skin selection, then a single room-list lobby with no visible chat, runner count, ready count, quick-entry control, notice box, or protocol/debug rows, then a `대기열` view with only runner slots, a `맵 미리보기` button, and chat, then a separate map preview screen, then the race screen only after admin/direct race entry. The queue view intentionally hides top metrics, ready counters, ready buttons, duplicate room cards, channel tabs, badges, and explanatory copy so phone portrait and landscape stay readable. The map preview is a whole-course schematic, not the player-follow camera: it hides runner/HUD overlays and fits the full trail, save points, and finish section into the preview panel. The old room/ready state name is no longer used in the player flow; the normal states are `profile -> lobby -> queue -> mapPreview -> race`. The standalone page is now a thinner controller: `singularity-race-flow.js` owns screen ids and short flow copy, `singularity-race-queue.js` owns queue slots and chat rows, `singularity-race-track.js` owns repeated track-effect DOM helpers, `singularity-race-local-sim.js` owns start paddock and local bot movement, `singularity-race-prediction.js` owns connected local movement prediction plus server reconciliation, `singularity-race-runner-motion.js` owns the pure guard that prevents held keys at road boundaries from pretending the runner is still moving, `singularity-race-dev-online.js` owns the dev room relay wrappers plus server snapshot-to-runner display merging, and `singularity-race-control.js` owns the dev-only start-countdown command shape, room-scoped storage key, broadcast name, and phase label. `singularity-race-runner-view.js` remains the shared runner DOM helper. Connected `state_snapshot` packets now feed those display layers without adding more inline HTML script. Once the player is in the race screen, lobby sidebars, waiting-room controls, top lobby status bar, track header, action HUD, checkpoint strip, standings, packet rails, progress pill, map caption, and start-gate text are hidden so the race screen stays focused on the in-game stadium surface. Race screens now keep Drawing World-style chat open as a compact top-left overlay, keep only a non-overlapping `대기열 보기/닫기` button near that chat, add a top-right gear options button, and use an enlarged route minimap. PC keeps keyboard/mouse controls with no visible circular pad. Mobile shows a text-free dragged circular joystick, a separate `달리기` hold button, and bottom attack/skill/chat input buttons; the old visible `WASD`, `채팅창 열기/닫기`, and play-status buttons are intentionally removed. The normal race skin picker now uses `src/skins/singularity-race-skin-presets.js`, a small original meme-style runner pack, instead of exposing casino/general-citizen or old robot/anime presets.

Current screen guard: `mapPreview` clears runner nodes, track HUD nodes, start-gate nodes, and the race minimap at render time, then sizes the track world to the preview panel so the whole route is visible instead of following the player camera. `race` owns a full-viewport stadium surface with the page scroll locked, no panel header or bottom status cards, and a top-right minimap for route orientation.

Current race camera guard: `src/restored/games/singularity-race-camera.js` owns `fixed`, `soft-follow`, and future `road-follow` camera math. The redesigned maze course defaults to fixed, non-rotating follow because rotation amplified server correction and body-contact jitter. Optional road-follow math remains guarded for later experiments and is capped to a mild 35 degrees, but normal play should keep the UI, runner sprites, and attack targeting stable while the camera follows the player without spinning the whole track. `tools/smoke-singularity-race-camera.cjs` guards this math in the full check chain.

Current host camera guard: `singularity-race-admin.html` renders the whole-course spectator camera as a flattened full-map view. Its SVG uses `preserveAspectRatio="none"` so the track path and absolutely positioned runner markers share the same 0-100 coordinate space, and runner lane offsets are converted through `progressToRestoredMarathonMapPoint()` in `src/restored/games/marathon-trail-geometry.js` using the same `9200 x 3600` world-size ratio as the player track. This prevents the host camera from drawing the trail in a centered SVG letterbox while placing runners in full-frame percentages.

Current render budget guard: the hot 60 ms local preview loop uses `renderActionPreviewFrame()` instead of full-page `renderAll()`. Track and runner positions stay hot, while action HUD, standings, and queue slots are throttled; chat messages, skin cards, channel tabs, and debug rails are not redrawn every movement tick. The race minimap caches its static SVG and moves only the player dot. `tools/smoke-singularity-race-render-budget.cjs` guards this so future UI work does not accidentally reintroduce full DOM redraws into the movement loop.

Current running-screen ranking guard: the active race surface no longer renders live ranking rows or rank-change cue bubbles while the player is running. Ranking is still calculated for final results and server authority checks, but the in-race display should stay clean until the result panel appears after finish.

Current running-feel guard: the active race loop is driven by `requestAnimationFrame(advanceActionPreviewLoop)` and exits immediately outside the `race` screen. The hot visual layers must not rely on CSS `left/top` transitions or camera transform transitions, because those make server smoothing and client prediction look like ghost trails. Runner DOM nodes move to the current visual point immediately; a per-runner `runnerMotion` cache decides whether the child sprite is idle, running, sprinting, or facing left/right, and the child image/shadow animation supplies the running feel. Side-view skins flip through `--runner-facing-scale` instead of needing separate left-facing assets. The runner DOM helper also tags each avatar with a lightweight skin run style (`stride`, `quick`, `bounce`, `hop`, `robot`, `glide`, or `heavy`) so the same static sprite pack can read less frozen without adding many image frames yet. The local player only keeps the run cycle alive from held or very recent movement input, while server correction is gentler during that short input grace. Collision and stun feedback also stay on the child sprite instead of animating the parent avatar transform, so it does not fight road-follow camera counter-rotation. Hidden-tab changes release movement keys so a missed keyup cannot leave the runner drifting. Start-paddock and active race speed constants are guarded so accepted key input is visibly responsive, `Shift` sprint must remain clearly faster than normal running, and `W/S` lane speed is pixel-tuned against the progress axis so lane movement no longer feels dead while still staying below forward sprint speed.

The connected room gate only opens with the dev query `?devOnline=1`, then requires `join_result ok` from `src/restored/online/marathon-room-adapter.js` before a connected room is shown. Player-facing UI no longer exposes `join_request`, `state_snapshot`, netcode budget rows, relay packet counts, raw room ids, or `SERVER LOCKED` status unless the page is opened with `?debug=1`. Room waiting chat still has visible room, lobby, and spectator channel tabs backed by the dev channel adapter, while system/dev messages are hidden from the normal chat surface.

Current connected staging guard: normal connected player entry now lands on the race staging surface, not the queue, while the debug `button` source may still stay in queue. A fresh connected join resets the action state, clears the room-scoped dev packet relay storage, and blocks connected `input_update`, `skill_use`, and `attack_action` requests until the host countdown actually opens the race. Before that point, the local player can still move inside the gated start paddock for positioning and can stand almost flush against the visible start gate instead of stopping behind a wide invisible wall. When the countdown ends, the start gate remains briefly and opens with a short slide/rotation animation before leaving the track. If a host `start_countdown` command is already in progress when the connected join completes, the countdown is reattached after the join reset. Start commands are accepted only for the current dev room id and cannot skip the first profile setup screen. A stored command whose gate already opened is only treated as active for a short player join grace window or the longer spectator late-join window, so an old localStorage start signal cannot permanently remove the start gate from a fresh staging session. When the dev server race starts, the player page now seeds the server-owned room from the current start-paddock `progress` and `laneOffsetPx`; this prevents the first racing snapshot from snapping runners back to server default positions. Server-owned snapshots now carry `laneOffsetPx`, and server input applies `W/S` as road-lane movement while keeping side-only input from advancing race progress. After the gate opens, the local player display applies client-side prediction every frame and stores the latest server `progress` and `laneOffsetPx` as reconciliation targets, smoothing small corrections and snapping only large divergence back to server authority.

The standalone lobby also has a first local action preview wired to those contracts: keyboard frames can move the local runner, `E` can consume or request the assigned skill, and mouse clicks on the track run the attack contract. The preview now renders an action HUD with current character, skill charge state, HP, cleared checkpoints, and a server-shaped action packet rail for `skill_use`, `attack_action`, `checkpoint_reward`, and `respawn_notice`. This is only a local feel test; connected mode still treats movement, skill use, attack hits, checkpoint rewards, respawns, and race finalization as server-authoritative.

The single-trail lobby now also renders local-only race feedback on top of the SVG trail: a player focus ring, a progress and next-save pill, and short visual cues for checkpoint, skill, hit, respawn, and local finish-preview moments. The local race progress clamp reaches the real 100% finish instead of stopping short, and `LOCAL_FINISH_PROGRESS` only creates a local server-owned `race_finalized` rehearsal packet plus ranking preview. Local finish and connected `state_snapshot` finish rows now share one minimal in-race result layer (`race-result-panel`) so the clean race screen can close the loop without bringing back the old bottom HUD. The result layer exposes a `다시 대기` return button that clears the current race/action/session preview state and re-enters the lobby or queue instead of trusting the finished local state for another run. These cues are cosmetic and must not become the source of online checkpoint, hit, respawn, finish, ranking, or reward authority.

The local lobby no longer auto-fills the room with test runners. A fresh room starts empty on the host page, and a player join adds only that player. The host page can explicitly add or clear a 30-runner test pack for rehearsal; those bots are treated as development test actors and are filtered away when the test-bot command is off. Runners are no longer forced into a straight line; each runner owns trail `progress` plus a `laneOffsetPx` inside the road width. Before the race starts, players can move freely inside the staging area but cannot pass the gate. The admin page sends a dev-only `start_countdown` control signal, the lobby shows a 10-second countdown, and the gate opens on `GO`. This still does not send per-frame positions or pretend to be public multiplayer.

The test-bot path is separated at the dev server boundary too: host-spawned rehearsal actors join with `participantType: "bot"` and a bot role, while the real player remains `participantType: "player"`. Connected player attack and skill packets now pass through the WebSocket-shaped dev server `ingestClientEnvelope()` path and receive a server-owned snapshot after accepted action resolution, instead of remaining only a local relay/log packet. Public online must keep this same client-request/server-decision shape.

Checkpoint rewards and finish claims now have the same server-owned rehearsal boundary. Clients may send `checkpoint_claim` and `finish_claim`, but the dev server decides whether a checkpoint was reached, prevents duplicate character rewards, assigns the checkpoint character/skill with a deterministic server seed, and emits `race_finalized` only from server-owned ranking state.

The standalone lobby track now renders inside a larger camera-followed world instead of fitting the full route into the viewport. The player stays centered while the maze-stadium trail scrolls underneath, SVG stroke widths are locked with non-scaling strokes so the road width stays consistent through the lower straight, right-side folded corridors, and upper finish straight, and runner sprites are transparent image layers rather than dark framed cards. The track world remains deliberately long and wide (`9200x3600` preview pixels), while the current three save/reward stages are spaced across the new route instead of the old log curve. Camera zoom defaults to `100%`; PC can zoom the race camera with the mouse wheel, mobile can pinch the track surface, and the options panel resets the camera to `100%`. The current visual style borrows the Drawing World paper/grid feeling: light paper panels, simple room cards, compact chat, a pale stadium field, a gray road, muted green-gray rail, and darker yellow dashed center line instead of a black curb that fights the road surface. The local starting pack keeps all 30 runners in the same gated start area, scatters them across the road width, lets them shift positions before release, then starts each runner from their current local position when the admin countdown opens the gate. The usable lane clamp now reaches close to the visible road walls instead of leaving a transparent inner buffer, while still keeping runner centers inside the road. Runner names are attached inside the same avatar node and pinned under the feet so sprint/interpolation cannot leave names behind; the head area stays reserved for future health bars and status effects. The local preview pacing is now tuned for feel first: staging movement is quick enough to claim a start spot, `Shift` makes forward running visibly faster, and `W/S` lane movement now uses `150px/s` normal and `210px/s` sprint so it is visible on the fixed camera without becoming the main speed button. The final public race duration still belongs to server-owned balance values after connected movement exists. The skin picker now highlights requested race favorites first: `kaguya`, `singularity-fan`, `robot`, `gpichan`, `pepe-runner`, `moderator-armband`, `yalrkun`, `lakers-wile`, `sam-altman`, and `demis-hassabis`.

`singularity-race-admin.html?devOnline=1` is the separate dev-only future host page. The lobby includes a visible admin-page link so the page can be checked in-game during development. The page now presents a simplified Korean host surface instead of raw packet metrics, explanation copy, or hidden status-card leftovers: compact room controls, spectator capacity, start/test-bot buttons, whole-course map, a short runner list, and one quiet room chat view. System chat rows are filtered out of the visible host chat so local gate/skill/attack debug notices do not distract the operator. Without the dev gate, the page stays an operating shell and must not expose real authority.

The host page still reads the dev room packet relay internally, but it no longer makes room packet counts, channel counts, stored-message counts, or connection-gate labels part of the visible UI. Its dev-only countdown control writes a separated room-scoped local race-control signal through `src/restored/games/singularity-race-control.js` so the game page can rehearse admin-started gate release without making local race results authoritative. Real public online must move this to server-authenticated host authority and server-owned room start time.

`src/restored/online/marathon-dev-chat-transport.js` is the temporary connected-room chat transport boundary. It persists the latest 500 dev chat records to the local dev chat log so lobby, queue, race, and admin page refreshes do not wipe chat history during testing. Lobby and admin pages now talk to this adapter instead of reading and writing chat storage directly. The adapter also uses a same-origin broadcast relay when available, so separate lobby/admin tabs refresh channel messages without coupling their UI code. Real public online must replace this local log with server-owned room chat history, pagination, moderation state, and reconnect replay.

`src/restored/online/marathon-dev-room-transport.js` is the temporary dev-only room packet relay. After `?devOnline=1` and `join_result ok`, the lobby writes validated server-shaped join, input, skill, attack, and snapshot envelopes into a room-scoped local packet log and broadcasts updates to same-origin dev clients. It is a delivery rehearsal, not a public backend, and cannot make local attack/checkpoint/finalization decisions authoritative.

`src/restored/online/marathon-netcode-contract.js` owns the 30-runner latency and bandwidth budget before a real server exists. The baseline is 20 Hz input requests, 10 Hz server snapshots, compact runner deltas, client-side interpolation, and adaptive lanes (`smooth`, `buffered`, `degraded`, `critical`) that reduce send/snapshot cadence when ping, jitter, or packet loss is bad. It also owns the dev relay packet pressure report, rate-limit decision, visual anti-teleport policy, ping sample math, and reconciliation hints. Remote and bot runner display positions should move through `resolveRestoredMarathonVisualStep()` instead of drawing every server/bot correction immediately; only very large corrections are allowed to snap. The lobby renders this budget so optimization stays visible while testing. `tools/smoke-singularity-race-progression.cjs` is the repeatable local gate for start-to-finish reachability, Shift+D sprint input, 30-runner bandwidth, degraded-lane behavior, packet spam rejection, anti-teleport smoothing, bot movement when the player is stopped, and the shared local/server race-result UI hooks. It now runs inside `npm run check`.

`src/restored/online/marathon-server-loop-contract.js` owns the server runtime cadence before a real socket exists. It fixes the default 20 Hz simulation tick, 10 Hz server snapshot emission, catch-up tick cap, snapshot due calculation, stale snapshot backlog dropping, and latest-input-per-participant coalescing. This prevents the future WebSocket/Firebase transport from accidentally applying every noisy client frame directly, emitting snapshots every render frame, or trying to replay a huge snapshot backlog after a paused tab resumes.

`src/restored/online/marathon-websocket-dev-loop.js` applies that cadence to the local WebSocket-shaped dev server mock. It queues client input envelopes, runs only due server ticks, coalesces duplicate runner input inside each tick, emits due server-owned snapshots, and returns the next loop state without depending on browser render frames.

The player page now has a deterministic in-page dev snapshot feed behind `?devOnline=1`: after a dev room join it creates the WebSocket-shaped server mock for that room, joins one local player plus bot clients up to the 30-runner cap, initializes the server loop clock from the current browser time, and lets `advanceConnectedDevSnapshotFeed()` publish server-owned snapshots through the existing dev room relay. Player and bot input are generated for the server loop, but normal UI rendering still consumes only `state_snapshot` rows.

`src/restored/online/marathon-server-transport-contract.js` is the first server-shaped transport contract boundary. It does not open a real socket yet. It fixes the unavailable default, WebSocket/Firebase-style provider config without embedded secrets, connected transport snapshot, and the packet envelope shape for `hello`, `join_request`, `join_result`, `chat_send`, `chat_delivered`, `chat_history`, `input_update`, `skill_use`, `attack_action`, `checkpoint_claim`, `finish_claim`, `checkpoint_reward`, `respawn_notice`, `state_snapshot`, `race_finalized`, and disconnect notices. `input_update` packets now preserve normalized direction and input mode so the server can distinguish forward marathon movement from lateral-only movement. `src/restored/online/marathon-server-room-adapter.js` can now build a `server_transport` room adapter only when a connected server transport snapshot and server-provided room list are injected.

`src/restored/online/marathon-server-session-contract.js` owns the next real-online boundary for role assignment and chat replay. It creates server-owned `player`, `spectator`, `host`, and `admin` sessions, converts late runner joins into spectator sessions, blocks spectators from movement/attack/skill packets, lets host/admin chat through trusted server metadata, and replays approved room chat history only through channels visible to that session role. This is the contract that future WebSocket or Firebase code should call before accepting any client packet.

`src/restored/online/marathon-server-provider-adapter.js` owns the first real provider flow boundary before an actual WebSocket or Firebase SDK is attached. It is a pure state machine for `hello -> hello_result -> join_request -> join_result -> chat_history -> state_snapshot`: clients can only create `hello`, `join_request`, and reconnect `hello` requests, while server packets must come from a server origin and chat history/snapshots must be marked `serverOwned`. Reconnect grace deliberately blocks runner input until server chat history is replayed and a fresh authoritative runner snapshot is received, so WebSocket and Firebase providers do not each invent separate reconnect behavior.

`src/restored/online/marathon-server-state-contract.js` is the first server-owned movement boundary, while `src/restored/online/marathon-server-combat-state.js` owns the matching attack boundary, `src/restored/online/marathon-server-skill-state.js` owns the first skill-use boundary, and `src/restored/online/marathon-server-race-state.js` owns checkpoint rewards plus finish claims. Together they start a server room, convert accepted `input_update` envelopes into server input commands, reject stale input sequences, advance only server room participants, keep side-only input from increasing race progress, validate `attack_action` range/arc/cooldown on server state, validate `skill_use` against server-held character/skill ids plus charge/cooldown state, validate checkpoint reach/duplicate rewards, apply stun/damage/skill/reward effects without trusting client-origin effect values, stamp finish time, and emit server-owned runner snapshot rows and final ranking envelopes. The player page now consumes compatible `state_snapshot` rows through `mergeSingularityServerSnapshotRunners()`, preserving local display skin/name data while replacing progress, lane, hp, stun, skill, sequence metadata, and race phase from the server payload. This is still a contract/mock layer, but it proves the public server shape before any real socket or Firebase provider is connected.

`src/restored/online/marathon-websocket-dev-server-mock.js` is the local WebSocket-shaped server rehearsal. It does not open a public port or require a WebSocket package. It consumes the server transport and server-state contracts, creates a connected `websocket` transport snapshot, exposes a server-backed room adapter, accepts only client-owned packets (`chat_send`, `input_update`, `skill_use`, `attack_action`), rejects server-owned finalization/snapshot/reward packets from clients, applies the netcode packet-pressure guard, applies accepted input and attack actions to server-owned runner state during `racing`, and emits server-created `join_result`, `chat_delivered`, and `state_snapshot` envelopes. Dev `state_snapshot` payloads are now explicitly `serverOwned`, carry `movementAuthority: "server"`, snapshot id, server tick/snapshot cadence, hp/stun/cooldown state, ping sample, and reconciliation metadata so the next real transport can replace the mock without trusting local positions.

## UI Surface Plan

- Top bar impact: standalone lobby shows only the public game title above the room list. Runner count, readiness count, room chat, and connection/debug status do not appear until the player enters the room or opens `?debug=1`.
- Player flow impact: the normal standalone page should move through `profile -> lobby -> queue -> mapPreview -> race`; debug and protocol details belong behind `?debug=1`. The `대기열` screen should stay at runner slots, `맵 미리보기`, and chat only, and `맵 미리보기` must return to the queue instead of starting the race.
- Bottom nav impact: no permanent marathon tab. The stadium should be a city/place entry.
- Phone app impact: online rooms and season rankings belong behind a connected phone online lobby or rankings app.
- Modal or panel impact: first local panel should show course, standings, pace buttons, stamina, checkpoints, and finish result.
- Mobile constraints: pace controls should be four compact buttons: recover, steady, push, sprint.
- Illustration or image slot: lobby skin thumbnails use the Singularity Race SVG preset adapter; stadium background and runner sprites can use manifest ids later; no direct asset paths in the contract.

## State And Catalog Plan

- New state fields: local race state may be mounted under a future `marathon` slice, but online results must not trust local save state.
- Static catalog entries: future stadium place id should be `baegeum:marathon-stadium`.
- Migration or save compatibility: no save migration in the contract slice.
- Selectors needed: local best time, latest rank, checkpoint progress.
- Events produced: race result, ranking snapshot candidate, online authority request, UI message.

## Online Authority

Online marathon uses room authority from the start:

```text
lobby -> countdown -> racing -> finished
```

Required packets:

- `join_request`
- `join_result`
- `input_update`
- `skill_use`
- `attack_action`
- `checkpoint_reward`
- `respawn_notice`
- `checkpoint_claim`
- `finish_claim`
- `state_snapshot`
- `race_finalized`

Server-owned decisions:

- room membership
- start time
- checkpoint order
- finish time
- final rank
- checkpoint character assignment seed
- skill charge validation
- attack hit validation
- checkpoint respawn position
- single-rail collision order and no-pass resolution
- online leaderboard snapshot
- reconnect grace and expiration
- netcode lane selection for real connected rooms when client metrics are untrusted

Client-owned local preview:

- bot simulation
- camera and runner interpolation
- local practice result
- visual effects
- interpolation display and cosmetic reduction while the server stays authoritative

Do not show a fake offline online lobby. Offline local practice is a different button and must not look like a connected room list.

Current dev-only adapter rules:

- Default adapter is unavailable and exposes no room list.
- `?devOnline=1` creates a dev adapter using adapter type `dev_mock`, but it no longer auto-creates a visible room when the local dev room registry is empty.
- The dev host page owns local room creation for rehearsal. `방 만들기` writes a room registry entry, `방 설정` updates the room name and spectator cap, and `방 삭제` removes the registry entry and clears that room's local packet relay. This keeps the normal player lobby empty until a host explicitly opens a room.
- Admin direct-game links now include the selected `roomId`, and the player page orders the dev adapter around that room before joining. If `adminLaunch=1` is present but no matching dev room exists, the page stays in profile/lobby instead of showing the race surface.
- The connected lobby gate opens only when the online adapter reports `connected` and `lobbyEnabled`.
- Normal player UI must keep the dev connected gate, packet log, netcode budget, relay guard, raw ids, and server authority labels hidden unless `?debug=1` is present.
- Room join is blocked on map, venue schema, or protocol mismatch.
- Runner joins are lobby-only. If a race is already in countdown or racing, late arrivals must join as spectators and are checked against the separate `maxSpectators` policy.
- The dev host page stores a local host room policy for spectator capacity so the future server transport can replace it with authenticated room settings instead of mixing spectator limits into the player UI.
- Spectator joins use their own participant type. Spectators can enter during countdown/racing, view the active runner snapshots, and chat in the shared room/spectator/notice surfaces, but must not publish movement, attack, skill, ready, or host-control packets.
- The host/admin role can chat with the room while keeping host-only controls separate. Admin/host authority must stay authenticated by the future server transport; normal players and spectators cannot see or send to the admin channel.
- Successful dev join emits `join_request`, `join_result`, and `state_snapshot` packets.
- A fresh dev connected player join clears stale room relay packets, starts from race staging, and can only publish movement, skill, or attack packets after the start gate opens.
- Dev host countdown commands are reattached after connected join resets. Running commands have bounded late-sync grace instead of lasting forever in localStorage.
- Dev server race start seeds authoritative runner progress/lane from the current paddock positions, pins the local reconciliation target to that seed, and emits an immediate racing `state_snapshot` with `laneOffsetPx` so start release does not jitter back to default lane rows. The dev server loop and ping sampler must accept modern epoch millisecond clocks; a low timestamp clamp can freeze 10Hz snapshots and make the local runner rubber-band after Shift sprint.
- Dev chat channels are pre-created as `lobby`, `room`, `spectator`, `admin`, and `system`; players cannot see or send to the admin channel.
- Dev room records live in `src/restored/online/marathon-dev-room-registry.js` and are a local development registry only. Public online must replace this with server-owned room creation, host authentication, and persistent room settings.
- The lobby and admin pages share the same local dev chat log through a room-scoped key under `singularity-race:chat:v1:<roomId>` via the dev chat transport until real server chat delivery exists.
- The dev chat log keeps the latest 500 messages locally across refresh/re-entry for the same room, while room creation/deletion clears the local packet, command, and chat storage for that room id. This is for development continuity only; public chat history must be server-owned, channel-scoped, paginated, and moderation-aware.
- The dev room packet relay stores room packets under a room-scoped local key and relays same-origin updates after `join_result ok`; it is still gated by `?devOnline=1`.
- The dev host/admin page can observe that room-scoped packet relay internally, but the visible page should stay a Korean room/camera/player-watch surface until real server-authenticated host authority exists.
- The dev host/admin page can send the local `start_countdown` gate-control rehearsal. Real public online must move this to a server-owned room start time and authenticated admin or host command.
- The visible host page should not expose raw packet counts, channel counts, stored-message counts, or connection-gate labels as the primary operator UI.
- The 30-runner netcode budget keeps default upstream near 8 kbps per player and downstream under the documented player budget using input coalescing, server snapshots, and interpolation rather than per-frame position spam.
- The dev room packet relay uses the netcode packet pressure guard to block per-client action packet spam above the input budget while still allowing room setup and snapshot packets.
- The client display path has an anti-teleport layer: remote and bot target coordinates are smoothed toward their authoritative target with a max visual step, and only corrections beyond the snap cap are applied instantly. The local player uses a prediction/reconciliation layer: input changes display position immediately, server snapshots keep authoritative progress/lane targets, small correction deltas are eased, and large divergence snaps back to server authority.
- Dev connected snapshots are server-owned rehearsal packets: they include `snapshotId`, server tick/snapshot cadence, ping sample, and reconciliation metadata. These values are for testing the correction path only; real public rooms must compute them on the backend from server time and authoritative runner state.
- The dev WebSocket-shaped mock now applies accepted `input_update` packets to server-owned room participants and snapshots the resulting progress. Client-side local progress remains display-only and cannot finalize public results.
- Connected finish snapshots and local preview finish both flow through `finalizeRaceResult()`. The result layer may display finish/rank feedback, but public rewards, final order, and finish times still require a server-owned `race_finalized` event.
- The server transport contract is unavailable by default and only validates server-shaped config, snapshots, and envelopes; it does not create a fake online backend.
- The server transport adapter can represent future WebSocket or Firebase providers, but it opens the connected lobby only when a connected transport snapshot and server room list are injected. No Firebase app config, API key, token, or secret belongs in this client contract.
- The server session contract must assign the final role for every room client. Clients may request `player` or `spectator`, but the server can convert late runner joins into spectator sessions and must ignore spoofed sender ids or sender roles in chat packets.
- The server provider adapter must keep the initial remote flow ordered as `hello -> join -> chat_history -> state_snapshot`; clients cannot accept spoofed chat history or snapshots from non-server origins.
- Server chat history replay must be server-owned, moderation-aware, channel-filtered, and cursor/sequence based. The client can request recent history, but it cannot decide which admin/host/spectator messages are visible.
- The local WebSocket dev server mock is a contract test harness only. It can prove handshake, room list, join, server-owned start, packet ingest, server movement, snapshot creation, finish clamp, and rate limiting without binding a network port or exposing public matchmaking.
- The dev adapter marks rooms as `SERVER_REQUIRED`; local completion or ranking still cannot become authoritative.

## Real Online Readiness

Current problems to solve before public online:

- The player page now applies periodic dev `state_snapshot` rows from the in-page server loop, but public play still needs a real WebSocket/Firebase provider, backend room process, and server persistence.
- Chat history is only a local dev log. Public rooms need server-owned message persistence, recent-history replay, pagination, moderation status, mute/ban handling, and room/channel retention rules.
- Single-rail collision, attack hits, checkpoint rewards, respawns, finish order, and ranking are still local preview or mock-contract rehearsals. Public play must move all of those decisions to the server.
- The 30-runner bandwidth budget is documented and smoke-tested, but real rooms still need load tests for bursty input, chat spam, disconnect/reconnect, tab throttling, and slow phones.
- The current player camera now defaults to fixed follow on the maze-stadium course. Public play still needs full-race feel tuning for deadzone, zoom limits, minimap readability, and attack targeting on both phone and PC.

Implementation path for the real online bridge:

1. Replace the local dev room relay with a real WebSocket or Firebase transport adapter behind the existing server transport contract.
2. Keep clients input-only: send `input_update`, `skill_use`, `attack_action`, and `chat_send`; never send authoritative position, reward, respawn, finish, ranking, or snapshot packets from clients.
3. Add server chat history replay: join returns recent channel messages, and scrolling can request older pages.
4. Add reconnect grace: a reconnecting player receives the latest server room state, recent chat, and their authoritative runner snapshot.
5. Run 30-runner soak tests for at least one full race duration with packet pressure, ping, and visual correction metrics visible to the host page.
6. Promote attack, skill, checkpoint reward, respawn, and D/C/B/A/S character grade decisions from local rehearsal into server-owned handlers.

Camera direction plan:

- Keep the UI, buttons, chat, queue overlay, and HUD unrotated.
- Keep normal play fixed and non-rotating on the redesigned maze-stadium course.
- Optional camera experiments may rotate only the track world, never the HUD, chat, controls, or minimap shell.
- Use `progressToRestoredMarathonTrailPoint(progress).tangent` as the target road direction, with pixel aspect correction before calculating the rotation angle.
- Smooth the camera angle over time and clamp per-frame angular change so it feels like the road turns under the player, not like the screen snaps. This is now wired through `smoothTrackCameraRotation()`.
- Default mode is currently `fixed` in `singularity-race-camera.js`: no road rotation during normal play, with `soft-follow` and `road-follow` kept as future experiment modes only.
- Add an accessibility/debug option for `fixed`, `soft-follow`, and `road-follow` before making rotation permanent.
- Pointer-to-track math and attack targeting now use the camera module's inverse transform through `eventToTrackWorldPercent()`. Mobile virtual controls are unaffected because they publish directional input rather than world click coordinates.

## Ranking Impact

- Local rank impact: local practice can show latest place and best time.
- Online leaderboard impact: server snapshots can later expose `marathonBestTime`, `marathonWins`, and `marathonSeasonPoints`.
- Job or occupation ranking impact: none in the first slice.
- Board ids: `marathonBestTime`, `marathonWins`, `marathonSeasonPoints`.
- Snapshot shape changes: reuse the phone ranking snapshot pattern with server-owned entries.
- Server authority needed: all online boards.

## Economy And Rewards

- Cash/chips/items affected: none in the first contract slice.
- Ledger or event boundary: future prizes must emit an effect envelope; client finish does not pay rewards directly.
- Inventory or asset ownership rules: future medals or shoes must use inventory/asset contracts.
- Risks: reward farming if local race results are trusted online.

## Relationship, Chat, And Spectators

- Partner state affected: none in the first slice.
- Memory events: future date or cheering events should consume race result events, not mutate partners directly.
- Public channel impact: future room chat should be `venue:baegeum-marathon-stadium` or a room-scoped channel.
- Spectators: allowed online participant type, can enter during countdown/racing when host policy allows it, do not consume the 30 runner slots, can chat, and can watch player snapshots without becoming controllable runners.
- Admin channel: dev-only admin chat exists for operator testing and must become server-authenticated before public use. Host/admin chat may share room chat, but host commands must remain separate from spectator/player chat permissions.

## Implementation Order

1. Add this plan and the pure marathon contract.
2. Guard the contract through one smoke check and the existing game-contract purity gate.
3. Add a local 2D stadium surface using the contract.
4. Add host-controlled test bot generation so the room stays empty until the host explicitly asks for a rehearsal pack.
5. Add standalone local Singularity Race lobby entry.
6. Add dev-only connected marathon room adapter and connected-only lobby gate.
7. Add dev room packet relay for join, input, skill, attack, and snapshot envelopes.
8. Add WASD/Shift/E/mouse input, checkpoint character reward, skills, attack, and respawn contracts.
9. Add local action-race preview controls without changing the connected online authority.
10. Add a local WebSocket-shaped dev server mock that consumes the server transport contract without opening public online.
11. Add server-owned snapshot, ping sample, reconciliation, and movement-state rehearsal data behind the dev transport boundary before any public provider is enabled.
12. Add a real server transport adapter for join, input, snapshot, and finalization behind a connected WebSocket/Firebase provider.
13. Add phone rankings only after server-owned snapshots exist.

## Verification Plan

- Narrow check: `node tools/check-restored-marathon-contract.cjs`
- Host test-bot smoke: `node tools/smoke-singularity-race-bot-control.cjs`
- Server-state smoke: `node tools/smoke-singularity-race-server-state.cjs`
- Combat/skill full-race smoke: `node tools/smoke-singularity-race-combat-full-race.cjs`
- 30-runner server-load smoke: `node tools/smoke-singularity-race-server-load.cjs`
- Full check: `npm run check`
- Browser check: after UI wiring, run `npm start` and verify `http://127.0.0.1:4173/singularity-race.html`, `http://127.0.0.1:4173/singularity-race.html?devOnline=1`, `http://127.0.0.1:4173/singularity-race-admin.html?devOnline=1`, plus the Baegeum city stadium page when touched.
- Manual play notes: confirm 30 runners, WASD/Shift/E/mouse intent, checkpoint character assignment, attack stall, checkpoint respawn, finish ranking, and no online lobby while unavailable.

## Do Not

- Do not split the first contract across many small protocol files.
- Do not add a fake offline online lobby.
- Do not send the player to `baegeum-city-v2-dice.html` when they ask for the public `특이점레이스` lobby.
- Do not expose the dev connected adapter without the explicit `?devOnline=1` gate.
- Do not expose admin channel controls without server-authenticated admin authority in real online mode.
- Do not make online finish time or ranking client-authoritative.
- Do not make checkpoint random character assignment, rare skill charge use, attack hit results, or respawn positions client-authoritative.
- Do not pay rewards from local preview results.
- Do not put marathon into permanent bottom navigation.
