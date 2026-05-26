"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const roadmapPath = path.join(
  root,
  "docs",
  "baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md"
);
const indexPath = path.join(root, "docs", "INDEX.md");
const packagePath = path.join(root, "package.json");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, requiredText, label) {
  assert(text.includes(requiredText), `${label} must mention ${requiredText}.`);
}

function main() {
  assert(fs.existsSync(roadmapPath), "Restored UI/online/ranking/chat roadmap doc is missing.");

  const roadmap = read(roadmapPath);
  const index = read(indexPath);
  const packageJson = read(packagePath);

  assertIncludes(
    index,
    "baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md",
    "docs/INDEX.md"
  );

  for (const section of [
    "UI Surfaces",
    "Design Draft",
    "Online Expansion",
    "Ranking System",
    "Job boards",
    "Chat Expansion",
    "Authority Rules",
    "Do Not"
  ]) {
    assertIncludes(roadmap, section, "restored UI/online roadmap");
  }

  for (const relatedDoc of [
    "baegeum-city-v2-ui-design-rules.md",
    "baegeum-city-v2-online-state-protocol.md",
    "baegeum-city-v2-online-lobby-contract.md",
    "baegeum-city-v2-chat.md",
    "baegeum-city-v2-restored-recomposition-plan.md"
  ]) {
    assertIncludes(roadmap, relatedDoc, "restored UI/online roadmap");
  }

  for (const requiredBoundary of [
    "myinfo / phone / realestate / casino / shop",
    "The bottom nav must not grow again",
    "No fake offline lobby",
    "server-authoritative",
    "Local rank and online ranking are different",
    "`jobRank`",
    "`jobIncome`",
    "`jobReputation`",
    "AI-generated text must not be a hard dependency",
    "partner_dm:<partner-id>"
  ]) {
    assertIncludes(roadmap, requiredBoundary, "restored UI/online roadmap");
  }

  assertIncludes(
    packageJson,
    "check-restored-ui-online-ranking-chat-roadmap.cjs",
    "npm run check"
  );

  console.log("Restored UI/online/ranking/chat roadmap check passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
