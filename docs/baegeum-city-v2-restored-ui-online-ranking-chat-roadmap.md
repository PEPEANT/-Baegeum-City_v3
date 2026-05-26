# Baegeum City V2 Restored UI, Online, Ranking, And Chat Roadmap

Conclusion: the restored build should improve its UI first by naming stable surfaces, then grow online, ranking, and chat through contracts instead of adding more loose handlers to `baegeum-city-v2-dice.html`.

## Purpose

This document owns the next planning layer for the active restored build:

```text
index.html -> baegeum-city-v2-dice.html
```

Use it before broad UI redesign, online lobby work, ranking screens, partner chat expansion, or public chat work.

Related source documents:

- `docs/baegeum-city-v2-ui-design-rules.md`
- `docs/baegeum-city-v2-online-state-protocol.md`
- `docs/baegeum-city-v2-online-lobby-contract.md`
- `docs/baegeum-city-v2-chat.md`
- `docs/baegeum-city-v2-restored-recomposition-plan.md`
- `docs/baegeum-city-v2-restored-growth-architecture.md`

## Current Restored Baseline

Current player-facing navigation should stay compact:

```text
myinfo / phone / realestate / casino / shop
```

News, stocks, and futures belong inside the phone. If the player has no phone, those apps should not be reachable. If the player has a folder phone, basic news and stock access can unlock. Smartphone-only apps such as futures, advanced charts, AI calls, and richer chat can unlock later.

Current split status:

- `src/restored/state/initial-state.js` owns initial state.
- `src/restored/state/storage.js` owns save/load and cash-only restore helpers.
- `src/restored/state/selectors.js` owns total asset, rank, phone ownership, and smartphone ownership calculations.
- Static catalogs for ranks, markets, assets, and partners are still the next cleanup layer before large UI or relationship work.

## UI Surfaces

Future UI work should split by player job, not by old tabs.

Primary surfaces:

- Top bar: player rank title, cash, total asset, current city, and future online status.
- Bottom nav: only `myinfo`, `phone`, `realestate`, `casino`, and `shop`.
- My info: identity, net worth, relationship summary, partner list, and core life actions.
- Phone shell: app grid, notifications, partner DM entry, news, stocks, futures, rankings, and future online services.
- Relationship panel: partner mood, stage, memory hints, call/message/gift/date choices.
- Dialogue modal: branching choices, emotional result preview, memory references, and illustration slot.
- Casino surface: bet controls, game table, settlement feed, and partner reaction strip.
- Shop and ownership: buy/sell, inventory, gift eligibility, and item story value.
- City/place surface: future city split, actor presence, travel, and place-specific actions.

The bottom nav must not grow again when a phone app is added.

## Design Draft

The restored game should feel like a compact life-and-risk sim, not a landing page.

Design direction:

- Economy screens should be dense, scannable, and calm.
- Casino screens can carry stronger contrast, table color, chips, and result motion.
- Partner and conversation screens can be softer, image-led, and emotionally focused.
- Phone screens should look like a practical in-game phone UI, with app icons, unread marks, and small status indicators.
- Illustration slots should be reserved early even before final art exists, using manifest ids and fallbacks.

First redesign pass:

```text
top bar
-> bottom nav
-> phone shell
-> my info/partner panel
-> casino surface
-> shop/ownership cards
```

Do not redesign every visual at once. Lock the surface names in code first, then improve each view.

## Online Expansion

The restored build remains offline-first, but online-ready.

Authority Rules:

- Local offline state may calculate single-player cash, ownership, partner state, and casino outcomes.
- Online leaderboard rank must be server-authoritative.
- Online chat delivery, moderation, room membership, and history must be server-authoritative.
- Online casino settlement should not be added until ledger/action authority is explicit.
- No fake offline lobby. The online lobby only appears after a real connected or explicit dev-mock connected state.
- Version gates must follow `baegeum-city-v2-online-lobby-contract.md`.

Recommended online phases:

1. Add a read-only online status selector and UI slot in the top bar.
2. Add a restored online adapter contract that can return `unavailable` by default.
3. Add dev-only mock connection for tests, not for normal offline play.
4. Add phone-based online lobby entry after connected state.
5. Add presence and chat channel sync.
6. Add read-only leaderboard snapshots.
7. Add server-authoritative economy and casino settlement only after ledger contracts are ready.

