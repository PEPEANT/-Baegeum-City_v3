# Restored UI Surface Redesign

Conclusion: the restored build is ready to plan a real UI redesign, but implementation must start from named surfaces and contracts instead of another broad visual rewrite.

## Feature Identity

- Feature id: `restored:ui:surface-redesign`
- Title: Restored UI Surface Redesign
- Domain: ui
- Primary surface: shell
- Related docs:
  - `docs/baegeum-city-v2-restored-recomposition-plan.md`
  - `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`
  - `docs/plans/restored-three-city-home-navigation.md`
  - `docs/plans/restored-login-home-online-phone-migration.md`
  - `docs/baegeum-city-v2-restored-asset-pipeline.md`

## Current Baseline

Current playable entry:

```text
index.html -> baegeum-city-v2-dice.html
```

Current bottom nav is now the location-aware restored shell:

```text
home_inside -> myinfo / home / go_out
home_front -> fast_food / labor_office / convenience_store / bus_stop / go_home
travel -> baegeum-city / dice-city / seosan-city
city -> current city places and travel actions
```

Current guarded preparation:

- `src/restored/player/profile-contract.js` owns the My Info profile, job, residence, condition, and core stat shape.
- `src/restored/phone/phone-app-contract.js` owns phone app ids, labels, icons, and phone/smartphone gates.
- `src/restored/data/location-catalog.js` owns `home_inside`, `home_front`, travel, and first city contexts.
- `src/restored/ui/location-nav-contract.js` owns current location-aware actions consumed by the playable shell.
- `src/restored/account/session-contract.js` owns local guest account state.
- `src/restored/online/online-adapter-contract.js` keeps online unavailable by default.
- `src/restored/inventory/consumable-contract.js` owns registered consumable effects such as energy drink recovery.
- `src/restored/inventory/inventory-view.js` owns the My Info inventory preview renderer.
- `src/restored/assets/asset-manifest.js` owns current audio/image manifest ids.

## Redesign Goal

The next UI should feel like a small life sim that starts at home, not a permanent feature menu.

Target shell:

```text
login home
-> home_inside
   -> 내정보 / 내집 / 밖으로 나가기
-> home_front
   -> 패스트푸드점 / 인력소 / 편의점 / 버스정류장 / 집으로
-> travel
   -> 배금도시 / 다이스시티 / 서산도시
```

Phone is an owned device surface:

```text
휴대폰
-> 뉴스 / 주식 / 코인선물 / relationships / partner DM / future rankings / future chat / future online lobby
```

## Surface Rules

Top bar:

- Shows account, local/online status, rank, cash, total asset, and current location.
- Does not repeat every profile stat.

My Info:

- Is a character sheet.
- Shows identity, rank, relationship summary, job, residence, condition, stats, carried inventory, and account.
- Must not show duplicated cash/net-worth rows.
- Must not hold action buttons such as hunting, going home, city travel, or job entry.
- Must not render the full partner/lover list; that list belongs in the phone relationship app.

Home:

- Owns rest, recovery, home flavor, and future private partner calls.
- Can later use profile stats such as energy, health, mental, and comfort.

Outside / Home Front:

- Owns starter jobs and daily-life places.
- First tabs are fast food, labor office, convenience store, bus stop, and return home.
- Hunting/chance encounters belong here or in city places, not in My Info.

Phone:

- Owns news, stock, futures, rankings, relationship/lover list, partner DM, chat, online lobby, and notifications.
- Uses an app-launcher to app-stage/window flow, following the MammonCity2 phone registry/router idea without copying runtime code.
- Folder phone unlocks basic news, stock, and a simple relationship app.
- Smartphone unlocks futures, advanced charts, richer chat, and future online services.

City:

- Baegeum City is daily life, jobs, relationships, ownership, and phone services.
- Dice City is gambling, risk, nightlife, and casino reaction content.
- Seosan City is job/industry expansion, slower income routes, and future occupation ranking.

## Current Gaps Before Broad Visual Work

Do these before a large UI pass:

