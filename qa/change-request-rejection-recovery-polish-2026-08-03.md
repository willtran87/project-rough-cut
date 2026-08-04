# Change Request rejection-recovery polish — 2026-08-03

## Scope

This pass clarifies recovery from the menu's rejected Change Request without changing its outcome, menu selection, Portfolio Override, Overtime Audit, pointer hitboxes, progression, saved career data, or gameplay.

## Observed issue

The rejection correctly displayed `CHANGE REJECTED: unauthorized scope in the rough.` and could already be dismissed with Escape or controller B. Its footer still showed the ordinary menu and fullscreen controls, however, so neither dismissal input was visible and touch recovery was left implicit.

## Implemented

- The rejection state now owns the bottom footer while its reason is visible.
- Keyboard copy prioritizes Escape dismissal, menu navigation, and confirmation.
- Gamepad copy prioritizes B dismissal, D-pad navigation, and A confirmation.
- Touch copy directs the player to select another menu item, matching the existing direct-touch behavior.
- Unlocked portfolios retain their Left/Right order-selection guidance.
- `render_game_to_text` exposes the rejection reason, footer ownership, recovery inputs, and presentation rule.

## Validation

- Focused validation passed 33/33 checks across 2560x1600, 1280x720, 844x390, Reduced Camera Motion, controller copy, touch copy, and an authorized Portfolio Override career.
- Escape returned cleanly to the Clubhouse menu at high-resolution, compact, and Reduced Motion targets.
- Arrow navigation plus Enter and direct touch selection both recovered into Settings without leaving stale rejection state.
- Locked careers retained rotation-preview presentation; unlocked careers retained the interactive portfolio and order guidance.
- No scenario produced a browser error. The official client measured 3.99ms average / 1.00ms last canvas work across 78 frames.

## Evidence

- `output/change-request-rejection-footer-polish-2026-08-03/shot-0.png`
- `output/change-request-rejection-footer-validation/01-high-resolution-keyboard.png`
- `output/change-request-rejection-footer-validation/02-standard-keyboard.png`
- `output/change-request-rejection-footer-validation/03-compact-keyboard.png`
- `output/change-request-rejection-footer-validation/04-standard-reduced-motion.png`
- `output/change-request-rejection-footer-validation/05-standard-gamepad-copy.png`
- `output/change-request-rejection-footer-validation/06-compact-touch-copy.png`
- `output/change-request-rejection-footer-validation/07-standard-unlocked.png`
