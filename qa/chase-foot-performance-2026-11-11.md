# Back Nine software lighting follow-up

## Change

Software-rendered chase materials now use multiplication for inverse-square light falloff instead of a general exponent. Both existing point lights have fixed decay 2; their animated intensity, range, position and color remain unchanged. This applies to the player lamp, mower headlights and red beacon contribution without changing textures, geometry, tone mapping, fog or resolution.

`web/quadratic-light-material.js` chains existing pixel-art material hooks and uses a distinct program cache key. `web/back-nine-scene.js` installs it before the existing compile/upload preparation gate, including prepared distant-light variants. Hardware rendering uses its existing shaders. The helper leaves unsupported decay configurations unchanged at installation. The chase must keep its two lights' decay invariant; a future feature that animates decay must remove/revise this specialization.

Gameplay, input, camera, audio, route geometry, navigation bake and simulation files are unchanged. Experimental ground reordering, per-fragment range branches and CPU squared-distance checks were discarded because they changed pixels or did not reliably improve timings. Only the measured shader specialization remains in runtime code.

## Paired performance

`tools/verify-chase-foot-performance.cjs` compares the saved pre-change scene with the candidate at fixed 960×540 world resolution and a 1280×720 browser viewport. Frames wait for GPU fences, not just JavaScript submission. Static views use baseline/candidate/candidate/baseline order; moving runs alternate order each frame. Clouds are frozen equally for image comparisons. Normal game effects remain enabled in the moving runs.

Latest moving samples, 120 frames per version per scenario:

| Scenario | Baseline median | Current median | Baseline p95 | Current p95 | Baseline max | Current max |
|---|---:|---:|---:|---:|---:|---:|
| Driving near wet lanes, mower and an impact | 33.0 ms | 32.1 ms | 39.0 ms | 38.0 ms | 44.7 ms | 40.4 ms |
| On foot with camera movement and rear glances | 31.9 ms | 29.9 ms | 38.9 ms | 36.0 ms | 39.7 ms | 36.9 ms |

This is approximately 3% lower driving median and 6% lower on-foot median; on-foot p95 fell about 7%. These are short controlled samples, not worst-case guarantees.

Six static scenes cover the new yard/range/finale routes, wet lane with mower, near runner and runner with foliage. Paired static median averages (baseline → current): yard 27.0→25.85 ms; range 27.0→26.85; finale 26.95→26.15; wet/mower 37.35→36.55; near runner 27.5→27.45; runner/foliage 32.45→31.0. Some individual maxima still regress (wet static 42.2→45.3 ms across the sampled blocks). Machine load varied considerably during earlier experiments. No universal 60 FPS, eliminated-stall or cold-start improvement claim is made.

Evidence: `output/chase-foot-performance/comparison.json`. The baseline source is preserved under `output/chase-foot-performance/baseline/` for reproducibility.

## Preservation and checks

- All six static pixel comparisons and all twelve sampled moving comparisons are byte-identical. Simulation states match at every step of both 120-frame runs. The driving fixture includes one real impact.
- `verify-quadratic-light.cjs`: 56 rendered cases spanning disabled lights, unlimited range, finite range boundaries and multiple distances are pixel-identical. Unsupported decay 0/1/3 retains the original shader at installation.
- `verify-back-nine-on-foot.cjs --software`: actual mouse turn, Q rear glance/return, pointer capture/release, controller look, collision-aware camera, pause/comfort settings, reduced motion, beacon and checkpoint retry pass. High-resolution 2560×1600 and compact 844×390 captures reviewed.
- Standard installed web-game client runs the on-foot keyboard fixture at 1280×720; captures reviewed.
- `verify-runner-controls.mjs`, `verify-local-light-culling.mjs` and `verify-back-nine-choices.mjs` pass, including all three cart gaps, both foot gaps, feasible mower interceptions, late real-impact destruction and live-Joe on-foot garage completion.
- No new runtime buffer allocations in tested view changes. Standalone software build retains 22 programs, 36 textures, two point lights and nine audio voices; later tested views do not compile additional programs.
- Release check passes: 90 fixture validations, 66 image references, 25.58 MB, no missing/unreferenced runtime images or warnings. Syntax/whitespace checks pass.

Software rasterization around visible foliage, wet ground and the mower remains the principal limitation. Further work should use moving, GPU-completed paired samples and maintain the current image/route regressions; do not attribute gains from a lower resolution or omitted effects to this optimization. Human pacing/comfort testing remains deferred as previously requested.
