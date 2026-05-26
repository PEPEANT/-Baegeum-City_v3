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
  const dpa = await load("src/restored/economy/dpa-token-contract.js");
  const validation = dpa.validateRestoredDpaTokenContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  assert.equal(dpa.RESTORED_DPA_SYMBOL, "DPA");
  assert.equal(dpa.RESTORED_DPA_UNIT_WON, 1000);
  assert.equal(dpa.wonToRestoredDpa(3400), 3);
  assert.equal(dpa.restoredDpaToWon(3), 3000);
  assert.equal(dpa.createRestoredDpaExchangeQuote({ won: 10000 }).dpa, 10);

  const economyDoc = read("docs/baegeum-city-v2-economy-ledger.md");
  const recompositionDoc = read("docs/baegeum-city-v2-restored-recomposition-plan.md");
  assert.ok(economyDoc.includes("DPA casino token boundary"));
  assert.ok(economyDoc.includes("1 DPA = 1,000원"));
  assert.ok(recompositionDoc.includes("src/restored/economy/dpa-token-contract.js"));

  console.log("Restored DPA token contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
