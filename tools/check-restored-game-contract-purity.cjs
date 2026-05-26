"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const gamesRoot = path.join(root, "src", "restored", "games");
const gamblingDocPath = path.join(root, "docs", "baegeum-city-v2-gambling-venues.md");
const recompositionDocPath = path.join(root, "docs", "baegeum-city-v2-restored-recomposition-plan.md");
const packagePath = path.join(root, "package.json");

const forbiddenPatterns = Object.freeze([
  { pattern: /\bdocument\b/, label: "document" },
  { pattern: /\bwindow\b/, label: "window" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bsessionStorage\b/, label: "sessionStorage" },
  { pattern: /\bnavigator\b/, label: "navigator" },
  { pattern: /\bfetch\s*\(/, label: "fetch" },
  { pattern: /\bXMLHttpRequest\b/, label: "XMLHttpRequest" },
  { pattern: /\bquerySelector\b/, label: "querySelector" },
  { pattern: /\bgetElementById\b/, label: "getElementById" },
  { pattern: /\binnerHTML\b/, label: "innerHTML" },
  { pattern: /\bclassList\b/, label: "classList" },
  { pattern: /\baddEventListener\b/, label: "addEventListener" },
  { pattern: /\bsetInterval\s*\(/, label: "setInterval" },
  { pattern: /\bsetTimeout\s*\(/, label: "setTimeout" },
  { pattern: /\brequestAnimationFrame\s*\(/, label: "requestAnimationFrame" },
  { pattern: /\bMath\.random\s*\(/, label: "Math.random" },
  { pattern: /\bDate\.now\s*\(/, label: "Date.now" },
  { pattern: /\bnew\s+Date\s*\(/, label: "new Date" }
]);

const requiredChecks = Object.freeze({
  "gambling-replacement-contract.js": "tools/check-restored-gambling-contract.cjs",
  "blackjack-contract.js": "tools/check-restored-blackjack-contract.cjs",
  "blackjack-round-contract.js": "tools/check-restored-blackjack-round-contract.cjs",
  "roulette-contract.js": "tools/check-restored-roulette-contract.cjs",
  "baccarat-contract.js": "tools/check-restored-baccarat-contract.cjs",
  "slot-contract.js": "tools/check-restored-slot-contract.cjs",
  "pawnshop-contract.js": "tools/check-restored-pawnshop-contract.cjs",
  "loan-office-contract.js": "tools/check-restored-loan-office-contract.cjs"
});

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function listGameContracts() {
  return fs.readdirSync(gamesRoot)
    .filter((name) => name.endsWith("-contract.js"))
    .sort()
    .map((name) => path.join(gamesRoot, name));
}

function assertPureContract(file) {
  const source = read(file);
  for (const forbidden of forbiddenPatterns) {
    assert(!forbidden.pattern.test(source), `${relative(file)} must stay pure; found ${forbidden.label}.`);
  }
  assert(source.includes("CONTRACT_VERSION"), `${relative(file)} must expose an explicit contract version.`);
  assert(/export\s+function\s+validate/.test(source), `${relative(file)} must export a validation function.`);
}

function assertCheckCoverage(files) {
  for (const file of files) {
    const name = path.basename(file);
    const checkPath = requiredChecks[name];
    assert(checkPath, `${relative(file)} needs an explicit smoke-check mapping in check-restored-game-contract-purity.cjs.`);
    assert(fs.existsSync(path.join(root, checkPath)), `${relative(file)} must have ${checkPath}.`);
  }
}

function assertDocumentationGate() {
  const gamblingDoc = read(gamblingDocPath);
  const recompositionDoc = read(recompositionDocPath);
  const pkg = JSON.parse(read(packagePath));
  assert(gamblingDoc.includes("## Restored gambling anti-spaghetti gate"), "gambling venues doc must define the anti-spaghetti gate.");
  assert(gamblingDoc.includes("pure game contracts"), "gambling venues doc must require pure game contracts.");
  assert(gamblingDoc.includes("animation adapters"), "gambling venues doc must separate animation adapters from contracts.");
  assert(gamblingDoc.includes("No `document`, `window`, `localStorage`, `Math.random`, or timers"), "gambling venues doc must name forbidden contract dependencies.");
  assert(recompositionDoc.includes("Game contracts must stay pure"), "recomposition plan must record the game-contract purity guard.");
  assert(pkg.scripts.check.includes("check-restored-game-contract-purity.cjs"), "npm run check must include the game contract purity check.");
}

const files = listGameContracts();
assert(files.length > 0, "src/restored/games must contain restored game contracts.");
for (const file of files) assertPureContract(file);
assertCheckCoverage(files);
assertDocumentationGate();

console.log("Restored game contract purity check passed.");
