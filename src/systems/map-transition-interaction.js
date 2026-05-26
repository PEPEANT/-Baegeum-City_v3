import { dist } from "../core/math.js";
import { INTERACTION_TYPES, createInteractionCandidate } from "./interaction-master.js";

export function findMapTransitionInteraction(game) {
  if (game.scene !== "city") return null;
  const transition = nearestMapTransition(game.player, game.map?.mapTransitions || []);
  if (!transition) return null;
  const candidate = createInteractionCandidate({
    type: INTERACTION_TYPES.MAP_TRANSITION,
    id: `map-transition:${transition.objectId}`,
    targetId: transition.objectId,
    targetLabel: transition.label,
    label: transition.interactionLabel
  });
  return {
    kind: "map_transition",
    label: candidate.label,
    target: candidate.targetLabel,
    disabled: !candidate.enabled,
    disabledReason: candidate.disabledReason,
    candidate,
    transition
  };
}

export function runMapTransitionInteraction(game, interaction) {
  if (!interaction || interaction.kind !== "map_transition") return false;
  return game.transitionMap(interaction.transition);
}

function nearestMapTransition(player, transitions) {
  let nearest = null;
  for (const transition of transitions) {
    const point = transition.interactionPoint || centerOf(transition.rect);
    const distance = dist(player.x, player.y, point.x, point.y);
    const radius = transition.interactionRadius || 90;
    if (distance <= radius && (!nearest || distance < nearest.distance)) {
      nearest = { ...transition, distance };
    }
  }
  return nearest;
}

function centerOf(rect = {}) {
  return { x: (rect.x || 0) + (rect.w || 0) / 2, y: (rect.y || 0) + (rect.h || 0) / 2 };
}
