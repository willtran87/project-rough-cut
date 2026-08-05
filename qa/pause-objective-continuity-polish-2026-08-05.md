# Pause objective-continuity polish — 2026-08-05

## Outcome

The pause dossier now preserves both halves of the player's immediate plan.

- `ACTIVE FILE` continues to show the authoritative primary objective.
- A new `NEXT` line repeats the current input-aware action summary used by the expanded gameplay dossier.
- The line inherits the active station, route, or filing accent and uses bounded font fitting for remapped keyboard labels, controller, and touch copy.
- Joe mode, distance, sightline, menu selection, descriptions, and input help remain separate and readable.
- The four menu rows moved down 14 pixels to create a measured planning band without changing their dimensions, order, hit behavior, or the modal frame.
- Text state includes the complete next-action object inside the frozen pause snapshot.
- World simulation, timers, objective state, controls, Settings return behavior, and resume position are unchanged.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for source and documentation.
- Direct inspection of the official paused frame confirmed `ACTIVE FILE // FIELD CHECKS 0/3 // AUDIT BELL`, `NEXT // ENTER RING AUDIT BELL`, and `JOE PATROL // 188m // SIGHTLINE BLOCKED` form a clean three-line hierarchy above the menu.
- All four menu rows remained inside the protected panel with clear spacing before the selected-action description.
- The deterministic pause/resume scenario confirmed Resume remained selected, Enter returned to `first_hole`, the pause snapshot retired, and accepted forward movement advanced the player six meters afterward.
- No browser-error artifact was produced. The resumed capture completed 127 rendered frames at 6.64 ms average canvas render and 3.40 ms final canvas render.

## Suggested follow-up

Human-playtest pausing during active pursuit and Final Filing. Preserve the three-line objective/action/threat hierarchy; tune only the 14-pixel menu offset or action font minimum if a specific display needs it.
