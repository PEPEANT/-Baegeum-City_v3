import { chatChannelForPlayerState, runtimeMapDefaults, WORLD_CHANNEL_ID } from "../data/runtime-contract.js";

export function createCityPlayerState({ mapId, spawnId, mapVersion = "", venueSchemaVersion = "" } = {}) {
  const mapDefaults = runtimeMapDefaults(mapId);
  const state = {
    mode: "city",
    scene: "city",
    sceneId: mapDefaults.sceneId,
    mapId: mapDefaults.mapId,
    spawnId: spawnId || mapDefaults.spawnId,
    worldChannelId: mapDefaults.worldChannelId,
    venueId: null,
    venueName: null,
    onlineRoomId: null,
    venueChannelId: null,
    tableId: null,
    spectatorChannelId: null,
    adminChannelId: null,
    chatChannelId: WORLD_CHANNEL_ID,
    mapVersion,
    venueSchemaVersion
  };
  state.chatChannelId = chatChannelForPlayerState(state);
  return state;
}

export function createVenuePlayerState(interior = {}, contract = {}) {
  const mapDefaults = runtimeMapDefaults(contract.mapId);
  const state = {
    mode: "venue_lobby",
    scene: interior.id || "venue",
    sceneId: interior.id || "venue",
    citySceneId: contract.sceneId || mapDefaults.sceneId,
    mapId: contract.mapId || mapDefaults.mapId,
    spawnId: contract.spawnId || mapDefaults.spawnId,
    worldChannelId: contract.worldChannelId || mapDefaults.worldChannelId,
    venueId: interior.id || null,
    venueName: interior.name || null,
    onlineRoomId: interior.onlineRoomId || interior.channels?.venue || null,
    venueChannelId: interior.channels?.venue || null,
    tableId: interior.channels?.table || null,
    spectatorChannelId: interior.channels?.spectator || null,
    adminChannelId: interior.channels?.admin || null,
    chatChannelId: WORLD_CHANNEL_ID,
    mapVersion: contract.mapVersion || "",
    venueSchemaVersion: contract.venueSchemaVersion || ""
  };
  state.chatChannelId = chatChannelForPlayerState(state);
  return state;
}

export function createTablePlayerState(venueState = {}) {
  const fallbackChannel = venueState.worldChannelId || WORLD_CHANNEL_ID;
  const state = {
    ...venueState,
    mode: "table_seated",
    chatChannelId: venueState.tableId || fallbackChannel
  };
  return state;
}

export function createVenueLobbyPlayerState(tableState = {}) {
  const fallbackChannel = tableState.worldChannelId || WORLD_CHANNEL_ID;
  const state = {
    ...tableState,
    mode: "venue_lobby",
    chatChannelId: tableState.venueChannelId || tableState.venueId || fallbackChannel
  };
  return state;
}
