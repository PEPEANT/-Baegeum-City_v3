"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "src", "restored", "games", "marathon-contract.js");
const inputPath = path.join(root, "src", "restored", "games", "marathon-input-contract.js");
const characterSkillPath = path.join(root, "src", "restored", "games", "marathon-character-skill-contract.js"), rewardGradePath = path.join(root, "src", "restored", "games", "marathon-reward-grade.js");
const combatPath = path.join(root, "src", "restored", "games", "marathon-combat-contract.js");
const trailGeometryPath = path.join(root, "src", "restored", "games", "marathon-trail-geometry.js");
const viewPath = path.join(root, "src", "restored", "games", "marathon-stadium-view.js"), raceSkinPath = path.join(root, "src", "skins", "singularity-race-skin-presets.js");
const flowPath = path.join(root, "src", "restored", "games", "singularity-race-flow.js");
const runnerViewPath = path.join(root, "src", "restored", "games", "singularity-race-runner-view.js"), trackPath = path.join(root, "src", "restored", "games", "singularity-race-track.js"), queuePath = path.join(root, "src", "restored", "games", "singularity-race-queue.js"), localSimPath = path.join(root, "src", "restored", "games", "singularity-race-local-sim.js"), predictionPath = path.join(root, "src", "restored", "games", "singularity-race-prediction.js"), runnerMotionPath = path.join(root, "src", "restored", "games", "singularity-race-runner-motion.js"), devOnlinePath = path.join(root, "src", "restored", "games", "singularity-race-dev-online.js"), raceControlPath = path.join(root, "src", "restored", "games", "singularity-race-control.js");
const adapterPath = path.join(root, "src", "restored", "online", "marathon-room-adapter.js"), roomPolicyPath = path.join(root, "src", "restored", "online", "marathon-room-policy.js"), channelPath = path.join(root, "src", "restored", "online", "marathon-channel-adapter.js"), chatTransportPath = path.join(root, "src", "restored", "online", "marathon-dev-chat-transport.js"), chatStoragePath = path.join(root, "src", "restored", "online", "marathon-dev-chat-storage.js");
const roomTransportPath = path.join(root, "src", "restored", "online", "marathon-dev-room-transport.js"), netcodePath = path.join(root, "src", "restored", "online", "marathon-netcode-contract.js"), serverLoopPath = path.join(root, "src", "restored", "online", "marathon-server-loop-contract.js"), websocketDevLoopPath = path.join(root, "src", "restored", "online", "marathon-websocket-dev-loop.js");
const serverTransportPath = path.join(root, "src", "restored", "online", "marathon-server-transport-contract.js"), serverRoomAdapterPath = path.join(root, "src", "restored", "online", "marathon-server-room-adapter.js"), serverSessionPath = path.join(root, "src", "restored", "online", "marathon-server-session-contract.js"), serverProviderPath = path.join(root, "src", "restored", "online", "marathon-server-provider-adapter.js"), serverRaceStatePath = path.join(root, "src", "restored", "online", "marathon-server-race-state.js"), websocketDevServerPath = path.join(root, "src", "restored", "online", "marathon-websocket-dev-server-mock.js"), websocketDevServerValidationPath = path.join(root, "src", "restored", "online", "marathon-websocket-dev-server-validation.js");
const planPath = path.join(root, "docs", "plans", "restored-marathon-stadium.md");
const indexPath = path.join(root, "docs", "INDEX.md");
const plansReadmePath = path.join(root, "docs", "plans", "README.md");
const htmlPath = path.join(root, "baegeum-city-v2-dice.html");
const singularityHtmlPath = path.join(root, "singularity-race.html");
const adminHtmlPath = path.join(root, "singularity-race-admin.html");
const placeCopyPath = path.join(root, "src", "restored", "ui", "place-surface-copy.js");
const placeCatalogPath = path.join(root, "src", "restored", "data", "place-catalog.js");

function read(filePath) { return fs.readFileSync(filePath, "utf8"); }
function assertPureSource() {
  const source = read(contractPath);
  for (const blocked of ["document.", "window.", "localStorage", "sessionStorage", "Math.random", "Date.now", "setTimeout", "setInterval", "fetch("]) {
    assert(!source.includes(blocked), `marathon contract must not use ${blocked}`);
  }
}
function assertValidationOk(validation) { assert.equal(validation.ok, true, validation.errors.join("\n")); }

