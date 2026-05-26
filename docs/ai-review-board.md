# AI Review Board

Conclusion: this is the human-facing control panel for the autonomous loop. Current mode is code-health audit: find root causes of spaghetti growth and bug patterns before adding more features.

## Purpose

The boot packet makes a new AI start correctly. This review board makes the loop observable to the human.

Use this page when the question is not "can the AI continue?" but "can a person quickly judge whether the loop is still pointed at the right target?"

## Current Objective

Keep the repository moving in one verified slice at a time while preserving:

- specification-first work
- narrow edits
- visible verification
- clear stop conditions
- handoff notes for the next AI session

## Last Verified State

Recent loop records show these verified states:

- The map editor construction palette has pinned presets for `가로등`, `광고판`, and `벤치`.
- Construction categories are now split into `고정`, `건물`, `자연물`, `거리 시설`, and `광고/간판`.
- Building shell cards add `빈 상가`, `빈 카지노`, and `골목 상가` as placement-only `building_shell` obstacle data, with a size action that cycles 소형/기본/대형.
- Building shell smoke coverage verifies persisted draft shape: obstacle layer, `building:*` ID, `building_shell` object kind, and no venue/economy fields.
- `npm run check` is currently green.
- Browser verification of `editor.html` showed the `건물` group, placement-only building shell cards, the `크기` action, and zero console errors.
- Runtime code now includes an odd-even table panel and `bet_reserved` reservation path, so older "queued" notes should be reconciled before extending that track.
- World-object taxonomy now distinguishes placement-only `building_shell` objects from `venue_anchor` objects with doors/channels/interiors.
- `docs/baegeum-city-v2-first-play-loop.md` defines the first 10-minute player loop as the product north star.
- `docs/ai-git-baseline-strategy.md` defines how agents should work while `master` has no commits and all project files appear untracked.
- The horse-racing venue has a map-design-only interior draft covered by `tools/smoke-horse-racing-interior.cjs`; race and payout logic remain intentionally unimplemented.
- Venue metadata storage now normalizes editable drafts through `readStoredVenueMetadata`, `writeStoredVenueMetadata`, and `upsertStoredVenueMetadata`, with smoke coverage in `tools/smoke-venue-metadata-storage.cjs`.
- `docs/ai-code-health-inventory-2026-05-26.md` records the first audit inventory of large files, global runtime state, localStorage islands, and silent catches.
- `docs/ai-spaghetti-bug-root-cause.md` now explains why the spaghetti/bug pattern happened and sets the root-cause audit sequence.
- Runtime state facade v0 exists in `src/systems/runtime-state-facade.js`; all source-level `BaegeumCity` access now goes through that facade.
- `src/systems/local-storage-diagnostics.js` now inventories localStorage-backed systems and reports read-only status, with smoke coverage in `tools/smoke-local-storage-diagnostics.cjs`.
- Economy and ledger readers now expose corrupt-storage status without clearing user data.
- Venue metadata readers now expose corrupt-storage status without clearing user data.
- World-editor draft readers now expose corrupt-storage status without clearing user data.

## Current Loop Candidate

Smallest safe audit loop:

1. Read `docs/ai-code-health-audit-plan.md`, `docs/ai-code-health-inventory-2026-05-26.md`, and `docs/ai-spaghetti-bug-root-cause.md`.
2. Continue the persistence bug-hunt pass now that source-level runtime global access is centralized.
3. Expose one money-affecting ledger effect failure path, starting with exchange ATM or odd-even reservation.
4. Add one narrow smoke check proving the failure is observable without changing successful behavior.
5. Run `npm run check`.
6. Record the result in `docs/ai-working-state.md`.

Paused feature loop:

1. If continuing the current horse-racing slice, document the round/ledger contract before betting logic.
2. If returning to construction UX, add a small venue metadata editor UI that calls the normalized storage helpers.
3. Keep building placement separate from venue entry, interiors, economy, and online behavior unless the owning contract is updated first.
4. Add or update a narrow smoke check for the chosen behavior.
5. Run `npm run check`.
6. Record the result in `docs/ai-working-state.md`.

Smallest safe governance loop:

1. Wait for explicit human `baseline 승인` before staging or committing.
2. If approved, run checks and present include/exclude groups before staging.
3. Keep the first play loop, this review board, and `docs/ai-working-state.md` aligned.

## Risk Flags

- The repository has many untracked files, so `git diff` may not show the full baseline.
- Runtime state still uses a global compatibility bridge, but source-level access is centralized through the facade.
- Browser-local state is split across world drafts, venue metadata, economy, ledger, and skin storage.
- Silent catch paths can hide the evidence needed for bug diagnosis.
- External Ouroboros installation or Codex/global setup is approval-only.
- Saved draft schema, economy authority, online authority, and migrations are approval-only.
- Runtime economy docs contain older queued references; reconcile docs and code before adding more odd-even behavior.
- Feature work is paused until the next narrow code-health repair is verified, unless the human explicitly overrides.
- Do not mix runtime economy work into map-editor construction UX.
- Do not add horse-racing race results, payout settlement, ranking changes, or real betting loops before the round/ledger/server-authority boundary is written.

## Human Approval Queue

Ask before:

- installing `Q00/ouroboros`
- running `ouroboros setup --runtime codex`
- changing home-directory, global Codex, WSL, shell, or MCP configuration
- publishing content or opening public PRs/issues
- adding credentials, secrets, billing, or external account setup
- changing saved map schema, economy authority, online authority, or compatibility contracts

## Stop Condition

Every autonomous loop should end in exactly one of these states:

- Completed: change made, verified, and recorded.
- Blocked: no safe next move without more information.
- Approval Needed: next move crosses a boundary above.
- Next Loop Ready: no code change needed, but the next safe slice is named.

## Next Safe Action

Continue the silent-failure bug-hunt pass with one money-affecting ledger effect path. Do not add payout, ranking, or reset behavior while making failures observable.

For governance, do not stage or commit until the human explicitly approves the baseline.
