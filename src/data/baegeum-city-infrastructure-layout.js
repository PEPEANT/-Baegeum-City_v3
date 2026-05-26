import { BUILDING_TYPE_IDS, DISTRICT_IDS } from "./city-district-contract.js";

export const BAEGEUM_CITY_INFRASTRUCTURE_LAYOUT_VERSION = "baegeum-city-infrastructure-layout-v1";

const BUILDINGS = [
  spec("building:9101", "집", "city-home-shell", BUILDING_TYPE_IDS.HOME, DISTRICT_IDS.BAEGEUM_RESIDENTIAL, 0.10, 0.12, 190, 126, "barracks"),
  spec("building:9102", "고급집", "city-luxury-home-shell", BUILDING_TYPE_IDS.LUXURY_HOME, DISTRICT_IDS.BAEGEUM_RESIDENTIAL, 0.15, 0.11, 240, 148, "warehouse"),
  spec("building:9103", "편의점", "city-convenience-shell", BUILDING_TYPE_IDS.CONVENIENCE_STORE, DISTRICT_IDS.BAEGEUM_COMMERCE, 0.09, 0.40, 230, 130, "service-block"),
  spec("building:9104", "패스트푸드점", "city-fast-food-shell", BUILDING_TYPE_IDS.FAST_FOOD, DISTRICT_IDS.BAEGEUM_COMMERCE, 0.115, 0.47, 220, 120, "depot"),
  spec("building:9105", "경찰서", "city-police-shell", BUILDING_TYPE_IDS.POLICE_STATION, DISTRICT_IDS.BAEGEUM_CIVIC, 0.56, 0.22, 300, 150, "checkpoint"),
  spec("building:9106", "부동산", "city-real-estate-shell", BUILDING_TYPE_IDS.REAL_ESTATE, DISTRICT_IDS.BAEGEUM_CIVIC, 0.60, 0.31, 240, 130, "service-block"),
  spec("building:9107", "주식시장", "city-stock-market-shell", BUILDING_TYPE_IDS.STOCK_MARKET, DISTRICT_IDS.BAEGEUM_CIVIC, 0.64, 0.25, 290, 145, "bunker"),
  spec("building:9108", "자동차매장", "city-car-dealer-shell", BUILDING_TYPE_IDS.CAR_DEALER, DISTRICT_IDS.BAEGEUM_COMMERCE, 0.72, 0.33, 310, 145, "garage"),
  spec("building:9109", "주유소", "city-gas-station-shell", BUILDING_TYPE_IDS.GAS_STATION, DISTRICT_IDS.BAEGEUM_COMMERCE, 0.76, 0.49, 300, 124, "checkpoint"),
  spec("building:9110", "백화점", "city-department-store-shell", BUILDING_TYPE_IDS.DEPARTMENT_STORE, DISTRICT_IDS.BAEGEUM_COMMERCE, 0.37, 0.10, 360, 178, "warehouse"),
  spec("building:9111", "물류센터", "city-logistics-shell", BUILDING_TYPE_IDS.LOGISTICS_CENTER, DISTRICT_IDS.BAEGEUM_TRANSPORT, 0.54, 0.74, 420, 168, "depot"),
  spec("building:9112", "버스정류장", "city-bus-stop-shell", BUILDING_TYPE_IDS.BUS_STOP, DISTRICT_IDS.BAEGEUM_TRANSPORT, 0.10, 0.82, 160, 80, "checkpoint"),
  spec("building:9113", "시외버스터미널", "city-terminal-shell", BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL, DISTRICT_IDS.BAEGEUM_TRANSPORT, 0.14, 0.80, 430, 170, "depot")
];

const INFRASTRUCTURE_IDS = new Set(BUILDINGS.map((building) => building.id));

export function applyBaegeumCityInfrastructureLayout(map) {
  if (!map || map.mapId === "dice-city" || map.id === "dice-city-v0") return map;
  const obstacles = BUILDINGS.map((building) => placedObstacle(building, map));
  map.obstacles = [
    ...(map.obstacles || []).filter((item) => !INFRASTRUCTURE_IDS.has(String(item?.id || ""))),
    ...obstacles
  ];
  map.buildings = [
    ...(map.buildings || []).filter((item) => !INFRASTRUCTURE_IDS.has(String(item?.rect?.id || ""))),
    ...obstacles.map(signOnlyBuilding)
  ];
  map.infrastructureLayoutVersion = BAEGEUM_CITY_INFRASTRUCTURE_LAYOUT_VERSION;
  return map;
}

export function baegeumInfrastructureBuildingIds() {
  return [...INFRASTRUCTURE_IDS];
}

function spec(id, sign, presetId, buildingType, districtId, xRatio, yRatio, w, h, variant) {
  return { id, sign, presetId, buildingType, districtId, xRatio, yRatio, w, h, variant };
}

function placedObstacle(building, map) {
  const x = Math.round((Number(map.width) || 1) * building.xRatio);
  const y = Math.round((Number(map.height) || 1) * building.yRatio);
  return {
    id: building.id,
    presetId: building.presetId,
    x,
    y,
    w: building.w,
    h: building.h,
    kind: "building",
    objectKind: "building_shell",
    buildingType: building.buildingType,
    districtId: building.districtId,
    variant: building.variant,
    sign: building.sign,
    label: building.sign,
    capabilities: ["collidable"],
    collision: {
      kind: "solid-building",
      shape: "rect",
      w: building.w,
      h: building.h,
      blocksPlayers: true,
      blocksVehicles: true
    },
    destructibleSpec: { enabled: false },
    buildRules: {
      category: "building",
      avoidEntrances: true,
      avoidSpawns: true,
      buildingType: building.buildingType,
      districtId: building.districtId
    }
  };
}

function signOnlyBuilding(item) {
  return {
    id: `bg-${item.id}`,
    name: item.sign,
    sign: item.sign,
    infrastructure: true,
    districtId: item.districtId,
    rect: { id: item.id, x: item.x, y: item.y, w: item.w, h: item.h },
    signAnchor: { x: item.x + item.w * 0.5, y: item.y - 18 },
    doors: []
  };
}
