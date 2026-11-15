# Chase rendering and impact-frame performance

## Retained changes

- `damage-geometry.js` prepares deformation coefficients with the cart, then updates packed position/normal arrays on health changes. Bounds accumulate during the position write; normal normalization shares the sphere-radius pass. Existing geometry, UVs, topology, seven damage states, collapse assemblies and repair behavior remain intact. No additional GPU buffer or render pass. The CPU-only coefficient cache trades a small fixed amount of memory for less work during impacts.
- `local-light-culling.js` skips per-light/per-piece bounds checks for whole static batches already rejected by the camera frustum. Revealed batches are re-evaluated normally, including when only the camera moves.
- `course-pines.js` swaps and reuses two sets of four selection arrays, removing five selection-array allocations from every update. Tree choices, order, matrices, visibility, point lighting and materials remain unchanged.

Simulation, Joe's pathing, collisions, impact physics/audio, resolution policy, render scheduling and scene construction code are unchanged. Entry cache version: `20261111-impact-performance`.

## Measurements

SwiftShader, sequential tests, fixed 960x540 comparison target. Baseline source snapshots are in `output/chase-impact-performance/baseline-source/`.

Isolated actual-cart damage updates, ABBA blocks with 40 warmup and 200 measured health changes:

| Work | Median pairs | p95 pairs |
| --- | --- | --- |
| Previous damage update | 1.2 / 1.1 ms | 1.4 / 1.3 ms |
| New damage update | 0.3 / 0.3 ms | 0.5 / 0.3 ms |

This is about a 73–75% reduction in the CPU damage-update cost, **not** a 75% improvement in whole-frame rendering.

A 120-frame alternating-order moving comparison includes wet terrain, visible foliage, rear-view changes and a real heavy impact (84→68 health). Median completed-frame time was 46.9→45.0 ms; p95 53.8→53.0 ms; maximum 59.0→60.1 ms. These are modest savings, not a consistent worst-case improvement. Software rasterization and scheduling spikes remain; no 60 FPS or cold-start improvement claim.

## Preservation checks

- `verify-chase-impact-performance.cjs --skip-timing`: all 101 integer health values plus fractional health and repair restore produce exactly matching position/normal arrays and bounding boxes/spheres across all 20 damage meshes. Twenty static RGBA comparisons and six moving RGBA comparisons are pixel-identical. Full simulation states match at every moving step. No new geometry buffer allocation when entering later views.
- `verify-local-light-culling.mjs` and `verify-chase-frame-boundaries.cjs`: moving lights, stationary-light camera changes, point-light boundaries, all four tree forms, vertex containment, timber animation and preparation remain correct.
- Hardware/software heavy-impact browser regressions: real hit, speed loss, bounded shove, backoff, steering escape, pause and Reduced Motion. Software seven-stage damage browser: collapse, grounded settled debris, repair, seven actual hits through ejection and stable-health upload suppression.
- Same 17 hardware / 22 software programs, 34 textures and nine voices. Preparation remains 17 geometry batches with maximum 2,013,288 bytes. No first-use buffer growth or browser errors.
- Installed standard Playwright client runs driving bursts. Visual review at 2560x1600, 1280x720 and 844x390 covers damaged cart, impacts and gameplay. Isolated scene-comparison screenshots use fixture HUD text; actual-play screenshots verify the HUD separately.

## Rejected experiments

Per-fragment finite-light early rejection preserved pixels but was slower in the sampled wet/foliage/mower views. Removed. A 4 ms fence retry to reduce RAF idle time also failed to improve real-time cadence consistently and increased some spikes. Removed. `back-nine.js` and `back-nine-scene.js` are text-identical to the turn baseline. Evidence remains in `rejected-finite-light.json` and `rejected-pacing.json`; neither experiment is shipping.

Remaining work: visible world/foliage software rasterization dominates the heavier views. Preserve these baselines and target that cost with controlled completed-frame measurements, rather than reducing vehicle detail or weakening gameplay. Human playtesting remains deferred as requested.
