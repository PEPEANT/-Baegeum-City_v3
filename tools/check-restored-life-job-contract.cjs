"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "src", "restored", "jobs", "life-job-contract.js");
const planPath = path.join(root, "docs", "plans", "restored-life-minigame-system.md");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertPureContractSource() {
  const source = read(contractPath);
  for (const blocked of ["document.", "window.", "localStorage", "sessionStorage", "setInterval", "setTimeout", "Math.random", "Date.now", "fetch("]) {
    assert(!source.includes(blocked), `life job contract must not use ${blocked}`);
  }
}

(async () => {
  assert(fs.existsSync(contractPath), "restored life job contract file is required.");
  assertPureContractSource();
  assert(read(planPath).includes("restored-life-job-001"), "life minigame plan must record the restored life job contract.");

  const mod = await import(pathToFileURL(contractPath).href);
  const validation = mod.validateRestoredLifeJobContract();
  assert(validation.ok, `restored life job contract invalid: ${validation.errors.join("; ")}`);

  const jobs = mod.listRestoredLifeJobs();
  assert(jobs.length === 2, "life job catalog should start with two minigames.");
  assert(jobs[0].id === mod.RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE, "convenience store should be the first life job.");
  assert(jobs[1].id === mod.RESTORED_LIFE_JOB_IDS.FAST_FOOD, "fast-food should be the second life job.");
  assert(jobs[1].baseWageDp > jobs[0].baseWageDp, "fast-food should pay more than convenience store.");
  assert(jobs[1].energyCost > jobs[0].energyCost, "fast-food should cost more energy than convenience store.");

  const convenienceDeck = mod.createRestoredLifeJobTaskDeck(mod.RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE);
  assert(convenienceDeck.length === 4, "convenience store needs four deterministic tasks.");
  assert(convenienceDeck.every((task, index) => task.order === index + 1), "task deck must expose stable order.");

  const perfect = mod.scoreRestoredLifeJob(mod.RESTORED_LIFE_JOB_IDS.FAST_FOOD, {
    accuracy: 100,
    speed: 100,
    service: 100,
    stamina: 100,
    combo: 5
  });
  const failed = mod.scoreRestoredLifeJob(mod.RESTORED_LIFE_JOB_IDS.FAST_FOOD, {
    accuracy: 0,
    speed: 0,
    service: 0,
    stamina: 0,
    mistakes: 9
  });
  assert(perfect.grade === "S" && perfect.score === 100, "perfect fast-food shift should grade S.");
  assert(failed.grade === "F" && failed.score === 0, "failed fast-food shift should grade F.");

  const result = mod.createRestoredLifeJobResult(mod.RESTORED_LIFE_JOB_IDS.CONVENIENCE_STORE, {
    accuracy: 92,
    speed: 85,
    service: 91,
    stamina: 87,
    combo: 3
  });
  assert(result.ok, "convenience store result should be ok.");
  assert(result.version === mod.RESTORED_LIFE_JOB_CONTRACT_VERSION, "result must expose the contract version.");
  assert(result.wageDp > jobs[0].baseWageDp, "high-grade result should pay a wage bonus.");
  assert(result.wageText.endsWith(" DP"), "job wage should render as DP.");

  const wage = result.effects.find((effect) => effect.type === mod.RESTORED_LIFE_JOB_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  assert(wage?.payload?.entryType === "job_wage", "job result must emit a job_wage ledger effect.");
  assert(wage.payload.deltas.cash === result.wageDp, "wage ledger effect must match result wage.");

  const condition = result.effects.find((effect) => effect.type === mod.RESTORED_LIFE_JOB_EFFECT_TYPES.PLAYER_STATE_PATCH);
  assert(condition.payload.deltas.energy < 0, "job result must spend energy.");
  assert(condition.payload.deltas.timeMinutes === jobs[0].minutes, "job result must advance the documented shift time.");

  const relationship = result.effects.find((effect) => effect.type === mod.RESTORED_LIFE_JOB_EFFECT_TYPES.RELATIONSHIP_EVENT_HOOK);
  assert(relationship.payload.sourceEventType === "job_completed", "job result must expose a relationship event boundary.");
  assert(!result.effects.some((effect) => effect.type === "direct_partner_mutation"), "job result must not mutate partners directly.");

  const bonus = result.effects.find((effect) => effect.type === mod.RESTORED_LIFE_JOB_EFFECT_TYPES.INVENTORY_ITEM_GRANT);
  assert(bonus?.payload?.itemId === "energy_drink", "high-grade convenience shift should grant an energy drink envelope.");

  console.log("Restored life job contract check passed.");
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
