# Accepted-lateral camera polish QA — 2026-08-04

## Goal

Make lateral movement feedback as truthful as the distance-coupled forward effects. Camera pan, roll, parallax, and edge-rush should follow sideways world translation that collision actually accepts, while movement intent and collision correction remain visible when an obstacle rejects input.

## Implementation

- Movement now records requested and applied X/Y components in addition to total distance.
- Camera motion receives separate requested and accepted lateral inputs.
- Requested lateral input remains available for diagnostics and player-intent presentation.
- Pan, target offset, counter-roll, world parallax, and edge-rush consume accepted lateral input.
- Fully blocked lateral input produces zero target shift and zero target roll.
- Partial obstacle slides scale the camera response by the accepted X/requested X ratio.
- Reduced Camera Motion retains the existing restrained shift ratio and zero roll.
- Independent visual-test placement now clears collision timers, labels, footprint data, transfer traces, and contact timestamps to prevent stale presentation crossing scenario boundaries.

No movement speed, terrain multiplier, collision shape, obstacle slide, camera amplitude, response timing, Joe behavior, detection, scoring, audio, map, route selection, or asset changed.

## Automated verification

- `node --check web/game.js`: passed.
- `node --check output/validate-route-pressure-visual.mjs`: passed.
- `node output/validate-route-pressure.mjs`: 18/18 passed with no browser errors.
- High-resolution-only visual/state run at 2560x1600: 93/93 passed.
- Full responsive/state matrix: 372/372 passed.
  - 2560x1600 desktop
  - 1280x720 desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Required uninstrumented web-game client: 468 rendered frames, 2.61ms average canvas render, 2.20ms final render, no browser-error artifact.

## Visual evidence inspected

- `output/route-pressure-visual-validation/01-high-resolution-footing-lateral-tap-held.png`
- `output/route-pressure-visual-validation/01-high-resolution-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/03-compact-footing-lateral-tap-held.png`
- `output/route-pressure-visual-validation/03-compact-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/04-reduced-motion-footing-lateral-tap-held.png`
- `output/route-pressure-visual-validation/04-reduced-motion-boundary-contact-locomotion.png`
- `output/accepted-lateral-camera-official-2026-08-04/shot-0.png`
- `output/accepted-lateral-camera-official-2026-08-04/state-0.json`

## Verified behavior

- Accepted leftward mud traversal reports requested input `-1`, accepted input `-1`, 100% lateral acceptance, and a positive target viewport shift.
- Standard motion adds the established positive roll for accepted leftward travel; Reduced Camera Motion keeps roll at zero.
- A rightward press at the east boundary reports requested input `1`, accepted input `0`, zero lateral acceptance, zero target shift, and zero target roll.
- The blocked frame retains movement intent, the orange course-boundary footprint, and `MOVE LEFT BACK IN` guidance without false world drift.
- Compact and high-resolution captures keep the HUD, persistent map, course environment, and local correction geometry aligned.
- Scenario placement clears previous collision presentation, so accepted-stride screenshots cannot inherit stale blocker cards.

## Follow-up

Human-playtest long diagonal slides against hedge wings, carts, and bunker walls during pursuit. Preserve per-axis camera acceptance; tune only the existing lateral amplitude if player feedback shows a clear need.