function assertMarathonRoomAdapter(adapter, marathon, serverTransport) {
  const adapterValidation = adapter.validateRestoredMarathonRoomAdapterContract();
  assert.equal(adapterValidation.ok, true, adapterValidation.errors.join("\n"));
  const unavailableAdapter = adapter.createUnavailableMarathonRoomAdapter();
  assert.equal(adapter.canOpenConnectedMarathonLobby(unavailableAdapter), false, "unavailable adapter must not open a connected lobby.");
  const connectedAdapter = adapter.createDevConnectedMarathonRoomAdapter({ serverTimeMs: 1234 });
  assert.equal(adapter.canOpenConnectedMarathonLobby(connectedAdapter), true, "dev adapter should open a connected lobby.");
  const summary = adapter.getConnectedMarathonRoomSummaries(connectedAdapter)[0];
  assert.equal(summary.spectators, 0, "room summary should expose current spectator count.");
  assert.equal(summary.maxSpectators, marathon.RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, "room summary should expose max spectators.");
  const joined = adapter.joinConnectedMarathonRoom(connectedAdapter, {
    participantId: "runner:dev",
    nickname: "Dev Runner",
    sequence: 3
  });
  assert.equal(joined.ok, true, "dev connected join should succeed.");
  assert.equal(joined.room.authority, marathon.RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED, "connected room must require server authority.");
  assert.equal(joined.joinResult.type, "join_result", "connected join must produce join_result.");
  assert.equal(marathon.validateRestoredMarathonOnlinePacket(joined.joinResult).ok, true, "join_result packet should validate.");
  const snapshot = adapter.createConnectedMarathonStateSnapshot(joined.room, { participantId: "runner:dev", sequence: 5 }); assert.equal(snapshot.payload.serverOwned, true, "connected snapshot must be server-owned."); assert.ok(snapshot.payload.pingSample && snapshot.payload.reconciliation, "connected snapshot must include ping and reconciliation metadata.");
  assert.equal(adapter.joinConnectedMarathonRoom(connectedAdapter, { mapVersion: "bad-map" }).ok, false, "map version mismatch should block connected join.");
  const racingAdapter = Object.freeze({
    ...connectedAdapter,
    rooms: Object.freeze([marathon.createRestoredMarathonRoom({ ...connectedAdapter.rooms[0], phase: "racing" })])
  });
  assert.equal(adapter.joinConnectedMarathonRoom(racingAdapter, { participantId: "runner:late", participantType: "player" }).ok, false, "late runner join should be blocked during racing.");
  assert.equal(adapter.joinConnectedMarathonRoom(racingAdapter, { participantId: "spectator:late", participantType: "spectator" }).ok, true, "late spectator join should be allowed during racing.");
  const remoteTransport = serverTransport.createConfiguredRestoredMarathonServerTransport({
    provider: "websocket",
    endpointId: "ws:local-dev",
    authMode: "session",
    capabilities: { rooms: true, chat: true, input: true, snapshots: true }
  }, { status: "connected", clientId: "client:remote" });
  const remoteAdapter = adapter.createServerBackedMarathonRoomAdapter({
    transport: remoteTransport,
    rooms: [marathon.createRestoredMarathonRoom({ roomId: "room:singularity-race:remote-001" })]
  });
  assert.equal(adapter.canOpenConnectedMarathonLobby(remoteAdapter), true, "server transport adapter should open only with connected transport and rooms.");
}
function assertMarathonDocs() {
  const plan = read(planPath);
  const singularityHtml = read(singularityHtmlPath);
  const adminHtml = read(adminHtmlPath);
  const flowSource = read(flowPath), raceSkinSource = read(raceSkinPath);
  const runnerViewSource = read(runnerViewPath), runnerMotionSource = read(runnerMotionPath), trackSource = read(trackPath), queueSource = read(queuePath), localSimSource = read(localSimPath), predictionSource = read(predictionPath), devOnlineSource = read(devOnlinePath), raceControlSource = read(raceControlPath), chatStorageSource = read(chatStoragePath);
  ["src/restored/games/marathon-contract.js", "src/restored/games/marathon-input-contract.js", "src/restored/games/marathon-character-skill-contract.js", "src/restored/games/marathon-reward-grade.js", "src/restored/games/marathon-combat-contract.js", "src/restored/games/marathon-trail-geometry.js", "src/restored/games/marathon-stadium-view.js", "src/skins/singularity-race-skin-presets.js", "src/restored/games/singularity-race-flow.js", "src/restored/games/singularity-race-runner-view.js", "src/restored/games/singularity-race-runner-motion.js", "src/restored/games/singularity-race-queue.js", "src/restored/games/singularity-race-track.js", "src/restored/games/singularity-race-local-sim.js", "src/restored/games/singularity-race-prediction.js", "src/restored/games/singularity-race-dev-online.js", "src/restored/games/singularity-race-control.js", "src/restored/online/marathon-room-adapter.js", "src/restored/online/marathon-channel-adapter.js", "src/restored/online/marathon-dev-chat-transport.js", "src/restored/online/marathon-dev-chat-storage.js", "src/restored/online/marathon-dev-room-transport.js", "src/restored/online/marathon-netcode-contract.js", "src/restored/online/marathon-server-loop-contract.js", "src/restored/online/marathon-websocket-dev-loop.js", "src/restored/online/marathon-server-transport-contract.js", "src/restored/online/marathon-server-room-adapter.js", "src/restored/online/marathon-server-session-contract.js", "src/restored/online/marathon-server-provider-adapter.js", "src/restored/online/marathon-server-start-position.js", "src/restored/online/marathon-server-race-state.js", "src/restored/online/marathon-websocket-dev-server-mock.js", "src/restored/online/marathon-websocket-dev-server-validation.js", "src/restored/online/marathon-room-policy.js", "server transport adapter", "maxSpectators", "RESTORED_MARATHON_MAX_RUNNERS", "state_snapshot"].forEach((token) => assert.ok(plan.includes(token), token));
  ["marathon-room-adapter.js", "marathon-input-contract.js", "marathon-character-skill-contract.js", "marathon-combat-contract.js", "marathon-trail-geometry.js", "singularity-race-runner-motion.js", "trail-map", "track-effects", "--world-grid", "--track-rail", "--track-road", "track-world", "track-hud", "TRACK_WORLD_WIDTH", "TRACK_CAMERA_X_ANCHOR = 0.5", "TRACK_CAMERA_Y_ANCHOR = 0.5", "RESTORED_MARATHON_WORLD_WIDTH", "TRACK_CAMERA_DEFAULT_ZOOM = 1", "handleTrackWheelZoom", "handleTrackPinchMove", "race-zoom-label", "START_LINE_PROGRESS", "START_GATE_PROGRESS", "ROAD_LANE_HALF_WIDTH_PX", "laneOffsetPx", "advanceLocalPlayerMovement", "advanceWaitingBotPack", "botsMoved", "LOCAL_STAGING_SPRINT_PROGRESS_PER_SECOND", "LOCAL_SPRINT_PROGRESS_PER_SECOND", "SOFT_PASS_RADIUS", "SOFT_PASS_BODY_RADIUS_PX", "SOFT_COLLISION_LANE_PUSH_PX", "calculateSoftPassPressure", "calculateSoftPassSideOffset", "calculateSoftCollisionImpulse", "applySoftCollisionImpulse", "LOCAL_FINISH_PROGRESS", "createLocalFinishRanking", "BASIC_ATTACK_COOLDOWN_MS", "BASIC_ATTACK_STUN_MS", "performBasicAttack", "triggerVirtualAttackButton", "race-attack-button", "is-facing-left", "--runner-facing-scale", "--runner-run-animation", "data-run-style", "runner-run-bounce", "runner-run-robot", "runner-attack-swipe", "runner-attack-lunge", "attackVisualUntilMs", "stunnedUntilMs", "SINGULARITY_RACE_START_COUNTDOWN_MS", "SINGULARITY_RACE_CONTROL_STORAGE_KEY", "startLocalCountdown", "track-countdown", "start-gate", "updateTrackCamera", "eventToTrackWorldPercent", "runnerVisualPoint", "smoothRunnerVisualPoint", "runnerVisuals", "runnerMotion", "updateRunnerMotionState", "movedVisibly", "hasPotentialPlayerMovement", "hasPotentialSingularityPlayerMovement", "runner-run-cycle", "requestAnimationFrame(advanceActionPreviewLoop)", "resolveRestoredMarathonVisualStep", "createSingularityRunnerAvatarNode", "vector-effect: non-scaling-stroke", "stroke-width: 580px", "stroke-width: 460px", "var(--track-rail)", "var(--track-road)", "player-focus-ring", "race-standings", "advanceLocalBotPack", "RAIL_COLLISION_GAP", "resolveSingleRailCollisions", "advanceLocalPlayerProgress", "runner-avatar.is-colliding", "runner-nameplate", "runner-chat-bubble", "showRunnerChatBubble", "acceptChatSend", "CHAT_SEND_COOLDOWN_MS", "CHAT_SPAM_WINDOW_MS", "event.code === \"KeyT\"", "focusChatInput", "FEATURED_SKIN_IDS", "PROFILE_SKIN_LIMIT", "kaguya", "singularity-fan", "robot", "gpichan", "pepe-runner", "moderator-armband", "yalrkun", "lakers-wile", "sam-altman", "demis-hassabis", "action-character", "checkpoint-strip", "placeholderSkinGrade", "hasCurrentRewardSkill", "canUseCurrentRewardSkill", "resolveRewardSkillAdvanceAmount", "syncActionRewardFromServerSnapshot", "has-reward", "RACE_REWARD_SKIN_VISUAL_MS", "rewardSkinUntilMs", "isRunnerRewardSkinActive", "is-reward-skin", "data-reward-grade"].forEach((token) => assert.ok(singularityHtml.includes(token), token));
  ["action-packets", "channel-tabs", "marathon-dev-chat-transport.js", "marathon-netcode-contract.js", "marathon-websocket-dev-loop.js", "createRestoredMarathonWebSocketDevServerMock", "advanceConnectedDevSnapshotFeed", "netcode-budget", "server_snapshot", "ping_sample", "reconcile_guard", "anti_teleport", "relay_guard", "admin-page-link", "adminLaunch", "requestedDevRoomId", "canAdminDirectLaunch", "roomControlStorageKey", "PROFILE_STORAGE_KEY", "profile-skin-grid", "data-screen=\"profile\"", "enterQueue", "enterMapPreview", "enterRaceScreen", "debug-only", "getSingularitySkillDisplayName", "singularity-race-flow.js", "singularity-race-runner-view.js", "singularity-race-queue.js", "singularity-race-track.js", "singularity-race-local-sim.js", "singularity-race-dev-online.js", "singularity-race-control.js", "SINGULARITY_RACE_SCREENS", ".shell[data-screen=\"lobby\"] .brand p", ".shell[data-screen=\"lobby\"] .chat-panel", ".shell[data-screen=\"lobby\"] #preview-button", ".shell[data-screen=\"queue\"] .room-panel", ".shell[data-screen=\"queue\"] .channel-tabs", ".shell[data-screen=\"mapPreview\"] .chat-panel", ".shell[data-screen=\"mapPreview\"] .slot-grid", ".shell[data-screen=\"mapPreview\"] #track-runners", "updateMapPreviewCamera", "queue-actions", "맵 미리보기", "state.screen === SINGULARITY_RACE_SCREENS.QUEUE", ".shell[data-screen=\"race\"] .room-panel", ".shell[data-screen=\"race\"] .chat-panel", ".shell[data-screen=\"race\"] .track-panel .panel-header", ".shell[data-screen=\"race\"] .action-hud", ".shell[data-screen=\"race\"] .checkpoint-strip", ".shell[data-screen=\"race\"] .track-progress-pill", ".shell[data-screen=\"race\"] .start-gate::after", "race-mobile-controls", "race-queue-toggle", "race-options-button", "race-options-open", "race-input-controls", "race-dpad", "race-joystick", "race-sprint-button", "JOYSTICK_DEADZONE_PX", "startVirtualJoystick", "setVirtualSprint", "race-action-button", "race-skill-button", "race-chat-action-button", "VIRTUAL_MOVE_KEYS", "setVirtualMoveKey", "releaseVirtualMoveKeys", "triggerVirtualSkillButton"].forEach((token) => assert.ok(singularityHtml.includes(token), token));
  ["race-chat-toggle", "race-start-status", "race-chat-open", "race-dpad-button", "채팅창 열기", "관리자 대기중"].forEach((token) => assert.ok(!singularityHtml.includes(token), token));
  ["SINGULARITY_RACE_FLOW_ORDER", "MAP_PREVIEW", "getSingularityRacePreviewActionLabel", "validateSingularityRaceFlowContract", "맵 미리보기", "대기열로 돌아가기"]
    .forEach((token) => assert.ok(flowSource.includes(token), token));
  ["createSingularityRunnerAvatarNode", "runner-chat-bubble", "runner-attack-swipe", "resolveSingularityRunnerRunStyle", "dataset.runStyle", "createSingularityRunnerSlotNode", "rankSingularityRunnerEntries", "validateSingularityRaceRunnerViewContract", "빈 자리", "달리는 중", "온라인 대기"]
    .forEach((token) => assert.ok(runnerViewSource.includes(token), token));
  ["createSingularityTrackProgressPillNode", "createSingularityTrackCueNode", "validateSingularityRaceTrackContract", "rewardGrade", "has-reward"].forEach((token) => assert.ok(trackSource.includes(token), token));
  ["createSingularityQueueSlotNode", "filterSingularityChatMessages", "validateSingularityRaceQueueContract", "\ub85c\ube44 \ucc44\ud305", "\uc544\uc9c1 \uba54\uc2dc\uc9c0\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."].forEach((token) => assert.ok(queueSource.includes(token), token));
  ["createSingularityStartPaddockPosition", "advanceSingularityLocalBotPack", "advanceSingularityWaitingBotPack", "stunnedUntilMs", "validateSingularityRaceLocalSimContract"].forEach((token) => assert.ok(localSimSource.includes(token), token));
  ["advanceConnectedLocalPrediction", "singularity-race-prediction.js", "preserveLocalPrediction"].forEach((token) => assert.ok(singularityHtml.includes(token), token));
  ["advanceSingularityRaceLocalPrediction", "reconcileSingularityRaceLocalPrediction", "validateSingularityRacePredictionContract"].forEach((token) => assert.ok(predictionSource.includes(token), token));
  ["hasPotentialSingularityPlayerMovement", "validateSingularityRaceRunnerMotionContract", "finish edge should not keep forward running alive"].forEach((token) => assert.ok(runnerMotionSource.includes(token), token));
  ["createSingularityConnectedRelayEnvelope", "createSingularityDevRoomPacketTransport", "preserveLocalPrediction", "serverProgress", "serverLaneOffsetPx", "validateSingularityRaceDevOnlineContract"].forEach((token) => assert.ok(devOnlineSource.includes(token), token));
  ["createSingularityRaceStartCountdownCommand", "readSingularityRaceControlCommand", "createSingularityRaceControlStorageKey", "createSingularityRaceTestBotsStorageKey", "createRoomStorageKey", "should not reuse the global key", "validateSingularityRaceControlContract"].forEach((token) => assert.ok(raceControlSource.includes(token), token));
  ["getSingularityRaceSkinPresets", "getSingularityRaceSkinDataUrl", "validateSingularityRaceSkinPresetContract", "getPresetSkinDataUrl", "DRAWING_WORLD_ORIGINAL_SKIN_IDS", "Drawing World original skin missing", "특붕이", "두머", "도지 러너"].forEach((token) => assert.ok(raceSkinSource.includes(token), token));
  ["kaguya", "gpichan", "robot", "moderator-armband", "sam-altman", "demis-hassabis"].forEach((token) => assert.ok(raceSkinSource.includes(token), token));
  ["casino-dealer", "table-gambler", "office-worker"].forEach((token) => assert.ok(!singularityHtml.includes(token), token));
  ["presets.slice(0, 12)", "progress: 4 + (index * RAIL_COLLISION_GAP)", "START_GRID_COLUMNS", "enterRoomLobby", "data-screen=\"room\"", "state.screen === \"room\"", "state.screen === \"room\" ? state.runners.slice(0, 8)", "게임 화면 보기", "준비 완료", "Soft pass", "Gate locked", "FINISH READY", "channelDisplayLabel", "isVisibleChatMessage", "singularity-race-track-view.js"]
    .forEach((token) => assert.ok(!singularityHtml.includes(token), token));
  ["marathon-channel-adapter.js", "marathon-dev-chat-transport.js", "marathon-dev-chat-storage.js", "marathon-dev-room-transport.js", "marathon-room-policy.js", "방장 페이지", "admin-direct-game-link", "singularity-race.html?devOnline=1&amp;adminLaunch=1", "host-camera", "runner-watch-list", "room-list", "방 관리", "전체 맵", "runner-count-badge", "admin-start-button", "admin-add-bots-button", "spectator-capacity-options", "관전자 정원", "singularity-race-control.js", "createSingularityRaceStartCountdownCommand", "createPlayerRoomHref", "clearStoredRoomControls", "플레이어 보기", "roomDisplayName", "senderName", "senderType !== \"system\""].forEach((token) => assert.ok(adminHtml.includes(token), token));
  ["createRestoredMarathonDevChatStorageKey", "inferRestoredMarathonRoomIdFromChannels", "RESTORED_MARATHON_CHAT_STORAGE_KEY"].forEach((token) => assert.ok(chatStorageSource.includes(token), token));
  ["preserveAspectRatio=\"none\"", "TRACK_WORLD_WIDTH = 9200", "TRACK_WORLD_HEIGHT = 3600", "ROAD_LANE_HALF_WIDTH_PX = 232", "progressToRestoredMarathonMapPoint", "resolveAdminRunnerLaneOffsetPx", "worldWidth: TRACK_WORLD_WIDTH", "worldHeight: TRACK_WORLD_HEIGHT"].forEach((token) => assert.ok(adminHtml.includes(token), token));
  ["connection gate", "active room", "visible channels", "stored messages", "room packets", "ROOM MONITOR", "개발 전용 관전자 화면입니다.", "실제 공개 온라인에서는", "지금은 개발 방 하나만 열려 있습니다.", "전체 맵 감시카메라", "현재 방", "카메라 대상", "경기 상태", "camera-status", "status-pill"].forEach((token) => assert.ok(!adminHtml.includes(token), token));
  assertSingularityRaceMovementTuning(singularityHtml);
  assert.ok(read(indexPath).includes("plans/restored-marathon-stadium.md"));
  assert.ok(read(plansReadmePath).includes("restored-marathon-stadium.md"));
  assert.ok(read(htmlPath).includes("renderRestoredMarathonStadiumHtml"));
  assert.ok(read(htmlPath).includes("advanceRestoredMarathonPreview"));
  assert.ok(read(placeCopyPath).includes("marathon_stadium"));
  assert.ok(read(placeCatalogPath).includes("baegeum:marathon-stadium"));
}

