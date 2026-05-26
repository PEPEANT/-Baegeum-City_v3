export const INVENTORY_VERSION = "inventory-001";
export const ITEM_TYPES = Object.freeze({
  FOOD: "food",
  TICKET: "ticket",
  TOKEN: "token",
  LICENSE: "license",
  QUEST: "quest",
  KEY: "key",
  VEHICLE_KEY: "vehicle_key",
  MATERIAL: "material",
  MISC: "misc"
});

export const DEFAULT_ITEM_TYPE = ITEM_TYPES.MISC;
export const DEFAULT_MAX_STACK = 99;

const allowedItemTypes = new Set(Object.values(ITEM_TYPES));

export function normalizeInventory(items = [], bagSlots = 12) {
  const slotLimit = Math.max(1, safeNumber(bagSlots, 12));
  return mergeInventory(items).slice(0, slotLimit);
}

export function mergeInventory(items = []) {
  const merged = new Map();
  for (const item of items) {
    const normalized = normalizeInventoryItem(item);
    if (!normalized) continue;
    const key = normalized.stackable ? normalized.id : `${normalized.id}:${merged.size}`;
    const current = merged.get(key);
    if (current) current.count = Math.min(current.maxStack, current.count + normalized.count);
    else merged.set(key, normalized);
  }
  return [...merged.values()];
}

export function normalizeInventoryItem(item) {
  if (!item || typeof item !== "object") return null;
  const id = normalizeItemId(item.id);
  const type = normalizeItemType(item.type);
  const maxStack = Math.max(1, safeNumber(item.maxStack, defaultMaxStackForType(type)));
  return {
    id,
    type,
    name: String(item.name || id),
    count: Math.min(maxStack, Math.max(1, safeNumber(item.count, 1))),
    maxStack,
    stackable: item.stackable ?? maxStack > 1,
    consumable: Boolean(item.consumable ?? type === ITEM_TYPES.FOOD),
    tradeable: Boolean(item.tradeable ?? ![ITEM_TYPES.QUEST, ITEM_TYPES.KEY, ITEM_TYPES.LICENSE, ITEM_TYPES.VEHICLE_KEY].includes(type)),
    ownership: item.ownership || defaultOwnershipForType(type),
    source: String(item.source || "local"),
    description: String(item.description || "")
  };
}

export function normalizeItemDelta(item) {
  if (!item || typeof item !== "object") return null;
  const base = normalizeInventoryItem({ ...item, count: Math.abs(safeNumber(item.count, 1)) });
  if (!base) return null;
  return { ...base, count: safeNumber(item.count) };
}

export function inventoryUsedSlots(items = []) {
  return mergeInventory(items).length;
}

export function canFitInventoryItems(inventory, itemDeltas, bagSlots) {
  const positiveItems = itemDeltas.filter((item) => item.count > 0);
  const projected = mergeInventory([...inventory, ...positiveItems]);
  return projected.length <= Math.max(1, safeNumber(bagSlots, 12));
}

export function itemTypeLabel(type) {
  return {
    [ITEM_TYPES.FOOD]: "음식",
    [ITEM_TYPES.TICKET]: "입장권",
    [ITEM_TYPES.TOKEN]: "교환권",
    [ITEM_TYPES.LICENSE]: "자격증",
    [ITEM_TYPES.QUEST]: "이벤트",
    [ITEM_TYPES.KEY]: "열쇠",
    [ITEM_TYPES.VEHICLE_KEY]: "차키",
    [ITEM_TYPES.MATERIAL]: "재료",
    [ITEM_TYPES.MISC]: "기타"
  }[type] || "기타";
}

function normalizeItemType(type) {
  const value = String(type || DEFAULT_ITEM_TYPE);
  return allowedItemTypes.has(value) ? value : DEFAULT_ITEM_TYPE;
}

function normalizeItemId(id) {
  return String(id || "item:unknown").trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "-");
}

function defaultMaxStackForType(type) {
  if ([ITEM_TYPES.KEY, ITEM_TYPES.QUEST, ITEM_TYPES.LICENSE, ITEM_TYPES.VEHICLE_KEY].includes(type)) return 1;
  if (type === ITEM_TYPES.FOOD) return 10;
  return DEFAULT_MAX_STACK;
}

function defaultOwnershipForType(type) {
  if (type === ITEM_TYPES.LICENSE) return "permission";
  if (type === ITEM_TYPES.VEHICLE_KEY) return "vehicle";
  if (type === ITEM_TYPES.KEY) return "access";
  return "item";
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}
