# Back Nine software frame pacing — 2026-11-11

The software renderer could finish between requestAnimationFrame ticks, then wait for another display tick before submitting the next frame. This added idle time to expensive foliage/mower views.

## Retained change

- `web/frame-wake.js` provides one cancellable completion wake, normally 4 ms apart. It never advances simulation.
- `web/back-nine.js` uses it only for software rendering, only while presentation is needed, and only after checking the existing GPU fence. One frame remains in flight; submissions remain capped at 60 Hz. Input, fixed-step simulation and UI stay on RAF.
- Manual stepping cancels pending wakes. Pause stops new draws and drains the final fence; hidden/unfocused pages do not submit frames. Page exit cancels pending work.
- Entry/helper asset revisions refreshed in `back-nine.html`.
- No changes to environment geometry, organic routes, textures, effects, resolution policy, shaders, vehicles, damage, collisions or Joe's navigation.

## Controlled measurement

`tools/verify-frame-pacing.cjs`: headless Chromium SwiftShader, 1280×720 viewport, **fixed 960×540 render resolution** for both versions, same wet-lane/foliage/mower composition. Simulation deliberately holds actors in place while allowing the real presentation loop to run. Four fresh-page blocks in baseline/current/current/baseline order, each with 2.5 seconds settling and 12 seconds recorded. This isolates scheduling; it is not a full moving-gameplay FPS benchmark or a GPU-time measurement.

| Draw-submission interval | Before | After |
| --- | ---: | ---: |
| Median | 50.0 ms | 38.1 ms |
| 95th percentile | 51.2 ms | 43.2 ms |
| Recorded intervals | 482 | 616 |

Median interval decreased 24%; p95 decreased 16%. Both current blocks agreed (38.1/38.3 ms median). These are local measurements, not guarantees on other machines. The underlying rasterization cost remains; this does not establish that every spike is eliminated or reduce the cost of each rendered frame.

Raw results: `output/foliage-mower-performance/pacing-comparison.json`.

## Verification

- `verify-frame-wake.mjs`: at most one timer, reentrant scheduling, bounded delay, cancellation and inactive suppression.
- `verify-frame-wake-browser.cjs`: real driving and Joe movement; maximum **one GPU frame in flight**; pause/resume, blur/focus, visibility event handling, manual stepping, reduced motion. No page errors. Visibility uses a test property override because headless tab occlusion is not reliable.
- Standard installed gameplay client via `verify-presented-client.mjs`: on-foot input bursts, state captures and screenshots, no errors.
- `verify-runner-steering-browser.cjs`: keyboard steering, automatic camera, look-back, reverse, ignored mouse/right-stick/touch camera input, guide and on-foot garage win.
- `verify-runner-controls.mjs`, `verify-mower-ram.mjs`, `verify-back-nine-choices.mjs`: controls, fence sliding, charge recovery, five cart gaps/three foot gaps, seven branch drives, interception, late destruction/ejection/foot victory and checkpoint retry passed. Navigation remains baked, signature 3095194091, 4,410 nodes.
- `verify-release.mjs`: 90 action scenarios, 67 referenced runtime images / 26 MiB; no failures or warnings.
- Screenshots inspected at 2560×1600, 1280×720 and 390×844. Detailed mower/foliage view and on-foot clubhouse scene remain intact. Portrait retains the existing letterboxed layout with a crowded HUD; no layout changes were made in this performance pass.

Evidence lives in `output/foliage-mower-performance/`, including `lifecycle.json`, `pacing-2560.png`, `live-*.png` and `standard-client/`.

## Rejected experiment

Partitioning static ground batches into lit/unlit portions added draw calls without dependable benefit (wet-mower median 45.1→45.9 ms). Both lighting and batch modules were restored exactly to their task-start snapshots. Rejected results are recorded separately; they are not used as evidence for this fix.

## Remaining work

Dense close foliage and mower views still have substantial software rasterization cost. This pass removes avoidable scheduling stalls without reducing art quality. Further optimization should measure that cost directly and verify equal output, rather than assume batching or lower detail will help. Human hardware/load variation and prolonged playtesting remain unmeasured here. Served locally on port 4187; no deployment.
