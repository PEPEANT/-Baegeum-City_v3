import { calculateRestoredMarathonSpeedScale, progressToRestoredMarathonTrailPoint } from "./marathon-trail-geometry.js";

const DEFAULTS = Object.freeze({
  startLineProgress: 4,
  startPaddockMinProgress: 2.8,
  startPaddockMaxProgress: 7.12,
  roadLaneHalfWidthPx: 232,
  railMaxProgress: 100
});

export function createSingularityStartPaddockPosition(index, options = {}) {
  const context = createLocalSimContext(options);
  if (index === 0) return { progress: context.startLineProgress, laneOffsetPx: 0 };
  const botIndex = index - 1;
  const column = botIndex % 6;
  const row = Math.floor(botIndex / 6);
  const rowOffset = row - 2;
  const progress = context.startPaddockMinProgress + (column * 0.62) + ((row % 2) * 0.16);
  const laneOffsetPx = clampNumber((rowOffset * 74) + ((column % 2) ? 18 : -18), -context.roadLaneHalfWidthPx, context.roadLaneHalfWidthPx);
  return {
    progress: clampNumber(progress, context.startPaddockMinProgress, context.startPaddockMaxProgress),
    laneOffsetPx
  };
}

export function advanceSingularityLocalBotPack(runners, options = {}) {
  const context = createLocalSimContext(options);
  const elapsedSeconds = Math.max(0, Number(options.elapsedSeconds || 0));
  const nowMs = Math.max(0, Number(options.nowMs || 0));
  const playerProgress = Number(options.playerProgress ?? runners[0]?.progress ?? 0);
  let moved = false;
  const nextRunners = runners.map((runner, index) => {
    if (index === 0 || runner.progress >= context.railMaxProgress) return runner;
    if (Number(runner.stunnedUntilMs || 0) > nowMs) return runner;
    const baseSpeed = 0.085 + ((index * 17) % 11) * 0.006;
    const packBoost = runner.progress < playerProgress - 12 ? 0.035 : 0;
    const hpFactor = (runner.hp ?? 100) < 60 ? 0.72 : 1;
    const laneDrift = Math.sin((nowMs / 900) + index) * 10 * elapsedSeconds;
    const trailPoint = progressToRestoredMarathonTrailPoint(runner.progress);
    const speedScale = calculateRestoredMarathonSpeedScale(trailPoint.tangent);
    const nextProgress = Math.min(context.railMaxProgress, runner.progress + ((baseSpeed + packBoost) * hpFactor * speedScale * elapsedSeconds));
    const nextLaneOffsetPx = clampNumber((runner.laneOffsetPx || 0) + laneDrift, -context.roadLaneHalfWidthPx, context.roadLaneHalfWidthPx);
    moved = moved || didMove(runner, nextProgress, nextLaneOffsetPx);
    return { ...runner, progress: nextProgress, laneOffsetPx: nextLaneOffsetPx };
  });
  return { runners: nextRunners, moved };
}

export function advanceSingularityWaitingBotPack(runners, options = {}) {
  const context = createLocalSimContext(options);
  const elapsedSeconds = Math.max(0, Number(options.elapsedSeconds || 0));
  const nowMs = Math.max(0, Number(options.nowMs || 0));
  let moved = false;
  const nextRunners = runners.map((runner, index) => {
    if (index === 0) return runner;
    if (Number(runner.stunnedUntilMs || 0) > nowMs) return runner;
    const base = createSingularityStartPaddockPosition(index, context);
    const phase = (nowMs / 1000) + (index * 1.37);
    const targetProgress = clampNumber(base.progress + (Math.cos(phase * 0.7) * 0.22), context.startPaddockMinProgress, context.startPaddockMaxProgress);
    const targetLane = clampNumber(base.laneOffsetPx + (Math.sin(phase) * 24), -context.roadLaneHalfWidthPx, context.roadLaneHalfWidthPx);
    const nextProgress = approachNumber(runner.progress, targetProgress, elapsedSeconds * 0.48);
    const nextLaneOffsetPx = approachNumber(runner.laneOffsetPx || 0, targetLane, elapsedSeconds * 80);
    moved = moved || didMove(runner, nextProgress, nextLaneOffsetPx);
    return { ...runner, progress: nextProgress, laneOffsetPx: nextLaneOffsetPx };
  });
  return { runners: nextRunners, moved };
}

export function validateSingularityRaceLocalSimContract() {
  const errors = [];
  const player = createSingularityStartPaddockPosition(0);
  const bot = createSingularityStartPaddockPosition(12);
  if (player.progress !== DEFAULTS.startLineProgress || player.laneOffsetPx !== 0) errors.push("player must start at the shared start line");
  if (Math.abs(bot.laneOffsetPx) > DEFAULTS.roadLaneHalfWidthPx) errors.push("bot paddock lane must stay inside the wide road");
  const runners = [{ progress: 4, laneOffsetPx: 0 }, { progress: 4, laneOffsetPx: 0, hp: 100 }];
  const advanced = advanceSingularityLocalBotPack(runners, { elapsedSeconds: 1, nowMs: 900 });
  if (!advanced.moved || advanced.runners[1].progress <= runners[1].progress) errors.push("local bots must move without depending on player input");
  const stunned = advanceSingularityLocalBotPack([{ progress: 4, laneOffsetPx: 0 }, { progress: 4, laneOffsetPx: 0, hp: 100, stunnedUntilMs: 2000 }], { elapsedSeconds: 1, nowMs: 1000 });
  if (stunned.runners[1].progress !== 4) errors.push("stunned local bots should pause briefly");
  const nearFinish = advanceSingularityLocalBotPack([{ progress: 100, laneOffsetPx: 0 }, { progress: 99.9, laneOffsetPx: 0, hp: 100 }], { elapsedSeconds: 2, nowMs: 1200 });
  if (nearFinish.runners[1].progress > DEFAULTS.railMaxProgress) errors.push("local bot progress must clamp at the finish line");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function createLocalSimContext(options = {}) {
  return {
    startLineProgress: numberOption(options.startLineProgress, DEFAULTS.startLineProgress),
    startPaddockMinProgress: numberOption(options.startPaddockMinProgress, DEFAULTS.startPaddockMinProgress),
    startPaddockMaxProgress: numberOption(options.startPaddockMaxProgress, DEFAULTS.startPaddockMaxProgress),
    roadLaneHalfWidthPx: numberOption(options.roadLaneHalfWidthPx, DEFAULTS.roadLaneHalfWidthPx),
    railMaxProgress: numberOption(options.railMaxProgress, DEFAULTS.railMaxProgress)
  };
}

function didMove(runner, nextProgress, nextLaneOffsetPx) {
  return Math.abs(nextProgress - runner.progress) > 0.001 || Math.abs(nextLaneOffsetPx - (runner.laneOffsetPx || 0)) > 0.001;
}

function approachNumber(current, target, maxStep) {
  const delta = target - current;
  if (Math.abs(delta) <= maxStep) return target;
  return current + (Math.sign(delta) * maxStep);
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.max(min, Math.min(max, number));
}

function numberOption(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
