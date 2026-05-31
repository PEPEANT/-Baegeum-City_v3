import {
  RESTORED_MARATHON_AUTHORITY,
  advanceRestoredMarathonParticipant,
  createRestoredMarathonParticipant,
  createRestoredMarathonRoom
} from "../games/marathon-contract.js";
import { applyRestoredMarathonServerAttackEnvelope } from "./marathon-server-combat-state.js";
export { applyRestoredMarathonServerAttackCommand, applyRestoredMarathonServerAttackEnvelope, createRestoredMarathonServerAttackCommand } from "./marathon-server-combat-state.js";
export { applyRestoredMarathonServerSkillCommand, applyRestoredMarathonServerSkillEnvelope, createRestoredMarathonServerSkillCommand } from "./marathon-server-skill-state.js";

export const RESTORED_MARATHON_SERVER_STATE_VERSION = "restored-marathon-server-state-001";

const PACES = Object.freeze(["recover", "steady", "push", "sprint"]);
const DEFAULT_LANE_HALF_WIDTH_PX = 232;
const DEFAULT_LANE_SPEED_PX_PER_SECOND = 150;
const DEFAULT_LANE_SPRINT_SPEED_PX_PER_SECOND = 210;

export function startRestoredMarathonServerRoom(roomInput = {}, options = {}) {
  const room = createRestoredMarathonRoom(roomInput);
  return createRestoredMarathonRoom({
    ...room,
    authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED,
    phase: "racing",
    serverTimeMs: Math.max(0, Number(options.serverTimeMs ?? room.serverTimeMs))
  });
}

export function createRestoredMarathonServerInputCommand(envelope = {}, options = {}) {
  const payload = envelope.payload || {};
  const direction = normalizeDirection(payload.direction);
  return Object.freeze({
    version: RESTORED_MARATHON_SERVER_STATE_VERSION,
    roomId: envelope.roomId || payload.roomId || "",
    participantId: payload.participantId || "",
    pace: PACES.includes(payload.pace) ? payload.pace : "steady",
    sequence: Math.max(1, Number(envelope.sequence || payload.sequence || 1)),
    raceTimeMs: Math.max(0, Number(payload.raceTimeMs || envelope.serverTimeMs || options.serverTimeMs || 0)),
    receivedAtMs: Math.max(0, Number(options.receivedAtMs || envelope.receivedAtMs || 0)),
    direction,
    hasDirection: Boolean(payload.direction)
  });
}

export function applyRestoredMarathonServerInputEnvelope(roomInput = {}, envelope = {}, options = {}) {
  return applyRestoredMarathonServerInputCommand(roomInput, createRestoredMarathonServerInputCommand(envelope, options), options);
}

export function applyRestoredMarathonServerInputCommand(roomInput = {}, commandInput = {}, options = {}) {
  const room = createRestoredMarathonRoom(roomInput);
  const command = createRestoredMarathonServerInputCommand({ payload: commandInput, ...commandInput }, options);
  if (room.phase !== "racing") return rejected("race_not_running", room);
  const index = room.participants.findIndex((participant) => participant.participantId === command.participantId);
  if (index < 0) return rejected("participant_not_found", room);
  const participant = createRestoredMarathonParticipant(room.participants[index]);
  if (participant.type === "spectator" || participant.type === "admin") return rejected("participant_cannot_move", room);
  if (command.sequence <= participant.lastSequence) return rejected("stale_input", room);
  const locked = participant.hp <= 0 || command.receivedAtMs < participant.stunnedUntilMs || command.receivedAtMs < participant.actionLockedUntilMs;
  if (locked) return acceptBlockedInput(room, participant, index, command);

  const forwardFactor = command.hasDirection ? Math.max(0, command.direction.x) : 1;
  const elapsedMs = clampNumber(options.elapsedMs ?? 1000 / 20, 0, 250);
  const forwardElapsedMs = elapsedMs * forwardFactor;
  const advanced = advanceRestoredMarathonParticipant(participant, {
    pace: forwardFactor > 0 ? command.pace : "recover",
    raceTimeMs: command.raceTimeMs,
    sequence: command.sequence
  }, forwardElapsedMs, room.course);
  const laneHalfWidthPx = clampNumber(options.laneHalfWidthPx ?? DEFAULT_LANE_HALF_WIDTH_PX, 80, 1000);
  const baseLaneSpeedPxPerSecond = clampNumber(options.laneSpeedPxPerSecond ?? DEFAULT_LANE_SPEED_PX_PER_SECOND, 20, 400);
  const sprintLaneSpeedPxPerSecond = clampNumber(options.laneSprintSpeedPxPerSecond ?? DEFAULT_LANE_SPRINT_SPEED_PX_PER_SECOND, 20, 400);
  const laneSpeedPxPerSecond = command.pace === "sprint" ? sprintLaneSpeedPxPerSecond : baseLaneSpeedPxPerSecond;
  const laneOffsetPx = clampNumber(
    participant.laneOffsetPx + (command.direction.y * laneSpeedPxPerSecond * elapsedMs / 1000),
    -laneHalfWidthPx,
    laneHalfWidthPx
  );
  const advancedWithLane = createRestoredMarathonParticipant({ ...advanced, laneOffsetPx });
  const participants = [...room.participants];
  participants[index] = advancedWithLane;
  const runners = participants.filter((item) => item.type === "player" || item.type === "bot");
  const phase = runners.length > 0 && runners.every((item) => item.finishedAtMs !== null) ? "finished" : "racing";
  const nextRoom = createRestoredMarathonRoom({
    ...room,
    phase,
    authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED,
    serverTimeMs: Math.max(room.serverTimeMs, command.receivedAtMs, command.raceTimeMs),
    participants: Object.freeze(participants)
  });
  return Object.freeze({ ok: true, reason: "", room: nextRoom, participant: advancedWithLane, command });
}

