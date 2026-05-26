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
  const blackjack = await load("src/restored/games/blackjack-contract.js");
  const gambling = await load("src/restored/games/gambling-replacement-contract.js");

  const validation = blackjack.validateRestoredBlackjackContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const soft = blackjack.scoreRestoredBlackjackHand(["ace", "6"]);
  assert.equal(soft.total, 17, "ace and six should score soft 17");
  assert.equal(soft.soft, true, "ace and six should be soft");
  const hard = blackjack.scoreRestoredBlackjackHand(["ace", "king", "9"]);
  assert.equal(hard.total, 20, "ace should downgrade from 11 to 1 when needed");
  assert.equal(hard.busted, false, "ace downgrade should prevent bust");

  const natural = blackjack.compareRestoredBlackjackRound({
    betChips: 20,
    playerCards: ["A", "K"],
    dealerCards: ["9", "7"]
  });
  assert.equal(natural.result, blackjack.RESTORED_BLACKJACK_RESULTS.PLAYER_BLACKJACK);
  assert.equal(natural.payoutChips, 50, "natural blackjack should return stake plus 3:2 bonus after reservation");

  const bet = blackjack.createRestoredBlackjackBetEnvelope({
    betChips: 15,
    venueId: "dice-blackjack-casino-01",
    tableId: "table:blackjack:main",
    roundId: "round:blackjack:test"
  });
  const betLedger = findEffect(bet, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  assert.equal(bet.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED);
  assert.equal(betLedger.payload.entryType, "bet_reserved");
  assert.equal(betLedger.payload.deltas.chips, -15);

  const loss = blackjack.createRestoredBlackjackResultEnvelope({
    betChips: 15,
    playerCards: ["10", "9"],
    dealerCards: ["king", "queen"]
  });
  const lossLedger = findEffect(loss, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  assert.equal(loss.outcome.eventType, gambling.RESTORED_GAMBLING_EVENT_TYPES.LOSS);
  assert.equal(lossLedger.payload.entryType, "bet_settled");
  assert.equal(lossLedger.payload.deltas.chips, 0);

  const push = blackjack.createRestoredBlackjackResultEnvelope({
    betChips: 15,
    playerCards: ["10", "9"],
    dealerCards: ["king", "9"]
  });
  assert.equal(push.outcome.eventType, gambling.RESTORED_GAMBLING_EVENT_TYPES.REFUND);
  assert.equal(findEffect(push, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 15);

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/blackjack-contract.js"));
  assert.ok(docs.includes("restored-blackjack-001"));
  assert.ok(docs.includes("bet_reserved"));
  assert.ok(docs.includes("bet_settled"));
  assert.ok(docs.includes("bet_refunded"));

  console.log("Restored blackjack contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
