"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.ok(html.includes('data-primary-mode="singularity-race"'), "root index should mark Singularity Race as the primary mode");
assert.ok(html.includes('id="primaryRaceLink"'), "root index should expose the primary race link");
assert.ok(html.includes('href="./singularity-race.html"'), "primary action should open the player race entry");
assert.ok(html.includes('href="./singularity-race-admin.html?devOnline=1"'), "launcher should keep the dev host entry available");
assert.ok(html.includes('href="./baegeum-city-v2-dice.html"'), "launcher should keep the city hub as a sub mode");
assert.ok(!html.includes("window.location.replace"), "root index must not redirect away from the launcher");
assert.ok(html.indexOf("특이점레이스 시작") < html.indexOf("배금도시 허브"), "race entry should appear before city hub");

console.log("Index entry smoke check passed.");
