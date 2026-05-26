"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "mammon-city");
const sourceCommit = "91305e829b3a112a80778b7ffaef4a20b658e49b";

const expectedHashes = {
  "index.html": "40aaa7ff8d5562ba8e9f830aedf72d61f2a555c9b605c8c1212453813602d135",
  "css/phone.css": "1a8b0f6a1914977240252f8f0135389af45a20e5b6b23ae8031c51ebaac5b339",
  "js/devices/phone/phone-session.js": "76b23c0c5c0eeb6673e3679e739c755071b289fbabf02ef124be8ae098a927d0",
  "js/devices/phone/phone-app-registry.js": "7e7fb42e28492a7e1daf996faaacc8c1c93ac409f4b4e86fa0fa0314b807d020",
  "js/devices/phone/phone-shell-ui.js": "e8878a115f4d49f53b97bcb625dcae8be9c6e22fd361ec4b9831f485aeab85ed",
  "js/devices/phone/phone-router.js": "de058f678255a23dd9094e2231d062ce7e8d7316de8294769d9e21005955cf05",
  "js/apps/dis/dis-manifest.js": "ef9f737af421eeaad8c16bff5d9afc82952fb516af1640e72d682803fc329a7c",
  "js/apps/dis/dis-community-service.js": "672573151ac84479d8c2c0285ac6e534f862b36aed55ee0ac0a71866469c5c9b",
  "docs/phone-system.md": "b55dc153ccebf039016722c039665119c0914d34919d7e3ca279138885a6c49b",
  "docs/device-internet-structure.md": "e6f92c9dd1341e4e069904e291c7c2422bac8baba12ba173ed3f10425d9e112d"
};

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function vendorPath(relativePath) {
  return path.join(vendorRoot, ...relativePath.split("/"));
}

for (const [relativePath, expected] of Object.entries(expectedHashes)) {
  const fullPath = vendorPath(relativePath);
  assert.ok(fs.existsSync(fullPath), `${relativePath} is missing from MammonCity vendor files`);
  assert.equal(hashFile(fullPath), expected, `${relativePath} hash changed from ${sourceCommit}`);
}

const indexHtml = fs.readFileSync(vendorPath("index.html"), "utf8");
assert.ok(indexHtml.includes('<div id="phone-stage" hidden aria-hidden="true"></div>'), "source phone stage DOM is missing");
assert.ok(indexHtml.includes('<div id="phone-panel">'), "source phone panel DOM is missing");
assert.ok(indexHtml.includes('<div id="phone-apps" class="phone-apps"></div>'), "source phone apps DOM is missing");

const phoneCss = fs.readFileSync(vendorPath("css/phone.css"), "utf8");
assert.ok(phoneCss.includes("#phone-panel"), "source phone panel CSS is missing");
assert.ok(phoneCss.includes(".phone-shell"), "source phone shell CSS is missing");
assert.ok(phoneCss.includes(".dis-community-shell"), "source DIS community CSS is missing");

const disManifest = fs.readFileSync(vendorPath("js/apps/dis/dis-manifest.js"), "utf8");
assert.ok(disManifest.includes("buildDisCommunityListStageMarkup"), "source DIS community list markup is missing");
assert.ok(disManifest.includes("dis-community-post-row"), "source DIS community post row class is missing");

console.log("MammonCity phone vendor check passed.");
