"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const restoredRoot = path.join(root, "src", "restored");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function assertPlan() {
  const plan = read("docs/plans/restored-phone-app-ecosystem.md");
  for (const text of [
    "app_store",
    "messenger",
    "relationships",
    "community",
    "BaeTalk",
    "Baegeum Gallery",
    "phone ownership gates",
    "Do not add every planned app directly to the live registry"
  ]) {
    assert.ok(plan.includes(text), `phone ecosystem plan must mention ${text}`);
  }
}

function assertDocsIndex() {
  const index = read("docs/INDEX.md");
  const readme = read("docs/plans/README.md");
  assert.ok(index.includes("plans/restored-phone-app-ecosystem.md"), "docs index must link phone ecosystem plan.");
  assert.ok(readme.includes("restored-phone-app-ecosystem.md"), "plans readme must list phone ecosystem plan.");
}

function assertHtmlBoundary() {
  const html = read("baegeum-city-v2-dice.html");
  assert.ok(html.includes("listUsableRestoredPhoneApps(device)"), "phone buttons must come from live app registry.");
  assert.ok(!html.includes("id=\"nav-community\""), "community must not become a bottom nav tab.");
  assert.ok(!html.includes("id=\"nav-messenger\""), "messenger must not become a bottom nav tab.");
}

(async () => {
  const live = await load("src/restored/phone/phone-app-contract.js");
  const ecosystem = await load("src/restored/phone/phone-app-ecosystem-contract.js");
  const liveIds = live.listRestoredPhoneAppIds();
  const validation = ecosystem.validateRestoredPhoneEcosystemContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  const audit = ecosystem.auditRestoredPhoneAppSeparation(liveIds);
  assert.equal(audit.ok, true, audit.missingLive.join(","));
  assert.ok(audit.catalogLiveIds.includes("app_store"), "app store must be live after the store shell exists.");
  assert.ok(!audit.plannedIds.includes("app_store"), "app store must not remain planned after live shell wiring.");
  assert.ok(audit.plannedIds.includes("messenger"), "messenger must stay in planned catalog.");
  assert.ok(audit.plannedIds.includes("community"), "community must stay in planned catalog.");
  assert.equal(ecosystem.getRestoredPhoneEcosystemApp("app_store").phase, "live");
  assert.equal(ecosystem.getRestoredPhoneEcosystemApp("relationships").phase, "live");
  assert.equal(ecosystem.getRestoredPhoneEcosystemApp("community").domain, "community");
  assertPlan();
  assertDocsIndex();
  assertHtmlBoundary();
  assert.ok(fs.existsSync(path.join(restoredRoot, "phone", "futures-app-view.js")), "futures app view must stay extracted.");
  assert.ok(fs.existsSync(path.join(restoredRoot, "phone", "relationship-app-view.js")), "relationship app view must stay extracted.");
  assert.ok(fs.existsSync(path.join(restoredRoot, "phone", "news-app-view.js")), "news app view must stay extracted.");
  assert.ok(fs.existsSync(path.join(restoredRoot, "phone", "stock-app-view.js")), "stock app view must stay extracted.");
  console.log("Restored phone app ecosystem check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
