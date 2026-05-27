import { createRestoredMarathonDevRoomTransport } from "../online/marathon-dev-room-transport.js";
import { createRestoredMarathonTransportEnvelope } from "../online/marathon-server-transport-contract.js";

const DEFAULT_CLIENT_ID = "client:singularity-race-lobby";
const DEFAULT_SERVER_ID = "server:dev-adapter";
const DEFAULT_COURSE_METERS = 42195;
const DEFAULT_START_PROGRESS = 4;
const DEFAULT_LANE_HALF_WIDTH_PX = 232;
const DEFAULT_MAX_RUNNERS = 30;

export function createSingularityConnectedRelayEnvelope(packet = {}, context = {}) {
  const payload = packet.payload || {};
  const connectedSession = context.connectedSession || {};
  const serverOwned = packet.type === "state_snapshot" || payload.serverOwned;
  return createRestoredMarathonTransportEnvelope(packet.type, payload, {
    clientId: packet.clientId || (serverOwned ? DEFAULT_SERVER_ID : DEFAULT_CLIENT_ID),
    roomId: packet.roomId || payload.roomId || connectedSession.roomId || "",
    sequence: packet.sequence || payload.sequence || context.fallbackSequence || 1,
    serverTimeMs: packet.serverTimeMs || payload.serverTimeMs || 0
  });
}

export function createSingularityRoomPressureReport(transport, packets, nowMs = Date.now()) {
  return transport?.createPressureReport?.(packets, { nowMs }) || null;
}

export function createSingularityDevRoomPacketTransport(options = {}) {
  return createRestoredMarathonDevRoomTransport({
    clientId: DEFAULT_CLIENT_ID,
    packetLimit: 80,
    ...options
  });
}

export function mergeSingularityServerSnapshotRunners(existingRunners = [], snapshotPayload = {}, options = {}) {
  const participants = (Array.isArray(snapshotPayload.participants) ? snapshotPayload.participants : [])
    .filter((participant) => isRunnerParticipant(participant));
  const existingById = new Map(existingRunners.map((runner) => [runner.id, runner]));
  const courseDistanceMeters = positiveNumber(options.courseDistanceMeters, DEFAULT_COURSE_METERS);
  const startProgress = finiteNumber(options.startLineProgress, DEFAULT_START_PROGRESS);
  const laneHalfWidthPx = positiveNumber(options.roadLaneHalfWidthPx, DEFAULT_LANE_HALF_WIDTH_PX);
  const maxRunners = Math.max(1, Math.round(positiveNumber(options.maxRunners, DEFAULT_MAX_RUNNERS)));
  const presets = Array.isArray(options.presets) ? options.presets : [];
  const phase = snapshotPayload.phase || "";
  const runners = participants.map((participant, index) => {
    const id = normalizeRunnerId(participant.participantId, index);
    const existing = existingById.get(id) || existingById.get(participant.participantId) || null;
    const progress = resolveSnapshotProgress(participant, {
      courseDistanceMeters,
      existingProgress: existing?.progress,
      phase,
      startProgress
    });
    const laneOffsetPx = resolveSnapshotLaneOffset(participant, existing, {
      laneHalfWidthPx,
      maxRunners
    });
    return Object.freeze({
      id,
      name: participant.displayName || existing?.name || `Runner ${index + 1}`,
      skin: existing?.skin || (id === "you" ? options.selectedSkin : presets[index % presets.length]?.id) || options.defaultSkin || "default",
      ready: false,
      progress,
      laneOffsetPx,
      hp: existing?.hp ?? 100,
      maxHp: existing?.maxHp ?? 100,
      lastSafeCheckpointIndex: existing?.lastSafeCheckpointIndex ?? 0,
      collisionAtMs: existing?.collisionAtMs ?? 0,
      serverOwned: true,
      serverProgressMeters: finiteNumber(participant.progressMeters, 0),
      serverSequence: Math.max(0, Number(participant.lastSequence || 0)),
      finishedAtMs: participant.finishedAtMs ?? null
    });
  });
  return Object.freeze({
    applied: participants.length > 0,
    sequence: Math.max(0, Number(snapshotPayload.sequence || 0)),
    phase,
    runners: Object.freeze(runners)
  });
}