1. Move phone app view rendering under `src/restored/phone/`.
2. Make the playable shell read `src/restored/ui/location-nav-contract.js`.
3. Add a home surface renderer that can show `내집`.
4. Add a home-front surface renderer for `밖으로 나가기`.
5. Add a travel surface that lists Baegeum City, Dice City, and Seosan City.
6. Add a small current-location selector or display helper.
7. Add a relationship/lover app id to the phone app contract.
8. Move the partner list entry point from My Info into the phone relationship app.
9. Add relationship/emotion v2 beside legacy `love`.
10. Add illustration slots by manifest id, with fallback.
11. Add job/occupation catalog before job rankings.

## State And Catalog Plan

Already present:

```js
state.location.contextId = "home_inside";
state.profile.stats.energy;
state.account.mode;
state.online.status;
```

Near-term additions should be small and explicit:

```js
{
  ui: {
    activeSurfaceId: "home_inside",
    activeLocationActionId: "myinfo"
  },
  home: {
    restLevel: 0,
    comfortLevel: 0
  },
  jobs: {
    currentOccupationId: "unemployed",
    jobHistory: []
  }
}
```

Do not add these fields until the owning renderer or selector uses them.

## Relationship And Emotion Impact

The redesign should reserve space for partner feeling, but not implement full AI dialogue yet.

First relationship-ready UI hooks:

- relationship phone app home for lover list and partner DM entry
- partner mood row in relationship panel
- phone DM entry point
- dialogue illustration slot
- memory hint row
- casino reaction strip later

Relationship emotion fields should arrive as a separate contract:

```text
affection / trust / tension / jealousy / comfort / memoryEventIds
```

## Ranking And Job Impact

Ranking belongs in the phone, not the bottom nav.

Job ranking needs occupation state first:

- current occupation title
- occupation level
- job income earned
- job reputation
- job badges or licenses

Do not make job rank a renamed wealth rank.

## Online Authority

The redesign may show online status, but must not create a fake lobby.

Rules:

- Guest/local mode can play offline.
- Online lobby appears only after a real connected or explicit dev-mock connected adapter.
- Leaderboards, public chat, and online casino settlement are server-authoritative later.
- MammonCity2 remains a reference; do not copy Firebase config or anonymous auth by default.

## Asset Intake

Before adding images or mp3 files:

- Put raw files in `assets/inbox/`.
- Register runtime assets in `src/restored/assets/asset-manifest.js`.
- Use manifest ids for home, phone, partner, casino, city, and item images.
- Keep placeholder text-only surfaces acceptable until art exists.

Suggested future id families:

```text
image:location:home_inside
image:location:home_front
image:city:baegeum-city
image:city:dice-city
image:partner:<archetype-id>:portrait
audio:ambient:home
audio:ambient:city
```

## Implementation Order

1. Confirm `npm run check` is green.
2. Extract phone app view rendering from `baegeum-city-v2-dice.html`.
3. Add or reuse a UI shell renderer for location-aware nav.
4. Wire runtime bottom nav to `home_inside` actions.
5. Add `내집` surface as a simple verified renderer.
6. Add `밖으로 나가기` transition to `home_front`.
7. Add home-front place tabs from `location-nav-contract`.
8. Add travel surface with the first three cities.
9. Browser-verify home, outside, phone, and return flows.
10. Only then begin visual polish pass for colors, spacing, and art.

## Verification Plan

- Narrow checks:
  - `node tools/check-restored-planning-kit.cjs`
  - `node tools/check-restored-growth-architecture.cjs`
  - `node tools/check-restored-phone-app-contract.cjs`
  - `node tools/check-restored-player-profile.cjs`
- Full check:
  - `npm run check`
- Browser check:
  - Start at login home.
  - Enter as guest.
  - Confirm home-inside shell.
  - Confirm My Info remains a character sheet.
  - Confirm phone app gates still work.
  - Confirm no console errors.

## Do Not

- Do not put news, stocks, futures, rankings, or chat back into global bottom navigation.
- Do not make My Info a money/action dump again.
- Do not build every city place as a permanent tab.
- Do not add real online login, cloud save, or Firebase behavior during UI redesign.
- Do not attach casino outcomes directly to partner emotion without an event boundary.
- Do not add broad art/audio files without manifest ids.
- Do not rewrite the whole restored HTML in one pass.
