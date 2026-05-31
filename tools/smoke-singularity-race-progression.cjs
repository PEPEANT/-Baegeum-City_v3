const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "singularity-race.html");
const pageSource = fs.readFileSync(pagePath, "utf8");

function readNumberConstant(name) {
  const match = pageSource.match(new RegExp(`const ${name} = ([0-9.]+);`));
  assert(match, `${name} must exist in singularity-race.html`);
  return Number(match[1]);
}

async function main() {
  const input = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-input-contract.js")));
  const marathon = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-contract.js")));
  const netcode = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-netcode-contract.js")));
  const localSim = await import(pathToFileURL(path.join(root, "src/restored/games/singularity-race-local-sim.js")));
  const prediction = await import(pathToFileURL(path.join(root, "src/restored/games/singularity-race-prediction.js")));
  const trailGeometry = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-trail-geometry.js")));

  const startProgress = readNumberConstant("START_LINE_PROGRESS");
  const finishProgress = readNumberConstant("LOCAL_FINISH_PROGRESS");
  const railMaxProgress = readNumberConstant("RAIL_MAX_PROGRESS");
  const runSpeed = readNumberConstant("LOCAL_RUN_PROGRESS_PER_SECOND");
  const sprintSpeed = readNumberConstant("LOCAL_SPRINT_PROGRESS_PER_SECOND");
  const laneSpeed = readNumberConstant("LOCAL_LANE_SPEED_PX_PER_SECOND");
  const laneSprintSpeed = readNumberConstant("LOCAL_LANE_SPRINT_SPEED_PX_PER_SECOND");
  const stagingRunSpeed = readNumberConstant("LOCAL_STAGING_RUN_PROGRESS_PER_SECOND");
  const stagingSprintSpeed = readNumberConstant("LOCAL_STAGING_SPRINT_PROGRESS_PER_SECOND");
  const gateClearance = readNumberConstant("START_GATE_CLEARANCE_PROGRESS");
  const gateOpenAnimationMs = readNumberConstant("START_GATE_OPEN_ANIMATION_MS");

  assert.equal(railMaxProgress, 100, "race clamp must allow the visible finish line");
  assert(finishProgress >= 99 && finishProgress < railMaxProgress, "finish trigger must sit near the real finish");

  const sprintFrame = input.createRestoredMarathonInputFrame({
    participantId: "runner:you",
    keys: ["KeyD", "ShiftLeft"],
    sequence: 1
  });
  assert.equal(sprintFrame.direction.x, 1, "D must move the runner toward the finish");
  assert.equal(sprintFrame.mode, "sprint", "Shift + D must produce sprint input");

  const runSecondsToFinish = Math.ceil((finishProgress - startProgress) / runSpeed);
  const sprintSecondsToFinish = Math.ceil((finishProgress - startProgress) / sprintSpeed);
  assertMovementSpeedFeel({ runSecondsToFinish, sprintSecondsToFinish, runSpeed, sprintSpeed, stagingRunSpeed, stagingSprintSpeed });
  assertMovementAxisPixelFeel({ runSpeed, sprintSpeed, laneSpeed, laneSprintSpeed, trailGeometry });
  assert(gateClearance <= 0.12, "start paddock clamp should let runners stand close to the gate");
  assert(gateOpenAnimationMs >= 650, "start gate should visibly open instead of disappearing");
  assertServerSprintMatchesClient({ marathon, sprintSpeed });

  const network = assertNetcodePressure(netcode);

  const smoothStep = netcode.resolveRestoredMarathonVisualStep(
    { initialized: true, x: 0, y: 0 },
    { x: 240, y: 0 },
    { elapsedMs: 50 }
  );
  const snapStep = netcode.resolveRestoredMarathonVisualStep(
    { initialized: true, x: 0, y: 0 },
    { x: 900, y: 0 },
    { elapsedMs: 50 }
  );
  assert.equal(smoothStep.limited, true, "small corrections must be smoothed");
  assert.equal(snapStep.snapped, true, "huge corrections may snap instead of dragging forever");

  const botAdvance = localSim.advanceSingularityLocalBotPack(
    [{ id: "you", progress: startProgress, laneOffsetPx: 0 }, { id: "bot", progress: startProgress, laneOffsetPx: 0, hp: 100 }],
    { elapsedSeconds: 1, nowMs: 1000, playerProgress: startProgress, railMaxProgress }
  );
  assert(botAdvance.runners[1].progress > startProgress, "bots must advance even when the player stops");

  const predicted = prediction.advanceSingularityRaceLocalPrediction({
    id: "you",
    progress: startProgress,
    laneOffsetPx: 0,
    serverProgress: startProgress,
    serverLaneOffsetPx: 0
  }, sprintFrame, 1, {
    sprintProgressPerSecond: sprintSpeed,
    laneSprintSpeedPxPerSecond: laneSprintSpeed,
    minProgress: 2.5,
    maxProgress: railMaxProgress,
    laneHalfWidthPx: 232,
    correctionFactor: 0
  });
  assert(predicted.progress > startProgress, "connected local prediction should respond immediately to Shift+D");

  assertRacePageContracts();
  assertConnectedStartGuards();

  console.log("singularity race progression smoke ok");
  console.log(JSON.stringify({
    runSecondsToFinish,
    sprintSecondsToFinish,
    laneSpeed,
    laneSprintSpeed,
    serverEgressKbpsFor30: network.budget.serverEgressKbps,
    degradedLane: network.degradedLane.lane,
    spamDecision: network.spamDecision.reason
  }, null, 2));
}

