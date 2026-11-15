# Level 1 local spotlight exclusion — rejected candidate

Decision: rejected after a repeated opening-view timing regression. All three production files were restored to the saved baseline (text equality checked). The `verified-source` directory contains the tested candidate, not current production. The verification and interleaved profiling tools explicitly route that saved candidate for reproducibility.

## Change

The candidate enabled the existing `includeSpots` option for Level 1's software static batches. It supplied every point and spot source to the conservative bounds test; ground illumination kept its original point-only list. Fixed lantern fields remained independent. A batch used the cheaper shader only when every active finite source was outside its bounds or all its visible pieces. Wind padding, stable material sort identity, original geometry and source output were retained. Native rendering did not use this exclusion path.

This is V21 investigation evidence, with no retained rendering change. It does not complete the visual checklist or establish an acceptable software frame rate.

## Investigation

Diagnostic omissions identified conifer canopies as a substantial software cost. Removing packed lantern calculations did not show a dependable gain. A canopy depth prepass was neutral at opening and slower at the hedge; it was rejected. Removing the needle colour power function did not help. None of these diagnostic changes is in production. Evidence remains in `output/level-one-lantern-early-exit/` and `output/level-one-canopy-depth/`.

## Verification

- `verify-course-local-spots.mjs` checks spot/point reach, the boundary margin, signed nonzero power, visibility, unbounded lights, transformed parents, camera reveal, stable sort identity and exactly-once variant disposal. Existing `verify-local-light-culling.mjs` also passes.
- `verify-course-local-spot-culling.cjs` passes 53 views on each renderer: all 23 hedges, the course route, near/front/rear sign views, five moving-canopy poses, ordinary desktop and portrait, and actual keyboard movement.
- Every software view is byte-identical to the full point/spot shader reference. All 53 full-geometry plus restored-culling comparisons are also byte-identical. No pixel tolerance was needed, though the test retains a two-channel-unit upper bound for the shading oracle.
- Tested viewport sizes: 2560×1600, 1280×720 and 390×844. Hardware high-resolution target is 2492×1402; controlled software target is 800×450. Portrait targets differ with aspect ratio; viewport size does not imply native-resolution software rendering.
- Pause/resume, legal movement and rebuild pass. Warm resources remain stable: native 1018 geometries/114 textures/109 programs; software 783/114/120. No browser errors.
- Installed gameplay client passes on both renderers at 2560×1600. Both runs remain in `first_hole` and move from x6/progress549 to x11/progress546, with positive clearance. Final screenshots inspected: canopy silhouettes and existing dark lighting retained; large dark hedge faces remain an artistic limitation.
- All 28 symmetric path lanterns and existing lights are preserved. The one global spotlight is the opening sign's reading lamp at intensity1.2.

Artifacts and source hashes: `output/level-one-local-spot-culling/`.

## Timing

Sequential A/B/B/A software timing was recorded after functional/client browsers finished. The fixture fixes the target at 800×450, warms 12 frames, then collects three groups of 12 presentation/readback samples per view. Results were noisy, with candidate opening medians105.6/134.8ms versus baseline97.5/87.2ms. Full data: `sequential-timing-summary.json`.

A follow-up alternated both shader sets inside the same loaded scene. Each block rendered24frames, discarded12warmups and synchronized with full-target RGBA readback. The geometry, camera, lights, draws and triangles were shared. Median of three block medians:

| View | Original | Candidate | Change |
|---|---:|---:|---:|
| opening | 84.5ms | 94.1ms | 11.4% slower |
| hedge | 123.4ms | 95.7ms | 22.4% faster |
| approach | 72.5ms | 67.0ms | 7.6% faster |

All three opening candidate blocks were slower than their adjacent originals. The hedge gain does not justify accepting that regression. These are fixture costs including readback, not end-to-end gameplay FPS. Future work should inspect independent point/spot specialization and canopy coverage, while preserving the byte-exact image oracle. Whole-level performance remains open.

Restoration check: all three production files match baseline text exactly. Installed software gameplay client98154 exited0 after restoration; final screenshot inspected, movement/state valid and no error artifacts.
