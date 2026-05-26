import { applyBaegeumCityInfrastructureLayout } from "./baegeum-city-infrastructure-layout.js";

export const BAEGEUM_CITY_URBAN_LAYOUT_VERSION = "baegeum-city-urban-layout-v1";

const COMBAT_SCENERY_TYPES = new Set(["sandbag", "barricade", "rubble"]);
const CITY_BOUNDARY_IDS = new Set(["wall:9001", "wall:9002", "wall:9003", "wall:9004", "wall:9005", "wall:9006"]);
const CITY_SCENERY_IDS = new Set(["streetlight:9001", "streetlight:9002", "billboard:9001", "bench:9001"]);

export function applyBaegeumCityUrbanLayout(map) {
  if (!map || map.mapId === "dice-city" || map.id === "dice-city-v0") return map;
  applyTerrainStyle(map);
  removeCombatMapMarks(map);
  replaceBaseWallsWithCityEdges(map);
  replaceCombatScenery(map);
  applyBaegeumCityInfrastructureLayout(map);
  map.urbanLayoutVersion = BAEGEUM_CITY_URBAN_LAYOUT_VERSION;
  return map;
}

function applyTerrainStyle(map) {
  map.terrainStyle = {
    gradient: ["#756f60", "#817967", "#6d685d"],
    gridAlpha: 0.08,
    gridColor: "#f1e2c0",
    gridSize: 120
  };
  map.roadStyle = {
    body: "#45413c",
    edge: "#2f2d2a",
    lane: "rgba(234, 206, 138, 0.36)"
  };
  map.terrainPatches = cityTerrainPatches(map);
}

function removeCombatMapMarks(map) {
  map.capturePoints = [];
  map.safeZones = [];
  map.baseExitPoints = {};
}

function replaceBaseWallsWithCityEdges(map) {
  const kept = (map.obstacles || []).filter((item) => item?.kind !== "base-wall" && !CITY_BOUNDARY_IDS.has(String(item?.id || "")));
  map.obstacles = [...kept, ...cityBoundaryObstacles(map)];
}

function replaceCombatScenery(map) {
  const kept = (map.scenery || []).filter((item) => !COMBAT_SCENERY_TYPES.has(item?.type) && !CITY_SCENERY_IDS.has(String(item?.id || "")));
  map.scenery = [...kept, ...cityEdgeScenery(map)];
}

function cityTerrainPatches(map) {
  const w = Number(map.width) || 1;
  const h = Number(map.height) || 1;
  return [
    patch(w * 0.14, h * 0.18, 420, "rgba(190, 171, 132, 0.20)"),
    patch(w * 0.34, h * 0.20, 520, "rgba(150, 144, 123, 0.18)"),
    patch(w * 0.58, h * 0.23, 480, "rgba(183, 160, 120, 0.16)"),
    patch(w * 0.78, h * 0.36, 440, "rgba(132, 136, 125, 0.18)"),
    patch(w * 0.22, h * 0.73, 560, "rgba(196, 178, 135, 0.18)"),
    patch(w * 0.62, h * 0.74, 540, "rgba(145, 139, 121, 0.18)")
  ];
}

function cityBoundaryObstacles(map) {
  const w = Number(map.width) || 1;
  const h = Number(map.height) || 1;
  return [
    boundary("wall:9001", 0, 0, w, 46, "north-retaining-wall"),
    boundary("wall:9002", 0, h - 54, Math.min(2400, w), 54, "south-tunnel-wall"),
    boundary("wall:9003", 0, 0, 52, h, "west-retaining-wall"),
    boundary("wall:9004", w - 56, 0, 56, Math.min(1380, h), "east-tunnel-wall"),
    boundary("wall:9005", Math.max(0, w - 720), Math.min(h - 92, 820), 580, 56, "east-tunnel-mouth"),
    boundary("wall:9006", 220, Math.max(0, h - 430), 420, 50, "terminal-curb")
  ];
}

function cityEdgeScenery(map) {
  const spawn = map.playerSpawn || map.spawns?.player || { x: 520, y: Math.max(0, Number(map.height) - 520) };
  return [
    streetlight("streetlight:9001", spawn.x - 210, spawn.y - 170),
    streetlight("streetlight:9002", spawn.x + 210, spawn.y - 165),
    billboard("billboard:9001", spawn.x - 330, spawn.y - 290),
    bench("bench:9001", spawn.x + 120, spawn.y - 265)
  ];
}

function patch(x, y, r, color) {
  return { x: Math.round(x), y: Math.round(y), r: Math.round(r), color };
}

function boundary(id, x, y, w, h, variant) {
  return { id, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), kind: "city-boundary", variant };
}

function streetlight(id, x, y) {
  return { id, x: Math.round(x), y: Math.round(y), w: 30, h: 108, type: "streetlight", variant: "single", shape: "rect" };
}

function billboard(id, x, y) {
  return { id, x: Math.round(x), y: Math.round(y), w: 168, h: 74, type: "billboard", variant: "warning", adId: "city-warning", shape: "rect" };
}

function bench(id, x, y) {
  return { id, x: Math.round(x), y: Math.round(y), w: 104, h: 36, type: "bench", variant: "wood", shape: "rect" };
}
