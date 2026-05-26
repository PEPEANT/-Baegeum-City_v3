export const CITY_DISTRICT_SCHEMA_VERSION = "city-district-001";

export const CITY_ROLE_IDS = Object.freeze({
  LIFE_HUB: "life_hub",
  GAMBLING_NIGHT: "gambling_night"
});

export const RISK_LEVELS = Object.freeze({
  SAFE: "safe",
  REGULATED: "regulated",
  NIGHTLIFE: "nightlife",
  ILLEGAL: "illegal",
  HAZARDOUS: "hazardous"
});

export const BUILDING_TYPE_IDS = Object.freeze({
  HOME: "home",
  LUXURY_HOME: "luxury_home",
  CONVENIENCE_STORE: "convenience_store",
  FAST_FOOD: "fast_food",
  CAR_DEALER: "car_dealer",
  GAS_STATION: "gas_station",
  DEPARTMENT_STORE: "department_store",
  LOGISTICS_CENTER: "logistics_center",
  POLICE_STATION: "police_station",
  REAL_ESTATE: "real_estate",
  STOCK_MARKET: "stock_market",
  BUS_STOP: "bus_stop",
  INTERCITY_BUS_TERMINAL: "intercity_bus_terminal",
  BLACKJACK_CASINO: "blackjack_casino",
  ODD_EVEN_CASINO: "odd_even_casino",
  HORSE_TRACK: "horse_track",
  CHIP_EXCHANGE: "chip_exchange",
  LOAN_OFFICE: "loan_office",
  PAWNSHOP: "pawnshop",
  MOTEL: "motel",
  NIGHTLIFE: "nightlife",
  BACK_ALLEY: "back_alley"
});

export const DISTRICT_IDS = Object.freeze({
  BAEGEUM_RESIDENTIAL: "baegeum-residential",
  BAEGEUM_CIVIC: "baegeum-civic",
  BAEGEUM_COMMERCE: "baegeum-commerce",
  BAEGEUM_TRANSPORT: "baegeum-transport",
  DICE_CASINO_STRIP: "dice-casino-strip",
  DICE_BACK_ALLEY: "dice-back-alley",
  DICE_NIGHTLIFE: "dice-nightlife",
  DICE_SUPPORT: "dice-support"
});

export const cityBuildingTypes = freezeById([
  buildingType(BUILDING_TYPE_IDS.HOME, "집", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.LUXURY_HOME, "고급집", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.CONVENIENCE_STORE, "편의점", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.FAST_FOOD, "패스트푸드점", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.CAR_DEALER, "자동차매장", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.GAS_STATION, "주유소", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.DEPARTMENT_STORE, "백화점", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.LOGISTICS_CENTER, "물류센터", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.POLICE_STATION, "경찰서", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.REAL_ESTATE, "부동산", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.STOCK_MARKET, "주식시장", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.BUS_STOP, "버스정류장", RISK_LEVELS.SAFE),
  buildingType(BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL, "시외버스터미널", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.BLACKJACK_CASINO, "블랙잭카지노", RISK_LEVELS.NIGHTLIFE),
  buildingType(BUILDING_TYPE_IDS.ODD_EVEN_CASINO, "홀짝카지노", RISK_LEVELS.NIGHTLIFE),
  buildingType(BUILDING_TYPE_IDS.HORSE_TRACK, "경마장", RISK_LEVELS.NIGHTLIFE),
  buildingType(BUILDING_TYPE_IDS.CHIP_EXCHANGE, "칩교환소", RISK_LEVELS.REGULATED),
  buildingType(BUILDING_TYPE_IDS.LOAN_OFFICE, "사채업소", RISK_LEVELS.ILLEGAL),
  buildingType(BUILDING_TYPE_IDS.PAWNSHOP, "전당포", RISK_LEVELS.ILLEGAL),
  buildingType(BUILDING_TYPE_IDS.MOTEL, "모텔", RISK_LEVELS.NIGHTLIFE),
  buildingType(BUILDING_TYPE_IDS.NIGHTLIFE, "유흥업소", RISK_LEVELS.NIGHTLIFE),
  buildingType(BUILDING_TYPE_IDS.BACK_ALLEY, "뒷골목", RISK_LEVELS.HAZARDOUS)
]);

