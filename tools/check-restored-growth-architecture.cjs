"use strict";
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const root = path.resolve(__dirname, "..");
const restoredRoot = path.join(root, "src", "restored");
const htmlPath = path.join(root, "baegeum-city-v2-dice.html");
const docPath = path.join(root, "docs", "baegeum-city-v2-restored-growth-architecture.md");
const recompositionDocPath = path.join(root, "docs", "baegeum-city-v2-restored-recomposition-plan.md");
const indexPath = path.join(root, "docs", "INDEX.md");
const maxRestoredHtmlLines = 1500;
const maxRestoredJsLines = 250;
function read(file) {
  return fs.readFileSync(file, "utf8");
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function walk(dir, output = []) {
  if (!fs.existsSync(dir)) return output;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}
function lineCount(text) {
  return text.split(/\r?\n/).length;
}
function assertDocumentWiring() {
  const doc = read(docPath);
  const recompositionDoc = read(recompositionDocPath);
  const index = read(indexPath);
  assert(index.includes("baegeum-city-v2-restored-growth-architecture.md"), "restored growth architecture doc must be linked from docs/INDEX.md.");
  assert(index.includes("baegeum-city-v2-restored-recomposition-plan.md"), "restored recomposition plan must be linked from docs/INDEX.md.");
  assert(doc.includes("src/restored/"), "restored growth architecture doc must describe src/restored/.");
  assert(doc.includes("AI 연인"), "restored growth architecture doc must mention AI lover growth.");
  assert(doc.includes("일러스트"), "restored growth architecture doc must mention illustration rules.");
  assert(recompositionDoc.includes("Current Bottlenecks"), "restored recomposition plan must include a bottleneck audit.");
  assert(recompositionDoc.includes("AI Roaming Actor Model"), "restored recomposition plan must include AI roaming actors.");
  assert(recompositionDoc.includes("src/restored/actors/actor-contract.js"), "restored recomposition plan must point to the actor contract.");
  assert(recompositionDoc.includes("src/restored/ui/shell-contract.js"), "restored recomposition plan must point to the UI shell contract.");
  assert(recompositionDoc.includes("src/restored/data/place-catalog.js"), "restored recomposition plan must point to the place catalog.");
  assert(recompositionDoc.includes("src/restored/data/location-catalog.js"), "restored recomposition plan must point to the location catalog.");
  assert(recompositionDoc.includes("src/restored/online/online-adapter-contract.js"), "restored recomposition plan must point to the online adapter contract.");
}
function assertRestoredHtmlShell() {
  const html = read(htmlPath);
  assert(lineCount(html) <= maxRestoredHtmlLines, `baegeum-city-v2-dice.html has grown past ${maxRestoredHtmlLines} lines; split touched features into src/restored/.`);
  assert(html.includes("<script type=\"module\">"), "restored HTML runtime script must use module imports.");
  assert(html.includes("./src/restored/state/initial-state.js"), "restored HTML must import the restored initial state module.");
  assert(html.includes("./src/restored/state/storage.js"), "restored HTML must import the restored storage module.");
  assert(html.includes("./src/restored/state/selectors.js"), "restored HTML must import the restored selectors module.");
  assert(html.includes("./src/restored/data/market-catalog.js"), "restored HTML must import the restored market catalog.");
  assert(html.includes("./src/restored/data/partner-catalog.js"), "restored HTML must import the restored partner catalog.");
  assert(html.includes("./src/restored/data/rank-catalog.js"), "restored HTML must import the restored rank catalog.");
  assert(!html.includes("const INITIAL_STATE ="), "restored HTML must not own the INITIAL_STATE literal.");
  assert(!html.includes("localStorage.setItem(STORAGE_KEY"), "restored HTML save path must use src/restored/state/storage.js.");
  assert(!html.includes("const STORAGE_KEY ="), "restored HTML must not own the storage key literal.");
  assert(!html.includes("const RANKS ="), "restored HTML must not own rank catalog data.");
  assert(!html.includes("const CYCLES ="), "restored HTML must not own market-cycle catalog data.");
  assert(!html.includes("const NEWS_MESSAGES ="), "restored HTML must not own news-message catalog data.");
  assert(!html.includes("const CRASH_INTERNAL ="), "restored HTML must not own crash-message catalog data.");
  assert(!html.includes("데이터 백업 센터"), "restored HTML must not show the legacy data backup center.");
  assert(!html.includes("저장 코드"), "restored HTML must not expose legacy save-code UI.");
  assert(!html.includes("openLoadGameModal"), "restored HTML must not expose legacy save-code restore actions.");
  assert(!html.includes("function getMyTotalAsset("), "restored HTML must not own total-asset selector logic.");
  assert(!html.includes("function getMyRank("), "restored HTML must not own rank selector logic.");
  assert(!html.includes("function hasPhone("), "restored HTML must not own phone ownership selector logic.");
  assert(!html.includes("function hasSmartPhone("), "restored HTML must not own smartphone ownership selector logic.");
  assert(html.includes("id=\"tab-phone\""), "restored HTML must keep phone as the market app hub.");
  assert(html.includes("id=\"phone-dock\""), "restored HTML must expose phone from the dock above location tabs.");
  assert(html.includes("id=\"location-nav-items\""), "restored HTML must render location-aware bottom navigation.");
  assert(html.includes("listRestoredLocationNavActions"), "restored HTML must derive bottom actions from the location nav contract.");
  assert(html.includes("activateLocationAction"), "restored HTML must route bottom actions through location navigation.");
  assert(!html.includes("id=\"nav-phone\""), "phone must not return to bottom navigation.");
  assert(!html.includes("id=\"nav-news\""), "news must not return to bottom navigation.");
  assert(!html.includes("id=\"nav-stock\""), "stock must not return to bottom navigation.");
  assert(!html.includes("id=\"nav-futures\""), "futures must not return to bottom navigation.");
}

async function assertCityCatalog() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "data", "city-catalog.js")).href;
  const mod = await import(modulePath);
  const validation = mod.validateRestoredCityCatalog();
  assert(validation.ok, `restored city catalog invalid: ${validation.errors.join("; ")}`);
  const ids = mod.listRestoredCityIds();
  assert(ids.includes("baegeum-city"), "restored city catalog must include baegeum-city.");
  assert(ids.includes("dice-city"), "restored city catalog must include dice-city.");
  assert(ids.includes("seosan-city"), "restored city catalog must include seosan-city.");
  const baegeum = mod.getRestoredCity("baegeum-city");
  const dice = mod.getRestoredCity("dice-city");
  const seosan = mod.getRestoredCity("seosan-city");
  assert(baegeum.role !== dice.role, "baegeum-city and dice-city must keep distinct roles.");
  assert(seosan.role === "industry_hub", "seosan-city must own the industry hub role.");
  assert(dice.featureDomains.includes("casino"), "dice-city must own casino features.");
}

