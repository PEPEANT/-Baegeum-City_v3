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

(async () => {
  const round = await load("src/restored/games/blackjack-round-contract.js");
  const validation = round.validateRestoredBlackjackRoundContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const initial = round.createRestoredBlackjackRoundState({
    betChips: 20,
    roundId: "round:blackjack:smoke",
    tableId: "table:blackjack:main",
    shoe: ["10", "9", "8", "6", "7"]
  });
  assert.equal(initial.status, round.RESTORED_BLACKJACK_ROUND_STATUSES.READY);
  assert.equal(initial.shoe.length, 5, "provided shoe should be preserved");
  assert.equal(round.createRestoredBlackjackRoundBetEnvelope(initial).event.type, "gambling_bet_placed");

  const dealt = round.dealRestoredBlackjackRound(initial);
  assert.equal(dealt.status, round.RESTORED_BLACKJACK_ROUND_STATUSES.PLAYER_TURN);
  assert.equal(dealt.playerCards.length, 2);
  assert.equal(dealt.dealerCards.length, 2);
  assert.equal(dealt.shoe.length, 1, "initial deal should consume four cards");
  assert.equal(round.canHitRestoredBlackjackRound(dealt), true);
  assert.equal(round.canStandRestoredBlackjackRound(dealt), true);

  const settled = round.standRestoredBlackjackRound(dealt);
  assert.equal(settled.status, round.RESTORED_BLACKJACK_ROUND_STATUSES.SETTLED);
  assert.equal(settled.outcome.result, "dealer_bust");
  assert.equal(settled.shoe.length, 0, "dealer draw should consume the last card without resetting the shoe");
  const resultEnvelope = round.createRestoredBlackjackRoundResultEnvelope(settled);
  assert.equal(resultEnvelope.event.gameId, "blackjack");
  assert.equal(resultEnvelope.outcome.eventType, "gambling_win");
  assert.equal(resultEnvelope.effects.some((effect) => effect.type === "relationship_emotion_hook"), true);

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md"),
    read("docs/ai-working-state.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/blackjack-round-contract.js"));
  assert.ok(docs.includes("restored-blackjack-round-001"));
  assert.ok(docs.includes("ready -> player_turn -> dealer_turn -> settled"));

  console.log("Restored blackjack round contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
