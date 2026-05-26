"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const diagnostics = await load("src/systems/local-storage-diagnostics.js");
  const registry = await load("src/data/map-registry.js");
  const { PLAYER_ECONOMY_KEY } = await load("src/systems/player-economy-state.js");
  const { ECONOMY_LEDGER_KEY } = await load("src/systems/economy-ledger.js");
  const { BAEGEUM_SKIN_KEY, DRAWING_WORLD_SKIN_KEY } = await load("src/skins/drawing-world-adapter.js");

  assert.ok(diagnostics.localStorageInventory.some((item) => item.key === PLAYER_ECONOMY_KEY), "inventory should include economy state");
  assert.ok(diagnostics.localStorageInventory.some((item) => item.key === ECONOMY_LEDGER_KEY), "inventory should include economy ledger");
  assert.ok(diagnostics.localStorageInventory.some((item) => item.key === registry.worldEditorDraftKeyForMap(registry.MAP_IDS.BAEGEUM_CITY)), "inventory should include baegeum-city draft");
  assert.ok(diagnostics.localStorageInventory.some((item) => item.key === registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY)), "inventory should include dice-city draft");
  assert.ok(diagnostics.localStorageInventory.some((item) => item.key === registry.LEGACY_WORLD_EDITOR_DRAFT_KEY), "inventory should include legacy world-editor draft");

  const emptyStorage = createMemoryStorage();
  const missing = diagnostics.inspectLocalStorageKey({ id: "economy", key: PLAYER_ECONOMY_KEY, format: "json-object", owner: "test" }, emptyStorage);
  assert.equal(missing.status, diagnostics.STORAGE_DIAGNOSTIC_STATUSES.MISSING, "empty storage should report missing");

  const corruptStorage = createMemoryStorage([[PLAYER_ECONOMY_KEY, "{broken"]]);
  const corrupt = diagnostics.inspectLocalStorageKey({ id: "economy", key: PLAYER_ECONOMY_KEY, format: "json-object", owner: "test" }, corruptStorage);
  assert.equal(corrupt.status, diagnostics.STORAGE_DIAGNOSTIC_STATUSES.CORRUPT, "bad JSON should report corrupt");

  const validStorage = createMemoryStorage([
    [registry.worldEditorDraftKeyForMap(registry.MAP_IDS.BAEGEUM_CITY), JSON.stringify({ mapVersion: "baegeum-city-v2-map-001" })],
    [PLAYER_ECONOMY_KEY, JSON.stringify({ cash: 1000 })],
    [ECONOMY_LEDGER_KEY, JSON.stringify([])]
  ]);
  const statuses = Object.fromEntries(diagnostics.inspectLocalStorage(validStorage).map((item) => [item.key, item.status]));
  assert.equal(statuses[registry.worldEditorDraftKeyForMap(registry.MAP_IDS.BAEGEUM_CITY)], diagnostics.STORAGE_DIAGNOSTIC_STATUSES.OK, "valid baegeum draft JSON should report ok");
  assert.equal(statuses[registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY)], diagnostics.STORAGE_DIAGNOSTIC_STATUSES.MISSING, "missing dice draft should report missing");
  assert.equal(statuses[PLAYER_ECONOMY_KEY], diagnostics.STORAGE_DIAGNOSTIC_STATUSES.OK, "valid economy JSON should report ok");
  assert.equal(statuses[ECONOMY_LEDGER_KEY], diagnostics.STORAGE_DIAGNOSTIC_STATUSES.OK, "valid ledger JSON should report ok");

  const legacyStorage = createMemoryStorage([[DRAWING_WORLD_SKIN_KEY, "data:image/png;base64,legacy"]]);
  const migrated = diagnostics.inspectLocalStorageKey({
    id: "skin-custom",
    key: BAEGEUM_SKIN_KEY,
    format: "string",
    owner: "test",
    legacyKey: DRAWING_WORLD_SKIN_KEY
  }, legacyStorage);
  assert.equal(migrated.status, diagnostics.STORAGE_DIAGNOSTIC_STATUSES.MIGRATED, "legacy skin fallback should report migrated");

  console.log("Local storage diagnostics smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function createMemoryStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}
