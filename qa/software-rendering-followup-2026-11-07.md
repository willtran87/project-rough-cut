# Software rendering and cold entry follow-up — November 7

This pass removes a measured texture readback stall and redundant preparation draws while retaining the original pixel textures, 3D geometry, parallax, movement rules and Joe navigation. It does not certify acceptable gameplay speed under software WebGL.

## Startup

Texture-building canvases now request CPU-backed Canvas2D storage. Atlas crops, procedural surfaces, signs and light textures are subsequently read by WebGL or other canvases; GPU-backed rasterization was forcing expensive readback. The software HUD uses the same storage preference. Texture dimensions, nearest sampling and source assets are unchanged.

A browser trace before this change recorded `RasterImplementation::ReadbackImagePixels` taking 2,947.8 ms. The trace after it no longer contained the multi-second readback, and its largest loading frame was 250 ms. This isolated diagnostic used an intermediate build; the final fresh-browser comparison below is the accepted overall startup result.

Preparation still compiles material/shadow variants, uploads textures in bounded batches, waits for Joe or its fallback, draws the actual scene, and waits asynchronously for GPU completion before simulation resumes. The duplicate proxy-scene warm-up was removed. Joe's rigid mower meshes are included in the protected draw, alongside the animated meshes; ordinary visibility remains controlled at the actor root.

Each variant below used a separate fresh browser/GPU process at 2560×1600, with SwiftShader and the existing 960×540 world cap. The baseline is the exact source snapshot at the beginning of this follow-up, in `output/render-followup-20261107/before/`. Timings start at course entry, after the menu's initial asset loading; they are not navigation-to-playable or uncached-network measurements.

| Measurement | Baseline | Follow-up |
| --- | ---: | ---: |
| Ready flag | 19.09 s | 12.48 s |
| First GPU-completed scene | 19.45 s | 12.85 s |
| Largest loading RAF gap | 8.87 s | 0.35 s |
| Ordinary W input distance in ~2 seconds | 45.60 units | 45.20 units |

The final first scene completed about 34% sooner in this pair. An earlier pair, before removing vertex repacking, measured 16.63 / 11.98 s and loading gaps of 3.32 / 0.40 s. The final baseline's larger stall illustrates substantial local browser/driver variation; these short samples are engineering evidence rather than device qualification. Final residual JavaScript tasks reached 248 ms (396 ms in the earlier pair); startup is improved, not stall-free. Ordinary movement remains comparable across both variants, though these short real-time samples do not demonstrate perfectly uninterrupted 24-unit/second motion.

## Visibility and art

Software static batches retain per-part camera bounds, so geometry wholly outside the view need not be submitted just because another part of the spatial batch is visible. Hardware keeps its existing shadow-caster behavior. Camera projection changes invalidate the visibility cache. Only the active index prefix changes; original vertex attributes remain immutable, avoiding duplicate vertex storage and repeated attribute uploads while moving.

The full/culled comparison renders both variants in the same scene and reads the completed framebuffer. All eight views match exactly, including hedge edges, reverse views, the border and exit shed. Opening triangle submissions fall from 188,818 to 132,626; border submissions fall from 99,128 to 66,932. These counts do not imply the same percentage FPS improvement: alternating same-process timing showed no consistent gain.

An experimental cover-occlusion path was rejected after it removed visible lantern detail. It is absent from the final runtime. Texture-array batching was also rejected after it increased software cost. Dense vertex repacking was discarded because it added copies and uploads without a consistent frame-rate benefit.

The final index-only implementation passed eight exact framebuffer comparisons. In alternating full/culled moving runs within one warmed browser process, opening medians were 67.1–67.3 / 66.8 ms and border medians were 99.8–99.9 / 99.8–100.3 ms. This is effectively unchanged throughput. Separate-process profiling varied much more (100–300 ms medians across experiments), so those runs cannot support a causal FPS improvement claim.

Fresh-browser 2560×1600 before/after captures retain all object anchors, original Joe triangle counts and loaded art. Average channel differences are 0.033/255 at the opening, 0.026/255 at the border and 0.099/255 at the shed. Those averages support screenshot inspection, rather than replacing checks for local missing details.

## Evidence and outstanding work

Passed during this follow-up: gameplay intelligence (9 groups, including 29 mower-clearance approaches), quality/movement (16), Joe animation (5), pixel world/parallax (10), preparation lifecycle (5), render queue (6), and release validation (90 action fixtures, no warnings or failures). Syntax and whitespace checks pass. Reviewed 2560×1600 opening/border/shed and Joe captures, plus 1280×720, 800×600 and 844×390 touch layouts.

RTX 3090 / D3D11 moving samples retained ~16.7 ms median, 16.7–16.8 ms p95, no intervals above 50 ms, and full 1280×720 scene rendering with shadows. These are short local samples, not sustained or lower-end certification.

The installed game-testing client completed three onboarding iterations with 12-second pauses. The final state has a ready scene, 586 submissions, 28 course units travelled, no error artifact, and 56/57 readiness checks. `gameplay_frame_budget` remains the failing check: software completion averaged 93.14 ms, with p95 113.80 ms. Its final gameplay screenshot was inspected; the canvas-only capture omits the DOM HUD, which is covered by the full-page viewport checks.

Measurements, screenshots and visibility checks are in `output/render-followup-20261107/`. Software GPU completion remains the bottleneck; a low CPU submission time or a 60 Hz input loop must not be reported as 60 FPS rendering. Human playtests remain prepared for later. No deployment or commit was requested.