function assertSingularityRaceMovementTuning(source) {
  const [runSpeed, sprintSpeed, stagingRunSpeed, stagingSprintSpeed, laneSpeed, laneSprintSpeed, railMaxProgress, finishProgress] = [
    "LOCAL_RUN_PROGRESS_PER_SECOND", "LOCAL_SPRINT_PROGRESS_PER_SECOND", "LOCAL_STAGING_RUN_PROGRESS_PER_SECOND", "LOCAL_STAGING_SPRINT_PROGRESS_PER_SECOND", "LOCAL_LANE_SPEED_PX_PER_SECOND", "LOCAL_LANE_SPRINT_SPEED_PX_PER_SECOND", "RAIL_MAX_PROGRESS", "LOCAL_FINISH_PROGRESS"
  ].map((name) => readNumberConstant(source, name));
  assert(sprintSpeed >= runSpeed * 2.5, "Shift sprint should be much faster than normal race running.");
  assert(stagingSprintSpeed >= stagingRunSpeed * 2, "Shift sprint should be much faster while staging.");
  assert(laneSpeed < laneSprintSpeed, "Shift should still affect lane movement.");
  assert(laneSpeed >= 130 && laneSpeed <= 190, "W/S lane movement should be visible but stay below forward run.");
  assert(laneSprintSpeed >= 180 && laneSprintSpeed <= 260, "Shift+W/S should be responsive but stay below forward sprint."); assert(readNumberConstant(source, "ROAD_LANE_HALF_WIDTH_PX") >= 230, "Road lane clamp should let runners approach the visible wall.");
  assert.equal(railMaxProgress, 100, "Race progress clamp should allow the finish line."); assert(finishProgress >= 99 && finishProgress < railMaxProgress, "Local finish should trigger near the real finish line.");
}

