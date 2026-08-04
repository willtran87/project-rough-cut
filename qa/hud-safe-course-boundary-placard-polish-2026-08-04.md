# HUD-safe course-boundary placard polish QA - 2026-08-04

## Goal

Keep the mirrored west course-limit placard readable when the expanded left HUD is present, without moving the real boundary, hiding the persistent map, or making the card feel detached from the course.

## Implementation

- Replaced canvas-only placard clamping with one shared safe-area placement contract.
- The left safe edge follows the real compact or expanded HUD width plus a 12-pixel field gutter.
- The right safe edge stops 18 pixels before the persistent course map.
- The 140-pixel card selects a naturally safe projected stake when possible.
- If the projected west stake falls beneath the HUD, the card moves only far enough to clear it and gains a thin outlined amber tether back to that exact stake.
- The east placard remains naturally stake-grounded when it already fits.
- `render_game_to_text` exposes card width, safe edges, anchor and label positions, HUD state, displacement, map clearance, HUD clearance, and presentation mode from the same calculation used to draw the card.

The collision boundary remains exactly `x = -112` and `x = 112`. No playable width, movement, collision response, camera behavior, route selection, map behavior, Joe AI, detection, scoring, audio, or generated art changed.

## Automated verification

- `node --check web/game.js`: passed.
- `node --check output/validate-route-pressure-visual.mjs`: passed.
- Focused movement and pursuit validation: 18/18 passed with no browser errors.
- High-resolution-only visual/state run at 2560x1600: 95/95 passed.
- Full responsive and motion matrix: 380/380 passed.
  - 2560x1600 desktop
  - 1280x720 desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Required uninstrumented browser client: 467 rendered frames, 4.87 ms average canvas render, 4.40 ms final render, and no browser errors.

## Visual evidence inspected

- `output/route-pressure-visual-validation/01-high-resolution-boundary-west-approach.png`
- `output/route-pressure-visual-validation/01-high-resolution-boundary-approach.png`
- `output/route-pressure-visual-validation/03-compact-boundary-west-approach.png`
- `output/route-pressure-visual-validation/04-reduced-motion-boundary-west-approach.png`
- `output/hud-safe-boundary-official-2026-08-04/shot-0.png`
- `output/hud-safe-boundary-official-2026-08-04/state-0.json`

## Verified behavior

- At 18 meters from the west edge, state reports the west side, a visible placard, complete HUD clearance, complete map clearance, and a 140-pixel card.
- The high-resolution west card sits immediately beyond the expanded surroundings panel rather than underneath it.
- Its amber tether returns to the perspective-projected boundary stake, preserving a world-space origin even when the label is displaced.
- The east approach remains naturally grounded and does not receive an unnecessary tether.
- Compact landscape reclaims the space released by its collapsed HUD while preserving the field/map separation.
- Reduced Camera Motion uses identical static geometry and introduces no ambient animation.

## Follow-up

Human-playtest both perimeters during close pursuit and around large foreground cover. Preserve the exact world anchor and shared safe-area contract; tune only card opacity or tether weight if those elements compete with a more urgent local signal.
