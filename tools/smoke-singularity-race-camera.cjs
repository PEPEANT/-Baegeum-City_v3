"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const cameraPath = path.join(root, "src", "restored", "games", "singularity-race-camera.js");

(async () => {
  const camera = await import(pathToFileURL(cameraPath).href);
  const validation = camera.validateSingularityRaceCameraContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const anchored = camera.createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: { x: 5200, y: 880 },
    viewportWidth: 1280,
    viewportHeight: 720,
    worldWidth: 7600,
    worldHeight: 2600
  });
  assert.equal(anchored.mode, "anchored", "race camera should use anchored follow mode.");
  assert.ok(anchored.counterRotationRad !== 0, "runner sprites need counter rotation on the curve.");

  const center = camera.resolveSingularityRaceScreenPointToTrackPercent({
    screenX: anchored.anchorX,
    screenY: anchored.anchorY,
    camera: anchored,
    worldWidth: 7600,
    worldHeight: 2600
  });
  assert.ok(Math.abs(center.x - (5200 / 7600 * 100)) < 0.01, "anchor x should map to player.");
  assert.ok(Math.abs(center.y - (880 / 2600 * 100)) < 0.01, "anchor y should map to player.");

  const fixed = camera.calculateSingularityRaceCameraTargetRotation(90, {
    worldWidth: 7600,
    worldHeight: 2600,
    options: { mode: camera.SINGULARITY_RACE_CAMERA_MODES.FIXED }
  });
  assert.equal(fixed, 0, "fixed camera option should disable rotation.");

  console.log("Singularity Race camera smoke passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
