import {
  RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS,
  RESTORED_MARATHON_MAX_SPECTATORS
} from "../games/marathon-contract.js";

export const RESTORED_MARATHON_ROOM_POLICY_VERSION = "restored-marathon-room-policy-001";
export const RESTORED_MARATHON_ROOM_POLICY_STORAGE_KEY = "singularity-race:room-policy:v1";

const SPECTATOR_CAP_OPTIONS = Object.freeze([0, 10, RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS, 50, 80]);

function clamp(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function safeRoomId(value) {
  return String(value || "room:singularity-race:dev-001").replace(/[^a-z0-9:_-]/gi, "_").slice(0, 100);
}

export function createRestoredMarathonRoomPolicy(options = {}) {
  return Object.freeze({
    version: RESTORED_MARATHON_ROOM_POLICY_VERSION,
    roomId: safeRoomId(options.roomId),
    maxSpectators: clamp(
      options.maxSpectators ?? RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS,
      0,
      RESTORED_MARATHON_MAX_SPECTATORS
    ),
    spectatorMidJoin: options.spectatorMidJoin === false ? false : true
  });
}

export function listRestoredMarathonSpectatorCapOptions() {
  return SPECTATOR_CAP_OPTIONS;
}

export function readRestoredMarathonRoomPolicy(storage, roomId, fallback = {}) {
  if (!storage?.getItem) return createRestoredMarathonRoomPolicy({ ...fallback, roomId });
  try {
    const all = JSON.parse(storage.getItem(RESTORED_MARATHON_ROOM_POLICY_STORAGE_KEY) || "{}");
    return createRestoredMarathonRoomPolicy({ ...fallback, ...(all[safeRoomId(roomId)] || {}), roomId });
  } catch {
    return createRestoredMarathonRoomPolicy({ ...fallback, roomId });
  }
}

export function writeRestoredMarathonRoomPolicy(storage, policyInput = {}) {
  const policy = createRestoredMarathonRoomPolicy(policyInput);
  if (!storage?.setItem || !storage?.getItem) return policy;
  try {
    const all = JSON.parse(storage.getItem(RESTORED_MARATHON_ROOM_POLICY_STORAGE_KEY) || "{}");
    storage.setItem(RESTORED_MARATHON_ROOM_POLICY_STORAGE_KEY, JSON.stringify({ ...all, [policy.roomId]: policy }));
  } catch {
    storage.setItem(RESTORED_MARATHON_ROOM_POLICY_STORAGE_KEY, JSON.stringify({ [policy.roomId]: policy }));
  }
  return policy;
}

export function validateRestoredMarathonRoomPolicyContract() {
  const errors = [];
  const policy = createRestoredMarathonRoomPolicy({ roomId: "room:test", maxSpectators: RESTORED_MARATHON_MAX_SPECTATORS + 50 });
  if (policy.version !== RESTORED_MARATHON_ROOM_POLICY_VERSION) errors.push("room policy version mismatch");
  if (policy.maxSpectators !== RESTORED_MARATHON_MAX_SPECTATORS) errors.push("spectator policy should clamp to the hard cap");
  if (!listRestoredMarathonSpectatorCapOptions().includes(RESTORED_MARATHON_DEFAULT_MAX_SPECTATORS)) {
    errors.push("spectator cap options should include the documented default");
  }
  if (createRestoredMarathonRoomPolicy({ spectatorMidJoin: false }).spectatorMidJoin !== false) {
    errors.push("spectator mid-join policy should be explicit");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
