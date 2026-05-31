import { progressToRestoredMarathonTrailPoint, RESTORED_MARATHON_WORLD_WIDTH, RESTORED_MARATHON_WORLD_HEIGHT } from "./marathon-trail-geometry.js";

const CAMERA_SMOOTH_SPEED = 12;

export const SINGULARITY_RACE_CAMERA_MODES = Object.freeze({
  FIXED: "fixed",
  SOFT_FOLLOW: "soft-follow",
  ROAD_FOLLOW: "road-follow"
});

export const DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS = Object.freeze({
  mode: SINGULARITY_RACE_CAMERA_MODES.FIXED,
  rotationStartProgress: 42,
  rotationFullProgress: 86,
  maxRotationDegrees: 35,
  rotationSmoothing: 0.18,
  maxRotationStepRad: 0.045,
  anchorXRatio: 0.5,
  anchorYRatio: 0.5,
  zoom: 1
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
  const scale = clampNumber(config.zoom, 0.65, 1.9);
  return Object.freeze({
    mode: "anchored",
    x: playerPixel.x - anchorX,
    y: playerPixel.y - anchorY,
    anchorX,
    anchorY,
    playerX: playerPixel.x,
    playerY: playerPixel.y,
    angleRad,
    scale,
    counterRotationRad: -angleRad,
    transform: [
      `translate3d(${anchorX}px, ${anchorY}px, 0)`,
      `scale(${scale})`,
      `rotate(${angleRad}rad)`,
      `translate3d(${-playerPixel.x}px, ${-playerPixel.y}px, 0)`
    ].join(" ")
  });
}

export function lerpSingularityRaceCameraCenter(smoothed, target, deltaSeconds) {
  if (!smoothed) return { x: target.x, y: target.y };
  const t = 1 - Math.exp(-CAMERA_SMOOTH_SPEED * Math.min(deltaSeconds, 0.25));
  return {
    x: smoothed.x + (target.x - smoothed.x) * t,
    y: smoothed.y + (target.y - smoothed.y) * t
  };
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
    const scale = clampNumber(camera.scale || 1, 0.65, 1.9);
    const dx = (screenX - camera.anchorX) / scale;
    const dy = (screenY - camera.anchorY) / scale;
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
  if (DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS.mode !== SINGULARITY_RACE_CAMERA_MODES.FIXED) {
    errors.push("default race camera mode must stay fixed for the 0.1 movement/collision pass");
  }
  if (DEFAULT_SINGULARITY_RACE_CAMERA_OPTIONS.maxRotationDegrees > 35) {
    errors.push("optional camera rotation must stay capped before road-follow becomes public");
  }
  const startAngle = calculateSingularityRaceCameraTargetRotation(4, { worldWidth: 7600, worldHeight: 2600 });
  const curveAngle = calculateSingularityRaceCameraTargetRotation(70, {
    worldWidth: 7600,
    worldHeight: 2600,
    options: { mode: SINGULARITY_RACE_CAMERA_MODES.SOFT_FOLLOW }
  });
  const camera = createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: { x: 5000, y: 900 },
    viewportWidth: 1000,
    viewportHeight: 600,
    worldWidth: 7600,
    worldHeight: 2600
  });
  const zoomed = createSingularityRaceAnchoredCamera({
    progress: 90,
    playerPixel: { x: 5000, y: 900 },
    viewportWidth: 1000,
    viewportHeight: 600,
    worldWidth: 7600,
    worldHeight: 2600,
    options: { zoom: 1.4 }
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
  if (Math.abs(camera.angleRad) > 0.001) errors.push("default race camera should stay fixed to avoid rotation jitter");
  if (!camera.transform.includes("rotate(") || !camera.transform.includes("scale(")) errors.push("anchored camera must expose CSS scale and rotate transforms");
  if (Math.abs(zoomed.scale - 1.4) > 0.001) errors.push("camera zoom should preserve requested scale");
  if (Math.abs(center.x - (5000 / 7600 * 100)) > 0.01) errors.push("screen center should map back to player x");
  if (Math.abs(center.y - (900 / 2600 * 100)) > 0.01) errors.push("screen center should map back to player y");
  const lerpStart = lerpSingularityRaceCameraCenter(null, { x: 100, y: 200 }, 0.016);
  if (lerpStart.x !== 100 || lerpStart.y !== 200) errors.push("lerp from null must snap to target");
  const lerpSmooth = lerpSingularityRaceCameraCenter({ x: 0, y: 0 }, { x: 100, y: 200 }, 0.016);
  if (lerpSmooth.x <= 0 || lerpSmooth.x >= 100) errors.push("lerp must approach target without overshoot");
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
