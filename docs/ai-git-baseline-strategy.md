# AI Git Baseline Strategy

Conclusion: this repository has many untracked project files, so future agents must treat the current working tree as protected source state until the human explicitly approves staging, committing, deleting, or moving files.

## Purpose

This document prevents future AI sessions from mistaking untracked files for disposable scratch files.

The current repository state can still be valid project state even when `git status --short` shows `??`.

## Observed State

As of 2026-05-26:

- `git rev-parse --is-inside-work-tree` returns `true`.
- The current branch is `master`.
- `git log --oneline -5` reports that `master` has no commits yet.
- `git ls-files` returns no tracked files.
- `git status --short --untracked-files=all` lists the project files, docs, source, vendor snapshots, content packages, and local browser/test artifacts as untracked.

## Default Rule

Without explicit human approval, agents must not:

- run `git clean`, `git reset --hard`, `git checkout --`, or equivalent destructive cleanup
- stage files
- create commits
- delete, rename, or move existing project files
- treat an untracked file as safe to overwrite without reading it first

Agents may still make narrow edits when the user asks them to continue work, but they must record which files they touched.

## Start Of Loop

At the start of an autonomous loop:

1. Read `docs/ai-agent-boot-packet.md`.
2. Read `docs/ai-working-state.md` and `docs/ai-review-board.md`.
3. Run or inspect `git status --short` only to understand risk.
4. Decide the smallest safe slice.
5. Before editing, read each target file that will be touched.

Do not try to "fix" the many untracked files during a feature loop.

## During Edits

For each loop, keep a mental touched-file list and report it at the end.

If a file is untracked, treat it with the same care as tracked source:

- inspect the current content first
- make narrow patches
- avoid formatting churn
- do not assume `git diff` will show the full old/new story

Prefer smoke tests and `npm run check` over broad manual rewrites.

## Verification

Use these checks when relevant:

- `git diff --check` after code or docs edits
- targeted smoke checks for the changed behavior
- `npm run check` as the full project gate
- browser verification only when UI behavior changed or the current loop explicitly requires it

If a touched file is untracked and `git diff` does not show useful content, summarize the exact changed behavior in `docs/ai-working-state.md`.

## Human Approval Options

The human can later choose one of these baseline paths:

1. Baseline commit: stage the current project state and create an initial checkpoint commit.
2. Baseline branch: create a branch first, then make a checkpoint commit there.
3. No baseline yet: keep using this cautious untracked-workflow strategy.

Until the human chooses path 1 or 2, path 3 is the default.

## Stop Condition

Stop and ask before any action that would make the baseline irreversible: staging, committing, deleting, moving, mass formatting, schema migration, or compatibility-breaking saved-data changes.
