# Ranking And Job System

Conclusion: rankings should become a phone app with local preview boards first, and jobs should be a separate occupation layer that can feed job-specific leaderboards without merging into wealth rank.

## Feature Identity

- Feature id: `restored:ranking:ranking-job-system`
- Title: Ranking And Job System
- Domain: ranking
- Primary surface: phone
- Related docs:
  - `docs/baegeum-city-v2-restored-recomposition-plan.md`
  - `docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md`
  - `docs/templates/restored-feature-plan-template.md`

## Current Baseline

- Current playable behavior: the restored build has local wealth titles through selectors, but no ranking app and no job/occupation state.
- Current files involved: `src/restored/state/selectors.js`, `src/restored/ui/shell-contract.js`, `baegeum-city-v2-dice.html`.
- Current gates: phone apps open through the owned phone surface/dock, not a permanent bottom-nav item; online boards are unavailable until online snapshots exist.
- Existing blockers: ranking app UI, job catalog, and ranking selectors still need separate contracts before implementation.

## Intended Player Loop

```text
player buys or owns a phone
-> opens phone ranking app
-> chooses wealth, casino, collector, relationship, or job board
-> sees local preview board and own position
-> later chooses a job/career path
-> job activity records income/reputation events
-> job boards update locally, then server snapshots replace them online
```

## UI Surface Plan

- Top bar impact: optional future display of current job title; no leaderboard rank in the top bar.
- Bottom nav impact: none. Keep the location-aware nav; rankings belong inside the phone surface.
- Phone app impact: add a future `rankings` app with board tabs and locked online badges.
- My info impact: show local wealth title separately from current job.
- Modal or panel impact: board details can open as a phone subview, not a full-page modal.
- Mobile constraints: board rows need compact rank, name, score, badge, and local-player highlight.
- Illustration or image slot: optional job icons must use asset manifest ids, not direct file paths.

## State And Catalog Plan

Future state shape:

```js
{
  career: {
    currentJobId: "job:day-labor",
    jobLevelById: { "job:day-labor": 1 },
    jobStatsById: {
      "job:day-labor": {
        incomeEarned: 0,
        reputation: 0,
        streak: 0,
        completedActions: 0
      }
    }
  }
}
```

Catalog candidates:

- `src/restored/data/job-catalog.js`
- `src/restored/data/ranking-board-catalog.js`
- `src/restored/state/ranking-selectors.js`

Required selectors:

- `getRestoredLocalRankSnapshot(state, boardId)`
- `getRestoredJobSummary(state)`
- `getRestoredJobBoardScore(state, jobId, boardId)`
- `canUseRestoredRankingApp(state)`

Events produced later:

- `job_started`
- `job_completed`
- `job_income_earned`
- `job_reputation_changed`
- `ranking_snapshot_viewed`

## Economy And Ownership Impact

- Job income can affect cash only through a documented job action result.
- Job income boards should use cumulative job income, not current cash.
- Wealth boards use existing asset selectors.
- Casino boards must wait for casino result events.
- Collector boards use ownership value or item category scores.
- No real-money, real gambling, or account behavior belongs in this system.

## Relationship And Emotion Impact

- Jobs can become conversation context later: stable work may increase trust, risky work may create tension, and fame jobs may create jealousy.
- Relationship impact should read job events, not mutate from ranking UI.
- Partner DM can reference current job and recent job success after the dialogue catalog exists.
- First ranking implementation should not alter partner emotion.

## Ranking Impact

Local rank impact:

- Keep current wealth title as local identity rank.
- Do not replace `노숙자/서민/...` style wealth title with leaderboard position.

Online leaderboard impact:

- Online rankings must be server-authoritative snapshots.
- Local preview boards can exist offline but must be labeled as local preview.
- Online snapshots should include `seasonId`, `boardId`, `scope`, `generatedAt`, and `entries`.

Board ids:

- `netWorth`
- `cash`
- `casinoProfit`
- `biggestWin`
- `collector`
- `relationshipReputation`
- `jobRank`
- `jobIncome`
- `jobReputation`

Snapshot extension:

```js
{
  seasonId: "season:local-dev",
  boardId: "jobReputation",
  scope: "local | global | friends | room",
  generatedAt: 0,
  entries: [
    {
      playerId: "local-player",
      displayName: "Player",
      score: 0,
      rank: 1,
      subjectType: "player",
      jobId: "job:day-labor",
      badge: "local-preview"
    }
  ]
}
```

## Job / Occupation Impact

Starter job ids to consider:

- `job:day-labor`: low barrier, direct income, low reputation ceiling.
- `job:delivery`: phone-friendly job, streak-focused, city movement hook later.
- `job:shop-clerk`: steady income, trust-friendly.
- `job:casino-staff`: dice-city role, unlock only after casino systems are stable.
- `job:market-trader`: market-facing role, should not be enabled before market catalog split.

Unlock conditions:

- `job:day-labor`: always available.
- `job:delivery`: requires phone.
- `job:shop-clerk`: requires basic reliability or net-worth threshold.
- `job:casino-staff`: requires dice-city/casino context.
- `job:market-trader`: requires smartphone and market app access.

Ranking categories:

- `jobRank`: level or license rank by job.
- `jobIncome`: cumulative earned income from jobs.
- `jobReputation`: reliability, fame, or job-specific trust.

Online season behavior:

- Job boards should reset or snapshot by season.
- Career unlocks can remain local/offline unless an online account system is later approved.
- Global job boards require server-owned score calculation.

## Chat Impact

- Partner DM can later react to job changes and job streaks.
- Public chat should not expose job boards until online identity and moderation exist.
- Message shape does not change for the first local ranking preview.
- Offline fallback: ranking app displays local preview and system text, not public chat.

## Online Authority

- Offline behavior: local preview only.
- Online behavior: server sends snapshots; client renders them.
- Server-owned decisions: global rank, season score, room/friends scope, anti-cheat validation.
- Dev-mock behavior: tests may inject a snapshot, but normal offline play should not show fake global boards.
- Version gates: follow `docs/baegeum-city-v2-online-lobby-contract.md` before online boards appear.

## Asset Intake

- Required images: optional job icons for the ranking app.
- Required audio: none for the first ranking plan.
- Source or license notes: all job icons must go through `assets/inbox/` and the restored asset manifest.
- Manifest ids: use `image:ui:job:<job-id>` or a future agreed id family.
- Fallback behavior: text-only job badges are acceptable.

## Implementation Order

1. Extract rank, asset, market, and partner catalogs from the restored HTML.
2. Add `job-catalog.js` and `ranking-board-catalog.js` as static data only.
3. Add local ranking selectors with no DOM rendering.
4. Add a phone ranking app shell that can render local preview boards.
5. Add job summary state and migration only after the catalog contract is checked.
6. Add job action events and income/reputation calculation.
7. Add online snapshot adapter after online adapter contract exists.

## Verification Plan

- Narrow check: a future `tools/check-restored-ranking-job-plan.cjs` or catalog smoke test should validate board/job ids.
- Full check: `npm run check`.
- Browser check: when UI exists, open phone, verify ranking app gate, board switching, and no bottom-nav growth.
- Manual play notes: confirm wealth title, job title, and leaderboard position are visibly separate.

## Do Not

- Do not implement job rankings directly in `baegeum-city-v2-dice.html`.
- Do not merge job rank with wealth rank.
- Do not show fake global rankings while offline.
- Do not make online ranking client-authoritative.
- Do not add job income without an event or action boundary.
- Do not add direct job icon paths without asset manifest ids.
- Do not put rankings into the bottom navigation.
