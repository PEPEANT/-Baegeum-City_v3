"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const docsIndexPath = path.join(root, "docs", "INDEX.md");
const plansReadmePath = path.join(root, "docs", "plans", "README.md");
const templatePath = path.join(root, "docs", "templates", "restored-feature-plan-template.md");
const rankingJobPlanPath = path.join(root, "docs", "plans", "restored-ranking-job-system.md");
const threeCityNavPlanPath = path.join(root, "docs", "plans", "restored-three-city-home-navigation.md");
const loginHomePlanPath = path.join(root, "docs", "plans", "restored-login-home-online-phone-migration.md");
const uiSurfaceRedesignPlanPath = path.join(root, "docs", "plans", "restored-ui-surface-redesign.md");
const loverRelationshipPlanPath = path.join(root, "docs", "plans", "restored-lover-relationship-system.md");
const phoneAppEcosystemPlanPath = path.join(root, "docs", "plans", "restored-phone-app-ecosystem.md");
const createToolPath = path.join(root, "tools", "create-restored-feature-plan.cjs");
const packagePath = path.join(root, "package.json");
const roadmapPath = path.join(root, "docs", "baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, requiredText, label) {
  assert(text.includes(requiredText), `${label} must mention ${requiredText}.`);
}

function runCreateTool(args) {
  return execFileSync("node", [createToolPath, ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

function assertRequiredTextList(text, requiredTexts, label) {
  for (const requiredText of requiredTexts) {
    assertIncludes(text, requiredText, label);
  }
}

function assertPlanningFilesExist() {
  for (const filePath of [
    plansReadmePath,
    templatePath,
    rankingJobPlanPath,
    threeCityNavPlanPath,
    loginHomePlanPath,
    uiSurfaceRedesignPlanPath,
    loverRelationshipPlanPath,
    phoneAppEcosystemPlanPath,
    createToolPath
  ]) {
    assert(fs.existsSync(filePath), `Missing planning-kit file: ${path.relative(root, filePath)}`);
  }
}

function readPlanningDocs() {
  return {
    docsIndex: read(docsIndexPath),
    packageJson: read(packagePath),
    plansReadme: read(plansReadmePath),
    rankingJobPlan: read(rankingJobPlanPath),
    loginHomePlan: read(loginHomePlanPath),
    roadmap: read(roadmapPath),
    template: read(templatePath),
    threeCityNavPlan: read(threeCityNavPlanPath),
    uiSurfaceRedesignPlan: read(uiSurfaceRedesignPlanPath),
    loverRelationshipPlan: read(loverRelationshipPlanPath),
    phoneAppEcosystemPlan: read(phoneAppEcosystemPlanPath)
  };
}

function assertIndexAndPackage({ docsIndex, packageJson }) {
  assertIncludes(docsIndex, "plans/README.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-ranking-job-system.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-three-city-home-navigation.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-login-home-online-phone-migration.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-ui-surface-redesign.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-lover-relationship-system.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-phone-app-ecosystem.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "restored-feature-plan-template.md", "docs/INDEX.md");
  assertIncludes(packageJson, "plan:restored", "package.json scripts");
  assertIncludes(packageJson, "check-restored-planning-kit.cjs", "npm run check");
}

function assertTemplate(template) {
  assertRequiredTextList(template, [
    "Job / Occupation Impact",
    "Ranking Impact",
    "Chat Impact",
    "Online Authority",
    "Asset Intake",
    "bottom nav is location-aware"
  ], "restored feature plan template");
}

function assertPlansReadme(plansReadme) {
  assertRequiredTextList(plansReadme, [
    "job",
    "ranking",
    "phone",
    "three-city",
    "home-start",
    "login home",
    "ui-surface-redesign",
    "lover/relationship v2",
    "phone OS",
    "not implementation permission"
  ], "docs/plans/README.md");
}

function assertRoadmap(roadmap) {
  assertRequiredTextList(roadmap, [
    "home_inside",
    "home_front",
    "seosan-city",
    "Login Home Transition",
    "legacy save-code backup center",
    "MammonCity2",
    "restored-ui-surface-redesign.md",
    "relationship/lover list",
    "phone relationship app",
    "`jobRank`",
    "`jobIncome`",
    "`jobReputation`",
    "Job boards"
  ], "restored UI/online roadmap");
}

function assertUiSurfaceRedesignPlan(uiSurfaceRedesignPlan) {
  assertRequiredTextList(uiSurfaceRedesignPlan, [
    "Restored UI Surface Redesign",
    "home_inside",
    "home_front",
    "내정보 / 내집 / 밖으로 나가기",
    "character sheet",
    "phone-app-contract.js",
    "profile-contract.js",
    "relationship/lover list",
    "app-stage/window",
    "MammonCity2 phone registry/router",
    "Do not make My Info a money/action dump again"
  ], "restored UI surface redesign plan");
}

function assertLoverRelationshipPlan(loverRelationshipPlan) {
  assertRequiredTextList(loverRelationshipPlan, [
    "Restored Lover And Relationship System",
    "My Info should show the player's social and emotional condition",
    "`affection`",
    "`trust`",
    "`stability`",
    "`economicImpression`",
    "`relationshipRisk`",
    "relationshipLogs",
    "confession",
    "casino_loss_seen",
    "Do not put the full partner/lover list back into My Info",
    "Do not mutate partner state directly from casino, stock, loan, pawnshop, gift, or job handlers"
  ], "restored lover relationship plan");
}

function assertPhoneAppEcosystemPlan(phoneAppEcosystemPlan) {
  assertRequiredTextList(phoneAppEcosystemPlan, [
    "Restored Phone App Ecosystem",
    "app_store",
    "messenger",
    "relationships",
    "community",
    "BaeTalk",
    "Baegeum Gallery",
    "Do not add every planned app directly to the live registry"
  ], "restored phone app ecosystem plan");
}

function assertLoginHomePlan(loginHomePlan) {
  assertRequiredTextList(loginHomePlan, [
    "Login Home",
    "MammonCity2",
    "No top-level license file was detected",
    "legacy save-code backup center",
    "lobbyEnabled",
    "The relationship/lover list is also a phone app",
    "Do not copy Firebase config",
    "Do not show save-code backup UI in normal play"
  ], "restored login home migration plan");
}

function assertRankingJobPlan(rankingJobPlan) {
  assertRequiredTextList(rankingJobPlan, [
    "Ranking And Job System",
    "local preview boards",
    "`jobRank`",
    "`jobIncome`",
    "`jobReputation`",
    "Do not merge job rank with wealth rank",
    "Do not show fake global rankings while offline"
  ], "restored ranking/job plan");
}

function assertThreeCityNavPlan(threeCityNavPlan) {
  assertRequiredTextList(threeCityNavPlan, [
    "Three City Home Navigation",
    "home_inside",
    "home_front",
    "baegeum-city",
    "dice-city",
    "seosan-city",
    "fast_food",
    "labor_office",
    "Do not put every place into the permanent bottom nav"
  ], "restored three-city home navigation plan");
}

function assertCreateToolOutput() {
  const help = runCreateTool(["--help"]);
  assertIncludes(help, "Usage:", "create-restored-feature-plan help");
  assertIncludes(help, "--domain=ranking", "create-restored-feature-plan help");

  const draft = runCreateTool([
    "job-ranking",
    "--title=Job Ranking System",
    "--surface=phone",
    "--domain=ranking"
  ]);
  assertIncludes(draft, "Job Ranking System", "generated restored plan draft");
  assertIncludes(draft, "Job / Occupation Impact", "generated restored plan draft");
  assertIncludes(draft, "Online leaderboard impact", "generated restored plan draft");
  assertIncludes(draft, "bottom nav is location-aware", "generated restored plan draft");
  assertIncludes(draft, "home_inside", "generated restored plan draft");
  assertIncludes(draft, "seosan-city", "generated restored plan draft");
}

function main() {
  assertPlanningFilesExist();
  const docs = readPlanningDocs();

  assertIndexAndPackage(docs);
  assertTemplate(docs.template);
  assertPlansReadme(docs.plansReadme);
  assertRoadmap(docs.roadmap);
  assertRankingJobPlan(docs.rankingJobPlan);
  assertThreeCityNavPlan(docs.threeCityNavPlan);
  assertLoginHomePlan(docs.loginHomePlan);
  assertUiSurfaceRedesignPlan(docs.uiSurfaceRedesignPlan);
  assertLoverRelationshipPlan(docs.loverRelationshipPlan);
  assertPhoneAppEcosystemPlan(docs.phoneAppEcosystemPlan);
  assertCreateToolOutput();

  console.log("Restored planning kit check passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
