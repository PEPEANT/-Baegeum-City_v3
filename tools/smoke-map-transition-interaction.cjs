"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const interaction = await load("src/systems/map-transition-interaction.js");
  const runtime = await load("src/scenes/city-scene-runtime.js");
  const { cityMap } = await load("src/data/city-map.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");

  const baegeumRuntimeMap = runtime.createRuntimeMap(cityMap);
  const baegeumTransitions = baegeumRuntimeMap.mapTransitions;
  const near = interaction.findMapTransitionInteraction({
    scene: "city",
    player: baegeumRuntimeMap.playerSpawn,
    map: baegeumRuntimeMap
  });
  assert.equal(near.kind, "map_transition", "near terminal should create map_transition interaction");
  assert.equal(near.transition.objectId, "intercity-bus-terminal", "interaction should target the terminal object");
  assert.equal(near.label, "다이스시티로 이동", "interaction should show the move label");
  assert.equal(near.target, "시외버스터미널", "interaction should show the terminal target");

  const far = interaction.findMapTransitionInteraction({
    scene: "city",
    player: { x: 2200, y: 2200 },
    map: baegeumRuntimeMap
  });
  assert.equal(far, null, "far player should not see the terminal interaction");

  const diceRuntimeMap = runtime.createRuntimeMap(diceCityMap);
  assert.equal(diceRuntimeMap.mapId, "dice-city", "dice runtime map should keep dice mapId");
  assert.ok(diceRuntimeMap.buildings.every((item) => !String(item.id).includes("building:")), "dice building shells should not become enterable casinos");
  assert.equal(diceRuntimeMap.mapTransitions.length, 1, "dice city should get only the return terminal transition");
  const nearReturn = interaction.findMapTransitionInteraction({
    scene: "city",
    player: diceRuntimeMap.playerSpawn,
    map: diceRuntimeMap
  });
  assert.equal(nearReturn.kind, "map_transition", "near dice terminal should create map_transition interaction");
  assert.equal(nearReturn.transition.objectId, "dice-return-bus-terminal", "return interaction should target the dice terminal object");
  assert.equal(nearReturn.label, "배금시티로 이동", "return interaction should show the move label");
  assert.equal(nearReturn.target, "시외버스터미널", "return interaction should show the terminal target");

  const farReturn = interaction.findMapTransitionInteraction({
    scene: "city",
    player: { x: 2200, y: 2200 },
    map: diceRuntimeMap
  });
  assert.equal(farReturn, null, "far dice player should not see the return terminal interaction");

  console.log("Map transition interaction smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
