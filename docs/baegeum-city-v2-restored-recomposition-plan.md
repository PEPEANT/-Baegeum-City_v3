# Baegeum City V2 Restored Recomposition Plan

Conclusion: the restored Dice City-derived HTML should stay playable, but every new expansion must move toward small contracts for state, AI actors, places, UI shell, and feature systems before adding more inline script.

## Purpose

This document owns the pre-redesign work for the current player-facing build:

```text
index.html -> baegeum-city-v2-dice.html
```

`docs/baegeum-city-v2-restored-growth-architecture.md` owns the feature direction. This document owns the recomposition order that prevents that direction from becoming another single-file bottleneck.

## Current Bottlenecks

- `baegeum-city-v2-dice.html` is still the runtime, view layer, market simulator, relationship system, and casino system in one file, but core static catalogs are now split into `src/restored/data/`.
- `gameState` is still mutated directly from UI handlers, timers, casino outcomes, gifts, stock trades, futures positions, and relationship actions, but read-only selectors for rank, assets, and phone ownership now live outside the HTML.
- Player profile basics now live in `src/restored/player/profile-contract.js`, so My Info can become a character sheet before jobs, rankings, and dialogue emotion expand.
- Phone apps are now grouped correctly as phone UI, but their render, market logic, and future relationship app logic still live beside global tab rendering.
- Relationship state is still mostly `love`, so future AI lovers, jealousy, trust, memory, and dialogue branching have no clean ownership boundary yet.
- Casino results do not yet produce a neutral event stream that relationship/conversation systems can react to later.
- City identity exists as a catalog, but places, actor locations, and UI surfaces are not yet explicit enough for roaming AI.
- Illustration and portrait expansion now has an asset manifest contract, but illustration rendering and fallback logic are not wired into gameplay yet.

## Recomposition Rule

No big-bang rewrite. The restored game should be split while preserving the current playable behavior.

Allowed flow:

```text
document contract
-> add tiny src/restored module
-> guard it in tools/check-restored-growth-architecture.cjs
-> only then move live HTML behavior into that module
```

Forbidden flow:

```text
add large inline feature
-> patch globals until it works
-> document later
```

## Target Runtime Shape

```text
src/restored/
  app/             startup, event wiring, tab routing
  state/           initial state, storage, selectors, migrations
  player/          profile, stats, job identity, residence and condition contracts
  data/            static catalogs for cities, places, assets, markets, partners
  actors/          AI actor identity, location, schedule, memory contracts
  systems/         economy, ownership, market, gambling, relationship, emotion
  phone/           phone shell and phone apps
  ui/              view renderers, modals, illustration stage, toast surface
  assets/          manifest ids for audio, images, references, and future art
  games/           odd-even, blackjack, futures helpers
```

Each file should stay small enough for an AI session to understand in one pass. Prefer under 250 lines for restored modules.

Current contract files:

- `src/restored/actors/actor-contract.js`
- `src/restored/data/place-catalog.js`
- `src/restored/data/location-catalog.js`
- `src/restored/state/initial-state.js`
- `src/restored/state/selectors.js`
- `src/restored/state/storage.js`
- `src/restored/player/profile-contract.js`
- `src/restored/online/online-adapter-contract.js`
- `src/restored/phone/phone-app-contract.js`
- `src/restored/inventory/consumable-contract.js`
- `src/restored/inventory/inventory-view.js`
- `src/restored/ui/shell-contract.js`
- `src/restored/ui/location-nav-contract.js`
- `src/restored/assets/asset-manifest.js`

## City Split

Current city roles:

- `baegeum-city`: life hub, identity, ownership, phone, relationship setup.
- `dice-city`: gambling hub, risk events, casino venues, futures pressure, relationship reactions.

Future city work should use explicit city and place contracts instead of checking text labels or active tabs.

Minimum place data:

```js
{
  id: "dice:casino-floor",
  cityId: "dice-city",
  kind: "casino",
  uiSurface: "casino",
  actorSlots: ["partner_follow", "casino_staff"],
  featureDomains: ["casino", "relationship_reactions"]
}
```

## AI Roaming Actor Model

Future AI lovers and NPCs may need to move around the city, appear in phone conversations, react to gambling, and unlock illustrations. That means actors need a location model before conversation branches expand.

Minimum actor state:

```js
{
  id: "actor:partner:college-student",
  domain: "partner",
  displayName: "대학생",
  currentLocation: {
    cityId: "baegeum-city",
    placeId: "baegeum:street",
    locationType: "district"
  },
  scheduleId: "schedule:partner:default",
  relationshipId: "partner:college-student",
  memoryEventIds: []
}
```

Actor movement should not directly mutate relationship values. Movement creates context; relationship and emotion systems decide the later effect.

```text
world tick / route choice
-> actor location event
-> available interaction changes
-> conversation/emotion systems read context
```

## UI Redesign Direction

The current restored runtime now consumes location-aware bottom navigation:

```text
home_inside -> myinfo / home / go_out
home_front -> fast_food / labor_office / convenience_store / bus_stop / go_home
travel -> baegeum-city / dice-city / seosan-city
city -> current city places and travel actions
```

