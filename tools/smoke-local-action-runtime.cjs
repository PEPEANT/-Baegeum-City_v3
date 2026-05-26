"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const runtime = await load("src/systems/local-action-runtime.js");
  const gameMaster = await load("src/systems/game-action-master.js");
  const contract = await load("src/data/runtime-contract.js");
  const context = createContext(contract.WORLD_CHANNEL_ID);

  testVenueEntryExit(runtime, gameMaster, context);
  testChipExchange(runtime, gameMaster, context);
  testTableFlow(runtime, gameMaster, context);
  testOddEvenBetReservation(runtime, gameMaster, context);

  console.log("Local action runtime smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function createContext(worldChannelId) {
  const interior = {
    id: "blackjack-casino-01",
    name: "블랙젝카지노",
    onlineRoomId: "venue:blackjack-casino-01",
    channels: {
      venue: "venue:blackjack-casino-01",
      table: "table:blackjack-casino-01:main",
      spectator: "spectator:blackjack-casino-01",
      admin: "admin:blackjack-casino-01"
    }
  };
  return {
    host: {},
    entry: {
      building: { id: "bg-blackjack-casino-01" },
      door: { id: "door:blackjack-casino-01", targetSceneId: "blackjack-casino-01" }
    },
    interior,
    playerState: { mode: "city", scene: "city", mapId: "baegeum-city", chatChannelId: worldChannelId },
    contract: { mapId: "baegeum-city", mapVersion: "baegeum-city-v2-map-001" }
  };
}

function testVenueEntryExit(runtime, gameMaster, context) {
  const { commitLocalGameAction, createVenueEntryEnvelope, createVenueExitEnvelope } = runtime;
  const { GAME_ACTION_TYPES, GAME_EFFECT_TYPES } = gameMaster;
  const enter = createVenueEntryEnvelope(context);
  assert.equal(enter.action.type, GAME_ACTION_TYPES.ENTER_VENUE, "entry should become enter_venue action");
  assert.ok(enter.effects.some((effect) => effect.type === GAME_EFFECT_TYPES.PLAYER_STATE_PATCH), "entry should patch player state");
  assert.ok(enter.effects.some((effect) => effect.payload.channelId === context.interior.channels.venue), "entry should change channel");
  assert.equal(commitLocalGameAction(context.host, enter).ok, true, "first action commit should pass");
  assert.equal(commitLocalGameAction(context.host, enter).reason, "duplicate_action", "same request should be deduped");

  const exit = createVenueExitEnvelope({ ...context, playerState: { mode: "venue_lobby", scene: context.interior.id } });
  assert.equal(exit.action.type, GAME_ACTION_TYPES.LEAVE_VENUE, "exit should become leave_venue action");
  assert.ok(exit.effects.some((effect) => effect.payload.channelId === context.playerState.chatChannelId), "exit should return to world channel");
}

function testChipExchange(runtime, gameMaster, context) {
  const { createChipExchangeEnvelope } = runtime;
  const { GAME_ACTION_TYPES, GAME_EFFECT_TYPES } = gameMaster;
  const venueState = { mode: "venue_lobby", scene: context.interior.id, chatChannelId: context.interior.channels.venue, venueId: context.interior.id };
  const exchange = createChipExchangeEnvelope({
    ...context,
    prop: { id: "object:chip-counter-001", role: "main-table" },
    playerState: venueState,
    cash: 10000,
    chips: 10
  });
  assert.equal(exchange.action.type, GAME_ACTION_TYPES.EXCHANGE_CHIPS, "chip counter should create exchange action");
  assert.ok(exchange.effects.some((effect) => effect.type === GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY), "chip exchange should create ledger effect");
  assert.equal(findLedgerEffect(exchange).payload.deltas.cash, -10000, "chip exchange should spend cash");

  const cashOut = createChipExchangeEnvelope({
    ...context,
    prop: { id: "object:exchange-atm-001", role: "exchange-atm", label: "환전 ATM" },
    playerState: venueState,
    cash: 50000,
    chips: 50,
    direction: "chips_to_cash"
  });
  const cashOutLedger = findLedgerEffect(cashOut);
  assert.equal(cashOutLedger.payload.deltas.cash, 50000, "chips_to_cash should add cash");
  assert.equal(cashOutLedger.payload.deltas.chips, -50, "chips_to_cash should remove chips");
}

function testTableFlow(runtime, gameMaster, context) {
  const { createTableLeaveEnvelope, createTableSitEnvelope } = runtime;
  const { GAME_ACTION_TYPES } = gameMaster;
  const sit = createTableSitEnvelope({
    ...context,
    prop: { role: "main-table", label: "블랙잭 테이블" },
    playerState: { mode: "venue_lobby", scene: context.interior.id, tableId: context.interior.channels.table, venueChannelId: context.interior.channels.venue }
  });
  assert.equal(sit.action.type, GAME_ACTION_TYPES.SIT_TABLE, "main table should create sit_table action");
  assert.ok(sit.effects.some((effect) => effect.payload.mode === "table_seated"), "sit table should patch player mode");

  const leaveTable = createTableLeaveEnvelope({
    ...context,
    playerState: { mode: "table_seated", tableId: context.interior.channels.table, venueChannelId: context.interior.channels.venue }
  });
  assert.equal(leaveTable.action.type, GAME_ACTION_TYPES.LEAVE_TABLE, "leaving table should create leave_table action");
  assert.ok(leaveTable.effects.some((effect) => effect.payload.mode === "venue_lobby"), "leave table should return to venue lobby");
}

function testOddEvenBetReservation(runtime, gameMaster, context) {
  const { createOddEvenBetReserveEnvelope } = runtime;
  const { GAME_ACTION_TYPES } = gameMaster;
  const oddEvenBet = createOddEvenBetReserveEnvelope({
    ...context,
    interior: { ...context.interior, gameType: "odd-even" },
    playerState: {
      mode: "table_seated",
      scene: context.interior.id,
      venueId: context.interior.id,
      tableId: context.interior.channels.table,
      chatChannelId: context.interior.channels.table
    },
    pick: "odd",
    chips: 10
  });
  const betLedger = findLedgerEffect(oddEvenBet);
  assert.equal(oddEvenBet.action.type, GAME_ACTION_TYPES.BET_RESERVED, "odd-even start should create bet_reserved action");
  assert.equal(oddEvenBet.action.payload.pick, "odd", "odd-even bet should keep the selected pick");
  assert.equal(betLedger.payload.type, "bet_reserved", "odd-even bet should reserve ledger chips");
  assert.equal(betLedger.payload.deltas.chips, -10, "bet reservation should spend chips only");
  assert.equal(betLedger.payload.deltas.cash || 0, 0, "bet reservation should not touch cash");
}

function findLedgerEffect(envelope) {
  return envelope.effects.find((effect) => effect.type === "economy_ledger_entry");
}
