"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function findEffect(envelope, type) {
  return envelope.effects.find((effect) => effect.type === type);
}

(async () => {
  const contract = await load("src/restored/games/gambling-replacement-contract.js");
  const validation = contract.validateRestoredGamblingReplacementContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED, "gambling_bet_placed");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.WIN, "gambling_win");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.LOSS, "gambling_loss");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.DEBT_CREATED, "debt_created");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_POSTED, "collateral_posted");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_REDEEMED, "collateral_redeemed");
  assert.equal(contract.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_SOLD, "collateral_sold");

  const placed = contract.createRestoredGamblingEffects({
    type: contract.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    gameId: "blackjack",
    venueId: "dice-blackjack-casino-01",
    tableId: "table:blackjack:main",
    roundId: "round:blackjack:001",
    amountChips: 25,
    emotionTags: ["risk"],
    relationshipHooks: ["partner_saw_bet"]
  });
  const placedLedger = findEffect(placed, contract.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  assert.equal(placed.event.gameId, "blackjack", "known game ids should be preserved");
  assert.equal(placedLedger.payload.entryType, "bet_reserved", "bet placed should use reservation ledger vocabulary");
  assert.equal(placedLedger.payload.deltas.chips, -25, "bet placed should reserve chips");
  assert.ok(findEffect(placed, contract.RESTORED_GAMBLING_EFFECT_TYPES.RELATIONSHIP_EMOTION_HOOK), "risk hooks should stay separate from ledger effects");

  const win = contract.createRestoredGamblingEffects({
    type: contract.RESTORED_GAMBLING_EVENT_TYPES.WIN,
    gameId: "roulette",
    amountChips: 100,
    authority: contract.RESTORED_GAMBLING_AUTHORITY.SERVER_REQUIRED
  });
  assert.equal(findEffect(win, contract.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 100);
  assert.ok(findEffect(win, contract.RESTORED_GAMBLING_EFFECT_TYPES.ONLINE_AUTHORITY_REQUEST), "server-required events should request online authority");

  const loss = contract.createRestoredGamblingEffects({ type: contract.RESTORED_GAMBLING_EVENT_TYPES.LOSS, amountChips: 100 });
  assert.equal(findEffect(loss, contract.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 0, "loss settlement should not pay chips after reservation");

  const debt = contract.createRestoredGamblingEffects({ type: contract.RESTORED_GAMBLING_EVENT_TYPES.DEBT_CREATED, debtAmount: 5000 });
  assert.equal(debt.effects.length, 1, "debt is an event vocabulary only until a debt ledger contract exists");

  const doc = read("docs/baegeum-city-v2-gambling-venues.md");
  assert.ok(doc.includes("src/restored/games/gambling-replacement-contract.js"));
  assert.ok(doc.includes("gambling_bet_placed"));
  assert.ok(doc.includes("gambling_win"));
  assert.ok(doc.includes("gambling_loss"));
  assert.ok(doc.includes("debt_created"));
  assert.ok(doc.includes("collateral_posted"));
  assert.ok(doc.includes("collateral_redeemed"));
  assert.ok(doc.includes("collateral_sold"));

  console.log("Restored gambling replacement contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
