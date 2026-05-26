"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const {
    EXCHANGE_OPTIONS,
    RATE_WON_PER_CHIP,
    createExchangeQuote,
    resolveExchangeAtmPanelState
  } = await load("src/ui/exchange-atm-panel.js");

  assert.deepEqual(EXCHANGE_OPTIONS, [10, 50, 100], "DiceLand exchange options should be preserved");
  assert.equal(RATE_WON_PER_CHIP, 1000, "DiceLand chip rate should be preserved");
  assert.equal(resolveExchangeAtmPanelState(null, {}, true).visible, false, "ATM should hide without a venue");
  assert.equal(resolveExchangeAtmPanelState({
    currentInterior: { name: "블랙잭카지노" },
    playerState: { mode: "venue_lobby" }
  }, { cash: 10000, chips: 0 }, true).visible, true, "ATM should show in venue lobby when opened");
  assert.equal(createExchangeQuote("C2H", 50, { cash: 50000 }).valid, true, "cash to chips should validate enough cash");
  assert.equal(createExchangeQuote("C2H", 100, { cash: 50000 }).valid, false, "cash to chips should reject low cash");
  assert.equal(createExchangeQuote("H2C", 50, { chips: 50 }).cash, 50000, "chips to cash should quote cash value");
  assert.equal(createExchangeQuote("H2C", 100, { chips: 50 }).valid, false, "chips to cash should reject low chips");

  console.log("Exchange ATM panel smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
