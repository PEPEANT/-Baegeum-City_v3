"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const {
    ITEM_TYPES,
    canFitInventoryItems,
    inventoryUsedSlots,
    itemTypeLabel,
    normalizeInventory,
    normalizeInventoryItem,
    normalizeItemDelta
  } = await load("src/systems/inventory-master.js");

  const food = normalizeInventoryItem({ id: "Food:Triangle Gimbap", type: ITEM_TYPES.FOOD, name: "삼각김밥", count: 12 });
  assert.equal(food.id, "food:triangle-gimbap", "item ids should normalize to stable ids");
  assert.equal(food.type, ITEM_TYPES.FOOD, "known item type should be kept");
  assert.equal(food.count, 10, "food should clamp to default max stack");
  assert.equal(food.consumable, true, "food should default to consumable");
  assert.equal(itemTypeLabel(ITEM_TYPES.TICKET), "입장권", "item type labels should be Korean UI labels");
  const license = normalizeInventoryItem({ id: "license:driver", type: ITEM_TYPES.LICENSE, name: "운전면허" });
  assert.equal(license.maxStack, 1, "licenses should be ownership-like single slot items");
  assert.equal(license.tradeable, false, "licenses should not be tradeable by default");
  assert.equal(license.ownership, "permission", "licenses should represent permission ownership");
  const carKey = normalizeInventoryItem({ id: "vehicle_key:sedan-001", type: ITEM_TYPES.VEHICLE_KEY, name: "세단 차키" });
  assert.equal(carKey.ownership, "vehicle", "vehicle keys should represent vehicle ownership");

  const inventory = normalizeInventory([
    { id: "token:chip-coupon", type: ITEM_TYPES.TOKEN, name: "칩 교환권", count: 1 },
    { id: "token:chip-coupon", type: ITEM_TYPES.TOKEN, name: "칩 교환권", count: 2 },
    { id: "key:vip-room", type: ITEM_TYPES.KEY, name: "VIP 열쇠", count: 3 }
  ], 12);
  assert.equal(inventoryUsedSlots(inventory), 2, "stackable items should merge into one slot");
  assert.equal(inventory.find((item) => item.id === "token:chip-coupon").count, 3, "stack counts should add");
  assert.equal(inventory.find((item) => item.id === "key:vip-room").count, 1, "keys should not stack by default");

  assert.equal(normalizeItemDelta({ id: "food:test", count: -2 }).count, -2, "item deltas should keep negative counts");
  assert.equal(canFitInventoryItems(inventory, [{ id: "ticket:race", type: ITEM_TYPES.TICKET, count: 1 }], 2), false, "bag slot limit should block new slots");

  console.log("Inventory master smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
