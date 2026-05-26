# AI Spaghetti And Bug Root Cause

Conclusion: the main problem is not that one feature is bad. The project grew by successful slices, but shared state, local browser persistence, central hub files, silent fallbacks, and no Git baseline made the slices hard to separate. The runtime facade repair has reduced most global UI coupling; the next root-cause pass should shift from "move globals" to "prove where bugs can hide."

## What Is Actually Happening

The current bug pattern is structural:

- Runtime state now goes through `src/systems/runtime-state-facade.js`; `src/scenes/city-scene.js` still owns the scene state, but no longer publishes by directly touching the global bridge.
- Browser `localStorage` can keep old drafts, economy, ledger, venue metadata, or skins after code changes.
- Several catch blocks hide the original error and return a clean-looking fallback. Money-affecting ledger writes are now observable through `src/systems/local-ledger-effect.js`, and action/effect payload clone failures now expose `payloadCloneStatus`.
- Large hub files collect many responsibilities because every new feature needs one more hook.
- The repository has no tracked baseline, so agents cannot use Git history to tell old state from new mistakes.

This makes the game feel unpredictable even when `npm run check` is green.

## Why It Became This Way

1. Fast prototype success created a central shortcut.
   `window.BaegeumCity` was useful as a quick bridge between scene, HUD, phone, chat, ATM, odd-even, mobile controls, and action history. It became a global registry before it had an owner.

2. Feature slices arrived before state ownership was finished.
   Map editor, venue entry, economy, phone, skins, horse racing, and construction UX each needed state. The contracts were written carefully, but not every runtime path had a single owner yet.

3. Local-first development made stale browser data look like code bugs.
   World drafts, venue metadata, economy, ledger, and skin state can all persist independently. A broken screen may come from old browser data, not the current source.

4. Smoke tests protected contracts, not full player workflows.
   The smoke suite catches many shape regressions, but it does not prove the whole first-play loop in a real browser after old local state, scene transitions, and UI timing interact.

5. Silent fallbacks reduced noise but removed evidence.
   Returning `[]`, `null`, default economy, or `false` is safe for a prototype, but it hides corrupt storage and failed ledger effects when debugging.

6. No baseline commit removed the map.
   With all files untracked, every agent sees a huge workspace instead of a clean diff. That increases fear of staging, makes review harder, and encourages more document handoff rules.

## Current Evidence

Large files above 180 lines:

```text
299  src/tools/baegeum-world-editor.js
299  src/renderers/world-renderer.js
294  src/scenes/city-scene.js
275  src/skins/skin-lab.js
270  src/devices/phone/mammon-phone-shell.js
260  src/systems/local-action-runtime.js
260  src/data/world-object-presets.js
225  src/data/gambling-venues.js
216  src/skins/baegeum-skin-presets.js
207  src/data/city-district-contract.js
202  src/tools/baegeum-world-editor-utils.js
192  src/tools/baegeum-city-editor.js
190  src/systems/economy-ledger.js
187  src/data/world-map-contract.js
185  src/tools/baegeum-world-editor-build.js
184  src/renderers/horse-racing-interior-renderer.js
```

Remaining direct runtime global paths:

```text
none outside src/systems/runtime-state-facade.js
```

Known local persistence islands:

```text
world editor draft
venue metadata
player economy
economy ledger
skin preset/custom skin
legacy Drawing World skin fallback
```

Silent or low-observability fallback areas:

```text
world editor draft parse status is observable, but UI reset flow is not added
venue metadata parse status is observable, but UI reset flow is not added
player economy parse
economy ledger parse
game action clone status is observable
exchange ATM ledger effect status is observable
odd-even ledger effect status is observable
OST play failure
skin image read
```

## Bug Classes To Hunt

1. Runtime state sync bugs
   Symptoms: panel shows old player state, button acts on wrong scene, chat/phone/ATM disagree.

2. Persistence bugs
   Symptoms: refresh changes behavior, editor/game disagree, old money/ledger/skin returns.

3. Economy ledger bugs
   Symptoms: chips reserve but do not settle, ledger records duplicate or missing effects, debug balance differs from HUD.

4. Scene transition bugs
   Symptoms: `city`, `venue_lobby`, and `table_seated` get out of order, input remains bound to old mode.

