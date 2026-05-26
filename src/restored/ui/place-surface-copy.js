export const RESTORED_PLACE_SURFACE_COPY = Object.freeze({
  fast_food: Object.freeze({
    meta: "Home Front",
    title: "패스트푸드점",
    copy: "따뜻한 불빛과 튀김 냄새가 새어 나오는 동네 매장입니다.",
    actions: Object.freeze([
      Object.freeze({ label: "햄버거 세트", tone: "emerald" }),
      Object.freeze({ label: "아르바이트 문의", tone: "slate" })
    ])
  }),
  labor_office: Object.freeze({
    meta: "Work",
    title: "인력소",
    copy: "새벽부터 일감 쪽지가 붙는 작은 사무실입니다.",
    actions: Object.freeze([
      Object.freeze({ label: "단기 알바", tone: "indigo" }),
      Object.freeze({ label: "직업 게시판", tone: "slate" })
    ])
  }),
  convenience_store: Object.freeze({
    meta: "Shop",
    title: "편의점",
    copy: "생활용품과 중고 휴대폰을 살 수 있는 집앞 상점입니다.",
    actions: Object.freeze([Object.freeze({ label: "상점 보기", tone: "indigo", tab: "shop" })])
  }),
  job_places: Object.freeze({
    meta: "Baegeum City",
    cards: Object.freeze([
      Object.freeze({ title: "고시원", status: "수면/저장 후보", copy: "하루를 넘기는 가장 싼 방. 생활 루프의 시작점." }),
      Object.freeze({ title: "편의점", status: "알바 후보", copy: "짧은 근무, 낮은 보상, 초반 체력 소모 검증용." }),
      Object.freeze({ title: "맥버거", status: "알바 후보", copy: "식사/알바/체력 회복을 한 곳에 묶을 매장." }),
      Object.freeze({ title: "인력소", status: "직업 확장 후보", copy: "공장, 배달, 단기 일감으로 이어질 구직 허브." })
    ]),
    title: "배금도시 일자리",
    copy: "정장 차림 사람들과 구직 전단이 뒤섞인 고용 거리입니다.",
    actions: Object.freeze([Object.freeze({ label: "구인 게시판", tone: "indigo" })])
  }),
  shops: Object.freeze({
    meta: "Baegeum City",
    title: "상가와 금융 거리",
    copy: "원화 생활권은 유지하고, 다이스시티용 DPA 환전 표지와 소비 시설만 전면에 세웁니다.",
    cards: Object.freeze([
      Object.freeze({ title: "디페이 ATM", status: "DPA 환전 후보", copy: "1 DPA = 1,000원. 카지노 토큰은 원화와 분리." }),
      Object.freeze({ title: "배금증권", status: "폰 앱 연결", copy: "주식/뉴스는 거리 탭이 아니라 휴대폰 앱으로 진입." }),
      Object.freeze({ title: "배금은행", status: "대출 전 단계", copy: "계좌, 신용등급, 향후 온라인 로비 검증과 연결." }),
      Object.freeze({ title: "중고차 매장", status: "이동 확장 후보", copy: "도시 간 빠른 이동은 차량 시스템 이후에 개방." })
    ]),
    actions: Object.freeze([
      Object.freeze({ label: "상점 보기", tone: "indigo", tab: "shop" }),
      Object.freeze({ label: "DPA 환전 준비중", tone: "amber", message: "DPA 환전은 계약만 준비된 상태입니다." })
    ])
  }),
  relationships: Object.freeze({
    meta: "Baegeum City",
    title: "인연의 거리",
    copy: "약속을 잡은 사람들과 우연한 시선이 오가는 거리입니다.",
    actions: Object.freeze([
      Object.freeze({ label: "산책하기", tone: "pink", action: "walk" }),
      Object.freeze({ label: "휴대폰 연락처", tone: "slate", tab: "phone" })
    ])
  }),
  casino_street: Object.freeze({
    meta: "Dice City",
    cards: Object.freeze([
      Object.freeze({ title: "룰렛카지노", status: "계약 있음", copy: "휠/구슬 애니메이션은 별도 디자인 테스트에서 연결." }),
      Object.freeze({ title: "바카라카지노", status: "계약 있음", copy: "카드 공개 연출 전, 플레이어/뱅커 룰부터 분리." }),
      Object.freeze({ title: "경마장", status: "애니메이션 후보", copy: "말 이동은 화면 어댑터, 배당/정산은 계약으로 분리." }),
      Object.freeze({ title: "DPA 환전소", status: "1000원=1DPA", copy: "칩이라는 말 대신 다이스시티 전용 DPA로 표시." })
    ]),
    title: "카지노거리",
    copy: "슬롯, 블랙잭, 룰렛 업장이 각자 불빛을 켠 다이스시티 메인 거리입니다.",
    actions: Object.freeze([
      Object.freeze({ label: "슬롯카지노", tone: "amber", message: "슬롯카지노는 DiceLand식 독립 게임 패널로 분리 예정입니다." }),
      Object.freeze({ label: "블랙잭카지노", tone: "indigo", tab: "casino" }),
      Object.freeze({ label: "룰렛카지노", tone: "pink", message: "룰렛카지노는 배당표와 0 규칙을 분리해 붙일 예정입니다." })
    ])
  }),
  exchange: Object.freeze({
    meta: "Dice City",
    title: "환전소",
    copy: "조용한 유리창 너머로 칩과 현금이 오가는 곳입니다.",
    actions: Object.freeze([Object.freeze({ label: "칩 확인", tone: "amber" })])
  }),
  pawnshop: Object.freeze({
    meta: "Dice City",
    cards: Object.freeze([
      Object.freeze({ title: "담보 접수 창구", status: "계약 있음", copy: "아이템 보류/상환/처분 이벤트는 분리 완료." }),
      Object.freeze({ title: "감정 전광판", status: "추가 후보", copy: "가방, 금괴, 시계 같은 보유품 가치를 표시." })
    ]),
    title: "전당포",
    copy: "명품과 보유품을 담보로 현금을 마련하는 어두운 유리창의 가게입니다.",
    actions: Object.freeze([Object.freeze({ label: "담보 목록", tone: "amber" })])
  }),
  loan_office: Object.freeze({
    meta: "Dice City",
    title: "사채업소",
    copy: "빠른 돈과 큰 위험이 같은 봉투에 담겨 나오는 사무실입니다.",
    actions: Object.freeze([Object.freeze({ label: "대출 상담", tone: "slate" })])
  }),
  hotel: Object.freeze({
    meta: "Dice City",
    title: "호텔",
    copy: "두꺼운 카펫과 낮은 조명이 이어지는 다이스시티의 숙소입니다.",
    actions: Object.freeze([Object.freeze({ label: "방 잡기", tone: "indigo" })])
  }),
  nightlife: Object.freeze({
    meta: "Dice City",
    title: "밤거리",
    copy: "간판 불빛과 소문이 늦은 밤까지 꺼지지 않는 거리입니다.",
    actions: Object.freeze([Object.freeze({ label: "거리 둘러보기", tone: "slate" })])
  }),
  port: Object.freeze({
    meta: "Seosan City",
    title: "항구",
    copy: "짠 바람과 화물차 소리가 하루 종일 이어지는 항구입니다.",
    actions: Object.freeze([Object.freeze({ label: "부두 작업", tone: "indigo" })])
  }),
  factory: Object.freeze({
    meta: "Seosan City",
    title: "공장",
    copy: "교대 근무 표와 기계음이 벽 안쪽에서 돌아가는 공장입니다.",
    actions: Object.freeze([Object.freeze({ label: "교대 근무", tone: "slate" })])
  }),
  market: Object.freeze({
    meta: "Seosan City",
    title: "시장",
    copy: "상인들의 목소리와 물건 흥정이 빠르게 오가는 시장입니다.",
    actions: Object.freeze([Object.freeze({ label: "시장 둘러보기", tone: "emerald" })])
  })
});

