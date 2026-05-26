"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const docsIndexPath = path.join(root, "docs", "INDEX.md");
const plansReadmePath = path.join(root, "docs", "plans", "README.md");
const templatePath = path.join(root, "docs", "templates", "restored-feature-plan-template.md");
const rankingJobPlanPath = path.join(root, "docs", "plans", "restored-ranking-job-system.md");
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

function main() {
  for (const filePath of [plansReadmePath, templatePath, rankingJobPlanPath, createToolPath]) {
    assert(fs.existsSync(filePath), `Missing planning-kit file: ${path.relative(root, filePath)}`);
  }

  const docsIndex = read(docsIndexPath);
  const plansReadme = read(plansReadmePath);
  const template = read(templatePath);
  const rankingJobPlan = read(rankingJobPlanPath);
  const packageJson = read(packagePath);
  const roadmap = read(roadmapPath);

  assertIncludes(docsIndex, "plans/README.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "plans/restored-ranking-job-system.md", "docs/INDEX.md");
  assertIncludes(docsIndex, "restored-feature-plan-template.md", "docs/INDEX.md");
  assertIncludes(packageJson, "plan:restored", "package.json scripts");
  assertIncludes(packageJson, "check-restored-planning-kit.cjs", "npm run check");

  for (const text of [
    "Job / Occupation Impact",
    "Ranking Impact",
    "Chat Impact",
    "Online Authority",
    "Asset Intake",
    "bottom nav must stay"
  ]) {
    assertIncludes(template, text, "restored feature plan template");
  }

  for (const text of [
    "job",
    "ranking",
    "phone",
    "not implementation permission"
  ]) {
    assertIncludes(plansReadme, text, "docs/plans/README.md");
  }

  for (const text of [
    "`jobRank`",
    "`jobIncome`",
    "`jobReputation`",
    "Job boards"
  ]) {
    assertIncludes(roadmap, text, "restored UI/online roadmap");
  }

  for (const text of [
    "Ranking And Job System",
    "local preview boards",
    "`jobRank`",
    "`jobIncome`",
    "`jobReputation`",
    "Do not merge job rank with wealth rank",
    "Do not show fake global rankings while offline"
  ]) {
    assertIncludes(rankingJobPlan, text, "restored ranking/job plan");
  }

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
  assertIncludes(draft, "myinfo / phone / realestate / casino / shop", "generated restored plan draft");

  console.log("Restored planning kit check passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
