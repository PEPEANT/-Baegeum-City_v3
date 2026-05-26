"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { buildDisPreviewMarkup, isDisRoute } = await load("src/devices/phone/dis-preview.js");
  const { createVirtualInternetSnapshot } = await load("src/systems/virtual-internet.js");

  assert.ok(isDisRoute("dis/home"), "DIS home route should be recognized");
  assert.equal(isDisRoute("news/home"), false, "non-DIS route should not be treated as DIS");

  const snapshot = createVirtualInternetSnapshot({
    clock: { day: 1, minuteOfDay: 1140, timeText: "19:00", dayLabel: "DAY 01", phaseKey: "evening" },
    channel: "venue:blackjack-casino-01",
    venue: { name: "블랙잭카지노" },
    chat: {
      channel: "venue:blackjack-casino-01",
      history: () => [{ author: "p1", name: "YOU", text: "테스트 채팅", worldTime: "19:00" }]
    }
  });
  assert.equal(snapshot.channel, "venue:blackjack-casino-01", "virtual internet should keep the active channel");
  assert.ok(snapshot.posts.some((post) => post.title.includes("테스트 채팅")), "DIS feed should include recent channel chat");

  const markup = buildDisPreviewMarkup({
    context: {
      clock: snapshot.clock,
      channel: snapshot.channel,
      venue: { name: "블랙잭카지노" },
      chat: { channel: snapshot.channel, history: () => [] }
    }
  });
  assert.ok(markup.includes("dis-community-shell"), "DIS preview should use original community shell class");
  assert.ok(markup.includes("dis-community-topbar-title"), "DIS preview should use original topbar title class");
  assert.ok(markup.includes("dis-community-tabs"), "DIS preview should use original tab class");
  assert.ok(markup.includes("dis-community-post-row"), "DIS preview should use original post row class");
  assert.ok(markup.includes("특이점이 온다 갤러리"), "DIS preview should show the original gallery title");
  assert.ok(markup.includes("data-dis-channel=\"venue:blackjack-casino-01\""), "DIS preview should expose the active channel");

  console.log("Phone DIS smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
