export const RESTORED_LIFE_JOB_CONTRACT_VERSION = "restored-life-job-001";
export const RESTORED_LIFE_JOB_IDS = Object.freeze({
  CONVENIENCE_STORE: "job:convenience-store",
  FAST_FOOD: "job:fast-food"
});

export const RESTORED_LIFE_JOB_EFFECT_TYPES = Object.freeze({
  ECONOMY_LEDGER_ENTRY: "economy_ledger_entry",
  PLAYER_STATE_PATCH: "player_state_patch",
  RELATIONSHIP_EVENT_HOOK: "relationship_event_hook",
  INVENTORY_ITEM_GRANT: "inventory_item_grant",
  UI_MESSAGE: "ui_message"
});
export const RESTORED_LIFE_JOB_CATALOG = deepFreeze([
  {
    id: RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE,
    placeId: "baegeum:convenience-store",
    displayName: "Convenience Store Shift",
    districtId: "baegeum-city",
    minutes: 180,
    baseWageDp: 32000,
    energyCost: 16,
    mentalCost: 4,
    reputationGain: 2,
    relationshipHookId: "partner_reacts_to_steady_shift",
    bonusItem: { itemId: "energy_drink", count: 1, minGrade: "A" },
    tasks: [
      { id: "scan_items", label: "Scan items without mismatches", focus: "accuracy" },
      { id: "stock_shelves", label: "Restock drinks before rush hour", focus: "stamina" },
      { id: "serve_customer", label: "Handle an impatient customer", focus: "service" },
      { id: "clean_floor", label: "Clean the entrance aisle", focus: "speed" }
    ]
  },
  {
    id: RESTORED_LIFE_JOB_IDS.FAST_FOOD,
    placeId: "baegeum:fast-food",
    displayName: "MacBurger Shift",
    districtId: "baegeum-city",
    minutes: 240,
    baseWageDp: 38000,
    energyCost: 24,
    mentalCost: 7,
    reputationGain: 3,
    relationshipHookId: "partner_reacts_to_hard_shift",
    bonusItem: { itemId: "burger_coupon", count: 1, minGrade: "B" },
    tasks: [
      { id: "cook_order", label: "Cook orders in the right sequence", focus: "accuracy" },
      { id: "pack_order", label: "Pack takeout before the timer ends", focus: "speed" },
      { id: "serve_customer", label: "Calm a waiting customer", focus: "service" },
      { id: "clean_floor", label: "Reset the dining room", focus: "stamina" }
    ]
  }
]);

const GRADE_RULES = Object.freeze([
  { grade: "S", minScore: 90, wageMultiplier: 1.35, reputationBonus: 4, trust: 4, stability: 5, risk: -3 },
  { grade: "A", minScore: 80, wageMultiplier: 1.2, reputationBonus: 3, trust: 3, stability: 4, risk: -2 },
  { grade: "B", minScore: 65, wageMultiplier: 1.05, reputationBonus: 1, trust: 2, stability: 2, risk: -1 },
  { grade: "C", minScore: 50, wageMultiplier: 1, reputationBonus: 0, trust: 1, stability: 1, risk: 0 },
  { grade: "D", minScore: 35, wageMultiplier: 0.75, reputationBonus: -1, trust: -1, stability: -2, risk: 2 },
  { grade: "F", minScore: 0, wageMultiplier: 0.5, reputationBonus: -3, trust: -3, stability: -4, risk: 5 }
]);
function deepFreeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map((item) => deepFreeze(item)));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = deepFreeze(value[key]);
    return Object.freeze(value);
  }
  return value;
}
function clampPercent(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
}
function nonNegativeInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}
function stringOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function getGradeRule(score) {
  return GRADE_RULES.find((rule) => score >= rule.minScore) || GRADE_RULES[GRADE_RULES.length - 1];
}
function gradeRank(grade) {
  return ["F", "D", "C", "B", "A", "S"].indexOf(grade);
}
function freezeEffect(effect) {
  return Object.freeze({ ...effect, payload: Object.freeze(effect.payload || {}) });
}
export function listRestoredLifeJobs() {
  return RESTORED_LIFE_JOB_CATALOG;
}

export function getRestoredLifeJob(jobId) {
  return RESTORED_LIFE_JOB_CATALOG.find((job) => job.id === jobId) || null;
}

export function normalizeRestoredLifeJobPerformance(input = {}) {
  return Object.freeze({
    accuracy: clampPercent(input.accuracy, 50),
    speed: clampPercent(input.speed, 50),
    service: clampPercent(input.service, 50),
    stamina: clampPercent(input.stamina, 50),
    mistakes: nonNegativeInteger(input.mistakes),
    combo: nonNegativeInteger(input.combo)
  });
}

export function createRestoredLifeJobTaskDeck(jobId) {
  const job = getRestoredLifeJob(jobId);
  if (!job) return Object.freeze([]);
  return Object.freeze(job.tasks.map((task, index) => Object.freeze({ ...task, order: index + 1 })));
}

export function scoreRestoredLifeJob(jobId, performanceInput = {}) {
  const job = getRestoredLifeJob(jobId);
  if (!job) return Object.freeze({ ok: false, reason: "unknown_job" });
  const performance = normalizeRestoredLifeJobPerformance(performanceInput);
  const quality = performance.accuracy * 0.35 + performance.speed * 0.2 + performance.service * 0.25 + performance.stamina * 0.2;
  const penalty = Math.min(35, performance.mistakes * 7);
  const comboBonus = Math.min(10, performance.combo * 1.5);
  const score = clampPercent(quality - penalty + comboBonus);
  const rule = getGradeRule(score);
  return Object.freeze({ ok: true, jobId: job.id, performance, score, grade: rule.grade, gradeRule: Object.freeze({ ...rule }) });
}

