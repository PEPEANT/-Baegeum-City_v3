"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const cameraPath = path.join(root, "src", "restored", "games", "singularity-race-camera.js");
const raceHtmlPath = path.join(root, "singularity-race.html");
const testWorld = Object.freeze({ width: 7600, height: 2600 });
const testPlayer = Object.freeze({ x: 5200, y: 880 });
const testViewport = Object.freeze({ width: 1280, height: 720 });

(async () => {
  const camera = await import(pathToFileURL(cameraPath).href);
  const validation = camera.validateSingularityRaceCameraContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  assertDefaultCameraGuard(camera);
  assertRaceHtmlDoesNotEnableRotation();
  const anchored = assertAnchoredCamera(camera);
  assertOptionalRotationGuards(camera);
  const center = assertScreenMapping(camera, anchored);
  assertZoomMapping(camera, center);

  const fixed = camera.calculateSingularityRaceCameraTargetRotation(90, {
    worldWidth: testWorld.width,
    worldHeight: testWorld.height,
    options: { mode: camera.SINGULARITY_RACE_CAMERA_MODES.FIXED }
  });
  assert.equal(fixed, 0, "fixed camera option should disable rotation.");

  console.log("Singularity Race camera smoke passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

function assertDefaultCameraGuard(camera) {
  assert.equal(
    camera.DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS.mode,
    camera.SINGULARITY_RACE_CAMERA_MODES.FIXED,
    "default race camera mode must stay fixed until movement and boundary feel are stable."
  );
  assert.ok(
    camera.DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS.maxRotationDegrees <= 35,
    "optional camera rotation should stay capped below auto-flip territory."
  );
}

function assertRaceHtmlDoesNotEnableRotation() {
  const raceHtml = fs.readFileSync(raceHtmlPath, "utf8");
  assert.ok(
    !raceHtml.includes("mode: \"soft-follow\"") && !raceHtml.includes("mode: \"road-follow\""),
    "normal race camera setup should not opt into rotating camera modes."
  );
}

function assertAnchoredCamera(camera) {
  const anchored = camera.createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: testPlayer,
    viewportWidth: testViewport.width,
    viewportHeight: testViewport.height,
    worldWidth: testWorld.width,
    worldHeight: testWorld.height
  });
  assert.equal(anchored.mode, "anchored", "race camera should use anchored follow mode.");
  assert.equal(anchored.counterRotationRad, 0, "default race camera should not rotate on the redesigned maze course.");
  assert.ok(anchored.transform.includes("scale("), "race camera should expose zoom scale in its transform.");
  return anchored;
}

function assertOptionalRotationGuards(camera) {
  for (const progress of [42, 70, 86, 100]) {
    const defaultTarget = camera.calculateSingularityRaceCameraTargetRotation(progress, {
      worldWidth: testWorld.width,
      worldHeight: testWorld.height
    });
    assert.equal(defaultTarget, 0, `default camera should stay unrotated at progress ${progress}.`);
  }

  const softFollowTarget = camera.calculateSingularityRaceCameraTargetRotation(86, {
    worldWidth: testWorld.width,
    worldHeight: testWorld.height,
    options: { mode: camera.SINGULARITY_RACE_CAMERA_MODES.SOFT_FOLLOW }
  });
  assert.ok(
    Math.abs(softFollowTarget) <= (35 * Math.PI / 180) + 0.001,
    "soft-follow should be capped to a mild rotation when explicitly enabled."
  );

  const roadFollow = camera.createSingularityRaceAnchoredCamera({
    progress: 70,
    playerPixel: testPlayer,
    viewportWidth: testViewport.width,
    viewportHeight: testViewport.height,
    worldWidth: testWorld.width,
    worldHeight: testWorld.height,
    options: { mode: camera.SINGULARITY_RACE_CAMERA_MODES.ROAD_FOLLOW }
  });
  assert.ok(roadFollow.counterRotationRad !== 0, "road-follow mode should remain available as an optional camera mode.");
}

function assertScreenMapping(camera, anchored) {
  const center = camera.resolveSingularityRaceScreenPointToTrackPercent({
    screenX: anchored.anchorX,
    screenY: anchored.anchorY,
    camera: anchored,
    worldWidth: testWorld.width,
    worldHeight: testWorld.height
  });
  assert.ok(Math.abs(center.x - (testPlayer.x / testWorld.width * 100)) < 0.01, "anchor x should map to player.");
  assert.ok(Math.abs(center.y - (testPlayer.y / testWorld.height * 100)) < 0.01, "anchor y should map to player.");
  return center;
}

function assertZoomMapping(camera, center) {
  const zoomed = camera.createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: testPlayer,
    viewportWidth: testViewport.width,
    viewportHeight: testViewport.height,
    worldWidth: testWorld.width,
    worldHeight: testWorld.height,
    options: { zoom: 1.5 }
  });
  const zoomedCenter = camera.resolveSingularityRaceScreenPointToTrackPercent({
    screenX: zoomed.anchorX,
    screenY: zoomed.anchorY,
    camera: zoomed,
    worldWidth: testWorld.width,
    worldHeight: testWorld.height
  });
  assert.equal(zoomed.scale, 1.5, "camera zoom option should become transform scale.");
  assert.ok(Math.abs(zoomedCenter.x - center.x) < 0.01, "zoomed anchor should still map to player x.");
  assert.ok(Math.abs(zoomedCenter.y - center.y) < 0.01, "zoomed anchor should still map to player y.");
}
