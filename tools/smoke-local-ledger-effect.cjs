"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { GAME_EFFECT_TYPES } = await load("src/systems/game-action-master.js");
  const { LEDGER_EFFECT_STATUSES, applyLocalEconomyLedgerEffect } = await load("src/systems/local-ledger-effect.js");
  const { exchangeLedgerFailureMessage } = await load("src/ui/exchange-atm-panel.js");
  const { oddEvenLedgerFailureMessage } = await load("src/ui/odd-even-table-panel.js");
  const envelope = ledgerEnvelope(GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);

  const success = applyLocalEconomyLedgerEffect(envelope, { record: (payload) => ({ savedType: payload.type }) });
  assert.equal(success.ok, true, "ledger effect should apply when economy.record works");
  assert.equal(success.status, LEDGER_EFFECT_STATUSES.OK, "success should expose ok status");
  assert.equal(success.recordResult.savedType, "chip_exchange", "success should expose record result");

  const missingEffect = applyLocalEconomyLedgerEffect({ effects: [] }, { record: () => null });
  assert.equal(missingEffect.status, LEDGER_EFFECT_STATUSES.MISSING_EFFECT, "missing ledger effect should be observable");
  assert.ok(exchangeLedgerFailureMessage(missingEffect).includes("기록"), "exchange UI should name missing ledger records");

  const missingEconomy = applyLocalEconomyLedgerEffect(envelope, {});
  assert.equal(missingEconomy.status, LEDGER_EFFECT_STATUSES.MISSING_ECONOMY_RECORD, "missing economy recorder should be observable");
  assert.ok(oddEvenLedgerFailureMessage(missingEconomy).includes("준비"), "odd-even UI should name unavailable economy recorder");

  const failed = applyLocalEconomyLedgerEffect(envelope, { record: () => { throw new Error("ledger boom"); } });
  assert.equal(failed.status, LEDGER_EFFECT_STATUSES.RECORD_FAILED, "record failures should be observable");
  assert.match(failed.reason, /ledger boom/, "record failure should preserve error reason");

  console.log("Local ledger effect smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function ledgerEnvelope(type) {
  return {
    effects: [
      {
        type,
        payload: {
          type: "chip_exchange",
          deltas: { cash: -10000, chips: 10 }
        }
      }
    ]
  };
}
