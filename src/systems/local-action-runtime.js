import { WORLD_CHANNEL_ID } from "../data/runtime-contract.js";
import { ECONOMY_ENTRY_TYPES } from "./economy-ledger.js";
import {
  GAME_ACTION_TYPES,
  GAME_EFFECT_TYPES,
  canExecuteGameAction,
  createActionEnvelope
} from "./game-action-master.js";
import { createCityPlayerState } from "./player-state.js";
import { patchRuntimeState } from "./runtime-state-facade.js";

export function commitLocalGameAction(host, envelope) {
  host.executedActionRequestIds ||= new Set();
  host.actionHistory ||= [];
  const check = canCommitLocalGameAction(host, envelope);
  if (!check.ok) return { ok: false, reason: check.reason, envelope };
  host.executedActionRequestIds.add(envelope.action.requestId);
  host.actionHistory.push(envelope);
  if (host.actionHistory.length > 50) host.actionHistory.shift();
  host.lastActionEnvelope = envelope;
  publishActionEnvelope(host, envelope);
  return { ok: true, reason: "ok", envelope };
}

export function canCommitLocalGameAction(host, envelope) {
  host.executedActionRequestIds ||= new Set();
  return canExecuteGameAction(envelope.action, host.executedActionRequestIds);
}

export function createVenueEntryEnvelope({ entry, interior, playerState = {}, contract = {} }) {
  const channelId = interior.channels?.venue || WORLD_CHANNEL_ID;
  const worldChannelId = playerState.worldChannelId || contract.worldChannelId || WORLD_CHANNEL_ID;
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.ENTER_VENUE,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: `enter:${entry.door.id}`,
      targetId: entry.building.id,
      payload: {
        doorId: entry.door.id,
        targetSceneId: interior.id,
        venueName: interior.name
      },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.PLAYER_STATE_PATCH,
        targetId: "player:local",
        payload: {
          mode: "venue_lobby",
          scene: interior.id,
          sceneId: interior.id,
          citySceneId: playerState.sceneId || contract.sceneId || null,
          mapId: playerState.mapId || contract.mapId || null,
          spawnId: playerState.spawnId || contract.spawnId || null,
          worldChannelId,
          venueId: interior.id,
          venueName: interior.name,
          onlineRoomId: interior.onlineRoomId || channelId,
          venueChannelId: channelId,
          tableId: interior.channels?.table || null,
          spectatorChannelId: interior.channels?.spectator || null,
          adminChannelId: interior.channels?.admin || null,
          chatChannelId: channelId
        }
      },
      createChannelEffect(channelId, `${interior.name} 입장`)
    ]
  });
}

export function createVenueExitEnvelope({ interior, playerState = {}, contract = {} }) {
  const cityState = createCityPlayerState({
    ...contract,
    mapId: playerState.mapId || contract.mapId,
    spawnId: playerState.spawnId || contract.spawnId,
    mapVersion: contract.mapVersion || playerState.mapVersion,
    venueSchemaVersion: contract.venueSchemaVersion || playerState.venueSchemaVersion
  });
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.LEAVE_VENUE,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: `exit:${interior?.exit?.id || "venue"}`,
      targetId: interior?.id || "city",
      payload: { exitId: interior?.exit?.id || null },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.PLAYER_STATE_PATCH,
        targetId: "player:local",
        payload: cityState
      },
      createChannelEffect(cityState.chatChannelId, "도시 채팅으로 돌아옴")
    ]
  });
}

export function createTableSitEnvelope({ interior, prop, playerState = {}, contract = {} }) {
  const tableId = playerState.tableId || interior?.channels?.table || `${interior?.id || "venue"}:main`;
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.SIT_TABLE,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: `sit:${prop?.role || "main-table"}`,
      targetId: tableId,
      payload: { tableId, tableLabel: prop?.label || "게임 테이블" },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.PLAYER_STATE_PATCH,
        targetId: "player:local",
        payload: { mode: "table_seated", tableId, chatChannelId: tableId }
      },
      createChannelEffect(tableId, `${prop?.label || "게임 테이블"} 착석`)
    ]
  });
}

export function createTableLeaveEnvelope({ interior, playerState = {}, contract = {} }) {
  const channelId = playerState.venueChannelId || interior?.channels?.venue || WORLD_CHANNEL_ID;
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.LEAVE_TABLE,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: `leave:${playerState.tableId || "table"}`,
      targetId: playerState.tableId || interior?.channels?.table || null,
      payload: { tableId: playerState.tableId || null },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.PLAYER_STATE_PATCH,
        targetId: "player:local",
        payload: { mode: "venue_lobby", chatChannelId: channelId }
      },
      createChannelEffect(channelId, "테이블에서 일어남")
    ]
  });
}

