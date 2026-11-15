# Visible mower and foliage software-rendering follow-up — 2026-11-09

## Retained changes

`web/repeated-vehicle-parts.js` combines only identical geometry/material pairs into instanced draws. The original wheel and cutting-deck pivots still animate every frame. Side-specific hubs remain separate. There are 11 shared batches across both vehicles, saving up to 20 draws. Unchanged poses do not upload matrices; duplicate geometry is disposed and removed meshes are not retained. No vehicle detail, texture or collision shape was removed.

`web/skin-influences.js` examines each rider mesh's authored weights once at load. Shader specialization removes only bone lanes whose weights are zero across that entire mesh. Seven rigid-weight meshes use one influence; sweater and trousers retain all three used influences. Every authored weight, UV, normal, face treatment and bone animation remains intact. This adds one prepared shader variant (17 total versus 16).

The existing preparation path warms all instance buffers and shader variants in paced batches. Batches decrease from 16 to 15, maximum still 2,094,984 bytes. Textures remain 34, local lights two, audio voices nine. No new render passes, resolution reduction, foliage deletion, navigation changes or runtime geometry construction. Entry version: `20261109-chase-visible`.

## Performance evidence

SwiftShader, fixed 960×540 render target, same renderer for baseline/current, one outstanding completion fence. Static blocks use ABBA ordering and 24 frames per block. No concurrent GPU tests. This measures total update/submission/completion time, including polling/scheduling overhead.

| View | Draws before → after | Baseline p95 pair (ms) | Current p95 pair (ms) |
| --- | --- | --- | --- |
| Visible mower | 87 → 67 | 39.9 / 41.5 | 37.7 / 38.1 |
| Foliage with mower | 112 → 94 | 49.7 / 48.9 | 52.9 / 46.8 |
| Wet lane | 66 → 61 | 46.9 / 46.1 | 44.4 / 47.3 |
| Range | 83 → 78 | 37.9 / 43.8 | 38.5 / 36.3 |

Two 180-frame alternating-order moving replays retain identical complete simulation states. Average submissions decrease from 106.99 to 91.58 per frame. First replay: median 42.4 → 42.0 ms, p95 50.3 → 49.6 ms, maximum 64.7 → 55.6 ms. Final replay: median 51.1 → 50.6 ms, p95 67.0 → 66.8 ms, maximum 71.4 → 73.1 ms. These show modest steady-time savings, **not a consistent worst-case improvement**. Visible foliage and software rasterization/scheduling spikes remain. No stable 60 FPS or faster cold-start claim.

## Preservation and verification

- All 17 static RGBA comparisons match exactly. No geometry buffer allocation on later views. Six moving captures per replay: four exact, two differ by 2 and 11 channels out of 2,073,600, maximum channel delta 14/255. Instancing changes GPU matrix multiplication precision at a few raster edges. Tests bound this tightly and independently verify animated vertex positions.
- `verify-vehicle-batching.mjs`: all 15 nonempty bone-lane masks, tiny nonzero weight preservation, distinct-UV rejection, 90 animated pivot poses, unchanged-pose upload suppression; maximum local vertex error 9.28e-8 metres.
- `verify-mower-visibility.cjs`: whole-model bounds include every instance and skinned vertex through twelve ram poses, forward/rear visibility. Maximum radius 3.576 m within the existing 6 m bound.
- Updated contact/windup browser checks to expand every rendered instance, so batching cannot hide a collision discrepancy. All six contacts and rendered hulls pass, retaining 9,323 cart / 29,606 mower vertices.
- Software panic and ram-windup browser checks pass reveal/recovery/finale, spray cap, Reduced Motion, pause, fixed camera, folding decks, launch, captions, engine audio and resource stability. Nine audio voices; normal windup peak .2025, mute zero, correct directional commit and finite tail.
- Hardware browser regression passes keyboard, controller, touch, fullscreen, pause, checkpoints/save/reload, retry, garage finish and replay, with no first-rear-view shader/texture growth or errors.
- Simulation tests pass panic protections, five ram escapes and all six live-Joe winning routes. Both moving replays have the same full simulation state at all 180 steps; navigation bake remains valid, with zero runtime edge checks.
- Installed standard web-game client completed two input bursts. Latest presented screenshot/state inspected; no error files. Visuals inspected at 2560×1600, 1280×720 and 844×390. Human feel testing remains deferred.

Run `node tools/verify-chase-visible.cjs` for static timings/images plus the moving comparison, or add `--skip-timing` for static images and moving verification. Comparisons need the session baseline under `output/chase-visible/baseline-source/`. Evidence: `comparison.json` / `vehicle-batching.json` (retained static pass), `vehicle-moving.json` (first retained moving pass), `visual-comparison.json` (final retained moving pass), screenshots and `standard-client/`. Additional browser reports remain under their existing panic/windup/contact directories.

## Rejected experiments and remaining work

- Tighter branch/crown bounds removed almost no submitted geometry in the costly views. Reverted; `course-pines.js` is byte-identical to the turn baseline.
- Uploading precomputed foliage normal-scale factors changed six opening-view channels, with no established speedup. Reverted.
- Drawing opaque windbreaks before the ground helped some static p95 samples, but moving worst-case time did not consistently improve and near-equal-depth edges differed more. Reverted; original opaque ordering is preserved.

Future profiling should target software fragment/raster costs and host scheduling variance. Do not report these deterministic submission/animation savings as resolving the remaining foliage spikes. Keep the pixel style and gameplay contract intact.
