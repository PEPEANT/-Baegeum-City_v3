const assert = require("assert");

(async () => {
  const draftModule = await import("../src/data/world-editor-draft.js");
  const registry = await import("../src/data/map-registry.js");
  const contractModule = await import("../src/data/world-map-contract.js");
  const reportModule = await import("../src/data/world-map-validation-report.js");
  const diffModule = await import("../src/tools/baegeum-world-editor-diff.js");
  const map = {
    id: "map01",
    mapVersion: "source-map-001",
    width: 1200,
    height: 900,
    roadWidth: 80,
    roads: [[{ x: 0, y: 0 }, { x: 100, y: 100 }]],
    terrainPatches: [],
    obstacles: [{ x: 10, y: 20, w: 30, h: 40, kind: "building" }],
    scenery: [{ id: "bench:0001", type: "bench", x: 100, y: 100, w: 30, h: 20, collision: { shape: "rect", w: 30, h: 20, blocksPlayers: true } }],
    capturePoints: [],
    safeZones: [],
    baseExitPoints: {},
    spawns: { player: { x: 20, y: 30 } },
    navGraph: { nodes: [{ id: "a", x: 0, y: 0 }], edges: [] }
  };

  const draft = draftModule.createWorldEditorDraft(map, {
    editorRevision: 7,
    includeSavedAt: false
  });

  assert.strictEqual(draft.schemaVersion, contractModule.WORLD_MAP_SCHEMA_VERSION);
  assert.strictEqual(draft.draftVersion, contractModule.WORLD_EDITOR_DRAFT_VERSION);
  assert.strictEqual(draft.source, contractModule.WORLD_EDITOR_SOURCE);
  assert.strictEqual(draft.editorRevision, 7);
  assert.strictEqual(draft.mapVersion, "source-map-001");
  assert.strictEqual(draft.summary.scenery, 1);
  assert.strictEqual(draft.summary.missingIds, 0);
  assert.strictEqual(draft.summary.contractIds, 2);
  assert.strictEqual(draft.obstacles[0].id, "building:0001");
  assert.ok(!("savedAt" in draft), "comparison drafts must be stable without savedAt");
  const baegeumDraftKey = registry.worldEditorDraftKeyForMap(registry.MAP_IDS.BAEGEUM_CITY);
  const diceDraftKey = registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY);
  assert.strictEqual(draftModule.WORLD_EDITOR_DRAFT_KEY, registry.LEGACY_WORLD_EDITOR_DRAFT_KEY);
  assert.strictEqual(draftModule.DEFAULT_WORLD_EDITOR_DRAFT_KEY, baegeumDraftKey);

  const report = contractModule.validateWorldMapDraft(draft);
  assert.strictEqual(report.ok, true);
  assert.deepStrictEqual(report.errors, []);
  const validation = reportModule.createWorldMapValidationReport(draft);
  assert.strictEqual(validation.ok, true);
  assert.strictEqual(validation.issueCount, 0);

  const overlapDraft = draftModule.createWorldEditorDraft({
    ...map,
    scenery: [...map.scenery, { id: "bench:0002", type: "bench", x: 100, y: 100, w: 30, h: 20, collision: { shape: "rect", w: 30, h: 20, blocksPlayers: true } }]
  }, { includeSavedAt: false });
  const overlapReport = reportModule.createWorldMapValidationReport(overlapDraft);
  assert.ok(overlapReport.warnings.some((item) => item.code === "collision_overlap"));

  const legacyStorage = createStorage([[draftModule.WORLD_EDITOR_DRAFT_KEY, JSON.stringify({ ...draft, roadWidth: 96 })]]);
  globalThis.localStorage = legacyStorage;
  const legacyStatus = draftModule.inspectWorldEditorDraftStorage(globalThis.localStorage);
  assert.strictEqual(legacyStatus.status, "ok");
  assert.strictEqual(legacyStatus.source, "legacy");
  assert.strictEqual(legacyStatus.key, draftModule.WORLD_EDITOR_DRAFT_KEY);
  assert.strictEqual(legacyStatus.draft.roadWidth, 96);
  const applied = draftModule.applyWorldEditorDraft({ ...map, roadWidth: 80 });
  assert.strictEqual(applied.roadWidth, 96);
  assert.strictEqual(applied.mapVersion, "source-map-001");

  const mapStorage = createStorage([[baegeumDraftKey, JSON.stringify({ ...draft, roadWidth: 104 })]]);
  const mapStatus = draftModule.inspectWorldEditorDraftStorage(mapStorage);
  assert.strictEqual(mapStatus.status, "ok");
  assert.strictEqual(mapStatus.source, "map");
  assert.strictEqual(mapStatus.key, baegeumDraftKey);
  assert.strictEqual(mapStatus.draft.roadWidth, 104);
  const mapApplied = draftModule.applyWorldEditorDraft({ ...map, roadWidth: 80 }, { storage: mapStorage });
  assert.strictEqual(mapApplied.roadWidth, 104);

  const mixedStorage = createStorage([
    [draftModule.WORLD_EDITOR_DRAFT_KEY, JSON.stringify({ ...draft, roadWidth: 96 })],
    [baegeumDraftKey, JSON.stringify({ ...draft, roadWidth: 108 })]
  ]);
  const mixedStatus = draftModule.inspectWorldEditorDraftStorage(mixedStorage);
  assert.strictEqual(mixedStatus.source, "map");
  assert.strictEqual(mixedStatus.draft.roadWidth, 108);

  const diceLegacyOnly = draftModule.inspectWorldEditorDraftStorage({
    mapId: registry.MAP_IDS.DICE_CITY,
    storage: legacyStorage
  });
  assert.strictEqual(diceLegacyOnly.status, "missing");
  assert.strictEqual(diceLegacyOnly.key, diceDraftKey);
  assert.strictEqual(diceLegacyOnly.draft, null);

  const diceStorage = createStorage([[diceDraftKey, JSON.stringify({ ...draft, roadWidth: 120 })]]);
  const diceStatus = draftModule.inspectWorldEditorDraftStorage({
    mapId: registry.MAP_IDS.DICE_CITY,
    storage: diceStorage
  });
  assert.strictEqual(diceStatus.status, "ok");
  assert.strictEqual(diceStatus.source, "map");
  assert.strictEqual(diceStatus.draft.roadWidth, 120);

  const clearStorage = createStorage([
    [draftModule.WORLD_EDITOR_DRAFT_KEY, JSON.stringify({ ...draft, roadWidth: 96 })],
    [baegeumDraftKey, JSON.stringify({ ...draft, roadWidth: 108 })],
    [diceDraftKey, JSON.stringify({ ...draft, roadWidth: 120 })]
  ]);
  draftModule.clearWorldEditorDraft({ storage: clearStorage });
  assert.strictEqual(clearStorage.getItem(draftModule.WORLD_EDITOR_DRAFT_KEY), null);
  assert.strictEqual(clearStorage.getItem(baegeumDraftKey), null);
  assert.notStrictEqual(clearStorage.getItem(diceDraftKey), null);

  const missingStatus = draftModule.inspectWorldEditorDraftStorage(createStorage());
  assert.strictEqual(missingStatus.status, "missing");
  assert.strictEqual(missingStatus.key, baegeumDraftKey);
  assert.strictEqual(missingStatus.draft, null);

  const corruptStorage = createStorage([[baegeumDraftKey, "{broken"]]);
  const corruptStatus = draftModule.inspectWorldEditorDraftStorage(corruptStorage);
  assert.strictEqual(corruptStatus.status, "corrupt");
  assert.strictEqual(corruptStatus.source, "map");
  assert.strictEqual(corruptStatus.draft, null);
  assert.strictEqual(draftModule.readWorldEditorDraft(corruptStorage), null);
  assert.strictEqual(corruptStorage.getItem(baegeumDraftKey), "{broken");

  assert.strictEqual(contractModule.createWorldObjectId("bench", draft), "bench:0002");

  const diff = diffModule.describeDraftChanges(draft, {
    ...draft,
    scenery: [...draft.scenery, { id: "bench:0002", type: "bench", x: 220, y: 180, w: 30, h: 20 }],
    roads: [[...draft.roads[0], { x: 220, y: 220 }]]
  });
  assert.ok(diff.some((item) => item.includes("오브젝트 추가")), "draft diff should report added objects");
  assert.ok(diff.some((item) => item.includes("도로점 변경")), "draft diff should report road point changes");

  console.log("World editor draft contract smoke check passed.");
})();

function createStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}