Minimum connection states:

```js
{
  status: "offline | unavailable | connecting | connected | disconnected_grace | expired",
  clientId: "",
  serverTimeMs: 0,
  lastError: ""
}
```

## Ranking System

Local rank and online ranking are different.

Local rank:

- Comes from current wealth/title selectors.
- Drives avatar, house flavor, and life-stage copy.
- Can stay fully offline.

Online ranking:

- Comes from server-authoritative snapshots.
- Should live in the phone as a `rankings` app.
- Should not overwrite local title/rank.

Suggested boards:

- `netWorth`: total wealth leaderboard.
- `cash`: liquid cash leaderboard.
- `casinoProfit`: season casino profit.
- `biggestWin`: biggest single casino win.
- `collector`: owned luxury/real-estate score.
- `jobRank`: job or occupation level leaderboard.
- `jobIncome`: income earned through jobs.
- `jobReputation`: job-specific reputation, reliability, or fame.
- `relationshipReputation`: future social/relationship reputation, not raw affection.

Job boards should not be raw wealth aliases. A player can be high wealth but low job reputation, or poor but high job rank in a specific occupation.

Suggested job ranking dimensions:

- current occupation title
- occupation level
- job income earned this season
- job streak or reliability
- job-specific reputation
- job badges or licenses

Minimum snapshot shape:

```js
{
  seasonId: "season:local-dev",
  boardId: "netWorth",
  scope: "local | global | friends | room",
  generatedAt: 0,
  entries: [
    {
      playerId: "local-player",
      displayName: "Player",
      score: 0,
      rank: 1,
      badge: "local-preview"
    }
  ]
}
```

First implementation should be a local preview selector plus a phone ranking screen. Online boards should be wired only after online snapshots exist.

Job or occupation ranking should start as a local preview board in the phone. Online job rankings should wait until occupation ids, season rules, and server-owned score snapshots exist.

## Chat Expansion

Chat starts in the phone and grows outward.

Offline chat:

- Partner DM is the first restored chat surface.
- Partner lines should come from a dialogue catalog, not hard-coded button strings.
- Relationship state should include affection, trust, tension, jealousy, comfort, and memory before deep branching.
- AI-generated text must not be a hard dependency. Catalog fallback is required.

Online chat:

- Use the channel model from `docs/baegeum-city-v2-chat.md`.
- Server owns delivery, history, moderation status, and channel membership.
- Client may render optimistic messages only with a `clientNonce`.
- Rate limits and block/report affordances should exist before public chat is exposed.

Channels to prepare:

- `partner_dm:<partner-id>`
- `world:baegeum-city`
- `world:dice-city`
- `venue:<venue-id>`
- `table:<venue-id>:main`
- `system:notice`

Minimum message shape:

```js
{
  id: "message-id",
  channelId: "partner_dm:college-student",
  senderId: "local-player",
  senderType: "player | partner | system | remote_player",
  text: "message",
  createdAt: 0,
  clientNonce: "",
  moderationStatus: "local | pending | approved | hidden"
}
```

## Expansion Order

1. Extract restored static catalogs for ranks, assets, markets, and partner archetypes.
2. Add UI surface contracts for top bar, bottom nav, phone shell, relationship panel, dialogue modal, casino surface, and ranking screen.
3. Move phone app rendering into `src/restored/phone/`.
4. Add local ranking snapshot selectors and a phone ranking app.
5. Add relationship/emotion v2 state beside legacy `love`.
6. Add partner DM catalog and message history contract.
7. Add illustration catalog hooks for dialogue and partner mood.
8. Add online adapter and read-only top-bar status.
9. Add online lobby entry only after connected/dev-mock connected state.
10. Add online chat delivery and leaderboard snapshots.

## Do Not

- Do not put news, stocks, futures, rankings, or chat back into bottom navigation.
- Do not build a fake offline lobby.
- Do not make online ranking client-authoritative.
- Do not make public chat available before channel membership and moderation states exist.
- Do not connect AI partner chat to an external API as a hard dependency.
- Do not let casino results directly mutate partner emotion without an event boundary.
- Do not add broad visual redesign before UI surfaces are named in code.