async function assertPlaceCatalog() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "data", "place-catalog.js")).href;
  const mod = await import(modulePath);
  const validation = mod.validateRestoredPlaceCatalog();
  assert(validation.ok, `restored place catalog invalid: ${validation.errors.join("; ")}`);
  const baegeumPlaces = mod.listRestoredPlacesForCity("baegeum-city");
  const dicePlaces = mod.listRestoredPlacesForCity("dice-city");
  const seosanPlaces = mod.listRestoredPlacesForCity("seosan-city");
  assert(baegeumPlaces.some((place) => place.actorSlots.includes("partner_meet")), "baegeum-city places must support partner meetings.");
  assert(dicePlaces.some((place) => place.actorSlots.includes("casino_staff")), "dice-city places must support casino staff actors.");
  assert(dicePlaces.some((place) => place.id === "dice:pawnshop"), "dice-city places must include a pawnshop.");
  assert(dicePlaces.some((place) => place.id === "dice:loan-office"), "dice-city places must include a loan office.");
  assert(seosanPlaces.some((place) => place.featureDomains.includes("jobs")), "seosan-city places must support job features.");
}

async function assertStaticCatalogExtraction() {
  const assetPath = pathToFileURL(path.join(restoredRoot, "data", "asset-catalog.js")).href;
  const marketPath = pathToFileURL(path.join(restoredRoot, "data", "market-catalog.js")).href;
  const partnerPath = pathToFileURL(path.join(restoredRoot, "data", "partner-catalog.js")).href;
  const rankPath = pathToFileURL(path.join(restoredRoot, "data", "rank-catalog.js")).href;
  const asset = await import(assetPath);
  const market = await import(marketPath);
  const partner = await import(partnerPath);
  const rank = await import(rankPath);

  assert(asset.validateRestoredAssetCatalog().ok, "restored asset catalog must validate.");
  assert(market.validateRestoredMarketCatalog().ok, "restored market catalog must validate.");
  assert(partner.validateRestoredPartnerCatalog().ok, "restored partner catalog must validate.");
  assert(rank.validateRestoredRankCatalog().ok, "restored rank catalog must validate.");
  assert(asset.createRestoredLuxuryState().phone.type === "essential", "asset catalog must seed phone ownership data.");
  assert(market.createRestoredStockState().NASDAQ.qty === 0, "market catalog must seed stock holdings.");
  assert(market.RESTORED_MARKET_CYCLE_ORDER.includes("NEUTRAL"), "market catalog must own cycle order.");
  assert(partner.createRestoredPartnerFromArchetype(partner.pickRestoredPartnerArchetype(() => 0)).love === 40, "partner catalog must create walk encounter partners.");
  assert(rank.RESTORED_RANKS[0].title, "rank catalog must expose rank titles.");
}

