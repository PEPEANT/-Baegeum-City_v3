"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { createDefaultPlayerEconomy } = await load("src/systems/player-economy-state.js");
  const {
    ECONOMY_ENTRY_TYPES,
    appendEconomyLedgerEntry,
    createEconomyEntry,
    inspectEconomyLedgerStorage,
    projectEconomyFromLedger,
    readEconomyLedger
  } = await load("src/systems/economy-ledger.js");

  const memoryStorage = createMemoryStorage();
  const base = createDefaultPlayerEconomy();
  const exchange = createEconomyEntry({
    type: ECONOMY_ENTRY_TYPES.CHIP_EXCHANGE,
    actorId: "player:test",
    deltas: { cash: -10000, chips: 10 },
    reason: "칩 교환소 테스트"
  });

  const projected = projectEconomyFromLedger(base, [exchange]);
  assert.equal(projected.cash, 90000, "cash should decrease through ledger projection");
  assert.equal(projected.chips, 10, "chips should increase through ledger projection");

  const appended = appendEconomyLedgerEntry(exchange, memoryStorage);
  assert.equal(appended.entries.length, 1, "ledger should append one entry");
  assert.equal(readEconomyLedger(memoryStorage)[0].type, ECONOMY_ENTRY_TYPES.CHIP_EXCHANGE, "ledger should persist type");
  assert.equal(inspectEconomyLedgerStorage(memoryStorage).status, "ok", "valid ledger storage should be observable as ok");

  const itemGrant = createEconomyEntry({
    type: ECONOMY_ENTRY_TYPES.ITEM_GRANTED,
    itemDeltas: [{ id: "food:triangle-gimbap", name: "삼각김밥", count: 2 }]
  });
  assert.equal(projectEconomyFromLedger(base, [itemGrant]).inventory[0].count, 2, "item delta should add inventory");

  assert.throws(() => projectEconomyFromLedger(base, [
    createEconomyEntry({ type: ECONOMY_ENTRY_TYPES.BET_RESERVED, deltas: { chips: -1 } })
  ]), /chips negative/, "ledger should reject spending chips below zero");
  assert.throws(() => projectEconomyFromLedger(base, [
    createEconomyEntry({ type: ECONOMY_ENTRY_TYPES.CHIP_EXCHANGE, deltas: { cash: -1000, chips: -1 } })
  ]), /opposite cash\/chips/, "chip exchange should require opposite cash and chip movement");
  assert.throws(() => projectEconomyFromLedger(base, [
    createEconomyEntry({ type: ECONOMY_ENTRY_TYPES.BET_RESERVED, deltas: { cash: -1000 } })
  ]), /negative chips only/, "bet reservation should never spend cash directly");
  assert.throws(() => projectEconomyFromLedger(base, [
    createEconomyEntry({ type: ECONOMY_ENTRY_TYPES.ITEM_GRANTED, itemDeltas: [{ id: "food:test", count: -1 }] })
  ]), /positive item deltas/, "item grant should not remove items");

  const emptyStorage = createMemoryStorage();
  assert.equal(inspectEconomyLedgerStorage(emptyStorage).status, "missing", "missing ledger storage should be observable");
  emptyStorage.setItem("baegeum-city:v2:economy-ledger", "{bad");
  const corrupt = inspectEconomyLedgerStorage(emptyStorage);
  assert.equal(corrupt.status, "corrupt", "corrupt ledger storage should be observable");
  assert.equal(corrupt.entries.length, 0, "corrupt ledger storage should still fall back to empty ledger");

  console.log("Economy ledger smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value))
  };
}