function readNumberConstant(source, name) { const match = source.match(new RegExp(`const ${name} = ([0-9.]+);`)); assert(match, `${name} constant should exist.`); return Number(match[1]); }

function assertMarathonActionContracts(input, characterSkill, combat) {
  const inputValidation = input.validateRestoredMarathonInputContract();
  assert.equal(inputValidation.ok, true, inputValidation.errors.join("\n"));
  const characterSkillValidation = characterSkill.validateRestoredMarathonCharacterSkillContract();
  assert.equal(characterSkillValidation.ok, true, characterSkillValidation.errors.join("\n"));
  const placeholderGrades = new Set(Array.from({ length: 512 }, (_, index) => characterSkill.createRestoredMarathonPlaceholderSkinReward({
    participantId: "runner:placeholder",
    checkpointIndex: (index % 3) + 1,
    seed: `placeholder-check:${index}`
  }).grade));
  for (const grade of characterSkill.RESTORED_MARATHON_PLACEHOLDER_SKIN_GRADES) {
    assert(placeholderGrades.has(grade), `${grade} placeholder skin grade should be rollable.`);
  }
  assert.deepEqual([...characterSkill.RESTORED_MARATHON_REWARD_GRADES], ["D", "C", "B", "A", "S"], "reward skill grades should stay D-to-S.");
  for (const grade of characterSkill.RESTORED_MARATHON_REWARD_GRADES) {
    const rewardSkill = characterSkill.createRestoredMarathonRewardSkill({ grade, seed: `contract:${grade}` });
    const use = characterSkill.createRestoredMarathonSkillUse({ participantId: `runner:${grade}`, skillId: rewardSkill.skillId, grade, chargesRemaining: rewardSkill.maxCharges });
    assert.equal(use.grade, grade, `${grade} reward skill should keep reward grade.`); assert.equal(use.allowed, true, `${grade} reward skill should be usable when assigned.`);
  }
  const noReward = characterSkill.createRestoredMarathonSkillUse({ participantId: "runner:no-reward" });
  assert.equal(noReward.allowed, false, "base profile should not have an E skill."); assert.equal(noReward.reason, "no_reward", "base profile skill block should explain missing reward.");
  const characterOnly = characterSkill.createRestoredMarathonSkillUse({ participantId: "runner:character-only", characterId: "runner:recommend-fairy" });
  assert.equal(characterOnly.reason, "no_reward", "character identity alone should not unlock the reward skill.");
  const combatValidation = combat.validateRestoredMarathonCombatContract();
  assert.equal(combatValidation.ok, true, combatValidation.errors.join("\n"));
}