export function createRestoredMarathonServerRunnerSnapshot(participantInput = {}, roomInput = {}) {
  const room = createRestoredMarathonRoom(roomInput);
  const participant = createRestoredMarathonParticipant(participantInput);
  const progressPercent = room.course.distanceMeters > 0 ? participant.progressMeters / room.course.distanceMeters * 100 : 0;
  return Object.freeze({
    participantId: participant.participantId,
    displayName: participant.displayName,
    type: participant.type,
    lane: participant.lane,
    laneOffsetPx: participant.laneOffsetPx,
    progressMeters: participant.progressMeters,
    progressPercent: round2(progressPercent),
    nextCheckpointIndex: participant.nextCheckpointIndex,
    stamina: participant.stamina,
    hp: participant.hp,
    maxHp: participant.maxHp,
    slowUntilMs: participant.slowUntilMs,
    stunnedUntilMs: participant.stunnedUntilMs,
    attackCooldownUntilMs: participant.attackCooldownUntilMs,
    lastSafeCheckpointIndex: participant.lastSafeCheckpointIndex,
    lastRewardedCheckpointIndex: participant.lastRewardedCheckpointIndex,
    characterId: participant.characterId,
    skillId: participant.skillId,
    rewardGrade: participant.rewardGrade,
    skillChargesRemaining: participant.skillChargesRemaining,
    skillCooldownUntilMs: participant.skillCooldownUntilMs,
    finishedAtMs: participant.finishedAtMs,
    lastSequence: participant.lastSequence,
    lastAttackSequence: participant.lastAttackSequence,
    lastSkillSequence: participant.lastSkillSequence,
    serverOwned: true
  });
}

