# Dedicated Night Order Joe Dialogue Polish — 2026-08-05

## Problem

Audit Bell, Field Log, and Release Review had distinct generated art, interaction verbs, sound signatures, and noise durations, but all three invoked the optional Sprint Review's `sprint_review` dialogue context. Their mandatory story role therefore lacked a matching Joe response identity.

## Resolution

Added three 18-line contextual bark pools:

- `night_order_audit_bell`: controls, evidence, audit exceptions, governance findings, and risk-register language.
- `night_order_field_log`: unauthorized status changes, timestamps, ledgers, work-item ownership, and Product sign-off.
- `night_order_release_review`: quorum, production readiness, Definition of Done, deployment decisions, and release governance.

Each `NIGHT_ORDER_ACTIONS` record now owns its bark context. `completeNightOrderAction()` passes that context through both the investigation announcement and the direct bark trigger. All three contexts use the established award queue and global 12-bark repeat window.

## Preserved Behavior

- Joe AI, detection, sightline, capture distance, pathing, alert, and investigation target.
- Station positions, interaction radii, order, noise durations, objective state, and route handoff.
- Generated station art, activation waves, completion seals, and individual sound cues.
- Subtitle-only voice policy and dialogue/world-label hierarchy.

## Verification

- `node --check web/joe-dialogue.js`: passed.
- `node --check web/game.js`: passed.
- `git diff --check`: passed.
- Official web-game client completed the obstacle-aware Audit Bell path and held its close investigation state.
- Live state confirmed:
  - active bark: `You just opened a governance finding.`
  - active context: `night_order_audit_bell`
  - Audit Bell context: `night_order_audit_bell`
  - Field Log context: `night_order_field_log`
  - Release Review context: `night_order_release_review`
  - contextual reactions: `422`
  - total dialogue variants: `3016`
  - capture repeat window: `18`
  - bark repeat window: `12`
  - Joe mode: `investigate`
  - browser error artifact: absent
- Direct screenshot inspection confirmed the dedicated Audit Bell line fits its subtitle card and does not obscure the compact objective HUD, physical Joe, route ribbon, map, or footer controls.
- The run completed 822 rendered frames with a 3.25 ms average and 3.4 ms final canvas render sample.

## Regression Contract

Mandatory field checks must use their own `night_order_*` bark contexts. Optional Sprint Review checkpoints retain `sprint_review`. Future station-specific lines should be added to the relevant dedicated pool and continue to honor the shared freshness and presentation-queue rules.