function assertRacePageContracts() {
  assert(pageSource.includes("race_finalized"), "local finish should rehearse server-owned finalization");
  assert(pageSource.includes("server:local-preview"), "local finish packet must be marked as server-preview owned");
  assert(pageSource.includes("race-result-panel"), "race screen needs a minimal finish result layer");
  assert(pageSource.includes("race-result-restart"), "finish result layer should expose a restart/return button");
  assert(pageSource.includes("finalizeRaceResult"), "local and server finishes should share one result finalizer");
  assert(pageSource.includes("restartRaceAfterResult"), "finish restart should clear race state before re-entry");
  assert(pageSource.includes("state.connectedSession = null"), "finish restart should leave any connected preview session");
  assert(pageSource.includes("state.action = createActionRaceState()"), "finish restart should reset action/race state");
  assert(pageSource.includes("state.runnerMotion.clear()"), "finish restart should clear stale runner motion");
  assert(pageSource.includes("createConnectedFinishRanking"), "server-owned snapshots should drive connected race results");
}

function assertMovementSpeedFeel(values) {
  assert(values.runSecondsToFinish > 0 && values.runSecondsToFinish <= 600, "normal run must be able to finish within 10 minutes");
  assert(values.sprintSecondsToFinish > 0 && values.sprintSecondsToFinish < values.runSecondsToFinish, "sprint must shorten finish time");
  assert(values.stagingRunSpeed >= 1, "start paddock movement must be visible before the race opens");
  assert(values.stagingSprintSpeed >= values.sprintSpeed, "start paddock sprint should not feel slower than active sprint");
  assert(values.sprintSpeed >= values.runSpeed * 2, "Shift sprint must feel clearly faster than normal running");
}

