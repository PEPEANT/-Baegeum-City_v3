export const RESTORED_RELATIONSHIP_CONTRACT_VERSION = "restored-relationship-001";

export const RESTORED_RELATIONSHIP_STAGES = Object.freeze([
  "stranger",
  "acquaintance",
  "interested",
  "situationship",
  "lover",
  "unstable_lover",
  "cooldown",
  "breakup_risk",
  "broken_up",
  "reunion_possible"
]);

export const RESTORED_ECONOMIC_IMPRESSIONS = Object.freeze([
  "stable",
  "trying",
  "unstable",
  "reckless",
  "dangerous"
]);

export const RESTORED_RELATIONSHIP_LOG_TYPES = Object.freeze([
  "conversation",
  "date",
  "gift",
  "confession",
  "conflict",
  "recovery",
  "economic_reaction",
  "memory"
]);

const DEFAULT_PARTNER_METRICS = Object.freeze({
  affection: 0,
  trust: 25,
  stability: 25,
  relationshipRisk: 30,
  tension: 0,
  jealousy: 0,
  comfort: 0
});

function stringOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampPercent(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeStage(stage) {
  if (RESTORED_RELATIONSHIP_STAGES.includes(stage)) return stage;
  return null;
}

function normalizeEconomicImpression(value, fallback = "unstable") {
  if (RESTORED_ECONOMIC_IMPRESSIONS.includes(value)) return value;
  return fallback;
}

function normalizeLogType(type) {
  if (RESTORED_RELATIONSHIP_LOG_TYPES.includes(type)) return type;
  return "memory";
}

function freezeDeltas(deltas = {}) {
  return Object.freeze({
    affection: Math.round(Number(deltas.affection || 0)),
    trust: Math.round(Number(deltas.trust || 0)),
    stability: Math.round(Number(deltas.stability || 0)),
    relationshipRisk: Math.round(Number(deltas.relationshipRisk || 0)),
    tension: Math.round(Number(deltas.tension || 0)),
    jealousy: Math.round(Number(deltas.jealousy || 0)),
    comfort: Math.round(Number(deltas.comfort || 0))
  });
}

export function migrateLegacyRestoredPartner(partner = {}, index = 0) {
  const affection = clampPercent(partner.affection ?? partner.love, DEFAULT_PARTNER_METRICS.affection);
  const trust = clampPercent(partner.trust, partner.isLover ? 45 : DEFAULT_PARTNER_METRICS.trust);
  const stability = clampPercent(partner.stability, partner.isLover ? 40 : DEFAULT_PARTNER_METRICS.stability);
  const relationshipRisk = clampPercent(partner.relationshipRisk, partner.isLover ? 20 : DEFAULT_PARTNER_METRICS.relationshipRisk);
  const migrated = {
    ...partner,
    relationshipVersion: RESTORED_RELATIONSHIP_CONTRACT_VERSION,
    id: stringOrFallback(partner.id, `partner:legacy:${index + 1}`),
    archetypeId: stringOrFallback(partner.archetypeId, "legacy"),
    displayName: stringOrFallback(partner.displayName, partner.name || `Partner ${index + 1}`),
    affection,
    trust,
    stability,
    economicImpression: normalizeEconomicImpression(partner.economicImpression),
    relationshipRisk,
    tension: clampPercent(partner.tension, DEFAULT_PARTNER_METRICS.tension),
    jealousy: clampPercent(partner.jealousy, DEFAULT_PARTNER_METRICS.jealousy),
    comfort: clampPercent(partner.comfort, DEFAULT_PARTNER_METRICS.comfort),
    memoryEventIds: Array.isArray(partner.memoryEventIds) ? [...partner.memoryEventIds] : []
  };
  migrated.stage = normalizeStage(partner.stage) || inferRestoredRelationshipStage(migrated);
  return Object.freeze(migrated);
}

export function inferRestoredRelationshipStage(partner = {}) {
  const affection = clampPercent(partner.affection ?? partner.love);
  const trust = clampPercent(partner.trust, DEFAULT_PARTNER_METRICS.trust);
  const risk = clampPercent(partner.relationshipRisk, DEFAULT_PARTNER_METRICS.relationshipRisk);
  if (partner.stage === "broken_up" || partner.stage === "reunion_possible") return partner.stage;
  if (partner.isLover && risk >= 75) return "breakup_risk";
  if (partner.isLover && risk >= 55) return "unstable_lover";
  if (partner.isLover) return "lover";
  if (affection >= 70 && trust >= 40) return "situationship";
  if (affection >= 50) return "interested";
  if (affection >= 20) return "acquaintance";
  return "stranger";
}

export function applyRestoredRelationshipDelta(partner = {}, deltas = {}) {
  const migrated = migrateLegacyRestoredPartner(partner);
  const next = {
    ...migrated,
    affection: clampPercent(migrated.affection + Number(deltas.affection || 0)),
    trust: clampPercent(migrated.trust + Number(deltas.trust || 0)),
    stability: clampPercent(migrated.stability + Number(deltas.stability || 0)),
    relationshipRisk: clampPercent(migrated.relationshipRisk + Number(deltas.relationshipRisk || 0)),
    tension: clampPercent(migrated.tension + Number(deltas.tension || 0)),
    jealousy: clampPercent(migrated.jealousy + Number(deltas.jealousy || 0)),
    comfort: clampPercent(migrated.comfort + Number(deltas.comfort || 0)),
    economicImpression: normalizeEconomicImpression(deltas.economicImpression, migrated.economicImpression)
  };
  next.stage = inferRestoredRelationshipStage(next);
  return Object.freeze(next);
}

export function createRestoredRelationshipLogEntry(input = {}) {
  const type = normalizeLogType(input.type);
  const partnerId = stringOrFallback(input.partnerId, "partner:unknown");
  const day = Math.max(0, Math.round(Number(input.day || 0)));
  const source = stringOrFallback(input.sourceEventId, "manual");
  return Object.freeze({
    schemaVersion: RESTORED_RELATIONSHIP_CONTRACT_VERSION,
    id: stringOrFallback(input.id, `rel-log:${partnerId}:${type}:${day}:${source}`),
    partnerId,
    type,
    day,
    placeId: stringOrFallback(input.placeId, null),
    sourceEventId: stringOrFallback(input.sourceEventId, null),
    summary: stringOrFallback(input.summary, "Relationship event recorded."),
    deltas: freezeDeltas(input.deltas),
    createdAt: stringOrFallback(input.createdAt, null)
  });
}

export function getRecentRestoredRelationshipLogs(stateOrLogs = {}, limit = 5) {
  const logs = Array.isArray(stateOrLogs) ? stateOrLogs : stateOrLogs.relationshipLogs || [];
  return logs
    .map((log) => createRestoredRelationshipLogEntry(log))
    .sort((a, b) => b.day - a.day || String(b.id).localeCompare(String(a.id)))
    .slice(0, Math.max(0, Math.round(Number(limit || 0))));
}

export function getClosestRestoredPartner(stateOrPartners = {}) {
  const partners = Array.isArray(stateOrPartners) ? stateOrPartners : stateOrPartners.partners || [];
  if (!partners.length) return null;
  return partners
    .map((partner, index) => migrateLegacyRestoredPartner(partner, index))
    .sort((a, b) => partnerScore(b) - partnerScore(a))[0];
}

export function getCurrentRestoredLover(stateOrPartners = {}) {
  const partners = Array.isArray(stateOrPartners) ? stateOrPartners : stateOrPartners.partners || [];
  return partners
    .map((partner, index) => migrateLegacyRestoredPartner(partner, index))
    .find((partner) => partner.isLover || partner.stage === "lover" || partner.stage === "unstable_lover") || null;
}

export function getRestoredRelationshipRiskLabel(partner = {}) {
  const risk = clampPercent(partner.relationshipRisk, DEFAULT_PARTNER_METRICS.relationshipRisk);
  if (risk >= 80) return "critical";
  if (risk >= 55) return "high";
  if (risk >= 30) return "moderate";
  return "low";
}

export function getRestoredConfessionReadiness(partner = {}, context = {}) {
  const migrated = migrateLegacyRestoredPartner(partner);
  const mental = clampPercent(context.mental, 100);
  const casinoLoss = Math.max(0, Math.round(Number(context.recentCasinoLoss || 0)));
  const checks = [
    { id: "affection", ok: migrated.affection >= 60, current: migrated.affection, required: 60 },
    { id: "trust", ok: migrated.trust >= 40, current: migrated.trust, required: 40 },
    { id: "recent_date", ok: Boolean(context.hasRecentDate), current: context.hasRecentDate ? 1 : 0, required: 1 },
    { id: "mental", ok: mental >= 60, current: mental, required: 60 },
    { id: "casino_loss", ok: casinoLoss <= 50000, current: casinoLoss, required: 50000 }
  ];
  return Object.freeze({ canConfess: checks.every((check) => check.ok), checks: Object.freeze(checks) });
}

export function getRestoredRelationshipSummary(state = {}) {
  const partners = state.partners || [];
  const currentLover = getCurrentRestoredLover(partners);
  const closestPartner = getClosestRestoredPartner(partners);
  return Object.freeze({
    partnerCount: partners.length,
    loverCount: partners.filter((partner) => migrateLegacyRestoredPartner(partner).isLover).length,
    currentLover,
    closestPartner,
    socialStatus: getSocialStatus(currentLover, closestPartner)
  });
}

export function validateRestoredRelationshipContract() {
  const errors = [];
  const migrated = migrateLegacyRestoredPartner({ name: "Tester", love: 64 });
  if (migrated.affection !== 64) errors.push("legacy love must migrate to affection");
  if (!RESTORED_RELATIONSHIP_STAGES.includes(migrated.stage)) errors.push("migrated partner must have a valid stage");
  const risky = applyRestoredRelationshipDelta(migrated, { trust: -50, relationshipRisk: 90 });
  if (risky.trust !== 0 || risky.relationshipRisk !== 100) errors.push("relationship deltas must clamp to 0..100");
  const log = createRestoredRelationshipLogEntry({ partnerId: migrated.id, type: "date", day: 2, deltas: { affection: 3 } });
  if (log.deltas.affection !== 3 || log.type !== "date") errors.push("relationship log entries must preserve type and deltas");
  const readiness = getRestoredConfessionReadiness({ affection: 70, trust: 45 }, { mental: 65, hasRecentDate: true, recentCasinoLoss: 0 });
  if (!readiness.canConfess) errors.push("confession readiness should pass when all checks pass");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function partnerScore(partner) {
  return partner.affection + partner.trust + partner.stability - partner.relationshipRisk;
}

function getSocialStatus(currentLover, closestPartner) {
  if (currentLover && currentLover.stage === "breakup_risk") return "breakup_risk";
  if (currentLover && currentLover.stage === "unstable_lover") return "unstable_lover";
  if (currentLover) return "lover";
  if (closestPartner?.stage === "situationship") return "situationship";
  if (closestPartner?.stage === "interested") return "interested";
  return closestPartner ? "connected" : "lonely";
}
