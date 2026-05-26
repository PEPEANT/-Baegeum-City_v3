export const WORLD_OBJECT_SCHEMA_VERSION = "world-object-001";

export const WORLD_OBJECT_TYPES = Object.freeze({
  VEHICLE: "vehicle",
  DOOR: "door",
  NPC: "npc",
  SHOP_SHELF: "shop_shelf",
  VENDING_MACHINE: "vending_machine",
  TABLE: "table",
  DECORATION: "decoration",
  COLLIDER: "collider"
});

const allowedTypes = new Set(Object.values(WORLD_OBJECT_TYPES));

export function normalizeWorldObject(input = {}) {
  const type = allowedTypes.has(input.type) ? input.type : WORLD_OBJECT_TYPES.DECORATION;
  return {
    schemaVersion: WORLD_OBJECT_SCHEMA_VERSION,
    id: normalizeObjectId(input.id || `${type}:unknown`),
    type,
    label: String(input.label || input.name || input.id || type),
    position: normalizePosition(input.position || input),
    collision: normalizeCollision(input.collision),
    interactions: normalizeInteractions(input.interactions || []),
    requiredItems: normalizeRequirements(input.requiredItems || []),
    state: normalizeObjectState(input.state || {})
  };
}

export function canPlayerUseWorldObject(playerState = {}, inventory = [], object = {}) {
  const normalized = normalizeWorldObject(object);
  const ownedIds = new Set(inventory.map((item) => item.id));
  const missing = normalized.requiredItems.filter((item) => !ownedIds.has(item.id));
  if (missing.length) return { ok: false, reason: "missing_items", missing };
  if (normalized.state.locked) return { ok: false, reason: "locked", missing: [] };
  if (playerState.mode === "spectating") return { ok: false, reason: "spectator", missing: [] };
  return { ok: true, reason: "ok", missing: [] };
}

function normalizePosition(source) {
  return {
    x: safeNumber(source.x),
    y: safeNumber(source.y),
    angle: safeNumber(source.angle)
  };
}

function normalizeCollision(collision = {}) {
  if (!collision) return { shape: "none", blocksPlayers: false, blocksVehicles: false };
  return {
    shape: ["rect", "circle", "none"].includes(collision.shape) ? collision.shape : "rect",
    x: safeNumber(collision.x),
    y: safeNumber(collision.y),
    w: Math.max(0, safeNumber(collision.w)),
    h: Math.max(0, safeNumber(collision.h)),
    r: Math.max(0, safeNumber(collision.r)),
    blocksPlayers: Boolean(collision.blocksPlayers),
    blocksVehicles: Boolean(collision.blocksVehicles)
  };
}

function normalizeInteractions(interactions) {
  return interactions.map((item) => ({
    id: normalizeObjectId(item.id || item.type || "interaction:use"),
    type: String(item.type || "use"),
    label: String(item.label || "사용"),
    event: String(item.event || item.type || "use")
  }));
}

function normalizeRequirements(items) {
  return items.map((item) => ({
    id: String(item.id || item),
    type: item.type ? String(item.type) : null
  })).filter((item) => item.id);
}

function normalizeObjectState(state) {
  return {
    locked: Boolean(state.locked),
    enabled: state.enabled !== false,
    ownerId: state.ownerId ? String(state.ownerId) : null,
    revision: Math.max(0, safeNumber(state.revision))
  };
}

function normalizeObjectId(id) {
  return String(id).trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "-");
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : 0;
}
