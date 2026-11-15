# Visible foliage lighting and first-use preparation — November 7, 2026

Static software-rendered foliage and structures now skip point-light calculations when their entire bounds lie outside every local light's reach. All 23 comparison views remain pixel-exact. The border moving-camera test improved from approximately 100 ms to 84 ms per completed frame; pond and opening timings remain variable. This does not resolve all software-rendering spikes.

## Changes

- `web/local-light-culling.js` shares an alternate Lambert shader across compatible static batches. It removes only the point-light loop; original textures, alpha cutouts, ambient/hemisphere/moon lighting, fog and pixel grading remain.
- Inside or within a small safety margin of a lamp's radius, use the original shader. Unlimited or invalid ranges retain the original shader. Multiple lights and transformed light parents are supported.
- Cache material selection until a light moves, changes range, or becomes active/inactive. Fluctuating nonzero intensity does not trigger another bounds pass.
- Compile and warm both material variants during loading. Static geometry, index packing, visibility and solid-cover culling remain intact. Hardware lighting and shadows use the existing path.
- Prepare the final display compositor under the loading gate too. The verification tour initially found one additional display shader appearing on first use; the final tour keeps the program count at **55 before and 55 after**, with no new programs.

Only `scene-3d.js` and `pixel-world-props.js` changed among the 27 existing JavaScript modules in the task-start snapshot, alongside the new helper and HTML cache tag. Simulation, movement, Joe navigation/model/animation, water, effects, tree geometry, textures and resolution policy are unchanged.

## Measurements

`tools/verify-local-light-rendering.cjs` alternates original/optimized/optimized/original lighting in one warmed SwiftShader process. Each pass completes 40 moving-camera frames at a fixed 640×360 scene target. Timing includes the compositor, GPU fence completion and RAF polling delay. There are 984 eligible static batches and 28 shared alternate materials; the pond view excludes point-light work from all 984 batches.

Final measured ranges across the two passes per mode:

| View | Original median | Optimized median | Original p95 | Optimized p95 |
|---|---:|---:|---:|---:|
| Pond | 133.5–166.6 ms | 133.5–167.0 ms | 150.3–217.7 ms | 200.8–266.4 ms |
| Border | 100.0–100.1 ms | 83.5–83.7 ms | 116.5–117.1 ms | 100.5–100.7 ms |
| Opening | 83.8–99.8 ms | 98.8–99.8 ms | 100.5–116.6 ms | 100.6–134.6 ms |

The border gain is consistent in this comparison. Pond/opening results do not establish an improvement. Host/process timing varied substantially during the session; an earlier integrated run was around 100 ms at the pond and 67 ms at the opening in both modes. Do not present the isolated shader-work reductions as a universal FPS gain.

An additional direct GPU-completion probe, excluding the compositor and fence polling, also showed a border improvement (115.2–115.9 ms to 97.8–100.0 ms). Pond results overlapped (104.8–123.9 ms versus 101.1–107.2 ms). These are supporting diagnostics, not the player-facing frame-rate result.

Evidence is under `output/foliage-throughput-20261107/`, including `lighting/report.json`, `lighting/new-programs.json`, `integrated-light-gpu.json` and `source-preservation.json`.

## Verification

- Unit checks cover light-range boundaries, safety margin, multiple/moving lights, transformed parents, power/visibility transitions, unlimited ranges, cached selection, shader chaining, shared preparation and disposal.
- 23 views compare all original versus optimized lighting with zero changed framebuffer channels and identical triangle counts: pond angles, crouching, lanterns, hedges, opening, border and shed.
- High-resolution hardware/software checks pass at 2560×1600, 1280×720, 800×600 and 844×390 touch. Pond ripple screenshots were visually inspected.
- Release verification passes 90 fixtures with 55 images / 17.94 MiB unchanged, no warnings or failures. Existing index-compaction boundary/deferred-upload tests pass.
- Cold-start A/B: first completed scene 11.87 s baseline / 10.83 s current; largest loading RAF gap 416.7 / 316.7 ms. Two-second forward movement travelled 47.20 / 47.60 units. Authored object layouts and Joe geometry match, with no browser errors. This single cold comparison does not establish a universal startup improvement.
- Gameplay intelligence passes nine groups, including 29 obstacle approaches and Joe's close/distant animation continuity. Pixel effects pass ten groups, including wind/water and occluded apparition framebuffer checks.
- Installed normal-play client completed three iterations: 28 units travelled, 586 scene submissions, no renderer error or error artifacts. Final screenshot/state inspected. Syntax and whitespace checks pass.

Front-to-back batch sorting and horizontal needle-strip simplification were tested and rejected: neither established a dependable benefit, and both changed some pixels. Neither remains in runtime code.

Remaining: visible foliage's software GPU cost and consistent pond frame pacing. No 60 FPS software claim, no deployment, and human playtests remain deferred as requested.
