import { getMapTransition, validateMapTransition } from "../data/map-transitions.js";
import { GAME_ACTION_TYPES, GAME_EFFECT_TYPES, createActionEnvelope } from "./game-action-master.js";
import { createCityPlayerState } from "./player-state.js";

export function createMapTransitionEnvelope({ transition, playerState = {}, contract = {} } = {}) {
  const safeTransition = resolveTransition(transition);
  const nextState = createMapTransitionPlayerState(safeTransition, playerState, contract);
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.MAP_TRANSITION,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: safeTransition.id,
      targetId: safeTransition.targetMapId,
      payload: {
        objectId: safeTransition.objectId,
        from: safeTransition.from || safeTransition.fromMapId,
        fromMapId: safeTransition.fromMapId,
        targetMapId: safeTransition.targetMapId,
        targetSpawnId: safeTransition.targetSpawnId
      },
      context: {
        scene: playerState.scene || null,
        sceneId: playerState.sceneId || null,
        mapId: playerState.mapId || null,
        spawnId: playerState.spawnId || null,
        channelId: playerState.chatChannelId || null,
        mapVersion: contract.mapVersion || playerState.mapVersion || null
      }
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.PLAYER_STATE_PATCH,
        targetId: "player:local",
        payload: nextState
      },
      {
        type: GAME_EFFECT_TYPES.CHAT_CHANNEL_CHANGE,
        targetId: nextState.chatChannelId,
        payload: { channelId: nextState.chatChannelId, systemText: `${safeTransition.label} 도착` }
      }
    ]
  });
}

export function createMapTransitionPlayerState(transition, playerState = {}, contract = {}) {
  assertMapTransitionAllowed(transition, playerState);
  return createCityPlayerState({
    mapId: transition.targetMapId,
    spawnId: transition.targetSpawnId,
    mapVersion: contract.mapVersion || playerState.mapVersion || "",
    venueSchemaVersion: contract.venueSchemaVersion || playerState.venueSchemaVersion || ""
  });
}

export function assertMapTransitionAllowed(transition = {}, playerState = {}) {
  const errors = validateMapTransition(transition);
  if (errors.length) throw new Error(`Invalid map transition: ${errors.join(",")}`);
  if (playerState.mapId && playerState.mapId !== transition.fromMapId) {
    throw new Error(`Map transition source mismatch: ${playerState.mapId} -> ${transition.fromMapId}`);
  }
}

function resolveTransition(transition) {
  const resolved = typeof transition === "string" ? getMapTransition(transition) : getMapTransition(transition?.id) || transition;
  if (!resolved) throw new Error("Map transition is required");
  return resolved;
}
