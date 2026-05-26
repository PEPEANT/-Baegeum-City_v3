# Restored Lover And Relationship System

Conclusion: plan the lover system as a life-sim layer before implementation. My Info should show the player's social and emotional condition, while the full partner list, DM, dates, confession, and future AI dialogue stay inside the phone relationship app.

## Feature Identity

- Feature id: restored:relationship:lover-relationship-system
- Title: Restored Lover And Relationship System
- Domain: relationship
- Primary surface: phone
- Related docs:
  - docs/baegeum-city-v2-restored-recomposition-plan.md
  - docs/baegeum-city-v2-restored-ui-online-ranking-chat-roadmap.md
  - docs/plans/restored-ui-surface-redesign.md
  - docs/baegeum-city-v2-game-action-effect-master.md
  - docs/baegeum-city-v2-economy-ledger.md

## Current Baseline

- Current playable behavior: the restored build has a phone-gated `relationships` app and My Info only shows a compact relationship summary. Current walk encounter, interest, call, AI talk, gift, intimacy, marriage, and passive drift actions now run through a relationship event runtime that updates v2 stats, preserves legacy `love`, and writes relationship logs.
- Current files or catalogs involved:
  - `baegeum-city-v2-dice.html`
  - `src/restored/data/partner-catalog.js`
  - `src/restored/phone/phone-app-contract.js`
  - `src/restored/player/profile-contract.js`
  - `src/restored/games/gambling-replacement-contract.js`
  - `src/restored/assets/asset-manifest.js`
- Existing blockers:
  - Relationship/emotion v2 has a pure contract helper, event runtime, small My Info summary view, and phone recent-log renderer.
  - Partner list and recent relationship log rendering are now extracted into `src/restored/phone/relationship-app-view.js`, but partner DM, date, and confession surfaces are still pending.
  - Casino, pawnshop, loan, stock, and job events do not yet feed a relationship event log.
  - My Info does not yet have the planned tabbed character-sheet structure.

## Intended Player Loop

```text
player works, trades, dates, gambles, talks, gifts, or breaks a promise
-> the source system emits a neutral event
-> relationship system evaluates the event against partner personality and current player condition
-> partner state, memory, and relationship log are updated
-> My Info shows social/emotional summary
-> phone relationship app offers next talk/date/confession/recovery choice
```

Design target:

```text
The player is not only broke or rich.
The player is socially trusted, unstable, lonely, reliable, risky, loved, or about to lose someone.
```

## UI Surface Plan

- Top bar impact: no new full relationship controls. It may later show a compact mood alert such as `관계 불안` or `멘탈 위험`, but only after selectors exist.
- Bottom nav impact: none. Relationship is never a global bottom tab. Encounters can belong to current places such as home, home-front, Baegeum places, or Dice City reaction scenes.
- My Info impact:
  - My Info becomes a character sheet with summary tabs: `기본정보`, `경제`, `관계`, `연인`, `기록`.
  - These tabs are summary and diagnosis only. They must not render the full partner list or deep DM flow.
  - `기본정보`: name, current location, residence, job, health, mental, reputation, power, save grade.
  - `경제`: display money, income/spending, rent pressure, debt pressure, credit, stock P/L, casino loss, pawn collateral.
  - `관계`: closest NPC, relationship count, broad social status, reputation, recent impression.
  - `연인`: current lover or closest candidate, stage, confession requirements, risk, recommended next action.
  - `기록`: recent relationship log entries only, with a link/CTA to open the phone app for full history.
- Phone app impact:
  - The `relationships` app is the real hub: partner list, partner cards, DM, call, date, gift, confession, conflict, breakup, and future AI dialogue.
  - Folder phone may show simple partner cards and call/message actions.
  - Smartphone later unlocks richer DM, date calendar, illustrated scenes, voice/audio, and online-aware presence.
- Modal or panel impact:
  - Dialogue modal shows branching choices, expected emotional risk, memory hint, and optional portrait.
  - Date modal shows cost, time, mental effect, and partner stat effects before confirmation.
  - Confession modal shows conditions and failure risk.
- Mobile constraints:
  - Partner cards must be short and scannable.
  - Stat labels should fit on small screens; use compact bars or rows.
  - Relationship logs show the latest 4-6 entries, with full history inside phone.
