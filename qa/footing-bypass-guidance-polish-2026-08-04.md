# Footing bypass guidance polish - 2026-08-04

## Scope

This pass makes the established footing-hazard decision playable from the first-person course view without requiring the persistent map. It preserves slowdown values, noise floors, Joe's Vertical Pass response, objective navigation, physical obstacle geometry, player movement, input, scoring, and both escape routes.

## Observed issue

The approach plaque truthfully said `CROSS OR ROUTE WIDE`, but it did not identify which side was actually open. That made the player translate map ellipses during an urgent route decision. A collision audit also found that the original Irrigation Mud width left no player-clear lateral path between its advertised edge and the pond banks.

## Implemented

- Added a local bypass evaluator that samples widening left and right lanes around the nearest footing zone.
- Each candidate must clear the real player-padded obstacle path from the player's position through the lane and beyond the hazard. Selection also considers minimum obstacle clearance, course-edge room, Joe separation, and approach distance.
- Reduced Irrigation Mud's horizontal radius from 36 to 30 world units. Its art, map ellipse, edge warning, contact test, and slowdown boundary all consume the same corrected footprint, creating a real 6.69m-clear left bypass instead of changing only the instruction.
- Draws one short amber dashed route with forward chevrons beneath physical entities. It cannot reveal a path through cover and remains distinct from the mint objective ribbon.
- The screen-stable field plaque now reports `FULL-SPEED BYPASS LEFT/RIGHT` before entry. Inside slow terrain it changes to `CLEAR LEFT/RIGHT` with the remaining distance to the recommended edge.
- The active plaque uses a protected vertical slot above the consequence rail, while existing Joe-label displacement remains intact.
- `render_game_to_text` exposes visibility, zone, active state, chosen side, validity, minimum clearance, distance to clear, entry/exit coordinates, wait recommendation, both candidate summaries, decision, and presentation contract.
- Bypass scoring is skipped outside the 34m local decision range and computed once per course render, then shared by the grounded route and plaque.

## Validation

- Focused validation passed 12/12 slowdown, full-speed route, measured travel, Vertical Pass wake, Joe creep, hard-cover recovery, label coexistence, seven traversable centers, seven nearby bypasses, seven collision-clear recommendations, and browser-error checks.
- All seven active zones produced a valid left/right recommendation with at least 5.55m obstacle clearance. Irrigation Mud now recommends its corrected 6.69m-clear left lane.
- Responsive visual validation passed 28/28 checks at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. Every size retained one truthful grounded bypass, the established briefing, Vertical Pass response, and zero browser errors.
- The final uninstrumented official-client replay naturally reached Audit Thatch 24.75m from its left bypass entry. The plaque, amber ground route, Joe label, objective ribbon, map, and noise consequence remained separate and readable.
- After sharing and range-gating the evaluator, the official replay measured 4.02ms average / 2.70ms final canvas work across 456 frames, improving from the pre-optimization 4.92ms / 3.90ms capture. No error artifact was produced.

## Evidence

- `output/route-pressure-validation/01-active-thatch.png`
- `output/route-pressure-validation/03-approach-cue-lanes.png`
- `output/route-pressure-visual-validation/01-high-resolution-approach.png`
- `output/route-pressure-visual-validation/03-compact-approach.png`
- `output/route-pressure-visual-validation/04-reduced-motion-approach.png`
- `output/footing-bypass-official-final-2026-08-04/shot-0.png`

## Suggested playtest tuning

Human-playtest both escape routes without consulting the map. If one recommendation changes too late while strafing, tune only the 34m decision range or the four widening margins. Preserve collision validation, one recommended lane, amber/mint route separation, physical-cover occlusion, and the corrected Irrigation Mud opening.
