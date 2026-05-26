# Codex Operating Rules

Conclusion: treat this repository as a specification-first project; when the user asks for progress, run the loop of observe, decide, execute, verify, record.

## First Read

Before making project changes, read these files in order:

1. `docs/INDEX.md`
2. `docs/ai-agent-boot-packet.md`
3. `docs/baegeum-city-v2-foundation.md`
4. `docs/baegeum-city-v2-work-queue.md`
5. `docs/ai-ouroboros-loop.md`
6. `docs/ai-working-state.md`

If a task touches UI, online state, economy, inventory, interaction, map editing, or operations, also read the narrow document listed in `docs/INDEX.md` for that system.

Before staging, committing, deleting, moving, or mass-formatting files, read `docs/ai-git-baseline-strategy.md`.

When handing this repo to another AI session, give it `docs/ai-agent-boot-packet.md` as the first external instruction.

## Default Loop

When the user says `진행`, `뭐하면돼`, `ㅇㅇ`, `a2 진행해`, or otherwise gives a short approval to continue, interpret it as:

1. Observe the current docs, code shape, git status, and available checks.
2. Decide the smallest useful next step from the current project state.
3. Execute safe changes without asking for extra prompting.
4. Verify with the narrowest relevant command, usually `npm run check`.
5. Review the diff for accidental scope creep.
6. Record what changed and what remains in `docs/ai-working-state.md` when the state meaningfully changes.

## Autonomy Boundaries

Proceed without asking when the change is local, reversible, covered by existing docs, and does not alter external configuration.

Ask before:

- Installing global tools or modifying home-directory agent configuration.
- Deleting or rewriting large parts of the project.
- Changing public data contracts, saved-map formats, or online/economy authority rules.
- Adding deployment, billing, account, or secret-handling behavior.
- Making broad visual redesigns instead of focused UI work.

## Project Constraints

- This is `baegeum-city-v2`, an offline-first city-core prototype that should remain online-ready.
- Prefer existing docs and source structure over new abstractions.
- Keep source files near the limits in `docs/baegeum-city-v2-foundation.md`: 300 lines preferred, split before large central files grow.
- Money, chips, inventory, and action results must flow through the documented ledger/action contracts.
- Map-editor work and in-game runtime work may proceed separately, but shared data contracts must stay explicit.

## Verification

Use `npm run check` as the default full project gate. For UI or browser behavior, also run the local server with `npm start` and verify the relevant page in a browser when feasible.

If verification cannot be run, record why in the final response and, when useful, in `docs/ai-working-state.md`.
