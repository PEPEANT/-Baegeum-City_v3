import { progressToRestoredMarathonTrailPoint } from "./marathon-trail-geometry.js";

export const SINGULARITY_RACE_CAMERA_MODES = Object.freeze({
  FIXED: "fixed",
  SOFT_FOLLOW: "soft-follow",
  ROAD_FOLLOW: "road-follow"
});

export const DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS = Object.freeze({
  mode: SINGULARITY_RACE_CAMERA_MODES.SOFT_FOLLOW,
  rotationStartProgress: 42,
  rotationFullProgress: 86,
  maxRotationDegrees: 72,
  rotationSmoothing: 0.18,
  maxRotationStepRad: 0.045,
  anchorXRatio: 0.5,
  anchorYRatio: 0.5
});

export function createSingularityRaceAnchoredCamera({
  progress = 0,
  playerPixel,
  viewportWidth,
  viewportHeight,
  worldWidth,
  worldHeight,
  previousAngleRad = 0,
  options = {}
}) {
  const config = { ...DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS, ...options };
  const anchorX = viewportWidth * config.anchorXRatio;
  const anchorY = viewportHeight * config.anchorYRatio;
  const targetAngleRad = calculateSingularityRaceCameraTargetRotation(progress, {
    worldWidth,
    worldHeight,
    options: config
  });
  const angleRad = smoothSingularityRaceCameraRotation(previousAngleRad, targetAngleRad, config);
  return Object.freeze({
    mode: "anchored",
    x: playerPixel.x - anchorX,
    y: playerPixel.y - anchorY,
    anchorX,
    anchorY,
    playerX: playerPixel.x,
    playerY: playerPixel.y,
    angleRad,
    scale: 1,
    counterRotationRad: -angleRad,
    transform: [
      `translate3d(${anchorX}px, ${anchorY}px, 0)`,
      `rotate(${angleRad}rad)`,
      `translate3d(${-playerPixel.x}px, ${-playerPixel.y}px, 0)`
    ].join(" ")
  });
}

export function calculateSingularityRaceCameraTargetRotation(progress, {
  worldWidth,
  worldHeight,
  trailPoint = progressToRestoredMarathonTrailPoint(progress),
  options = {}
}) {
  const config = { ...DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS, ...options };
  if (config.mode === SINGULARITY_RACE_CAMERA_MODES.FIXED) return 0;
  const tangentX = (trailPoint.tangent?.x || 1) * worldWidth;
  const tangentY = (trailPoint.tangent?.y || 0) * worldHeight;
  const roadAngle = Math.atan2(tangentY, tangentX);
  const blend = config.mode === SINGULARITY_RACE_CAMERA_MODES.ROAD_FOLLOW
    ? 1
    : smoothStep(config.rotationStartProgress, config.rotationFullProgress, progress);
  const max = degreesToRadians(config.maxRotationDegrees);
  return clampNumber(-roadAngle * blend, -max, max);
}

export function smoothSingularityRaceCameraRotation(previousAngleRad, targetAngleRad, options = {}) {
  const config = { ...DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS, ...options };
  const diff = normalizeAngleRad(targetAngleRad - previousAngleRad);
  const step = clampNumber(
    diff * config.rotationSmoothing,
    -config.maxRotationStepRad,
    config.maxRotationStepRad
  );
  return previousAngleRad + step;
}

export function resolveSingularityRaceScreenPointToTrackPercent({
  screenX,
  screenY,
  camera,
  worldWidth,
  worldHeight
}) {
  if (camera?.mode === "anchored") {
    const angle = camera.angleRad || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = screenX - camera.anchorX;
    const dy = screenY - camera.anchorY;
    return pixelsToTrackPercent({
      x: camera.playerX + (dx * cos) + (dy * sin),
      y: camera.playerY - (dx * sin) + (dy * cos)
    }, worldWidth, worldHeight);
  }
  return pixelsToTrackPercent({
    x: screenX + (camera?.x || 0),
    y: screenY + (camera?.y || 0)
  }, worldWidth, worldHeight);
}

export function validateSingularityRaceCameraContract() {
  const errors = [];
  const startAngle = calculateSingularityRaceCameraTargetRotation(4, { worldWidth: 7600, worldHeight: 2600 });
  const curveAngle = calculateSingularityRaceCameraTargetRotation(90, { worldWidth: 7600, worldHeight: 2600 });
  const camera = createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: { x: 5000, y: 900 },
    viewportWidth: 1000,
    viewportHeight: 600,
    worldWidth: 7600,
    worldHeight: 2600
  });
  const center = resolveSingularityRaceScreenPointToTrackPercent({
    screenX: camera.anchorX,
    screenY: camera.anchorY,
    camera,
    worldWidth: 7600,
    worldHeight: 2600
  });
  if (Math.abs(startAngle) > 0.001) errors.push("start straight should stay unrotated");
  if (Math.abs(curveAngle) < 0.2) errors.push("curve section should rotate toward the road tangent");
  if (!camera.transform.includes("rotate(")) errors.push("anchored camera must expose a CSS rotate transform");
  if (Math.abs(center.x - (5000 / 7600 * 100)) > 0.01) errors.push("screen center should map back to player x");
  if (Math.abs(center.y - (900 / 2600 * 100)) > 0.01) errors.push("screen center should map back to player y");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function pixelsToTrackPercent(point, worldWidth, worldHeight) {
  return Object.freeze({
    x: clampNumber((point.x / worldWidth) * 100, 0, 100),
    y: clampNumber((point.y / worldHeight) * 100, 0, 100)
  });
}

function smoothStep(edge0, edge1, value) {
  const t = clampNumber((value - edge0) / Math.max(0.001, edge1 - edge0), 0, 1);
  return t * t * (3 - (2 * t));
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function normalizeAngleRad(angle) {
  let normalized = angle;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, number));
}
