"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { updateCityHudLabels } = await load("src/scenes/city-hud.js");
  const labels = {
    scene: textNode(),
    position: textNode(),
    nearby: textNode(),
    playerMode: textNode(),
    chatChannel: textNode(),
    venue: textNode(),
    onlineRoom: textNode(),
    mapVersion: textNode(),
    clockTime: textNode(),
    clockDay: textNode(),
    clockPhase: textNode()
  };
  updateCityHudLabels({
    labels,
    map: { name: "Dice City", mapId: "dice-city" },
    contract: { mapVersion: "baegeum-city-v2-map-001" },
    currentInterior: null,
    player: { x: 10, y: 20 },
    playerState: { mode: "city" },
    chat: { channel: "world:dice-city" },
    clockSnapshot: { timeText: "08:00", dayLabel: "DAY 01", phaseLabel: "morning" }
  });

  assert.equal(labels.mapVersion.textContent, "map: dice-city / baegeum-city-v2-map-001");
  assert.equal(labels.chatChannel.textContent, "chat: world:dice-city");
  console.log("City HUD map label smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function textNode() {
  return { textContent: "" };
}
