"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const blackjackPath = path.join(root, "blackjack-design-test.html");
const gamblingDocPath = path.join(root, "docs", "baegeum-city-v2-gambling-venues.md");
const workingStatePath = path.join(root, "docs", "ai-working-state.md");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, requiredText, label) {
  assert(text.includes(requiredText), `${label} must include ${requiredText}.`);
}

function assertExcludes(text, forbiddenText, label) {
  assert(!text.includes(forbiddenText), `${label} must not expose old English UI text: ${forbiddenText}.`);
}

function assertRequiredTexts(text, requiredTexts, label) {
  for (const requiredText of requiredTexts) {
    assertIncludes(text, requiredText, label);
  }
}

function assertForbiddenTexts(text, forbiddenTexts, label) {
  for (const forbiddenText of forbiddenTexts) {
    assertExcludes(text, forbiddenText, label);
  }
}

function assertPrototypeHtml(html) {
  assertRequiredTexts(html, [
    "<title>블랙잭 디자인 테스트</title>",
    "블랙잭",
    "베팅 칩",
    "진행 기록",
    "시작",
    "한 장 더",
    "멈추기",
    "두 배",
    "베팅 취소",
    "전부 걸기",
    "칩을 누르면 이곳에 베팅이 쌓입니다.",
    "class=\"bet-zone\"",
    "id=\"bet-stack\"",
    "chipFly",
    "chip-ghost",
    "animateChip",
    "stack-chip",
    "aspect-ratio: 1"
  ], "blackjack-design-test.html");

  assertForbiddenTexts(html, [
    ">DEAL<",
    ">HIT<",
    ">STAND<",
    ">DOUBLE<",
    ">READY<",
    "<small>Bankroll</small>",
    "<div class=\"hand-title\">Dealer",
    "<div class=\"hand-title\">Player",
    "<h2>Bet Rail</h2>",
    "<h2>Table Feed</h2>",
    "<strong>Design rule:</strong>",
    ">Clear Bet<",
    ">All In<",
    "let title = \"Win\"",
    "let title = \"Lose\"",
    "title = \"Push\"",
    "title = \"Bust\"",
    "content: \"BLACKJACK\""
  ], "blackjack-design-test.html");
}

function assertHandoffDocs(gamblingDoc, workingState) {
  assertRequiredTexts(gamblingDoc, [
    "blackjack-design-test.html",
    "다이스시티 -> 카지노거리 -> 블랙잭카지노",
    "Do not connect it to the live restored game yet",
    "Clicking a chip should animate a chip flying onto the table"
  ], "docs/baegeum-city-v2-gambling-venues.md");

  assertRequiredTexts(workingState, [
    "blackjack-design-test.html",
    "chip-click flight animation",
    "Do not: Wire this prototype into `baegeum-city-v2-dice.html`"
  ], "docs/ai-working-state.md");
}

function main() {
  assertPrototypeHtml(read(blackjackPath));
  assertHandoffDocs(read(gamblingDocPath), read(workingStatePath));
  console.log("Blackjack design prototype check passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
