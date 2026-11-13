# Under the Green — current performance and off-screen actor rendering

This pass advances review 40 and its verification requirements in 41. It does not close the complete 44-item objective or establish human/device acceptance.

## Current-build baseline

The five-minute software run in `output/under-green/current-build-soak/` reached ready in 1,236 ms. It kept 290 geometries, 56 textures, 21 programs and 16 audio voices stable after the first route. Its warmed average was 25.72 render submissions/s, but the slowest window was 17.28, below the unchanged 24 threshold. This supersedes treating the older piece-culling report as qualification for the current build. The original failure is retained.

The first analyzer also rejected the walking route's one water hit because it assumed all four routes had zero hits. The current pure simulation pilot independently produces that same hit, escapes, and matches the browser's final position and completion time exactly. `baseline-route-comparison.json` records a retrospective comparison against independently verified contracts, without rewriting the original report or its performance failure.

The profiler now verifies each input tape's mode, position, water hits and elapsed time before browser launch. The browser must match that contract. The analyzer checks those values independently; historical reports without contracts retain their prior zero-hit requirement. Eight mutation checks reject extra/lost hits, different time/position, capture, malformed expected time and slow rendering. Altered reports under `analyzer-regressions/` are test fixtures, not measured performance evidence. First-use windows are now exposed separately from warmed acceptance and are not described as cold OS/driver-cache tests.

The sequential hardware baseline in `current-build-soak/verified-contract/` passes: ready 1,384 ms, warmed 59.98 submissions/s, RAF p95 16.8 ms, all four route contracts exact, stable resources, no page/context errors. Viewport 2560×1600, FOV 85, requested resolution 1; actual hardware scene 1600×1000. This baseline precedes the software-only actor optimization.

## Runtime change

Under the Green's software renderer now skips the complete Joe actor only when a conservative world-space sphere is outside the camera frustum. The skinned model previously disabled per-mesh frustum culling because bind-pose bounds are unsuitable for its animated poses. The new envelope has radius 3 m, centered 1.2 m above Joe's root; 72 sampled carry/search/attack/recovery poses contain 1,094,616 inspected body/tool vertices, with maximum radius 1.527 m. Revalidate the envelope when the rig or tool changes; sampled poses are not proof for arbitrary future animation.

Joe's simulation, pose update and contact audio still run. Render visibility is restored immediately after scene submission, including on a render exception, so geometry inspection and other consumers retain his semantic visibility. No geometry/detail, movement, hazard timing, pursuit or attack rules change. Hardware retains its existing actor submission behavior.

## Verification

- Candidate and integrated comparisons use complete RGBA readback after each measured frame. Fixed-view timings include submission and readback and are not real-time FPS measurements.
- Integrated checks pass 144 views at requested resolution .5 and 144 at 1. They cover 2560×1600, 1280×720, 844×390 and 390×844; FOV 45/85; multiple headings; plus near/distant actors, standing/crouched eyes and pitch ±.85 at high resolution. Each enabled/disabled pair has exactly identical framebuffer bytes and actor pose state. These compact views use keyboard UI, not physical-touch qualification.
- Two-second off-screen walk comparisons preserve every sampled foot position/contact event and all seven audible footsteps. An initial fixture mistakenly compared lifetime serials across attempts; its retained diagnostic demonstrates the cumulative offset. Corrected checks compare deltas, like the existing cumulative audio counter.
- Paired half-resolution roots-behind timings: baseline medians 21.2/21.2 ms versus 19.0/19.1 ms; range-behind 16.3/16.3 versus 14.0/14.0 ms. Both omit nine off-screen draw calls. Visible-actor views retain the same draws and broadly similar timings. Full-resolution comparisons also retain identical pixels. Host timing varies; only the within-run paired comparison supports attribution to this change.
- The installed ordinary-input client exits successfully. Latest screenshot and state inspected: ready/playing at 2.567 s, released movement stopped, no error file. All four final full-resolution screenshots were visually inspected.

Artifacts: `output/under-green/actor-culling-candidate/report.json`, `runtime/report.json`, `runtime/full/report.json`, `client-final/`, and `output/under-green/current-build-soak/analyzer-regressions/verified.json`. The first report is candidate-only; the runtime reports exercise the integrated code with an instrumentation toggle for comparison.

## Sustained integrated result

The five-minute software production-loop run in `output/under-green/actor-culling-candidate/soak/` passes every stability and route-contract check but **fails the unchanged frame-rate budget**. Ready time is 1,258 ms; warmed average is 28.73 submissions/s, with a slowest 30-second window of 23.18 (210.6–240.6 seconds), below 24. RAF p95 is 16.7 ms. First-use windows range from 29.08 to 31.23 submissions/s, but this is not cold-cache qualification. The software scene adapts to 480×300 beneath the requested maximum; native HUD remains separate.

All four routes match their independently verified outcome, position, water hits and elapsed time. Resources plateau at 290 geometries, 56 textures and 21 programs; all 16 audio voices remain allocated; post-GC heap changes by −582,192 bytes; the queue remains bounded and no context/page errors occur. The terminal runner's `passed` means stability, not frame-budget acceptance: the analyzer correctly exits 1 for the performance failure. The final gameplay capture was inspected.

The source manifest captured during this run differs at completion only in concurrent Level 1 `game.js` and `index.html` work. No Under the Green runtime file changed during measurement. This manifest does not prove prelaunch or asset-cache identity. The earlier baseline manifest likewise records unrelated concurrent chapter changes; those edits were preserved.

Keep the verified off-screen optimization, but do not attribute the entire difference between separate soak averages to it: the paired fixed-view comparisons establish its bounded benefit, while host/workload variability remains. The next performance investigation should correlate completed-frame cost with route position, view and draw/triangle workload inside the failing window before choosing another optimization. Do not lower the budget, reduce scenery indiscriminately, or repeatedly rerun an unchanged workload looking for a pass.

Remaining scope includes other representative sustained workloads, cold/slow loading, physical mobile/integrated-GPU devices, longer thermal sessions and human comprehension, fear, enjoyment and listening. None is established by these automated checks.
