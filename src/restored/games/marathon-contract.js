import { createRestoredMarathonTrailSaveCheckpointMeters } from "./marathon-trail-geometry.js";

export const RESTORED_MARATHON_CONTRACT_VERSION = "restored-marathon-001";

export const RESTORED_MARATHON_MAX_RUNNERS = 30;
export const RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS = 32;
export const RESTORED_MARATHON_MAX_SPECTATORS = 100;

export const RESTORED_MARATHON_AUTHORITY = Object.freeze({ LOCAL_PREVIEW: "local_preview", SERVER_REQUIRED: "server_required" });
export const RESTORED_MARATHON_PHASES = Object.freeze(["lobby", "countdown", "racing", "finished", "abandoned"]);
export const RESTORED_MARATHON_PACKET_TYPES = Object.freeze(["join_request", "join_result", "input_update", "skill_use", "attack_action", "checkpoint_claim", "finish_claim", "checkpoint_reward", "respawn_notice", "state_snapshot", "race_finalized"]);
export const RESTORED_MARATHON_EFFECT_TYPES = Object.freeze({ RACE_RESULT: "marathon_race_result", RANKING_SNAPSHOT_CANDIDATE: "ranking_snapshot_candidate", ONLINE_AUTHORITY_REQUEST: "online_authority_request", UI_MESSAGE: "ui_message" });

const RUNNER_TYPES = Object.freeze(["player", "bot"]);
const PARTICIPANT_TYPES = Object.freeze(["player", "bot", "spectator", "admin"]);

const PACE_PROFILES = Object.freeze({
  recover: Object.freeze({ speedMetersPerSecond: 3.8, staminaPerSecond: 0.38 }),
  steady: Object.freeze({ speedMetersPerSecond: 5.2, staminaPerSecond: -0.04 }),
  push: Object.freeze({ speedMetersPerSecond: 6.4, staminaPerSecond: -0.14 }),
  sprint: Object.freeze({ speedMetersPerSecond: 14.06, staminaPerSecond: -0.4 })
});

const DEFAULT_COURSE = Object.freeze({
  courseId: "baegeum-marathon-stadium-001",
  label: "Singularity Log Trail",
  distanceMeters: 42195,
  checkpointMeters: createRestoredMarathonTrailSaveCheckpointMeters(42195),
  mapId: "baegeum-city",
  venueId: "venue:baegeum-marathon-stadium"
});

function clamp(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, number));
}

function round2(value) { return Math.round(value * 100) / 100; }
function cloneCheckpointLog(log = []) { return Object.freeze(log.map((item) => Object.freeze({ ...item }))); }
function isRunnerType(type) { return RUNNER_TYPES.includes(type); }

function normalizeCheckpointMeters(distanceMeters, checkpointMeters = []) {
  const raw = [0, ...checkpointMeters, distanceMeters]
    .map((meters) => clamp(meters, 0, distanceMeters))
    .sort((a, b) => a - b);
  return Object.freeze(raw.filter((meters, index) => index === 0 || meters !== raw[index - 1]));
}

export function createRestoredMarathonCourse(options = {}) {
  const distanceMeters = clamp(options.distanceMeters ?? DEFAULT_COURSE.distanceMeters, 100, 100000);
  return Object.freeze({
    courseId: options.courseId || DEFAULT_COURSE.courseId,
    label: options.label || DEFAULT_COURSE.label,
    distanceMeters,
    checkpointMeters: normalizeCheckpointMeters(distanceMeters, options.checkpointMeters || DEFAULT_COURSE.checkpointMeters),
    mapId: options.mapId || DEFAULT_COURSE.mapId,
    venueId: options.venueId || DEFAULT_COURSE.venueId
  });
}

