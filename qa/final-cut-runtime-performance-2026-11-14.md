# Final Cut runtime performance

Request: investigate and optimize The Final Cut after the chapter menu work.

## Findings and changes

The gameplay loop rendered on every browser animation callback, including on high-refresh displays. Unlike the other chapters, it had no GPU completion fence to prevent queuing more expensive scenes while the previous scene was unfinished. Individual native 2560 × 1600 views submitted approximately 2.2–4.3 million triangles, counting shadow passes. Several finite lights also refreshed shadows while their complete influence was outside the camera view.

- Gameplay now schedules at 60 Hz, preserving elapsed simulation time and avoiding catch-up rendering bursts. Input/simulation continue while the GPU is busy.
- Each automatic render inserts a nonblocking GPU fence. Further scene submissions are skipped until it completes. Manual test stepping waits for pending automatic work; fences are released on completion/disposal.
- Finite spotlight shadows retain their cached maps when the entire light influence is outside the view, invisible or unlit. A returning light refreshes its shadow immediately. Light counts remain constant to avoid recompiling shaders when turning the camera.
- Artwork, geometry, texture resolution, render tiers and gameplay rules remain unchanged. Entry cache versions were updated.

Runtime changes: `web/final-cut.js`, `web/final-cut-scene.js`, `web/final-cut-boot.js`, `web/final-cut.html`.

## Evidence

`tools/verify-final-cut-runtime.cjs` passes with no page errors:

- Simulated 60/120/144/240 Hz schedules each perform 121 updates/presentations over the inclusive two-second interval, advancing simulation by exactly two seconds.
- GPU backpressure: ten attempted renders while the fence reports busy produce zero additional submissions; drawing resumes after completion.
- Four gameplay views (overlook, shelter, machine, collapse) match forced freshly rendered spotlight shadows byte-for-byte, including the subsequent return to cached rendering.
- Actual start, keyboard movement, pause freeze and resume pass. State is reset between the collapse fixture and the fresh gameplay scenario.
- Gameplay layouts checked at 2560 × 1600, 1280 × 720 and 390 × 844. High-resolution machinery and shelter views inspected.

The shelter profiling view falls from 398 to 306 draw calls and 4,315,134 to 3,591,460 submitted triangles (92 draws / 723,674 triangles removed, about 23% / 17%). Other sampled views conservatively retain their visible lighting and mostly retain their draw counts.

Native synchronous draw-plus-GPU-read measurements in milliseconds:

| View | Before median (two control samples) | After median | After p95 |
| --- | ---: | ---: | ---: |
| Overlook | 10.7 / 9.4 | 9.2 | 14.9 |
| Shelter | 6.5 / 7.3 | 8.2 | 8.7 |
| Machine | 9.5 / 9.8 | 9.6 | 10.9 |
| Collapse | 10.8 / 11.8 | 10.9 | 11.7 |

These shared-host samples do not establish a general per-frame speedup. The robust improvements are bounded submission frequency, prevention of GPU backlog, and reduced shadow work where applicable. No YouTube playback claim is made. The optional software-renderer baseline did not finish and its owned process tree was terminated; software throughput remains unverified in this pass.

## Other checks and artifacts

- Installed develop-web-game client passed via `tools/verify-idle-screen-client.mjs`; 2560 × 1600 screenshot and state inspected in `output/final-cut/runtime-performance/client`.
- Existing simulation suites passed: `tools/verify-final-cut.mjs`, `tools/verify-final-cut-balls.mjs`, `tools/verify-final-cut-ending.mjs`. These cover complete routes, captures, checkpoints, ball interactions and endings at multiple simulation rates.
- JavaScript syntax checks passed for the changed runtime files and the new profiler/verifier.
- `tools/profile-final-cut-runtime.cjs` and before/after reports, baseline source copies, screenshots and verification JSON are under `output/final-cut/runtime-performance`.
- Two intermediate verifier failures were test setup issues: checking the reload hook before it existed, and retaining the collapse fixture's checkpoint across reload. Both were corrected; the final full run passes.

Future profiling should measure actual presentation times on the affected device if symptoms remain, particularly software rendering and startup. This change does not claim whole-level performance acceptance.
