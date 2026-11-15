# Pond software-rendering pass — November 7, 2026

The software renderer now skips static geometry that opaque cover completely hides. In a controlled alternating test, median pond rendering time improved from approximately 99.5 to 83.6 ms (16%). Software rendering still falls short of 60 FPS, and high-percentile frame delays remain.

## Implementation

- Use contracted convex interiors of the original hedge and stone shapes as conservative occluders. No visible models or textures are replaced.
- Hide a static part only when all eight corners of its bounds lie inside one projected cover silhouette, with an edge margin, and its entire depth range lies behind that cover.
- Keep geometry at near/far clipping boundaries and partial overlaps. Recalculate with the current camera before submitting the frame; no GPU queries or delayed visibility results.
- Reuse projected points, hull arrays and edge records to avoid introducing per-frame object churn. Skip batches whose visible index count is zero.
- Retain original geometry buffers and existing index compaction. Hardware rendering and its shadows keep the original visibility path.

Movement, Joe navigation/model, water, effects, source-art sampling, adaptive resolution policy and render preparation are byte-identical to this task's baseline. No new images, lower resolution floor or reduced effect density were introduced.

## Measured result

Same warmed Chromium/SwiftShader process, fixed 640×360 internal resolution at a 1280×720 viewport, alternating disabled/enabled/enabled/disabled. Each block measures 20 completed presentations while advancing the camera. Measurements include visibility work and GPU completion, not just the CPU render call.

| View | Disabled median, two blocks | Enabled median, two blocks |
|---|---:|---:|
| Pond | 99.5 / 99.4 ms | 83.7 / 83.4 ms |
| Opening | 82.7 / 82.6 ms | 66.7 / 66.6 ms |
| Border without occluding cover | 83.4 / 83.7 ms | 83.4 / 83.3 ms |

Pond p95 remained approximately 101 ms in this controlled test. The improvement is principally in typical rendering cost, not elimination of every spike.

| View | Frustum-only triangles | With solid-cover occlusion |
|---|---:|---:|
| Pond | 133,410 | 106,958 |
| Pond rear approach | 144,220 | 88,408 |
| Opening | 132,324 | 78,654 |

All 21 sampled framebuffer comparisons changed **zero channels**, including eight successive pond turns, crouching, cover edges, entrance, border and shed. Evidence and alternating timings: `output/pond-performance-20261107/occlusion/report.json`.

The final independent moving-camera run, with the normal adaptive resolution policy, measured:

| View | Median | p95 | Maximum |
|---|---:|---:|---:|
| Opening | 66.7 ms | 83.4 ms | 83.4 ms |
| Border | 66.7 ms | 83.4 ms | 83.4 ms |
| Pond | 83.4 ms | 100.1 ms | 116.7 ms |

These are 60 actual scene submissions per view. CPU render-call p95 across coalesced calls was 0.6–1.0 ms; the software GPU remains the main limitation. Opening ended at 800×450; border and pond at 640×360. Results vary with host load, so the alternating same-process comparison above is the evidence for the optimization's gain.

The hardware control on RTX 3090/D3D11 retained 16.7 ms median/p95 in all three views, with no frames over 50 ms. Evidence: `output/pond-performance-20261107/final/after-software-moving.json` and `output/pond-performance-20261107/after-hardware-moving.json`.

## Verification and investigation

- `verify-solid-occlusion.cjs --timing --moving`: 21 pixel-exact views and seven geometric boundary checks. A broader turn test initially caught a 12-channel mismatch involving a thin far-clipped post. Binary isolation identified the part; keeping clip-boundary primitives on the existing GPU path resolved it without loosening image assertions.
- `verify-visibility-culling.cjs`: full geometry versus combined frustum/solid-cover selection, eight views.
- `verify-software-loading.cjs --software`: object bounds/forms/anchors and Joe geometry match the task baseline. Fresh first-scene measurements were 8.04 s before and 7.81 s after; worst loading gaps 183.4 and 166.7 ms. These small timing differences are observational, not a new startup improvement claim. Keyboard movement travelled approximately 48 units in about two seconds in both variants; no browser errors.
- `verify-gameplay-intelligence.cjs`: nine groups, including 29 obstacle approaches, interception, evidence-led search, patrol/recovery and Joe LOD/fallback.
- `verify-pixel-effects.cjs --software`: ten groups covering effects, depth occlusion, comfort preferences, pause, simulation invariance and lifecycle.
- `verify-visual-polish.cjs` on hardware and software: 2560×1600, 1280×720, 800×600 and 844×390 touch. Pond wind/ripples, mower/ground evidence, pause and Reduced Motion pass. High-resolution pond/mower and touch screenshots inspected.
- Installed web-game Playwright client: three final normal onboarding/movement sequences, 28 units travelled and 586 scene submissions. Final screenshot/state inspected; no renderer errors or error artifacts.
- Release checks pass 90 action fixtures; runtime images remain 55 / 17.94 MiB, with no unused images or validation warnings. JavaScript syntax and whitespace checks pass.

Pond isolation showed that removing water did not improve rendering, while removing needle/reed geometry sharply reduced cost. Water and its effects therefore remain intact. Larger foliage batches reduced draw calls but produced inconsistent gains in controlled tests; they were rejected. Their diagnostic scripts are under `output/pond-performance-20261107`, outside runtime code.

Remaining work: software GPU throughput and tail latency, especially exposed foliage without solid cover; physical-device performance qualification and the already prepared human playtests. No deployment was performed.
