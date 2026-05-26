"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "iron-line");
const vendorFiles = [
  "src/core/math.js",
  "src/data/scenery-catalog.js",
  "src/data/map01.js",
  "src/data/map01-custom-layout.js"
];

(async () => {
  const { cityMap } = await import(pathToFileURL("src/data/city-map.js"));
  const compact = await import(pathToFileURL("src/data/baegeum-city-compact-layout.js"));
  const infrastructure = await import(pathToFileURL("src/data/baegeum-city-infrastructure-layout.js"));
  const urban = await import(pathToFileURL("src/data/baegeum-city-urban-layout.js"));
  const validation = await import(pathToFileURL("src/data/world-map-validation-report.js"));
  const browserMap = compact.compactBaegeumMapLayout(loadIronLineBrowserMap());
  const fallbackMap = compact.compactBaegeumMapLayout(clone(cityMap));

  assertUrbanized(browserMap, urban.BAEGEUM_CITY_URBAN_LAYOUT_VERSION, infrastructure, validation);
  assertUrbanized(fallbackMap, urban.BAEGEUM_CITY_URBAN_LAYOUT_VERSION, infrastructure, validation);

  console.log("Baegeum city urban layout smoke passed.");
})();

function assertUrbanized(map, expectedVersion, infrastructure, validation) {
  assert.equal(map.urbanLayoutVersion, expectedVersion, "baegeum map should have the urban layout version");
  assert.equal(map.infrastructureLayoutVersion, infrastructure.BAEGEUM_CITY_INFRASTRUCTURE_LAYOUT_VERSION, "baegeum map should place infrastructure shells");
  assert.equal(map.safeZones.length, 0, "combat safe zones should be removed from city view");
  assert.equal(map.capturePoints.length, 0, "combat capture points should be removed from city view");
  assert.equal(Object.keys(map.baseExitPoints || {}).length, 0, "combat base exit markers should be removed from city view");
  assert.ok(map.terrainStyle?.gradient?.[0] === "#756f60", "terrain should use muted city ground colors");
  assert.ok(map.roadStyle?.body === "#45413c", "roads should use city asphalt styling");
  assert.ok(!map.obstacles.some((item) => item.kind === "base-wall"), "old base walls should be removed");
  assert.ok(map.obstacles.some((item) => item.kind === "city-boundary"), "city edge walls should replace base walls");
  assert.ok(map.obstacles.some((item) => String(item.variant || "").includes("tunnel")), "city edge should include tunnel-like walls");
  assert.ok(!map.scenery.some((item) => ["sandbag", "barricade", "rubble"].includes(item.type)), "combat scenery should be removed");
  assert.ok(map.scenery.some((item) => item.id === "billboard:9001"), "city edge billboard should be present");
  assert.ok(maxBottom(map) <= map.height, "urbanized map content should fit inside map height");
  assertInfrastructureBuildings(map, infrastructure);
  assertNoCombatOverlayLabels(map);
  assertNoCityBoundaryWarnings(map, validation);
  assertNoInfrastructureCollisionWarnings(map, validation);
}

function assertInfrastructureBuildings(map, infrastructure) {
  const ids = infrastructure.baegeumInfrastructureBuildingIds();
  const obstacles = new Map((map.obstacles || []).map((item) => [item.id, item]));
  for (const id of ids) {
    const item = obstacles.get(id);
    assert.ok(item, `missing infrastructure obstacle ${id}`);
    assert.equal(item.objectKind, "building_shell", `${id} should stay a placement shell`);
    assert.equal(item.kind, "building", `${id} should render as a city building`);
    assert.equal(item.doors, undefined, `${id} must not become enterable in this slice`);
    assert.equal(item.channels, undefined, `${id} must not own online channels in this slice`);
  }
  const signs = new Set((map.buildings || []).filter((item) => item.infrastructure).map((item) => item.sign));
  for (const label of ["편의점", "자동차매장", "주유소", "백화점", "물류센터", "경찰서", "주식시장", "시외버스터미널"]) {
    assert.ok(signs.has(label), `missing infrastructure sign ${label}`);
  }
}

function assertNoCombatOverlayLabels(map) {
  const visibleOverlayData = JSON.stringify({
    safeZones: map.safeZones,
    capturePoints: map.capturePoints,
    baseExitPoints: map.baseExitPoints,
    obstacles: (map.obstacles || []).map(({ id, kind, variant, label, name }) => ({ id, kind, variant, label, name }))
  });
  assert.ok(!/(아군|적군|기지|base-wall|blue_base|red_base)/i.test(visibleOverlayData), "city view should not expose combat overlay labels");
}

function assertNoCityBoundaryWarnings(map, validation) {
  const report = validation.createWorldMapValidationReport(map);
  const cityBoundaryWarning = report.warnings.find((issue) => issue.code === "collision_overlap" && String(issue.target || "").includes("wall:900"));
  assert.ok(!cityBoundaryWarning, "city boundary corner joins should not create editor overlap warnings");
}

function assertNoInfrastructureCollisionWarnings(map, validation) {
  const report = validation.createWorldMapValidationReport(map);
  const warning = report.warnings.find((issue) => issue.code === "collision_overlap" && String(issue.target || "").includes("building:91"));
  assert.ok(!warning, "infrastructure buildings should not overlap existing blockers");
}

function maxBottom(map) {
  return Math.max(
    ...[...(map.obstacles || []), ...(map.scenery || [])].map((item) => Number(item.y || 0) + Number(item.h || item.r || 0)),
    ...flattenPoints(map.roads).map((point) => Number(point.y || 0)),
    Number(map.playerSpawn?.y || 0)
  );
}

function flattenPoints(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => Array.isArray(item) ? flattenPoints(item) : [item]);
}

function pathToFileURL(relativePath) {
  const { pathToFileURL: toUrl } = require("url");
  return toUrl(path.join(root, relativePath)).href;
}

function loadIronLineBrowserMap() {
  const context = { window: {}, console };
  context.window.IronLine = {};
  context.IronLine = context.window.IronLine;
  vm.createContext(context);
  for (const file of vendorFiles) {
    vm.runInContext(fs.readFileSync(path.join(vendorRoot, file), "utf8"), context, { filename: file });
  }
  return context.window.IronLine.map01;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
