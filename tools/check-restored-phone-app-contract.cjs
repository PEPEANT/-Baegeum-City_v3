"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const restoredRoot = path.join(root, "src", "restored");
const htmlPath = path.join(root, "baegeum-city-v2-dice.html");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertPhoneAppContract() {
  const phonePath = pathToFileURL(path.join(restoredRoot, "phone", "phone-app-contract.js")).href;
  const appStoreViewPath = pathToFileURL(path.join(restoredRoot, "phone", "app-store-view.js")).href;
  const futuresViewPath = pathToFileURL(path.join(restoredRoot, "phone", "futures-app-view.js")).href;
  const newsViewPath = pathToFileURL(path.join(restoredRoot, "phone", "news-app-view.js")).href;
  const relationshipViewPath = pathToFileURL(path.join(restoredRoot, "phone", "relationship-app-view.js")).href;
  const stockViewPath = pathToFileURL(path.join(restoredRoot, "phone", "stock-app-view.js")).href;
  const shellPath = pathToFileURL(path.join(restoredRoot, "ui", "shell-contract.js")).href;
  const phone = await import(phonePath);
  const appStoreView = await import(appStoreViewPath);
  const futuresView = await import(futuresViewPath);
  const newsView = await import(newsViewPath);
  const relationshipView = await import(relationshipViewPath);
  const stockView = await import(stockViewPath);
  const shell = await import(shellPath);
  const folderPhoneApps = phone.listUsableRestoredPhoneApps({ hasPhone: true, hasSmartPhone: false });
  const smartPhoneApps = phone.listUsableRestoredPhoneApps({ hasPhone: true, hasSmartPhone: true });

  assert(phone.validateRestoredPhoneAppContract().ok, "restored phone app contract must validate.");
  assert(shell.validateRestoredShellContract().ok, "restored shell contract must accept phone app contract.");
  assert(phone.getRestoredPhoneAppGate("news") === "phone", "news must require a phone.");
  assert(phone.getRestoredPhoneAppGate("stock") === "phone", "stock must require a phone.");
  assert(phone.getRestoredPhoneAppGate("relationships") === "phone", "relationships must require a phone.");
  assert(phone.getRestoredPhoneAppGate("app_store") === "smartphone", "app store must require a smartphone.");
  assert(phone.getRestoredPhoneAppGate("futures") === "smartphone", "futures must require a smartphone.");
  assert(folderPhoneApps.map((app) => app.id).join(",") === "news,stock,relationships", "folder phone must unlock news, stock, and relationships only.");
  assert(smartPhoneApps.some((app) => app.id === "relationships"), "smartphone must keep relationships available.");
  assert(smartPhoneApps.some((app) => app.id === "app_store"), "smartphone must unlock the app store.");
  assert(smartPhoneApps.some((app) => app.id === "futures"), "smartphone must unlock futures.");

  const storeRows = appStoreView.listRestoredPhoneStoreRows({ installedAppIds: phone.listRestoredPhoneAppIds(), device: { hasPhone: true, hasSmartPhone: true } });
  const storeHtml = appStoreView.renderRestoredPhoneAppStoreView({ installedAppIds: phone.listRestoredPhoneAppIds(), device: { hasPhone: true, hasSmartPhone: true } });
  assert(storeRows.some((row) => row.id === "messenger" && row.status.label === "준비중"), "app store view must show planned messenger without making it live.");
  assert(storeRows.some((row) => row.id === "relationships" && row.status.label === "설치됨"), "app store view must show installed live apps.");
  assert(storeHtml.includes("배금 스토어"), "app store view must render the store title.");
  assert(storeHtml.includes("BaeTalk"), "app store view must expose messenger as a store candidate.");

  const emptyNewsHtml = newsView.renderRestoredNewsListHtml({ newsHistory: [] });
  const newsHtml = newsView.renderRestoredNewsListHtml({ newsHistory: [{ time: "09:30", msg: "테스트 속보" }] });
  assert(emptyNewsHtml.includes("아직 수신된 뉴스가 없습니다"), "news app view must render an empty state.");
  assert(newsHtml.includes("09:30"), "news app view must render news time.");
  assert(newsHtml.includes("테스트 속보"), "news app view must render news message.");

  const stockRendered = stockView.renderRestoredStockAppView({
    stocks: {
      NASDAQ: { name: "나스닥", price: 10, qty: 0, avg: 0 },
      TEST: { name: "테스트", price: 2, qty: 3, avg: 1 }
    }
  }, {
    cycles: { NEUTRAL: { label: "중립", color: "text-gray-500" } },
    marketCycle: "NEUTRAL",
    chartHistory: [10, 11],
    currentTickerMsg: "시장 테스트",
    hasPhone: true,
    formatMoney: (value) => `${value}원`
  });
  assert(stockRendered.tickerHtml.includes("시장 테스트"), "stock app view must render ticker text.");
  assert(stockRendered.stockRowsHtml.includes("openTradeModal('TEST','buy')"), "stock app view must keep the existing trade entry.");
  assert(stockRendered.portfolioHtml.includes("테스트"), "stock app view must render portfolio rows.");
  assert(stockRendered.chartHtml.includes("bg-indigo-600"), "stock app view must render the latest chart bar.");

  const futuresRendered = futuresView.renderRestoredFuturesAppView({
    crypto: { BTC: { price: 100 } },
    futures: [{ symbol: "BTC", type: "long", entry: 100, margin: 10, leverage: 2 }]
  }, {
    selectedCrypto: "BTC",
    currentTickerMsg: "코인 테스트",
    hasSmartPhone: true,
    formatMoney: (value) => `${value}원`
  });
  assert(futuresRendered.cryptoPriceText.includes("100.00"), "futures app view must render selected crypto price.");
  assert(futuresRendered.tickerHtml.includes("코인 테스트"), "futures app view must render ticker text.");
  assert(futuresRendered.positionsHtml.includes("closeFutures(0)"), "futures app view must keep the existing close entry.");
  assert(futuresView.findRestoredLiquidatedFuturesPositionIndex({
    crypto: { BTC: { price: 1 } },
    futures: [{ symbol: "BTC", type: "long", entry: 100, margin: 10, leverage: 1 }]
  }) === 0, "futures app view must expose liquidation detection.");

  const rendered = relationshipView.renderRestoredRelationshipPhoneAppView({
    partners: [{ name: "Han", emoji: "H", love: 70, trust: 44, stability: 38, relationshipRisk: 20 }],
    relationshipLogs: [
      { partnerId: "partner:legacy:1", day: 2, type: "date", summary: "카페 데이트", deltas: { affection: 3 } }
    ]
  });
  assert(rendered.summaryLabel, "relationship phone app view must expose a summary label.");
  assert(rendered.listHtml.includes("openInteractModal(0)"), "relationship phone app cards must keep the existing interaction entry.");
  assert(rendered.listHtml.includes("70%"), "relationship phone app cards must render migrated affection.");
  assert(rendered.logHtml.includes("카페 데이트"), "relationship phone app must render recent relationship logs.");
  assert(rendered.logHtml.includes("호감 +3"), "relationship phone app logs must render relationship deltas.");
}

