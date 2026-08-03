# Contextual pause dossier polish — 2026-08-01

## Scope

This pass refines the existing Hole 1 pause flow only. It adds no objective, map area, item, progression rule, AI behavior, timer, or difficulty change.

## Implemented

- Added a frozen round dossier beneath `ROUND SUSPENDED` with the current objective, zone, completion percentage, Joe mode and rounded distance, and open/blocked sightline state.
- Centralized the player-facing objective string in `currentHoleObjective()` and reused it in both live and paused presentation.
- Repositioned the existing four pause actions and matched their pointer hitboxes to their rendered positions.
- Added `pauseSnapshot` to `render_game_to_text` while paused. It is explicitly marked `frozen: true` and is `null` outside pause.
- Preserved the existing Settings return target, pause selection model, simulation freeze, audio behavior, and resume transition.

## Validation

The official web-game client ran `web/test-actions/pause-dossier-resume.json` against `http://127.0.0.1:4173/`:

1. Started the existing Hole 1 flow.
2. Suspended the round.
3. Opened Settings from Pause.
4. Used the visible `RETURN TO PAUSE` control.
5. Resumed with the repositioned pointer control.

The paused snapshot reported `FIND SHED KEY OR OPEN DRAIN VALVE`, `THE TEE`, 0% completion, Joe in patrol at 188m, and a blocked sightline. The final state returned to `first_hole`, cleared `pauseSnapshot`, retained player progress and Joe state, averaged 3.38ms of canvas render work, and produced no console or page-error artifact.

Visual review covered the paused dossier, the Settings return control, and the resumed first-person frame. All text remained inside the authored panel and the action list retained clear selection contrast.