export function createChipExchangeEnvelope({ interior, prop, playerState = {}, contract = {}, cash = 10000, chips = 10, direction = "cash_to_chips" }) {
  const cashAmount = Math.max(1, Math.round(Number(cash) || 10000));
  const chipAmount = Math.max(1, Math.round(Number(chips) || 10));
  const channelId = playerState.chatChannelId || interior?.channels?.venue || WORLD_CHANNEL_ID;
  const cashToChips = direction !== "chips_to_cash";
  const deltas = cashToChips ? { cash: -cashAmount, chips: chipAmount } : { cash: cashAmount, chips: -chipAmount };
  const text = cashToChips
    ? `현금 ${cashAmount.toLocaleString("ko-KR")}원 -> 칩 ${chipAmount}개`
    : `칩 ${chipAmount}개 -> 현금 ${cashAmount.toLocaleString("ko-KR")}원`;
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.EXCHANGE_CHIPS,
      actorId: "player:local",
      source: "pc_or_mobile_action",
      interactionId: `exchange:${prop?.role || "counter"}`,
      targetId: prop?.id || `${interior?.id || "venue"}:chip-counter`,
      payload: { cash: cashAmount, chips: chipAmount, direction },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY,
        targetId: "economy:local",
        payload: {
          type: ECONOMY_ENTRY_TYPES.CHIP_EXCHANGE,
          deltas,
          reason: prop?.label || "환전 ATM",
          channelId,
          venueId: playerState.venueId || interior?.id || null,
          mapVersion: contract.mapVersion || playerState.mapVersion || null
        }
      },
      {
        type: GAME_EFFECT_TYPES.UI_MESSAGE,
        targetId: "ui:toast",
        payload: { text }
      }
    ]
  });
}

export function createOddEvenBetReserveEnvelope({ interior, playerState = {}, contract = {}, pick, chips = 10 }) {
  const chipAmount = Math.max(1, Math.round(Number(chips) || 10));
  const tableId = playerState.tableId || interior?.channels?.table || `${interior?.id || "venue"}:main`;
  const channelId = playerState.chatChannelId || tableId;
  const safePick = pick === "even" ? "even" : "odd";
  const roundId = createLocalRoundId("odd-even");
  return createActionEnvelope({
    action: {
      type: GAME_ACTION_TYPES.BET_RESERVED,
      actorId: "player:local",
      source: "table_game_panel",
      interactionId: `bet:${tableId}`,
      targetId: tableId,
      payload: { gameType: "odd-even", pick: safePick, chips: chipAmount, tableId, roundId },
      context: actionContext(playerState, contract.mapVersion)
    },
    effects: [
      {
        type: GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY,
        targetId: "economy:local",
        payload: {
          type: ECONOMY_ENTRY_TYPES.BET_RESERVED,
          deltas: { chips: -chipAmount },
          reason: `홀짝 ${safePick === "odd" ? "홀" : "짝"} 베팅 예약`,
          channelId,
          venueId: playerState.venueId || interior?.id || null,
          tableId,
          roundId,
          mapVersion: contract.mapVersion || playerState.mapVersion || null
        }
      },
      {
        type: GAME_EFFECT_TYPES.UI_MESSAGE,
        targetId: "ui:toast",
        payload: { text: `홀짝 ${chipAmount}칩 예약` }
      }
    ]
  });
}

function createChannelEffect(channelId, systemText) {
  return {
    type: GAME_EFFECT_TYPES.CHAT_CHANNEL_CHANGE,
    targetId: channelId,
    payload: { channelId, systemText }
  };
}

function createLocalRoundId(gameType) {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  return `round:${gameType}:local:${stamp}`;
}

function actionContext(playerState, mapVersion) {
  return {
    scene: playerState.scene || null,
    sceneId: playerState.sceneId || null,
    mapId: playerState.mapId || null,
    spawnId: playerState.spawnId || null,
    channelId: playerState.chatChannelId || WORLD_CHANNEL_ID,
    venueId: playerState.venueId || null,
    tableId: playerState.tableId || null,
    mapVersion: mapVersion || playerState.mapVersion || null
  };
}

function publishActionEnvelope(host, envelope) {
  if (typeof window === "undefined") return;
  patchRuntimeState({ actionHistory: host.actionHistory, lastActionEnvelope: envelope });
  window.dispatchEvent(new CustomEvent("baegeum:game-action", { detail: envelope }));
}
