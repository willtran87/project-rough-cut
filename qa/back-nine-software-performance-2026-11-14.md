# Back Nine software rendering follow-up — 2026-11-14

**Status: partial improvement; the CPU-only performance/fidelity limitation remains open.** The final patch preserves the authored art and shaders. It does not establish smooth high-resolution rendering on SwiftShader.

## Retained changes

- Split large static batches into contiguous runs of at most 64 triangles for software visibility tests. Keep the original vertices, normals, UVs, colors, indices within each run, and triangle order.
- Test each original piece before its smaller runs; retain the original piece-based distance cutoff. Windbreak tips retain a conservative movement allowance.
- Cull contact-shadow patches using their fixed terrain geometry, including the wrecked cart's complete travel footprint. Dynamic UV and opacity updates keep their original vertex offsets.
- Use contracted interior boxes inside the three closed, immovable windbreak cores to reject fully occluded geometry. Shadow-caster geometry remains independent of camera culling.
- Keep the native renderer on the existing piece granularity. Refresh the three changed module URLs in the Level 2 import map.

No texture, model, effect, shader, draw-distance setting, resolution step, or frame-budget threshold was reduced. The native rendering path retains the original shaders.

## Fidelity and behavior

The final same-scene GPU comparison restores all static geometry and compares it against the optimized frame at fixed 960×540. All 16 views have **zero changed RGB pixels**, covering wet cart/foot stress, nursery, bunker, garage, reverse view, opening, and both sides/end of each windbreak. This full-geometry reference is a safety check, **not** the prior shipping performance baseline.

Evidence: `output/back-nine-software-performance/final-invariants-original-shaders/report.json`.

Additional checks:

- 720,000 triangle/camera checks across 100 cameras; no view-intersecting triangle removed; vertex attributes unchanged; exact full-index restoration.
- Finite-distance regression: splitting a piece does not shorten its original distance cutoff.
- Existing index-compaction tests: 512 visibility transitions, 16/32-bit limits, deferred uploads.
- Existing conservative occlusion tests: 96,096 bounded checks, 144,000 reference comparisons, 432,000 frustum checks.
- Existing scenery contact tests: 1,054 terrain triangles, 5,568 patches, 35 removable objects.
- Installed gameplay client with movement and rear glance at a 2560×1600 viewport; actual presented screenshots inspected.
- Gameplay stress suite exercises charging/exhaustion, all destruction pools, foot/cart chase, resource stability, pause/resume, full restart, and 2560×1600 / 1280×720 / 390×844 layouts. Its `passed` flag is a functional/resource result, not frame-budget acceptance.

## Rejected experiments

A depth prepass was pixel-identical but slower, so it was removed. Conservative fixture/wear coverage masks were also pixel-identical but did not provide a repeatable timing gain; they were removed. A mist-ray box shortcut lacked an isolated benefit and was reverted. These experiments and profiles are retained only under `output/back-nine-software-performance/`; none is in the final production patch.

Separate-page image comparisons showed a few small differences around Joe's model edges. The final visibility proof compares toggled visibility within one loaded scene, keeping geometry, pose, camera, materials, and shaders identical, and passes with zero changed pixels.

## Performance interpretation

The machine was heavily loaded during testing (observed CPU packages at 66% and 100%). Absolute times from different runs are not comparable. Use the alternating same-scene comparison to assess the visibility changes, and retain the software limitation until the real application meets its frame budget.

The paired test compares prior authored-piece granularity against fine visibility/hedge occlusion in alternating blocks along the same deterministic moving chase. Contact cells use conservative cell bounds in both variants, so the comparison excludes some of the contact-shadow improvement. Both variants have identical fixed resolution, shaders, effects, and simulation workload; the pre-replay images are pixel-identical.

Final fixed-resolution, original-shader comparison (960×540):

| Stress view | Coarse median / p95 | Optimized median / p95 | Median reduction | Visible-pass triangles |
| --- | --- | --- | --- | --- |
| On foot, Joe facing camera, wet ground and debris | 363.2 / 537.6 ms | 282.8 / 451.3 ms | 22.1% | 294,851 → 250,608 (15.0% fewer) |
| Cart, wet ground and debris | 253.7 / 296.9 ms | 240.6 / 282.0 ms | 5.2% | 224,860 → 198,762 (11.6% fewer) |

Both comparisons changed zero pixels. CPU scene-update time was about 7.0 → 8.6 ms on foot and 6.6 → 6.7 ms in the cart; finer visibility trades a small CPU cost for less software raster work. Draw calls remained 201 / 134 respectively. These are run-specific timings under shared host load, not a general FPS guarantee. An earlier paired run measured smaller gains (7.7% foot / 2.9% cart), reinforcing that this does not close the software budget.

Evidence: `output/back-nine-software-performance/culling-final-original-shaders/report.json`.

Accelerated stress verification retained 2560×1440 rendering: cart median/p95 16.0/17.6 ms; foot 17.2/19.3 ms. This suite ran before reverting the experimental mist shortcut; the final native installed-client rerun uses the original shaders and retains 2560×1440. The original-shader final client reports NVIDIA RTX 3090 / D3D11, 41 programs, 58 textures, no browser errors. Screenshots at 2560×1600, 1280×720, and 390×844 were inspected.

Evidence: `output/back-nine-software-performance/native-final/report.json` and `client-native-final/`.

Final real-application SwiftShader suite (original shaders):

- Cart: **135.2 ms median / 225.2 ms p95**, 640×360.
- On foot: **164.0 ms median / 195.3 ms p95**, 640×360.
- Charging, simultaneous destruction, resource stability, pause, restart, and all three layouts pass; browser errors: **0**.

Evidence: `output/back-nine-software-performance/software-original-shaders-final/report.json`.

These frame times still miss the existing 60 ms software budget even at its existing minimum resolution. The high-resolution software-fidelity requirement is **not achieved**. This is a tested, lossless visibility optimization, not a complete fix for the CPU-only renderer. No completion/acceptance status was changed to conceal that result.

## Files and reproduction

Production: `web/course-batch-culling.js`, `web/back-nine-scene.js`, `web/back-nine-scenery-contact.js`, and the Level 2 import-map versions in `web/back-nine.html`. Final source hashes and unchanged-shader checks are in `output/back-nine-software-performance/final-source.json`.

Run from the project root with the existing static server on port 4187:

```powershell
node tools/verify-course-batch-culling.mjs
node tools/verify-visible-indices.mjs
node tools/verify-bounded-occlusion.mjs
node tools/verify-occlusion-planes.mjs
node tools/verify-scenery-contact.mjs
node tools/verify-back-nine-software-invariants.cjs output/back-nine-software-performance/recheck-pixels
node tools/verify-back-nine-culling-performance.cjs output/back-nine-software-performance/recheck-paired
node tools/verify-back-nine-final-polish.cjs output/back-nine-software-performance/recheck-app --software
```

Run GPU/browser timing jobs sequentially; simultaneous rendering jobs contaminate each other's measurements. No commit or deployment was made.
