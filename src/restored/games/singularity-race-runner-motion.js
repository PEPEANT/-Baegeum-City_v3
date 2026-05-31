export const SINGULARITY_RACE_RUNNER_MOTION_VERSION = "singularity-race-runner-motion-001";

export function hasPotentialSingularityPlayerMovement(runner = {}, keys = {}, options = {}) {
  if (!hasAnyMovementKey(keys)) return false;
  const progress = finiteNumber(runner.progress, finiteNumber(options.startProgress, 4));
  const lane = finiteNumber(runner.laneOffsetPx, 0);
  const minProgress = finiteNumber(options.minProgress, 2.5);
  const maxProgress = finiteNumber(options.maxProgress, 100);
  const laneHalfWidthPx = positiveNumber(options.laneHalfWidthPx, 232);
  return Boolean(
    (keys.KeyD && progress < maxProgress - 0.001)
      || (keys.KeyA && progress > minProgress + 0.001)
      || (keys.KeyW && lane > -laneHalfWidthPx + 0.5)
      || (keys.KeyS && lane < laneHalfWidthPx - 0.5)
  );
}

export function validateSingularityRaceRunnerMotionContract() {
  const errors = [];
  const baseOptions = { minProgress: 2.5, maxProgress: 100, laneHalfWidthPx: 232, startProgress: 4 };
  if (hasPotentialSingularityPlayerMovement({ progress: 100, laneOffsetPx: 0 }, { KeyD: true }, baseOptions)) {
    errors.push("finish edge should not keep forward running alive");
  }
  if (hasPotentialSingularityPlayerMovement({ progress: 2.5, laneOffsetPx: 0 }, { KeyA: true }, baseOptions)) {
    errors.push("start edge should not keep backward running alive");
  }
  if (hasPotentialSingularityPlayerMovement({ progress: 30, laneOffsetPx: -232 }, { KeyW: true }, baseOptions)) {
    errors.push("top lane edge should not keep upward running alive");
  }
  if (hasPotentialSingularityPlayerMovement({ progress: 30, laneOffsetPx: 232 }, { KeyS: true }, baseOptions)) {
    errors.push("bottom lane edge should not keep downward running alive");
  }
  if (!hasPotentialSingularityPlayerMovement({ progress: 30, laneOffsetPx: 232 }, { KeyW: true }, baseOptions)) {
    errors.push("opposite lane input should still recover from a road edge");
  }
  if (!hasPotentialSingularityPlayerMovement({ progress: 99.5, laneOffsetPx: 0 }, { KeyD: true }, baseOptions)) {
    errors.push("near-finish forward input should still run before the clamp");
  }
  if (hasPotentialSingularityPlayerMovement({ progress: 30, laneOffsetPx: 0 }, {}, baseOptions)) {
    errors.push("no movement keys should not animate running");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function hasAnyMovementKey(keys = {}) {
  return Boolean(keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD);
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
