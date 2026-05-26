# Restored Feature Plan Template

Conclusion: write this plan before implementing a restored-build feature, so the feature has clear UI, state, ranking, job, chat, online, asset, and verification boundaries.

## Feature Identity

- Feature id:
- Title:
- Domain:
- Primary surface:
- Related docs:

## Current Baseline

- Current playable behavior:
- Current files or catalogs involved:
- Existing blockers:

## Intended Player Loop

```text
player action
-> system response
-> saved state/event
-> UI feedback
-> next choice
```

## UI Surface Plan

- Top bar impact:
- Bottom nav impact:
- Phone app impact:
- Modal or panel impact:
- Mobile constraints:
- Illustration or image slot:

Rule: bottom nav must stay `myinfo / phone / realestate / casino / shop`.

## State And Catalog Plan

- New state fields:
- Static catalog entries:
- Migration or save compatibility:
- Selectors needed:
- Events produced:

## Economy And Ownership Impact

- Cash/chips/items affected:
- Ledger or event boundary:
- Inventory or asset ownership rules:
- Risks:

## Relationship And Emotion Impact

- Partner state affected:
- Memory events:
- Dialogue triggers:
- Emotion fields:
- Do not mutate partner emotion directly from casino or money handlers.

## Ranking Impact

- Local rank impact:
- Online leaderboard impact:
- Job or occupation ranking impact:
- Board ids:
- Snapshot shape changes:
- Server authority needed:

## Job / Occupation Impact

- Job ids:
- Unlock conditions:
- Income or skill effects:
- UI display:
- Ranking category:
- Online season behavior:

## Chat Impact

- Partner DM impact:
- Public channel impact:
- Message shape changes:
- Moderation or rate-limit needs:
- Offline fallback:

## Online Authority

- Offline behavior:
- Online behavior:
- Server-owned decisions:
- Dev-mock behavior:
- Version gates:

## Asset Intake

- Required images:
- Required audio:
- Source or license notes:
- Manifest ids:
- Fallback behavior:

## Implementation Order

1. Document contract.
2. Add or update static catalog.
3. Add selectors or pure helpers.
4. Add UI surface shell.
5. Add system events.
6. Wire runtime behavior.
7. Verify and record.

## Verification Plan

- Narrow check:
- Full check:
- Browser check:
- Manual play notes:

## Do Not

- Do not add large inline systems to `baegeum-city-v2-dice.html`.
- Do not add fake offline lobby behavior.
- Do not make online ranking client-authoritative.
- Do not add direct asset paths without manifest ids.
- Do not put phone apps back into bottom navigation.