function assertMarathonCoreRace(marathon, trailGeometry) {
  const course = marathon.createRestoredMarathonCourse();
  assert.equal(course.distanceMeters, 42195, "default course should be marathon distance.");
  assert.equal(course.checkpointMeters[0], 0, "first checkpoint must be the start line.");
  assert.equal(course.checkpointMeters.at(-1), course.distanceMeters, "last checkpoint must be the finish.");
  assert.equal(course.checkpointMeters.length, 5, "course should expose start, three save points, and finish.");
  assert.deepEqual(
    course.checkpointMeters.slice(1, -1),
    trailGeometry.createRestoredMarathonTrailSaveCheckpointMeters(course.distanceMeters),
    "course checkpoints should follow the single-trail save point geometry."
  );
  const participants = Array.from({ length: 30 }, (_, index) => marathon.createRestoredMarathonParticipant({
    participantId: `runner:${index + 1}`, displayName: `Runner ${index + 1}`, type: index === 0 ? "player" : "bot", lane: index + 1
  }));
  const fullRoom = marathon.createRestoredMarathonRoom({ participants });
  const blockedJoin = marathon.canJoinRestoredMarathonRoom(fullRoom, "player");
  assert.equal(blockedJoin.ok, false, "31st runner must be blocked.");
  assert.ok(blockedJoin.errors.includes("runner limit reached"));
  assert.equal(marathon.canJoinRestoredMarathonRoom(fullRoom, "spectator").ok, true, "spectators should not consume runner slots.");
  const racingRoom = marathon.createRestoredMarathonRoom({ phase: "racing", participants: participants.slice(0, 3) });
  assert.equal(marathon.canJoinRestoredMarathonRoom(racingRoom, "player").ok, false, "runner mid-race join should be blocked.");
  assert.equal(marathon.canJoinRestoredMarathonRoom(racingRoom, "spectator").ok, true, "spectator mid-race join should be allowed.");
  const spectatorFullRoom = marathon.createRestoredMarathonRoom({
    maxSpectators: 2,
    participants: [
      ...participants.slice(0, 1),
      marathon.createRestoredMarathonParticipant({ participantId: "spectator:1", type: "spectator" }),
      marathon.createRestoredMarathonParticipant({ participantId: "spectator:2", type: "spectator" })
    ]
  });
  const spectatorBlocked = marathon.canJoinRestoredMarathonRoom(spectatorFullRoom, "spectator");
  assert.equal(spectatorBlocked.ok, false, "spectator cap should be enforced separately.");
  assert.ok(spectatorBlocked.errors.includes("spectator limit reached"));
  assert.equal(marathon.countRestoredMarathonRunners(spectatorFullRoom.participants), 1, "spectators must not count as runners.");
  assert.equal(marathon.countRestoredMarathonSpectators(spectatorFullRoom.participants), 2, "spectator count should be explicit.");
  assertMarathonProgressAndRanking(marathon, course);
  assertMarathonTrailGeometry(trailGeometry);
}

