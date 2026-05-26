import { cityMap } from "../data/city-map.js";
import { createVenueMetadata, gamblingVenues, mergeVenueMetadata, readStoredVenueMetadata } from "../data/gambling-venues.js";
import { allMapConfigs, MAP_IDS, requireMapConfig } from "../data/map-registry.js";
import { transitionsFromMap } from "../data/map-transitions.js";
import { MAP_VERSION, VENUE_SCHEMA_VERSION } from "../data/runtime-contract.js";

export function createRuntimeMap(source) {
  const map = cloneMap(source);
  const mapConfig = mapConfigForSource(map);
  map.name = map.name || "Iron Line 원본 도시맵";
  map.sourceMapVersion = map.mapVersion || "";
  map.mapVersion = MAP_VERSION;
  map.venueSchemaVersion = VENUE_SCHEMA_VERSION;
  map.mapId = mapConfig.mapId;
  map.sceneId = mapConfig.sceneId;
  map.defaultSpawnId = mapConfig.defaultSpawnId;
  map.worldChannelId = mapConfig.worldChannelId;
  map.playerSpawn = map.playerSpawn || map.spawns?.player || cityMap.playerSpawn;
  map.mapTransitions = createMapTransitions(map, mapConfig);
  map.buildings = createBuildingLinks(map);
  return map;
}

export function createRuntimeInterior(base, entry) {
  const building = entry.building;
  const source = base || genericInterior(entry.door.targetSceneId, building);
  return {
    ...source,
    name: building.sign || source.name,
    gameType: building.gameType || source.gameType,
    venueType: building.venueType || source.venueType,
    onlineRoomId: building.onlineRoomId || source.onlineRoomId,
    channels: building.channels || source.channels,
    minBet: building.minBet ?? source.minBet,
    exit: { ...source.exit, id: `${building.id.replace(/^bg-/, "")}-exit`, label: `${building.sign || source.name} 밖으로` }
  };
}

function cloneMap(source) {
  return JSON.parse(JSON.stringify(source));
}

function mapConfigForSource(map) {
  return allMapConfigs().find((config) => config.baseMapId === map.id || config.mapId === map.mapId)
    || requireMapConfig(MAP_IDS.BAEGEUM_CITY);
}

function createMapTransitions(map, mapConfig) {
  return transitionsFromMap(mapConfig.mapId).map((transition) => placeTransition(transition, map.playerSpawn));
}

function placeTransition(transition, spawn) {
  if (transition.anchor !== "player_spawn") return transition;
  const rect = {
    ...transition.rect,
    x: Math.round(spawn.x + (transition.rectOffset?.x || 0)),
    y: Math.round(spawn.y + (transition.rectOffset?.y || 0))
  };
  return {
    ...transition,
    rect,
    interactionPoint: {
      x: Math.round(spawn.x + (transition.interactionOffset?.x || 0)),
      y: Math.round(spawn.y + (transition.interactionOffset?.y || 0))
    }
  };
}

function createBuildingLinks(map) {
  const buildingObstacles = (map.obstacles || []).filter((item) => item.kind === "building" && item.objectKind !== "building_shell");
  if (!buildingObstacles.length) return map.buildings || [];
  const stored = new Map(readStoredVenueMetadata().map((item) => [item.id, item]));
  const generatedVenues = buildingObstacles.map((obstacle, index) => {
    const venue = gamblingVenues[index % gamblingVenues.length];
    const base = createVenueMetadata(venue, obstacle, index);
    const meta = mergeVenueMetadata(base, stored.get(base.id));
    const doorX = meta.entrance.x;
    const doorY = meta.entrance.y;
    return {
      id: `bg-${meta.id}`,
      name: meta.name,
      sign: meta.sign,
      signAnchor: meta.signAnchor,
      gameType: meta.gameType,
      venueType: meta.venueType,
      minBet: meta.minBet,
      onlineRoomId: meta.onlineRoomId,
      channels: meta.channels,
      districtId: meta.districtId,
      rect: obstacle,
      doors: [{ id: meta.doorId, x: doorX, y: doorY, targetSceneId: meta.interiorId, returnSpawn: { x: doorX, y: doorY + 42 } }]
    };
  });
  return [...(map.buildings || []), ...generatedVenues];
}

function genericInterior(id, building) {
  return {
    id,
    name: building.sign || "도박장",
    spawn: { x: 520, y: 610 },
    exit: { id: `${id}-exit`, x: 520, y: 670 },
    bounds: { x: 120, y: 90, w: 820, h: 600 },
    walls: [
      { x: 120, y: 90, w: 820, h: 34 },
      { x: 120, y: 656, w: 360, h: 34 },
      { x: 560, y: 656, w: 380, h: 34 },
      { x: 120, y: 90, w: 34, h: 600 },
      { x: 906, y: 90, w: 34, h: 600 }
    ],
    props: [{ x: 350, y: 185, w: 330, h: 150, label: "게임 테이블", role: "main-table" }]
  };
}
