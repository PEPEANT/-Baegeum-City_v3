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
- Phone apps are now grouped correctly as phone UI. News, stock, futures, relationship partner-card/recent-log rendering, and the Baegeum Store shell are extracted under `src/restored/phone/`, while market ticks, trades, and futures open/close handlers still live in the restored HTML.
- The phone OS/app-store ecosystem now has a separate catalog so future messenger, virtual community, ranking, bank/pay, map, and online lobby apps do not automatically become live app buttons. `app_store` is live only because its small view module exists.
- Relationship mutation paths for the current walk encounter, interest, call, AI talk, gift, intimacy, marriage, and passive drift now run through a relationship event runtime while keeping legacy `love` compatibility.
- Relationship summary display and phone recent-log display now read the new relationship contract through small view modules, and the current relationship actions can create visible relationship logs.
- Existing casino results are legacy prototype behavior. The restored gambling replacement contract now defines the neutral event/effect stream, but live casino UI still does not emit it.
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
  economy/         restored currency boundaries such as DPA casino token exchange
  actors/          AI actor identity, location, schedule, memory contracts
  systems/         economy, ownership, market, gambling, relationship, emotion
  phone/           phone shell and phone apps
  ui/              view renderers, modals, illustration stage, toast surface
  assets/          manifest ids for audio, images, references, and future art
  games/           replacement gambling modules, game rules, and result helpers
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
- `src/restored/phone/phone-app-ecosystem-contract.js`
- `src/restored/phone/app-store-view.js`
- `src/restored/phone/futures-app-view.js`
- `src/restored/phone/news-app-view.js`
- `src/restored/phone/relationship-app-view.js`
- `src/restored/phone/stock-app-view.js`
- `src/restored/inventory/consumable-contract.js`
- `src/restored/inventory/inventory-view.js`
- `src/restored/economy/dpa-token-contract.js`
- `src/restored/games/gambling-replacement-contract.js`
- `src/restored/games/blackjack-contract.js`
- `src/restored/games/blackjack-round-contract.js`
- `src/restored/games/roulette-contract.js`
- `src/restored/games/baccarat-contract.js`
- `src/restored/games/slot-contract.js`
- `src/restored/games/pawnshop-contract.js`
- `src/restored/games/loan-office-contract.js`
- `src/restored/systems/relationship-contract.js`
- `src/restored/systems/relationship-event-runtime.js`
- `src/restored/ui/relationship-summary-view.js`
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

Baegeum frontage slice:

- Keep the bottom nav compact; do not add every building as a tab.
- Show missing city identity through place-surface rows and signs inside existing surfaces.
- `baegeum:job-street` owns 고시원, 편의점, 맥버거, and 인력소 as first job/life frontage candidates.
- `baegeum:shop-street` owns 디페이 ATM, 배금증권, 배금은행, and 중고차 매장 as first commerce/finance frontage candidates.
- Dice City casino street can show 룰렛카지노, 바카라카지노, 경마장, and DPA 환전소 as rows before each game has a full animated adapter.
- DPA is a casino token boundary, not a replacement for normal 원화/cash.

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
9. Extract phone apps: news, stock, futures rendering and access gates. Current status: live app ids and phone/smartphone gates are guarded in `src/restored/phone/phone-app-contract.js`; app-store candidates are guarded in `src/restored/phone/phone-app-ecosystem-contract.js`; the Baegeum Store shell is rendered by `src/restored/phone/app-store-view.js`; news list rendering is in `src/restored/phone/news-app-view.js`; stock app rendering is in `src/restored/phone/stock-app-view.js`; futures app rendering is in `src/restored/phone/futures-app-view.js`; relationship partner-card plus recent-log rendering is in `src/restored/phone/relationship-app-view.js`.
10. Add the relationship/lover list as a phone app entry instead of a My Info section. Current status: implemented in the playable phone surface.
10a. Add carried inventory preview and basic consumable use. Current status: My Info inventory preview is rendered from `src/restored/inventory/inventory-view.js`, and energy drink use routes through `src/restored/inventory/consumable-contract.js`.
11. Replace gambling systems: define a restored gambling contract first, then rebuild odd-even, blackjack, roulette, baccarat, slots, pawnshop, and loan-office flows as separate modules instead of preserving the inline casino scripts. Current status: `src/restored/games/gambling-replacement-contract.js` defines neutral gambling events, ledger bridge effects, relationship/emotion hooks, and online authority requests. `src/restored/games/blackjack-contract.js` now defines pure blackjack scoring, comparison, and bet/result envelopes. `src/restored/games/blackjack-round-contract.js` now defines the pure `ready -> player_turn -> dealer_turn -> settled` round state flow. `src/restored/games/roulette-contract.js` now defines pure single-zero roulette bet/result envelopes. `src/restored/games/baccarat-contract.js` now defines pure player / banker / tie baccarat bet/result envelopes. `src/restored/games/slot-contract.js` now defines pure provided-reel slot bet/result envelopes. `src/restored/games/pawnshop-contract.js` now defines pure pawnshop quote, pawn, redeem, and forfeiture envelopes. `src/restored/games/loan-office-contract.js` now defines pure loan quotes, borrow, payment, delinquency, and default effects. Live casino, pawnshop, and loan-office UI are still intentionally unconnected.
12. Add relationship/emotion state v2 beside old `love`, with migration. Current status: `src/restored/systems/relationship-contract.js` now owns pure legacy `love` migration, relationship stages, affection/trust/stability/risk clamps, confession readiness checks, summary selectors, and relationship log envelopes. `src/restored/systems/relationship-event-runtime.js` routes current walk encounter, interest, call, AI talk, gift, intimacy, marriage, and passive drift actions through source events and relationship logs. `src/restored/ui/relationship-summary-view.js` renders the compact My Info summary, and `src/restored/phone/relationship-app-view.js` renders phone partner cards plus recent relationship logs from that contract. Dedicated DM/date/confession surfaces are still pending.
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
- Game contracts must stay pure: no DOM, browser storage, timers, random outcome generation, or direct UI animation code under `src/restored/games/`.

## Do Not

- Do not split the whole HTML in one patch.
- Do not add more large inline systems to `baegeum-city-v2-dice.html`.
- Do not connect AI dialogue to an external API as a hard dependency.
- Do not make casino events directly mutate partner emotion.
- Do not extend the old Dice City gambling scripts as the long-term system; keep them playable only until their replacement modules exist.
- Do not put phone apps back into the main bottom navigation.
- Do not add every city place to the same global tab bar.
- Do not attach real payment, real gambling, or account behavior.

## Next Safe Slice

State, storage, selectors, profile stats, phone app gates, phone app ecosystem catalog, Baegeum Store shell, news/stock/futures phone views, relationship phone app cards and recent logs, static catalogs, city/place/location contracts, shell contracts, location-nav contracts, online adapter contract, inventory consumables, DPA casino-token boundary, Baegeum frontage rows, restored gambling replacement vocabulary, pure blackjack rules and round state, pure roulette rules, pure baccarat rules, pure slot rules, pure pawnshop collateral envelopes, pure loan-office debt effects, relationship v2 contract helpers, relationship event runtime, My Info relationship summary view, asset manifest, intake, planning kit, and the UI/online/ranking/chat roadmap are now guarded. The next coding slice should add a deliberate date, DM, or confession surface before casino/loan/pawnshop reactions, or move stock/futures action handlers after a separate contract.
