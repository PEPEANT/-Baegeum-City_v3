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
  const baccarat = await load("src/restored/games/baccarat-contract.js");
  const gambling = await load("src/restored/games/gambling-replacement-contract.js");
  const validation = baccarat.validateRestoredBaccaratContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const score = baccarat.scoreRestoredBaccaratHand(["ace", "9", "king"]);
  assert.equal(score.total, 0, "baccarat totals should keep only the ones digit");
  assert.equal(score.natural, false, "three-card totals should not be natural");

  const bet = baccarat.createRestoredBaccaratBetEnvelope({
    bet: { type: "banker", chips: 12 },
    venueId: "dice-baccarat-casino-01",
    tableId: "table:baccarat:main",
    roundId: "round:baccarat:smoke"
  });
  assert.equal(bet.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED);
  assert.equal(findEffect(bet, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, -12);

  const banker = baccarat.createRestoredBaccaratResultEnvelope({
    bet: { type: "banker", chips: 20 },
    playerCards: ["2", "4"],
    bankerCards: ["queen", "8"]
  });
  assert.equal(banker.round.outcome, baccarat.RESTORED_BACCARAT_OUTCOMES.BANKER);
  assert.equal(banker.round.payoutChips, 39);
  assert.equal(banker.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.WIN);

  const tiePush = baccarat.createRestoredBaccaratResultEnvelope({
    bet: { type: "player", chips: 10 },
    playerCards: ["4", "4"],
    bankerCards: ["king", "8"]
  });
  assert.equal(tiePush.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.REFUND);
  assert.equal(findEffect(tiePush, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 10);

  const tieLoss = baccarat.createRestoredBaccaratResultEnvelope({
    bet: { type: "tie", chips: 10 },
    playerCards: ["9", "queen"],
    bankerCards: ["3", "4"]
  });
  assert.equal(tieLoss.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.LOSS);
  assert.equal(findEffect(tieLoss, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 0);

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md"),
    read("docs/ai-working-state.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/baccarat-contract.js"));
  assert.ok(docs.includes("restored-baccarat-001"));
  assert.ok(docs.includes("player / banker / tie"));

  console.log("Restored baccarat contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
