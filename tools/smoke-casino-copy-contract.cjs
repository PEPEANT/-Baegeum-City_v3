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
  const { cityMap } = await load("src/data/city-map.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");

  const baegeumMap = runtime.createRuntimeMap(cityMap);
  const diceMap = runtime.createRuntimeMap(diceCityMap);
  const pairs = [
    ["bg-blackjack-casino", "bg-dice-blackjack-casino-01"],
    ["bg-odd-even-casino", "bg-dice-odd-even-casino-01"],
    ["bg-horse-track", "bg-dice-horse-track-01"]
  ];

  assert.equal(baegeumMap.mapId, "baegeum-city", "source map should stay baegeum-city");
  assert.equal(diceMap.mapId, "dice-city", "copy map should be dice-city");

  for (const [sourceId, copyId] of pairs) {
    assertVenueCopyPair(baegeumMap, diceMap, sourceId, copyId);
  }

  console.log("Casino copy contract smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function assertVenueCopyPair(sourceMap, copyMap, sourceId, copyId) {
  const source = sourceMap.buildings.find((item) => item.id === sourceId);
  const copy = copyMap.buildings.find((item) => item.id === copyId);
  assert.ok(source, `${sourceId} source venue should remain in baegeum-city`);
  assert.ok(copy, `${copyId} copied venue should exist in dice-city`);
  assert.equal(copy.sourceVenueId, sourceId.replace(/^bg-/, ""), `${copyId} should remember its source venue`);
  assert.equal(source.sign, copy.sign, `${copyId} should copy the Korean sign`);
  assert.equal(source.gameType, copy.gameType, `${copyId} should copy the game type`);
  assert.equal(source.doors[0].targetSceneId, copy.doors[0].targetSceneId, `${copyId} should reuse the proven interior`);
  assert.notEqual(source.id, copy.id, `${copyId} should not reuse the source object id`);
  assert.notEqual(source.doors[0].id, copy.doors[0].id, `${copyId} should not reuse the source door id`);
  assert.equal(source.channels.world, "world:baegeum-city", `${sourceId} should keep baegeum world channel`);
  assert.equal(copy.channels.world, "world:dice-city", `${copyId} should use dice world channel`);
  assert.notEqual(source.onlineRoomId, copy.onlineRoomId, `${copyId} should not reuse the source online room`);
  assert.notEqual(source.channels.venue, copy.channels.venue, `${copyId} should not reuse the source venue channel`);
}
