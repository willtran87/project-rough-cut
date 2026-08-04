# Clubhouse rotation-preview polish — 2026-08-03

## Scope

This pass clarifies the first-run Clubhouse hierarchy without changing career rotation, Change Request filing, Portfolio Override authorization, Night Order selection, Overtime authorization, scoring, saved progress, menu input, or gameplay.

## Observed issue

Before Portfolio Override authorization, all three dossiers displayed `REVIEW OPEN` and the complete board carried nearly the same visual weight as an unlocked portfolio. The dossiers were correctly non-selectable, but their presentation implied that any order could be chosen while `BEGIN THE ROUND` actually followed the fixed career rotation.

## Implemented

- The locked board now identifies itself as `PREVIEW ONLY // AUTHORIZATION PENDING`.
- The next mandatory career order receives a restrained `NEXT IN ROTATION` treatment; later dossiers say `ROTATION PREVIEW`.
- The board footer states that all three Change Requests authorize order choice and that runs follow rotation until then.
- Once unlocked, the existing selectable orange dossier, `REVIEW OPEN` states, navigation footer, and Left/Right selection behavior return unchanged.
- `render_game_to_text` reports `portfolio.presentationMode` as either `rotation_preview` or `interactive`.

## Validation

- Focused Playwright validation passed 20/20 assertions across 2560x1600, 1280x720, 844x390, 1280x720 with Reduced Camera Motion, and an authorized-career state.
- Locked careers remained on `standard_review` after a Right-arrow attempt and returned the established three-Change-Request authorization message.
- The authorized career moved from `standard_review` to `eastern_exception` with Right Arrow, confirming the interactive portfolio was preserved.
- All five scenarios reached the resting Clubhouse and produced no browser errors.
- The official web-game client completed without an error artifact at 2.07ms average / 0.60ms last canvas work across 77 rendered frames.

## Evidence

- `output/clubhouse-rotation-preview-final-2026-08-03/shot-0.png`
- `output/clubhouse-rotation-preview-validation/01-high-resolution-locked.png`
- `output/clubhouse-rotation-preview-validation/02-standard-locked.png`
- `output/clubhouse-rotation-preview-validation/03-compact-locked.png`
- `output/clubhouse-rotation-preview-validation/04-standard-locked-reduced-motion.png`
- `output/clubhouse-rotation-preview-validation/05-standard-unlocked.png`