function assertMarathonProgressAndRanking(marathon, course) {
  const starter = marathon.createRestoredMarathonParticipant({ participantId: "runner:local", type: "player" });
  const moved = marathon.advanceRestoredMarathonParticipant(starter, { pace: "steady", raceTimeMs: 1000, sequence: 1 }, 1000, course);
  assert(moved.progressMeters > starter.progressMeters, "steady pace should move a runner forward.");
  assert(moved.stamina < starter.stamina, "steady pace should spend a small amount of stamina.");
  const firstSavePointMeters = course.checkpointMeters[1];
  const nearCheckpoint = marathon.createRestoredMarathonParticipant({ participantId: "runner:local", type: "player", progressMeters: firstSavePointMeters - 1, stamina: 100 });
  const checkpointed = marathon.advanceRestoredMarathonParticipant(nearCheckpoint, { pace: "sprint", raceTimeMs: 200000, sequence: 2 }, 1000, course);
  assert.equal(checkpointed.nextCheckpointIndex, 2, "runner should claim the first distance checkpoint in order.");
  assert.equal(checkpointed.checkpointLog[0].meters, firstSavePointMeters);
  const ranking = marathon.rankRestoredMarathonParticipants([
    marathon.createRestoredMarathonParticipant({ participantId: "runner:a", type: "player", progressMeters: 1000 }),
    marathon.createRestoredMarathonParticipant({ participantId: "runner:b", type: "bot", progressMeters: 2000 }),
    marathon.createRestoredMarathonParticipant({ participantId: "runner:c", type: "bot", finishedAtMs: 300000, progressMeters: course.distanceMeters })
  ]);
  assert.equal(ranking[0].participantId, "runner:c", "finished runners should rank before unfinished runners.");
  assert.equal(ranking[1].participantId, "runner:b", "unfinished runners should rank by progress.");
  assertMarathonEnvelopeAndPacket(marathon, ranking);
}

