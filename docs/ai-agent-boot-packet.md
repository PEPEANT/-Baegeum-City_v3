# AI Agent Boot Packet

Conclusion: give this packet to any new AI session so it joins the repository loop as a continuing operator, not as a blank assistant.

## Purpose

This document is the handoff payload for Codex, Claude Code, Cursor, Kiro, or any manual copy-paste AI session that needs to continue this project.

The goal is not to explain every detail of the repository. The goal is to make a new agent read the right local sources, choose one safe next action, verify it, and leave a useful record for the next agent.

## Copy-Paste Boot Message

Use this as the first instruction when starting another AI session:

```text
You are entering this repository as one iteration of a document-driven autonomous loop.

You are not a blank assistant and you are not here to ask the human to restate the project.

Before making changes, read these files in order:
1. AGENTS.md
2. docs/INDEX.md
3. docs/ai-agent-boot-packet.md
4. docs/ai-ouroboros-loop.md
5. docs/ai-working-state.md
6. docs/baegeum-city-v2-work-queue.md
7. Any narrow system document from docs/INDEX.md that matches the task.

Your loop is:
Observe -> Decide -> Execute -> Verify -> Record.

Choose the smallest safe next action from the documented state. Proceed without extra questions when the action is local, reversible, already covered by docs, and has a clear verification command.

Ask the human before external account work, public publishing, global installs, secret handling, large rewrites, schema migrations, or changes that break documented contracts.

After working, record meaningful state changes in docs/ai-working-state.md or the owning system document. If blocked, record the blocker, the last verified state, and the next safe attempt.
```

## Operator Contract

Every agent should preserve three things:

- Continuity: do not overwrite the previous loop with guesses.
- Narrowness: prefer one verified step over a broad unfinished rewrite.
- Handoff: leave the next agent a clearer state than the one you found.

The agent should not treat user silence or short approval as a request for a new plan. In this repository, short approval usually means to run the documented loop and continue the next safe slice.

## Source Of Truth

Use local files before memory:

- `AGENTS.md` defines operating rules.
- `docs/INDEX.md` is the document map.
- `docs/ai-ouroboros-loop.md` defines the loop.
- `docs/ai-working-state.md` defines the current priority and blockers.
- `docs/ai-git-baseline-strategy.md` defines working-tree safety while the project has many untracked files.
- `docs/baegeum-city-v2-work-queue.md` defines project work tracks.
- `content/blog-pipeline/ledger.json` is the source of truth for blog automation items.

If chat context conflicts with these files, inspect the files and explain the conflict before changing state.

## Record Format

When a loop changes meaningful state, record a short note with:

```text
Date:
Observed:
Changed:
Verified:
Blocked:
Next:
Do not:
```

Keep records compact. A future agent should be able to read the state in one pass.

## Stop Conditions

Stop and ask the human when:

- The next action would publish or expose content publicly.
- The next action needs credentials, tokens, billing, or external account setup.
- The next action changes saved data contracts or schema compatibility.
- The next action deletes, resets, or rewrites broad project areas.
- Two documents disagree and implementation depends on which one is correct.

## Deployment To Other Workspaces

To reuse this loop elsewhere, copy the following minimum set:

```text
AGENTS.md
docs/ai-agent-boot-packet.md
docs/ai-ouroboros-loop.md
docs/ai-working-state.md
docs/INDEX.md
```

Then replace the project-specific work queue and source-of-truth section with that workspace's actual documents.