export const RESTORED_PLACE_BUTTON_TONES = Object.freeze({
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  pink: "border-pink-100 bg-pink-50 text-pink-700",
  slate: "border-slate-100 bg-slate-50 text-slate-700"
});

export function renderRestoredPlaceSurfaceHtml(copy = {}) {
  const actions = (copy.actions || []).map(renderActionButton).join("");
  const rows = (copy.cards || []).map(renderSurfaceRow).join("");
  const list = rows ? `<div class="col-span-1 sm:col-span-2 border-t border-slate-100 pt-4"><div class="divide-y divide-slate-100">${rows}</div></div>` : "";
  return actions + list || `<div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold text-slate-400">준비 중</div>`;
}

function renderActionButton(item) {
  const tone = RESTORED_PLACE_BUTTON_TONES[item.tone] || RESTORED_PLACE_BUTTON_TONES.slate;
  const click = item.action === "walk" ? "goForWalk()" : item.tab === "phone" ? "openPhoneSurface()" : item.tab ? `switchTab(${JSON.stringify(item.tab)})` : `showToast(${JSON.stringify(item.message || "준비 중입니다.")})`;
  return `<button onclick='${click}' class="py-4 rounded-2xl border ${tone} font-bold active:scale-95 transition">${escapeHtml(item.label)}</button>`;
}

function renderSurfaceRow(item) {
  return `<div class="flex items-start justify-between gap-3 py-3"><div><div class="text-sm font-black text-slate-800">${escapeHtml(item.title)}</div><div class="mt-0.5 text-xs text-slate-500">${escapeHtml(item.copy)}</div></div><div class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">${escapeHtml(item.status)}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
