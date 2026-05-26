"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  installDomStub();
  const { Input } = await load("src/core/input.js");
  const { resolveActionState } = await load("src/ui/mobile-action-controls.js");

  const input = new Input(createEventTarget());
  input.press("KeyE");
  assert.equal(input.consume("KeyE"), true, "virtual mobile action should feed the same KeyE path");

  assert.equal(resolveActionState(null).disabled, true, "missing game should disable mobile action");
  assert.deepEqual(resolveActionState({
    scene: "city",
    nearbyDoor: { building: { sign: "칩교환소" } }
  }), { label: "입장", target: "칩교환소", disabled: false, hint: "E" }, "city door should become an enter action");
  assert.deepEqual(resolveActionState({
    scene: "interior:chip-exchange",
    nearbyDoor: { building: { name: "출구" } }
  }), { label: "나가기", target: "출구", disabled: false, hint: "E" }, "interior exit should become a leave action");
  assert.deepEqual(resolveActionState({
    scene: "city",
    nearbyInteraction: { label: "다이스시티로 이동", target: "시외버스터미널" }
  }), { label: "다이스시티로 이동", target: "시외버스터미널", disabled: false, hint: "E" }, "map transition should use the same mobile action button");
  assert.deepEqual(resolveActionState({
    scene: "city",
    nearbyInteraction: { label: "배금시티로 이동", target: "시외버스터미널" }
  }), { label: "배금시티로 이동", target: "시외버스터미널", disabled: false, hint: "E" }, "return map transition should use the same mobile action button");

  console.log("Mobile action controls smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function installDomStub() {
  const elements = new Map();
  globalThis.document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElementStub());
      return elements.get(id);
    }
  };
  globalThis.window = { BaegeumCity: {}, addEventListener() {} };
  globalThis.requestAnimationFrame = () => 0;
}

function createElementStub() {
  return {
    disabled: false,
    textContent: "",
    addEventListener() {},
    setAttribute() {}
  };
}

function createEventTarget() {
  return {
    addEventListener() {}
  };
}
