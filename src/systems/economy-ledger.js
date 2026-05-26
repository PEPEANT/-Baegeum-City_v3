import { WORLD_CHANNEL_ID } from "../data/runtime-contract.js";
import { ECONOMY_BALANCE_FIELDS, normalizePlayerEconomy } from "./player-economy-state.js";
import { canFitInventoryItems, normalizeItemDelta } from "./inventory-master.js";

export const ECONOMY_LEDGER_KEY = "baegeum-city:v2:economy-ledger";
export const ECONOMY_LEDGER_VERSION = "economy-ledger-001";

export const ECONOMY_ENTRY_TYPES = Object.freeze({
  INIT: "economy_init",
  CASH_GRANT: "cash_grant",
  CHIP_EXCHANGE: "chip_exchange",
  BET_RESERVED: "bet_reserved",
  BET_REFUNDED: "bet_refunded",
  BET_SETTLED: "bet_settled",
  ITEM_GRANTED: "item_granted",
  ADMIN_ADJUSTMENT: "admin_adjustment"
});

const allowedTypes = new Set(Object.values(ECONOMY_ENTRY_TYPES));
const balanceFields = ECONOMY_BALANCE_FIELDS;

export function readEconomyLedger(storage = globalThis.localStorage) {
  return inspectEconomyLedgerStorage(storage).entries;
}

export function inspectEconomyLedgerStorage(storage = globalThis.localStorage) {
  if (!storage?.getItem) return ledgerReadResult("missing_storage", null, []);
  const raw = storage.getItem(ECONOMY_LEDGER_KEY);
  if (raw === null) return ledgerReadResult("missing", raw, []);
  try {
    const saved = JSON.parse(raw);
    const entries = Array.isArray(saved) ? saved.map(normalizeEconomyEntry).filter(Boolean) : [];
    return ledgerReadResult(Array.isArray(saved) ? "ok" : "corrupt", raw, entries);
  } catch (error) {
    return ledgerReadResult("corrupt", raw, [], error);
  }
}

export function saveEconomyLedger(entries, storage = globalThis.localStorage) {
  const normalized = entries.map(normalizeEconomyEntry).filter(Boolean);
  if (storage) storage.setItem(ECONOMY_LEDGER_KEY, JSON.stringify(normalized));
  return normalized;
}

export function appendEconomyLedgerEntry(entry, storage = globalThis.localStorage) {
  const normalized = normalizeEconomyEntry(entry);
  if (!normalized) throw new Error("Invalid economy ledger entry");
  const entries = [...readEconomyLedger(storage), normalized];
  return { entry: normalized, entries: saveEconomyLedger(entries, storage) };
}

export function createEconomyEntry(input = {}) {
  const createdAt = input.createdAt || new Date().toISOString();
  return normalizeEconomyEntry({
    id: input.id || createLedgerId(input.actorId, createdAt),
    version: ECONOMY_LEDGER_VERSION,
    type: input.type,
    actorId: input.actorId || "player:local",
    authority: input.authority || "local-prototype",
    deltas: normalizeDeltas(input.deltas || input.delta || input),
    itemDeltas: normalizeItemDeltas(input.itemDeltas || []),
    reason: input.reason || "",
    channelId: input.channelId || WORLD_CHANNEL_ID,
    venueId: input.venueId || null,
    tableId: input.tableId || null,
    roundId: input.roundId || null,
    mapVersion: input.mapVersion || null,
    createdAt,
    serverTimeMs: Number.isFinite(Number(input.serverTimeMs)) ? Number(input.serverTimeMs) : null
  });
}

export function normalizeEconomyEntry(entry) {
  if (!entry || typeof entry !== "object" || !allowedTypes.has(entry.type)) return null;
  return {
    id: String(entry.id || createLedgerId(entry.actorId, entry.createdAt)),
    version: String(entry.version || ECONOMY_LEDGER_VERSION),
    type: String(entry.type),
    actorId: String(entry.actorId || "player:local"),
    authority: String(entry.authority || "local-prototype"),
    deltas: normalizeDeltas(entry.deltas || {}),
    itemDeltas: normalizeItemDeltas(entry.itemDeltas || []),
    reason: String(entry.reason || ""),
    channelId: String(entry.channelId || WORLD_CHANNEL_ID),
    venueId: entry.venueId ? String(entry.venueId) : null,
    tableId: entry.tableId ? String(entry.tableId) : null,
    roundId: entry.roundId ? String(entry.roundId) : null,
    mapVersion: entry.mapVersion ? String(entry.mapVersion) : null,
    createdAt: String(entry.createdAt || new Date().toISOString()),
    serverTimeMs: Number.isFinite(Number(entry.serverTimeMs)) ? Number(entry.serverTimeMs) : null
  };
}

