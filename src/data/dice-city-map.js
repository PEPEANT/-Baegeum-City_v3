import { createVenueChannels, gamblingVenues } from "./gambling-venues.js";
import { MAP_IDS } from "./map-registry.js";

export const diceCityMap = {
  id: "dice-city-v0",
  mapVersion: "dice-city-v0-map-001",
  sourceMapVersion: "dice-city-v0-map-001",
  name: "다이스시티 v0",
  width: 4200,
  height: 3000,
  roadWidth: 118,
  playerSpawn: { x: 520, y: 2620 },
  roads: [
    [{ x: 320, y: 2640 }, { x: 820, y: 2320 }, { x: 1420, y: 1980 }, { x: 2260, y: 1680 }, { x: 3260, y: 1380 }, { x: 4060, y: 1040 }],
    [{ x: 500, y: 900 }, { x: 1180, y: 1110 }, { x: 1980, y: 1200 }, { x: 2940, y: 1120 }, { x: 3900, y: 860 }],
    [{ x: 1040, y: 260 }, { x: 1120, y: 880 }, { x: 1240, y: 1580 }, { x: 1320, y: 2380 }, { x: 1260, y: 2920 }],
    [{ x: 2440, y: 220 }, { x: 2360, y: 880 }, { x: 2260, y: 1680 }, { x: 2380, y: 2380 }, { x: 2560, y: 2920 }],
    [{ x: 3400, y: 220 }, { x: 3280, y: 920 }, { x: 3260, y: 1380 }, { x: 3500, y: 2200 }, { x: 3860, y: 2860 }],
    [{ x: 900, y: 2520 }, { x: 1120, y: 2484 }, { x: 1690, y: 2122 }, { x: 2490, y: 1742 }, { x: 2880, y: 1620 }]
  ],
  terrainPatches: [
    { x: 460, y: 520, r: 260, color: "rgba(63, 84, 65, 0.22)" },
    { x: 1380, y: 480, r: 320, color: "rgba(72, 83, 63, 0.22)" },
    { x: 2440, y: 560, r: 300, color: "rgba(68, 88, 76, 0.20)" },
    { x: 3580, y: 620, r: 280, color: "rgba(84, 78, 61, 0.22)" },
    { x: 720, y: 2300, r: 360, color: "rgba(70, 96, 80, 0.20)" },
    { x: 1900, y: 2460, r: 320, color: "rgba(91, 86, 67, 0.20)" },
    { x: 3340, y: 2380, r: 340, color: "rgba(81, 74, 68, 0.21)" },
    { x: 1820, y: 2060, r: 520, color: "rgba(121, 64, 70, 0.18)" }
  ],
  obstacles: [
    building("building:0001", 420, 2380, 430, 210, "depot"),
    building("building:0002", 1480, 520, 360, 230, "service-block"),
    building("building:0003", 2040, 520, 390, 250, "depot"),
    building("building:0004", 2740, 520, 420, 250, "warehouse"),
    building("building:0005", 3420, 430, 360, 260, "garage"),
    building("building:0006", 760, 1240, 340, 220, "service-block"),
    building("building:0007", 1540, 1420, 360, 230, "garage"),
    building("building:0008", 2660, 1460, 390, 240, "depot"),
    building("building:0009", 3300, 1700, 410, 250, "warehouse"),
    wall("wall:0001", 120, 2860, 780, 44),
    wall("wall:0002", 120, 2240, 44, 664),
    wall("wall:0003", 3740, 220, 360, 44),
    wall("wall:0004", 4056, 220, 44, 860),
    concrete("obstacle:0001", 1080, 1880, 420, 76),
    concrete("obstacle:0002", 2200, 1280, 460, 78),
    concrete("obstacle:0003", 3060, 2220, 480, 82)
  ],
  buildings: [
    copiedVenue("blackjack-casino", "dice-blackjack-casino-01", { x: 910, y: 2180, w: 420, h: 240 }),
    copiedVenue("odd-even-casino", "dice-odd-even-casino-01", { x: 1480, y: 1860, w: 420, h: 240 }),
    copiedVenue("horse-track", "dice-horse-track-01", { x: 2180, y: 1420, w: 620, h: 300 })
  ],
  scenery: [
    tree("tree:pine:0001", 620, 620, "pine"),
    tree("tree:broadleaf:0001", 860, 740, "broadleaf"),
    tree("tree:broadleaf:0002", 3720, 1180, "broadleaf"),
    brush("brush:0001", 580, 2140),
    brush("brush:0002", 3600, 2020),
    streetlight("streetlight:0001", 1020, 2240),
    streetlight("streetlight:0002", 2060, 1740),
    streetlight("streetlight:0003", 3260, 1220),
    streetlight("streetlight:0004", 1060, 2410),
    streetlight("streetlight:0005", 1590, 2050),
    streetlight("streetlight:0006", 2380, 1660),
    billboard("billboard:0001", 920, 2080, "dice-city-coming-soon"),
    billboard("billboard:0002", 2980, 980, "casino-night"),
    billboard("billboard:0003", 1280, 2350, "quick-loan"),
    billboard("billboard:0004", 1810, 1740, "casino-night"),
    billboard("billboard:0005", 2580, 1280, "street-jobs")
  ],
  capturePoints: [],
  safeZones: [],
  baseExitPoints: {},
  spawns: {
    player: { x: 520, y: 2620 },
    busArrival: { x: 520, y: 2620 }
  },
  navGraph: {
    nodes: [
      { id: "dice-terminal-arrival", x: 520, y: 2620 },
      { id: "terminal-road", x: 820, y: 2320 },
      { id: "west-strip", x: 1240, y: 1580 },
      { id: "central-cross", x: 2260, y: 1680 },
      { id: "north-strip", x: 1980, y: 1200 },
      { id: "east-strip", x: 3260, y: 1380 },
      { id: "north-east", x: 3900, y: 860 },
      { id: "south-east", x: 3500, y: 2200 },
      { id: "south-spine", x: 2560, y: 2920 }
    ],
    edges: [
      ["dice-terminal-arrival", "terminal-road"],
      ["terminal-road", "west-strip"],
      ["west-strip", "central-cross"],
      ["central-cross", "north-strip"],
      ["central-cross", "east-strip"],
      ["east-strip", "north-east"],
      ["east-strip", "south-east"],
      ["central-cross", "south-spine"]
    ]
  }
};

