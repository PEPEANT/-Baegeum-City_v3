import { dist } from "../core/math.js";
import { INTERACTION_TYPES, createInteractionCandidate } from "./interaction-master.js";
import {
  createTableLeaveEnvelope,
  createTableSitEnvelope
} from "./local-action-runtime.js";
import { getRuntimeExchangeAtm } from "./runtime-state-facade.js";

export const CHIP_EXCHANGE_CASH = 10000;
export const CHIP_EXCHANGE_CHIPS = 10;

export function findInteriorInteraction(game) {
  if (game.playerState?.mode === "table_seated") {
    const candidate = createInteractionCandidate({ type: INTERACTION_TYPES.EXIT, targetId: game.playerState.tableId, targetLabel: "게임 테이블", label: "일어나기" });
    return { kind: "leave_table", label: candidate.label, target: candidate.targetLabel, candidate };
  }
  const exit = game.currentInterior?.exit;
  if (!exit) return null;
  if (dist(game.player.x, game.player.y, exit.x, exit.y) < 72) {
    const candidate = createInteractionCandidate({ type: INTERACTION_TYPES.EXIT, targetId: exit.id, targetLabel: "출구" });
    return { kind: "exit", label: candidate.label, target: candidate.targetLabel, candidate, nearbyDoor: { door: exit, building: { name: "출구" } } };
  }
  const prop = nearestChipExchangeProp(game);
  if (!prop) return tableInteraction(game);
  const candidate = createInteractionCandidate({
    type: INTERACTION_TYPES.USE,
    id: `use:${prop.id || "chip-counter"}`,
    targetId: prop.id || "chip-counter",
    targetLabel: "현금/칩 교환",
    label: "환전",
    enabled: true,
    disabledReason: null
  });
  return {
    kind: "chip_exchange",
    label: candidate.label,
    target: candidate.targetLabel,
    disabled: !candidate.enabled,
    disabledReason: candidate.disabledReason,
    candidate,
    prop
  };
}

export function runInteriorInteraction(game, interaction) {
  if (!interaction) return false;
  if (interaction.kind === "exit") return game.exitInterior();
  if (interaction.kind === "sit_table") return game.sitTable(createTableSitEnvelope({
    interior: game.currentInterior,
    prop: interaction.prop,
    playerState: game.playerState,
    contract: game.contract
  }));
  if (interaction.kind === "leave_table") return game.leaveTable(createTableLeaveEnvelope({
    interior: game.currentInterior,
    playerState: game.playerState,
    contract: game.contract
  }));
  if (interaction.kind !== "chip_exchange") return false;
  return openExchangeAtm(game, interaction);
}

function nearestChipExchangeProp(game) {
  return (game.currentInterior.props || []).find((prop) =>
    ["exchange-atm", "main-table", "counter"].includes(prop.role)
    && (prop.role === "exchange-atm" || game.currentInterior?.gameType === "exchange")
    && dist(game.player.x, game.player.y, prop.x + prop.w / 2, prop.y + prop.h / 2) < 150
  ) || null;
}

function openExchangeAtm(game, interaction) {
  const atm = getRuntimeExchangeAtm();
  if (!atm?.open) {
    game.chat.addSystemMessage("환전 ATM UI 준비 중", { broadcast: false });
    return false;
  }
  atm.open({ game, prop: interaction.prop });
  return true;
}

function tableInteraction(game) {
  const prop = nearestTableProp(game);
  if (!prop) return null;
  const candidate = createInteractionCandidate({
    type: INTERACTION_TYPES.SIT_TABLE,
    id: `sit:${prop.id || "main-table"}`,
    targetId: game.playerState?.tableId || game.currentInterior?.channels?.table,
    targetLabel: prop.label || "게임 테이블"
  });
  return { kind: "sit_table", label: candidate.label, target: candidate.targetLabel, candidate, prop };
}

function nearestTableProp(game) {
  if (game.currentInterior?.gameType === "exchange") return null;
  return (game.currentInterior?.props || []).find((prop) =>
    prop.role === "main-table"
    && dist(game.player.x, game.player.y, prop.x + prop.w / 2, prop.y + prop.h / 2) < 150
  ) || null;
}
