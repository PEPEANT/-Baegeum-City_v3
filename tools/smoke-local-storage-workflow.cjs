"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const workflow = await load("src/systems/local-storage-workflow.js");
  const registry = await load("src/data/map-registry.js");
  const { PLAYER_ECONOMY_KEY } = await load("src/systems/player-economy-state.js");
  const { ECONOMY_LEDGER_KEY } = await load("src/systems/economy-ledger.js");
  const { ODD_EVEN_ROUND_STATE_KEY } = await load("src/systems/odd-even-round-state.js");

  const clean = workflow.summarizeLocalStorageWorkflow(createMemoryStorage());
  assert.equal(clean.status, workflow.LOCAL_STORAGE_WORKFLOW_STATUSES.CLEAN, "empty project storage should be clean");
  assert.equal(clean.blocking, false, "clean workflow should not block browser testing");

  const stale = workflow.summarizeLocalStorageWorkflow(createMemoryStorage([
    [PLAYER_ECONOMY_KEY, JSON.stringify({ cash: 80000, chips: 30 })],
    [ECONOMY_LEDGER_KEY, JSON.stringify([])],
    [ODD_EVEN_ROUND_STATE_KEY, JSON.stringify({ version: "odd-even-round-state-001", rounds: [] })]
  ]));
  assert.equal(stale.status, workflow.LOCAL_STORAGE_WORKFLOW_STATUSES.STALE, "saved economy state should be stale for clean workflow");
  assert.equal(stale.blocking, true, "stale economy state should block clean browser assertions");
  assert.ok(stale.staleIds.includes("player-economy"), "stale report should name economy state");

  const draft = workflow.summarizeLocalStorageWorkflow(createMemoryStorage([
    [registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY), JSON.stringify({ mapVersion: "dice-city-v0-map-001" })]
  ]));
  assert.equal(draft.status, workflow.LOCAL_STORAGE_WORKFLOW_STATUSES.STALE, "saved editor draft should be stale");
  assert.ok(draft.blockingIds.includes("world-editor-draft:dice-city"), "draft report should name the map draft");

  const corrupt = workflow.summarizeLocalStorageWorkflow(createMemoryStorage([[PLAYER_ECONOMY_KEY, "{broken"]]));
  assert.equal(corrupt.status, workflow.LOCAL_STORAGE_WORKFLOW_STATUSES.CORRUPT, "bad JSON should be corrupt");
  assert.equal(corrupt.blocking, true, "corrupt storage should block workflow");
  assert.ok(workflow.createLocalStorageWorkflowLabel(corrupt).includes("corrupt"), "label should expose corrupt workflow");

  const unavailable = workflow.summarizeLocalStorageWorkflow(null);
  assert.equal(unavailable.status, workflow.LOCAL_STORAGE_WORKFLOW_STATUSES.UNAVAILABLE, "missing storage should report unavailable");

  console.log("Local storage workflow smoke check passed.");
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
