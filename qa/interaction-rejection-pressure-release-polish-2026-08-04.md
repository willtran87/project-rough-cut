# Interaction rejection pressure-release polish — 2026-08-04

## Goal

Keep blocked-exit feedback useful under panic input without allowing it to obscure the chase after the player abandons the dead end.

## Finding

The locked shed and sealed drain had a clear 2.35-second explanation, but every additional Use press restarted that full duration and replayed the door rattle. The grounded rejection also remained active after the player moved away from its source. During a close pursuit, mashing Use could therefore prolong the warning indefinitely, while a decisive retreat still had to wait for unrelated exit copy to expire.

## Change

- Latched the first rejection attempt for its existing 2.35-second presentation window.
- Additional Use presses on that same target are counted and absorbed without extending the timer or replaying the rattle.
- Added a retreat release at 1.35 times the target's authoritative interaction radius.
- The release uses the game's weighted `worldDistance` metric and a padded boundary, preserving collision and interaction truth while avoiding edge flicker.
- Moving beyond that boundary clears only the matching rejection message; a newer unrelated message is never removed.
- Re-entering restores the correct input-aware action prompt, and a later deliberate attempt rearms a fresh rejection normally.
- Successful field actions continue to clear rejection state atomically.
- The text-state contract reports suppressed attempts, non-extension policy, retreat behavior, padded radius, and live target distance.
- No interaction radius, exit availability, route selection, map behavior, movement, collision, detection, Joe AI, scoring, generated art, or hazard priority changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual and state validation passed 284/284, covering the ready, blocked, repeat-latched, retreated, re-entered, rearmed, and timed-retry states for both exits at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the repeated attempt retains one readable orange explanation, while retreat immediately returns the unobstructed course, persistent map, objectives, and chase presentation.
- The official uninstrumented client preserved the ordinary opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.19ms with a 4.00ms final sample across 107 rendered frames.

## Evidence

- High-resolution latched rejection: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-repeat-latched.png`
- High-resolution retreat release: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-retreated.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/interaction-rejection-pressure-release-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest a natural Joe chase through both exit footprints. Tune only the 1.35-radius retreat padding if the feedback releases too eagerly or too slowly; preserve first-attempt latching, non-repeating audio, and exact prompt restoration.
