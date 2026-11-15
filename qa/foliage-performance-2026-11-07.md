# Visible foliage and index-upload pass — November 7, 2026

Camera movement now sends substantially less index data to the software renderer: 69.6% less around the pond, 82.1% less at the border and 74.3% less near the opening in the measured paths. Static index-buffer storage fell from 9,727,224 to 4,863,612 bytes. This is a verified reduction in memory and upload work; a consistent frame-rate improvement has not been established. Visible foliage remains GPU-bound.

## Retained changes

- Use lossless 16-bit indices where the entire batch has at most 65,535 vertices; retain 32-bit indices for larger batches. The boundary accounts for WebGL2's reserved primitive-restart index 65,535.
- Remember each visible part's packed offset. Reuse unchanged runs, copy shifted/reappearing runs only, and upload the affected span instead of the whole visible prefix.
- Removing only a trailing part changes the draw count without uploading an unchanged buffer.
- Preserve GPU update ranges that have not yet been consumed, including when a batch becomes hidden before upload.

All original vertices, triangles, textures, shaders, lighting, effects, resolution limits, movement and Joe navigation remain. The shader and geometry experiments below are outside runtime code.

## Measurement

`tools/verify-foliage-uploads.cjs` compares the task-start snapshot with the final implementation using separate fresh Chromium/SwiftShader processes, a fixed 640×360 scene target, and 60 completed camera steps per view. It counts actual WebGL element-buffer upload calls and bytes. Camera paths and submitted triangle counts match.

| View | Before upload bytes | After upload bytes | Reduction | Upload calls before / after |
|---|---:|---:|---:|---:|
| Pond | 9,747,480 | 2,966,424 | 69.6% | 1,012 / 958 |
| Border | 3,652,320 | 655,176 | 82.1% | 216 / 204 |
| Opening | 7,103,952 | 1,824,984 | 74.3% | 1,159 / 1,028 |

All 1,006 static batches in this fixture fit the smaller index type. Larger batches remain supported and are covered by boundary tests. Evidence: `output/foliage-performance-20261107/index-upload-comparison.json`.

| View | Median before / after | p95 before / after | Maximum before / after | Render-call CPU p95 before / after |
|---|---:|---:|---:|---:|
| Pond | 83.3 / 83.0 ms | 115.9 / 100.5 ms | 130.7 / 101.0 ms | 14.4 / 12.5 ms |
| Border | 83.0 / 99.4 ms | 100.3 / 101.5 ms | 101.0 / 116.2 ms | 8.7 / 9.4 ms |
| Opening | 67.0 / 66.5 ms | 84.0 / 67.9 ms | 84.4 / 68.1 ms | 12.3 / 10.6 ms |

Timing results are mixed across fresh processes and host conditions. The pond/opening tails improved in this run, but the border worsened. These samples do **not** prove elimination of frame spikes or a universal FPS gain. The deterministic upload and storage reductions are the primary result.

## Verification

- `verify-visible-indices.mjs`: lossless index-width boundary, unchanged views, tail removal, 512 visibility transitions, and GPU uploads deferred across multiple packing changes. Both CPU and simulated GPU prefixes match fresh full compaction.
- `verify-solid-occlusion.cjs`: all 21 pond/turn/crouch/cover/border/exit views remain pixel-exact; seven geometric boundary checks pass. Current report: `output/foliage-performance-20261107/occlusion-report.json`.
- `verify-visibility-culling.cjs`: eight views match full geometry with zero changed channels.
- `verify-tree-preparation.cjs`: worker/fallback geometry and bounds match; worker failure and disposal pass.
- Hardware/software visual checks include 2560×1600, 1280×720, 800×600 and 844×390 touch, wind-responsive pond ripples, pause, Reduced Motion and simulation invariance.
- Gameplay intelligence passes nine groups, including 29 navigation approaches; world effects pass ten groups. Release verification passes 90 fixtures with 55 images / 17.94 MiB unchanged.
- The installed normal-play client completed three iterations: 28 units travelled, 586 scene submissions, no renderer error or error artifacts. Final screenshot and state inspected. Syntax and whitespace checks pass.

## Experiments rejected

Diagnostics are archived in `output/foliage-performance-20261107` to avoid repeating unsuccessful approaches:

- Early single-channel alpha rejection: no reliable gain and small edge differences.
- Drawing solid geometry before foliage: no reliable gain.
- Subpixel needle-curve LOD: no reliable pond gain; introduced visible-pixel differences.
- Needle-only depth prepass: consistently added rendering cost.
- Smaller final display buffer: no meaningful completed-frame gain.
- Mip-aware transparent-margin clipping, both expanded and indexed: no reliable gain.
- Pregraded mip textures: negligible/mixed gain, additional texture preparation.
- Vertex lighting: an initial variant looked faster, but keeping accurate per-pixel local-light falloff made the candidate slower, particularly near lanterns. Neither variant remains active.

Remaining work is software GPU throughput for exposed foliage and consistent tail-latency improvement. Human playtests and physical-device qualification remain prepared for later. No deployment was performed.