export function createRestoredMarathonParticipant(options = {}) {
  const type = PARTICIPANT_TYPES.includes(options.type) ? options.type : "bot";
  const finishedAtMs = options.finishedAtMs === null || options.finishedAtMs === undefined ? null : (Number.isFinite(Number(options.finishedAtMs)) ? Number(options.finishedAtMs) : null);
  const maxHp = clamp(options.maxHp ?? 100, 1, 500);
  return Object.freeze({
    participantId: options.participantId || "",
    displayName: options.displayName || "Runner",
    type,
    lane: clamp(options.lane ?? 1, 1, RESTORED_MARATHON_MAX_RUNNERS),
    laneOffsetPx: round2(clamp(options.laneOffsetPx ?? 0, -1000, 1000)),
    progressMeters: round2(clamp(options.progressMeters ?? 0, 0, 100000)),
    stamina: round2(clamp(options.stamina ?? 100, 0, 100)),
    maxHp, hp: clamp(options.hp ?? maxHp, 0, maxHp),
    slowUntilMs: Math.max(0, Number(options.slowUntilMs || 0)), stunnedUntilMs: Math.max(0, Number(options.stunnedUntilMs || 0)),
    actionLockedUntilMs: Math.max(0, Number(options.actionLockedUntilMs || 0)), attackCooldownUntilMs: Math.max(0, Number(options.attackCooldownUntilMs || 0)),
    lastAttackSequence: Math.max(0, Number(options.lastAttackSequence || 0)), lastSafeCheckpointIndex: Math.max(0, Number(options.lastSafeCheckpointIndex || 0)),
    characterId: options.characterId || "", skillId: options.skillId || "", rewardGrade: normalizeRewardGrade(options.rewardGrade || options.placeholderSkinGrade || options.skillGrade), skillChargesRemaining: Math.max(0, Number(options.skillChargesRemaining || 0)), skillCooldownUntilMs: Math.max(0, Number(options.skillCooldownUntilMs || 0)), lastSkillSequence: Math.max(0, Number(options.lastSkillSequence || 0)),
    lastCheckpointSequence: Math.max(0, Number(options.lastCheckpointSequence || 0)), lastRewardedCheckpointIndex: Math.max(0, Number(options.lastRewardedCheckpointIndex || 0)), lastFinishSequence: Math.max(0, Number(options.lastFinishSequence || 0)),
    pendingRespawnCheckpointIndex: options.pendingRespawnCheckpointIndex === null || options.pendingRespawnCheckpointIndex === undefined ? null : Math.max(0, Number(options.pendingRespawnCheckpointIndex || 0)),
    nextCheckpointIndex: Math.max(1, Number(options.nextCheckpointIndex || 1)),
    checkpointLog: cloneCheckpointLog(options.checkpointLog),
    finishedAtMs, disconnected: Boolean(options.disconnected), lastSequence: Math.max(0, Number(options.lastSequence || 0))
  });
}

export function countRestoredMarathonRunners(participants = []) {
  return participants.filter((item) => isRunnerType(item.type)).length;
}

export function countRestoredMarathonSpectators(participants = []) {
  return participants.filter((item) => item.type === "spectator").length;
}

export function createRestoredMarathonRoom(options = {}) {
  const course = createRestoredMarathonCourse(options.course);
  const participants = Object.freeze((options.participants || []).map(createRestoredMarathonParticipant));
  return Object.freeze({
    roomId: options.roomId || "room:marathon:local-preview",
    displayName: options.displayName || "Baegeum 30 Runner Marathon",
    phase: RESTORED_MARATHON_PHASES.includes(options.phase) ? options.phase : "lobby",
    maxRunners: clamp(options.maxRunners ?? RESTORED_MARATHON_MAX_RUNNERS, 1, RESTORED_MARATHON_MAX_RUNNERS),
    maxSpectators: clamp(options.maxSpectators ?? RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, 0, RESTORED_MARATHON_MAX_SPECTATORS),
    course,
    mapVersion: options.mapVersion || "baegeum-city-v2-map-001",
    protocolVersion: RESTORED_MARATHON_CONTRACT_VERSION,
    authority: options.authority || RESTORED_MARATHON_AUTHORITY.LOCAL_PREVIEW,
    serverTimeMs: Math.max(0, Number(options.serverTimeMs || 0)),
    participants
  });
}

