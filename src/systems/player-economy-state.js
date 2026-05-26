import { normalizeInventory } from "./inventory-master.js";

export const PLAYER_ECONOMY_KEY = "baegeum-city:v2:economy";
export const PLAYER_ECONOMY_VERSION = "economy-state-001";
export const ECONOMY_BALANCE_FIELDS = Object.freeze(["cash", "bank", "chips"]);

const defaultState = {
  economyVersion: PLAYER_ECONOMY_VERSION,
  cash: 100000,
  bank: 0,
  chips: 0,
  stamina: 100,
  energy: 100,
  hunger: 100,
  hungerMax: 100,
  bagSlots: 12,
  inventory: []
};

export function createDefaultPlayerEconomy() {
  return cloneState(defaultState);
}

export function readPlayerEconomy(storage = globalThis.localStorage) {
  return inspectPlayerEconomyStorage(storage).state;
}

export function inspectPlayerEconomyStorage(storage = globalThis.localStorage) {
  if (!storage?.getItem) return economyReadResult("missing_storage", null, createDefaultPlayerEconomy());
  const raw = storage.getItem(PLAYER_ECONOMY_KEY);
  if (raw === null) return economyReadResult("missing", raw, createDefaultPlayerEconomy());
  try {
    return economyReadResult("ok", raw, normalizePlayerEconomy(JSON.parse(raw)));
  } catch (error) {
    return economyReadResult("corrupt", raw, createDefaultPlayerEconomy(), error);
  }
}

export function savePlayerEconomy(state, storage = globalThis.localStorage) {
  const normalized = normalizePlayerEconomy(state);
  if (storage) storage.setItem(PLAYER_ECONOMY_KEY, JSON.stringify(normalized));
  return normalized;
}

export function patchPlayerEconomy(state, patch, storage = globalThis.localStorage) {
  return savePlayerEconomy({ ...state, ...patch }, storage);
}

export function normalizePlayerEconomy(state) {
  const source = { ...defaultState, ...(state || {}) };
  const inventory = Array.isArray(source.inventory) ? source.inventory : [];
  return {
    economyVersion: PLAYER_ECONOMY_VERSION,
    cash: clampBalance(source.cash),
    bank: clampBalance(source.bank),
    chips: clampBalance(source.chips),
    stamina: clampStat(source.stamina),
    energy: clampStat(source.energy),
    hunger: clampStat(source.hunger),
    hungerMax: Math.max(1, safeNumber(source.hungerMax, 100)),
    bagSlots: Math.max(1, safeNumber(source.bagSlots, 12)),
    inventory: normalizeInventory(inventory, source.bagSlots)
  };
}

export function formatWon(value) {
  return `${new Intl.NumberFormat("ko-KR").format(safeNumber(value))}원`;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function clampStat(value) {
  return Math.max(0, Math.min(100, safeNumber(value, 100)));
}

function clampBalance(value) {
  return Math.max(0, safeNumber(value));
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function economyReadResult(status, raw, state, error = null) {
  return {
    key: PLAYER_ECONOMY_KEY,
    status,
    raw,
    state,
    error: error ? String(error.message || error) : null
  };
}
