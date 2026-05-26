export const RESTORED_MARKET_CONTRACT_VERSION = "restored-market-contract-001";

export const RESTORED_MARKET_IDS = Object.freeze({
  DOMESTIC: "domestic",
  UNITED_STATES: "united_states",
  CRYPTO_SPOT: "crypto_spot",
  CRYPTO_LEVERAGE: "crypto_leverage"
});

export const RESTORED_MARKET_ASSET_IDS = Object.freeze({
  BAEGEUM_ELECTRONICS: "domestic:baegeum-electronics"
});

export const RESTORED_MARKET_TIMEFRAMES = Object.freeze(["1m", "5m", "1d", "1w"]);

export const RESTORED_MARKET_TABS = Object.freeze([
  Object.freeze({ id: RESTORED_MARKET_IDS.DOMESTIC, label: "Domestic", leverageAllowed: false, phoneGate: "phone" }),
  Object.freeze({ id: RESTORED_MARKET_IDS.UNITED_STATES, label: "United States", leverageAllowed: false, phoneGate: "phone" }),
  Object.freeze({ id: RESTORED_MARKET_IDS.CRYPTO_SPOT, label: "Crypto Spot", leverageAllowed: false, phoneGate: "smartphone" }),
  Object.freeze({ id: RESTORED_MARKET_IDS.CRYPTO_LEVERAGE, label: "Crypto Leverage", leverageAllowed: true, phoneGate: "smartphone" })
]);

export const RESTORED_BAEGEUM_ELECTRONICS_ASSET = Object.freeze({
  id: RESTORED_MARKET_ASSET_IDS.BAEGEUM_ELECTRONICS,
  marketId: RESTORED_MARKET_IDS.DOMESTIC,
  ticker: "BGE",
  displayName: "Baegeum Electronics",
  priceUnit: "DP",
  basePrice: 72400,
  baseVolume: 1280000,
  leverageAllowed: false,
  realCompanyReference: false,
  tags: Object.freeze(["domestic", "large_cap", "semiconductor", "ai", "smartphone", "data_center"]),
  aiExposure: 0.82,
  volatility: 0.018
});

export const RESTORED_AI_SUPERCYCLE_PHASES = Object.freeze(["early", "expansion", "euphoria", "crack", "cooldown"]);

export function listRestoredMarketTabs() {
  return RESTORED_MARKET_TABS;
}

export function getRestoredMarketTab(marketId) {
  return RESTORED_MARKET_TABS.find((tab) => tab.id === marketId) || null;
}

export function formatRestoredDp(value) {
  return `${roundRestoredDp(value).toLocaleString()} DP`;
}

export function roundRestoredDp(value) {
  return Math.max(0, Math.round(Number(value || 0)));
}

export function createRestoredBaegeumElectronicsCandles(options = {}) {
  const count = clampInteger(options.count, 1, 240, 32);
  const timeframe = RESTORED_MARKET_TIMEFRAMES.includes(options.timeframe) ? options.timeframe : "1d";
  const basePrice = Number(options.basePrice || RESTORED_BAEGEUM_ELECTRONICS_ASSET.basePrice);
  const baseVolume = Number(options.baseVolume || RESTORED_BAEGEUM_ELECTRONICS_ASSET.baseVolume);
  const heat = clampNumber(options.aiHeat, 0, 100, 35);
  const phaseBias = getAiSupercyclePhaseBias(options.aiPhase || "early");
  let previousClose = roundRestoredDp(basePrice);

  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.73) * 0.009 + Math.cos((index + 1) * 0.41) * 0.006;
    const heatBias = ((heat - 50) / 10000) * RESTORED_BAEGEUM_ELECTRONICS_ASSET.aiExposure;
    const trend = (index - count / 2) * 0.00018;
    const closeMove = trend + wave + heatBias + phaseBias;
    const open = previousClose;
    const close = roundRestoredDp(open * (1 + closeMove));
    const spread = Math.max(80, roundRestoredDp(open * (0.004 + Math.abs(wave) * 0.55)));
    const high = Math.max(open, close) + spread;
    const low = Math.max(1, Math.min(open, close) - spread);
    const volume = Math.max(1, Math.round(baseVolume * (1 + Math.abs(wave) * 15 + heat / 300 + index / 180)));
    previousClose = close;

    return Object.freeze({
      assetId: RESTORED_BAEGEUM_ELECTRONICS_ASSET.id,
      timeframe,
      t: index,
      open,
      high,
      low,
      close,
      volume
    });
  });
}

export function summarizeRestoredCandles(candles = []) {
  const rows = Array.isArray(candles) ? candles.filter(isValidCandle) : [];
  if (!rows.length) return createEmptyMarketSummary();
  const last = rows[rows.length - 1];
  const previous = rows[rows.length - 2] || rows[0];
  const previousClose = Number(previous.close || previous.open || last.open || 0);
  const currentPrice = Number(last.close || 0);
  const change = currentPrice - previousClose;
  const high = Math.max(...rows.map((candle) => Number(candle.high || 0)));
  const low = Math.min(...rows.map((candle) => Number(candle.low || currentPrice)));
  const volume = rows.reduce((sum, candle) => sum + Number(candle.volume || 0), 0);
  return Object.freeze({
    currentPrice,
    previousClose,
    change,
    changeRate: previousClose > 0 ? change / previousClose : 0,
    high,
    low,
    volume
  });
}

