export const INTERACTION_SCHEMA_VERSION = "interaction-001";

export const INTERACTION_TYPES = Object.freeze({
  ENTER: "enter",
  EXIT: "exit",
  MAP_TRANSITION: "map_transition",
  TALK: "talk",
  USE: "use",
  BUY: "buy",
  SIT_TABLE: "sit_table",
  DRIVE: "drive"
});

const allowedTypes = new Set(Object.values(INTERACTION_TYPES));

export function createInteractionCandidate(input = {}) {
  const type = allowedTypes.has(input.type) ? input.type : INTERACTION_TYPES.USE;
  return {
    schemaVersion: INTERACTION_SCHEMA_VERSION,
    id: normalizeId(input.id || `${type}:${input.targetId || "target"}`),
    type,
    label: String(input.label || labelForType(type)),
    targetId: input.targetId ? String(input.targetId) : null,
    targetLabel: String(input.targetLabel || input.targetId || "대상"),
    requiredItems: normalizeRequiredItems(input.requiredItems || []),
    enabled: input.enabled !== false,
    disabledReason: input.disabledReason || null
  };
}

export function resolveInteractionCandidate(candidates = []) {
  return candidates.map(createInteractionCandidate).find((candidate) => candidate.enabled) || null;
}

export function canRunInteraction(candidate, inventory = []) {
  const normalized = createInteractionCandidate(candidate);
  if (!normalized.enabled) return { ok: false, reason: normalized.disabledReason || "disabled" };
  const owned = new Set(inventory.map((item) => item.id));
  const missing = normalized.requiredItems.filter((item) => !owned.has(item.id));
  return missing.length ? { ok: false, reason: "missing_items", missing } : { ok: true, reason: "ok", missing: [] };
}

function normalizeRequiredItems(items) {
  return items.map((item) => ({
    id: String(item.id || item),
    type: item.type ? String(item.type) : null
  })).filter((item) => item.id);
}

function labelForType(type) {
  return {
    [INTERACTION_TYPES.ENTER]: "입장",
    [INTERACTION_TYPES.EXIT]: "나가기",
    [INTERACTION_TYPES.MAP_TRANSITION]: "이동",
    [INTERACTION_TYPES.TALK]: "대화",
    [INTERACTION_TYPES.USE]: "사용",
    [INTERACTION_TYPES.BUY]: "구매",
    [INTERACTION_TYPES.SIT_TABLE]: "앉기",
    [INTERACTION_TYPES.DRIVE]: "운전"
  }[type] || "사용";
}

function normalizeId(id) {
  return String(id).trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "-");
}
