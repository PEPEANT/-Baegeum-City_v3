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

export function renderRestoredStockTickerHtml({ hasPhone = false, currentTickerMsg = "" } = {}) {
  if (!hasPhone) {
    return '<div class="w-full text-center text-gray-400 text-xs py-2 bg-gray-100 flex justify-center gap-2">🔒 <span class="blur-sm">휴대폰이 없어 정보를 볼 수 없습니다</span></div>';
  }
  return `<div class="bg-red-600 px-3 py-2 text-xs font-bold text-white z-10 shrink-0">LIVE</div><div class="marquee-container flex-1 py-2 text-sm text-gray-700 bg-gray-50 overflow-hidden"><div class="marquee-content" id="stock-marquee-text">${escapeHtml(currentTickerMsg)}</div></div>`;
}

export function renderRestoredNasdaqChartHtml(chartHistory = []) {
  const history = chartHistory.length ? chartHistory : [0];
  const min = Math.min(...history) * 0.99;
  const max = Math.max(...history) * 1.01;
  return history.map((price, index) => {
    const height = ((price - min) / Math.max(1, max - min)) * 100;
    const color = index === history.length - 1 ? "bg-indigo-600 animate-pulse" : "bg-indigo-200";
    return `<div class="flex-1 mx-0.5 rounded-t-sm ${color}" style="height:${Math.max(5, height)}%"></div>`;
  }).join("");
}

export function renderRestoredStockTradeRowsHtml(state = {}, options = {}) {
  const stocks = state.stocks || {};
  return Object.keys(stocks).map((ticker) => {
    const stock = stocks[ticker] || {};
    return `<tr class="group hover:bg-gray-50"><td class="px-4 py-3 font-bold text-gray-700">${escapeHtml(stock.name)}</td><td class="px-4 py-3 text-right font-mono font-bold text-gray-800">${formatMoney(stock.price, options)}</td><td class="px-4 py-3 text-center space-x-1"><button onclick="openTradeModal('${escapeHtml(ticker)}','buy')" class="bg-red-50 text-red-600 text-xs px-2 py-1 rounded border">매수</button><button onclick="openTradeModal('${escapeHtml(ticker)}','sell')" class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border">매도</button></td></tr>`;
  }).join("");
}

export function renderRestoredPortfolioHtml(state = {}, options = {}) {
  const rows = listRestoredPortfolioRows(state, options);
  if (!rows.length) return '<div class="text-center text-xs text-gray-400 py-8">보유 주식 없음</div>';
  return rows.map((row) => `
    <div class="flex justify-between items-center text-sm p-3 border-b border-gray-100 hover:bg-gray-50 transition">
      <div><div class="font-bold text-gray-800">${escapeHtml(row.name)}</div><div class="text-xs text-gray-400 mt-0.5">${row.qty}주 | 평단 ${row.avgText}</div></div>
      <div class="text-right"><div class="font-bold text-gray-900">${row.currentValueText}</div><div class="text-xs font-bold ${row.colorClass}">${row.pnlPrefix}${row.pnlText} (${row.pnlRateText})</div></div>
    </div>
  `).join("");
}

export function listRestoredPortfolioRows(state = {}, options = {}) {
  const stocks = state.stocks || {};
  return Object.keys(stocks)
    .map((ticker) => {
      const stock = stocks[ticker] || {};
      const qty = Number(stock.qty || 0);
      if (qty <= 0) return null;
      const currentValue = Number(stock.price || 0) * qty;
      const buyValue = Number(stock.avg || 0) * qty;
      const pnl = currentValue - buyValue;
      const pnlRate = Number(stock.avg || 0) > 0 ? ((Number(stock.price || 0) - Number(stock.avg || 0)) / Number(stock.avg || 0)) * 100 : 0;
      return Object.freeze({
        ticker,
        name: stock.name || ticker,
        qty,
        avgText: formatMoney(stock.avg, options),
        currentValueText: formatMoney(currentValue, options),
        pnlText: formatMoney(pnl, options),
        pnlPrefix: pnl > 0 ? "+" : "",
        pnlRateText: `${pnlRate.toFixed(2)}%`,
        colorClass: pnl >= 0 ? "text-red-600" : "text-blue-600"
      });
    })
    .filter(Boolean);
}

export function renderRestoredStockAppView(state = {}, options = {}) {
  const cycle = options.cycles?.[options.marketCycle] || { label: "중립", color: "text-gray-500" };
  return Object.freeze({
    marketCycleLabel: cycle.label,
    marketCycleClass: `text-2xl font-black transition-colors duration-500 ${cycle.color}`,
    nasdaqPriceText: formatMoney(state.stocks?.NASDAQ?.price || 0, options),
    tickerHtml: renderRestoredStockTickerHtml(options),
    chartHtml: renderRestoredNasdaqChartHtml(options.chartHistory || []),
    stockRowsHtml: renderRestoredStockTradeRowsHtml(state, options),
    portfolioHtml: renderRestoredPortfolioHtml(state, options)
  });
}