export function applyEconomyEntry(state, entry) {
  const normalizedState = normalizePlayerEconomy(state);
  const normalizedEntry = normalizeEconomyEntry(entry);
  if (!normalizedEntry) throw new Error("Cannot apply invalid economy ledger entry");
  assertEconomyEntryPolicy(normalizedEntry);
  assertCanApplyEconomyEntry(normalizedState, normalizedEntry);
  const next = { ...normalizedState };
  for (const field of balanceFields) next[field] += normalizedEntry.deltas[field];
  next.inventory = applyItemDeltas(normalizedState.inventory, normalizedEntry.itemDeltas);
  return normalizePlayerEconomy(next);
}

export function projectEconomyFromLedger(baseState, entries = []) {
  return entries.reduce((state, entry) => applyEconomyEntry(state, entry), normalizePlayerEconomy(baseState));
}

export function assertCanApplyEconomyEntry(state, entry) {
  for (const field of balanceFields) {
    const nextValue = state[field] + entry.deltas[field];
    if (nextValue < 0) throw new Error(`Economy ledger would make ${field} negative`);
  }
  for (const item of entry.itemDeltas) {
    if (item.count >= 0) continue;
    const current = state.inventory.find((owned) => owned.id === item.id)?.count || 0;
    if (current + item.count < 0) throw new Error(`Economy ledger would remove missing item ${item.id}`);
  }
  if (!canFitInventoryItems(state.inventory, entry.itemDeltas, state.bagSlots)) {
    throw new Error("Economy ledger would exceed inventory slots");
  }
}

export function assertEconomyEntryPolicy(entry) {
  const { cash, bank, chips } = entry.deltas;
  if (entry.type === ECONOMY_ENTRY_TYPES.CASH_GRANT) {
    if (chips !== 0 || (cash <= 0 && bank <= 0)) throw new Error("cash_grant requires positive cash or bank only");
  }
  if (entry.type === ECONOMY_ENTRY_TYPES.CHIP_EXCHANGE) {
    if (bank !== 0 || !((cash < 0 && chips > 0) || (cash > 0 && chips < 0))) {
      throw new Error("chip_exchange requires opposite cash/chips deltas");
    }
  }
  if (entry.type === ECONOMY_ENTRY_TYPES.BET_RESERVED) {
    if (cash !== 0 || bank !== 0 || chips >= 0) throw new Error("bet_reserved requires negative chips only");
  }
  if (entry.type === ECONOMY_ENTRY_TYPES.BET_REFUNDED) {
    if (cash !== 0 || bank !== 0 || chips <= 0) throw new Error("bet_refunded requires positive chips only");
  }
  if (entry.type === ECONOMY_ENTRY_TYPES.BET_SETTLED) {
    if (cash !== 0 || bank !== 0 || chips < 0) throw new Error("bet_settled cannot remove cash, bank, or chips");
  }
  if (entry.type === ECONOMY_ENTRY_TYPES.ITEM_GRANTED) {
    if (cash !== 0 || bank !== 0 || chips !== 0 || !entry.itemDeltas.length || !entry.itemDeltas.every((item) => item.count > 0)) {
      throw new Error("item_granted requires positive item deltas only");
    }
  }
}

function applyItemDeltas(inventory, deltas) {
  const items = new Map(inventory.map((item) => [item.id, { ...item }]));
  for (const delta of deltas) {
    const current = items.get(delta.id) || { id: delta.id, name: delta.name, count: 0 };
    current.name = delta.name || current.name;
    current.count += delta.count;
    if (current.count > 0) items.set(current.id, current);
    else items.delete(current.id);
  }
  return [...items.values()];
}

function normalizeDeltas(source) {
  return Object.fromEntries(balanceFields.map((field) => [field, safeNumber(source[field])]));
}

function normalizeItemDeltas(items) {
  return items.map(normalizeItemDelta).filter((item) => item && item.count !== 0);
}

function createLedgerId(actorId = "player:local", createdAt = new Date().toISOString()) {
  const safeActor = String(actorId).replace(/[^a-zA-Z0-9:_-]/g, "-");
  const safeTime = String(createdAt).replace(/[^0-9]/g, "").slice(0, 14) || Date.now();
  return `ledger:${safeActor}:${safeTime}`;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function ledgerReadResult(status, raw, entries, error = null) {
  return {
    key: ECONOMY_LEDGER_KEY,
    status,
    raw,
    entries,
    error: error ? String(error.message || error) : null
  };
}
