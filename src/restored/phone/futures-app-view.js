const DEFAULT_EXCHANGE_RATE = 1350;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function defaultFormatMoney(usd) {
  const krw = Number(usd || 0) * DEFAULT_EXCHANGE_RATE;
  if (Math.abs(krw) >= 100000000) return `${(krw / 100000000).toFixed(1)}억원`;
  return `${Math.floor(krw).toLocaleString()}원`;
}

function formatMoney(value, options = {}) {
  return typeof options.formatMoney === "function" ? options.formatMoney(value) : defaultFormatMoney(value);
}

export function getRestoredCryptoPriceText(state = {}, selectedCrypto = "BTC") {
  const price = Number(state.crypto?.[selectedCrypto]?.price || 0);
  return price.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

export function renderRestoredFuturesTickerHtml({ hasSmartPhone = false, currentTickerMsg = "" } = {}) {
  if (!hasSmartPhone) {
    return '<div class="w-full text-center text-gray-500 text-xs py-2 bg-slate-800 flex justify-center gap-2">🔒 <span class="blur-sm">스마트폰이 필요합니다</span></div>';
  }
  return `<div class="bg-blue-600 px-3 py-2 text-xs font-bold text-white z-10 shrink-0">CRYPTO</div><div class="marquee-container flex-1 py-2 text-sm text-cyan-300 bg-slate-800 overflow-hidden"><div class="marquee-content" id="futures-marquee-text">${escapeHtml(currentTickerMsg)}</div></div>`;
}

export function listRestoredFuturesPositionCards(state = {}, options = {}) {
  const positions = Array.isArray(state.futures) ? state.futures : [];
  return positions.map((position, index) => {
    const currentPrice = Number(state.crypto?.[position.symbol]?.price || 0);
    const entry = Number(position.entry || 0);
    const leverage = Number(position.leverage || 1);
    const margin = Number(position.margin || 0);
    const ratio = entry > 0
      ? position.type === "long"
        ? ((currentPrice - entry) / entry) * leverage
        : ((entry - currentPrice) / entry) * leverage
      : 0;
    const value = margin * ratio;
    return Object.freeze({
      index,
      symbol: position.symbol,
      type: position.type,
      entry,
      leverage,
      ratio,
      value,
      valueText: formatMoney(value, options),
      valuePrefix: value >= 0 ? "+" : "",
      ratioText: `${(ratio * 100).toFixed(2)}%`,
      valueClass: value >= 0 ? "text-green-600" : "text-red-500",
      ratioClass: ratio >= 0 ? "text-green-500" : "text-red-400",
      typeClass: position.type === "long" ? "text-green-600" : "text-red-600",
      isLiquidated: ratio <= -0.95
    });
  });
}

export function findRestoredLiquidatedFuturesPositionIndex(state = {}) {
  const card = listRestoredFuturesPositionCards(state).find((position) => position.isLiquidated);
  return card ? card.index : -1;
}

export function renderRestoredFuturesPositionsHtml(state = {}, options = {}) {
  const cards = listRestoredFuturesPositionCards(state, options);
  if (!cards.length) return '<div class="p-4 text-center text-gray-400 text-xs">포지션 없음</div>';
  return cards.map(renderPositionCardHtml).join("");
}

export function renderRestoredFuturesAppView(state = {}, options = {}) {
  return Object.freeze({
    cryptoPriceText: getRestoredCryptoPriceText(state, options.selectedCrypto),
    tickerHtml: renderRestoredFuturesTickerHtml(options),
    positionsHtml: renderRestoredFuturesPositionsHtml(state, options)
  });
}

function renderPositionCardHtml(card) {
  return `
    <div class="p-3 bg-white flex justify-between items-center border-b border-gray-100 text-sm hover:bg-gray-50 transition">
      <div><div class="font-bold text-gray-800">${escapeHtml(card.symbol)} <span class="${card.typeClass} uppercase">${escapeHtml(card.type)}</span> x${card.leverage}</div><div class="text-xs text-gray-400 mt-0.5">진입: ${card.entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div></div>
      <div class="text-right"><div class="font-bold ${card.valueClass}">${card.valuePrefix}${card.valueText}</div><div class="text-xs font-bold ${card.ratioClass}">(${card.ratioText})</div><button onclick="closeFutures(${card.index})" class="bg-gray-100 border border-gray-200 text-xs px-2 py-1 rounded mt-1 hover:bg-gray-200 transition">청산</button></div>
    </div>
  `;
}
