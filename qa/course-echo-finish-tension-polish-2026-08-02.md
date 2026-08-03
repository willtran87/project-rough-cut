# Course Echo finish-tension polish — 2026-08-02

## Outcome

Close Course Echo races now build through a bounded tension curve instead of showing the same passive comparison from start to finish. The existing card changes state in place, preserving the established layout and avoiding another persistent HUD layer.

## Race phases

- `RACE`: the ordinary route, bearing, distance, and pace comparison.
- `DEAD EVEN`: activates when the distance-normalized split is within 0.35 seconds.
- `FINAL SPRINT`: activates during the record's final eight seconds when the player is within 2.5 seconds of the Echo pace.
- `PHOTO FINISH`: combines the final-sprint window with a 0.35-second near tie.
- `RECORD FILED`: provides a 3.2-second target handoff with the saved score and a `REACH AN EXIT` instruction.
- After that handoff, the comparison card and nearby world-marker label retire automatically. The map Echo remains available as a quiet secondary reference.

The final-sprint and photo-finish treatments use an inset emphasis pulse in the standard camera setting. Reduced Camera Motion receives the same state and copy with a static border.

## Hierarchy and accessibility

Existing priority remains authoritative: imminent noise, rear-route guidance, pursuit, and other focused presentations continue to replace the Echo card. `render_game_to_text` now exposes the race phase, near-tie and final-sprint flags, saved score, record countdown, finish age, handoff time remaining, and the existing visibility/deferral contract.

## Exact replay

`output/validate-course-echo-hierarchy.mjs` passed all fifteen assertions:

1. Normal field comparison visibility.
2. Spatial bearing and distance.
3. Grounded world-marker visibility.
4. Pace comparison.
5. Imminent-hazard priority.
6. Rear-navigation priority.
7. Pursuit priority.
8. Standard Reduced Motion parity.
9. Reduced Motion Photo Finish parity.
10. Dead Even detection.
11. Final Sprint detection and countdown.
12. Photo Finish detection.
13. Record Filed transient handoff.
14. Automatic comparison and marker-label retirement.
15. Error-free browser and page logs.

Visual evidence:

- `output/course-echo-hierarchy/06-near-tie.png`
- `output/course-echo-hierarchy/07-final-sprint.png`
- `output/course-echo-hierarchy/08-photo-finish.png`
- `output/course-echo-hierarchy/09-record-filed.png`
- `output/course-echo-hierarchy/10-record-settled.png`
- `output/course-echo-hierarchy/05b-reduced-photo-finish.png`

Machine-readable assertions: `output/course-echo-hierarchy/assertions.json`.

## Required official-client route

The official opening route retained its normal non-Echo presentation and produced no browser-error artifact. Across 232 rendered frames it sampled 1.83 ms average and 1.70 ms final-frame canvas work.

All focused browser contexts were closed. The user-requested local server remains healthy at `http://127.0.0.1:4173/`.
