import { applyBaegeumCityUrbanLayout } from "./baegeum-city-urban-layout.js";

export const BAEGEUM_COMPACT_LAYOUT_VERSION = "baegeum-city-compact-layout-v1";
export const BAEGEUM_COMPACT_HEIGHT = 4600;

export function compactBaegeumMapLayout(map) {
  if (!map || map.mapId === "dice-city" || map.id === "dice-city-v0") return map;
  const sourceHeight = Number(map.height) || 0;
  if (!sourceHeight) return map;
  map.terrainPatches = map.terrainPatches || map.patches || [];
  if (sourceHeight > BAEGEUM_COMPACT_HEIGHT) {
    const scaleY = BAEGEUM_COMPACT_HEIGHT / sourceHeight;
    map.height = BAEGEUM_COMPACT_HEIGHT;
    scalePointLists(map, scaleY);
    scaleRectLists(map, scaleY);
    scaleNestedPoints(map.spawns, scaleY, true);
    scaleNestedPoints(map.baseExitPoints, scaleY, true);
    scaleNestedPoints(map.reconPoints, scaleY, true);
  }
  applyBaegeumCityUrbanLayout(map);
  markCompact(map);
  return map;
}

function scalePointLists(map, scaleY) {
  scaleNestedPoints(map.roads, scaleY);
  scaleNestedPoints(map.terrainPatches, scaleY, true);
  scaleNestedPoints(map.capturePoints, scaleY, true);
  scaleNestedPoints(map.safeZones, scaleY, true);
  scaleNestedPoints(map.navGraph?.nodes, scaleY);
  scaleNestedPoints(map.playerSpawn, scaleY);
}

function scaleRectLists(map, scaleY) {
  for (const item of [...(map.obstacles || []), ...(map.scenery || []), ...(map.buildings || [])]) {
    scaleRectLike(item, scaleY);
    scaleRectLike(item.rect, scaleY);
    scaleNestedPoints(item.doors, scaleY);
    scaleNestedPoints(item.signAnchor, scaleY);
    scaleNestedPoints(item.returnSpawn, scaleY);
    scaleRectLike(item.collision, scaleY);
  }
}

function scaleNestedPoints(value, scaleY, scaleArea = false) {
  if (Array.isArray(value)) {
    value.forEach((item) => scaleNestedPoints(item, scaleY, scaleArea));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Number.isFinite(Number(value.y))) value.y = Math.round(Number(value.y) * scaleY);
  if (scaleArea && Number.isFinite(Number(value.radius))) value.radius = Math.round(Number(value.radius) * scaleY);
  if (scaleArea && Number.isFinite(Number(value.r))) value.r = Math.round(Number(value.r) * scaleY);
  for (const child of Object.values(value)) scaleNestedPoints(child, scaleY, scaleArea);
}

function scaleRectLike(item, scaleY) {
  if (!item || typeof item !== "object") return;
  if (Number.isFinite(Number(item.y))) item.y = Math.round(Number(item.y) * scaleY);
  if (Number.isFinite(Number(item.h))) item.h = Math.max(1, Math.round(Number(item.h) * scaleY));
  if (Number.isFinite(Number(item.r))) item.r = Math.max(1, Math.round(Number(item.r) * scaleY));
  if (Number.isFinite(Number(item.radius))) item.radius = Math.max(1, Math.round(Number(item.radius) * scaleY));
}

function markCompact(map) {
  map.layoutVersion = BAEGEUM_COMPACT_LAYOUT_VERSION;
  return map;
}
