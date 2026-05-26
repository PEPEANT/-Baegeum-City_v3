import { allMapConfigs, getMapConfig, MAP_IDS, requireMapConfig } from "./map-registry.js";

export const MAP_VERSION = "baegeum-city-v2-map-001";
export const VENUE_SCHEMA_VERSION = "venue-schema-001";
export const DEFAULT_MAP_ID = MAP_IDS.BAEGEUM_CITY;
export const WORLD_CHANNEL_ID = worldChannelIdForMap(DEFAULT_MAP_ID);

export const playerRoles = Object.freeze(["player", "spectator", "moderator", "admin", "owner"]);

export const playerModes = Object.freeze([
  "city",
  "venue_lobby",
  "table_seated",
  "spectating",
  "admin_observing",
  "disconnected"
]);

export const roomEvents = Object.freeze([
  "enter_venue",
  "leave_venue",
  "sit_table",
  "leave_table",
  "spectate_table",
  "stop_spectating",
  "admin_watch",
  "admin_unwatch",
  "chat_send",
  "position_update"
]);

export const channelPatterns = Object.freeze({
  world: /^world:[a-z0-9-]+$/,
  venue: /^venue:[a-z0-9-]+-\d+$/,
  table: /^table:[a-z0-9-]+-\d+:main$/,
  spectator: /^spectator:[a-z0-9-]+-\d+$/,
  admin: /^admin:[a-z0-9-]+-\d+$/
});

export const roomEventTransitions = Object.freeze({
  enter_venue: { from: ["city"], to: "venue_lobby" },
  leave_venue: { from: ["venue_lobby"], to: "city" },
  sit_table: { from: ["venue_lobby"], to: "table_seated" },
  leave_table: { from: ["table_seated"], to: "venue_lobby" },
  spectate_table: { from: ["city", "venue_lobby"], to: "spectating" },
  stop_spectating: { from: ["spectating"], to: "city" },
  admin_watch: { from: ["city", "venue_lobby"], to: "admin_observing", adminOnly: true },
  admin_unwatch: { from: ["admin_observing"], to: "city", adminOnly: true },
  chat_send: { from: playerModes.filter((mode) => mode !== "disconnected"), to: null },
  position_update: { from: ["city", "venue_lobby"], to: null }
});

export function isValidChannel(kind, channel) {
  const safeChannel = String(channel || "");
  if (kind === "world") return validWorldChannels().has(safeChannel);
  return Boolean(channelPatterns[kind]?.test(safeChannel));
}

export function validateVenueChannels(channels = {}) {
  const errors = [];
  for (const kind of Object.keys(channelPatterns)) {
    if (!isValidChannel(kind, channels[kind])) errors.push(`${kind}:${channels[kind] || "missing"}`);
  }
  return errors;
}

export function canApplyRoomEvent(mode, event, role = "player") {
  const transition = roomEventTransitions[event];
  if (!transition || !transition.from.includes(mode)) return false;
  if (transition.adminOnly && !isAdminRole(role)) return false;
  if (event === "sit_table" && role === "spectator") return false;
  return true;
}

export function nextPlayerMode(mode, event, role = "player") {
  if (!canApplyRoomEvent(mode, event, role)) return mode;
  return roomEventTransitions[event].to || mode;
}

export function chatChannelForPlayerState(state = {}) {
  const worldChannel = state.worldChannelId || worldChannelIdForMap(state.mapId);
  if (state.mode === "venue_lobby") return state.venueChannelId || state.venueId || worldChannel;
  if (state.mode === "table_seated") return state.tableId || worldChannel;
  if (state.mode === "spectating") return state.spectatorChannelId || state.spectatorTargetId || worldChannel;
  if (state.mode === "admin_observing") return state.adminChannelId || state.adminScopeId || worldChannel;
  return worldChannel;
}

export function runtimeMapDefaults(mapId = DEFAULT_MAP_ID) {
  const config = getMapConfig(mapId) || requireMapConfig(DEFAULT_MAP_ID);
  return {
    mapId: config.mapId,
    sceneId: config.sceneId,
    spawnId: config.defaultSpawnId,
    worldChannelId: config.worldChannelId
  };
}

export function worldChannelIdForMap(mapId = DEFAULT_MAP_ID) {
  const config = getMapConfig(mapId) || requireMapConfig(DEFAULT_MAP_ID);
  return config.worldChannelId;
}

function isAdminRole(role) {
  return role === "admin" || role === "owner" || role === "moderator";
}

function validWorldChannels() {
  return new Set(allMapConfigs().map((config) => config.worldChannelId));
}