function building(id, x, y, w, h, variant) {
  return { id, x, y, w, h, kind: "building", objectKind: "building_shell", variant };
}

function copiedVenue(sourceId, copyId, rect) {
  const source = requireVenue(sourceId);
  const channels = createVenueChannels(copyId, MAP_IDS.DICE_CITY);
  const doorX = Math.round(rect.x + rect.w / 2);
  const doorY = Math.round(rect.y + rect.h + 22);
  return {
    id: `bg-${copyId}`,
    sourceVenueId: source.id,
    mapId: MAP_IDS.DICE_CITY,
    name: source.name,
    sign: source.sign,
    signAnchor: { x: doorX, y: doorY - 42 },
    gameType: source.gameType,
    venueType: source.venueType,
    minBet: source.minBet,
    onlineRoomId: channels.venue,
    channels,
    districtId: source.districtId,
    rect,
    doors: [{ id: `${copyId}-front`, x: doorX, y: doorY, targetSceneId: source.interiorId, returnSpawn: { x: doorX, y: doorY + 42 } }]
  };
}

function requireVenue(id) {
  const venue = gamblingVenues.find((item) => item.id === id);
  if (!venue) throw new Error(`Missing source venue: ${id}`);
  return venue;
}

function wall(id, x, y, w, h) {
  return { id, x, y, w, h, kind: "city-boundary", variant: "dice-edge-wall" };
}

function concrete(id, x, y, w, h) {
  return { id, x, y, w, h, kind: "concrete" };
}

function tree(id, x, y, variant) {
  return { id, x, y, r: variant === "pine" ? 48 : 54, type: "tree", variant, shape: "circle", collision: { shape: "circle", r: 38, blocksPlayers: true, blocksVehicles: true } };
}

function brush(id, x, y) {
  return { id, x, y, r: 68, type: "brush", variant: "brush", shape: "circle", collision: { shape: "circle", r: 34, blocksPlayers: false, blocksVehicles: false } };
}

function streetlight(id, x, y) {
  return { id, x, y, w: 30, h: 108, type: "streetlight", variant: "single", shape: "rect", collision: { shape: "rect", x: 10, y: 76, w: 10, h: 24, blocksPlayers: true, blocksVehicles: true } };
}

function billboard(id, x, y, adId) {
  return { id, x, y, w: 168, h: 74, type: "billboard", variant: "campaign", adId, shape: "rect", collision: { shape: "rect", x: 32, y: 52, w: 104, h: 18, blocksPlayers: true, blocksVehicles: true } };
}
