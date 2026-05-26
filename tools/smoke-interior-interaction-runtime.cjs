"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  let opened = null;
  global.window = {
    BaegeumCity: {
      exchangeAtm: { open: (context) => { opened = context; } },
      economy: { getState: () => ({ cash: 100000 }), record: () => { throw new Error("ledger fail"); } }
    },
    dispatchEvent: () => {}
  };
  global.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };

  const { runInteriorInteraction } = await load("src/systems/interior-interaction-runtime.js");
  const game = createFakeGame();
  const ok = runInteriorInteraction(game, { kind: "chip_exchange", prop: { id: "exchange-atm:test", role: "exchange-atm" } });
  assert.equal(ok, true, "chip exchange interaction should open the ATM UI");
  assert.equal(opened.prop.id, "exchange-atm:test", "ATM UI should receive the interaction prop");
  assert.equal(game.actionHistory?.length || 0, 0, "opening ATM UI should not commit action history");

  delete global.window.BaegeumCity.exchangeAtm;
  const missingUi = runInteriorInteraction(game, { kind: "chip_exchange", prop: { id: "exchange-atm:test", role: "exchange-atm" } });
  assert.equal(missingUi, false, "missing ATM UI should fail safely");

  console.log("Interior interaction runtime smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function createFakeGame() {
  return {
    currentInterior: { id: "interior-chip-exchange", channels: { venue: "venue:chip-exchange-01" } },
    playerState: { mode: "venue_lobby", venueId: "interior-chip-exchange", chatChannelId: "venue:chip-exchange-01" },
    contract: { mapVersion: "baegeum-city-v2-map-001" },
    chat: { addSystemMessage: () => {} },
    executedActionRequestIds: new Set(),
    actionHistory: []
  };
}
