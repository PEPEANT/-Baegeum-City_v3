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

function assertCoreContract(contract) {
  const validation = contract.validateRestoredRelationshipContract();
  assert.equal(validation.ok, true, validation.errors.join("\n"));

  const legacy = contract.migrateLegacyRestoredPartner({ name: "Han", love: 68, isLover: false });
  assert.equal(legacy.relationshipVersion, "restored-relationship-001");
  assert.equal(legacy.displayName, "Han");
  assert.equal(legacy.affection, 68, "legacy love should migrate to affection");
  assert.equal(legacy.stage, "interested", "legacy affection should infer a valid pre-lover stage");

  const lover = contract.migrateLegacyRestoredPartner({
    id: "partner:yuna",
    displayName: "Yuna",
    love: 92,
    isLover: true,
    relationshipRisk: 62
  });
  assert.equal(lover.stage, "unstable_lover", "lover risk should produce an unstable lover stage");
  assert.equal(contract.getRestoredRelationshipRiskLabel(lover), "high");

  const changed = contract.applyRestoredRelationshipDelta(legacy, {
    affection: 40,
    trust: -100,
    stability: 5,
    relationshipRisk: 90,
    economicImpression: "reckless"
  });
  assert.equal(changed.affection, 100, "affection deltas should clamp at 100");
  assert.equal(changed.trust, 0, "trust deltas should clamp at 0");
  assert.equal(changed.relationshipRisk, 100, "risk deltas should clamp at 100");
  assert.equal(changed.economicImpression, "reckless");
  return { legacy, lover };
}

function assertReadinessAndLogs(contract, legacy) {
  const ready = contract.getRestoredConfessionReadiness(
    { affection: 72, trust: 43 },
    { mental: 66, hasRecentDate: true, recentCasinoLoss: 0 }
  );
  assert.equal(ready.canConfess, true, "confession should pass when every condition is met");

  const blocked = contract.getRestoredConfessionReadiness(
    { affection: 72, trust: 39 },
    { mental: 66, hasRecentDate: false, recentCasinoLoss: 60000 }
  );
  assert.equal(blocked.canConfess, false, "confession should fail when required checks fail");
  assert.equal(blocked.checks.filter((check) => !check.ok).length, 3);

  const logs = contract.getRecentRestoredRelationshipLogs({
    relationshipLogs: [
      { id: "old", partnerId: legacy.id, day: 1, type: "conversation" },
      { id: "new", partnerId: legacy.id, day: 3, type: "date", deltas: { affection: 4 } }
    ]
  }, 1);
  assert.equal(logs.length, 1);
  assert.equal(logs[0].id, "new");
  assert.equal(logs[0].deltas.affection, 4);
}

function assertEventRuntime(runtime) {
  const validation = runtime.validateRestoredRelationshipEventRuntime();
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  const talked = runtime.applyRestoredRelationshipAction({ name: "Han", love: 40 }, "call", {
    partnerIndex: 0,
    eventIndex: 7,
    summary: "전화로 안부를 물었다."
  });
  assert.equal(talked.ok, true);
  assert.equal(talked.partner.affection, 48);
  assert.equal(talked.partner.love, 48, "event runtime must keep legacy love compatible.");
  assert.equal(talked.log.type, "conversation");
  assert.ok(talked.log.summary.includes("전화"), "event runtime must create readable source logs.");
  const logs = runtime.appendRestoredRelationshipLog([], talked.log, 1);
  assert.equal(logs.length, 1);
  assert.equal(logs[0].id, talked.log.id);
}

