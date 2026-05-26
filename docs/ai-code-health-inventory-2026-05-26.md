# AI Code Health Inventory 2026-05-26

Conclusion: the first audit pass confirmed `window.BaegeumCity` as the highest-value risk, and the runtime facade now owns all source-level `BaegeumCity` access. Stale/corrupt localStorage is now observable for the main persistence islands, and the first money-affecting ledger-effect failure path now returns explicit failure status instead of disappearing as `false`.

## Scope

This inventory covers local project code under `src/` and `tools/`. It does not audit `vendor/` because vendor folders are fixed reference material unless a later task explicitly targets an import.

No gameplay behavior was changed in this pass.

## Large File Pressure

Files at or above 180 lines:

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

Risk: these files are still under the 300-line gate, but several are change magnets. New feature logic should not be added directly to them unless it is just delegation to a smaller module.

## Shared Runtime State

Direct runtime `BaegeumCity` references by source file after the latest facade repair:

```text
3  src/systems/runtime-state-facade.js
```

Migrated to `src/systems/runtime-state-facade.js`: `src/scenes/city-scene.js`, `src/ui/world-chat-panel.js`, `src/ui/mobile-action-controls.js`, `src/ui/exchange-atm-panel.js`, `src/ui/odd-even-table-panel.js`, `src/ui/player-status-hud.js`, `src/devices/phone/mammon-phone-shell.js`, `src/devices/phone/dis-preview.js`, `src/systems/interior-interaction-runtime.js`, and `src/systems/local-action-runtime.js`.

Risk: the global still exists as a compatibility bridge, but its source-level access is centralized. The next risk is stale browser persistence making correct code look broken.

## Local Persistence Islands

Known localStorage-backed keys and owners:

```text
baegeum-city-v2-world-editor-draft-v0  src/data/world-editor-draft.js, src/tools/baegeum-world-editor.js
baegeum-city-v2-venue-metadata-v1      src/data/gambling-venues.js, src/tools/baegeum-city-editor.js
baegeum-city:v2:economy                src/systems/player-economy-state.js
baegeum-city:v2:economy-ledger         src/systems/economy-ledger.js
baegeum-city:v2:odd-even-rounds        src/systems/odd-even-round-state.js
baegeum-city:v2:skin                   src/skins/drawing-world-adapter.js
baegeum-city:v2:skin-preset            src/skins/drawing-world-adapter.js
simulac-draw-world:skin:v1             legacy fallback in src/skins/drawing-world-adapter.js
```

Risk: these systems can become stale independently. A browser bug can come from old map draft, old venue metadata, old economy state, old ledger, or old skin state while `npm run check` stays green.

Preflight repair: `src/tools/baegeum-city-editor.js` now writes venue metadata through `writeStoredVenueMetadata`, and `tools/smoke-venue-metadata-storage.cjs` asserts that the editor no longer bypasses normalization.

Current diagnostics: `src/systems/local-storage-diagnostics.js` inventories these keys and reports `ok`, `missing`, `corrupt`, `migrated`, or `unavailable`. `tools/smoke-local-storage-diagnostics.cjs` covers economy state, economy ledger, corrupt JSON, and legacy skin fallback detection.

Current workflow guard: `src/systems/local-storage-workflow.js` turns the raw inventory into `clean`, `stale`, `corrupt`, or `unavailable`. It treats saved economy, ledger, odd-even round state, editor draft, and venue metadata as blocking stale state for clean browser assertions. `tools/smoke-local-storage-workflow.cjs` covers clean, stale, corrupt, unavailable, economy, round, and map-draft cases.

Money-adjacent read diagnostics: `inspectPlayerEconomyStorage()` and `inspectEconomyLedgerStorage()` now expose `ok`, `missing`, `missing_storage`, and `corrupt` status while preserving the existing fallback behavior of `readPlayerEconomy()` and `readEconomyLedger()`.

Venue metadata read diagnostics: `inspectStoredVenueMetadata()` now exposes `ok`, `missing`, `missing_storage`, and `corrupt` status while preserving the existing fallback behavior of `readStoredVenueMetadata()`. Corrupt metadata is not cleared by the status helper.

World-editor draft read diagnostics: `inspectWorldEditorDraftStorage()` now exposes `ok`, `missing`, `missing_storage`, and `corrupt` status while preserving the existing fallback behavior of `readWorldEditorDraft()`. Corrupt drafts are not cleared by the status helper.

## Silent Failure Paths

Current silent `catch { ... }` locations:

