# Paused Help context polish — 2026-08-05

## Outcome

How to Survive now preserves the immediate run plan when entered from Pause without turning the global help screen into another HUD.

- Paused entry adds one slim header strip combining the authoritative current file and next bound action.
- The strip reuses `currentHoleObjective()` and `objectiveActionHudSummary()`, including station/route/filing state, active input labels, remapped keyboard bindings, and authored accent color.
- Bounded font fitting protects long objective and input combinations.
- Entering How to Survive from the clubhouse omits the strip completely.
- The existing three-step assignment, input-aware control explanations, audio controls, presentation toggles, caption preview, bindings link, and return target remain unchanged.
- Text state reports the paused objective, complete next-action object, and presentation contract only while the paused settings path is active.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for source and documentation.
- Direct inspection of the official paused-help frame confirmed `PAUSED FILE // FIELD CHECKS 0/3 // AUDIT BELL • NEXT // ENTER RING AUDIT BELL` fits cleanly between the subtitle and assignment columns without collision.
- The paused state reported `returnTarget = paused`, the Audit Bell objective/action pair, and `single_context_strip_above_global_help`.
- Direct inspection of the official clubhouse settings frame confirmed no paused strip appears; state reported `returnTarget = menu` and `pausedRunContext = null`.
- The existing Help→Pause→Resume scenario returned to `first_hole`, retired the pause snapshot, and left no settings context active.
- None of the three scenarios produced a browser-error artifact. The final resume capture completed 130 rendered frames at 4.25 ms average canvas render and 2.00 ms final canvas render.

## Suggested follow-up

Human-playtest the paused Help strip during Final Filing and with a long remapped Interact label. Preserve path-specific visibility and tune only the 9-pixel fitted-size floor if necessary.
