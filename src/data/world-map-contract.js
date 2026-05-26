export const WORLD_MAP_SCHEMA_VERSION = "world-map-001";
export const WORLD_EDITOR_DRAFT_VERSION = 1;
export const WORLD_EDITOR_SOURCE = "baegeum-world-editor";
export const WORLD_OBJECT_ID_PREFIXES = Object.freeze([
  "tree:broadleaf",
  "tree:pine",
  "streetlight",
  "billboard",
  "bench",
  "brush",
  "scenery",
  "building",
  "obstacle",
  "wall"
]);

export function createWorldMapDraftMeta(map, options = {}) {
  const savedAt = options.savedAt || new Date().toISOString();
  const meta = {
    schemaVersion: WORLD_MAP_SCHEMA_VERSION,
    draftVersion: WORLD_EDITOR_DRAFT_VERSION,
    source: WORLD_EDITOR_SOURCE,
    id: map.id || "map01",
    mapVersion: String(options.mapVersion || map.mapVersion || "draft"),
    baseMapVersion: String(options.baseMapVersion || map.sourceMapVersion || map.mapVersion || "draft"),
    editorRevision: toRevision(options.editorRevision ?? map.editorRevision),
    summary: summarizeWorldMap(map)
  };
  if (options.includeSavedAt !== false) meta.savedAt = savedAt;
  return meta;
}

export function validateWorldMapDraft(draft = {}) {
  const errors = [];
  const warnings = [];
  if (!draft.schemaVersion) warnings.push("legacy_schema");
  else if (draft.schemaVersion !== WORLD_MAP_SCHEMA_VERSION) errors.push("unsupported_schema");
  if (!draft.draftVersion) warnings.push("legacy_draft_version");
  else if (Number(draft.draftVersion) > WORLD_EDITOR_DRAFT_VERSION) errors.push("future_draft_version");
  if (!draft.mapVersion) errors.push("missing_map_version");
  if (!Number.isFinite(draft.width) || !Number.isFinite(draft.height)) errors.push("invalid_size");
  if (!Array.isArray(draft.roads) || draft.roads.length < 1) warnings.push("missing_roads");
  if (!Array.isArray(draft.obstacles)) warnings.push("missing_obstacles");
  if (!Array.isArray(draft.scenery)) warnings.push("missing_scenery");
  const summary = summarizeWorldMap(draft);
  if (summary.duplicateIds.length) warnings.push("duplicate_object_ids");
  if (summary.invalidIds.length) warnings.push("invalid_object_ids");
  if (summary.missingIds > 0) warnings.push("missing_object_ids");
  return { ok: errors.length === 0, errors, warnings, summary };
}

export function normalizeWorldMapObjectIds(map = {}) {
  const next = clone(map);
  const used = new Set(collectObjectIds(next));
  normalizeList(next.scenery, "scenery", used);
  normalizeList(next.obstacles, "obstacle", used);
  return next;
}

export function createWorldObjectId(source, mapOrItems = []) {
  const prefix = objectIdPrefixFor(source);
  const used = new Set(Array.isArray(mapOrItems) ? idsFromItems(mapOrItems) : collectObjectIds(mapOrItems));
  let count = 1;
  let id = `${prefix}:${pad4(count)}`;
  while (used.has(id)) {
    count += 1;
    id = `${prefix}:${pad4(count)}`;
  }
  return id;
}

export function summarizeWorldMap(map = {}) {
  const roads = Array.isArray(map.roads) ? map.roads : [];
  const navNodes = Array.isArray(map.navGraph?.nodes) ? map.navGraph.nodes : [];
  const navEdges = Array.isArray(map.navGraph?.edges) ? map.navGraph.edges : [];
  const ids = collectObjectIds(map);
  const idReport = analyzeWorldObjectIds(map);
  return {
    width: Number(map.width) || 0,
    height: Number(map.height) || 0,
    roads: roads.length,
    roadPoints: roads.reduce((sum, road) => sum + (Array.isArray(road) ? road.length : 0), 0),
    obstacles: Array.isArray(map.obstacles) ? map.obstacles.length : 0,
    scenery: Array.isArray(map.scenery) ? map.scenery.length : 0,
    capturePoints: Array.isArray(map.capturePoints) ? map.capturePoints.length : 0,
    safeZones: Array.isArray(map.safeZones) ? map.safeZones.length : 0,
    navNodes: navNodes.length,
    navEdges: navEdges.length,
    objectIds: ids.length,
    contractIds: idReport.contractIds,
    legacyIds: idReport.legacyIds,
    missingIds: idReport.missingIds,
    invalidIds: idReport.invalidIds,
    duplicateIds: duplicateValues(ids)
  };
}

function collectObjectIds(map) {
  return idsFromItems([...(map.scenery || []), ...(map.obstacles || [])]);
}

function idsFromItems(items = []) {
  const ids = [];
  for (const item of items) if (item?.id) ids.push(String(item.id));
  return ids;
}

function analyzeWorldObjectIds(map) {
  const report = { contractIds: 0, legacyIds: 0, missingIds: 0, invalidIds: [] };
  for (const item of [...(map.scenery || []), ...(map.obstacles || [])]) {
    const id = String(item?.id || "");
    if (!id) report.missingIds += 1;
    else if (isContractObjectId(id)) report.contractIds += 1;
    else if (isLegacyObjectId(id)) report.legacyIds += 1;
    else report.invalidIds.push(id);
  }
  return report;
}

function normalizeList(items, fallbackPrefix, used) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (!item || keepExistingId(item.id)) continue;
    item.id = createUnusedObjectId(objectIdPrefixFor(item, fallbackPrefix), used);
    used.add(item.id);
  }
}

function keepExistingId(id) {
  return Boolean(id) && !String(id).startsWith("editor-") && (isContractObjectId(String(id)) || isLegacyObjectId(String(id)));
}

function createUnusedObjectId(prefix, used) {
  let count = 1;
  let id = `${prefix}:${pad4(count)}`;
  while (used.has(id)) {
    count += 1;
    id = `${prefix}:${pad4(count)}`;
  }
  return id;
}

function objectIdPrefixFor(source, fallback = "scenery") {
  const value = typeof source === "string" ? { presetId: source } : (source || {});
  if (value.presetId === "tree-broadleaf" || value.type === "tree" && value.variant === "broadleaf") return "tree:broadleaf";
  if (value.presetId === "tree-pine" || value.type === "tree" && value.variant === "pine") return "tree:pine";
  if (value.presetId === "streetlight" || value.type === "streetlight") return "streetlight";
  if (value.presetId === "billboard" || value.type === "billboard") return "billboard";
  if (String(value.presetId || "").startsWith("building-")) return "building";
  if (value.presetId === "bench" || value.type === "bench") return "bench";
  if (value.presetId === "brush" || value.type === "brush") return "brush";
  if (value.kind === "building") return "building";
  if (value.kind === "base-wall") return "wall";
  if (value.kind === "city-boundary") return "wall";
  return fallback;
}

function isContractObjectId(id) {
  return WORLD_OBJECT_ID_PREFIXES.some((prefix) => id.startsWith(`${prefix}:`) && /:\d{4}$/.test(id));
}

function isLegacyObjectId(id) {
  return /^[a-z0-9][a-z0-9-]*-\d+$/.test(id);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
}

function toRevision(value) {
  const revision = Number(value);
  return Number.isFinite(revision) && revision > 0 ? Math.floor(revision) : 0;
}

function pad4(value) {
  return String(value).padStart(4, "0");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}
