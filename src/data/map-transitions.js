import { getMapConfig, MAP_IDS } from "./map-registry.js";

export const MAP_TRANSITION_OBJECT_TYPE = "map_transition";

export const mapTransitions = Object.freeze([
  freezeTransition({
    id: "transition:baegeum-to-dice-bus-terminal",
    type: MAP_TRANSITION_OBJECT_TYPE,
    from: MAP_IDS.BAEGEUM_CITY,
    objectId: "intercity-bus-terminal",
    label: "시외버스터미널",
    fromMapId: MAP_IDS.BAEGEUM_CITY,
    targetMapId: MAP_IDS.DICE_CITY,
    targetSpawnId: "dice-terminal-arrival",
    interactionLabel: "다이스시티로 이동",
    interactionRadius: 120,
    anchor: "player_spawn",
    rectOffset: { x: -180, y: -250 },
    rect: { x: 300, y: 3740, w: 360, h: 150 },
    interactionPoint: { x: 450, y: 3920 },
    interactionOffset: { x: 0, y: 0 }
  }),
  freezeTransition({
    id: "transition:dice-to-baegeum-bus-terminal",
    type: MAP_TRANSITION_OBJECT_TYPE,
    from: MAP_IDS.DICE_CITY,
    objectId: "dice-return-bus-terminal",
    label: "시외버스터미널",
    fromMapId: MAP_IDS.DICE_CITY,
    targetMapId: MAP_IDS.BAEGEUM_CITY,
    targetSpawnId: "baegeum-main-spawn",
    interactionLabel: "배금시티로 이동",
    interactionRadius: 120,
    anchor: "player_spawn",
    rectOffset: { x: -180, y: -250 },
    rect: { x: 340, y: 2370, w: 360, h: 150 },
    interactionPoint: { x: 520, y: 2620 },
    interactionOffset: { x: 0, y: 0 }
  })
]);

export function allMapTransitions() {
  return mapTransitions;
}

export function getMapTransition(id) {
  return mapTransitions.find((transition) => transition.id === id) || null;
}

export function transitionsFromMap(mapId) {
  return mapTransitions.filter((transition) => transition.fromMapId === mapId);
}

export function validateMapTransition(transition = {}) {
  const errors = [];
  if (transition.type !== MAP_TRANSITION_OBJECT_TYPE) errors.push("type");
  if (!transition.objectId) errors.push("objectId");
  if (transition.from && transition.from !== transition.fromMapId) errors.push("from");
  if (!getMapConfig(transition.fromMapId)) errors.push("fromMapId");
  const target = getMapConfig(transition.targetMapId);
  if (!target) errors.push("targetMapId");
  if (target && transition.targetSpawnId !== target.defaultSpawnId) errors.push("targetSpawnId");
  for (const forbidden of ["fare", "ticketItemId", "scheduleId", "onlineRoomId"]) {
    if (Object.prototype.hasOwnProperty.call(transition, forbidden)) errors.push(forbidden);
  }
  return errors;
}

function freezeTransition(transition) {
  return Object.freeze(transition);
}
