import {
  applyRestoredRelationshipDelta,
  createRestoredRelationshipLogEntry,
  inferRestoredRelationshipStage,
  migrateLegacyRestoredPartner
} from "./relationship-contract.js";

export const RESTORED_RELATIONSHIP_EVENT_RUNTIME_VERSION = "restored-relationship-event-001";
export const RESTORED_RELATIONSHIP_LOG_LIMIT = 30;

const RELATIONSHIP_ACTIONS = Object.freeze({
  met: event("relationship_met", "conversation", "새로운 인연이 생겼습니다.", {}),
  interest: event("relationship_talked", "conversation", "관심을 보이며 대화를 시작했습니다.", { affection: 5, trust: 1 }),
  call: event("relationship_talked", "conversation", "전화 통화로 조금 더 가까워졌습니다.", { affection: 8, trust: 2, comfort: 1 }),
  ai_talk: event("relationship_talked", "conversation", "진심이 담긴 대화를 나눴습니다.", { affection: 2, trust: 1, comfort: 1 }),
  gift: event("relationship_gift_given", "gift", "선물을 건넸습니다.", { affection: 25, trust: 4, stability: -1 }),
  intimacy: event("relationship_recovered", "recovery", "깊은 시간을 보내며 안정감을 회복했습니다.", { affection: 3, trust: 2, stability: 2, comfort: 5, relationshipRisk: -3 }),
  marry: event("relationship_confession_accepted", "confession", "청혼이 받아들여졌습니다.", { trust: 8, stability: 10, comfort: 6, relationshipRisk: -12 }),
  drift: event("relationship_drifted", "memory", "연락이 뜸해지며 관계가 멀어졌습니다.", { affection: -2, stability: -1, relationshipRisk: 1 })
});

function event(type, logType, summary, deltas) {
  return Object.freeze({ type, logType, summary, deltas: Object.freeze(deltas) });
}

export function applyRestoredRelationshipAction(partner = {}, actionId = "", options = {}) {
  const action = RELATIONSHIP_ACTIONS[actionId];
  if (!action) return Object.freeze({ ok: false, error: "unknown_relationship_action", actionId });
  const partnerIndex = Math.max(0, Math.round(Number(options.partnerIndex || 0)));
  const migrated = migrateLegacyRestoredPartner(partner, partnerIndex);
  const deltas = { ...action.deltas, ...(options.deltas || {}) };
  const changed = withLegacyCompatibility(applyRestoredRelationshipDelta(migrated, deltas), actionId);
  const sourceEventId = String(options.sourceEventId || `rel-event:${changed.id}:${actionId}:${options.eventIndex || 0}`);
  const eventRecord = Object.freeze({
    schemaVersion: RESTORED_RELATIONSHIP_EVENT_RUNTIME_VERSION,
    id: sourceEventId,
    type: action.type,
    partnerId: changed.id,
    actionId,
    createdAt: options.createdAt || null
  });
  const log = createRestoredRelationshipLogEntry({
    id: `rel-log:${sourceEventId}`,
    partnerId: changed.id,
    type: action.logType,
    day: options.day || 0,
    placeId: options.placeId || null,
    sourceEventId,
    summary: options.summary || action.summary,
    deltas,
    createdAt: options.createdAt || null
  });
  return Object.freeze({ ok: true, actionId, event: eventRecord, log, partner: changed });
}

export function appendRestoredRelationshipLog(logs = [], log = null, limit = RESTORED_RELATIONSHIP_LOG_LIMIT) {
  if (!log) return Array.isArray(logs) ? [...logs] : [];
  return Object.freeze([log, ...(Array.isArray(logs) ? logs : [])].slice(0, Math.max(1, Math.round(Number(limit || 1)))));
}

export function validateRestoredRelationshipEventRuntime() {
  const first = applyRestoredRelationshipAction({ name: "Han", love: 40 }, "interest", { partnerIndex: 0, eventIndex: 1 });
  const gift = applyRestoredRelationshipAction({ name: "Yuna", love: 90, trust: 50 }, "gift", { partnerIndex: 1, eventIndex: 2 });
  const logs = appendRestoredRelationshipLog([], first.log, 1);
  const errors = [];
  if (!first.ok || first.partner.affection !== 45 || first.partner.love !== 45) errors.push("interest must update v2 metrics and legacy love");
  if (!first.log.summary || first.log.deltas.affection !== 5) errors.push("relationship actions must create visible logs");
  if (!gift.partner.isLover || gift.partner.title !== "연인") errors.push("high affection actions must promote lover state");
  if (logs.length !== 1 || logs[0].id !== first.log.id) errors.push("relationship logs must append and cap");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function withLegacyCompatibility(partner, actionId) {
  const shouldPromote = actionId === "marry" || partner.isLover || partner.affection >= 100;
  const next = {
    ...partner,
    love: partner.affection,
    isLover: shouldPromote,
    title: actionId === "marry" ? "배우자" : (shouldPromote ? "연인" : partner.title)
  };
  next.stage = inferRestoredRelationshipStage(next);
  return Object.freeze(next);
}
