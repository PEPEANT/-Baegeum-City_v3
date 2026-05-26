import { getMapConfig, MAP_IDS } from "../data/map-registry.js";

export function resolveStartupMapId(search = currentSearch()) {
  const mapId = new URLSearchParams(search).get("map");
  return getMapConfig(mapId)?.mapId || MAP_IDS.BAEGEUM_CITY;
}

export function resolveStartupSpawn(map, search = currentSearch()) {
  const key = new URLSearchParams(search).get("spawn");
  if (!key) return map.playerSpawn;
  const building = findStartupBuilding(map, key);
  const door = building?.doors?.find((item) => item.returnSpawn);
  return door?.returnSpawn || spawnPoint(map, key) || map.playerSpawn;
}

function findStartupBuilding(map, key) {
  const buildingId = key.startsWith("bg-") ? key : `bg-${key}`;
  return map.buildings?.find((item) =>
    item.id === key || item.id === buildingId || item.districtId === key || item.sourceVenueId === key
  ) || null;
}

function spawnPoint(map, key) {
  return map.navGraph?.nodes?.find((node) => node.id === key) || map.spawns?.[key] || null;
}

function currentSearch() {
  return globalThis.location?.search || "";
}
