"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const contract = await load("src/data/runtime-contract.js");
  const { createVenueChannels } = await load("src/data/gambling-venues.js");
  const registry = await load("src/data/map-registry.js");
  const {
    createCityPlayerState,
    createTablePlayerState,
    createVenueLobbyPlayerState,
    createVenuePlayerState
  } = await load("src/systems/player-state.js");
  const { WorldChat } = await load("src/systems/world-chat.js");

  assert.equal(contract.MAP_VERSION, "baegeum-city-v2-map-001", "map version should be fixed");
  assert.equal(contract.VENUE_SCHEMA_VERSION, "venue-schema-001", "venue schema version should be fixed");
  assert.equal(contract.WORLD_CHANNEL_ID, "world:baegeum-city", "default world channel should be baegeum-city");

  const channels = createVenueChannels("blackjack-casino");
  const diceChannels = createVenueChannels("blackjack-casino", registry.MAP_IDS.DICE_CITY);
  assert.equal(channels.world, contract.WORLD_CHANNEL_ID, "world channel should be canonical");
  assert.equal(diceChannels.world, "world:dice-city", "dice-city venues should use the dice world channel");
  assert.equal(channels.venue, "venue:blackjack-casino-01", "base venue channel should be numbered");
  assert.deepEqual(contract.validateVenueChannels(channels), [], "generated venue channels should be valid");
  assert.deepEqual(contract.validateVenueChannels(diceChannels), [], "dice-city venue channels should be valid");
  assert.ok(contract.validateVenueChannels({ ...channels, world: "world:city" }).length, "legacy world:city should be rejected");
  assert.ok(contract.validateVenueChannels({ ...channels, world: "city:main" }).length, "old world channel should be rejected");
  assert.ok(contract.validateVenueChannels({ ...channels, spectator: "spectate:blackjack-casino-01" }).length, "old spectator channel should be rejected");

  assert.ok(contract.canApplyRoomEvent("city", "enter_venue"), "city can enter venue");
  assert.equal(contract.nextPlayerMode("city", "enter_venue"), "venue_lobby", "enter venue should move to venue lobby");
  assert.equal(contract.canApplyRoomEvent("city", "sit_table"), false, "city cannot sit table directly");
  assert.equal(contract.canApplyRoomEvent("table_seated", "enter_venue"), false, "seated player cannot enter another venue");
  assert.equal(contract.canApplyRoomEvent("venue_lobby", "sit_table", "spectator"), false, "spectator cannot sit table");
  assert.equal(contract.canApplyRoomEvent("city", "admin_watch", "player"), false, "player cannot start admin watch");
  assert.ok(contract.canApplyRoomEvent("city", "admin_watch", "admin"), "admin can start admin watch");
  assert.equal(contract.canApplyRoomEvent("disconnected", "chat_send"), false, "disconnected player cannot chat");

  assert.equal(contract.chatChannelForPlayerState({ mode: "city" }), contract.WORLD_CHANNEL_ID, "city chat should use default world channel");
  assert.equal(contract.chatChannelForPlayerState({ mode: "city", mapId: registry.MAP_IDS.DICE_CITY }), "world:dice-city", "dice city chat should use dice world channel");
  assert.equal(contract.chatChannelForPlayerState({ mode: "venue_lobby", venueChannelId: channels.venue }), channels.venue, "venue lobby chat should use venue channel");
  assert.equal(contract.chatChannelForPlayerState({ mode: "table_seated", tableId: channels.table }), channels.table, "table chat should use table channel");
  assert.equal(contract.chatChannelForPlayerState({ mode: "spectating", spectatorChannelId: channels.spectator }), channels.spectator, "spectator chat should use spectator channel");
  assert.equal(contract.chatChannelForPlayerState({ mode: "admin_observing", adminChannelId: channels.admin }), channels.admin, "admin chat should use admin channel");
  const cityState = createCityPlayerState({ mapVersion: contract.MAP_VERSION, venueSchemaVersion: contract.VENUE_SCHEMA_VERSION });
  assert.equal(cityState.mode, "city", "default player state should start in city mode");
  assert.equal(cityState.mapId, registry.MAP_IDS.BAEGEUM_CITY, "default player state should start in baegeum-city");
  assert.equal(cityState.sceneId, "city:baegeum", "default player state should carry the baegeum scene id");
  assert.equal(cityState.spawnId, "baegeum-main-spawn", "default player state should carry the baegeum spawn id");
  assert.equal(cityState.chatChannelId, contract.WORLD_CHANNEL_ID, "city player state should use world chat");
  const diceCityState = createCityPlayerState({ mapId: registry.MAP_IDS.DICE_CITY, mapVersion: contract.MAP_VERSION });
  assert.equal(diceCityState.sceneId, "city:dice", "dice player state should carry the dice scene id");
  assert.equal(diceCityState.spawnId, "dice-terminal-arrival", "dice player state should carry the dice spawn id");
  assert.equal(diceCityState.chatChannelId, "world:dice-city", "dice player state should use dice world chat");
  const venueState = createVenuePlayerState({ id: "blackjack-casino-01", name: "블랙잭카지노", channels }, cityState);
  assert.equal(venueState.mode, "venue_lobby", "entering a venue should move player state to venue lobby");
  assert.equal(venueState.chatChannelId, channels.venue, "venue player state should use venue chat");
  const tableState = createTablePlayerState(venueState);
  assert.equal(tableState.mode, "table_seated", "sitting should move player state to table mode");
  assert.equal(tableState.chatChannelId, channels.table, "table player state should use table chat");
  const lobbyState = createVenueLobbyPlayerState(tableState);
  assert.equal(lobbyState.mode, "venue_lobby", "leaving a table should return to venue lobby");
  assert.equal(lobbyState.chatChannelId, channels.venue, "leaving a table should restore venue chat");

  global.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };
  global.window = { dispatchEvent() {} };

  const chat = new WorldChat({ player: { id: "p_1", name: "YOU" }, clockSnapshot: () => ({ timeText: "08:00" }) });
  chat.submit("city-one");
  chat.setChannel(channels.venue, { systemText: "entered" });
  chat.submit("venue-one");

  assert.ok(chat.history(contract.WORLD_CHANNEL_ID).some((message) => message.text === "city-one"), "world history should keep city message");
  assert.ok(chat.history(channels.venue).some((message) => message.text === "venue-one"), "venue history should keep venue message");
  assert.equal(chat.history(channels.venue).some((message) => message.text === "city-one"), false, "venue history should not include city message");

  console.log("State protocol smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