function assertMarathonTrailGeometry(trailGeometry) {
  const validation = trailGeometry.validateRestoredMarathonTrailGeometryContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  const savePoints = trailGeometry.listRestoredMarathonTrailSavePoints();
  assert.equal(savePoints.length, 3, "single trail must have exactly three save points.");
  assert.deepEqual(savePoints.map((point) => point.index), [1, 2, 3]);
  assert.ok(trailGeometry.createRestoredMarathonTrailSvgPath().startsWith("M"), "trail must render as an SVG path.");
  const saveTwo = trailGeometry.progressToRestoredMarathonTrailPoint(58);
  const estimated = trailGeometry.estimateRestoredMarathonTrailProgressFromPoint(saveTwo.x, saveTwo.y);
  assert(Math.abs(estimated - 58) <= 1, "trail pointer estimation should map back to the nearest progress percent.");
  const lanePoint = trailGeometry.progressToRestoredMarathonMapPoint(58, { worldWidth: 7600, worldHeight: 2600, laneOffsetPx: 232, laneHalfWidthPx: 232, minPercent: 2, maxPercent: 98 });
  assert.ok(lanePoint.x >= 2 && lanePoint.x <= 98 && lanePoint.y >= 2 && lanePoint.y <= 98, "map point should fit inside the admin camera frame.");
}

function assertMarathonEnvelopeAndPacket(marathon, ranking) {
  const envelope = marathon.createRestoredMarathonResultEnvelope({
    room: marathon.createRestoredMarathonRoom({ roomId: "room:marathon:online", authority: marathon.RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED }),
    participants: ranking, participantId: "runner:c", authority: marathon.RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED
  });
  assert.ok(envelope.effects.some((effect) => effect.type === marathon.RESTORED_MARATHON_EFFECT_TYPES.ONLINE_AUTHORITY_REQUEST), "online results must request server authority.");
  assert.ok(envelope.effects.some((effect) => effect.type === marathon.RESTORED_MARATHON_EFFECT_TYPES.RANKING_SNAPSHOT_CANDIDATE), "race result should produce a ranking candidate.");
  const packet = marathon.createRestoredMarathonOnlinePacket("input_update", { roomId: "room:marathon:online", participantId: "runner:local", sequence: 7, pace: "push" });
  assert.equal(marathon.validateRestoredMarathonOnlinePacket(packet).ok, true, "valid input packet should pass.");
  assert.equal(marathon.validateRestoredMarathonOnlinePacket({ ...packet, sequence: 0 }).ok, false, "input sequence must be positive.");
}

