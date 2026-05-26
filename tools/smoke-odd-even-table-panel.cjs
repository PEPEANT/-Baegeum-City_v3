"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { createOddEvenHintText, resolveOddEvenPanelState } = await load("src/ui/odd-even-table-panel.js");
  assert.equal(resolveOddEvenPanelState(null).visible, false, "panel should hide without a game");
  assert.equal(resolveOddEvenPanelState({
    playerState: { mode: "venue_lobby" },
    currentInterior: { gameType: "odd-even" }
  }).visible, false, "panel should hide before sitting at a table");

  const seated = resolveOddEvenPanelState({
    playerState: { mode: "table_seated", venueName: "홀짝카지노", tableId: "table:odd-even-casino-01:main" },
    currentInterior: { gameType: "odd-even" }
  }, { chips: 10 });
  assert.equal(seated.visible, true, "panel should show only for odd-even table seats");
  assert.equal(seated.venueName, "홀짝카지노", "panel should keep venue name");
  assert.equal(seated.canStart, false, "panel should wait for a pick before reserving");

  const ready = resolveOddEvenPanelState({
    playerState: { mode: "table_seated", venueName: "홀짝카지노", tableId: "table:odd-even-casino-01:main" },
    currentInterior: { gameType: "odd-even" }
  }, { chips: 50 }, { pick: "odd", chips: 10, reserved: null });
  assert.equal(ready.canStart, true, "panel should allow bet reservation when pick and chips are ready");
  assert.ok(createOddEvenHintText(ready).includes("예약 가능"), "ready hint should describe reservation only");

  const lowChips = resolveOddEvenPanelState({
    playerState: { mode: "table_seated", tableId: "table:odd-even-casino-01:main" },
    currentInterior: { gameType: "odd-even" }
  }, { chips: 5 }, { pick: "even", chips: 10, reserved: null });
  assert.equal(lowChips.canStart, false, "panel should block reservation without enough chips");

  const invalidPick = resolveOddEvenPanelState({
    playerState: { mode: "table_seated", tableId: "table:odd-even-casino-01:main" },
    currentInterior: { gameType: "odd-even" }
  }, { chips: 50 }, { pick: "bad", chips: 10, reserved: null });
  assert.equal(invalidPick.canStart, false, "panel should block invalid odd-even picks");

  const reserved = resolveOddEvenPanelState({
    playerState: { mode: "table_seated", tableId: "table:odd-even-casino-01:main" },
    currentInterior: { gameType: "odd-even" }
  }, { chips: 50 }, { pick: "odd", chips: 10, reserved: { label: "홀", chips: 10 } });
  assert.equal(reserved.canStart, false, "reserved local round should block duplicate starts");

  assert.equal(resolveOddEvenPanelState({
    playerState: { mode: "table_seated" },
    currentInterior: { gameType: "blackjack" }
  }).visible, false, "panel should not show for other casino tables");

  console.log("Odd-even table panel smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
