"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { cityMap } = await load("src/data/city-map.js");
  const { interiors } = await load("src/data/interiors.js");
  const { MAP_VERSION, validateVenueChannels, VENUE_SCHEMA_VERSION, WORLD_CHANNEL_ID } = await load("src/data/runtime-contract.js");
  const { CollisionWorld } = await load("src/systems/collision.js");
  const { NavGraph } = await load("src/systems/navigation.js");
  const { dueTimeEvents, WorldClock } = await load("src/systems/world-clock.js");

  const enterableBuildings = cityMap.buildings.filter((building) =>
    building.doors.some((door) => interiors[door.targetSceneId])
  );
  assert.equal(enterableBuildings.length, cityMap.buildings.length, "all fallback buildings should be enterable gambling venues");
  assert.equal(cityMap.mapVersion, MAP_VERSION, "fallback city map should carry the runtime map version");
  assert.equal(cityMap.venueSchemaVersion, VENUE_SCHEMA_VERSION, "fallback city map should carry the venue schema version");

  for (const building of enterableBuildings) {
    const door = building.doors[0];
    assert.ok(building.sign, `${building.id} needs a Korean sign`);
    assert.ok(building.onlineRoomId, `${building.id} needs an online room id`);
    assert.equal(building.channels?.world, WORLD_CHANNEL_ID, `${building.id} needs the fixed world chat channel`);
    assert.equal(building.onlineRoomId, building.channels?.venue, `${building.id} online room should match venue channel`);
    assert.match(building.channels?.venue || "", /^venue:[a-z0-9-]+-\d+$/, `${building.id} needs a numbered venue channel`);
    assert.match(building.channels?.table || "", /^table:[a-z0-9-]+-\d+:main$/, `${building.id} needs a table channel`);
    assert.match(building.channels?.spectator || "", /^spectator:[a-z0-9-]+-\d+$/, `${building.id} needs a spectator channel`);
    assert.match(building.channels?.admin || "", /^admin:[a-z0-9-]+-\d+$/, `${building.id} needs an admin channel`);
    assert.deepEqual(validateVenueChannels(building.channels), [], `${building.id} channel schema should be valid`);
    assert.ok(building.channels?.spectator, `${building.id} needs a spectator channel`);
    assert.ok(building.channels?.admin, `${building.id} needs an admin channel`);
    assert.ok(building.signAnchor, `${building.id} needs a sign anchor`);
    assert.ok(interiors[door.targetSceneId], `${building.id} target interior is missing`);
    assert.ok(door.returnSpawn, `${building.id} door needs a return spawn`);
  }

  const blockers = [...cityMap.obstacles, ...cityMap.buildings.map((building) => building.rect)];
  const nav = new NavGraph(cityMap.navGraph, blockers);
  assert.ok(nav.pathBetween(cityMap.playerSpawn, nav.nodeById.get("office")).length >= 2, "nav path to office should exist");

  const collision = new CollisionWorld({ width: cityMap.width, height: cityMap.height, obstacles: blockers });
  const casino = cityMap.buildings[0].rect;
  const probe = { x: casino.x - 22, y: casino.y + casino.h / 2, radius: 15 };
  const blocked = collision.moveCircle(probe, 40, 0);
  assert.equal(blocked.x, probe.x, "building collision should block movement into a casino");

  const clock = new WorldClock({ startHour: 18, startMinute: 59, minutesPerSecond: 60 });
  const before = clock.minuteOfDay;
  clock.update(1);
  assert.equal(clock.snapshot().timeText, "19:59", "world clock should advance by game minutes");
  assert.ok(dueTimeEvents(before, clock.minuteOfDay).some((event) => event.id === "casino-peak"), "casino peak event should trigger at 19:00");

  console.log("City core smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
