const assert = require("assert");

const VENUE_KEYS = ["doors", "channels", "interiorId", "gameType", "venueId", "onlineRoomId"];

(async () => {
  const modules = await loadModules();
  assertPinnedPresets(modules.build);
  assertBuildGroups(modules.build);
  assertRoleAwareGroups(modules.build);
  const building = assertBuildingShell(modules);
  assertBuildingShellResize(modules, building);
  assertDraftBuildingShell(modules, building);
  assertBuildingVariants(modules.build);
  assertCategoryOpenState(modules.build);
  console.log("World editor build palette smoke check passed.");
})();

async function loadModules() {
  const [build, buildingShells, objects, draft, contract] = await Promise.all([
    import("../src/tools/baegeum-world-editor-build.js"),
    import("../src/tools/baegeum-world-editor-building-shells.js"),
    import("../src/data/world-object-presets.js"),
    import("../src/data/world-editor-draft.js"),
    import("../src/data/world-map-contract.js")
  ]);
  return { build, buildingShells, objects, draft, contract };
}

function assertPinnedPresets(build) {
  const pinned = build.BUILD_PRESETS.filter((preset) => preset.pinned);
  assert.deepStrictEqual(pinned.map((preset) => preset.id), ["streetlight", "billboard", "bench"]);
  assert.ok(build.BUILD_PRESETS.every((preset) => preset.label && preset.meta && preset.swatch && preset.category));
}

function assertBuildGroups(build) {
  const groups = build.groupBuildPresets(build.BUILD_PRESETS);
  assert.deepStrictEqual(groups.map((group) => group.label), ["고정", "건물", "자연물", "거리 시설", "광고/간판"]);
  assert.deepStrictEqual(groups.map((group) => group.open), [true, false, false, false, false]);
  assert.deepStrictEqual(groups[1].presets.map((preset) => preset.id), [
    "building-shop-shell",
    "building-home-shell",
    "building-civic-shell",
    "building-casino-shell",
    "building-alley-shell",
    "building-loan-shell",
    "building-motel-shell"
  ]);
  assert.deepStrictEqual(groups[2].presets.map((preset) => preset.id), ["tree-broadleaf", "tree-pine", "brush"]);
  assert.deepStrictEqual(groups[3].presets.map((preset) => preset.id), ["streetlight", "bench"]);
  assert.deepStrictEqual(groups[4].presets.map((preset) => preset.id), ["billboard"]);
  assert.deepStrictEqual(groups.map((group) => [group.key, group.open]), [["pinned", true], ["building", false], ["nature", false], ["street", false], ["signage", false]]);
}

function assertRoleAwareGroups(build) {
  assert.deepStrictEqual(buildingPresetIdsForMap(build, "baegeum-city"), ["building-shop-shell", "building-home-shell", "building-civic-shell"]);
  assert.deepStrictEqual(buildingPresetIdsForMap(build, "dice-city"), ["building-casino-shell", "building-alley-shell", "building-loan-shell", "building-motel-shell"]);
  assert.equal(build.findBuildPreset("building-casino-shell", "baegeum-city"), null);
  assert.equal(build.findBuildPreset("building-home-shell", "dice-city"), null);
}

function assertBuildingShell({ build, objects }) {
  const preset = build.findBuildPreset("building-shop-shell");
  const source = objects.getWorldObjectPreset("building-shop-shell");
  assert.equal(source.layer, "obstacle");
  assert.equal(source.buildRules.category, "building");
  assert.equal(source.destructible.enabled, false);
  assertNoVenueKeys(source.visual, "building shell source preset");
  assert.equal(preset.layer, "obstacle");

  const building = build.createSceneryItem(testMap(), preset, { x: 520, y: 420 }, { snap: true, grid: 40 });
  assert.match(building.id, /^building:\d{4}$/);
  assert.equal(building.kind, "building");
  assert.equal(building.objectKind, "building_shell");
  assert.equal(building.objectLayer, "obstacle");
  assert.equal(building.destructibleSpec.enabled, false);
  assert.equal(building.buildRules.category, "building");
  assert.equal(building.buildRules.buildingType, "convenience_store");
  assert.equal(building.districtId, "baegeum-commerce");
  assertNoVenueKeys(building, "placed building shell");
  return building;
}

function assertDraftBuildingShell({ draft, contract }, building) {
  const saved = draft.createWorldEditorDraft({ ...testMap(), obstacles: [building] }, { includeSavedAt: false });
  const check = contract.validateWorldMapDraft(saved);
  assert.equal(check.ok, true);
  assert.equal(saved.obstacles.length, 1);
  assert.equal(saved.scenery.length, 0);
  assert.equal(saved.obstacles[0].id, building.id);
  assert.equal(saved.obstacles[0].objectKind, "building_shell");
  assert.equal(saved.summary.contractIds, 1);
  assertNoVenueKeys(saved.obstacles[0], "draft building shell");
}

function assertBuildingShellResize({ buildingShells }, building) {
  const before = center(building);
  assert.equal(buildingShells.buildingShellSizeLabel(building), "기본");
  const result = buildingShells.cycleBuildingShellSize(building);
  assert.equal(result.label, "대형");
  assert.equal(buildingShells.buildingShellSizeLabel(building), "대형");
  assert.ok(building.w > 220);
  assert.ok(building.h > 150);
  assert.deepStrictEqual(center(building), before);
  assert.equal(building.collision.w, building.w);
  assert.equal(building.collision.h, building.h);
  assertNoVenueKeys(building, "resized building shell");
}

function assertBuildingVariants(build) {
  const casinoShell = build.createSceneryItem(testMap(), build.findBuildPreset("building-casino-shell"), { x: 620, y: 460 }, { snap: true, grid: 40 });
  assert.match(casinoShell.id, /^building:\d{4}$/);
  assert.equal(casinoShell.objectKind, "building_shell");
  assert.equal(casinoShell.variant, "depot");
}

function assertCategoryOpenState(build) {
  const openState = build.setBuildCategoryOpen(build.createBuildCategoryOpenState(), "nature", true);
  const groups = build.groupBuildPresets(build.BUILD_PRESETS, openState);
  assert.equal(groups.find((group) => group.key === "nature").open, true);
  assert.equal(groups.find((group) => group.key === "street").open, false);
}

function buildingPresetIdsForMap(build, mapId) {
  return build.buildPresetsForMap(mapId).filter((preset) => preset.category === "building").map((preset) => preset.id);
}

function assertNoVenueKeys(item, label) {
  for (const key of VENUE_KEYS) assert.equal(item[key], undefined, `${label} should not define venue-owned key: ${key}`);
}

function center(item) {
  return {
    x: Math.round(item.x + item.w * 0.5),
    y: Math.round(item.y + item.h * 0.5)
  };
}

function testMap() {
  return {
    id: "test-map",
    mapVersion: "test",
    width: 1200,
    height: 900,
    roadWidth: 100,
    roads: [[{ x: 0, y: 0 }, { x: 120, y: 0 }]],
    terrainPatches: [],
    obstacles: [],
    scenery: [],
    capturePoints: [],
    safeZones: [],
    baseExitPoints: {},
    spawns: {},
    navGraph: { nodes: [], edges: [] }
  };
}
