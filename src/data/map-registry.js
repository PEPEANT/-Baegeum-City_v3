import { CITY_ROLE_IDS } from "./city-district-contract.js";

export const MAP_IDS = Object.freeze({
  BAEGEUM_CITY: "baegeum-city",
  DICE_CITY: "dice-city"
});

export const SCENE_IDS = Object.freeze({
  BAEGEUM_CITY: "city:baegeum",
  DICE_CITY: "city:dice"
});

export const MULTIMAP_DRAFT_KEY_PREFIX = "baegeum-city-v2-world-editor-draft";
export const LEGACY_WORLD_EDITOR_DRAFT_KEY = "baegeum-city-v2-world-editor-draft-v0";

export const mapRegistry = Object.freeze({
  [MAP_IDS.BAEGEUM_CITY]: mapEntry({
    mapId: MAP_IDS.BAEGEUM_CITY,
    sceneId: SCENE_IDS.BAEGEUM_CITY,
    displayName: "배금시티",
    baseMapId: "baegeum-city-prototype",
    cityRoleId: CITY_ROLE_IDS.LIFE_HUB,
    defaultSpawnId: "baegeum-main-spawn",
    legacyDraftKey: LEGACY_WORLD_EDITOR_DRAFT_KEY
  }),
  [MAP_IDS.DICE_CITY]: mapEntry({
    mapId: MAP_IDS.DICE_CITY,
    sceneId: SCENE_IDS.DICE_CITY,
    displayName: "다이스시티",
    baseMapId: "dice-city-v0",
    cityRoleId: CITY_ROLE_IDS.GAMBLING_NIGHT,
    defaultSpawnId: "dice-terminal-arrival"
  })
});

export function allMapConfigs() {
  return Object.values(mapRegistry);
}

export function getMapConfig(mapId) {
  return mapRegistry[mapId] || null;
}

export function requireMapConfig(mapId) {
  const config = getMapConfig(mapId);
  if (!config) throw new Error(`Unknown mapId: ${mapId}`);
  return config;
}

export function worldEditorDraftKeyForMap(mapId) {
  return requireMapConfig(mapId).draftKey;
}

export function legacyDraftKeyForMap(mapId) {
  return requireMapConfig(mapId).legacyDraftKey || null;
}

export function shouldReadLegacyDraft(mapId) {
  return Boolean(legacyDraftKeyForMap(mapId));
}

function mapEntry(config) {
  return Object.freeze({
    ...config,
    draftKey: `${MULTIMAP_DRAFT_KEY_PREFIX}:${config.mapId}`,
    worldChannelId: `world:${config.mapId}`
  });
}
