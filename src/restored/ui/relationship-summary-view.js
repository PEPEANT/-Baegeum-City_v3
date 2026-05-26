import {
  getRestoredRelationshipRiskLabel,
  getRestoredRelationshipSummary,
  migrateLegacyRestoredPartner
} from "../systems/relationship-contract.js";

const SOCIAL_STATUS_LABELS = Object.freeze({
  lonely: "솔로",
  connected: "인연 있음",
  interested: "관심 있음",
  situationship: "썸",
  lover: "연인",
  unstable_lover: "불안한 연인",
  breakup_risk: "이별 위기"
});

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

const RISK_TONE_CLASSES = Object.freeze({
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  moderate: "bg-slate-50 text-slate-600 border-slate-100",
  high: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-red-50 text-red-700 border-red-100"
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelFrom(map, id, fallback = "알 수 없음") {
  return map[id] || fallback;
}

export function getRestoredRelationshipSummaryView(state = {}) {
  const summary = getRestoredRelationshipSummary(state);
  const focusPartner = summary.currentLover || summary.closestPartner;
  const partner = focusPartner ? migrateLegacyRestoredPartner(focusPartner) : null;
  const riskId = partner ? getRestoredRelationshipRiskLabel(partner) : "low";
  const headline = summary.loverCount > 0
    ? `연인 ${summary.loverCount}명`
    : labelFrom(SOCIAL_STATUS_LABELS, summary.socialStatus, "솔로");

  return Object.freeze({
    headline,
    helper: partner ? `${partner.displayName} · ${labelFrom(STAGE_LABELS, partner.stage)}` : "휴대폰 인연 앱에서 새 인연을 관리합니다.",
    riskLabel: labelFrom(RISK_LABELS, riskId),
    riskClass: RISK_TONE_CLASSES[riskId],
    partner,
    summary,
    metrics: Object.freeze(partner ? [
      Object.freeze({ id: "affection", label: "호감", value: partner.affection }),
      Object.freeze({ id: "trust", label: "신뢰", value: partner.trust }),
      Object.freeze({ id: "stability", label: "안정", value: partner.stability }),
      Object.freeze({ id: "relationshipRisk", label: "위험", value: partner.relationshipRisk })
    ] : [])
  });
}

export function renderRestoredRelationshipSummaryHtml(state = {}) {
  const view = getRestoredRelationshipSummaryView(state);
  const escapedHelper = escapeHtml(view.helper);
  if (!view.partner) {
    return `<div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">${escapedHelper}</div>`;
  }
  const metricHtml = view.metrics.map((metric) => `
    <div>
      <div class="flex justify-between text-[10px] font-bold text-slate-500"><span>${escapeHtml(metric.label)}</span><span>${metric.value}%</span></div>
      <div class="mt-1 h-1.5 rounded-full bg-white overflow-hidden"><div class="h-full bg-pink-500" style="width:${metric.value}%"></div></div>
    </div>
  `).join("");

  return `
    <div class="rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-black text-slate-800">${escapeHtml(view.headline)}</div>
          <div class="mt-1 text-xs font-bold text-slate-500">${escapedHelper}</div>
        </div>
        <span class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${view.riskClass}">위험 ${escapeHtml(view.riskLabel)}</span>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">${metricHtml}</div>
    </div>
  `;
}