async function assertLocationNavContract() {
  const locationPath = pathToFileURL(path.join(restoredRoot, "data", "location-catalog.js")).href;
  const navPath = pathToFileURL(path.join(restoredRoot, "ui", "location-nav-contract.js")).href;
  const location = await import(locationPath);
  const nav = await import(navPath);
  const locationValidation = location.validateRestoredLocationCatalog();
  const navValidation = nav.validateRestoredLocationNavContract();

  assert(locationValidation.ok, `restored location catalog invalid: ${locationValidation.errors.join("; ")}`);
  assert(navValidation.ok, `restored location nav invalid: ${navValidation.errors.join("; ")}`);
  assert(location.listRestoredLocationContextIds().includes("home_inside"), "location catalog must include home_inside.");
  assert(nav.listRestoredLocationNavActions("home_inside").some((action) => action.id === "go_out"), "home_inside nav must include go_out.");
  assert(nav.getRestoredLocationNavAction("home_front", "labor_office"), "home_front nav must include labor_office.");
  assert(nav.getRestoredLocationNavAction("travel", "to_seosan"), "travel nav must include seosan-city.");
  assert(nav.getRestoredLocationNavAction("dice-city", "pawnshop"), "dice-city nav must include pawnshop.");
  assert(nav.getRestoredLocationNavAction("dice-city", "loan_office"), "dice-city nav must include loan office.");
}

async function assertActorContract() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "actors", "actor-contract.js")).href;
  const mod = await import(modulePath);
  const fixture = mod.createRestoredActorFixture();
  const validation = mod.validateRestoredActor(fixture);
  assert(validation.ok, `restored actor contract invalid: ${validation.errors.join("; ")}`);
  assert(mod.RESTORED_ACTOR_LOCATION_TYPES.includes("venue"), "restored actor contract must support venue locations.");
  assert(mod.RESTORED_ACTOR_EVENT_TYPES.includes("casino_loss_seen"), "restored actor contract must support casino memory events.");
}