function assertHtmlWiring() {
  const html = read(htmlPath);
  assert(html.includes("./src/restored/phone/phone-app-contract.js"), "restored HTML must import the phone app contract.");
  assert(html.includes("./src/restored/phone/app-store-view.js"), "restored HTML must import the app store view renderer.");
  assert(html.includes("./src/restored/phone/futures-app-view.js"), "restored HTML must import the futures app view renderer.");
  assert(html.includes("./src/restored/phone/news-app-view.js"), "restored HTML must import the news app view renderer.");
  assert(html.includes("./src/restored/phone/relationship-app-view.js"), "restored HTML must import the relationship app view renderer.");
  assert(html.includes("./src/restored/phone/stock-app-view.js"), "restored HTML must import the stock app view renderer.");
  assert(html.includes("listUsableRestoredPhoneApps(device)"), "phone tab must derive visible apps from the phone app contract.");
  assert(html.includes("renderRestoredStockAppView(gameState"), "stock app rendering must be delegated to the phone view module.");
  assert(html.includes("renderRestoredFuturesAppView(gameState"), "futures app rendering must be delegated to the phone view module.");
  assert(html.includes("renderRestoredNewsListHtml(gameState)"), "news app list rendering must be delegated to the phone view module.");
  assert(html.includes("renderRestoredRelationshipPhoneAppView(gameState)"), "relationship app rendering must be delegated to the phone view module.");
  assert(html.includes("renderRestoredPhoneAppStoreView({ installedAppIds: listRestoredPhoneAppIds(), device })"), "app store rendering must be delegated to the phone view module.");
  assert(html.includes('id="phone-app-relationships"'), "relationship app view must live in the phone shell.");
  assert(html.includes('id="phone-partner-list"'), "partner list must render inside the phone app.");
  assert(html.includes('id="phone-relationship-log-list"'), "relationship logs must render inside the phone app.");
  assert(html.includes("logs.innerHTML = view.logHtml"), "relationship log HTML must be delegated to the phone view module.");
  assert(html.includes('id="phone-dock"'), "phone shell must be opened from the dock above location navigation.");
  assert(html.includes("renderRelationshipPhoneApp()"), "phone relationship app must have a renderer.");
  assert(html.includes("renderAppStorePhoneApp(device)"), "phone app store must have a renderer.");
  assert(!html.includes("gameState.partners.forEach"), "relationship partner cards must not be rendered inline in the restored HTML.");
  assert(!html.includes("gameState.newsHistory.forEach"), "news cards must not be rendered inline in the restored HTML.");
  assert(!html.includes("sl.innerHTML +=") && !html.includes("pl.innerHTML +="), "stock rows must not be rendered inline in the restored HTML.");
  assert(!html.includes("gameState.futures.forEach"), "futures position cards must not be rendered inline in the restored HTML.");
  assert(!html.includes('id="partner-list"'), "my info must not own the full partner list.");
  assert(!html.includes('id="nav-phone"'), "phone must not be a fixed bottom nav tab.");
  assert(!html.includes("phone-app-futures-btn\" class="), "futures app button must not be hard-coded in HTML markup.");
  assert(!html.includes("['news', 'stock', 'futures']"), "restored HTML must not own the phone app id list.");
}

function assertDocs() {
  const recomposition = read(path.join(root, "docs", "baegeum-city-v2-restored-recomposition-plan.md"));
  const roadmap = read(path.join(root, "docs", "baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md"));
  assert(recomposition.includes("src/restored/phone/phone-app-contract.js"), "recomposition plan must mention the phone app contract.");
  assert(roadmap.includes("src/restored/phone/phone-app-contract.js"), "UI roadmap must mention the phone app contract.");
}

(async () => {
  await assertPhoneAppContract();
  assertHtmlWiring();
  assertDocs();
  console.log("Restored phone app contract check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