(async () => {
  [
    contractPath, inputPath, characterSkillPath, rewardGradePath, combatPath, trailGeometryPath, viewPath, raceSkinPath, flowPath, runnerViewPath, runnerMotionPath, trackPath, queuePath, localSimPath, predictionPath, devOnlinePath, raceControlPath,
    adapterPath, roomPolicyPath, channelPath, chatTransportPath, roomTransportPath, netcodePath, serverLoopPath, websocketDevLoopPath,
    serverTransportPath, serverRoomAdapterPath, serverSessionPath, serverProviderPath, serverRaceStatePath, websocketDevServerPath, websocketDevServerValidationPath
  ].forEach((filePath) => assert(fs.existsSync(filePath), `${path.relative(root, filePath)} is required.`));
  assertPureSource();

  const marathon = await import(pathToFileURL(contractPath).href), raceSkin = await import(pathToFileURL(raceSkinPath).href);
  const input = await import(pathToFileURL(inputPath).href), characterSkill = await import(pathToFileURL(characterSkillPath).href), combat = await import(pathToFileURL(combatPath).href), trailGeometry = await import(pathToFileURL(trailGeometryPath).href), view = await import(pathToFileURL(viewPath).href);
  const flow = await import(pathToFileURL(flowPath).href), runnerView = await import(pathToFileURL(runnerViewPath).href), runnerMotion = await import(pathToFileURL(runnerMotionPath).href), track = await import(pathToFileURL(trackPath).href), queue = await import(pathToFileURL(queuePath).href), localSim = await import(pathToFileURL(localSimPath).href), prediction = await import(pathToFileURL(predictionPath).href), devOnline = await import(pathToFileURL(devOnlinePath).href), raceControl = await import(pathToFileURL(raceControlPath).href);
  const adapter = await import(pathToFileURL(adapterPath).href);
  const roomPolicy = await import(pathToFileURL(roomPolicyPath).href);
  const channelAdapter = await import(pathToFileURL(channelPath).href);
  const chatTransport = await import(pathToFileURL(chatTransportPath).href);
  const roomTransport = await import(pathToFileURL(roomTransportPath).href);
  const netcode = await import(pathToFileURL(netcodePath).href);
  const serverLoop = await import(pathToFileURL(serverLoopPath).href);
  const websocketDevLoop = await import(pathToFileURL(websocketDevLoopPath).href);
  const serverTransport = await import(pathToFileURL(serverTransportPath).href), serverSession = await import(pathToFileURL(serverSessionPath).href), serverProvider = await import(pathToFileURL(serverProviderPath).href), serverRaceState = await import(pathToFileURL(serverRaceStatePath).href), websocketDevServerValidation = await import(pathToFileURL(websocketDevServerValidationPath).href);
  assertValidationOk(marathon.validateRestoredMarathonContract());
  assertMarathonActionContracts(input, characterSkill, combat);
  assert.equal(marathon.RESTORED_MARATHON_MAX_RUNNERS, 30, "online room must be prepared for 30 runners.");
  assertMarathonCoreRace(marathon, trailGeometry);

  assertMarathonRoomAdapter(adapter, marathon, serverTransport);
  assertValidationOk(roomPolicy.validateRestoredMarathonRoomPolicyContract());
  assertValidationOk(channelAdapter.validateRestoredMarathonChannelContract());
  assertValidationOk(chatTransport.validateRestoredMarathonDevChatTransportContract());
  assertValidationOk(roomTransport.validateRestoredMarathonDevRoomTransportContract(serverTransport.createRestoredMarathonTransportEnvelope));
  assertValidationOk(netcode.validateRestoredMarathonNetcodeContract());
  assertValidationOk(serverLoop.validateRestoredMarathonServerLoopContract());
  assertValidationOk(websocketDevLoop.validateRestoredMarathonWebSocketDevLoopContract());
  assertValidationOk(serverTransport.validateRestoredMarathonServerTransportContract());
  assertValidationOk(serverSession.validateRestoredMarathonServerSessionContract(channelAdapter.createRestoredMarathonChannelSet()));
  assertValidationOk(serverProvider.validateRestoredMarathonServerProviderAdapterContract(() => serverTransport.createRestoredMarathonServerTransportSnapshot({
    provider: "websocket",
    status: "connected",
    endpointId: "ws:provider-test",
    clientId: "client:provider-test",
    capabilities: { rooms: true, chat: true, input: true, snapshots: true }
  })));
  assertValidationOk(serverRaceState.validateRestoredMarathonServerRaceStateContract());
  assertValidationOk(websocketDevServerValidation.validateRestoredMarathonWebSocketDevServerMockContract());
  assertValidationOk(view.validateRestoredMarathonStadiumView());
  [raceSkin.validateSingularityRaceSkinPresetContract(), flow.validateSingularityRaceFlowContract(), runnerView.validateSingularityRaceRunnerViewContract(), runnerMotion.validateSingularityRaceRunnerMotionContract(), track.validateSingularityRaceTrackContract(), queue.validateSingularityRaceQueueContract(), localSim.validateSingularityRaceLocalSimContract(), prediction.validateSingularityRacePredictionContract(), devOnline.validateSingularityRaceDevOnlineContract(), raceControl.validateSingularityRaceControlContract()].forEach(assertValidationOk);
  assert.deepEqual([...flow.SINGULARITY_RACE_FLOW_ORDER], ["profile", "lobby", "queue", "mapPreview", "race"]);
  const preview = view.advanceRestoredMarathonPreviewState(view.createRestoredMarathonPreviewState(), "sprint");
  assert.equal(preview.participants.length, 30, "view preview should keep 30 runners.");
  assert.ok(view.renderRestoredMarathonStadiumHtml(preview).includes("Baegeum Marathon Stadium"));

  assertMarathonDocs();

  console.log("Restored marathon contract check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
