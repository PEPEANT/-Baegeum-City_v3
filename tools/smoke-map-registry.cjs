"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const registry = await load("src/data/map-registry.js");
  const districts = await load("src/data/city-district-contract.js");
  const draftModule = await load("src/data/world-editor-draft.js");

  const baegeum = registry.requireMapConfig(registry.MAP_IDS.BAEGEUM_CITY);
  const dice = registry.requireMapConfig(registry.MAP_IDS.DICE_CITY);

  assert.equal(baegeum.sceneId, "city:baegeum");
  assert.equal(dice.sceneId, "city:dice");
  assert.equal(baegeum.cityRoleId, districts.CITY_ROLE_IDS.LIFE_HUB);
  assert.equal(dice.cityRoleId, districts.CITY_ROLE_IDS.GAMBLING_NIGHT);
  assert.equal(baegeum.draftKey, "baegeum-city-v2-world-editor-draft:baegeum-city");
  assert.equal(dice.draftKey, "baegeum-city-v2-world-editor-draft:dice-city");
  assert.equal(baegeum.worldChannelId, "world:baegeum-city");
  assert.equal(dice.worldChannelId, "world:dice-city");
  assert.notEqual(baegeum.draftKey, dice.draftKey, "map-specific draft keys must not overlap");
  assert.equal(registry.shouldReadLegacyDraft(registry.MAP_IDS.BAEGEUM_CITY), true, "baegeum-city may read the legacy draft");
  assert.equal(registry.shouldReadLegacyDraft(registry.MAP_IDS.DICE_CITY), false, "dice-city must not read the legacy draft");
  assert.equal(registry.legacyDraftKeyForMap(registry.MAP_IDS.DICE_CITY), null, "dice-city must not have a legacy key");
  assert.equal(registry.LEGACY_WORLD_EDITOR_DRAFT_KEY, draftModule.WORLD_EDITOR_DRAFT_KEY, "legacy draft key must stay compatible");
  assert.equal(registry.worldEditorDraftKeyForMap(registry.MAP_IDS.DICE_CITY), dice.draftKey);
  assert.throws(() => registry.requireMapConfig("unknown-city"), /Unknown mapId/);

  const draftKeys = new Set(registry.allMapConfigs().map((config) => config.draftKey));
  const sceneIds = new Set(registry.allMapConfigs().map((config) => config.sceneId));
  assert.equal(draftKeys.size, registry.allMapConfigs().length, "draft keys must be unique");
  assert.equal(sceneIds.size, registry.allMapConfigs().length, "scene ids must be unique");

  console.log("Map registry smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
