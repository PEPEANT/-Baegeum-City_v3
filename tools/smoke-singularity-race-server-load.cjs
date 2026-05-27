"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const runnerCount = 30;
const course = Object.freeze({
  distanceMeters: 360,
  checkpointMeters: Object.freeze([0, 72, 144, 216, 288, 360])
});

async function main() {
  const serverModule = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-websocket-dev-server-mock.js")));
  const transportModule = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-server-transport-contract.js")));
  const netcode = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-netcode-contract.js")));
  const serverLoop = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-server-loop-contract.js")));
  const devLoop = await import(pathToFileURL(path.join(root, "src/restored/online/marathon-websocket-dev-loop.js")));
  const marathon = await import(pathToFileURL(path.join(root, "src/restored/games/marathon-contract.js")));

  const budget = netcode.estimateRestoredMarathonNetcodeBudget({ runnerCount });
  assert.equal(budget.withinPlayerBudget, true, "30-runner upstream/downstream player budget should fit");
  assert.equal(budget.withinServerBudget, true, "30-runner server egress budget should fit");
  assert.equal(netcode.chooseRestoredMarathonNetworkLane({ pingMs: 230, jitterMs: 80, packetLossPct: 3 }).lane, "degraded");

  const pressure = netcode.createRestoredMarathonPacketPressureReport(createNominalOneSecondPackets(), { nowMs: 1000 });
  assert.equal(pressure.overloaded, false, "20Hz input from 30 runners should not overload per-client packet pressure");
  const loopConfig = serverLoop.createRestoredMarathonServerLoopConfig();
  assert.equal(loopConfig.serverTickHz, 20, "server tick should stay at 20Hz");
  assert.equal(loopConfig.snapshotHz, 10, "server snapshot should stay at 10Hz");

  let now = 0;
  const server = serverModule.createRestoredMarathonWebSocketDevServerMock({ clock: () => now, course, packetLimit: 720 });
  const clients = connectAndJoinRunners(server);
  const roomId = clients[0].join.room.roomId;
  const started = server.startRace(clients[0].transport, roomId, { serverTimeMs: now });
  assert.equal(started.ok, true, "server should start the 30-runner load room");
  let room = started.room;
  const sequences = new Map(clients.map((client) => [client.participantId, 10]));
  const snapshots = [];
  let coalescedDrops = 0;
  let loopState = devLoop.createRestoredMarathonWebSocketDevLoopState({ roomId });

  for (let frame = 1; frame <= 1400 && room.phase !== "finished"; frame += 1) {
    now += loopConfig.tickIntervalMs;
    const plan = serverLoop.planRestoredMarathonServerFrame({ ...loopState, nowMs: now });
    assert(plan.ticksDue <= 1, "steady 20Hz load loop should not build tick debt");
    const inputs = clients.map((client) => {
      const sequence = sequences.get(client.participantId) + 1;
      sequences.set(client.participantId, sequence);
      return createInputEnvelope(transportModule, client, roomId, sequence, now, frame);
    });
    if (frame % 10 === 0) {
      const client = clients[0];
      inputs.push(createInputEnvelope(transportModule, client, roomId, sequences.get(client.participantId) - 1, now, frame));
    }
    const advanced = devLoop.advanceRestoredMarathonWebSocketDevLoop(server, loopState, {
      nowMs: now,
      transports: clients.map((client) => client.transport),
      inputs,
      room
    });
    assert.equal(advanced.acceptedInputs, runnerCount, "server tick should accept one latest input per runner");
    assert.equal(advanced.rejectedInputs, 0, "load loop should not reject valid runner input");
    coalescedDrops += advanced.droppedInputs;
    room = advanced.room || room;
    for (const snapshot of advanced.snapshots) {
      assert.equal(snapshot.payload.serverOwned, true, "load-test snapshot should be server-owned");
      assert.equal(snapshot.payload.participants.length, runnerCount, "snapshot should include all 30 runners");
      snapshots.push(snapshot);
    }
    loopState = advanced.state;
  }

  const ranking = marathon.rankRestoredMarathonParticipants(room.participants);
  assert.equal(room.phase, "finished", "all 30 server-owned runners should finish");
  assert.equal(ranking.length, runnerCount, "ranking should include all 30 runners");
  assert(ranking.every((row) => row.finishedAtMs !== null), "every runner should have a server finish time");
  assert(coalescedDrops > 0, "server loop should drop older duplicate inputs inside a tick");
  assert(server.getPackets(roomId).length <= 720, "dev server packet log should stay bounded during a full room race");
  assert(snapshots.length > 0, "load smoke should produce periodic server snapshots");

  console.log("Singularity Race server load smoke passed.");
  console.log(JSON.stringify({
    runners: runnerCount,
    finishTimeMs: ranking.at(-1).finishedAtMs,
    snapshots: snapshots.length,
    serverEgressKbps: budget.serverEgressKbps,
    packetLog: server.getPackets(roomId).length,
    coalescedDrops
  }, null, 2));
}

function createInputEnvelope(transportModule, client, roomId, sequence, tickTime, frame) {
  return transportModule.createRestoredMarathonTransportEnvelope("input_update", {
    participantId: client.participantId,
    pace: frame % 180 === 0 ? "push" : "sprint",
    raceTimeMs: tickTime,
    direction: { x: 1, y: ((client.index % 3) - 1) * 0.12 }
  }, { clientId: client.transport.clientId, roomId, sequence, serverTimeMs: tickTime });
}

function connectAndJoinRunners(server) {
  const clients = [];
  for (let index = 0; index < runnerCount; index += 1) {
    const participantId = `runner:load:${index + 1}`;
    const connected = server.connectClient({ clientId: `client:load:${index + 1}` });
    assert.equal(connected.ok, true, `client ${index + 1} should connect`);
    const join = server.joinRoom(connected.transport, {
      participantId,
      nickname: `Load ${index + 1}`,
      sequence: 2,
      mapVersion: "baegeum-city-v2-map-001"
    });
    assert.equal(join.ok, true, `runner ${index + 1} should join: ${join.reason}`);
    clients.push({ index, participantId, transport: connected.transport, join });
  }
  assert.equal(clients.at(-1).join.room.participants.length, runnerCount, "load room should contain 30 runners");
  return clients;
}

function createNominalOneSecondPackets() {
  const packets = [];
  for (let runner = 0; runner < runnerCount; runner += 1) {
    const clientId = `client:pressure:${runner + 1}`;
    for (let sequence = 1; sequence <= 20; sequence += 1) {
      packets.push(Object.freeze({
        clientId,
        sourceClientId: clientId,
        type: "input_update",
        sequence,
        receivedAtMs: 1000 - (20 - sequence) * 50,
        roomId: "room:pressure"
      }));
    }
  }
  return Object.freeze(packets);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
