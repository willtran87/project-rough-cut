# Back Nine foliage and wet-lane throughput

## Changes

- Increased static material batch length from 48 to 192 metres, retaining the original 48-metre lantern circuit cells. Existing per-piece frustum/index culling still selects the same triangles. Static batches fall from 249 to 112. Wet-lane submissions fall from 86 to 66; foliage view 126 to 102; opening 82 to 61.
- Baked exact directed grid-edge clearances for Joe's fixed course, with geometry/code signature validation and original-check fallback. Reused search scratch arrays and cached each search's double-precision heuristic. Original search order, expansion limit, collision sampling and returned waypoints remain intact. Returned points are copies so callers cannot mutate the shared grid.
- Navigation fingerprint alone rounds coordinates to micrometres to tolerate nanometre differences in procedural Math.sin results between Node and Chromium. Actual geometry remains unchanged; the browser independently rebuilt every edge and matched the bake.
- No foliage, wet-ground, mower, alarm, movement or sound detail was removed. No shaders, render passes, lights or audio voices were added. Production retains 16 programs, 34 textures, two local lights and nine voices.

## Measured results

Paired SwiftShader comparisons use a 2560x1600 viewport, fixed 960x540 render size and a GPU completion fence. Baseline/current share one renderer, with frozen parallax time for image comparisons. Timings include JavaScript, submission, GPU completion and polling overhead; they are not isolated GPU timings.

| Measurement | Baseline | Current |
| --- | ---: | ---: |
| Wet-lane isolated route median | 8.79 ms | 0.60 ms |
| Wet-lane isolated route p95 | 12.12 ms | 1.02 ms |
| Moving wet-lane simulation maximum | 13.0 ms | 2.4 ms |
| Moving wet-lane complete frame median | 48.7 ms | 46.8 ms |
| Moving wet-lane complete frame p95 | 54.8 ms | 55.6 ms |
| Moving wet-lane complete frame maximum | 63.1 ms | 66.7 ms |
| Paced geometry preparation batches | 22 | 14 |

The moving sample alternates baseline/current order over 180 identical simulation steps, with forward/rear camera changes. It confirms a substantial reduction in CPU replanning work, but **does not establish an improvement in overall worst-case frame time**. Visible foliage and wet-lane rasterization still make software rendering slow. Static ABBA blocks were noisy: foliage p95 was 55.7–57.8 ms before and 50.5–51.6 ms after; other views did not show a consistent gain. No 60 FPS claim.

Preparation remains paced with GPU fences/yields and a largest upload of 2,094,984 bytes, below 2 MiB. A fresh software browser feature test reached ready in 3.85 s; this is a single sample, not evidence of a cold-start improvement. The paired renderer test holds both scenes and therefore reports more textures than the ordinary production page.

## Validation

- `verify-course-navigation.mjs`: 68 exact route comparisons, stale-bake fallback, returned-point ownership and a full 4,069-frame chase identical through victory.
- `verify-course-navigation-browser.cjs`: all 4,410 edge masks match an independent uncached browser rebuild; zero runtime edge checks when the bake is valid.
- `verify-course-foliage.cjs`: 19 views have zero changed pixel channels, identical triangle counts and no new geometry allocations after preparation. Stable pine visibility causes no matrix reuploads. The moving chase remains state-identical for all 180 frames.
- Existing chapter route, alarm-distraction and mower-ram simulations pass, including six winning routes, all three alarms and five escape cases.
- Software machinery browser regression passes alarm activation, investigation, pause/resume, Reduced Motion, sound reacquisition and stable resources, with no console errors.
- Installed standard gameplay client completed two driving bursts; presented image and text state inspected. Navigation bake is active, with zero uncached edge checks.
- Hardware browser regression passes keyboard, touch, gamepad, pause, checkpoint save/reload, victory, caught retry and replay, with no errors or shader/texture growth. Hardware readiness was 2.72 s in this single sample.
- Inspected screenshots at 2560x1600, 1280x720 and 844x390. Wet marks, foliage, mower grille/cage and active alarm caption remain present.

Evidence: `output/back-nine-foliage/{comparison,navigation,browser-navigation}.json`, its `verified-*.png` captures and `standard-client/`; `output/night-machinery/software.json` and screenshots. The paired comparison scripts require the preserved pre-change sources in `output/back-nine-foliage/baseline-source/`.

Rebuild the navigation asset after course/clearance changes with `node tools/bake-course-navigation.mjs`, then run `node tools/verify-course-navigation-browser.cjs` against the local server. A stale signature safely falls back to the existing checks; rebaking restores the performance benefit.

Remaining work: profile software rasterization and GPU scheduling during longer ordinary drives. The tested rendering experiments that changed foliage pixels or failed to produce dependable gains were discarded. Human feel/listening tests remain prepared for later.
