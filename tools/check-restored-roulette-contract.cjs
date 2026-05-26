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
  const roulette = await load("src/restored/games/roulette-contract.js");
  const gambling = await load("src/restored/games/gambling-replacement-contract.js");
  const validation = roulette.validateRestoredRouletteContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  assert.equal(roulette.getRestoredRouletteColor(0), roulette.RESTORED_ROULETTE_COLORS.GREEN);
  assert.equal(roulette.getRestoredRouletteColor(1), roulette.RESTORED_ROULETTE_COLORS.RED);
  assert.equal(roulette.getRestoredRouletteColor(2), roulette.RESTORED_ROULETTE_COLORS.BLACK);

  const bet = roulette.createRestoredRouletteBetEnvelope({
    bet: { type: "red", chips: 12 },
    venueId: "dice-roulette-casino-01",
    tableId: "table:roulette:main",
    roundId: "round:roulette:smoke"
  });
  assert.equal(bet.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED);
  assert.equal(findEffect(bet, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, -12);

  const win = roulette.createRestoredRouletteResultEnvelope({
    bet: { type: "dozen", dozen: 2, chips: 10 },
    resultNumber: 17
  });
  assert.equal(win.spin.won, true);
  assert.equal(win.spin.payoutChips, 30);
  assert.equal(win.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.WIN);
  assert.equal(findEffect(win, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.entryType, "bet_settled");

  const loss = roulette.createRestoredRouletteResultEnvelope({
    bet: { type: "even", chips: 10 },
    resultNumber: 0
  });
  assert.equal(loss.spin.won, false);
  assert.equal(loss.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.LOSS);
  assert.equal(findEffect(loss, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 0);

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md"),
    read("docs/ai-working-state.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/roulette-contract.js"));
  assert.ok(docs.includes("restored-roulette-001"));
  assert.ok(docs.includes("straight / red / black / odd / even / low / high / dozen / column"));

  console.log("Restored roulette contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
