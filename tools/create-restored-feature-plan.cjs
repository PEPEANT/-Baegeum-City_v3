"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const plansDir = path.join(root, "docs", "plans");

function parseArgs(argv) {
  const options = {
    slug: "",
    title: "",
    surface: "phone",
    domain: "planning",
    write: false,
    force: false
  };

  for (const arg of argv) {
    if (arg === "--write") options.write = true;
    else if (arg === "--force") options.force = true;
    else if (arg.startsWith("--title=")) options.title = arg.slice("--title=".length);
    else if (arg.startsWith("--surface=")) options.surface = arg.slice("--surface=".length);
    else if (arg.startsWith("--domain=")) options.domain = arg.slice("--domain=".length);
    else if (!options.slug) options.slug = arg;
  }

  return options;
}

function toSlug(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function bulletSection(title, items, note = "") {
  const lines = [`## ${title}`, "", ...items.map((item) => `- ${item}`)];
  if (note) lines.push("", note);
  return lines.join("\n");
}

function numberedSection(title, items) {
  return [`## ${title}`, "", ...items.map((item, index) => `${index + 1}. ${item}`)].join("\n");
}

function buildHeader(title) {
  return `# ${title}\n\nConclusion: this is a planning draft only. Do not implement this feature until the contract, state, UI surface, ranking, job, chat, online, asset, and verification boundaries are clear.`;
}

function buildFeatureIdentity({ title, domain, surface, featureId }) {
  return [
    "## Feature Identity",
    "",
    `- Feature id: ${featureId}`,
    `- Title: ${title}`,
    `- Domain: ${domain}`,
    `- Primary surface: ${surface}`,
    "- Related docs:",
    "  - docs/baegeum-city-v2-restored-recomposition-plan.md",
    "  - docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md"
  ].join("\n");
}

function buildPlayerLoop() {
  return `## Intended Player Loop\n\n\`\`\`text\nplayer action\n-> system response\n-> saved state/event\n-> UI feedback\n-> next choice\n\`\`\``;
}

function buildSections() {
  return [
    bulletSection("Current Baseline", ["Current playable behavior:", "Current files or catalogs involved:", "Existing blockers:"]),
    buildPlayerLoop(),
    bulletSection(
      "UI Surface Plan",
      ["Top bar impact:", "Bottom nav impact:", "Phone app impact:", "Modal or panel impact:", "Mobile constraints:", "Illustration or image slot:"],
      "Rule: bottom nav must stay `myinfo / phone / realestate / casino / shop`."
    ),
    bulletSection("State And Catalog Plan", ["New state fields:", "Static catalog entries:", "Migration or save compatibility:", "Selectors needed:", "Events produced:"]),
    bulletSection("Economy And Ownership Impact", ["Cash/chips/items affected:", "Ledger or event boundary:", "Inventory or asset ownership rules:", "Risks:"]),
    bulletSection("Relationship And Emotion Impact", ["Partner state affected:", "Memory events:", "Dialogue triggers:", "Emotion fields:", "Do not mutate partner emotion directly from casino or money handlers."]),
    bulletSection("Ranking Impact", ["Local rank impact:", "Online leaderboard impact:", "Job or occupation ranking impact:", "Board ids:", "Snapshot shape changes:", "Server authority needed:"]),
    bulletSection("Job / Occupation Impact", ["Job ids:", "Unlock conditions:", "Income or skill effects:", "UI display:", "Ranking category:", "Online season behavior:"]),
    bulletSection("Chat Impact", ["Partner DM impact:", "Public channel impact:", "Message shape changes:", "Moderation or rate-limit needs:", "Offline fallback:"]),
    bulletSection("Online Authority", ["Offline behavior:", "Online behavior:", "Server-owned decisions:", "Dev-mock behavior:", "Version gates:"]),
    bulletSection("Asset Intake", ["Required images:", "Required audio:", "Source or license notes:", "Manifest ids:", "Fallback behavior:"]),
    numberedSection("Implementation Order", ["Document contract.", "Add or update static catalog.", "Add selectors or pure helpers.", "Add UI surface shell.", "Add system events.", "Wire runtime behavior.", "Verify and record."]),
    bulletSection("Verification Plan", ["Narrow check:", "Full check: npm run check", "Browser check:", "Manual play notes:"]),
    bulletSection("Do Not", ["Do not add large inline systems to `baegeum-city-v2-dice.html`.", "Do not add fake offline lobby behavior.", "Do not make online ranking client-authoritative.", "Do not add direct asset paths without manifest ids.", "Do not put phone apps back into bottom navigation."])
  ];
}

function buildPlan(options) {
  const slug = toSlug(options.slug);
  const title = options.title || toTitle(slug);
  const featureId = `restored:${options.domain}:${slug}`;
  const header = buildHeader(title);
  const identity = buildFeatureIdentity({ ...options, title, featureId });
  return [header, identity, ...buildSections()].join("\n\n") + "\n";
}

function printHelp() {
  console.log(`Usage:
  node tools/create-restored-feature-plan.cjs <slug> [--title=Title] [--surface=phone] [--domain=ranking] [--write] [--force]

Examples:
  node tools/create-restored-feature-plan.cjs job-ranking --title="Job Ranking System"
  node tools/create-restored-feature-plan.cjs partner-dm --domain=chat --surface=phone --write
`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  const options = parseArgs(process.argv.slice(2));
  const slug = toSlug(options.slug);
  if (!slug) throw new Error("A feature slug is required.");

  const content = buildPlan({ ...options, slug });
  if (!options.write) {
    console.log(content);
    return;
  }

  fs.mkdirSync(plansDir, { recursive: true });
  const targetPath = path.join(plansDir, `restored-${slug}.md`);
  if (fs.existsSync(targetPath) && !options.force) {
    throw new Error(`Plan already exists: ${path.relative(root, targetPath)}. Use --force to overwrite.`);
  }

  fs.writeFileSync(targetPath, content);
  console.log(`Wrote ${path.relative(root, targetPath).replace(/\\/g, "/")}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
