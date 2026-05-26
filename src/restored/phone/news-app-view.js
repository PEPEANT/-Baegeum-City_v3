function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function listRestoredNewsCards(state = {}) {
  const newsHistory = Array.isArray(state.newsHistory) ? state.newsHistory : [];
  return newsHistory.map((news, index) => Object.freeze({
    id: news.id || `news:${index}`,
    time: news.time || "시간 미상",
    message: news.msg || news.message || ""
  }));
}

export function renderRestoredNewsListHtml(state = {}) {
  const cards = listRestoredNewsCards(state);
  if (!cards.length) {
    return '<div class="bg-white p-6 rounded-2xl border text-center text-sm text-gray-400">아직 수신된 뉴스가 없습니다.</div>';
  }
  return cards.map(renderNewsCardHtml).join("");
}

export function renderRestoredNewsAppView(state = {}) {
  return Object.freeze({
    listHtml: renderRestoredNewsListHtml(state)
  });
}

function renderNewsCardHtml(card) {
  return `
    <div class="bg-white p-3 rounded-lg border shadow-sm text-sm">
      <div class="text-xs text-gray-400">${escapeHtml(card.time)}</div>
      <div>${escapeHtml(card.message)}</div>
    </div>
  `;
}