export function validateSingularityRaceDevOnlineContract() {
  const errors = [];
  const roomId = "room:singularity-race:dev-001";
  const envelope = createSingularityConnectedRelayEnvelope({
    type: "state_snapshot",
    payload: { serverOwned: true, sequence: 2 }
  }, { connectedSession: { roomId } });
  if (envelope.clientId !== DEFAULT_SERVER_ID) errors.push("server-owned snapshots must be marked as server packets");
  if (envelope.roomId !== roomId) errors.push("relay envelope must keep the connected room id");
  const transport = createSingularityDevRoomPacketTransport({ roomId, clock: () => 100 });
  const submitted = transport.submitPacket(transport.seedPackets([]), envelope, { reason: "state_snapshot" });
  if (!submitted.ok) errors.push(`dev room packet should submit: ${submitted.reason}`);
  const pressure = createSingularityRoomPressureReport(transport, submitted.packets, 100);
  if (!pressure || !Array.isArray(pressure.clients)) errors.push("pressure report must expose relay guard clients");
  const merged = mergeSingularityServerSnapshotRunners([
    { id: "you", name: "YOU", skin: "gpichan", progress: 4, laneOffsetPx: 0, hp: 100, maxHp: 100 }
  ], {
    sequence: 7,
    phase: "racing",
    participants: [{ participantId: "runner:you", displayName: "Tester", lane: 16, progressMeters: 4219.5, lastSequence: 5 }]
  }, { selectedSkin: "gpichan", courseDistanceMeters: 42195, roadLaneHalfWidthPx: 232 });
  if (!merged.applied || merged.runners[0].id !== "you") errors.push("server snapshots must map runner:you onto the local player");
  if (merged.runners[0].progress < 9 || merged.runners[0].progress > 11) errors.push("server snapshot meters must become display progress percent");
  if (merged.runners[0].skin !== "gpichan") errors.push("server snapshot merge must preserve the local player skin");
  const spectatorMerged = mergeSingularityServerSnapshotRunners([], {
    sequence: 8,
    phase: "racing",
    participants: [{ participantId: "spectator:test", displayName: "Watcher", type: "spectator" }]
  });
  if (spectatorMerged.applied || spectatorMerged.runners.length) errors.push("spectators must not render as runners");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function normalizeRunnerId(participantId, index) {
  const id = String(participantId || "");
  if (id === "runner:you") return "you";
  if (id.startsWith("runner:bot-")) return id.slice("runner:".length);
  return id || `runner:${index + 1}`;
}

function isRunnerParticipant(participant = {}) {
  if (participant.type) return participant.type === "player" || participant.type === "bot";
  return String(participant.participantId || "").startsWith("runner:");
}

function resolveSnapshotProgress(participant, options) {
  const progressPercent = Number.isFinite(Number(participant.progressPercent))
    ? Number(participant.progressPercent)
    : (finiteNumber(participant.progressMeters, 0) / options.courseDistanceMeters) * 100;
  if (progressPercent <= 0 && options.phase !== "racing" && options.phase !== "finished") {
    return clampNumber(options.existingProgress ?? options.startProgress, 0, 100);
  }
  return clampNumber(progressPercent, 0, 100);
}

function resolveSnapshotLaneOffset(participant, existing, options) {
  if (Number.isFinite(Number(participant.laneOffsetPx))) {
    return clampNumber(Number(participant.laneOffsetPx), -options.laneHalfWidthPx, options.laneHalfWidthPx);
  }
  if (Number.isFinite(Number(existing?.laneOffsetPx))) {
    return clampNumber(Number(existing.laneOffsetPx), -options.laneHalfWidthPx, options.laneHalfWidthPx);
  }
  const lane = clampNumber(participant.lane || 1, 1, options.maxRunners);
  const ratio = options.maxRunners <= 1 ? 0.5 : (lane - 1) / (options.maxRunners - 1);
  return clampNumber((ratio - 0.5) * options.laneHalfWidthPx * 1.8, -options.laneHalfWidthPx, options.laneHalfWidthPx);
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max) {
  const number = finiteNumber(value, min);
  return Math.max(min, Math.min(max, number));
}