export const cityDistricts = freezeById([
  district(DISTRICT_IDS.BAEGEUM_RESIDENTIAL, "배금시티 주거구역", "baegeum-city", CITY_ROLE_IDS.LIFE_HUB, RISK_LEVELS.SAFE, [
    BUILDING_TYPE_IDS.HOME,
    BUILDING_TYPE_IDS.LUXURY_HOME,
    BUILDING_TYPE_IDS.CONVENIENCE_STORE
  ]),
  district(DISTRICT_IDS.BAEGEUM_CIVIC, "배금시티 공공구역", "baegeum-city", CITY_ROLE_IDS.LIFE_HUB, RISK_LEVELS.REGULATED, [
    BUILDING_TYPE_IDS.POLICE_STATION,
    BUILDING_TYPE_IDS.REAL_ESTATE,
    BUILDING_TYPE_IDS.STOCK_MARKET
  ]),
  district(DISTRICT_IDS.BAEGEUM_COMMERCE, "배금시티 상업구역", "baegeum-city", CITY_ROLE_IDS.LIFE_HUB, RISK_LEVELS.SAFE, [
    BUILDING_TYPE_IDS.CONVENIENCE_STORE,
    BUILDING_TYPE_IDS.FAST_FOOD,
    BUILDING_TYPE_IDS.REAL_ESTATE,
    BUILDING_TYPE_IDS.CAR_DEALER,
    BUILDING_TYPE_IDS.GAS_STATION,
    BUILDING_TYPE_IDS.DEPARTMENT_STORE
  ]),
  district(DISTRICT_IDS.BAEGEUM_TRANSPORT, "배금시티 교통구역", "baegeum-city", CITY_ROLE_IDS.LIFE_HUB, RISK_LEVELS.REGULATED, [
    BUILDING_TYPE_IDS.BUS_STOP,
    BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL,
    BUILDING_TYPE_IDS.LOGISTICS_CENTER
  ]),
  district(DISTRICT_IDS.DICE_CASINO_STRIP, "다이스시티 카지노 거리", "dice-city", CITY_ROLE_IDS.GAMBLING_NIGHT, RISK_LEVELS.NIGHTLIFE, [
    BUILDING_TYPE_IDS.BLACKJACK_CASINO,
    BUILDING_TYPE_IDS.ODD_EVEN_CASINO,
    BUILDING_TYPE_IDS.HORSE_TRACK,
    BUILDING_TYPE_IDS.CHIP_EXCHANGE
  ]),
  district(DISTRICT_IDS.DICE_BACK_ALLEY, "다이스시티 뒷골목", "dice-city", CITY_ROLE_IDS.GAMBLING_NIGHT, RISK_LEVELS.ILLEGAL, [
    BUILDING_TYPE_IDS.LOAN_OFFICE,
    BUILDING_TYPE_IDS.PAWNSHOP,
    BUILDING_TYPE_IDS.BACK_ALLEY
  ]),
  district(DISTRICT_IDS.DICE_NIGHTLIFE, "다이스시티 밤거리", "dice-city", CITY_ROLE_IDS.GAMBLING_NIGHT, RISK_LEVELS.NIGHTLIFE, [
    BUILDING_TYPE_IDS.MOTEL,
    BUILDING_TYPE_IDS.NIGHTLIFE
  ]),
  district(DISTRICT_IDS.DICE_SUPPORT, "다이스시티 지원시설", "dice-city", CITY_ROLE_IDS.GAMBLING_NIGHT, RISK_LEVELS.REGULATED, [
    BUILDING_TYPE_IDS.CHIP_EXCHANGE,
    BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL
  ])
]);

