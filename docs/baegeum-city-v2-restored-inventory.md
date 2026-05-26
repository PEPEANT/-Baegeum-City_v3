# Baegeum City V2 Restored Inventory

Conclusion: restored inventory is the player's carried-item summary, not a real-estate or home-ownership list.

## Purpose

The restored shell needs one place in My Info where the player can see what they physically own or carry after shopping. This includes phones, bags, luxury gifts, and future convenience-store items such as energy drinks.

## Current Source

The restored build currently derives the My Info inventory from `gameState.luxury` because the Dice City restore already stores shop-owned items there.

Included:
- `essential`: phone and smartphone devices.
- `asset`: bags, rings, watches, cars, gold, and giftable goods.
- `consumable`: energy drinks and future convenience-store supplies.

Excluded:
- `realEstate`: houses, apartments, buildings, rent assets, and city property.
- Cash, stocks, crypto positions, futures positions, and relationship state.

## UI Contract

- My Info shows a compact inventory panel under character stats.
- Empty inventory shows a quiet empty state.
- Each owned item shows icon, name, type label, and count.
- The panel may show `사용` only for registered consumables.
- Consumable use must route through `src/restored/inventory/consumable-contract.js`.
- Buying still happens through shop/place actions.
- Future gifting or complex item effects must run through action/economy contracts rather than mutating the panel directly.

## Current Consumables

`energy_drink` is the first restored consumable.

- Source: convenience shop / shop catalog.
- Inventory type: `consumable`.
- Effect contract: `projectRestoredConsumableUse(state, "energy_drink")`.
- Result: reduces `energy_drink.count` by 1, restores `profile.stats.energy` by 20, caps at the stat max, and returns effect records for inventory delta and player state patch.
- Value rule: does not preserve net worth after purchase.

## Expansion Notes

Convenience-store items should enter as `consumable` items first. Later food, medicine, ticket, or relationship gift effects should extend the contract instead of adding one-off My Info button logic.
