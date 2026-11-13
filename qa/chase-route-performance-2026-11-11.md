# Back Nine pursuit CPU spikes

## Retained changes

Replaced the route planner's repeated linear scan and array splice with a fixed-capacity, decrease-key priority queue. Equal scores preserve first-insertion order, so tie-breaking, selected paths and the 1,600-node search limit remain the same. Reusable typed arrays avoid queue growth and duplicate entries during replans.

Added conservative 16-metre longitudinal buckets for the static course's obstacle and feature checks. Queries test nearby candidates with the original strict circle/box formulas. Moving vehicles and abandoned-cart exclusions retain their existing checks. The index is built after all course obstacles are authored; any future feature that mutates those obstacles must rebuild it. The navigation fingerprint includes the index implementation. Rebuilt navigation retains all 4,410 nodes and exactly the same directed clearances; signature is now 327678177.

Runtime changes: `web/stable-search-queue.js`, `web/course-obstacle-index.js`, their use in `web/back-nine-course.js`, and the navigation bake. Rendering code, resolution, art, player model, defeat screen, route geometry, audio, damage and pursuit decisions are unchanged.

## Measurements

| Difficult route searches | Before median | After median | Before p95 | After p95 |
|---|---:|---:|---:|---:|
| Node, 320 samples per version | 2.76 ms | 0.83 ms | 3.95 ms | 1.69 ms |
| Browser with SwiftShader, 460 samples per version | 1.8 ms | 0.5 ms | 3.1 ms | 0.7 ms |

Both comparisons alternate execution order. Browser route-search p95 fell approximately 77%; sampled maximum fell 8→1 ms. These are main-thread search costs, not total frame times.

Paired 120-frame moving samples per scenario at fixed 960×540, with GPU completion fences:

| Scenario | Simulation p95 before → after | Total frame median before → after | Total frame p95 before → after |
|---|---:|---:|---:|
| Wet-lane driving with impact | 0.7→0.6 ms | 37.9→37.2 ms | 43.9→44.0 ms |
| On-foot movement and rear glance | 0.5→0.3 ms | 36.1→35.8 ms | 42.1→42.1 ms |

Driving simulation maximum fell 2.9→1.8 ms, but total-frame maximum increased 48.9→52 ms in this short sample. This pass reduces pursuit CPU stalls; it does **not** establish a meaningful rasterization throughput improvement or eliminate software frame spikes. Wet ground, visible foliage and the mower remain expensive to rasterize.

## Preservation

- 72,664 collision comparisons, including exact obstacle boundaries and varied actor radii, match the saved baseline.
- 1,032 route queries, including wreck avoidance and long capped searches, match waypoints and expanded-node counts exactly.
- 8,850 full chase steps across all three checkpoint starts have identical state and finish successfully. All 12 existing driving/branch completion scenarios also pass.
- All five cart gates, three foot gaps, new branches, interception cases and the collision-to-on-foot finale pass existing checks.
- Ten static views (including all four new paths) and twelve moving captures are byte-identical at the same rendering resolution. All 240 paired moving simulation states match.
- Software on-foot browser checks pass mouse movement, rear glance, collision-aware camera, reduced motion, beacon, pause and retry. Same 22 software programs, 36 textures, two lights and nine audio voices; no additional shaders/textures or later-view buffer allocations. Hardware defeat checks retain 17 programs and 36 textures.
- Defeat screen passes fatal collision → animation → art → checkpoint retry, restart/replay, failed art and reduced motion, at 2560×1600, 1280×720, 844×390 and 390×844.
- High-resolution software runner/beacon and route captures inspected. Installed standard gameplay client completes two on-foot input iterations; final screenshot/state inspected with no error artifacts.
- Release validation passes 90 scenarios, 67 runtime images / 26.00 MiB; syntax and whitespace checks pass.

## Discarded experiments and evidence

Squared-distance light attenuation and uniform per-batch light masks did not show dependable gains; both were removed. Small floating-point pixel differences also appeared. The scene, pines, local-light culling and quadratic-light helper are byte-identical to the saved turn baseline.

Evidence and saved baseline: `output/chase-route-performance/`. Search regression: `tools/verify-route-search-performance.mjs`. GPU-completed image/frame comparison and browser search benchmark: `tools/verify-chase-route-performance.cjs`. Rejected results remain under `rejected-squared-distance.json` and `rejected-light-masks.json`.

Human route balance and comfort testing remain deferred. No deployment performed; local server is on port 4187.
