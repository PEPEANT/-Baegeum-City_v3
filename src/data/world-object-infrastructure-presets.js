import { BUILDING_TYPE_IDS, DISTRICT_IDS } from "./city-district-contract.js";

const CITY_BUILDINGS = [
  city("city-home-shell", "집", "주거 / 입장 없음", BUILDING_TYPE_IDS.HOME, DISTRICT_IDS.BAEGEUM_RESIDENTIAL, "#8b7d62", "barracks", 190, 126),
  city("city-luxury-home-shell", "고급집", "주거 / 입장 없음", BUILDING_TYPE_IDS.LUXURY_HOME, DISTRICT_IDS.BAEGEUM_RESIDENTIAL, "#a58c64", "warehouse", 240, 148),
  city("city-convenience-shell", "편의점", "생활 인프라 / 입장 없음", BUILDING_TYPE_IDS.CONVENIENCE_STORE, DISTRICT_IDS.BAEGEUM_COMMERCE, "#6c8377", "service-block", 230, 130),
  city("city-fast-food-shell", "패스트푸드점", "생활 인프라 / 입장 없음", BUILDING_TYPE_IDS.FAST_FOOD, DISTRICT_IDS.BAEGEUM_COMMERCE, "#a06f46", "depot", 220, 120),
  city("city-car-dealer-shell", "자동차매장", "차량 인프라 / 입장 없음", BUILDING_TYPE_IDS.CAR_DEALER, DISTRICT_IDS.BAEGEUM_COMMERCE, "#5d7486", "garage", 310, 145),
  city("city-gas-station-shell", "주유소", "차량 인프라 / 입장 없음", BUILDING_TYPE_IDS.GAS_STATION, DISTRICT_IDS.BAEGEUM_COMMERCE, "#826c44", "checkpoint", 300, 124),
  city("city-department-store-shell", "백화점", "대형 상업 / 입장 없음", BUILDING_TYPE_IDS.DEPARTMENT_STORE, DISTRICT_IDS.BAEGEUM_COMMERCE, "#7a7386", "warehouse", 360, 178),
  city("city-logistics-shell", "물류센터", "교통 인프라 / 입장 없음", BUILDING_TYPE_IDS.LOGISTICS_CENTER, DISTRICT_IDS.BAEGEUM_TRANSPORT, "#66716d", "depot", 420, 168),
  city("city-police-shell", "경찰서", "공공 인프라 / 입장 없음", BUILDING_TYPE_IDS.POLICE_STATION, DISTRICT_IDS.BAEGEUM_CIVIC, "#657989", "checkpoint", 300, 150),
  city("city-real-estate-shell", "부동산", "공공 경제 / 입장 없음", BUILDING_TYPE_IDS.REAL_ESTATE, DISTRICT_IDS.BAEGEUM_CIVIC, "#7c7364", "service-block", 240, 130),
  city("city-stock-market-shell", "주식시장", "공공 경제 / 입장 없음", BUILDING_TYPE_IDS.STOCK_MARKET, DISTRICT_IDS.BAEGEUM_CIVIC, "#6d758f", "bunker", 290, 145),
  city("city-bus-stop-shell", "버스정류장", "교통 / 입장 없음", BUILDING_TYPE_IDS.BUS_STOP, DISTRICT_IDS.BAEGEUM_TRANSPORT, "#7f8b6b", "checkpoint", 160, 80),
  city("city-terminal-shell", "시외버스터미널", "다이스시티 연결 허브", BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL, DISTRICT_IDS.BAEGEUM_TRANSPORT, "#7d6756", "depot", 430, 170)
];

export const INFRASTRUCTURE_WORLD_OBJECT_PRESETS = Object.freeze(CITY_BUILDINGS.map(toPreset));

function city(id, label, meta, buildingType, districtId, swatch, variant, w, h) {
  return { id, label, meta, buildingType, districtId, swatch, variant, w, h };
}

function toPreset(config) {
  return Object.freeze({
    id: config.id,
    label: config.label,
    layer: "obstacle",
    editor: {
      buildable: true,
      category: "city",
      meta: config.meta,
      pinned: false,
      swatch: config.swatch,
      buildingType: config.buildingType,
      districtId: config.districtId
    },
    visual: {
      kind: "building",
      objectKind: "building_shell",
      capabilities: ["collidable"],
      variant: config.variant,
      w: config.w,
      h: config.h,
      buildingType: config.buildingType,
      districtId: config.districtId
    },
    collision: {
      kind: "solid-building",
      shape: "rect",
      w: config.w,
      h: config.h,
      blocksPlayers: true,
      blocksVehicles: true
    },
    destructible: { enabled: false },
    buildRules: {
      category: "building",
      avoidEntrances: true,
      avoidSpawns: true,
      buildingType: config.buildingType,
      districtId: config.districtId
    }
  });
}
