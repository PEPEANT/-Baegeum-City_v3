"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

(async () => {
  const places = await load("src/restored/data/place-catalog.js");
  const nav = await load("src/restored/ui/location-nav-contract.js");
  const surface = await load("src/restored/ui/place-surface-copy.js");

  assert.equal(places.validateRestoredPlaceCatalog().ok, true);
  assert.ok(places.getRestoredPlace("baegeum:job-street"), "Baegeum job street place is required");
  assert.ok(places.getRestoredPlace("baegeum:shop-street"), "Baegeum shop street place is required");
  assert.ok(places.getRestoredPlace("baegeum:shop-street").featureDomains.includes("dpa_exchange"));

  const baegeumNav = nav.listRestoredLocationNavActions("baegeum-city");
  assert.equal(baegeumNav.length <= 5, true, "Baegeum bottom nav must stay compact");
  const shopAction = baegeumNav.find((action) => action.id === "shops");
  assert.equal(shopAction.surface, "place", "shops should open a frontage surface before the shop tab");

  const shopHtml = surface.renderRestoredPlaceSurfaceHtml(surface.RESTORED_PLACE_SURFACE_COPY.shops);
  assert.ok(shopHtml.includes("디페이 ATM"));
  assert.ok(shopHtml.includes("1 DPA = 1,000원"));
  assert.ok(shopHtml.includes("배금증권"));
  assert.ok(shopHtml.includes("중고차 매장"));

  const casinoHtml = surface.renderRestoredPlaceSurfaceHtml(surface.RESTORED_PLACE_SURFACE_COPY.casino_street);
  assert.ok(casinoHtml.includes("룰렛카지노"));
  assert.ok(casinoHtml.includes("바카라카지노"));
  assert.ok(casinoHtml.includes("경마장"));
  assert.ok(casinoHtml.includes("DPA 환전소"));

  const recompositionDoc = read("docs/baegeum-city-v2-restored-recomposition-plan.md");
  assert.ok(recompositionDoc.includes("Baegeum frontage"));
  assert.ok(recompositionDoc.includes("DPA"));

  console.log("Restored city frontage contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