function assertSummaryViews(contract, view, phoneView, legacy, lover) {
  const summary = contract.getRestoredRelationshipSummary({ partners: [legacy, lover] });
  assert.equal(summary.partnerCount, 2);
  assert.equal(summary.loverCount, 1);
  assert.equal(summary.currentLover.id, "partner:yuna");
  assert.equal(summary.socialStatus, "unstable_lover");

  const emptyView = view.getRestoredRelationshipSummaryView({ partners: [] });
  assert.equal(typeof emptyView.headline, "string", "empty relationship summary should stay compact.");

  const loverView = view.getRestoredRelationshipSummaryView({ partners: [legacy, lover] });
  assert.ok(loverView.headline.includes("1"), "relationship summary view should use contract lover counts.");
  assert.ok(loverView.metrics.some((metric) => metric.id === "relationshipRisk"));
  assert.ok(view.renderRestoredRelationshipSummaryHtml({ partners: [legacy, lover] }).includes("62%"));

  const phoneState = {
    partners: [legacy, lover],
    relationshipLogs: [
      { partnerId: legacy.id, day: 4, type: "conversation", summary: "솔직한 대화", deltas: { trust: 2 } }
    ]
  };
  const phoneCards = phoneView.listRestoredRelationshipPhoneCards(phoneState);
  assert.equal(phoneCards.length, 2);
  assert.equal(phoneCards[0].affection, 68);
  assert.equal(phoneCards[1].relationshipRisk, 62);
  assert.ok(
    phoneView.renderRestoredRelationshipPhoneAppView(phoneState).listHtml.includes("openInteractModal(1)"),
    "relationship phone app view should preserve partner interaction indices."
  );
  assert.ok(
    phoneView.renderRestoredRelationshipPhoneAppView(phoneState).logHtml.includes("솔직한 대화"),
    "relationship phone app view should render recent relationship logs."
  );
  assert.ok(
    phoneView.renderRestoredRelationshipPhoneAppView(phoneState).logHtml.includes("신뢰 +2"),
    "relationship phone app logs should render visible deltas."
  );
}

function assertDocsAndHtml() {
  const plan = read("docs/plans/restored-lover-relationship-system.md");
  assert.ok(plan.includes("src/restored/systems/relationship-contract.js"));
  assert.ok(plan.includes("affection"));
  assert.ok(plan.includes("trust"));
  assert.ok(plan.includes("stability"));
  assert.ok(plan.includes("relationshipRisk"));
  assert.ok(plan.includes("relationshipLogs"));
  assert.ok(plan.includes("Do not mutate partner state directly"));

  const html = read("baegeum-city-v2-dice.html");
  assert.ok(html.includes("./src/restored/phone/relationship-app-view.js"));
  assert.ok(html.includes("./src/restored/ui/relationship-summary-view.js"));
  assert.ok(html.includes("./src/restored/systems/relationship-event-runtime.js"));
  assert.ok(html.includes('id="relationship-summary-card"'));
  assert.ok(html.includes("renderRestoredRelationshipSummaryHtml(gameState)"));
  assert.ok(html.includes("renderRestoredRelationshipPhoneAppView(gameState)"));
  assert.ok(html.includes("commitRelationshipAction("));
  assert.ok(html.includes("appendRestoredRelationshipLog(gameState.relationshipLogs"));
  assert.ok(html.includes('id="phone-relationship-log-list"'));
  assert.ok(html.includes("logs.innerHTML = view.logHtml"));
  assert.ok(!html.includes("p.love = Math.min"), "relationship actions must not directly mutate legacy love.");
  assert.ok(!html.includes("p.love -="), "relationship drift must use the relationship event runtime.");
  assert.ok(!html.includes('id="partner-list"'), "my info must not regain the full partner list.");
}

(async () => {
  const contract = await load("src/restored/systems/relationship-contract.js");
  const eventRuntime = await load("src/restored/systems/relationship-event-runtime.js");
  const phoneView = await load("src/restored/phone/relationship-app-view.js");
  const view = await load("src/restored/ui/relationship-summary-view.js");
  const { legacy, lover } = assertCoreContract(contract);
  assertReadinessAndLogs(contract, legacy);
  assertEventRuntime(eventRuntime);
  assertSummaryViews(contract, view, phoneView, legacy, lover);
  assertDocsAndHtml();
  console.log("Restored relationship contract check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
