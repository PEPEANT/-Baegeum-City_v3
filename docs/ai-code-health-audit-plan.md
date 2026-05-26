# AI Code Health Audit Plan

Conclusion: pause new feature growth and run a bug-first audit. The main risk is not one broken feature; it is low observability around shared mutable state, local persistence, silent failures, and the current no-baseline Git state.

## Purpose

Find the root causes behind spaghetti-like growth and hard-to-explain bugs before adding more gameplay, venue metadata, or economy behavior.

This audit should answer:

- Where can a small change accidentally affect unrelated runtime behavior?
- Which state owners are unclear?
- Which bugs can hide because checks pass mechanically?
- Which files are becoming change magnets?
- Which persistence paths can create stale browser-state bugs?

## Current Signals

- Git baseline is missing. `git status --short` shows the whole project as untracked, so ordinary diffs cannot explain what changed between agents.
- Large hub files are close to the local size ceiling: `src/tools/baegeum-world-editor.js` at 299 lines, `src/renderers/world-renderer.js` at 297, `src/skins/skin-lab.js` at 275, `src/devices/phone/mammon-phone-shell.js` at 270, and `src/systems/local-action-runtime.js` at 249.
- `window.BaegeumCity` was used as shared mutable runtime state across scene, HUD, ATM, odd-even, mobile controls, phone shell, chat, and interior interaction paths. Source-level access now goes through `src/systems/runtime-state-facade.js`.
- `localStorage` is used by world-editor drafts, city-editor venue metadata, economy state, economy ledger, and skin state.
- Several `catch { ... }` paths hide failure details in UI/runtime flows, including exchange ATM, odd-even, economy, draft, skin, and game-action paths.
- The check suite is green, but most coverage is smoke/contract oriented. A green `npm run check` does not prove the first-play workflow is semantically correct in the browser.

## Root Cause Hypothesis

1. Baseline invisibility: because there is no tracked initial commit, every agent inherits a huge untracked workspace and cannot use Git as a reliable regression map.
2. Shared mutable global state: `window.BaegeumCity` works as a service locator, event bus, and debug surface at the same time. Ownership is unclear, so bugs can look like timing problems.
3. Central-file pressure: large orchestrator files invite small unrelated edits in the same places, which makes feature boundaries blur over time.
4. Contract drift: features are being sliced carefully, but some concepts still moved faster than their contracts. Examples: `building_shell` vs `venue_anchor`, odd-even reservation vs settlement, and local economy vs later server authority.
5. Persistence islands: browser-local draft, economy, ledger, skin, and metadata state can become stale independently and make old state look like new code bugs.
6. Silent failure paths: ignored exceptions reduce noise in prototypes, but they also remove the evidence needed to find root causes.

## Audit Phases

### Phase 0 - Freeze Rule

- Do not add new feature slices until the first code-health audit pass is recorded, unless the human explicitly overrides.
- Do not stage, commit, delete, move, or mass-format files without explicit baseline approval.
- Keep existing behavior stable; this phase is for finding causes, not broad refactoring.

### Phase 1 - Inventory

- List files above 180 and 240 lines.
- List every direct `window.BaegeumCity` read/write and mark the intended owner.
- List every `localStorage` key or storage path and mark reset/migration expectations.
- List every silent `catch` and decide whether it needs visible debug output, a returned error object, or a smoke assertion.

### Phase 2 - Bug-Class Matrix

- Runtime state sync bugs: global state, player state, table state, venue state.
- Persistence bugs: stale localStorage, incompatible drafts, missing reset helpers.
- UI timing bugs: polling loops, `requestAnimationFrame`, hidden panel state.
- Economy bugs: ledger entry duplication, reservation without settlement, debug updates used in gameplay.
- Editor bugs: draft/runtime mismatch, object taxonomy leakage, validation warnings that do not block saves.
- Browser-only bugs: workflows that are not caught by Node smoke tests.

### Phase 3 - Targeted Verification

- Add or strengthen smoke checks only where they lock down a real contract.
- Add reset-state test paths for localStorage-backed systems.
- Add negative tests that prove `building_shell` cannot carry venue/economy fields.
- Add browser checks for the first-play loop only after the exact user workflow is named.
- Treat `npm run check` as mechanical verification, then add semantic notes to the working state.

### Phase 4 - Boundary Repairs

- Create an explicit runtime facade around `window.BaegeumCity` before adding more panel-to-game writes.
- Split `baegeum-world-editor.js` only along existing responsibilities: state ownership, rendering sync, draft save/reset, and debug snapshot.
- Keep `building_shell` and `venue_anchor` separate until a venue metadata editor contract owns the transition.
- Move UI panels toward pure state resolvers plus explicit action functions.
- Convert silent catches into observable results where the user or next agent needs diagnosis.

### Phase 5 - Root-Cause Bug Hunt

- After the last scene publication boundary is repaired, stop adding facade work and start symptom-first bug hunting.
- Use `docs/ai-spaghetti-bug-root-cause.md` as the bug record template.
- Audit persistence first for economy/ledger and map/editor drafts, because stale browser state can masquerade as logic bugs.
- Audit silent failures next for money-affecting paths and JSON parse fallbacks.
- Run semantic browser workflows with clean and stale localStorage.

## First Audit Slice

The next loop should create an inventory report, not a refactor:

1. Capture line-count, global-state, localStorage, and silent-catch inventory.
2. Name the top three root-cause risks with file references.
3. Pick one smallest repair candidate.
4. Run `npm run check`.
5. Record whether the next loop should repair a boundary or continue inventory.

First repair candidate after inventory: define a tiny runtime-state facade for `window.BaegeumCity` so future UI panels stop reading and writing the global object directly.

Current inventory result: `docs/ai-code-health-inventory-2026-05-26.md` records the first pass. The runtime-state facade now owns all source-level `BaegeumCity` access, `src/systems/local-storage-diagnostics.js` is the first read-only persistence inventory, and economy/ledger/venue-metadata/world-editor-draft readers expose corrupt-storage status. The next safe repair is one money-affecting ledger effect failure path that preserves existing fallback behavior while making the failure observable.