export function canJoinRestoredMarathonRoom(roomInput, participantType = "player") {
  const room = createRestoredMarathonRoom(roomInput);
  const type = PARTICIPANT_TYPES.includes(participantType) ? participantType : "player";
  const errors = [];
  if (room.protocolVersion !== RESTORED_MARATHON_CONTRACT_VERSION) errors.push("protocol mismatch");
  if (isRunnerType(type)) {
    if (room.phase !== "lobby") errors.push("room is not accepting runners");
    if (countRestoredMarathonRunners(room.participants) >= room.maxRunners) errors.push("runner limit reached");
  } else if (type === "spectator") {
    if (!["lobby", "countdown", "racing"].includes(room.phase)) errors.push("room is not accepting spectators");
    if (countRestoredMarathonSpectators(room.participants) >= room.maxSpectators) errors.push("spectator limit reached");
  } else if (type === "admin" && room.phase === "abandoned") {
    errors.push("room is abandoned");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function applyCheckpointProgress(participant, course, raceTimeMs) {
  let nextCheckpointIndex = participant.nextCheckpointIndex;
  const checkpointLog = [...participant.checkpointLog];
  while (nextCheckpointIndex < course.checkpointMeters.length && participant.progressMeters >= course.checkpointMeters[nextCheckpointIndex]) {
    checkpointLog.push(Object.freeze({ checkpointIndex: nextCheckpointIndex, meters: course.checkpointMeters[nextCheckpointIndex], raceTimeMs }));
    nextCheckpointIndex += 1;
  }
  return Object.freeze({ ...participant, nextCheckpointIndex, checkpointLog: Object.freeze(checkpointLog), lastSafeCheckpointIndex: Math.max(participant.lastSafeCheckpointIndex, nextCheckpointIndex - 1) });
}

export function advanceRestoredMarathonParticipant(participantInput, controlInput = {}, elapsedMs = 1000, courseInput = {}) {
  const course = createRestoredMarathonCourse(courseInput);
  const participant = createRestoredMarathonParticipant(participantInput);
  if (!isRunnerType(participant.type) || participant.finishedAtMs !== null) return participant;
  if (participant.hp <= 0) return participant;

  const pace = PACE_PROFILES[controlInput.pace] || PACE_PROFILES.steady;
  const seconds = clamp(elapsedMs, 0, 60000) / 1000;
  const staminaFactor = clamp(0.72 + participant.stamina / 250, 0.72, 1.12);
  const distanceDelta = pace.speedMetersPerSecond * staminaFactor * seconds;
  const progressMeters = round2(clamp(participant.progressMeters + distanceDelta, 0, course.distanceMeters));
  const stamina = round2(clamp(participant.stamina + pace.staminaPerSecond * seconds, 0, 100));
  const raceTimeMs = Math.max(0, Number(controlInput.raceTimeMs || 0));
  const finishedAtMs = progressMeters >= course.distanceMeters ? raceTimeMs : null;

  return applyCheckpointProgress(Object.freeze({ ...participant, progressMeters, stamina, finishedAtMs, lastSequence: Math.max(participant.lastSequence, Number(controlInput.sequence || 0)) }), course, raceTimeMs);
}

export function rankRestoredMarathonParticipants(participants = []) {
  return Object.freeze(participants
    .map(createRestoredMarathonParticipant)
    .filter((item) => isRunnerType(item.type))
    .sort((left, right) => {
      if (left.finishedAtMs !== null && right.finishedAtMs !== null) return left.finishedAtMs - right.finishedAtMs;
      if (left.finishedAtMs !== null) return -1;
      if (right.finishedAtMs !== null) return 1;
      if (right.progressMeters !== left.progressMeters) return right.progressMeters - left.progressMeters;
      if (right.stamina !== left.stamina) return right.stamina - left.stamina;
      return left.lane - right.lane;
    })
    .map((item, index) => Object.freeze({ rank: index + 1, participantId: item.participantId, displayName: item.displayName, progressMeters: item.progressMeters, stamina: item.stamina, finishedAtMs: item.finishedAtMs })));
}

export function createRestoredMarathonResultEnvelope(options = {}) {
  const room = createRestoredMarathonRoom(options.room);
  const ranking = rankRestoredMarathonParticipants(options.participants || room.participants);
  const participantId = options.participantId || ranking[0]?.participantId || "";
  const row = ranking.find((item) => item.participantId === participantId) || null;
  const authority = options.authority || room.authority;
  const effects = [
    Object.freeze({
      type: RESTORED_MARATHON_EFFECT_TYPES.RACE_RESULT,
      authority,
      payload: Object.freeze({ roomId: room.roomId, participantId, rank: row?.rank || null, finishedAtMs: row?.finishedAtMs || null })
    }),
    Object.freeze({
      type: RESTORED_MARATHON_EFFECT_TYPES.RANKING_SNAPSHOT_CANDIDATE,
      authority,
      payload: Object.freeze({ boardId: "marathonBestTime", scope: authority === RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED ? "room" : "local", entries: ranking })
    })
  ];
  if (authority === RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED) {
    effects.push(Object.freeze({
      type: RESTORED_MARATHON_EFFECT_TYPES.ONLINE_AUTHORITY_REQUEST,
      authority,
      payload: Object.freeze({ roomId: room.roomId, reason: "server_finalizes_checkpoint_order_and_finish_time" })
    }));
  }
  return Object.freeze({ version: RESTORED_MARATHON_CONTRACT_VERSION, roomId: room.roomId, participantId, ranking, effects: Object.freeze(effects) });
}

export function createRestoredMarathonOnlinePacket(type, payload = {}) {
  return Object.freeze({
    version: RESTORED_MARATHON_CONTRACT_VERSION,
    type,
    roomId: payload.roomId || "",
    participantId: payload.participantId || "",
    sequence: Math.max(0, Number(payload.sequence || 0)),
    serverTimeMs: Math.max(0, Number(payload.serverTimeMs || 0)),
    payload: Object.freeze({ ...payload })
  });
}

export function validateRestoredMarathonOnlinePacket(packet) {
  const errors = [];
  if (!packet || typeof packet !== "object") return Object.freeze({ ok: false, errors: Object.freeze(["packet must be an object"]) });
  if (packet.version !== RESTORED_MARATHON_CONTRACT_VERSION) errors.push("packet version mismatch");
  if (!RESTORED_MARATHON_PACKET_TYPES.includes(packet.type)) errors.push(`unknown packet type: ${packet.type}`);
  if (!packet.roomId) errors.push("packet roomId is required");
  if (packet.type === "input_update" && (!packet.participantId || packet.sequence <= 0)) {
    errors.push("input_update requires participantId and positive sequence");
  }
  if (packet.type === "state_snapshot" && !Array.isArray(packet.payload?.participants)) {
    errors.push("state_snapshot requires participants");
  }
  if (packet.type === "race_finalized" && !Array.isArray(packet.payload?.ranking)) {
    errors.push("race_finalized requires ranking");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function normalizeRewardGrade(value) { const grade = String(value || "").toUpperCase(); return ["D", "C", "B", "A", "S"].includes(grade) ? grade : ""; }

export function validateRestoredMarathonContract() {
  const errors = [];
  const course = createRestoredMarathonCourse();
  const room = createRestoredMarathonRoom();
  if (RESTORED_MARATHON_MAX_RUNNERS !== 30) errors.push("marathon max runners must stay 30");
  if (RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS !== 32) errors.push("default spectators should match the online lobby contract");
  if (room.maxRunners > RESTORED_MARATHON_MAX_RUNNERS) errors.push("room max runners exceeds contract limit");
  if (room.maxSpectators > RESTORED_MARATHON_MAX_SPECTATORS) errors.push("room max spectators exceeds contract limit");
  if (course.checkpointMeters[0] !== 0) errors.push("course must start with checkpoint 0");
  if (course.checkpointMeters[course.checkpointMeters.length - 1] !== course.distanceMeters) errors.push("course must end with finish checkpoint");
  for (const phase of ["lobby", "countdown", "racing", "finished"]) {
    if (!RESTORED_MARATHON_PHASES.includes(phase)) errors.push(`missing phase: ${phase}`);
  }
  for (const packetType of ["join_request", "input_update", "state_snapshot", "race_finalized"]) {
    if (!RESTORED_MARATHON_PACKET_TYPES.includes(packetType)) errors.push(`missing packet type: ${packetType}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
