"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const runtime = await load("src/scenes/city-scene-runtime.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");
  const { interiors } = await load("src/data/interiors.js");
  const { validateVenueChannels } = await load("src/data/runtime-contract.js");

  const map = runtime.createRuntimeMap(diceCityMap);
  const expected = new Map([
    ["bg-dice-blackjack-casino-01", ["blackjack", "interior-blackjack-casino"]],
    ["bg-dice-odd-even-casino-01", ["odd-even", "interior-odd-even-casino"]],
    ["bg-dice-horse-track-01", ["horse-racing", "interior-horse-track"]]
  ]);

  assert.equal(map.mapId, "dice-city", "runtime map should be dice-city");
  assert.equal(map.worldChannelId, "world:dice-city", "dice map should use dice world channel");
  assert.equal(map.buildings.length, expected.size, "dice-city should expose only copied venue anchors");
  assertNoCombatMapMarks(map);

  for (const [id, [gameType, interiorId]] of expected.entries()) {
    const building = map.buildings.find((item) => item.id === id);
    assert.ok(building, `${id} should exist`);
    assert.equal(building.mapId, "dice-city", `${id} should be scoped to dice-city`);
    assert.equal(building.gameType, gameType, `${id} should keep the copied game type`);
    assert.equal(building.channels.world, "world:dice-city", `${id} should use dice world chat`);
    assert.equal(building.onlineRoomId, building.channels.venue, `${id} onlineRoomId should follow venue channel`);
    assert.deepEqual(validateVenueChannels(building.channels), [], `${id} channels should be valid`);
    assert.equal(building.doors[0].targetSceneId, interiorId, `${id} should reuse the proven base interior`);
    assert.ok(interiors[interiorId], `${id} target interior should exist`);
  }

  const shells = map.obstacles.filter((item) => item.objectKind === "building_shell");
  assert.ok(shells.length > 0, "dice-city should still keep placement-only building shells");
  assert.ok(!map.buildings.some((item) => String(item.id).includes("building:")), "shell ids should not become venues");

  console.log("Dice-city venue smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function assertNoCombatMapMarks(map) {
  assert.deepEqual(map.safeZones || [], [], "dice-city should not use combat safe zones for terminal protection");
  assert.deepEqual(map.capturePoints || [], [], "dice-city should not expose combat capture points");
  assert.equal(Object.keys(map.baseExitPoints || {}).length, 0, "dice-city should not expose combat base exit points");
  assert.ok(!map.obstacles.some((item) => item.kind === "base-wall"), "dice-city edge walls should not use base-wall kind");
}
