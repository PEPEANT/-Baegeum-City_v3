import { listRestoredPhoneEcosystemApps } from "./phone-app-ecosystem-contract.js";

const STORE_STATUS = Object.freeze({
  installed: { label: "설치됨", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  locked: { label: "스마트폰 필요", className: "bg-slate-100 text-slate-500 border-slate-200" },
  planned: { label: "준비중", className: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  online: { label: "온라인 준비중", className: "bg-amber-50 text-amber-700 border-amber-100" }
});

const APP_DESCRIPTIONS = Object.freeze({
  news: "도시와 시장 속보를 확인합니다.",
  stock: "주식, 포트폴리오, 시장 사이클을 봅니다.",
  relationships: "연인 목록, 관계 기록, 대화 진입점을 봅니다.",
  futures: "스마트폰 전용 코인선물 거래 앱입니다.",
  messenger: "파트너 DM과 향후 유저 채팅을 위한 메신저입니다.",
  community: "가상 게시판과 도시 루머를 분리해서 보여줍니다.",
  rankings: "직업, 자산, 평판 랭킹을 준비합니다.",
  bank: "계좌, 신용도, 대출 상태를 정리합니다.",
  pay: "D-Pay 영수증과 DPA 환전 힌트를 모읍니다.",
  map: "도시 지도, 버스, 빠른 이동 경로를 준비합니다.",
  online_lobby: "서버 연결 후에만 열릴 온라인 로비입니다."
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function listRestoredPhoneStoreRows({ installedAppIds = [], device = {} } = {}) {
  const installed = new Set(installedAppIds);
  return listRestoredPhoneEcosystemApps()
    .filter((app) => app.id !== "app_store")
    .map((app) => {
      const statusId = resolveStoreStatus(app, installed, device);
      return Object.freeze({
        ...app,
        description: APP_DESCRIPTIONS[app.id] || "배금도시 휴대폰 기능입니다.",
        status: STORE_STATUS[statusId],
        requirement: app.gate === "smartphone" ? "스마트폰" : "휴대폰"
      });
    });
}

export function renderRestoredPhoneAppStoreView(options = {}) {
  const rows = listRestoredPhoneStoreRows(options);
  return `
    <div class="space-y-4">
      <section class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div><h2 class="text-xl font-black text-gray-800">🛒 배금 스토어</h2><p class="text-xs font-bold text-slate-400 mt-1">앱 설치와 잠금 상태</p></div>
          <span class="text-[10px] font-black px-3 py-1 rounded-full bg-slate-900 text-white">스마트폰 전용</span>
        </div>
        <div class="space-y-2">${rows.map(renderStoreRow).join("")}</div>
      </section>
    </div>
  `;
}

function resolveStoreStatus(app, installed, device) {
  if (app.gate === "smartphone" && !device.hasSmartPhone) return "locked";
  if (app.phase === "future_online") return "online";
  if (installed.has(app.id) && app.phase === "live") return "installed";
  return "planned";
}

function renderStoreRow(row) {
  return `
    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-black text-sm text-slate-800">${escapeHtml(row.label)}</div>
          <div class="text-xs text-slate-500 mt-1 leading-relaxed">${escapeHtml(row.description)}</div>
          <div class="text-[10px] font-bold text-slate-400 mt-2">필요 기기: ${escapeHtml(row.requirement)} · 영역: ${escapeHtml(row.domain)}</div>
        </div>
        <span class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${row.status.className}">${escapeHtml(row.status.label)}</span>
      </div>
    </div>
  `;
}
