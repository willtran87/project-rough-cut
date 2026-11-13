# Under the Green — sustained local performance

This pass advances review items 40, 41 and 43 with repeatable real-time measurement. The renderer met the local targets without further runtime tuning. The full 44-item objective remains active; this report does not qualify physical phones, integrated GPUs, extended thermal sessions or human experience.

## Work delivered

- Added `tools/profile-under-green-soak.cjs`: a five-minute production-context run through walking, wet, sprint and checkpoint routes, followed by another partial walking attempt. Inputs come from the existing map-aware simulation pilot and are verified against it before playback. The normal RAF loop still runs simulation, Joe, audio, rendering, UI and saves. Actors are not replaced by recorded positions during attempts.
- Added `tools/analyze-under-green-soak.cjs`: evaluates complete route outcomes, resource stability, bounded post-GC heap, audio voices, event history, telemetry limits, context health, software GPU queue and frame-rate targets. Performance and stability results are reported separately and both are enforced.
- Added `design/under-green-performance-budget.md` with the environment, workload, targets, thresholds, reproduction commands and explicit qualification limits.
- The existing pilot accepts an optional input-tape collector. Existing traversal behavior is preserved; tape replay matches the simulation's completion and position within 1 mm.

## Method and results

Both runs used a 1280×720 viewport, production `preserveDrawingBuffer:false`, real-time updates and opted-in bounded local telemetry. They ran sequentially, separately from other browser suites. Each lasted approximately 300 seconds and completed all four scenario types without water hits or outcome divergence. Every 30 seconds, the runner collected renderer/audio state and JavaScript heap after explicit GC. GC sampling gaps were excluded from RAF statistics.

| Measurement | RTX 3090 / ANGLE D3D11 | SwiftShader fallback |
| --- | --- | --- |
| Local ready time | 1.326 s | 1.135 s |
| Warmed rendered-frame average | 59.99/s | 39.01/s |
| Warmed sampling-window range | 59.94–60.02/s | 33.16–42.74/s |
| RAF p95 / p99 | 16.7 / 16.8 ms | 16.7 / 16.8 ms |
| Scene buffer | 1280×720 | Adapted from 960×540 to 640×360 |
| Post-GC warmed heap range | 14.55–15.58 MiB | 14.53–15.98 MiB |
| Final minus first warmed heap | −0.51 MiB | −0.36 MiB |
| Warmed renderer resources | 278 geometries, 55 textures, 21 programs | Same counts |
| Audio voices | 9 throughout | 9 throughout |
| Maximum outstanding measured GPU fences | Not a hardware queue measurement | 1 |
| Final GPU drain observation | Not recorded in the first harness revision | 52.6 ms including wait/poll overhead |

All scenario outcomes, bounded-state checks and local frame-rate thresholds pass. No page errors or context losses were reported. The software ending capture was inspected: the native HUD remains sharp over the lower-resolution scene, and the outlet, flow, keeper control and destination remain distinguishable. This is one sampled view, not a new all-device art acceptance claim.

The initial hardware harness compared resource counts after only 30 seconds. It correctly recorded an increase from 267 geometries / 49 textures to 278 / 55 as later districts first entered view, but incorrectly classified these first-use uploads as a leak. The raw `hardware.json` retains that initial failed assertion. Its measurements were not discarded or rewritten. The corrected analysis starts after the first complete route (the 90-second sample); counts then remain identical through the remaining three routes and partial replay. `hardware-analysis.json` records the original runner result as false and the corrected, evidence-based acceptance as passing. The software run used the corrected rule from the outset.

Resource counts are not GPU memory bytes. Post-GC heap measures retained JavaScript memory, not transient allocation cost. RAF and submitted-frame cadence are not display latency or per-frame hardware GPU timing. Cache conditions affect the local ready times. Five minutes with four complete attempts provides repeatability evidence, not proof that every longer session is leak-free.

## Regression correction

`verify-under-green-folded.mjs` still expected the map-aware full sprint route to be captured, and required an evasion on that route. The current route completes in 50.75 seconds even with the input-tape changes reconstructed away. This is not a regression introduced by recording inputs: the existing movement/arrival behavior changed since that old expectation. The pilot also knows the whole map and phase schedule, so it is not an unfamiliar-player run.

The obsolete mandatory-capture assertion was replaced with a direct physical service-encounter boundary: walk forward into the prepared sweep and be captured; sidestep then move forward and escape without a water hit. The complete folded-route suite now passes, including wet/dry walking, sprinting, evidence, deliberate pauses, every checkpoint, pump progression and gate boundaries. The existing browser service-encounter test independently passes actual keyboard failure, sidestep escape and rear glance. This preserves the attack requirement while allowing earned clean escapes; it does not declare pursuit tension finished.

## Artifacts and remaining acceptance

Raw samples, outcomes, images and analyses live under `output/under-green/soak/`. Main evidence: `hardware.json`, `hardware-analysis.json`, `software.json`, `software-analysis.json`; the original pilot reconstruction is `pilot-before.mjs`. The standard game client completed after the profiling work: latest screenshot/state inspected, ready/playing at 5.78 seconds, first lesson crossed, zero water hits and no error artifacts. All profiling and verification processes terminated.

Continue sustained maximum-resolution and physical-device qualification, slower-storage/cold-start measurement, longer thermal/memory sessions, remaining encounter/presentation and shared-consumer work, and unfamiliar-player/headphone/touch/controller sessions. Existing automated route and capture results cannot establish fun, fear, comprehension or physical-device comfort.
