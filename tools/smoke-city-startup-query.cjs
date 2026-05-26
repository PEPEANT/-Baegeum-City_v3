"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const startup = await load("src/scenes/city-startup.js");
  const runtime = await load("src/scenes/city-scene-runtime.js");
  const { cityMap } = await load("src/data/city-map.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");

  const baegeumRuntimeMap = runtime.createRuntimeMap(cityMap);
  const diceRuntimeMap = runtime.createRuntimeMap(diceCityMap);

  assert.equal(startup.resolveStartupMapId("?map=dice-city&spawn=dice-blackjack-casino-01"), "dice-city");
  assert.equal(startup.resolveStartupMapId("?map=unknown&spawn=dice-blackjack-casino-01"), "baegeum-city");

  assertNearDoor(
    diceRuntimeMap,
    startup.resolveStartupSpawn(diceRuntimeMap, "?map=dice-city&spawn=dice-blackjack-casino-01"),
    "bg-dice-blackjack-casino-01"
  );
  assertNearDoor(
    baegeumRuntimeMap,
    startup.resolveStartupSpawn(baegeumRuntimeMap, "?spawn=horse-track"),
    "bg-horse-track"
  );
  assert.deepEqual(
    point(startup.resolveStartupSpawn(diceRuntimeMap, "?map=dice-city&spawn=dice-terminal-arrival")),
    { x: 520, y: 2620 }
  );

  console.log("City startup query smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function assertNearDoor(map, spawn, buildingId) {
  const building = map.buildings.find((item) => item.id === buildingId);
  assert.ok(building, `${buildingId} should exist`);
  const door = building.doors[0];
  assert.ok(Math.hypot(spawn.x - door.x, spawn.y - door.y) <= 78, `${buildingId} spawn should start near its door`);
}

function point(spawn) {
  return { x: spawn.x, y: spawn.y };
}