export function formatRestoredDp(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString("en-US")} DP`;
}

export function createRestoredLifeJobResult(jobId, performanceInput = {}, options = {}) {
  const job = getRestoredLifeJob(jobId);
  if (!job) return Object.freeze({ ok: false, reason: "unknown_job" });
  const scored = scoreRestoredLifeJob(jobId, performanceInput);
  const actorId = stringOrFallback(options.actorId, "player:local");
  const wageDp = Math.max(0, Math.round(job.baseWageDp * scored.gradeRule.wageMultiplier));
  const condition = createConditionDelta(job, scored);
  const effects = [
    createWageEffect(actorId, job, wageDp, options),
    createConditionEffect(actorId, job, condition),
    createRelationshipHookEffect(actorId, job, scored),
    freezeEffect({
      type: RESTORED_LIFE_JOB_EFFECT_TYPES.UI_MESSAGE,
      targetId: actorId,
      payload: { message: `${job.displayName} complete: ${scored.grade} / ${formatRestoredDp(wageDp)}` }
    })
  ];
  if (shouldGrantBonusItem(job.bonusItem, scored.grade)) effects.splice(3, 0, createBonusItemEffect(actorId, job.bonusItem));
  return Object.freeze({
    ok: true,
    version: RESTORED_LIFE_JOB_CONTRACT_VERSION,
    type: "life_job_shift_completed",
    actorId,
    jobId: job.id,
    placeId: job.placeId,
    displayName: job.displayName,
    minutes: job.minutes,
    score: scored.score,
    grade: scored.grade,
    wageDp,
    wageText: formatRestoredDp(wageDp),
    tasks: createRestoredLifeJobTaskDeck(job.id),
    effects: Object.freeze(effects)
  });
}

export function validateRestoredLifeJobContract() {
  const errors = [];
  const jobs = listRestoredLifeJobs();
  if (jobs.length !== 2) errors.push("life job catalog should start with two jobs");
  if (new Set(jobs.map((job) => job.id)).size !== jobs.length) errors.push("life job ids must be unique");
  if (!getRestoredLifeJob(RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE)) errors.push("convenience store job is required");
  if (!getRestoredLifeJob(RESTORED_LIFE_JOB_IDS.FAST_FOOD)) errors.push("fast-food job is required");
  if (jobs.some((job) => job.baseWageDp <= 0 || job.minutes <= 0 || !job.tasks.length)) errors.push("each job needs wage, duration, and tasks");
  const high = scoreRestoredLifeJob(RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE, { accuracy: 95, speed: 90, service: 95, stamina: 90, combo: 4 });
  const low = scoreRestoredLifeJob(RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE, { accuracy: 10, speed: 10, service: 10, stamina: 10, mistakes: 5 });
  if (!(high.ok && low.ok && high.score > low.score && high.grade === "S" && low.grade === "F")) errors.push("job scoring must separate high and low performance");
  const result = createRestoredLifeJobResult(RESTORED_LIFE_JOB_IDS.FAST_FOOD, { accuracy: 80, speed: 80, service: 70, stamina: 75, combo: 2 });
  if (!result.ok || result.wageDp <= 0) errors.push("job result must produce a positive wage");
  if (!result.effects.some((effect) => effect.type === RESTORED_LIFE_JOB_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY)) errors.push("job result must emit a wage ledger effect");
  if (!result.effects.some((effect) => effect.type === RESTORED_LIFE_JOB_EFFECT_TYPES.RELATIONSHIP_EVENT_HOOK)) errors.push("job result must expose a relationship hook");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function createConditionDelta(job, scored) {
  return Object.freeze({
    energy: -Math.max(1, job.energyCost + Math.floor((100 - scored.performance.stamina) / 25)),
    mental: -(job.mentalCost + scored.performance.mistakes * 2) + (["S", "A"].includes(scored.grade) ? 2 : 0),
    reputation: job.reputationGain + scored.gradeRule.reputationBonus,
    timeMinutes: job.minutes
  });
}

function createWageEffect(actorId, job, wageDp, options) {
  return freezeEffect({
    type: RESTORED_LIFE_JOB_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY,
    targetId: actorId,
    payload: {
      entryType: "job_wage",
      currency: "DP",
      deltas: { cash: wageDp },
      reason: stringOrFallback(options.reason, `${job.displayName} wage`),
      placeId: job.placeId
    }
  });
}

function createConditionEffect(actorId, job, condition) {
  return freezeEffect({
    type: RESTORED_LIFE_JOB_EFFECT_TYPES.PLAYER_STATE_PATCH,
    targetId: actorId,
    payload: { placeId: job.placeId, deltas: condition }
  });
}

function createRelationshipHookEffect(actorId, job, scored) {
  return freezeEffect({
    type: RESTORED_LIFE_JOB_EFFECT_TYPES.RELATIONSHIP_EVENT_HOOK,
    targetId: actorId,
    payload: {
      hookId: job.relationshipHookId,
      sourceEventType: "job_completed",
      jobId: job.id,
      grade: scored.grade,
      deltas: { trust: scored.gradeRule.trust, stability: scored.gradeRule.stability, relationshipRisk: scored.gradeRule.risk }
    }
  });
}

function shouldGrantBonusItem(bonusItem, grade) {
  return Boolean(bonusItem && gradeRank(grade) >= gradeRank(bonusItem.minGrade));
}

function createBonusItemEffect(actorId, bonusItem) {
  return freezeEffect({
    type: RESTORED_LIFE_JOB_EFFECT_TYPES.INVENTORY_ITEM_GRANT,
    targetId: actorId,
    payload: { itemId: bonusItem.itemId, count: bonusItem.count }
  });
}