export function validateRestoredMarathonServerStateContract() {
  const errors = [];
  const room = startRestoredMarathonServerRoom(createRestoredMarathonRoom({
    course: { distanceMeters: 120, checkpointMeters: [0, 60, 120] },
    participants: [{ participantId: "runner:test", type: "player" }]
  }), { serverTimeMs: 1000 });
  const first = applyRestoredMarathonServerInputEnvelope(room, input(1, "sprint", 1000), { elapsedMs: 1000, receivedAtMs: 1000 });
  if (!first.ok || first.participant.progressMeters <= 0) errors.push("server input should advance runner progress");
  const sideOnly = applyRestoredMarathonServerInputEnvelope(first.room, input(2, "sprint", 1100, 0, 1), { elapsedMs: 1000, receivedAtMs: 1100 });
  if (!sideOnly.ok || sideOnly.participant.progressMeters !== first.participant.progressMeters) errors.push("side-only input must not advance marathon progress");
  if (sideOnly.participant.laneOffsetPx <= first.participant.laneOffsetPx) errors.push("side-only input should still move the runner across the road lane");
  const sideSprint = advanceSideOnlySprint(first.room);
  if (sideSprint.laneOffsetPx < 180) errors.push("server sprint lane input should stay responsive enough for fixed-camera play");
  const spectatorRoom = createRestoredMarathonRoom({ ...first.room, participants: [...first.room.participants, { participantId: "spectator:test", type: "spectator" }] });
  const spectatorMove = applyRestoredMarathonServerInputEnvelope(spectatorRoom, input(1, "sprint", 1200, 1, 0, "spectator:test"), { elapsedMs: 1000, receivedAtMs: 1200 });
  if (spectatorMove.ok || spectatorMove.reason !== "participant_cannot_move") errors.push("spectator input must not move server state");
  const stale = applyRestoredMarathonServerInputEnvelope(first.room, input(1, "sprint", 1200), { elapsedMs: 1000, receivedAtMs: 1200 });
  if (stale.ok || stale.reason !== "stale_input") errors.push("server must reject stale input sequences");
  const attacked = applyRestoredMarathonServerAttackEnvelope(attackRoom("racing"), attack(1, "runner:a", 2000), { receivedAtMs: 2000 });
  if (!attacked.ok || attacked.reason !== "attack_hit" || attacked.target.hp >= 100) errors.push("server attack should validate hit and apply damage");
  if (attacked.target.stunnedUntilMs <= 2000 || attacked.attacker.attackCooldownUntilMs <= 2000) errors.push("server attack should apply stun and cooldown");
  const cooldown = applyRestoredMarathonServerAttackEnvelope(attacked.room, attack(2, "runner:a", 2100), { receivedAtMs: 2100 });
  if (cooldown.ok || cooldown.reason !== "attack_cooldown") errors.push("server attack should reject cooldown spam");
  const staged = applyRestoredMarathonServerAttackEnvelope(attackRoom("countdown"), attack(1, "runner:a", 1500), { receivedAtMs: 1500 });
  if (!staged.ok || staged.target.hp !== 100 || staged.target.stunnedUntilMs <= 1500) errors.push("server countdown attack should stun without damage");
  const snapshot = createRestoredMarathonServerRunnerSnapshot(first.participant, first.room);
  const attackSnapshot = createRestoredMarathonServerRunnerSnapshot(attacked.target, attacked.room);
  if (!snapshot.serverOwned || snapshot.progressPercent <= 0 || snapshot.lastSequence !== 1) errors.push("server runner snapshot should expose server-owned movement state");
  if (attackSnapshot.hp >= 100 || attackSnapshot.stunnedUntilMs <= 2000) errors.push("server runner snapshot should expose server-owned combat state");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function input(sequence, pace, raceTimeMs, x = 1, y = 0, participantId = "runner:test") {
  return Object.freeze({ roomId: "room:test", sequence, payload: { participantId, pace, raceTimeMs, direction: { x, y } } });
}

function advanceSideOnlySprint(roomInput) {
  let room = roomInput;
  let participant = null;
  for (let sequence = 2; sequence <= 5; sequence += 1) {
    const moved = applyRestoredMarathonServerInputEnvelope(room, input(sequence, "sprint", 1000 + (sequence * 250), 0, 1), {
      elapsedMs: 250,
      receivedAtMs: 1000 + (sequence * 250)
    });
    if (!moved.ok) return createRestoredMarathonParticipant(participant || {});
    room = moved.room;
    participant = moved.participant;
  }
  return participant || createRestoredMarathonParticipant();
}

function attack(sequence, attackerId, raceTimeMs) {
  return Object.freeze({ roomId: "room:test", sequence, payload: { attackerId, raceTimeMs, aim: { x: 1, y: 0 }, origin: { x: 0, y: 0 } } });
}

function attackRoom(phase) {
  return createRestoredMarathonRoom({ phase, authority: RESTORED_MARATHON_AUTHORITY.SERVER_REQUIRED, course: { distanceMeters: 120, checkpointMeters: [0, 60, 120] },
    participants: [{ participantId: "runner:a", type: "player", progressMeters: 12 }, { participantId: "runner:b", type: "player", progressMeters: 13, hp: 100 }] });
}

function acceptBlockedInput(room, participant, index, command) {
  const participants = [...room.participants];
  const blocked = createRestoredMarathonParticipant({ ...participant, lastSequence: Math.max(participant.lastSequence, command.sequence) });
  participants[index] = blocked;
  return Object.freeze({ ok: true, reason: "participant_control_locked", room: createRestoredMarathonRoom({
    ...room,
    serverTimeMs: Math.max(room.serverTimeMs, command.receivedAtMs, command.raceTimeMs),
    participants: Object.freeze(participants)
  }), participant: blocked, command });
}

function rejected(reason, room) { return Object.freeze({ ok: false, reason, room, participant: null, command: null }); }
function normalizeDirection(direction = {}) { return Object.freeze({ x: clampNumber(direction.x ?? 1, -1, 1), y: clampNumber(direction.y ?? 0, -1, 1) }); }
function clampNumber(value, min, max) { const number = Number(value); return Math.max(min, Math.min(max, Number.isFinite(number) ? number : min)); }
function round2(value) { return Math.round(value * 100) / 100; }
