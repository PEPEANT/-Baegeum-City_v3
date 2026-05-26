# AI Ouroboros Loop

Conclusion: this repo uses an Ouroboros-style harness locally: specify first, change narrowly, evaluate, then feed the result back into the next decision.

## Purpose

The goal is to reduce repeated chat prompting. The human should mostly watch, approve, and redirect. Codex should keep enough project memory in docs to decide the next safe action without needing the user to restate the whole context.

This is inspired by `Q00/ouroboros`, but it is not a replacement for installing that tool. It is the repository-level operating contract that can later be used with an external Ouroboros runtime.

## Core Loop

```text
Observe -> Decide -> Execute -> Verify -> Record -> Observe
```

Observe:

- Read the required files from `AGENTS.md`.
- Check the active work queue and recent state.
- Inspect only the code needed for the current slice.

Decide:

- Pick the smallest next change that moves the current priority forward.
- Prefer work from `docs/baegeum-city-v2-work-queue.md`.
- Separate immediately actionable work from decisions requiring human approval.

Execute:

- Keep edits scoped to the chosen slice.
- Follow the existing folder and module boundaries.
- Avoid expanding feature scope while fixing infrastructure.

Verify:

- Run the narrow relevant check.
- Use `npm run check` before declaring a broad project change complete.
- For browser-facing changes, verify the page behavior rather than relying only on static checks.

Record:

- Update `docs/ai-working-state.md` when a loop changes priorities, blockers, or the verified project state.
- Update the owning design document when behavior or contracts change.
- Keep records short enough for the next session to read quickly.

## Decision Policy

Codex may proceed autonomously when all are true:

- The next step follows an existing document.
- The work is local to this repository.
- The change is reversible in git.
- The expected verification command is known.
- No external account, deployment, billing, or secret is involved.

Codex should stop and ask when any are true:

- The desired product behavior is genuinely unclear.
- The change breaks a documented contract.
- The change needs external installation or global agent setup.
- The next step is a major rewrite.
- Two existing docs disagree and the conflict affects implementation.

## Current Default Priorities

Use this order unless the user gives a newer direction:

1. Map-editor stability: detailed diff, pre-save validation report, ID-prefix validation.
2. Map-to-runtime contract: object IDs, collision alignment, destructible runtime state separation.
3. Construction UX: categories, pinned presets, building card v0.
4. Ledger-based chip exchange flow.
5. Simple vehicle movement before destructible objects.

## External Ouroboros Trial

Do not install or configure external Ouroboros automatically from this repo rule. Treat it as a separate approved task because setup may modify user-level Codex or shell configuration.

Recommended trial path when approved:

```text
WSL2 or Linux shell -> install Ouroboros -> setup Codex runtime -> run one small interview/seed/run/evaluate cycle -> compare with this repo loop
```
