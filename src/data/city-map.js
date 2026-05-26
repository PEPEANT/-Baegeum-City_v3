import { createVenueMetadata, gamblingVenues } from "./gambling-venues.js";
import { MAP_VERSION, VENUE_SCHEMA_VERSION } from "./runtime-contract.js";

export const cityMap = {
  id: "baegeum-city-prototype",
  mapVersion: MAP_VERSION,
  venueSchemaVersion: VENUE_SCHEMA_VERSION,
  name: "배금도시 임시 도심",
  width: 6562,
  height: 4397,
  roadWidth: 112,
  playerSpawn: { x: 450, y: 3920 },
  roads: [
    [{ x: 0, y: 1899 }, { x: 1299, y: 2476 }, { x: 2514, y: 2335 }, { x: 4228, y: 2576 }, { x: 6562, y: 4397 }],
    [{ x: 0, y: 835 }, { x: 683, y: 1286 }, { x: 2397, y: 1551 }, { x: 4271, y: 1618 }, { x: 5040, y: 0 }],
    [{ x: 1588, y: 0 }, { x: 1854, y: 1090 }, { x: 1893, y: 1963 }, { x: 1747, y: 3743 }, { x: 1348, y: 4397 }],
    [{ x: 2963, y: 0 }, { x: 2951, y: 1248 }, { x: 3177, y: 3349 }, { x: 2827, y: 4397 }],
    [{ x: 0, y: 2895 }, { x: 805, y: 2920 }, { x: 1299, y: 2476 }],
    [{ x: 6562, y: 2080 }, { x: 5960, y: 2200 }, { x: 5320, y: 2465 }, { x: 4828, y: 4387 }]
  ],
  patches: [
    { x: 720, y: 980, r: 330, color: "rgba(77, 128, 79, 0.20)" },
    { x: 1740, y: 620, r: 420, color: "rgba(67, 105, 80, 0.24)" },
    { x: 2900, y: 760, r: 380, color: "rgba(86, 122, 92, 0.22)" },
    { x: 4380, y: 980, r: 430, color: "rgba(100, 115, 76, 0.21)" },
    { x: 5760, y: 1560, r: 360, color: "rgba(74, 113, 88, 0.22)" },
    { x: 1000, y: 3380, r: 460, color: "rgba(74, 113, 88, 0.24)" },
    { x: 2480, y: 3300, r: 430, color: "rgba(79, 126, 91, 0.20)" },
    { x: 3900, y: 3380, r: 460, color: "rgba(95, 113, 75, 0.22)" }
  ],
  obstacles: [
    { x: 1077, y: 945, w: 475, h: 121, kind: "concrete" },
    { x: 3388, y: 1344, w: 436, h: 116, kind: "concrete" },
    { x: 3724, y: 2763, w: 475, h: 127, kind: "concrete" },
    { x: 3601, y: 120, w: 719, h: 260, kind: "concrete" },
    { x: 1056, y: 2049, w: 541, h: 121, kind: "concrete" },
    { x: 3393, y: 3880, w: 207, h: 319, kind: "concrete" },
    { x: 3862, y: 4101, w: 568, h: 127, kind: "concrete" },
    { x: 4506, y: 2232, w: 330, h: 114, kind: "concrete" },
    { x: 0, y: 3400, w: 920, h: 44, kind: "base-wall" },
    { x: 40, y: 4353, w: 880, h: 44, kind: "base-wall" },
    { x: 0, y: 3430, w: 44, h: 967, kind: "base-wall" }
  ],
  buildings: [
    building(0, 2158, 1040, 482, 223, 2390, 1278),
    building(1, 4466, 3320, 334, 260, 4630, 3610),
    building(2, 5560, 2600, 240, 140, 5680, 2768),
    building(3, 3159, 989, 121, 396, 3220, 1416),
    building(4, 3277, 2648, 145, 436, 3350, 3110),
    building(5, 3600, 1920, 240, 260, 3720, 2210)
  ],
  navGraph: {
    nodes: [
      { id: "south_base", x: 560, y: 3890 }, { id: "south_road", x: 1299, y: 2476 },
      { id: "west_road", x: 683, y: 1286 }, { id: "mid_low", x: 2514, y: 2335 },
      { id: "mid_high", x: 2397, y: 1551 }, { id: "central", x: 3177, y: 2300 },
      { id: "office_road", x: 4271, y: 1618 }, { id: "east_road", x: 5320, y: 2465 },
      { id: "east_low", x: 4828, y: 3600 }, { id: "north_spine", x: 2963, y: 760 },
      { id: "bank", x: 2390, y: 1280 }, { id: "mart", x: 4630, y: 3620 },
      { id: "office", x: 5680, y: 2770 }, { id: "harbor", x: 5960, y: 2200 }
    ],
    edges: [
      ["south_base", "south_road"], ["south_road", "west_road"], ["south_road", "mid_low"],
      ["mid_low", "mid_high"], ["mid_low", "central"], ["mid_high", "central"],
      ["mid_high", "north_spine"], ["central", "office_road"], ["central", "east_road"],
      ["east_road", "harbor"], ["east_road", "office"], ["east_road", "east_low"],
      ["east_low", "mart"], ["office_road", "bank"], ["office_road", "harbor"]
    ]
  }
};

function building(venueIndex, x, y, w, h, doorX, doorY) {
  const venue = gamblingVenues[venueIndex];
  const meta = createVenueMetadata(venue, { x, y, w, h }, venueIndex);
  meta.entrance = { x: doorX, y: doorY };
  meta.signAnchor = { x: doorX, y: doorY - 42 };
  return {
    id: `bg-${meta.id}`,
    name: meta.name,
    sign: meta.sign,
    signAnchor: meta.signAnchor,
    gameType: meta.gameType,
    venueType: meta.venueType,
    minBet: meta.minBet,
    onlineRoomId: meta.onlineRoomId,
    channels: meta.channels,
    districtId: meta.districtId,
    rect: { x, y, w, h },
    doors: [{ id: meta.doorId, x: doorX, y: doorY, targetSceneId: meta.interiorId, returnSpawn: { x: doorX, y: doorY + 42 } }]
  };
}
