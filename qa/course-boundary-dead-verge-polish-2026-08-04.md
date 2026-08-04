# Course-boundary dead-verge polish QA - 2026-08-04

## Goal

Make the safe side of the diegetic rope boundary immediately readable from the first-person scene. The turf previously looked nearly identical on both sides, forcing the player to infer which side remained playable even after the exact boundary geometry became visible.

## Implementation

- Added a 14-meter perspective-projected verge strictly outside each x = -112 and x = 112 collision boundary.
- The verge fades from a restrained edge stain into darker neglected turf, making the playable fairway side legible without creating a wall.
- Added deterministic broken reeds and small exposed-soil scars within the outside strip.
- Reed clusters use irregular heights, base offsets, and a shared lateral lean so they read as terrain rather than directional arrows.
- The treatment consumes the existing course projection, camera shift, fog, world depth, and obstacle occlusion.
- Reduced Camera Motion receives identical static geometry; the verge contains no ambient animation.
- Text state reports width, outside-only placement, texture treatment, playable-side communication, and explicit non-collision behavior.

The verge does not alter collision, navigation, course width, movement speed, footing, camera behavior, the map, route selection, Joe AI, detection, scoring, audio, or generated assets.

## Automated verification

- JavaScript syntax checks passed for the game and visual harness.
- Focused movement and pursuit validation: 18/18 passed with no browser errors.
- High-resolution-only visual/state validation at 2560x1600: 95/95 passed.
- Full responsive and motion matrix: 380/380 passed.
  - 2560x1600 desktop
  - 1280x720 desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Required uninstrumented browser client: 467 rendered frames, 2.99 ms average canvas render, 3.40 ms final render, and no browser errors.

## Visual evidence inspected

- output/route-pressure-visual-validation/01-high-resolution-boundary-approach.png
- output/route-pressure-visual-validation/01-high-resolution-boundary-west-approach.png
- output/route-pressure-visual-validation/03-compact-boundary-west-approach.png
- output/route-pressure-visual-validation/04-reduced-motion-boundary-west-approach.png
- output/course-boundary-verge-official-2026-08-04/shot-0.png
- output/course-boundary-verge-official-2026-08-04/state-0.json

## Verified behavior

- On the west approach, turf beyond the rope reads darker and less maintained while the course side retains its established fairway/rough treatment.
- On the east approach, the outside strip follows the mirrored perspective and remains beneath the persistent map where appropriate.
- The rope, stakes, reflectors, and placard remain visually dominant over the verge.
- The irregular reed revision no longer resembles a route arrow or input glyph.
- Large world obstacles correctly occlude the verge because it remains part of the ground layer.
- Compact landscape preserves the distinction without thickening the verge into an apparent blocker.
- Reduced Camera Motion preserves identical boundary truth without introducing motion.

## Follow-up

Human-playtest both edges during a close chase and near the late-course fog banks. Preserve the outside-only placement and non-collision contract; tune only the stain opacity if the verge becomes too subtle or too dominant on a specific display.
