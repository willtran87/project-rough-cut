# Back Nine software rendering, November 9

This pass preserves the new mower parts, pump machinery, working alarm distractions, pixel materials, movement and simulation. It changes only geometry representation, offscreen submission, redundant instance uploads and preparation of real GPU buffers.

## Changes

- Preserve index buffers when merging scenery and vehicles. Mixed non-indexed input receives an identity index; normals, texture seams and triangle order stay exact.
- Bake lossless indexed pines offline: 639,360 to 213,272 decompressed bytes. The baker verifies expanded attribute bits before packing. No runtime deduplication or art simplification.
- Clip 3,601 static pieces by conservative world bounds before packing their visible indices. Reuse existing partial index-upload helpers. No opaque-cover heuristics or changes to physics geometry.
- Cache tree transforms and upload only changed instance slots.
- Prepare actual static/instanced buffers in the playable framebuffer format using 8x8 scissors and one triangle per mesh. Each submission contains at most 16 meshes / 2 MiB, then waits for the GPU and yields. Includes course and parallax meshes. Steady resources remain 16 programs, 34 textures, two local lights and nine audio voices.

## Matched verification

`tools/verify-back-nine-rendering.cjs` compares the saved pre-change scene against the new renderer in one SwiftShader browser, at 960x540. The source snapshot is in `output/back-nine-rendering/baseline-source/` and is required by that comparison tool. Parallax time is frozen only in the test to eliminate unrelated cloud motion. Original pine streams are reconstructed from the indexed bake for the reference renderer.

Fourteen views cover the opening, active alarm, wet lane, side/rear foliage, detailed mower, garage and eight turns. Every view has **zero changed pixel channels**. Instrumented `bufferData` reports **zero geometry allocations** when the optimized renderer first visits those views. Stable views report no tree-instance uploads.

ABBA order (reference, optimized, optimized, reference), 24 completed frames per block; averages of block medians/p95:

| View | Median before → after | p95 before → after |
|---|---:|---:|
| Opening | 41.80 → 41.40 ms | 45.85 → 47.10 ms |
| Wet lane | 48.45 → 46.70 ms | 54.55 → 54.55 ms |
| Visible foliage | 52.25 → 47.60 ms | 60.65 → 52.45 ms |
| Close mower | 35.35 → 35.65 ms | 42.70 → 41.90 ms |

This supports a modest wet-lane improvement and about 9% median / 13.5% p95 improvement in the tested foliage view. It does not establish an opening or close-mower speedup. Triangle submission fell 25.6% in the foliage sample and 24.4% at the alarm without pixel changes.

Separate single-scene profiles recorded first wet-view frame 70.1 → 51.1 ms and startup 4.30 → 3.93 s. These are individual samples, with driver/cache variance, not a cold-start guarantee. The staged software feature test still reached 199 ms. Software rendering remains below 60 FPS in demanding views.

## Regression evidence

- `verify-indexed-geometry.mjs`: identical expanded position/normal/UV bits, mixed inputs, safe 16/32-bit index limits.
- `verify-visible-indices.mjs`: 512 transitions, unchanged/tail-only cases and deferred GPU uploads.
- `verify-back-nine-decoys.mjs`: all three alarms, reacquisition, pause, one use and useful escape benefit.
- `verify-mower-ram.mjs`: five recoveries and escapes, solid collision spacing.
- `verify-night-machinery-browser.cjs --software`: alarms via actual brake input, Reduced Motion, pause, source counts and no errors.
- `verify-back-nine-browser.cjs`: hardware briefing idle GPU, keyboard/brake/reverse, pause, checkpoint save/reload, victory/replay, touch and gamepad; no shader/texture growth across repeated rear/wet views. Completed-frame sample 10.37 ms average / 11.5 ms p95; startup 3.13 s.
- Installed standard client via `verify-presented-client.mjs`; screenshots/state under `output/back-nine-rendering/standard-client/`. Inspected high-resolution 2560x1600, desktop 1280x720 and 844x390 captures.

Future work: profile remaining visible foliage/fragment costs and cold-driver stalls separately; keep matched pixel comparisons and completed-GPU-frame timings. Human tests remain prepared for later, as requested.
