# Diegetic course-boundary polish QA — 2026-08-04

## Goal

Make the true east and west course limits readable from first-person scenery before collision. Players should be able to route away from the edge based on the world view rather than learning about an invisible boundary only after movement is rejected.

## Implementation

- Added world-projected rope, stakes, and reflective tabs at the exact course collision coordinates: west `x = -112`, east `x = 112`.
- The perimeter samples up to 119 meters ahead and uses the existing perspective and camera transform.
- Distant boundaries remain restrained; the nearest side warms continuously inside 34 meters.
- A grounded `COURSE LIMIT // KEEP LEFT|RIGHT` placard appears only inside the approach band and before contact.
- At exact contact, the placard yields to the existing orange collision card while physical perimeter geometry remains visible.
- Text state reports side, distance, warning amount, warning band, contact, placard ownership, visible segments, exact world coordinates, and collision-boundary parity.

No playable width, collision response, obstacle slide, movement, camera, map, route, Joe behavior, detection, scoring, audio, or generated asset changed.

## Automated verification

- `node --check web/game.js`: passed.
- `node --check output/validate-route-pressure-visual.mjs`: passed.
- `node output/validate-route-pressure.mjs`: 18/18 passed with no browser errors.
- High-resolution-only run at 2560x1600: 94/94 passed.
- Full responsive/state matrix: 376/376 passed.
  - 2560x1600 desktop
  - 1280x720 desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Required uninstrumented client: 469 rendered frames, 2.80ms average canvas render, 3.50ms final render, no browser-error artifact.

## Visual evidence inspected

- `output/route-pressure-visual-validation/01-high-resolution-boundary-approach.png`
- `output/route-pressure-visual-validation/01-high-resolution-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/03-compact-boundary-approach.png`
- `output/route-pressure-visual-validation/03-compact-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/04-reduced-motion-boundary-approach.png`
- `output/route-pressure-visual-validation/04-reduced-motion-boundary-contact-locomotion.png`
- `output/diegetic-course-boundary-official-2026-08-04/shot-0.png`
- `output/diegetic-course-boundary-official-2026-08-04/state-0.json`

## Verified behavior

- Eighteen meters from the east edge, the boundary reports east as nearest, a positive warning amount, visible perimeter segments, a visible placard, and exact `±112` world coordinates.
- The approach frame shows rope, stakes, reflectors, and `KEEP LEFT` in the course view without covering the map, HUD, objective card, or route guidance.
- At the east edge, state reports zero distance, contact, and no placard.
- The contact frame retains physical rope while the grounded orange `EAST COURSE BOUNDARY` card and `MOVE LEFT BACK IN` instruction own the correction lane.
- Fully rejected rightward input still produces zero applied movement, camera target shift, roll, speed lines, peripheral rush, and turf bands.
- Compact and Reduced Camera Motion preserve the same geometry and ownership.

## Follow-up

Human-playtest the west perimeter and the narrowest late-course lanes during pursuit. Keep the perimeter anchored to the collision coordinates; tune only distant/approach opacity if it competes with cover or route markers.
