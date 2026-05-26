"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

(async () => {
  const venues = await load("src/data/gambling-venues.js");
  const base = venues.createVenueMetadata(venues.gamblingVenues[0], { x: 100, y: 100, w: 200, h: 120 }, 0);
  const storage = createStorage();

  const saved = venues.upsertStoredVenueMetadata({
    id: base.id,
    sign: "  Custom Casino  ",
    gameType: "odd-even",
    venueType: "support",
    minBet: "0",
    entrance: { x: "320.4", y: "280.6" },
    signAnchor: { x: "320", y: "200" },
    interiorId: "  custom-interior  ",
    channels: { venue: "venue:hacked" },
    onlineRoomId: "venue:hacked",
    doorId: "door:hacked",
    rect: { x: 0, y: 0, w: 1, h: 1 }
  }, storage);

  assert.equal(saved.length, 1, "upsert should create one venue metadata draft");
  assert.deepEqual(Object.keys(saved[0]).sort(), [
    "entrance",
    "gameType",
    "id",
    "interiorId",
    "minBet",
    "sign",
    "signAnchor",
    "venueType"
  ].sort(), "stored drafts should keep only editable venue metadata");
  assert.equal(saved[0].minBet, 0, "zero min bet should be a valid edit");
  assert.deepEqual(saved[0].entrance, { x: 320, y: 281 }, "points should be rounded");

  venues.upsertStoredVenueMetadata({ id: base.id, sign: "Second Casino" }, storage);
  const read = venues.readStoredVenueMetadata(storage);
  assert.equal(read.length, 1, "upsert should replace by venue id");
  assert.equal(read[0].sign, "Second Casino", "partial updates should replace changed fields");
  assert.equal(read[0].gameType, "odd-even", "partial updates should preserve previous valid fields");

  const status = venues.inspectStoredVenueMetadata(storage);
  assert.equal(status.status, "ok", "valid venue metadata storage should be observable as ok");
  assert.equal(status.metadata.length, 1, "status helper should include normalized metadata");

  const missing = venues.inspectStoredVenueMetadata(createStorage());
  assert.equal(missing.status, "missing", "missing venue metadata storage should be observable");

  const corruptStorage = createStorage();
  corruptStorage.setItem(venues.venueMetadataStorageKey, "{broken");
  const corrupt = venues.inspectStoredVenueMetadata(corruptStorage);
  assert.equal(corrupt.status, "corrupt", "corrupt venue metadata storage should be observable");
  assert.deepEqual(corrupt.metadata, [], "corrupt venue metadata should still fall back to empty metadata");
  assert.deepEqual(venues.readStoredVenueMetadata(corruptStorage), [], "read fallback should preserve existing empty metadata behavior");
  assert.equal(corruptStorage.getItem(venues.venueMetadataStorageKey), "{broken", "status reads should not clear corrupt metadata");

  const merged = venues.mergeVenueMetadata(base, read[0]);
  assert.equal(merged.sign, "Second Casino", "merge should apply edited sign");
  assert.equal(merged.name, "Second Casino", "merge should mirror sign to display name");
  assert.equal(merged.gameType, "odd-even", "merge should apply edited game type");
  assert.equal(merged.venueType, "support", "merge should apply edited venue type");
  assert.equal(merged.minBet, 0, "merge should preserve zero min bet");
  assert.equal(merged.interiorId, "custom-interior", "merge should apply edited interior id");
  assert.deepEqual(merged.channels, venues.createVenueChannels(base.id), "channels must be derived from the venue id");
  assert.equal(merged.onlineRoomId, venues.createVenueChannels(base.id).venue, "room id must be derived from the venue id");
  assert.equal(merged.doorId, base.doorId, "door ownership should stay with the base venue contract");
  assert.deepEqual(merged.rect, base.rect, "stored metadata should not replace the building rect");

  const rawMerge = venues.mergeVenueMetadata(base, { id: base.id, gameType: "hacked" });
  assert.equal(rawMerge.gameType, base.gameType, "raw merges should also reject unknown game types");

  assert.equal(venues.normalizeVenueMetadataDraft({ id: "", sign: "Nope" }), null, "drafts without id should be rejected");
  assert.deepEqual(venues.normalizeVenueMetadataDraft({ id: base.id, gameType: "hacked", minBet: -5 }), {
    id: base.id,
    minBet: 0
  }, "normalization should drop unknown game types and clamp negative bets");

  const editorSource = fs.readFileSync(path.join(root, "src/tools/baegeum-city-editor.js"), "utf8");
  assert.ok(editorSource.includes("writeStoredVenueMetadata"), "city editor should persist through the normalized venue helper");
  assert.equal(editorSource.includes("localStorage.setItem(venueMetadataStorageKey"), false, "city editor should not bypass venue metadata normalization");

  console.log("Venue metadata storage smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
