"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const docsIndexPath = path.join(root, "docs", "INDEX.md");
const intakeDocPath = path.join(root, "docs", "baegeum-city-v2-restored-intake.md");
const assetInboxReadmePath = path.join(root, "assets", "inbox", "README.md");
const refInboxReadmePath = path.join(root, "refs", "intake", "README.md");
const refIndexPath = path.join(root, "refs", "INDEX.md");
const intakeToolPath = path.join(root, "tools", "intake-restored-material.cjs");
const runtimeFiles = [
  "baegeum-city-v2-dice.html",
  "src/restored",
  "src/devices",
  "src/scenes",
  "src/styles"
];
const runtimeExtensions = new Set([".html", ".js", ".css"]);

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walkFiles(entryPath, output = []) {
  if (!fs.existsSync(entryPath)) return output;
  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    output.push(entryPath);
    return output;
  }

  for (const entry of fs.readdirSync(entryPath, { withFileTypes: true })) {
    const fullPath = path.join(entryPath, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, output);
    else if (entry.isFile()) output.push(fullPath);
  }
  return output;
}

function runTool(args) {
  return execFileSync("node", [intakeToolPath, ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

function assertNoRuntimeInboxReferences() {
  const files = runtimeFiles
    .flatMap((entry) => walkFiles(path.join(root, entry)))
    .filter((file) => runtimeExtensions.has(path.extname(file).toLowerCase()));
  for (const file of files) {
    const relativePath = path.relative(root, file).replace(/\\/g, "/");
    if (relativePath === "assets/inbox/README.md") continue;
    const text = read(file);
    assert(!text.includes("assets/inbox/"), `${relativePath} must not reference assets/inbox/.`);
  }
}

function main() {
  for (const file of [
    docsIndexPath,
    intakeDocPath,
    assetInboxReadmePath,
    refInboxReadmePath,
    refIndexPath,
    intakeToolPath
  ]) {
    assert(fs.existsSync(file), `Missing intake file: ${path.relative(root, file)}`);
  }

  const docsIndex = read(docsIndexPath);
  const intakeDoc = read(intakeDocPath);
  const refIndex = read(refIndexPath);
  assert(docsIndex.includes("baegeum-city-v2-restored-intake.md"), "docs/INDEX.md must link restored intake.");
  assert(refIndex.includes("intake/README.md"), "refs/INDEX.md must link reference intake.");

  for (const requiredText of [
    "assets/inbox/",
    "refs/intake/",
    "tools/intake-restored-material.cjs",
    "Promotion Flow"
  ]) {
    assert(intakeDoc.includes(requiredText), `Restored intake doc must mention ${requiredText}.`);
  }

  const help = runTool(["--help"]);
  assert(help.includes("Usage:"), "intake tool help must include usage.");
  assert(help.includes("--kind=asset|github|note"), "intake tool help must list supported kinds.");

  const assetOutput = runTool(["assets/inbox/sample.png", "--role=partner", "--id=image:partner:sample:portrait"]);
  assert(assetOutput.includes("Manifest Candidate"), "asset intake output must include a manifest candidate.");
  assert(assetOutput.includes("image:partner:sample:portrait"), "asset intake output must include the requested asset id.");
  assert(assetOutput.includes("assets/restored/images/partners/sample.png"), "asset intake output must propose a restored partner image target.");

  const githubOutput = runTool(["https://github.com/PEPEANT/MammonCity2", "--kind=github", "--name=MammonCity2"]);
  assert(githubOutput.includes("reference only"), "GitHub intake output must stay reference only.");
  assert(githubOutput.includes("refs/github-reference-systems.md Candidate"), "GitHub intake output must show the reference-system candidate.");

  assertNoRuntimeInboxReferences();

  console.log("Restored intake check passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
