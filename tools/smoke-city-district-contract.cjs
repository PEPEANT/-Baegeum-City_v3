"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const [districts, registry, dice] = await Promise.all([
    load("src/data/city-district-contract.js"),
    load("src/data/map-registry.js"),
    load("src/data/dice-city-map.js")
  ]);

  const baegeum = registry.requireMapConfig(registry.MAP_IDS.BAEGEUM_CITY);
  const diceCity = registry.requireMapConfig(registry.MAP_IDS.DICE_CITY);

  assert.equal(baegeum.cityRoleId, districts.CITY_ROLE_IDS.LIFE_HUB);
  assert.equal(diceCity.cityRoleId, districts.CITY_ROLE_IDS.GAMBLING_NIGHT);
  assert.equal(districts.requireCityRoleConfig("baegeum-city").roleId, districts.CITY_ROLE_IDS.LIFE_HUB);
  assert.equal(districts.requireCityRoleConfig("dice-city").roleId, districts.CITY_ROLE_IDS.GAMBLING_NIGHT);

  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.HOME, "baegeum-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.POLICE_STATION, "baegeum-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.GAS_STATION, "baegeum-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.LOGISTICS_CENTER, "baegeum-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.BLACKJACK_CASINO, "baegeum-city"), false);
  assert.equal(districts.buildingTypeStatusForMap(districts.BUILDING_TYPE_IDS.BLACKJACK_CASINO, "baegeum-city"), "legacy_preserved");
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.LOAN_OFFICE, "baegeum-city"), false);

  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.BLACKJACK_CASINO, "dice-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.LOAN_OFFICE, "dice-city"), true);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.HOME, "dice-city"), false);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.POLICE_STATION, "dice-city"), false);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.DEPARTMENT_STORE, "dice-city"), false);
  assert.equal(districts.canPlaceNewBuildingType(districts.BUILDING_TYPE_IDS.INTERCITY_BUS_TERMINAL, "dice-city"), true);

  assert.equal(districts.defaultDistrictForBuildingType(districts.BUILDING_TYPE_IDS.CONVENIENCE_STORE, "baegeum-city"), districts.DISTRICT_IDS.BAEGEUM_RESIDENTIAL);
  assert.equal(districts.defaultDistrictForBuildingType(districts.BUILDING_TYPE_IDS.PAWNSHOP, "dice-city"), districts.DISTRICT_IDS.DICE_BACK_ALLEY);
  assert.equal(districts.districtAllowedInMap(districts.DISTRICT_IDS.DICE_CASINO_STRIP, "baegeum-city"), false);
  assert.equal(districts.districtAllowedInMap(districts.DISTRICT_IDS.BAEGEUM_CIVIC, "dice-city"), false);

  const copiedVenueTypes = dice.diceCityMap.buildings.map((building) => buildingTypeForGameType(building.gameType));
  assert.deepStrictEqual(copiedVenueTypes, [
    districts.BUILDING_TYPE_IDS.BLACKJACK_CASINO,
    districts.BUILDING_TYPE_IDS.ODD_EVEN_CASINO,
    districts.BUILDING_TYPE_IDS.HORSE_TRACK
  ]);
  for (const typeId of copiedVenueTypes) {
    assert.equal(districts.canPlaceNewBuildingType(typeId, "dice-city"), true, `${typeId} must belong in dice-city`);
  }

  console.log("City district contract smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function buildingTypeForGameType(gameType) {
  if (gameType === "blackjack") return "blackjack_casino";
  if (gameType === "odd-even") return "odd_even_casino";
  if (gameType === "horse-racing") return "horse_track";
  return `unknown:${gameType}`;
}