async function assertShellContract() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "ui", "shell-contract.js")).href;
  const mod = await import(modulePath);
  const validation = mod.validateRestoredShellContract();
  assert(validation.ok, `restored shell contract invalid: ${validation.errors.join("; ")}`);
  const bottomTabs = mod.listRestoredBottomTabIds();
  const phoneApps = mod.listRestoredPhoneAppIds();
  assert(bottomTabs.includes("myinfo") && bottomTabs.includes("home") && bottomTabs.includes("go_out"), "restored shell contract must seed home-inside bottom actions.");
  assert(!bottomTabs.includes("phone"), "restored shell contract must keep phone out of bottom tabs.");
  assert(!bottomTabs.includes("news"), "news must stay inside phone apps.");
  assert(phoneApps.includes("news") && phoneApps.includes("stock") && phoneApps.includes("relationships") && phoneApps.includes("futures"), "phone apps must include news, stock, relationships, and futures.");
  assert(mod.getRestoredPhoneAppGate("relationships") === "phone", "relationships must require phone.");
  assert(mod.getRestoredPhoneAppGate("futures") === "smartphone", "futures must require smartphone.");
}

async function assertStateStorageContract() {
  const initialPath = pathToFileURL(path.join(restoredRoot, "state", "initial-state.js")).href;
  const storagePath = pathToFileURL(path.join(restoredRoot, "state", "storage.js")).href;
  const initial = await import(initialPath);
  const storage = await import(storagePath);
  const state = initial.createInitialRestoredState();
  assert(initial.EXCHANGE_RATE === 1350, "restored initial state must export the exchange rate.");
  assert(state.cash === 10000, "restored initial state must start with 10000 cash.");
  assert(state.luxury.phone.count === 0, "restored initial state must start without a phone.");
  assert(state.account.mode === "signed_out", "restored initial state must start signed out.");
  assert(state.online.status === "unavailable", "restored initial state must start with unavailable online status.");
  assert(state.location.contextId === "home_inside", "restored initial state must start inside home.");
  assert(storage.RESTORED_STORAGE_KEY === "baegeum_city_v2_dice_restore", "restored storage key must stay isolated.");
  const encoded = storage.encodeRestoredSaveCode({ cash: 1234 });
  const decoded = storage.restoreCashOnlyFromSaveCode(encoded);
  assert(decoded.ok && decoded.cash === 1234, "restored storage must roundtrip cash-only save codes.");
  const merged = initial.createInitialRestoredState();
  storage.mergeSavedRestoredState(merged, {
    cash: 55,
    luxury: { phone: { count: 1 } },
    account: { mode: "guest", playerId: "guest:test", displayName: "Tester" },
    online: { status: "disconnected", lastError: "network" }
  });
  assert(merged.luxury.phone.count === 1, "restored storage must preserve saved phone ownership.");
  assert(merged.account.displayName === "Tester", "restored storage must preserve saved account display name.");
  assert(merged.online.status === "disconnected", "restored storage must preserve online state.");
}

async function assertAccountSessionContract() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "account", "session-contract.js")).href;
  const mod = await import(modulePath);
  const signedOut = mod.createInitialRestoredAccountState();
  const guest = mod.createRestoredGuestAccountState({ displayName: "Tester", now: "2026-05-26T00:00:00.000Z" });
  const online = mod.createInitialRestoredOnlineState();

  assert(mod.validateRestoredAccountState(signedOut).ok, "signed-out account state must validate.");
  assert(mod.validateRestoredAccountState(guest).ok, "guest account state must validate.");
  assert(mod.canEnterRestoredGame(guest), "guest account must be able to enter restored game.");
  assert(!mod.shouldShowRestoredLegacySaveCodeUi(guest), "legacy save-code UI must be hidden by default.");
  assert(mod.validateRestoredOnlineState(online).ok, "initial online state must validate.");
  assert(!mod.validateRestoredOnlineState({ ...online, status: "unavailable", lobbyEnabled: true }).ok, "online lobby must not open while unavailable.");
}

