import { venueMetadataStorageKey } from "../data/gambling-venues.js";
import { allMapConfigs, LEGACY_WORLD_EDITOR_DRAFT_KEY } from "../data/map-registry.js";
import {
  BAEGEUM_SKIN_KEY,
  BAEGEUM_SKIN_PRESET_KEY,
  DRAWING_WORLD_SKIN_KEY
} from "../skins/drawing-world-adapter.js";
import { ECONOMY_LEDGER_KEY } from "./economy-ledger.js";
import { PLAYER_ECONOMY_KEY } from "./player-economy-state.js";

export const STORAGE_DIAGNOSTIC_STATUSES = Object.freeze({
  OK: "ok",
  MISSING: "missing",
  CORRUPT: "corrupt",
  MIGRATED: "migrated",
  UNAVAILABLE: "unavailable"
});

export const localStorageInventory = Object.freeze([
  ...allMapConfigs().map((map) => storageItem(`world-editor-draft:${map.mapId}`, map.draftKey, "json-object", "src/data/world-editor-draft.js", { mapId: map.mapId })),
  storageItem("world-editor-draft:legacy", LEGACY_WORLD_EDITOR_DRAFT_KEY, "json-object", "src/data/world-editor-draft.js", { legacy: true }),
  storageItem("venue-metadata", venueMetadataStorageKey, "json-array", "src/data/gambling-venues.js"),
  storageItem("player-economy", PLAYER_ECONOMY_KEY, "json-object", "src/systems/player-economy-state.js"),
  storageItem("economy-ledger", ECONOMY_LEDGER_KEY, "json-array", "src/systems/economy-ledger.js"),
  storageItem("skin-preset", BAEGEUM_SKIN_PRESET_KEY, "string", "src/skins/drawing-world-adapter.js"),
  storageItem("skin-custom", BAEGEUM_SKIN_KEY, "string", "src/skins/drawing-world-adapter.js", {
    legacyKey: DRAWING_WORLD_SKIN_KEY
  }),
  storageItem("skin-legacy-drawing-world", DRAWING_WORLD_SKIN_KEY, "string", "src/skins/drawing-world-adapter.js", {
    legacy: true
  })
]);

export function inspectLocalStorage(storage = defaultStorage()) {
  return localStorageInventory.map((item) => inspectLocalStorageKey(item, storage));
}

export function inspectLocalStorageKey(item, storage = defaultStorage()) {
  if (!storage?.getItem) return result(item, STORAGE_DIAGNOSTIC_STATUSES.UNAVAILABLE);
  const raw = storage.getItem(item.key);
  if (raw === null || raw === undefined) {
    return legacyResult(item, storage) || result(item, STORAGE_DIAGNOSTIC_STATUSES.MISSING);
  }
  if (item.format === "string") return result(item, STORAGE_DIAGNOSTIC_STATUSES.OK, { raw });
  const parsed = parseJson(raw);
  if (!parsed.ok) return result(item, STORAGE_DIAGNOSTIC_STATUSES.CORRUPT, { raw });
  if (!matchesFormat(item.format, parsed.value)) {
    return result(item, STORAGE_DIAGNOSTIC_STATUSES.CORRUPT, { raw, parsed: parsed.value });
  }
  return result(item, STORAGE_DIAGNOSTIC_STATUSES.OK, { raw, parsed: parsed.value });
}

function legacyResult(item, storage) {
  if (!item.legacyKey || !storage?.getItem?.(item.legacyKey)) return null;
  return result(item, STORAGE_DIAGNOSTIC_STATUSES.MIGRATED, { legacyKey: item.legacyKey });
}

function storageItem(id, key, format, owner, options = {}) {
  return Object.freeze({ id, key, format, owner, ...options });
}

function parseJson(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
}

function matchesFormat(format, value) {
  if (format === "json-array") return Array.isArray(value);
  if (format === "json-object") return value && typeof value === "object" && !Array.isArray(value);
  return true;
}

function result(item, status, extra = {}) {
  return {
    id: item.id,
    key: item.key,
    owner: item.owner,
    format: item.format,
    status,
    ...extra
  };
}

function defaultStorage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}
