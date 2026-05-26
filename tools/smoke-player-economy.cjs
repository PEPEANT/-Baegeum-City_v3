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
    createDefaultPlayerEconomy,
    formatWon,
    inspectPlayerEconomyStorage,
    normalizePlayerEconomy,
    patchPlayerEconomy,
    readPlayerEconomy
  } = await load("src/systems/player-economy-state.js");

  const memoryStorage = createMemoryStorage();
  const base = createDefaultPlayerEconomy();
  assert.equal(base.cash, 100000, "default cash should be ready for HUD display");
  assert.equal(base.chips, 0, "default chips should start at zero");
  assert.equal(formatWon(1234567), "1,234,567원", "won formatter should use ko-KR grouping");

  const normalized = normalizePlayerEconomy({
    cash: "9000",
    bank: -400,
    chips: -10,
    energy: 140,
    hunger: -20,
    inventory: [{ name: "테스트 칩", count: 2 }]
  });
  assert.equal(normalized.cash, 9000, "cash should normalize numeric strings");
  assert.equal(normalized.bank, 0, "bank should never persist below zero");
  assert.equal(normalized.chips, 0, "chips should never persist below zero");
  assert.equal(normalized.energy, 100, "energy should clamp to 100");
  assert.equal(normalized.hunger, 0, "hunger should clamp to 0");
  assert.equal(normalized.inventory[0].name, "테스트 칩", "inventory items should be kept");

  const patched = patchPlayerEconomy(base, { chips: 50 }, memoryStorage);
  assert.equal(patched.chips, 50, "patch should update chips");
  assert.equal(readPlayerEconomy(memoryStorage).chips, 50, "patched state should persist");
  assert.equal(inspectPlayerEconomyStorage(memoryStorage).status, "ok", "valid economy storage should be observable as ok");

  const emptyStorage = createMemoryStorage();
  assert.equal(inspectPlayerEconomyStorage(emptyStorage).status, "missing", "missing economy storage should be observable");
  emptyStorage.setItem("baegeum-city:v2:economy", "{bad");
  const corrupt = inspectPlayerEconomyStorage(emptyStorage);
  assert.equal(corrupt.status, "corrupt", "corrupt economy storage should be observable");
  assert.equal(corrupt.state.cash, 100000, "corrupt economy storage should still fall back to default economy");

  console.log("Player economy smoke check passed.");
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