export function createRestoredBaegeumElectronicsSnapshot(options = {}) {
  const candles = options.candles || createRestoredBaegeumElectronicsCandles(options);
  const summary = summarizeRestoredCandles(candles);
  return Object.freeze({
    version: RESTORED_MARKET_CONTRACT_VERSION,
    asset: RESTORED_BAEGEUM_ELECTRONICS_ASSET,
    marketId: RESTORED_MARKET_IDS.DOMESTIC,
    timeframe: candles[0]?.timeframe || "1d",
    candles: Object.freeze([...candles]),
    summary,
    priceText: formatRestoredDp(summary.currentPrice),
    changeText: `${summary.change >= 0 ? "+" : ""}${formatRestoredDp(summary.change)}`,
    changeRateText: `${summary.changeRate >= 0 ? "+" : ""}${(summary.changeRate * 100).toFixed(2)}%`
  });
}

export function calculateRestoredHoldingQuote(holding = {}, currentPrice = 0) {
  const qty = Math.max(0, Number(holding.qty || 0));
  const avgPrice = roundRestoredDp(holding.avgPrice || holding.avg || 0);
  const valuation = roundRestoredDp(qty * currentPrice);
  const costBasis = roundRestoredDp(qty * avgPrice);
  const unrealizedPnl = valuation - costBasis;
  return Object.freeze({
    qty,
    avgPrice,
    valuation,
    costBasis,
    unrealizedPnl,
    unrealizedPnlRate: costBasis > 0 ? unrealizedPnl / costBasis : 0,
    valuationText: formatRestoredDp(valuation),
    unrealizedPnlText: `${unrealizedPnl >= 0 ? "+" : ""}${formatRestoredDp(unrealizedPnl)}`
  });
}

export function createRestoredMarketOrderPreview(input = {}) {
  const side = input.side === "sell" ? "sell" : "buy";
  const qty = Math.max(0, Math.floor(Number(input.qty || 0)));
  const price = roundRestoredDp(input.price);
  const gross = roundRestoredDp(qty * price);
  const cash = roundRestoredDp(input.cash);
  const holdingQty = Math.max(0, Math.floor(Number(input.holdingQty || 0)));

  if (qty <= 0) return rejectedOrder(side, "invalid_quantity", qty, price);
  if (price <= 0) return rejectedOrder(side, "invalid_price", qty, price);
  if (side === "buy" && cash < gross) return rejectedOrder(side, "insufficient_dp", qty, price, gross);
  if (side === "sell" && holdingQty < qty) return rejectedOrder(side, "insufficient_quantity", qty, price, gross);

  return Object.freeze({
    ok: true,
    type: "market_order_requested",
    marketId: RESTORED_MARKET_IDS.DOMESTIC,
    assetId: RESTORED_BAEGEUM_ELECTRONICS_ASSET.id,
    side,
    qty,
    price,
    gross,
    priceUnit: "DP",
    cashDelta: side === "buy" ? -gross : gross,
    quantityDelta: side === "buy" ? qty : -qty,
    reason: "ok"
  });
}

export function validateRestoredMarketContract() {
  const errors = [];
  const tabIds = RESTORED_MARKET_TABS.map((tab) => tab.id);
  for (const required of Object.values(RESTORED_MARKET_IDS)) {
    if (!tabIds.includes(required)) errors.push(`missing market tab: ${required}`);
  }
  if (RESTORED_BAEGEUM_ELECTRONICS_ASSET.priceUnit !== "DP") errors.push("baegeum electronics must use DP");
  if (RESTORED_BAEGEUM_ELECTRONICS_ASSET.leverageAllowed) errors.push("domestic asset must not allow leverage");
  if (RESTORED_BAEGEUM_ELECTRONICS_ASSET.realCompanyReference) errors.push("v0.1 asset must be fictional");
  if (!getRestoredMarketTab(RESTORED_MARKET_IDS.CRYPTO_LEVERAGE)?.leverageAllowed) errors.push("crypto leverage tab must allow leverage");
  if (getRestoredMarketTab(RESTORED_MARKET_IDS.DOMESTIC)?.leverageAllowed) errors.push("domestic tab must not allow leverage");
  return Object.freeze({ ok: errors.length === 0, errors });
}

function getAiSupercyclePhaseBias(phase) {
  if (phase === "expansion") return 0.0015;
  if (phase === "euphoria") return 0.0032;
  if (phase === "crack") return -0.005;
  if (phase === "cooldown") return -0.001;
  return 0.0004;
}

function clampInteger(value, min, max, fallback) {
  const next = Math.floor(Number.isFinite(Number(value)) ? Number(value) : fallback);
  return Math.max(min, Math.min(max, next));
}

function clampNumber(value, min, max, fallback) {
  const next = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Math.max(min, Math.min(max, next));
}

function isValidCandle(candle) {
  return candle && Number.isFinite(Number(candle.open)) && Number.isFinite(Number(candle.close));
}

function createEmptyMarketSummary() {
  return Object.freeze({ currentPrice: 0, previousClose: 0, change: 0, changeRate: 0, high: 0, low: 0, volume: 0 });
}

function rejectedOrder(side, reason, qty, price, gross = 0) {
  return Object.freeze({
    ok: false,
    type: "market_order_rejected",
    marketId: RESTORED_MARKET_IDS.DOMESTIC,
    assetId: RESTORED_BAEGEUM_ELECTRONICS_ASSET.id,
    side,
    qty,
    price,
    gross,
    priceUnit: "DP",
    cashDelta: 0,
    quantityDelta: 0,
    reason
  });
}
