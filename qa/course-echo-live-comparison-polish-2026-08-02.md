# Course Echo live-comparison polish — 2026-08-02

## Outcome

Course Echo now communicates a previous run as actionable field intelligence instead of relying on a tiny map caption. Normal field play receives a compact comparison card with route, spatial bearing, distance, live pace, and a centered ahead/behind rail.

## Visual polish

- Added a compact Course Echo comparison card beneath the objective HUD.
- Added a centered pace rail so gains and losses can be read at a glance.
- Added plain spatial direction and distance from the player rather than conflating physical position with the time comparison.
- Added live pace and distance copy to the grounded spectral world marker.
- Connected spectral footfalls with a restrained dashed energy trace so the saved path reads as one authored route.
- Preserved the existing course-map trail and live marker as a persistent secondary reference.

## Signal hierarchy

- Ordinary field play shows the comparison card.
- An imminent noise hazard within eight meters replaces the Echo card.
- Required route-back guidance replaces the Echo card in the same left-side lane.
- Pursuit and every established higher-priority presentation focus replace the Echo card.
- Reduced Camera Motion keeps the same tactical information without adding motion-dependent meaning.

## Accessibility contract

`render_game_to_text` now includes a concise `courseEcho.comparison` state with route, rounded world position, distance, direction, pace delta, ahead/even/behind state, completion state, on-screen state, world-marker label visibility, field-card visibility, and an explicit deferral reason.

## Exact replay

`output/validate-course-echo-hierarchy.mjs` passed all nine assertions:

1. The normal field comparison is visible.
2. Spatial direction and distance are correct.
3. The grounded world-marker label is represented accurately.
4. The pace comparison is correct.
5. An imminent hazard overrides the Echo card.
6. Rear navigation overrides the Echo card.
7. Pursuit overrides the Echo card.
8. Reduced Camera Motion retains parity.
9. Browser and page logs remain error-free.

Visual evidence:

- `output/course-echo-hierarchy/01-standard-field.png`
- `output/course-echo-hierarchy/02-imminent-hazard.png`
- `output/course-echo-hierarchy/03-route-back.png`
- `output/course-echo-hierarchy/04-pursuit.png`
- `output/course-echo-hierarchy/05-reduced-field.png`

Machine-readable assertions: `output/course-echo-hierarchy/assertions.json`.

## Required official-client route

The official opening route retained its normal non-Echo presentation and produced no browser-error artifact. Across 231 rendered frames it sampled 1.69 ms average and 1.60 ms final-frame canvas work.

All focused browser contexts were closed. The user-requested local server remains healthy at `http://127.0.0.1:4173/`.