```text
src/data/world-editor-draft.js          corrupt draft -> null with observable status
src/data/gambling-venues.js             corrupt venue metadata -> [] with observable status
src/systems/player-economy-state.js     corrupt economy -> default economy
src/systems/economy-ledger.js           corrupt ledger -> []
src/systems/game-action-master.js       unclonable payload -> {} with observable clone_failed status
src/systems/ost-player.js               audio play failure -> user-facing status
src/systems/local-ledger-effect.js       ledger apply failure -> observable status
src/ui/exchange-atm-panel.js            ledger apply failure -> UI failure message with reason
src/ui/odd-even-table-panel.js          ledger apply failure -> UI failure message with reason
src/skins/skin-lab.js                   image read failure -> user-facing status
```

Risk: some are acceptable UI fallbacks, but persistence and ledger failures need better observability. Economy and venue failures should not look like a clean new game state without at least a debug signal.

## Top Three Root-Cause Risks

1. `window.BaegeumCity` has unclear ownership. Panels and systems read/write it directly, so adding one UI can break unrelated runtime behavior.
2. Local persistence has no shared reset/debug inventory. Old browser state can masquerade as fresh code bugs.
3. Silent fallbacks hide the cause of corrupted JSON, failed ledger effects, or unclonable action payloads.

## Repair Status

Facade repair completed so far:

- Added `src/systems/runtime-state-facade.js`.
- Migrated `src/ui/world-chat-panel.js` from direct `window.BaegeumCity` access to `getRuntimeGame()`.
- Migrated `src/ui/mobile-action-controls.js` from direct `window.BaegeumCity` access to `getRuntimeGame()`.
- Migrated `src/ui/exchange-atm-panel.js` from direct `window.BaegeumCity` access to `getRuntimeGame()`, `getRuntimeEconomy()`, and `patchRuntimeState()`.
- Migrated `src/ui/odd-even-table-panel.js` from direct `window.BaegeumCity` access to `getRuntimeGame()` and `getRuntimeEconomy()`.
- Migrated `src/ui/player-status-hud.js` economy API publication to `patchRuntimeState()`.
- Migrated `src/devices/phone/mammon-phone-shell.js` runtime reads to `getRuntimeState()`.
- Migrated `src/devices/phone/dis-preview.js` runtime reads to `getRuntimeState()`.
- Migrated `src/systems/interior-interaction-runtime.js` from direct `window.BaegeumCity` access to `getRuntimeExchangeAtm()`.
- Migrated `src/systems/local-action-runtime.js` action publication to `patchRuntimeState()`.
- Migrated `src/scenes/city-scene.js` runtime publication to `patchRuntimeState()`.
- Added `tools/smoke-runtime-state-facade.cjs`, guarded the migrated UI files, and wired it into `npm run check`.
- Added `src/systems/local-storage-diagnostics.js` and `tools/smoke-local-storage-diagnostics.cjs` as the first persistence bug-hunt tool.
- Added money-adjacent read-status helpers in `src/systems/player-economy-state.js` and `src/systems/economy-ledger.js`, guarded by their smoke checks.
- Added `inspectStoredVenueMetadata()` in `src/data/gambling-venues.js`, guarded by `tools/smoke-venue-metadata-storage.cjs`, so corrupt venue metadata is observable without clearing local data.
- Added `inspectWorldEditorDraftStorage()` in `src/data/world-editor-draft.js`, guarded by `tools/smoke-world-editor-draft-contract.cjs`, so corrupt editor drafts are observable without clearing local data.
- Added `src/systems/local-ledger-effect.js` and `tools/smoke-local-ledger-effect.cjs`. Exchange ATM and odd-even bet reservation now expose `missing_effect`, `missing_economy_record`, or `record_failed` instead of collapsing ledger write failures into a silent boolean.
- Added `src/systems/local-storage-workflow.js` and `tools/smoke-local-storage-workflow.cjs` so browser workflow checks can distinguish clean state, stale persisted project state, corrupt storage, and unavailable storage before blaming gameplay code.

## Next Repair Candidate

Continue the silent-fallback bug-hunt pass.

Completed target: `src/systems/game-action-master.js` `cloneJson()` fallback now preserves the safe `{}` payload fallback while adding `payloadCloneStatus` and `payloadCloneReason` to actions/effects.

Next target: use the clean/stale workflow report during browser runs, then decide whether the next contract slice is food purchase ledger or stat/time tick.

Do not add reset buttons or broad refactors yet. Convert one silent fallback at a time into an observable result.
