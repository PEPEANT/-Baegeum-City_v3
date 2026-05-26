"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const maps = await load("src/tools/baegeum-world-editor-maps.js");
  const registry = await load("src/data/map-registry.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");
  const draftModule = await load("src/data/world-editor-draft.js");
  const contract = await load("src/data/world-map-contract.js");
  const history = await load("src/tools/baegeum-world-editor-history.js");
  const report = await load("src/data/world-map-validation-report.js");
  const baegeumKey = registry.worldEditorDraftKeyForMap(registry.MAP_IDS.BAEGEUM_CITY);
  const diceKey = registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY);
  const unavailableState = maps.createEditorMapState({ [registry.MAP_IDS.BAEGEUM_CITY]: sampleMap() });
  assert.equal(unavailableState.mapOptions.find((map) => map.mapId === registry.MAP_IDS.DICE_CITY).available, false);
  assert.equal(maps.switchEditorMapState(unavailableState, registry.MAP_IDS.DICE_CITY), null, "dice-city must stay disabled until its base map exists");

  const state = maps.createEditorMapState({
    [registry.MAP_IDS.BAEGEUM_CITY]: sampleMap(),
    [registry.MAP_IDS.DICE_CITY]: diceCityMap
  });
  assert.equal(state.activeMapId, registry.MAP_IDS.BAEGEUM_CITY, "editor should default to baegeum-city");
  assert.equal(state.mapOptions.find((map) => map.mapId === registry.MAP_IDS.BAEGEUM_CITY).available, true);
  assert.equal(state.mapOptions.find((map) => map.mapId === registry.MAP_IDS.DICE_CITY).available, true);

  const diceDraft = draftModule.createWorldEditorDraft(diceCityMap, { includeSavedAt: false });
  assert.equal(contract.validateWorldMapDraft(diceDraft).ok, true, "dice-city draft contract should be valid");
  assert.equal(report.createWorldMapValidationReport(diceDraft).ok, true, "dice-city base map should have no blocking validation errors");

  globalThis.localStorage = createMemoryStorage([[draftModule.WORLD_EDITOR_DRAFT_KEY, JSON.stringify({ ...sampleMap(), roadWidth: 96 })]]);
  maps.loadEditorMapDraft(state);
  assert.equal(state.map.roadWidth, 96, "baegeum editor should still read legacy fallback");
  state.map.roadWidth = 100;
  history.commitHistory(state);
  const dirtyBlock = maps.editorMapSwitchBlock(state, registry.MAP_IDS.DICE_CITY);
  assert.equal(dirtyBlock.reason, "dirty", "dirty baegeum draft should block map switching");
  assert.equal(state.activeMapId, registry.MAP_IDS.BAEGEUM_CITY, "dirty switch guard should not change active map");
  state.map.roadWidth = 104;
  history.commitHistory(state);
  maps.saveEditorMapDraft(state);
  assert.equal(maps.editorMapSwitchBlock(state, registry.MAP_IDS.DICE_CITY).blocked, false, "saved draft should allow map switching");
  assert.ok(globalThis.localStorage.getItem(baegeumKey), "save should write baegeum map-specific draft");
  assert.equal(globalThis.localStorage.getItem(diceKey), null, "baegeum save must not write dice-city draft");
  assert.ok(maps.editorMapDraftJson(state).includes("\"roadWidth\": 104"));

  assert.ok(maps.switchEditorMapState(state, registry.MAP_IDS.DICE_CITY), "dice-city should become selectable once base map exists");
  assert.equal(state.activeMapId, registry.MAP_IDS.DICE_CITY);
  assert.equal(state.map.id, "dice-city-v0");
  assert.equal(state.map.roadWidth, diceCityMap.roadWidth, "dice-city must not read baegeum legacy fallback");
  state.map.roadWidth = 122;
  maps.saveEditorMapDraft(state);
  assert.ok(globalThis.localStorage.getItem(diceKey), "dice-city save should write dice map-specific draft");
  assert.notEqual(globalThis.localStorage.getItem(diceKey), globalThis.localStorage.getItem(baegeumKey), "map drafts should stay separate");

  console.log("World editor map selector smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function sampleMap() {
  return {
    id: "map01",
    mapVersion: "source-map-001",
    width: 1200,
    height: 900,
    roadWidth: 80,
    roads: [],
    terrainPatches: [],
    obstacles: [],
    scenery: [],
    capturePoints: [],
    safeZones: [],
    baseExitPoints: {},
    spawns: { player: { x: 20, y: 30 } },
    navGraph: { nodes: [], edges: [] }
  };
}

function createMemoryStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}
