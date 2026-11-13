# Back Nine software sky overdraw (2026-11-11)

## Change

Added course-sky-coverage.js and a software-only scissor around the background pass in back-nine-scene.js. The helper projects an inset of the continuous opaque central turf, clips it to the camera's near/far planes, and proves that both lower screen corners and the convex band between them are covered. It leaves two rows of margin and falls back to drawing the complete background for unsafe views, below-ground cameras, and existing scissor passes. Scissor state is restored before the course renders.

This avoids shading sky/cloud/parallax pixels that the opaque course immediately overwrites. It preserves every visible sky pixel and the full parallax update, not a cached or reduced-rate backdrop. Render resolution, dynamic resolution thresholds, all course geometry, pixel textures, lighting, audio, collisions, simulation and Joe's smarter pathing are unchanged. Hardware rendering bypasses the optimization. No new shaders, textures, GPU buffers, render targets or warm-up passes. Import revisions updated.

## Evidence

- Diagnostic ablation put the full background pass at roughly 6-10 ms in sampled SwiftShader scenes. Discarded depth/opaque sorting experiments had inconsistent gains and tiny pixel differences; no sort changes retained.
- Six paired static views at fixed 960x540, captured at 2560x1600: final pixel buffers byte-identical. Alternating ABBA order, 48 fenced samples per version per view. Median savings about 1-3 ms; p95 improves in five of six views, with one runner view +1 ms. See comparison.json.
- 510 moving frames across driving/impact, ejection, run-over, and garage sealing/completion. Alternate baseline/candidate order each frame, same simulation and camera pose. All 51 sampled pixel-buffer pairs byte-identical, zero new GPU buffer allocations. Run-over reaches caught and garage reaches complete. See moving.json.

| Moving scene | Median before -> after (ms) | P95 before -> after (ms) |
|---|---:|---:|
| driving-impact | 38.6 -> 37.1 | 49.9 -> 47.0 |
| ejection | 38.3 -> 36.9 | 52.2 -> 47.2 |
| runover | 36.3 -> 33.4 | 44.0 -> 42.0 |
| finale | 48.3 -> 45.2 | 59.8 -> 57.2 |

These are GPU-completed draw samples with fence polling, not displayed FPS. They show a modest consistent moving-scene saving, not elimination of all software spikes. Shader/raster costs for the mower, foliage and wet lanes remain significant, and host contention still affects tails. Do not generalize individual maximum-frame improvements from these short samples.

## Verification

- Independent geometry check: 2,500 camera poses varying yaw, pitch, roll, aspect ratio, FOV and depth; 8,400 rays through omitted pixels all intersect the actual opaque turf within the visible depth range.
- Full moving comparison includes rear glance, camera shake, impact, wet-lane foliage, player ejection, death animation and closing garage. Pause and reduced-motion checks; screenshots inspected at 2560x1600, 1280x720, 844x390 and 390x844. Existing narrow portrait letterboxing remains dense; layout is unchanged in this performance pass.
- Route choices, narrow gaps, mower detours, late cart destruction -> on-foot victory and retry, runner controls, ram recovery and escape windows pass existing suites. No simulation/pathing changes.
- Installed standard web-game client runs two on-foot input bursts; presented screenshot/state inspected. No browser errors in comparison/motion tests or standard-client error artifacts.
- Release: 90 action scenarios, 67 images / 26 MiB, no warnings/failures. Syntax and whitespace checks passed.

Files: web/course-sky-coverage.js, web/back-nine-scene.js, web/back-nine.html. Evidence and saved source: output/estate-performance/. Tools: verify-course-sky-coverage.mjs, verify-estate-performance.cjs, verify-estate-motion.cjs; diagnostic profile-estate-rendering.cjs. Local build on port4187, no deployment. Human playtesting remains deferred.
