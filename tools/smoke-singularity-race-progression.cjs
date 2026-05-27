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
  const netcode = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-netcode-contract.js")));
  const localSim = await import(pathToFileURL(path.join(root, "src/restored/games/singularity-race-local-sim.js")));

  const startProgress = readNumberConstant("START_LINE_PROGRESS");
  const finishProgress = readNumberConstant("LOCAL_FINISH_PROGRESS");
  const railMaxProgress = readNumberConstant("RAIL_MAX_PROGRESS");
  const runSpeed = readNumberConstant("LOCAL_RUN_PROGRESS_PER_SECOND");
  const sprintSpeed = readNumberConstant("LOCAL_SPRINT_PROGRESS_PER_SECOND");

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
  assert(runSecondsToFinish > 0 && runSecondsToFinish <= 600, "normal run must be able to finish within 10 minutes");
  assert(sprintSecondsToFinish > 0 && sprintSecondsToFinish < runSecondsToFinish, "sprint must shorten finish time");

  const budget = netcode.estimateRestoredMarathonNetcodeBudget({ runnerCount: 30 });
  assert.equal(budget.withinPlayerBudget, true, "30-runner player bandwidth budget must fit");
  assert.equal(budget.withinServerBudget, true, "30-runner server egress budget must fit");

  const degradedLane = netcode.chooseRestoredMarathonNetworkLane({ pingMs: 240, jitterMs: 80, packetLossPct: 3 });
  assert.equal(degradedLane.lane, "degraded", "high ping should lower the network lane");
  assert(degradedLane.inputHz < budget.inputHz, "bad network lane should reduce input cadence");
  assert(degradedLane.snapshotHz < budget.snapshotHz, "bad network lane should reduce snapshot cadence");

  const spamPackets = Array.from({ length: 24 }, (_, index) => ({
    type: "input_update",
    clientId: "client:spam",
    sourceClientId: "client:spam",
    sequence: index + 1,
    receivedAtMs: 1000
  }));
  const spamDecision = netcode.shouldAcceptRestoredMarathonRelayPacket(spamPackets, {
    type: "input_update",
    clientId: "client:spam",
    sourceClientId: "client:spam",
    sequence: 25,
    receivedAtMs: 1000
  }, { nowMs: 1000 });
  assert.equal(spamDecision.ok, false, "packet pressure guard must block input spam");

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

  assert(pageSource.includes("race_finalized"), "local finish should rehearse server-owned finalization");
  assert(pageSource.includes("server:local-preview"), "local finish packet must be marked as server-preview owned");
  assert(pageSource.includes("race-result-panel"), "race screen needs a minimal finish result layer");
  assert(pageSource.includes("finalizeRaceResult"), "local and server finishes should share one result finalizer");
  assert(pageSource.includes("createConnectedFinishRanking"), "server-owned snapshots should drive connected race results");

  console.log("singularity race progression smoke ok");
  console.log(JSON.stringify({
    runSecondsToFinish,
    sprintSecondsToFinish,
    serverEgressKbpsFor30: budget.serverEgressKbps,
    degradedLane: degradedLane.lane,
    spamDecision: spamDecision.reason
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
