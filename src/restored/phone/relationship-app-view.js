import {
  getRecentRestoredRelationshipLogs,
  getRestoredRelationshipRiskLabel,
  migrateLegacyRestoredPartner
} from "../systems/relationship-contract.js";
import { getRestoredRelationshipSummaryView } from "../ui/relationship-summary-view.js";

const STAGE_LABELS = Object.freeze({
  stranger: "모르는 사이",
  acquaintance: "아는 사이",
  interested: "관심 있음",
  situationship: "썸",
  lover: "연인",
  unstable_lover: "불안한 연인",
  cooldown: "권태기",
  breakup_risk: "이별 위기",
  broken_up: "이별",
  reunion_possible: "재회 가능"
});

const RISK_LABELS = Object.freeze({
  low: "낮음",
  moderate: "보통",
  high: "높음",
  critical: "위험"
});

const RISK_CLASSES = Object.freeze({
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  moderate: "bg-slate-50 text-slate-600 border-slate-100",
  high: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-red-50 text-red-700 border-red-100"
});

const LOG_TYPE_LABELS = Object.freeze({
  conversation: "대화",
  date: "데이트",
  gift: "선물",
  confession: "고백",
  conflict: "갈등",
  recovery: "회복",
  economic_reaction: "경제 반응",
  memory: "기록"
});

const DELTA_LABELS = Object.freeze({
  affection: "호감",
  trust: "신뢰",
  stability: "안정",
  relationshipRisk: "위험",
  tension: "긴장",
  jealousy: "질투",
  comfort: "안도"
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stageLabel(stage) {
  return STAGE_LABELS[stage] || "관계 확인 중";
}

function riskLabel(riskId) {
  return RISK_LABELS[riskId] || RISK_LABELS.moderate;
}

export function listRestoredRelationshipPhoneCards(state = {}) {
  const partners = Array.isArray(state.partners) ? state.partners : [];
  return partners.map((partner, index) => {
    const migrated = migrateLegacyRestoredPartner(partner, index);
    const riskId = getRestoredRelationshipRiskLabel(migrated);
    return Object.freeze({
      index,
      id: migrated.id,
      emoji: migrated.emoji || "👤",
      displayName: migrated.displayName,
      title: migrated.title || stageLabel(migrated.stage),
      stageLabel: stageLabel(migrated.stage),
      riskLabel: riskLabel(riskId),
      riskClass: RISK_CLASSES[riskId] || RISK_CLASSES.moderate,
      isLover: Boolean(migrated.isLover || migrated.stage === "lover" || migrated.stage === "unstable_lover"),
      affection: migrated.affection,
      trust: migrated.trust,
      stability: migrated.stability,
      relationshipRisk: migrated.relationshipRisk
    });
  });
}

export function renderRestoredRelationshipPhonePartnerListHtml(state = {}) {
  const cards = listRestoredRelationshipPhoneCards(state);
  if (!cards.length) {
    return '<div class="text-gray-400 text-center py-8 text-xs">등록된 인연이 없습니다.</div>';
  }
  return cards.map(renderPartnerCardHtml).join("");
}

export function listRestoredRelationshipPhoneLogCards(state = {}, limit = 5) {
  const partnerNames = new Map(
    (Array.isArray(state.partners) ? state.partners : []).map((partner, index) => {
      const migrated = migrateLegacyRestoredPartner(partner, index);
      return [migrated.id, migrated.displayName];
    })
  );

  return getRecentRestoredRelationshipLogs(state, limit).map((log) => Object.freeze({
    id: log.id,
    typeLabel: LOG_TYPE_LABELS[log.type] || LOG_TYPE_LABELS.memory,
    dayLabel: log.day > 0 ? `${log.day}일차` : "기록",
    partnerName: partnerNames.get(log.partnerId) || "알 수 없는 인연",
    summary: log.summary,
    deltaText: formatLogDeltas(log.deltas)
  }));
}

export function renderRestoredRelationshipPhoneLogListHtml(state = {}, limit = 5) {
  const logs = listRestoredRelationshipPhoneLogCards(state, limit);
  if (!logs.length) {
    return '<div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-400">아직 관계 기록이 없습니다.</div>';
  }
  return logs.map(renderLogCardHtml).join("");
}

export function renderRestoredRelationshipPhoneAppView(state = {}) {
  const summary = getRestoredRelationshipSummaryView(state);
  return Object.freeze({
    summaryLabel: summary.headline,
    listHtml: renderRestoredRelationshipPhonePartnerListHtml(state),
    logHtml: renderRestoredRelationshipPhoneLogListHtml(state)
  });
}

function renderPartnerCardHtml(card) {
  const statusBadge = card.isLover
    ? '<span class="text-[10px] bg-pink-100 text-pink-600 font-bold px-1.5 py-0.5 rounded">연인</span>'
    : `<span class="text-[10px] bg-white text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-100">${escapeHtml(card.stageLabel)}</span>`;
  return `
    <div class="bg-pink-50 p-3 rounded-xl border border-pink-100 space-y-3">
      <div class="flex justify-between items-start gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="text-2xl shrink-0">${escapeHtml(card.emoji)}</div>
          <div class="min-w-0">
            <div class="font-bold text-gray-800 text-sm flex items-center gap-1 flex-wrap">${escapeHtml(card.displayName)} ${statusBadge}</div>
            <div class="text-[10px] font-bold text-slate-400 mt-0.5">${escapeHtml(card.title)}</div>
          </div>
        </div>
        <button onclick="openInteractModal(${card.index})" title="대화 열기" class="w-10 h-10 rounded-full bg-white border border-pink-200 text-xl shadow-sm active:scale-95 transition shrink-0">📞</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        ${renderMetricHtml("호감", card.affection, "bg-pink-500")}
        ${renderMetricHtml("신뢰", card.trust, "bg-indigo-500")}
        ${renderMetricHtml("안정", card.stability, "bg-emerald-500")}
        ${renderMetricHtml("위험", card.relationshipRisk, "bg-amber-500")}
      </div>
      <div class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${card.riskClass}">관계 위험 ${escapeHtml(card.riskLabel)}</div>
    </div>
  `;
}

function renderMetricHtml(label, value, barClass) {
  return `
    <div>
      <div class="flex justify-between text-[10px] font-bold text-slate-500"><span>${label}</span><span>${value}%</span></div>
      <div class="mt-1 h-1.5 bg-white rounded-full overflow-hidden"><div class="h-full ${barClass}" style="width:${value}%"></div></div>
    </div>
  `;
}

function renderLogCardHtml(log) {
  const deltaHtml = log.deltaText
    ? `<div class="mt-1 text-[10px] font-black text-pink-600">${escapeHtml(log.deltaText)}</div>`
    : "";
  return `
    <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div class="flex items-center justify-between gap-3">
        <div class="text-[10px] font-black text-slate-400">${escapeHtml(log.dayLabel)} · ${escapeHtml(log.typeLabel)}</div>
        <div class="text-[10px] font-bold text-slate-400">${escapeHtml(log.partnerName)}</div>
      </div>
      <div class="mt-1 text-xs font-bold text-slate-700">${escapeHtml(log.summary)}</div>
      ${deltaHtml}
    </div>
  `;
}

function formatLogDeltas(deltas = {}) {
  return Object.entries(DELTA_LABELS)
    .map(([key, label]) => {
      const value = Math.round(Number(deltas[key] || 0));
      if (!value) return "";
      return `${label} ${value > 0 ? "+" : ""}${value}`;
    })
    .filter(Boolean)
    .join(" · ");
}
