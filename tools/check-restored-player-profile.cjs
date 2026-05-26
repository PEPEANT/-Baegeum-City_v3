"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "baegeum-city-v2-dice.html");
const restoredRoot = path.join(root, "src", "restored");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertProfileContract() {
  const profilePath = pathToFileURL(path.join(restoredRoot, "player", "profile-contract.js")).href;
  const initialPath = pathToFileURL(path.join(restoredRoot, "state", "initial-state.js")).href;
  const storagePath = pathToFileURL(path.join(restoredRoot, "state", "storage.js")).href;
  const consumablePath = pathToFileURL(path.join(restoredRoot, "inventory", "consumable-contract.js")).href;
  const saveContract = read(path.join(restoredRoot, "state", "save-contract.js"));
  const profile = await import(profilePath);
  const initial = await import(initialPath);
  const storage = await import(storagePath);
  const consumable = await import(consumablePath);
  const state = initial.createInitialRestoredState();
  const stats = profile.listRestoredProfileStats(state.profile);
  const statIds = stats.map((stat) => stat.id);

  assert(saveContract.includes('"profile"'), "restored save domains must include profile.");
  assert(profile.validateRestoredProfileState(state.profile).ok, "initial restored profile must validate.");
  for (const id of ["energy", "health", "intelligence", "appearance"]) {
    assert(statIds.includes(id), `restored profile must include ${id}.`);
  }

  storage.mergeSavedRestoredState(state, {
    cash: 77,
    profile: {
      jobId: "fast_food",
      jobTitle: "패스트푸드 알바",
      stats: { energy: { value: 21 } }
    }
  });
  assert(state.profile.jobTitle === "패스트푸드 알바", "restored storage must preserve saved profile job.");
  assert(profile.listRestoredProfileStats(state.profile).find((stat) => stat.id === "energy").value === 21, "restored storage must preserve saved profile stat values.");
  state.luxury.energy_drink.count = 1;
  const used = consumable.projectRestoredConsumableUse(state, "energy_drink");
  assert(used.ok, "energy drink should be a usable restored consumable.");
  assert(used.nextState.profile.stats.energy.value === 41, "energy drink must restore profile energy.");
  assert(used.nextState.luxury.energy_drink.count === 0, "energy drink use must consume one inventory item.");
}

function assertMyInfoHtml() {
  const html = read(htmlPath);
  assert(html.includes("./src/restored/player/profile-contract.js"), "restored HTML must import the player profile contract.");
  assert(html.includes('id="profile-stat-grid"'), "my info must expose the profile stat grid.");
  assert(html.includes('id="profile-inventory-list"'), "my info must expose the inventory preview.");
  assert(html.includes("projectRestoredConsumableUse"), "inventory item use must route through the restored consumable contract.");
  assert(html.includes('id="profile-job-title"'), "my info must expose job title.");
  assert(!html.includes("헌팅하기"), "my info must not keep hunting as an always-visible action.");
  assert(!html.includes("집에 가기"), "my info must not keep home travel as an always-visible action.");
  assert(!html.includes('id="my-networth"'), "my info must not duplicate top-bar net worth.");
  assert(!html.includes('id="info-cash"'), "my info must not duplicate top-bar cash.");
  assert(!html.includes('id="partner-list"'), "my info must not render the full partner list.");
  assert(html.includes('id="phone-partner-list"'), "full partner list must move into the phone relationship app.");
}

function assertDocs() {
  const recomposition = read(path.join(root, "docs", "baegeum-city-v2-restored-recomposition-plan.md"));
  const roadmap = read(path.join(root, "docs", "baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md"));
  assert(recomposition.includes("src/restored/player/profile-contract.js"), "recomposition plan must mention the profile contract.");
  assert(roadmap.includes("character sheet"), "UI roadmap must describe my info as a character sheet.");
}

(async () => {
  await assertProfileContract();
  assertMyInfoHtml();
  assertDocs();
  console.log("Restored player profile check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
