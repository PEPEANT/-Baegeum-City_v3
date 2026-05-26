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
  const gambling = await load("src/restored/games/gambling-replacement-contract.js");
  const slot = await load("src/restored/games/slot-contract.js");
  const validation = slot.validateRestoredSlotContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const normalized = slot.normalizeRestoredSlotReels(["SEVEN", "nope", "bar"]);
  assert.deepEqual(normalized, ["seven", "blank", "bar"]);

  const bet = slot.createRestoredSlotBetEnvelope({
    bet: { chips: 12 },
    venueId: "dice-slot-casino-01",
    tableId: "machine:slot:main",
    roundId: "round:slot:smoke"
  });
  assert.equal(bet.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED);
  assert.equal(findEffect(bet, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, -12);

  const jackpot = slot.createRestoredSlotResultEnvelope({
    bet: { chips: 4 },
    symbols: ["seven", "seven", "seven"]
  });
  assert.equal(jackpot.spin.result, slot.RESTORED_SLOT_RESULTS.JACKPOT);
  assert.equal(jackpot.spin.payoutChips, 200);
  assert.equal(jackpot.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.WIN);

  const sevenPair = slot.createRestoredSlotResultEnvelope({
    bet: { chips: 4 },
    symbols: ["seven", "blank", "seven"]
  });
  assert.equal(sevenPair.spin.result, slot.RESTORED_SLOT_RESULTS.PAIR);
  assert.equal(sevenPair.spin.payoutChips, 12);

  const loss = slot.createRestoredSlotResultEnvelope({
    bet: { chips: 4 },
    symbols: ["lemon", "bar", "bell"]
  });
  assert.equal(loss.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.LOSS);
  assert.equal(findEffect(loss, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY).payload.deltas.chips, 0);

  const docs = [
    read("docs/baegeum-city-v2-gambling-venues.md"),
    read("docs/baegeum-city-v2-restored-recomposition-plan.md"),
    read("docs/ai-working-state.md")
  ].join("\n");
  assert.ok(docs.includes("src/restored/games/slot-contract.js"));
  assert.ok(docs.includes("restored-slot-001"));
  assert.ok(docs.includes("jackpot / triple / pair / loss"));

  console.log("Restored slot contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