5. Editor/runtime contract bugs
   Symptoms: `building_shell` accidentally behaves like a `venue_anchor`, saved draft applies unexpected fields.

6. Browser-only workflow bugs
   Symptoms: Node smoke passes, but real browser sequence fails because of focus, animation frame timing, or old localStorage.

## Root-Cause Audit Plan

Phase 1: freeze feature growth.

- Do not add new gameplay systems until the next bug audit pass is recorded.
- Do not stage, commit, delete, move, or mass-format without explicit baseline approval.
- Treat every green `npm run check` as mechanical only, not semantic proof.

Phase 2: finish runtime ownership.

- Source-level `BaegeumCity` access now belongs to `src/systems/runtime-state-facade.js`.
- Keep scene ownership in `src/scenes/city-scene.js`, but publish through `patchRuntimeState()`.
- Do not add new direct global reads/writes outside the facade.

Phase 3: expose stale persistence.

- `src/systems/local-storage-diagnostics.js` now inventories known localStorage keys.
- It can report `ok`, `missing`, `corrupt`, `migrated`, or `unavailable` without clearing user data.
- Economy and ledger readers now expose read-status helpers so corrupt storage can be surfaced where money bugs are debugged.
- Venue metadata readers now expose the same status pattern without clearing user data.
- World-editor draft readers now expose the same status pattern without clearing user data.
- Money-affecting ledger effect failures now return `missing_effect`, `missing_economy_record`, or `record_failed`.
- Game action/effect payload clone failures now keep the safe `{}` fallback but expose `clone_failed` and a reason.
- `src/systems/local-storage-workflow.js` now classifies the inventory as `clean`, `stale`, `corrupt`, or `unavailable` and marks blocking stale state before browser workflow assertions.

Phase 4: expose silent failures.

- Convert risky `catch { return fallback; }` paths into observable results.
- Do not spam UI. Prefer returned status objects or debug events.
- Start with ledger/economy effects, then map/venue storage.

Phase 5: run semantic browser workflows.

- Define the exact first 10-minute workflow.
- Reset local state before the run.
- Browser-check city load, venue entry, exchange ATM, odd-even reservation, phone/chat visibility, and editor draft application separately.

## New Bug-Hunt Sequence

After the final scene publication repair, use this order:

1. Runtime sync pass
   Check whether `city`, `venue_lobby`, `table_seated`, chat channel, phone context, ATM panel, and mobile action button agree after each transition.

2. Persistence pass
   For each localStorage-backed system, record key, owner, reset path, corrupt-data behavior, and migration expectation. Do not fix all keys at once.

3. Silent failure pass
   Economy parse, ledger parse, exchange ATM ledger effect, odd-even ledger effect, and `game-action-master` payload cloning are now observable. Continue only when a concrete symptom points to another silent fallback.

4. Browser workflow pass
   Run the same workflow twice: once with clean localStorage and once with intentionally stale localStorage. Bugs that appear only in the second run are persistence bugs, not gameplay bugs.
   Use the local-storage workflow summary before each run so stale economy, ledger, odd-even, editor draft, or venue state is recorded instead of guessed.

5. Hub-file pressure pass
   Pick one large hub file only after a failing symptom points there. Split by responsibility, not by line count alone.

## Bug Record Template

Every bug audit item should be recorded in this shape:

```text
Symptom:
Reproduction:
State owner:
Persistence involved:
Silent fallback involved:
Browser-only or smoke-test visible:
Smallest repair:
Verification:
```

## Next Smallest Action

Continue the silent-fallback bug hunt.

Recommended next target:

```text
clean/stale localStorage browser workflow pass
```

Reason: source-level runtime global access is centralized now, corrupt storage is observable for money, ledger, venue metadata, and world-editor drafts, ledger effect failures are observable, malformed action/effect payload clone failures now expose `clone_failed`, and the clean/stale/corrupt workflow summary exists. The next common "bug that looks like code" is stale browser state surviving between runs.

Do not add payouts, rankings, or reset UI yet. First run the same browser workflow with the workflow summary on clean and stale localStorage, then record which symptoms are persistence bugs rather than gameplay bugs.
