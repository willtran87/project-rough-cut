# Long-Course Stealth and Horror Polish QA

Date: 2026-07-29

## Scope

- Expanded Hole 1 from 100 to 360 world units.
- Added four authored suspense zones.
- Added generated high-resolution pixel-art landmarks.
- Reworked player collision, concealment, line of sight, Joe navigation, alternate-route pacing, environmental feedback, and controller input.

## Automated static checks

- `node --check web/game.js`: passed.
- `git diff --check`: passed.
- Browser console errors: none.
- Browser page errors: none.
- Runtime asset request failures: none.

## Browser playtests

### Shed route

- Passed through the center of the Audit Row hedge tunnel without collision.
- Reached the Water Hazard and collected the bunker-side shed key.
- Used the west perimeter to bypass the final hedge and obstacle cluster.
- Reached the maintenance shed interaction volume.
- Completed with `mode: victory` and `escapeRoute: shed`.

### Drain route

- Reached and activated the sprinkler pressure control.
- Confirmed the automatic distraction sends Joe to the east-side investigation point.
- Used the resulting stealth window to return to the center lane.
- Crossed to the west perimeter and reached the open drainage culvert.
- Completed with `mode: victory` and `escapeRoute: drain`.

### Stealth precision

- Confirmed swept movement does not tunnel through collision volumes during sprinting.
- Confirmed the hedge tunnel has a readable traversable opening.
- Confirmed crouching beside the hedge only reaches full concealment when the hedge blocks Joe's line of sight.
- Confirmed deep rough provides partial concealment without acting as perfect cover.
- Confirmed floodlight proximity produces exposure feedback.
- Confirmed Q Listening Focus slows movement and displays mower direction, nearby cover, landmarks, and exposure.

### Joe navigation

- Confirmed Joe moves across the full 360-unit course.
- Ran a 60-second unattended patrol stability check.
- Joe completed the authored loop with obstacle clearance at or above the 2.2-unit navigation target.
- Route replanning remained bounded and no navigation or runtime errors were reported.

### Controller and responsive layout

- Emulated a standard gamepad and confirmed LT activates Listening Focus.
- Confirmed LB crouch and RT sprint mappings remain separate.
- Confirmed automatic controller prompt switching.
- Checked 390 × 844 portrait: no horizontal or vertical overflow.
- Checked 844 × 390 landscape: canvas scales cleanly and remains fully visible.

## Image asset validation

- Generated with the built-in image generator.
- Transparent runtime master: `web/assets/rough-cut-expanded-course-kit-v1.png`.
- Dimensions: 1672 × 941, RGBA.
- Chroma-key background removed with soft matte and despill.
- All four corners verified fully transparent.
- Visual inspection passed for silhouette clarity, crop integrity, perspective, and in-game scaling.
