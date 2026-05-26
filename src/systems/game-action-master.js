export const GAME_ACTION_SCHEMA_VERSION = "game-action-001";
export const GAME_EFFECT_SCHEMA_VERSION = "game-effect-001";
export const GAME_ACTION_ENVELOPE_VERSION = "game-action-envelope-001";

export const GAME_ACTION_TYPES = Object.freeze({
  ENTER_VENUE: "enter_venue",
  LEAVE_VENUE: "leave_venue",
  MAP_TRANSITION: "map_transition",
  SIT_TABLE: "sit_table",
  LEAVE_TABLE: "leave_table",
  EXCHANGE_CHIPS: "exchange_chips",
  BET_RESERVED: "bet_reserved",
  BUY_ITEM: "buy_item",
  DRIVE_VEHICLE: "drive_vehicle",
  USE_ITEM: "use_item"
});

export const GAME_EFFECT_TYPES = Object.freeze({
  PLAYER_STATE_PATCH: "player_state_patch",
  ECONOMY_LEDGER_ENTRY: "economy_ledger_entry",
  WORLD_OBJECT_STATE_PATCH: "world_object_state_patch",
  CHAT_CHANNEL_CHANGE: "chat_channel_change",
  UI_MESSAGE: "ui_message"
});

const actionTypes = new Set(Object.values(GAME_ACTION_TYPES));
const effectTypes = new Set(Object.values(GAME_EFFECT_TYPES));

export function createGameAction(input = {}) {
  const type = actionTypes.has(input.type) ? input.type : GAME_ACTION_TYPES.USE_ITEM;
  const createdAt = input.createdAt || new Date().toISOString();
  const actorId = String(input.actorId || "player:local");
  const requestId = normalizeId(input.requestId || input.actionId || createRequestId(actorId, type, createdAt));
  return {
    schemaVersion: GAME_ACTION_SCHEMA_VERSION,
    id: requestId,
    requestId,
    type,
    actorId,
    source: String(input.source || "local"),
    interactionId: input.interactionId ? String(input.interactionId) : null,
    targetId: input.targetId ? String(input.targetId) : null,
    payload: cloneJson(input.payload || {}),
    context: normalizeActionContext(input.context || input),
    createdAt
  };
}

export function createGameEffect(input = {}) {
  const type = effectTypes.has(input.type) ? input.type : GAME_EFFECT_TYPES.UI_MESSAGE;
  const actionId = input.actionId || input.requestId || null;
  return {
    schemaVersion: GAME_EFFECT_SCHEMA_VERSION,
    id: normalizeId(input.id || createEffectId(actionId, type, input.targetId)),
    type,
    actionId: actionId ? normalizeId(actionId) : null,
    targetId: input.targetId ? String(input.targetId) : null,
    payload: cloneJson(input.payload || {}),
    authority: String(input.authority || "local-prototype")
  };
}

export function createActionEnvelope(input = {}) {
  const action = createGameAction(input.action || input);
  const effects = (input.effects || []).map((effect) => createGameEffect({
    ...effect,
    actionId: effect.actionId || action.requestId
  }));
  assertEffectsBelongToAction(action, effects);
  return { schemaVersion: GAME_ACTION_ENVELOPE_VERSION, action, effects };
}

export function canExecuteGameAction(action, executedRequestIds = []) {
  const normalized = createGameAction(action);
  const executed = new Set([...executedRequestIds].map(normalizeId));
  if (executed.has(normalized.requestId)) return { ok: false, reason: "duplicate_action" };
  if (!normalized.actorId) return { ok: false, reason: "missing_actor" };
  return { ok: true, reason: "ok" };
}

export function assertEffectsBelongToAction(action, effects = []) {
  const normalized = createGameAction(action);
  for (const effect of effects.map(createGameEffect)) {
    if (effect.actionId !== normalized.requestId) {
      throw new Error(`Effect ${effect.id} does not belong to action ${normalized.requestId}`);
    }
  }
}

function normalizeActionContext(input = {}) {
  return {
    scene: input.scene ? String(input.scene) : null,
    sceneId: input.sceneId ? String(input.sceneId) : null,
    mapId: input.mapId ? String(input.mapId) : null,
    spawnId: input.spawnId ? String(input.spawnId) : null,
    channelId: input.channelId ? String(input.channelId) : null,
    venueId: input.venueId ? String(input.venueId) : null,
    tableId: input.tableId ? String(input.tableId) : null,
    mapVersion: input.mapVersion ? String(input.mapVersion) : null
  };
}

function createRequestId(actorId, type, createdAt) {
  return `action:${actorId}:${type}:${String(createdAt).replace(/[^0-9]/g, "").slice(0, 17)}`;
}

function createEffectId(actionId, type, targetId) {
  const actionPart = actionId ? String(actionId) : "unbound";
  const targetPart = targetId ? String(targetId) : "target";
  return `effect:${actionPart}:${type}:${targetPart}`;
}

function normalizeId(id) {
  return String(id).trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "-");
}

function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}));
  } catch {
    return {};
  }
}
