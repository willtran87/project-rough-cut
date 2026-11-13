# Chase loading and visible-piece lighting — 2026-11-09

Request: reduce software-rendering spikes and added startup time while retaining chase pressure waves, effects, pixel art, controls and Joe's pathing.

## Changes

- Start Joe's existing serialized texture decode and baked pine downloads during course construction. Retain the original model, images, texture filters and decode pacing.
- Yield between course-geometry merge slices and the two vehicle builds using the existing cooperative scheduler. Shader compilation progresses during bounded texture uploads instead of waiting for the entire texture queue.
- Group small texture uploads into at most four maps / 2 MiB including mip estimates. A larger authored atlas remains isolated. One completed GPU fence per batch, timed polling and a four-millisecond scheduling gap; hidden-tab/cancellation checks. This reduces 34 texture fences to 23. The largest single atlas remains about 8.39 MB, unchanged; it is not a 2 MiB texture cap.
- Reuse existing visible-piece bounds to prove that disjoint fences/props do not touch either finite headlight. Whole-batch bounds remain the first test. Stationary lights still react to changed piece visibility; unlimited/nearby lights keep full shading. No added draws, shader variants, geometry or texture allocations. Level 1 callers retain the prior whole-batch behavior.
- Rejected split foliage draw pools and terrain draw reordering: timing gains were inconsistent; terrain reordering also changed a few raster edges. Neither experiment ships.

## Measurements and limits

All graphics benchmarks ran sequentially. Cold startup uses a new SwiftShader browser per sample, GPU shader disk cache disabled, alternating before/after/after/before. Baseline is the task-start snapshot in `output/chase-frame-budget/baseline-source`.

Final cold startup: before 4000 / 4006 ms; after 3940 / 3834 ms. Average 4.003 -> 3.887 s (~3% faster). Earlier completed comparisons ranged from ~0.13 to ~0.29 s faster; timing varies with host/driver scheduling. Final longest main-thread tasks: before 251 / 239 ms; after 86 / 126 ms. Total long-task duration: before 469 / 509 ms; after 138 / 126 ms. This is a measured reduction in loading stalls, not proof that other graphics applications never stall.

Fixed 960x540 software replay (180 frames, alternating matching states): first median 43.1 -> 42.5 ms, p95 50.3 -> 50.4 ms, maximum 58.5 -> 61.7 ms. Second median 42.0 -> 42.1 ms, p95 47.0 -> 48.1 ms, maximum 50.1 -> 54.9 ms. The final verification replay measured median/p95/max 47.6/55.6/65.8 -> 47.3/54.9/64.1 ms. Static foliage medians were slightly lower; other views were mixed. CPU update maxima dropped in both samples, but end-to-end frame spikes are NOT consistently improved. Do not describe this as a solved software-rendering bottleneck or stable 60 FPS. The lighting change skips unnecessary work in 3–15 additional batches across sampled views without reducing quality, but the remaining raster/driver tail needs further work.

## Preservation and verification

- 17 static comparisons: 13 exact; four have 2–6 differing color channels (max delta 19), consistent with isolated shader-rounding thresholds. All six moving screenshots exact; independent replay states identical every frame.
- No new view-time GPU buffers; 22 software / 17 hardware programs, 34 textures, two lights, nine audio voices. Geometry preparation still 15 batches, maximum 2,060,232 bytes. All 140 pine placements and eight tree draw groups retained.
- `verify-course-preparation.mjs`: complete ordered upload set, small-map limits, isolated large atlases, cancellation, hidden tab and GPU-fence failure cleanup.
- `verify-local-light-culling.mjs`: original shared-module behavior plus disjoint piece bounds, changed visibility under stationary lights, boundaries, multiple/unlimited/off lights.
- `verify-visible-indices.mjs`: lossless index culling and deferred uploads.
- `verify-chase-rhythm.mjs` and software browser pressure/audio/effect checks pass. Six complete winning routes pass with live Joe and solid collisions.
- Hardware browser test passes keyboard steering/brake/reverse, pause, checkpoint save/reload, garage completion, retry/replay, touch and gamepad. No shader/texture growth on rear views or wet effects.
- Light/bounds test checks 10,672 selected tree vertices, finite/off/unlimited headlights, settled timber uploads and Reduced Motion.
- Installed develop-web-game client driven through real keyboard bursts; states and screenshots inspected. High-resolution 2560x1600, ordinary 1280x720 and compact 844x390 captures checked. No browser errors.
- `back-nine.js` and `back-nine-sim.js` are byte-identical to task-start snapshots; pressure, audio, control and navigation modules were not edited. Navigation remains baked signature 47348588 / 4410 nodes / zero runtime edge checks.

Evidence: `output/chase-frame-budget/` (startup JSON, comparisons, loading CPU profiles, boundary checks and client captures). Browser tests write their established reports under their existing output folders. Human feel/playtest work remains deferred as requested.