- Illustration or image slot:
  - Reserve `image:partner:<archetype-id>:portrait-neutral`.
  - Later add mood variants: `portrait-happy`, `portrait-worried`, `portrait-angry`, `event-date`, `event-conflict`.
  - Missing art must fall back to emoji/avatar and text.

Rule: bottom nav is location-aware. It must show only actions and places valid for the current context, such as `home_inside`, `home_front`, `baegeum-city`, `dice-city`, or `seosan-city`.

## State And Catalog Plan

- New state fields:

```js
{
  partners: [
    {
      id: "partner:han-seoyun",
      archetypeId: "partner:office-worker",
      displayName: "한서윤",
      stage: "acquaintance",
      affection: 42,
      trust: 31,
      stability: 38,
      economicImpression: "unstable",
      relationshipRisk: 34,
      tension: 8,
      jealousy: 0,
      comfort: 16,
      lastMetAt: 0,
      lastPlaceId: "baegeum:fast-food",
      memoryEventIds: []
    }
  ],
  relationshipLogs: [
    {
      id: "rel-log:0001",
      partnerId: "partner:han-seoyun",
      day: 1,
      placeId: "baegeum:convenience-store",
      type: "conversation",
      summary: "편의점 앞에서 짧게 대화했다.",
      deltas: { affection: 2, trust: 1 }
    }
  ],
  socialProfile: {
    reputationLabel: "불안정",
    publicTrust: 31,
    loneliness: 62
  }
}
```

- Static catalog entries:
  - Partner archetypes need personality reaction weights: job reliability, gambling tolerance, debt tolerance, gift preference, honesty preference, and Dice City suspicion.
  - Relationship stages:
    - `stranger`
    - `acquaintance`
    - `interested`
    - `situationship`
    - `lover`
    - `unstable_lover`
    - `cooldown`
    - `breakup_risk`
    - `broken_up`
    - `reunion_possible`
  - Economic impression labels:
    - `stable`
    - `trying`
    - `unstable`
    - `reckless`
    - `dangerous`
- Migration or save compatibility:
  - Legacy `love` maps to `affection`.
  - Missing `trust`, `stability`, `relationshipRisk`, and `memoryEventIds` receive defaults.
  - Existing phone relationship app must still open when only legacy partner records exist.
- Selectors needed:
  - `getRelationshipSummary(state)`
  - `getClosestPartner(state)`
  - `getCurrentLover(state)`
  - `getRelationshipStage(partner)`
  - `getConfessionReadiness(partner, playerState, recentEvents)`
  - `getRelationshipRiskLabel(partner)`
  - `getSocialProfileSummary(state)`
  - `getRecentRelationshipLogs(state, limit)`
- Events produced:
  - `relationship_met`
  - `relationship_talked`
  - `relationship_date_completed`
  - `relationship_gift_given`
  - `relationship_confession_attempted`
  - `relationship_confession_accepted`
  - `relationship_confession_rejected`
  - `relationship_conflict_started`
  - `relationship_recovered`
  - `relationship_breakup`
  - `relationship_memory_added`

## Economy And Ownership Impact

- Cash/chips/items affected:
  - Dates cost normal life money.
  - Gifts consume owned inventory items.
  - Casino losses, debt, and pawnshop actions can affect partner trust or risk only through events.
  - Relationship UI should display player-facing money as `DP` only through a future display selector. Do not directly rename ledger fields in relationship code.
- Ledger or event boundary:
  - Relationship actions that spend money create an economy/action event first.
  - Relationship state consumes the resulting event after the money/item change is accepted.
  - Casino modules may emit `relationship_emotion_hook`, but they must not mutate partner state directly.
- Inventory or asset ownership rules:
  - Gift eligibility reads carried inventory and luxury items.
  - Real estate and houses do not become gift items.
  - Pawned or forfeited gifts can create severe relationship memory events.
- Risks:
  - If date/gift buttons mutate cash and affection together, the system becomes another spaghetti path.
  - If casino loss directly changes trust in casino code, future online authority will be unsafe.
  - If all relationships reward only expensive gifts, the system becomes a shop loop rather than a life-sim loop.

## Relationship And Emotion Impact

