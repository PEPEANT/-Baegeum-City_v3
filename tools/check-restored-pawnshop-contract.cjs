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
  const pawnshop = await load("src/restored/games/pawnshop-contract.js");
  const validation = pawnshop.validateRestoredPawnshopContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const quote = pawnshop.createRestoredPawnshopQuote({
    actorId: "player:test",
    itemId: "energy-drink",
    itemName: "Energy Drink",
    appraisedCash: 10000
  });
  assert.equal(quote.contractVersion, "restored-pawnshop-001");
  assert.equal(quote.loanCash, 5000);
  assert.equal(quote.feeCash, 750);
  assert.equal(quote.redeemCash, 5750);

  const post = pawnshop.createRestoredPawnshopPostEnvelope({ actorId: "player:test", itemId: "energy-drink", appraisedCash: 10000 });
  assert.equal(post.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_POSTED);
  assert.ok(findEffect(post, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_HOLD), "post should hold item collateral");
  assert.equal(findEffect(post, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.CASH_DELTA).payload.cash, 5000);
  assert.equal(findEffect(post, gambling.RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY), undefined);

  const redeem = pawnshop.createRestoredPawnshopRedeemEnvelope({ actorId: "player:test", itemId: "energy-drink", appraisedCash: 10000 });
  assert.equal(redeem.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_REDEEMED);
  assert.ok(findEffect(redeem, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_RETURN), "redeem should return collateral");
  assert.equal(findEffect(redeem, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.CASH_DELTA).payload.cash, -5750);

  const sold = pawnshop.createRestoredPawnshopForfeitEnvelope({ actorId: "player:test", itemId: "energy-drink", appraisedCash: 10000 });
  assert.equal(sold.event.type, gambling.RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_SOLD);
  assert.ok(findEffect(sold, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_SOLD), "forfeit should sell collateral");
  assert.equal(findEffect(sold, pawnshop.RESTORED_PAWNSHOP_EFFECT_TYPES.CASH_DELTA), undefined);

  const doc = read("docs/baegeum-city-v2-gambling-venues.md");
  assert.ok(doc.includes("src/restored/games/pawnshop-contract.js"));
  assert.ok(doc.includes("restored-pawnshop-001"));
  assert.ok(doc.includes("collateral_posted"));
  assert.ok(doc.includes("collateral_redeemed"));
  assert.ok(doc.includes("collateral_sold"));

  console.log("Restored pawnshop contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