async function assertOnlineAdapterContract() {
  const modulePath = pathToFileURL(path.join(restoredRoot, "online", "online-adapter-contract.js")).href;
  const mod = await import(modulePath);
  const unavailable = mod.createRestoredUnavailableOnlineAdapter();
  const connected = mod.createRestoredOnlineAdapterSnapshot({
    adapterType: "dev_mock", canConnect: true, canOpenLobby: true, provider: "dev_mock",
    state: { status: "connected", provider: "dev_mock", clientId: "client:test", lobbyEnabled: true }
  });
  assert(mod.validateRestoredOnlineAdapter(unavailable).ok, "unavailable online adapter must validate.");
  assert(!mod.canUseRestoredOnlineLobby(unavailable), "unavailable online adapter must not open lobby.");
  assert(mod.validateRestoredOnlineAdapter(connected).ok, "connected dev mock snapshot must validate for tests.");
  assert(mod.canUseRestoredOnlineLobby(connected), "connected dev mock snapshot must be lobby-capable.");
  assert(!mod.validateRestoredOnlineAdapter({ ...unavailable, canOpenLobby: true }).ok, "unavailable adapter must reject lobby access.");
}

async function assertSelectorsContract() {
  const selectorsPath = pathToFileURL(path.join(restoredRoot, "state", "selectors.js")).href;
  const initialPath = pathToFileURL(path.join(restoredRoot, "state", "initial-state.js")).href;
  const selectors = await import(selectorsPath);
  const initial = await import(initialPath);
  const state = initial.createInitialRestoredState();
  const ranks = [
    { limit: 100, title: "low" },
    { limit: 200, title: "mid" },
    { limit: 1000, title: "high" }
  ];

  state.cash = 100;
  state.stocks.NASDAQ.price = 10;
  state.stocks.NASDAQ.qty = 2;
  state.luxury.phone.price = 5;
  state.luxury.phone.count = 1;
  state.luxury.energy_drink.count = 2;
  state.realEstate.oneroom.price = 1000;
  state.realEstate.oneroom.count = 1;

  assert(selectors.getRestoredStockValue(state) === 20, "restored selectors must calculate stock value.");
  assert(selectors.getRestoredOwnershipValue(state) === 1005, "restored selectors must calculate ownership value.");
  assert(selectors.getRestoredTotalAsset(state) === 125, "restored selectors must preserve current total asset behavior.");
  assert(selectors.getRestoredRank(state, ranks).title === "mid", "restored selectors must resolve rank from total asset.");
  assert(selectors.getRestoredRankIndex(state, ranks) === 1, "restored selectors must expose rank index.");
  assert(selectors.listRestoredInventoryItems(state).some((item) => item.id === "energy_drink" && item.type === "consumable"), "restored selectors must list shop consumables in inventory.");
  assert(!selectors.listRestoredInventoryItems(state).some((item) => item.id === "oneroom"), "restored inventory must exclude real estate.");
  assert(selectors.hasRestoredPhone(state), "restored selectors must detect phone ownership.");
  assert(!selectors.hasRestoredSmartPhone(state), "restored selectors must keep smartphone gate separate from phone gate.");
  state.luxury.smartphone.count = 1;
  assert(selectors.hasRestoredSmartPhone(state), "restored selectors must detect smartphone ownership.");
}

function assertRestoredFileBudgets() {
  const files = walk(restoredRoot).filter((file) => file.endsWith(".js"));
  assert(files.length > 0, "src/restored must contain guardable JavaScript modules.");
  for (const file of files) {
    const count = lineCount(read(file));
    assert(count <= maxRestoredJsLines, `${path.relative(root, file)} has ${count} lines; split before ${maxRestoredJsLines}.`);
  }
}

(async () => {
  assert(fs.existsSync(restoredRoot), "src/restored directory is required.");
  assertDocumentWiring();
  assertRestoredHtmlShell();
  assertRestoredFileBudgets();
  await assertCityCatalog();
  await assertPlaceCatalog();
  await assertStaticCatalogExtraction();
  await assertLocationNavContract();
  await assertActorContract();
  await assertShellContract();
  await assertAccountSessionContract();
  await assertOnlineAdapterContract();
  await assertStateStorageContract();
  await assertSelectorsContract();
  console.log("Restored growth architecture check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
