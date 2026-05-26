"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { WORLD_OBJECT_TYPES, canPlayerUseWorldObject, normalizeWorldObject } = await load("src/systems/world-object-master.js");
  const { INTERACTION_TYPES, canRunInteraction, createInteractionCandidate } = await load("src/systems/interaction-master.js");

  const car = normalizeWorldObject({
    id: "Vehicle Sedan 001",
    type: WORLD_OBJECT_TYPES.VEHICLE,
    label: "낡은 세단",
    x: 120,
    y: 80,
    collision: { shape: "rect", w: 120, h: 58, blocksPlayers: true, blocksVehicles: true },
    requiredItems: [{ id: "vehicle_key:sedan-001", type: "vehicle_key" }],
    interactions: [{ type: INTERACTION_TYPES.DRIVE, label: "운전" }]
  });
  assert.equal(car.id, "vehicle-sedan-001", "world object ids should normalize");
  assert.equal(car.collision.blocksPlayers, true, "vehicle collision should keep player blocking");
  assert.equal(canPlayerUseWorldObject({ mode: "city" }, [], car).ok, false, "missing car key should block vehicle use");
  assert.equal(canPlayerUseWorldObject({ mode: "city" }, [{ id: "vehicle_key:sedan-001" }], car).ok, true, "car key should unlock vehicle use");

  const drive = createInteractionCandidate({
    type: INTERACTION_TYPES.DRIVE,
    targetId: car.id,
    requiredItems: [{ id: "license:driver", type: "license" }]
  });
  assert.equal(drive.label, "운전", "drive interaction should have Korean label");
  assert.equal(canRunInteraction(drive, [{ id: "license:driver" }]).ok, true, "license should satisfy interaction requirement");
  assert.equal(canRunInteraction(drive, []).reason, "missing_items", "missing license should block interaction");

  console.log("Object interaction master smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
