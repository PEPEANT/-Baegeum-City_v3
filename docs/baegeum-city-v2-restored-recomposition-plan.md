# Baegeum City V2 Restored Recomposition Plan

Conclusion: the restored Dice City-derived HTML should stay playable, but every new expansion must move toward small contracts for state, AI actors, places, UI shell, and feature systems before adding more inline script.

## Purpose

This document owns the pre-redesign work for the current player-facing build:

```text
index.html -> baegeum-city-v2-dice.html
```

`docs/baegeum-city-v2-restored-growth-architecture.md` owns the feature direction. This document owns the recomposition order that prevents that direction from becoming another single-file bottleneck.

## Current Bottlenecks

- `baegeum-city-v2-dice.html` is still the runtime, view layer, data catalog, save system, market simulator, relationship system, and casino system in one file.
- `gameState` is still mutated directly from UI handlers, timers, casino outcomes, gifts, stock trades, futures positions, and relationship actions, but read-only selectors for rank, assets, and phone ownership now live outside the HTML.
- Phone apps are now grouped correctly as phone UI, but their render and market logic still live beside global tab rendering.
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
- `src/restored/state/initial-state.js`
- `src/restored/state/selectors.js`
- `src/restored/state/storage.js`
- `src/restored/ui/shell-contract.js`
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

The current five bottom tabs are directionally correct:

```text
내정보 / 휴대폰 / 부동산 / 도박 / 상점
```

Long-term UI surfaces should be separated by job:

- Top bar: rank, total asset, cash, current city.
- Bottom nav: only primary surfaces, never individual phone apps.
- Phone shell: news, stocks, futures, future chats, notifications.
- Relationship panel: partner list, current mood, call/message entry.
- Dialogue modal: branching choices, memory hints, illustration slot.
- Illustration stage: portrait/event image by manifest id, with fallback.
- Casino surface: game selection, bet controls, result event feed.
- City surface: future place view, roaming actor presence, travel actions.

Do not redesign the visuals broadly before these surfaces are named in code. Otherwise later AI, illustration, and city movement work will keep fighting the layout.

`docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md` owns the broader UI/design, online, ranking, and chat expansion plan that builds on these surfaces.

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
4. Extract static catalogs: ranks, assets, markets, partner archetypes.
5. Extract selectors: total asset, rank, phone ownership, smartphone ownership. Current status: restored selectors are now live in `src/restored/state/selectors.js`.
6. Extract phone apps: news, stock, futures rendering and access gates.
7. Extract gambling systems: odd-even and blackjack result helpers.
8. Add relationship/emotion state v2 beside old `love`, with migration.
9. Add conversation catalog and event-driven dialogue selection.
10. Add illustration catalog and fallback portrait handling using asset manifest ids.
11. Add actor roaming scheduler only after actor/place contracts are used by UI.

## Early Guards

The architecture check should fail when:

- The restored HTML crosses its line budget.
- News, stock, or futures return to bottom navigation.
- `src/restored/` modules cross their line budget.
- City catalog loses `baegeum-city` or `dice-city`.
- Actor contracts stop supporting city/place/location movement.
- UI shell contracts stop treating phone apps as phone apps.
- Place contracts stop exposing actor slots for future roaming AI.
- New mp3 or image files appear under `assets/` without manifest ids.
- Total asset, rank, phone, or smartphone ownership selectors move back into the HTML.

## Do Not

- Do not split the whole HTML in one patch.
- Do not add more large inline systems to `baegeum-city-v2-dice.html`.
- Do not connect AI dialogue to an external API as a hard dependency.
- Do not make casino events directly mutate partner emotion.
- Do not put phone apps back into the main bottom navigation.
- Do not attach real payment, real gambling, or account behavior.

## Next Safe Slice

State, storage, selectors, city/place contracts, shell contracts, asset manifest, intake, and the UI/online/ranking/chat roadmap are now guarded. The next coding slice should extract static catalogs for ranks, assets, markets, and partner archetypes before relationship, conversation, ranking, chat, online, or illustration behavior expands.
