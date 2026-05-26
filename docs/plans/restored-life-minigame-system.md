# Restored Life Minigame System Plan

Conclusion: convenience store and fast-food work should become task-based life minigames that produce effect envelopes, not direct cash buttons.

## Purpose

The restored city needs ordinary work loops before more casino, market, and relationship pressure is layered on top. These jobs should feel playable, but their rewards must still flow through the same ledger/action boundary as the rest of the economy.

## Current V0 Contract

Contract module: `src/restored/jobs/life-job-contract.js`.

Version: `restored-life-job-001`.

The first two life job minigames are:

- `job:convenience-store`
- `job:fast-food`

Each shift accepts provided performance inputs:

- accuracy
- speed
- service
- stamina
- mistakes
- combo

The contract scores the shift as S/A/B/C/D/F and returns envelopes only:

- `economy_ledger_entry`
- `player_state_patch`
- `relationship_event_hook`
- optional `inventory_item_grant`
- `ui_message`

## Boundaries

- No DOM, browser storage, timers, or random outcome generation in the contract.
- No direct cash mutation in UI handlers.
- No direct partner mutation from job handlers.
- Wages render as DP for restored surfaces, while the current ledger bridge still uses local `cash` deltas.
- UI adapters may animate timing, queue, or service tasks, but they must submit performance to the contract and consume the returned effects.

## V0.1 Scope

Convenience store:

- deterministic four-task deck
- shift score
- DP wage envelope
- energy/mental/time condition effect
- relationship hook for steady work
- energy drink bonus for high-grade work

Fast-food:

- deterministic four-task deck
- higher wage than convenience store
- higher energy cost
- relationship hook for hard work
- food coupon bonus for high-grade work

## Later Expansion

- labor-office day jobs
- delivery rush minigame
- PC room part-time shift
- motel front-desk shift
- factory overtime shift
- interview/job promotion chain
- relationship reactions to stable work history
- ranking board by occupation and weekly wage

## Verification Checklist

- `npm run check` includes the life job contract check.
- A perfect shift grades S.
- A failed shift grades F.
- Fast-food pays more and costs more energy than convenience store.
- A completed shift emits a wage ledger envelope.
- A completed shift emits player condition and relationship hook envelopes.
- High-grade convenience work can grant an energy drink envelope.