function assertMovementAxisPixelFeel(values) {
  const samples = [5, 32, 50, 68, 92];
  assert(values.laneSpeed >= 130 && values.laneSpeed <= 190, "W/S lane speed should be visible but not outrun forward movement");
  assert(values.laneSprintSpeed >= 180 && values.laneSprintSpeed <= 260, "Shift+W/S lane speed should stay responsive without becoming the main sprint");
  for (const progress of samples) {
    const runPx = progressPixelsPerSecond(values.trailGeometry, progress, values.runSpeed);
    const sprintPx = progressPixelsPerSecond(values.trailGeometry, progress, values.sprintSpeed);
    assert(values.laneSpeed >= runPx * 0.55, `W/S lane speed should not feel dead at progress ${progress}`);
    assert(values.laneSpeed <= runPx * 0.85, `W/S lane speed should stay below forward run at progress ${progress}`);
    assert(values.laneSprintSpeed >= sprintPx * 0.25, `Shift+W/S should remain visible at progress ${progress}`);
    assert(values.laneSprintSpeed <= sprintPx * 0.45, `Shift+W/S should stay below forward sprint at progress ${progress}`);
  }
}

function progressPixelsPerSecond(trailGeometry, progress, progressSpeed) {
  const current = trackPixelAtProgress(trailGeometry, progress);
  const next = trackPixelAtProgress(trailGeometry, progress + 0.01);
  const pixelsPerProgress = Math.hypot(next.x - current.x, next.y - current.y) / 0.01;
  const trailPoint = trailGeometry.progressToRestoredMarathonTrailPoint(progress);
  return pixelsPerProgress * progressSpeed * trailGeometry.calculateRestoredMarathonSpeedScale(trailPoint.tangent);
}

function trackPixelAtProgress(trailGeometry, progress) {
  const point = trailGeometry.progressToRestoredMarathonMapPoint(progress, {
    worldWidth: trailGeometry.RESTORED_MARATHON_WORLD_WIDTH,
    worldHeight: trailGeometry.RESTORED_MARATHON_WORLD_HEIGHT,
    laneOffsetPx: 0,
    laneHalfWidthPx: 232
  });
  return {
    x: point.x / 100 * trailGeometry.RESTORED_MARATHON_WORLD_WIDTH,
    y: point.y / 100 * trailGeometry.RESTORED_MARATHON_WORLD_HEIGHT
  };
}

function assertServerSprintMatchesClient({ marathon, sprintSpeed }) {
  const moved = marathon.advanceRestoredMarathonParticipant(
    marathon.createRestoredMarathonParticipant({ participantId: "runner:you" }),
    { pace: "sprint", sequence: 1, raceTimeMs: 1000 },
    1000,
    { distanceMeters: 900 }
  );
  const serverSprintPercent = moved.progressMeters / 900 * 100;
  assert(Math.abs(serverSprintPercent - sprintSpeed) <= 0.08, "server sprint speed should match connected client prediction");
}

function assertNetcodePressure(netcode) {
  const budget = netcode.estimateRestoredMarathonNetcodeBudget({ runnerCount: 30 });
  assert.equal(budget.withinPlayerBudget, true, "30-runner player bandwidth budget must fit");
  assert.equal(budget.withinServerBudget, true, "30-runner server egress budget must fit");
  const degradedLane = netcode.chooseRestoredMarathonNetworkLane({ pingMs: 240, jitterMs: 80, packetLossPct: 3 });
  assert.equal(degradedLane.lane, "degraded", "high ping should lower the network lane");
  assert(degradedLane.inputHz < budget.inputHz, "bad network lane should reduce input cadence");
  assert(degradedLane.snapshotHz < budget.snapshotHz, "bad network lane should reduce snapshot cadence");
  const spamPackets = Array.from({ length: 24 }, (_, index) => ({
    type: "input_update", clientId: "client:spam", sourceClientId: "client:spam", sequence: index + 1, receivedAtMs: 1000
  }));
  const spamDecision = netcode.shouldAcceptRestoredMarathonRelayPacket(spamPackets, {
    type: "input_update", clientId: "client:spam", sourceClientId: "client:spam", sequence: 25, receivedAtMs: 1000
  }, { nowMs: 1000 });
  assert.equal(spamDecision.ok, false, "packet pressure guard must block input spam");
  return { budget, degradedLane, spamDecision };
}