This keeps the earlier direction: the player starts inside the house, steps outside to a house-front location, then expands into city districts and city travel.

```text
home_inside -> home_front -> baegeum-city | dice-city | seosan-city
```

Long-term UI surfaces should be separated by location and job:

- Top bar: rank, total asset, cash, current city.
- Bottom nav: current-location actions, never every feature at once.
- Home shell: `myinfo`, `home`, and `go_out`.
- Home-front shell: fast food, labor office, convenience store, bus stop, and go-home actions.
- Phone shell: app grid, app stage/window, news, stocks, futures, relationship/lover list, future chats, notifications.
- Relationship panel: phone-launched partner list, current mood, call/message entry.
- Dialogue modal: branching choices, memory hints, illustration slot.
- Illustration stage: portrait/event image by manifest id, with fallback.
- Casino surface: game selection, bet controls, result event feed.
- City surface: city-specific place view, roaming actor presence, travel actions.

Do not redesign the visuals broadly before these surfaces are named in code. Otherwise later AI, illustration, and city movement work will keep fighting the layout.

`docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md` owns the broader UI/design, online, ranking, and chat expansion plan that builds on these surfaces.
`docs/plans/restored-ui-surface-redesign.md` owns the immediate pre-redesign checklist before the playable shell changes.

## Event Boundaries

Money, ownership, gambling, and relationship should not write into each other directly.

Preferred flow:

```text
UI click
-> system action
-> state patch
-> event record
-> save
-> render
```

Examples:

- Casino win/loss creates `casino_win` or `casino_loss`.
- Relationship system reads that event and may adjust trust/tension later.
- Gift action creates `gift_given`; ownership removes the item; relationship reads the event.
- Phone unlock changes available app surfaces, not bottom navigation.

## Split Order

1. Guard the current shell: bottom nav ids, phone hub, storage key, HTML line budget.
2. Add `actor`, `place`, and `ui shell` contracts under `src/restored/`.
3. Extract `INITIAL_STATE`, storage key, and save envelope from the HTML. Current status: initial state and storage are now live in `src/restored/state/`.
4. Extract static catalogs: ranks, assets, markets, partner archetypes. Current status: live in `src/restored/data/`.
5. Extract selectors: total asset, rank, phone ownership, smartphone ownership, and carried inventory. Current status: restored selectors are now live in `src/restored/state/selectors.js`.
6. Add location navigation contracts for house, house-front, city districts, and travel. Current status: location catalog and location-nav contract are guarded and the playable shell consumes them.
7. Add an online adapter contract that returns `unavailable` by default and never opens a fake lobby. Current status: guarded in `src/restored/online/online-adapter-contract.js`.
8. Keep My Info as a profile/character sheet, not a money/action dump. Current status: profile stats are guarded in `src/restored/player/profile-contract.js`.
9. Extract phone apps: news, stock, futures rendering and access gates. Current status: app ids and phone/smartphone gates are guarded in `src/restored/phone/phone-app-contract.js`; full render extraction is still pending.
10. Add the relationship/lover list as a phone app entry instead of a My Info section. Current status: implemented in the playable phone surface.
10a. Add carried inventory preview and basic consumable use. Current status: My Info inventory preview is rendered from `src/restored/inventory/inventory-view.js`, and energy drink use routes through `src/restored/inventory/consumable-contract.js`.
11. Extract gambling systems: odd-even and blackjack result helpers.
12. Add relationship/emotion state v2 beside old `love`, with migration.
13. Add conversation catalog and event-driven dialogue selection.
14. Add illustration catalog and fallback portrait handling using asset manifest ids.
15. Add actor roaming scheduler only after actor/place contracts are used by UI.

## Early Guards

The architecture check should fail when:

- The restored HTML crosses its line budget.
- News, stock, or futures return to bottom navigation.
- New places become permanent global tabs instead of current-location actions.
- `src/restored/` modules cross their line budget.
- City catalog loses `baegeum-city`, `dice-city`, or `seosan-city`.
- Actor contracts stop supporting city/place/location movement.
- UI shell contracts stop treating phone apps as phone apps.
- My Info starts rendering the full partner/lover list again.
- Place contracts stop exposing actor slots for future roaming AI.
- New mp3 or image files appear under `assets/` without manifest ids.
- Total asset, rank, phone, or smartphone ownership selectors move back into the HTML.
- Inventory preview rendering or consumable effect logic moves back into the HTML.

## Do Not

- Do not split the whole HTML in one patch.
- Do not add more large inline systems to `baegeum-city-v2-dice.html`.
- Do not connect AI dialogue to an external API as a hard dependency.
- Do not make casino events directly mutate partner emotion.
- Do not put phone apps back into the main bottom navigation.
- Do not add every city place to the same global tab bar.
- Do not attach real payment, real gambling, or account behavior.

## Next Safe Slice

State, storage, selectors, profile stats, phone app gates, static catalogs, city/place/location contracts, shell contracts, location-nav contracts, online adapter contract, inventory consumables, asset manifest, intake, planning kit, and the UI/online/ranking/chat roadmap are now guarded. The next coding slice should move more phone app rendering under `src/restored/phone/` or move shop purchases toward a restored action/effect contract.
