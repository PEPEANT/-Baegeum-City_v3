import {
  coalesceRestoredMarathonServerInputBatch,
  createRestoredMarathonServerLoopConfig,
  planRestoredMarathonServerFrame
} from "./marathon-server-loop-contract.js";

export const RESTORED_MARATHON_WEBSOCKET_DEV_LOOP_VERSION = "restored-marathon-websocket-dev-loop-001";

export function createRestoredMarathonWebSocketDevLoopState(options = {}) {
  return Object.freeze({
    version: RESTORED_MARATHON_WEBSOCKET_DEV_LOOP_VERSION,
    roomId: options.roomId || "",
    lastTickAtMs: Math.max(0, Number(options.lastTickAtMs || 0)),
    lastSnapshotAtMs: Math.max(0, Number(options.lastSnapshotAtMs || 0)),
    tickIndex: Math.max(0, Number(options.tickIndex || 0)),
    snapshotIndex: Math.max(0, Number(options.snapshotIndex || 0)),
    inputQueue: Object.freeze([...(options.inputQueue || [])])
  });
}

export function queueRestoredMarathonWebSocketDevLoopInput(stateInput = {}, envelope = {}) {
  const state = createRestoredMarathonWebSocketDevLoopState(stateInput);
  return createRestoredMarathonWebSocketDevLoopState({
    ...state,
    inputQueue: Object.freeze([...state.inputQueue, envelope])
  });
}

export function advanceRestoredMarathonWebSocketDevLoop(server, stateInput = {}, options = {}) {
  const state = createRestoredMarathonWebSocketDevLoopState(stateInput);
  const nowMs = Math.max(0, Number(options.nowMs ?? state.lastTickAtMs));
  const plan = planRestoredMarathonServerFrame({ ...state, nowMs }, options.loop);
  const transportByClientId = createTransportMap(options.transports || []);
  let inputQueue = Object.freeze([...state.inputQueue, ...(options.inputs || [])]);
  let acceptedInputs = 0, droppedInputs = 0, rejectedInputs = 0;
  const snapshots = [];
  let latestRoom = options.room || null;

  for (const tickTime of plan.tickTimes) {
    const batch = coalesceRestoredMarathonServerInputBatch(inputQueue);
    inputQueue = Object.freeze([]);
    droppedInputs += batch.dropped;
    for (const envelope of batch.accepted) {
      const transport = transportByClientId.get(envelope.clientId);
      if (!transport) {
        rejectedInputs += 1;
        continue;
      }
      const result = server.ingestClientEnvelope(transport, envelope, { receivedAtMs: tickTime, elapsedMs: plan.tickElapsedMs });
      if (result.ok) {
        acceptedInputs += 1;
        latestRoom = result.room || latestRoom;
      } else {
        rejectedInputs += 1;
      }
    }
  }

  if (plan.snapshotDue && state.roomId) {
    let sequence = plan.nextSnapshotIndex - plan.snapshotsDue + 1;
    for (const snapshotTime of plan.snapshotTimes) {
      const snapshot = server.createStateSnapshot(state.roomId, {
        sequence,
        elapsedMs: plan.tickElapsedMs,
        pingTiming: {
          clientSentAtMs: Math.max(0, snapshotTime - 76),
          serverReceivedAtMs: Math.max(0, snapshotTime - 40),
          serverSentAtMs: Math.max(0, snapshotTime - 38),
          clientReceivedAtMs: snapshotTime
        }
      });
      if (snapshot.ok) snapshots.push(snapshot.snapshot);
      sequence += 1;
    }
  }

  return Object.freeze({
    version: RESTORED_MARATHON_WEBSOCKET_DEV_LOOP_VERSION,
    state: createRestoredMarathonWebSocketDevLoopState({
      roomId: state.roomId,
      lastTickAtMs: plan.lastTickAtMs,
      lastSnapshotAtMs: plan.lastSnapshotAtMs,
      tickIndex: plan.nextTickIndex,
      snapshotIndex: plan.nextSnapshotIndex,
      inputQueue
    }),
    plan,
    room: latestRoom,
    snapshots: Object.freeze(snapshots),
    acceptedInputs,
    droppedInputs,
    rejectedInputs
  });
}

export function validateRestoredMarathonWebSocketDevLoopContract() {
  const errors = [];
  const config = createRestoredMarathonServerLoopConfig();
  if (config.serverTickHz !== 20 || config.snapshotHz !== 10) errors.push("dev loop should inherit 20Hz/10Hz cadence");
  const queued = queueRestoredMarathonWebSocketDevLoopInput({ roomId: "room:test" }, { clientId: "client:a", payload: { participantId: "runner:a" }, sequence: 1 });
  if (queued.inputQueue.length !== 1) errors.push("dev loop should queue inputs");
  const planned = planRestoredMarathonServerFrame({ nowMs: 100, lastTickAtMs: 0, lastSnapshotAtMs: 0 });
  if (!planned.snapshotDue || planned.ticksDue !== 2) errors.push("dev loop should plan tick and snapshot work");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function createTransportMap(transports) {
  const map = new Map();
  for (const transport of transports) {
    if (transport?.clientId) map.set(transport.clientId, transport);
  }
  return map;
}