- Partner state affected:
  - `affection`: liking and romantic pull.
  - `trust`: belief that the player is honest/reliable.
  - `stability`: whether life with the player feels sustainable.
  - `economicImpression`: partner's read on the player's money behavior.
  - `relationshipRisk`: chance of conflict or breakup pressure.
  - `tension`: short-term emotional pressure.
  - `jealousy`: future field for other partner/NPC events.
  - `comfort`: recovery and emotional safety.
- Memory events:
  - job completed steadily
  - date completed
  - gift given
  - promise kept/broken
  - stock loss revealed
  - casino loss discovered
  - loan/debt discovered
  - pawned gift discovered
  - mental crash or recovery
- Dialogue triggers:
  - confession available
  - confession blocked
  - partner asks about money loss
  - partner notices Dice City visit
  - partner encourages work/rest
  - partner challenges gambling
  - breakup warning
  - recovery conversation
- Emotion fields:
  - First implementation should use `affection`, `trust`, `stability`, `relationshipRisk`, and `relationshipLogs`.
  - `tension`, `jealousy`, `comfort`, and rich memory can arrive after the first contract is verified.
- Do not mutate partner emotion directly from casino or money handlers.

Evaluation inputs:

1. Display money / DP balance.
2. Job or occupation state.
3. Credit and debt pressure.
4. Stock profit/loss.
5. Casino loss and Dice City visit frequency.
6. Promise kept/broken state.
7. Date place and date cost.
8. Gift type and source.
9. Dialogue choice.
10. Mental condition.

Example event logic:

```text
job_completed -> trust +1, stability +2
casino_loss_seen -> trust -6, relationshipRisk +8
stock_loss_confessed -> trust +4, mental -2
promise_broken -> trust -10, tension +12
small_date -> affection +4, comfort +3, cash -cost
gift_pawned -> trust -15, relationshipRisk +20
```

## Ranking Impact

- Local rank impact:
  - No wealth title change.
  - My Info may show a local social status label such as `외로움`, `썸`, `불안한 연인`, or `신뢰 회복 중`.
- Online leaderboard impact:
  - None in first implementation.
  - Future phone ranking can expose `relationshipReputation`, but not raw affection/trust values.
- Job or occupation ranking impact:
  - Stable job activity can feed relationship trust, but it must not alter job ranking scores.
- Board ids:
  - Future only: `relationshipReputation`.
- Snapshot shape changes:
  - Future online board snapshot may include a derived social reputation score, not private partner state.
- Server authority needed:
  - Future online public boards must be server-authoritative.
  - Private offline partner states can remain local until multiplayer/social features require server ownership.

## Job / Occupation Impact

- Job ids:
  - Existing/future starter jobs such as fast food, convenience store, labor office, delivery, and factory work can affect partner trust/stability.
- Unlock conditions:
  - Certain partners may require a minimum job reliability or mental state before confession succeeds.
- Income or skill effects:
  - Repeated work can improve `stability` and `trust`.
  - Exhausting work can reduce `mental` and trigger concern dialogue.
- UI display:
  - My Info `기본정보` shows current job.
  - Phone relationship app partner card can show "최근 인상: 성실해 보임" or "불안정해 보임".
- Ranking category:
  - Do not mix relationship effects into `jobRank`.
- Online season behavior:
  - None until job seasons and online relationship boards exist.

## Chat Impact

- Partner DM impact:
  - Partner DM becomes the first rich relationship surface after partner cards.
  - DM lines should read relationship state and recent memory events.
  - AI-generated dialogue is optional later; catalog fallback is required.
- Public channel impact:
  - None for first implementation.
  - Public chat should not expose private relationship logs.
- Message shape changes:

```js
{
  id: "message-id",
  channelId: "partner_dm:han-seoyun",
  senderType: "player | partner | system",
  text: "message",
  relationshipEventId: "rel-log:0001",
  createdAt: 0
}
```

- Moderation or rate-limit needs:
  - Offline partner DM does not need public moderation.
  - Future online partner/social chat needs moderation state before public exposure.
- Offline fallback:
  - Catalog-driven partner lines by stage and recent event.
  - If no line is matched, show a neutral relationship status sentence.

## Online Authority

- Offline behavior:
  - Full relationship loop may run locally.
  - Relationship logs and partner state save locally.
- Online behavior:
  - Do not expose online lover ranking or shared partner state in this slice.
  - Future online rooms can show presence only after online adapter is connected.
