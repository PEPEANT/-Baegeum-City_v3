import { createRestoredMarathonNetcodeProfile } from "./marathon-netcode-contract.js";

export const RESTORED_MARATHON_SERVER_LOOP_VERSION = "restored-marathon-server-loop-001";

export function createRestoredMarathonServerLoopConfig(options = {}) {
  const profile = createRestoredMarathonNetcodeProfile(options.profile);
  const serverTickHz = clampInteger(options.serverTickHz ?? profile.serverTickHz, 10, 30);
  const snapshotHz = clampInteger(options.snapshotHz ?? profile.snapshotHz, 4, 20);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_LOOP_VERSION,
    serverTickHz,
    snapshotHz,
    tickIntervalMs: round2(1000 / serverTickHz),
    snapshotIntervalMs: round2(1000 / snapshotHz),
    maxTicksPerFrame: clampInteger(options.maxTicksPerFrame ?? 5, 1, 12),
    maxSnapshotsPerFrame: clampInteger(options.maxSnapshotsPerFrame ?? 3, 1, 6)
  });
}

export function planRestoredMarathonServerFrame(state = {}, options = {}) {
  const config = createRestoredMarathonServerLoopConfig(options);
  const nowMs = clampNumber(state.nowMs ?? 0, 0, 1000000000000);
  const lastTickAtMs = clampNumber(state.lastTickAtMs ?? 0, 0, nowMs);
  const lastSnapshotAtMs = clampNumber(state.lastSnapshotAtMs ?? 0, 0, nowMs);
  const rawTicksDue = Math.max(0, Math.floor((nowMs - lastTickAtMs) / config.tickIntervalMs));
  const ticksDue = Math.min(rawTicksDue, config.maxTicksPerFrame);
  const rawSnapshotsDue = Math.max(0, Math.floor((nowMs - lastSnapshotAtMs) / config.snapshotIntervalMs));
  const snapshotsDue = Math.min(rawSnapshotsDue, config.maxSnapshotsPerFrame);
  const tickSkip = Math.max(0, rawTicksDue - ticksDue);
  const snapshotSkip = Math.max(0, rawSnapshotsDue - snapshotsDue);
  const tickTimes = Object.freeze(Array.from({ length: ticksDue }, (_, index) => round2(lastTickAtMs + config.tickIntervalMs * (tickSkip + index + 1))));
  const snapshotTimes = Object.freeze(Array.from({ length: snapshotsDue }, (_, index) => round2(lastSnapshotAtMs + config.snapshotIntervalMs * (snapshotSkip + index + 1))));
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_LOOP_VERSION,
    nowMs,
    ticksDue,
    droppedTicks: tickSkip,
    tickElapsedMs: config.tickIntervalMs,
    tickTimes,
    nextTickIndex: Math.max(0, Number(state.tickIndex || 0)) + rawTicksDue,
    lastTickAtMs: tickTimes.at(-1) ?? lastTickAtMs,
    snapshotDue: rawSnapshotsDue > 0,
    snapshotsDue,
    droppedSnapshots: snapshotSkip,
    snapshotTimes,
    nextSnapshotIndex: Math.max(0, Number(state.snapshotIndex || 0)) + rawSnapshotsDue,
    lastSnapshotAtMs: snapshotTimes.at(-1) ?? lastSnapshotAtMs,
    config
  });
}

export function coalesceRestoredMarathonServerInputBatch(envelopes = []) {
  const latestByParticipant = new Map();
  let dropped = 0;
  for (const envelope of envelopes) {
    const participantId = envelope?.payload?.participantId || envelope?.participantId || envelope?.clientId || "";
    if (!participantId) {
      dropped += 1;
      continue;
    }
    const sequence = Math.max(0, Number(envelope.sequence || envelope.payload?.sequence || 0));
    const previous = latestByParticipant.get(participantId);
    if (!previous || sequence >= previous.sequence) {
      if (previous) dropped += 1;
      latestByParticipant.set(participantId, { participantId, sequence, envelope });
    } else {
      dropped += 1;
    }
  }
  const accepted = Array.from(latestByParticipant.values())
    .sort((left, right) => left.participantId.localeCompare(right.participantId))
    .map((row) => row.envelope);
  return Object.freeze({ accepted: Object.freeze(accepted), dropped });
}

export function validateRestoredMarathonServerLoopContract() {
  const errors = [];
  const config = createRestoredMarathonServerLoopConfig();
  if (config.serverTickHz !== 20 || config.snapshotHz !== 10) errors.push("default server loop should be 20Hz tick and 10Hz snapshot");
  if (config.tickIntervalMs !== 50 || config.snapshotIntervalMs !== 100) errors.push("default loop intervals should be stable");
  const plan = planRestoredMarathonServerFrame({ nowMs: 250, lastTickAtMs: 0, lastSnapshotAtMs: 0 });
  if (plan.ticksDue !== 5 || plan.snapshotDue !== true || plan.snapshotsDue !== 2) errors.push("loop plan should emit due ticks and snapshots");
  const hitch = planRestoredMarathonServerFrame({ nowMs: 1000, lastTickAtMs: 0, lastSnapshotAtMs: 0 });
  if (hitch.ticksDue !== 5 || hitch.droppedTicks <= 0) errors.push("loop plan should cap catch-up ticks after a hitch");
  if (hitch.snapshotsDue !== 3 || hitch.droppedSnapshots <= 0 || hitch.lastSnapshotAtMs !== 1000) errors.push("loop plan should drop stale snapshot backlog after a hitch");
  const inputBatch = coalesceRestoredMarathonServerInputBatch([
    packet("runner:a", 1),
    packet("runner:a", 2),
    packet("runner:b", 1),
    packet("runner:a", 1)
  ]);
  if (inputBatch.accepted.length !== 2 || inputBatch.dropped !== 2) errors.push("server input batch should keep only latest per participant");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function packet(participantId, sequence) {
  return Object.freeze({ sequence, payload: Object.freeze({ participantId }) });
}

function clampInteger(value, min, max) { return Math.round(clampNumber(value, min, max)); }
function clampNumber(value, min, max) { const number = Number(value); return Math.max(min, Math.min(max, Number.isFinite(number) ? number : min)); }
function round2(value) { return Math.round(value * 100) / 100; }