export const cityRoleConfigs = Object.freeze({
  [CITY_ROLE_IDS.LIFE_HUB]: roleConfig({
    roleId: CITY_ROLE_IDS.LIFE_HUB,
    mapId: "baegeum-city",
    label: "배금시티 생활/허브 도시",
    allowedDistrictIds: [
      DISTRICT_IDS.BAEGEUM_RESIDENTIAL,
      DISTRICT_IDS.BAEGEUM_CIVIC,
      DISTRICT_IDS.BAEGEUM_COMMERCE,
      DISTRICT_IDS.BAEGEUM_TRANSPORT
    ],
    legacyPreservedBuildingTypes: [
      BUILDING_TYPE_IDS.BLACKJACK_CASINO,
      BUILDING_TYPE_IDS.ODD_EVEN_CASINO,
      BUILDING_TYPE_IDS.HORSE_TRACK
    ]
  }),
  [CITY_ROLE_IDS.GAMBLING_NIGHT]: roleConfig({
    roleId: CITY_ROLE_IDS.GAMBLING_NIGHT,
    mapId: "dice-city",
    label: "다이스시티 도박/밤거리/위험 도시",
    allowedDistrictIds: [
      DISTRICT_IDS.DICE_CASINO_STRIP,
      DISTRICT_IDS.DICE_BACK_ALLEY,
      DISTRICT_IDS.DICE_NIGHTLIFE,
      DISTRICT_IDS.DICE_SUPPORT
    ]
  })
});

export function getCityRoleConfig(roleOrMapId) {
  return cityRoleConfigs[roleOrMapId] || Object.values(cityRoleConfigs).find((config) => config.mapId === roleOrMapId) || null;
}

export function requireCityRoleConfig(roleOrMapId) {
  const config = getCityRoleConfig(roleOrMapId);
  if (!config) throw new Error(`Unknown city role or map: ${roleOrMapId}`);
  return config;
}

export function getBuildingTypeConfig(typeId) {
  return cityBuildingTypes[typeId] || null;
}

export function getDistrictConfig(districtId) {
  return cityDistricts[districtId] || null;
}

export function buildingTypeStatusForMap(typeId, mapId) {
  const role = getCityRoleConfig(mapId);
  if (!role) return "blocked";
  if (role.allowedNewBuildingTypes.includes(typeId)) return "new_allowed";
  if (role.legacyPreservedBuildingTypes.includes(typeId)) return "legacy_preserved";
  return "blocked";
}

export function canPlaceNewBuildingType(typeId, mapId) {
  return buildingTypeStatusForMap(typeId, mapId) === "new_allowed";
}

export function districtAllowedInMap(districtId, mapId) {
  return requireCityRoleConfig(mapId).allowedDistrictIds.includes(districtId);
}

export function defaultDistrictForBuildingType(typeId, mapId) {
  const role = getCityRoleConfig(mapId);
  if (!role) return null;
  return role.allowedDistrictIds.find((districtId) => cityDistricts[districtId].buildingTypes.includes(typeId)) || null;
}

function roleConfig(config) {
  const allowedNewBuildingTypes = config.allowedDistrictIds
    .flatMap((districtId) => cityDistricts[districtId]?.buildingTypes || [])
    .filter(unique);
  return Object.freeze({
    schemaVersion: CITY_DISTRICT_SCHEMA_VERSION,
    legacyPreservedBuildingTypes: [],
    ...config,
    allowedNewBuildingTypes: Object.freeze(allowedNewBuildingTypes),
    legacyPreservedBuildingTypes: Object.freeze(config.legacyPreservedBuildingTypes || [])
  });
}

function district(id, label, mapId, roleId, riskLevel, buildingTypes) {
  return Object.freeze({ id, label, mapId, roleId, riskLevel, buildingTypes: Object.freeze(buildingTypes) });
}

function buildingType(id, label, riskLevel) {
  return Object.freeze({ id, label, riskLevel });
}

function freezeById(items) {
  return Object.freeze(Object.fromEntries(items.map((item) => [item.id, item])));
}

function unique(value, index, list) {
  return list.indexOf(value) === index;
}