- Server-owned decisions:
  - Public relationship leaderboard snapshots.
  - Cross-player social events.
  - Public chat delivery/history.
- Dev-mock behavior:
  - Dev-mock can provide connected status only for UI gating tests, not real social authority.
- Version gates:
  - Relationship state must include a schema version before server migration is considered.

## Asset Intake

- Required images:
  - Partner portraits by archetype.
  - Date/event illustrations later.
  - Phone relationship app icons are already simple enough to remain icon/text until art exists.
- Required audio:
  - Optional partner notification sound.
  - Optional date/event ambience later.
- Source or license notes:
  - Use `assets/inbox/` and intake docs before runtime use.
  - Do not add direct image/audio paths to the restored HTML.
- Manifest ids:
  - `image:partner:<archetype-id>:portrait-neutral`
  - `image:partner:<archetype-id>:portrait-happy`
  - `image:partner:<archetype-id>:portrait-worried`
  - `image:relationship:event:<event-id>`
  - `audio:phone:relationship-notify`
- Fallback behavior:
  - emoji avatar
  - partner archetype label
  - no-image card with mood color

## Implementation Order

1. Keep this plan as the feature boundary.
2. Add `src/restored/systems/relationship-contract.js` with pure stage, stat clamp, migration, and event evaluation helpers. Current status: contract helper exists for migration, stage inference, deltas, confession readiness, summaries, and logs.
3. Add `tools/check-restored-relationship-contract.cjs`. Current status: smoke check exists and is wired into `npm run check`.
4. Add selectors for My Info summary and phone relationship app cards. Current status: My Info summary reads the relationship contract through `src/restored/ui/relationship-summary-view.js`; phone partner cards read it through `src/restored/phone/relationship-app-view.js`.
5. Extract the phone relationship app renderer out of `baegeum-city-v2-dice.html`. Current status: partner card list and recent relationship log HTML are extracted; the small DOM mount function remains in the HTML shell.
6. Add My Info summary tabs without putting the full partner list back into My Info. Current status: a compact relationship summary card is live in My Info, while the full list remains in the phone app.
7. Add relationship log rendering. Current status: the phone relationship app renders the latest logs from `relationshipLogs`.
8. Wire one safe source event first. Current status: `src/restored/systems/relationship-event-runtime.js` wires walk encounter, interest, call, AI talk, gift, intimacy, marriage, and passive drift into relationship events/logs.
9. Add a deliberate date or DM surface so relationship progress has a player-facing loop beyond modal buttons.
10. Wire gift flow through a future inventory/economy event envelope instead of the temporary local item decrement.
11. Only after those pass, connect gambling/loan/pawnshop reaction hooks.
12. Add dialogue catalog and partner DM.
13. Add illustration manifest hooks.

## Verification Plan

- Narrow check:
  - `node tools/check-restored-planning-kit.cjs`
  - `node tools/check-restored-relationship-contract.cjs`
  - phone relationship app renderer is currently covered by `node tools/check-restored-phone-app-contract.cjs` and `node tools/check-restored-relationship-contract.cjs`
- Full check: npm run check
- Browser check:
  - Guest login opens My Info.
  - My Info shows relationship summary content but no full partner list DOM.
  - Phone relationship app opens the full partner list and the recent relationship log section.
  - A test partner shows affection/trust/stability/risk.
  - A seeded test log shows summary and deltas.
  - A safe action creates a relationship log.
  - Existing modal buttons no longer directly mutate `p.love`.
  - No console errors.
- Manual play notes:
  - Relationship UI should make the player feel socially situated, not just financially measured.
  - The first successful slice can be small: one partner, one event, one log, one summary.

## Do Not

- Do not add large inline systems to `baegeum-city-v2-dice.html`.
- Do not add fake offline lobby behavior.
- Do not make online ranking client-authoritative.
- Do not add direct asset paths without manifest ids.
- Do not put every phone app or city place into global bottom navigation.
- Do not put the full partner/lover list back into My Info.
- Do not mutate partner state directly from casino, stock, loan, pawnshop, gift, or job handlers.
- Do not make money alone solve romance.
- Do not make AI-generated partner text a hard dependency.
- Do not rename ledger fields or DPA contracts from relationship UI code.
