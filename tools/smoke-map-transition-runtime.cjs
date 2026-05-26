"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const transitions = await load("src/data/map-transitions.js");
  const runtime = await load("src/systems/map-transition-runtime.js");
  const gameMaster = await load("src/systems/game-action-master.js");

  const bus = transitions.getMapTransition("transition:baegeum-to-dice-bus-terminal");
  assert.ok(bus, "bus terminal transition should exist");
  assert.equal(bus.type, "map_transition", "bus terminal should be a map_transition object");
  assert.equal(bus.from, "baegeum-city", "bus terminal should keep the readable from alias");
  assert.equal(bus.objectId, "intercity-bus-terminal", "bus terminal should own the intercity object id");
  assert.equal(bus.fromMapId, "baegeum-city", "bus terminal should leave baegeum-city");
  assert.equal(bus.targetMapId, "dice-city", "bus terminal should target dice-city");
  assert.equal(bus.targetSpawnId, "dice-terminal-arrival", "bus terminal should target the dice terminal spawn");
  assert.deepEqual(transitions.validateMapTransition(bus), [], "bus transition contract should be valid");
  for (const forbidden of ["fare", "ticketItemId", "scheduleId", "onlineRoomId"]) {
    assert.equal(Object.hasOwn(bus, forbidden), false, `v0 transition must not include ${forbidden}`);
  }
  const returnBus = transitions.getMapTransition("transition:dice-to-baegeum-bus-terminal");
  assert.ok(returnBus, "dice return terminal transition should exist");
  assert.equal(returnBus.type, "map_transition", "return terminal should be a map_transition object");
  assert.equal(returnBus.from, "dice-city", "return terminal should keep the readable from alias");
  assert.equal(returnBus.objectId, "dice-return-bus-terminal", "return terminal should own the return object id");
  assert.equal(returnBus.fromMapId, "dice-city", "return terminal should leave dice-city");
  assert.equal(returnBus.targetMapId, "baegeum-city", "return terminal should target baegeum-city");
  assert.equal(returnBus.targetSpawnId, "baegeum-main-spawn", "return terminal should target the baegeum spawn");
  assert.deepEqual(transitions.validateMapTransition(returnBus), [], "return transition contract should be valid");
  for (const forbidden of ["fare", "ticketItemId", "scheduleId", "onlineRoomId"]) {
    assert.equal(Object.hasOwn(returnBus, forbidden), false, `v0 return transition must not include ${forbidden}`);
  }

  const envelope = runtime.createMapTransitionEnvelope({
    transition: bus,
    playerState: { mode: "city", mapId: "baegeum-city", sceneId: "city:baegeum", chatChannelId: "world:baegeum-city" },
    contract: { mapVersion: "baegeum-city-v2-map-001", venueSchemaVersion: "venue-schema-001" }
  });
  assert.equal(envelope.action.type, gameMaster.GAME_ACTION_TYPES.MAP_TRANSITION, "transition should use map_transition action");
  assert.equal(envelope.action.payload.objectId, "intercity-bus-terminal", "transition payload should include the terminal object id");
  assert.equal(envelope.action.payload.from, "baegeum-city", "transition payload should include the readable from map");
  const stateEffect = envelope.effects.find((effect) => effect.type === gameMaster.GAME_EFFECT_TYPES.PLAYER_STATE_PATCH);
  assert.equal(stateEffect.payload.mode, "city", "transition should return to city mode");
  assert.equal(stateEffect.payload.mapId, "dice-city", "transition should switch mapId");
  assert.equal(stateEffect.payload.sceneId, "city:dice", "transition should switch sceneId");
  assert.equal(stateEffect.payload.spawnId, "dice-terminal-arrival", "transition should switch spawnId");
  assert.equal(stateEffect.payload.chatChannelId, "world:dice-city", "transition should switch chat channel");
  assert.throws(() => runtime.createMapTransitionEnvelope({
    transition: bus,
    playerState: { mode: "city", mapId: "dice-city" }
  }), /source mismatch/, "transition should reject the wrong source map");
  const returnEnvelope = runtime.createMapTransitionEnvelope({
    transition: returnBus,
    playerState: { mode: "city", mapId: "dice-city", sceneId: "city:dice", chatChannelId: "world:dice-city" },
    contract: { mapVersion: "baegeum-city-v2-map-001", venueSchemaVersion: "venue-schema-001" }
  });
  assert.equal(returnEnvelope.action.type, gameMaster.GAME_ACTION_TYPES.MAP_TRANSITION, "return should use map_transition action");
  assert.equal(returnEnvelope.action.payload.objectId, "dice-return-bus-terminal", "return payload should include the terminal object id");
  assert.equal(returnEnvelope.action.payload.from, "dice-city", "return payload should include the readable from map");
  const returnStateEffect = returnEnvelope.effects.find((effect) => effect.type === gameMaster.GAME_EFFECT_TYPES.PLAYER_STATE_PATCH);
  assert.equal(returnStateEffect.payload.mode, "city", "return transition should stay in city mode");
  assert.equal(returnStateEffect.payload.mapId, "baegeum-city", "return transition should switch mapId");
  assert.equal(returnStateEffect.payload.sceneId, "city:baegeum", "return transition should switch sceneId");
  assert.equal(returnStateEffect.payload.spawnId, "baegeum-main-spawn", "return transition should switch spawnId");
  assert.equal(returnStateEffect.payload.chatChannelId, "world:baegeum-city", "return transition should switch chat channel");
  assert.throws(() => runtime.createMapTransitionEnvelope({
    transition: returnBus,
    playerState: { mode: "city", mapId: "baegeum-city" }
  }), /source mismatch/, "return transition should reject the wrong source map");

  console.log("Map transition runtime smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