function assertConnectedStartGuards() {
  assert(
    pageSource.includes("source === \"button\" ? SINGULARITY_RACE_SCREENS.QUEUE : SINGULARITY_RACE_SCREENS.RACE"),
    "normal connected entries must land in race staging, not the room queue"
  );
  assert(
    pageSource.includes("savePackets([], { reason: \"session_reset\" })"),
    "fresh connected joins must clear stale dev packet relay storage"
  );
  assert(
    pageSource.includes("state.connectedSession && state.action.raceStarted"),
    "connected input authority must start only after the race gate opens"
  );
  assert(
    pageSource.includes("state.participantType === \"spectator\" || !state.action.raceStarted"),
    "connected attack/skill/input requests must be blocked before the start"
  );
  assert(
    pageSource.includes("PLAYER_LATE_START_GRACE_MS") && pageSource.includes("SPECTATOR_LATE_JOIN_GRACE_MS"),
    "stale start commands must not unlock a fresh player staging session forever"
  );
  assert(
    pageSource.includes("readSingularityRaceControlCommand(window.localStorage, DEV_ROOM_ID)") &&
      pageSource.includes("roomId: DEV_ROOM_ID"),
    "host start commands must be scoped to the current dev room"
  );
  assert(
    pageSource.includes("state.screen === SINGULARITY_RACE_SCREENS.PROFILE && !readPlayerProfile()"),
    "host start commands must not skip the first profile setup loop"
  );
  assert(
    pageSource.includes("startLocalCountdown(\"admin\", command)") && pageSource.includes("lastRaceControlCommandId = command.commandId"),
    "connected joins during an active countdown must preserve the admin start gate"
  );
  assert(
    pageSource.includes("const runnerPositions = createConnectedRaceStartPositions()") && pageSource.includes("runnerPositions"),
    "connected dev server start must seed from the current start paddock positions"
  );
  assert(
    pageSource.includes("pinConnectedRaceStartPositions") && pageSource.includes("publishConnectedStartSnapshot"),
    "connected race start must pin and snapshot seeded positions before prediction can correct backward"
  );
  assert(
    pageSource.includes("getStartGateOpenProgress") && pageSource.includes("gateOpenedAtMs") && pageSource.includes("is-opening"),
    "start gate should remain briefly and animate open after countdown"
  );
  assert(
    pageSource.includes("advanceConnectedLocalPrediction") && pageSource.includes("preserveLocalPrediction"),
    "connected race display must use local prediction with server reconciliation"
  );

  const serverStateSource = fs.readFileSync(path.join(root, "src/restored/online/marathon-server-state-contract.js"), "utf8");
  const wsDevServerSource = fs.readFileSync(path.join(root, "src/restored/online/marathon-websocket-dev-server-mock.js"), "utf8");
  const startPositionSource = fs.readFileSync(path.join(root, "src/restored/online/marathon-server-start-position.js"), "utf8");
  const predictionSource = fs.readFileSync(path.join(root, "src/restored/games/singularity-race-prediction.js"), "utf8");
  const devOnlineSource = fs.readFileSync(path.join(root, "src/restored/games/singularity-race-dev-online.js"), "utf8");
  assert(serverStateSource.includes("laneOffsetPx"), "server snapshots must carry authoritative road lane offsets");
  assert(serverStateSource.includes("command.direction.y * laneSpeedPxPerSecond"), "server input must preserve W/S lane movement");
  assert(wsDevServerSource.includes("applyRestoredMarathonServerStartPositions"), "dev server start must accept seeded race positions");
  assert(startPositionSource.includes("progressPercent") && startPositionSource.includes("laneOffsetPx"), "server start seeding must preserve paddock progress and lane");
  assert(predictionSource.includes("reconcileSingularityRaceLocalPrediction"), "prediction module must expose reconciliation");
  assert(devOnlineSource.includes("serverProgress") && devOnlineSource.includes("serverLaneOffsetPx"), "snapshot merge must keep server reconciliation targets");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
