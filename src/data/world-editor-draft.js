import { MAP_IDS, legacyDraftKeyForMap, worldEditorDraftKeyForMap } from "./map-registry.js";
import { createWorldMapDraftMeta, normalizeWorldMapObjectIds } from "./world-map-contract.js";

export const WORLD_EDITOR_DRAFT_KEY = "baegeum-city-v2-world-editor-draft-v0";
export const DEFAULT_WORLD_EDITOR_MAP_ID = MAP_IDS.BAEGEUM_CITY;
export const DEFAULT_WORLD_EDITOR_DRAFT_KEY = worldEditorDraftKeyForMap(DEFAULT_WORLD_EDITOR_MAP_ID);

export function readWorldEditorDraft(options = {}) {
  return inspectWorldEditorDraftStorage(options).draft;
}

export function clearWorldEditorDraft(options = {}) {
  const { mapId, storage } = draftReadOptions(options);
  if (!storage?.removeItem) return;
  storage.removeItem(worldEditorDraftKeyForMap(mapId));
  const legacyKey = legacyDraftKeyForMap(mapId);
  if (legacyKey) storage.removeItem(legacyKey);
}

export function writeWorldEditorDraft(draft, options = {}) {
  const { mapId, storage } = draftReadOptions(options);
  if (!storage?.setItem) return null;
  const key = worldEditorDraftKeyForMap(mapId);
  storage.setItem(key, JSON.stringify(draft, null, 2));
  return key;
}

export function inspectWorldEditorDraftStorage(options = {}) {
  const { mapId, storage } = draftReadOptions(options);
  if (!storage?.getItem) return worldEditorDraftReadResult(worldEditorDraftKeyForMap(mapId), "missing_storage", null, null);
  const primary = readDraftByKey(storage, worldEditorDraftKeyForMap(mapId), "map");
  if (primary.status !== "missing") return primary;
  const legacyKey = legacyDraftKeyForMap(mapId);
  if (!legacyKey) return primary;
  const legacy = readDraftByKey(storage, legacyKey, "legacy");
  return legacy.status === "missing" ? primary : legacy;
}

function readDraftByKey(storage, key, source) {
  const raw = storage.getItem(key);
  if (raw === null) return worldEditorDraftReadResult(key, "missing", raw, null, null, source);
  try {
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
      return worldEditorDraftReadResult(key, "corrupt", raw, null, null, source);
    }
    return worldEditorDraftReadResult(key, "ok", raw, draft, null, source);
  } catch (error) {
    return worldEditorDraftReadResult(key, "corrupt", raw, null, error, source);
  }
}

export function applyWorldEditorDraft(baseMap, options = {}) {
  const draft = readWorldEditorDraft(options);
  if (!draft) return baseMap;
  const map = clone(baseMap);
  for (const key of editableWorldKeys()) {
    if (draft[key] !== undefined) map[key] = clone(draft[key]);
  }
  map.mapVersion = draft.mapVersion || map.mapVersion;
  return map;
}

export function createWorldEditorDraft(map, options = {}) {
  const data = {};
  for (const key of editableWorldKeys()) data[key] = clone(map[key]);
  const normalized = normalizeWorldMapObjectIds({ id: map.id, mapVersion: map.mapVersion, sourceMapVersion: map.sourceMapVersion, ...data });
  return { ...createWorldMapDraftMeta(normalized, options), ...normalized };
}

function editableWorldKeys() {
  return [
    "width",
    "height",
    "roadWidth",
    "roadStyle",
    "roads",
    "terrainPatches",
    "obstacles",
    "scenery",
    "capturePoints",
    "safeZones",
    "baseExitPoints",
    "spawns",
    "navGraph"
  ];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function draftReadOptions(options) {
  if (options?.getItem) return { mapId: DEFAULT_WORLD_EDITOR_MAP_ID, storage: options };
  return {
    mapId: options.mapId || DEFAULT_WORLD_EDITOR_MAP_ID,
    storage: options.storage || defaultWorldEditorDraftStorage()
  };
}

function worldEditorDraftReadResult(key, status, raw, draft, error = null, source = "map") {
  return {
    key,
    status,
    source,
    raw,
    draft,
    error: error ? String(error.message || error) : null
  };
}

function defaultWorldEditorDraftStorage() {
  return typeof localStorage === "undefined" ? null : localStorage;
}
