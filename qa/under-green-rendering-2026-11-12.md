# Under the Green rendering and quality — November 12, 2026

This pass fixes a measured software-rendering queue problem and integrates the existing campaign scene-resolution preference. It does not establish performance on a physical phone or integrated GPU.

## Implemented behavior

- Ordinary software-rendered play keeps at most one GPU frame in flight. The RAF loop continues to sample input, step simulation and update UI while that frame completes. The shared `frame-wake.js` helper can submit the next scene promptly after completion; the wake never advances simulation. Presentation remains capped at 60 submissions per second.
- `software-frame-budget.js` now accepts optional slow/recovery thresholds, with the existing 60/48 ms defaults unchanged for Level 1 and Back Nine. Under the Green uses 38/26 ms, aiming near 30 rendered frames per second with polling headroom. Six cold samples, sustained evidence, cooldowns, projected upgrade cost and the existing scale floor remain in force.
- Under the Green now consumes `rough-cut.spatial.v1.resolution`. Its Controls & comfort panel exposes 50–100% scene resolution, with a visible percentage and shared-scope explanation. Changes preserve unrelated storage fields. The user setting caps automatic quality; scene resizing leaves the native HUD and controls at their original dimensions.
- The normal WebGL context uses `preserveDrawingBuffer:false`. Explicit `?test` captures retain the buffer. Full-page screenshots of ordinary gameplay remain valid. No universal speedup is attributed to this flag: fixed-view timings vary between repeated runs.
- `graphics` diagnostics report the requested resolution, software budget, pending frame and completed-frame samples. Manual `advanceTime` captures remain deterministic and do not train the automatic budget.

## Measurement and results

`tools/profile-under-green-rendering.cjs` uses a saved pre-change scene/controller in `output/under-green/rendering/baseline`. It measures 24 frames after four warmups at root, bunker and range views. Each sample includes CPU submission and actual GPU-fence completion, with timer polling overhead. Separate live samples measure RAF cadence, rendered-frame count and remaining GPU work. GPU-completed frame timings are not input latency measurements.

Available environments: local Windows Chromium with ANGLE/D3D11 on an NVIDIA RTX 3090, and ANGLE SwiftShader software rendering. Profiles run separately from other browser verification suites.

| Scenario | Observed result | Meaning |
| --- | --- | --- |
| RTX 3090, 1280×720, final fixed views | Median 6.9–7.9 ms; p95 8.0–9.0 ms | These sampled scenes fit a 16.7 ms desktop target on this GPU. Not a guarantee for every encounter or device. |
| Original software live loop, 960×540 | 240 RAF observations took 10.98 s; median RAF gap 50 ms, p95 100 ms; GPU needed another 743 ms to drain | Repeated submissions were backing up and interfering with the main loop. |
| Bounded submissions, original 60 ms budget threshold | 618 rendered frames over 29.98 s (20.6/s); completion average 47.95 ms; p95 50.8 ms | Queue bound fixes responsiveness, but full software resolution remains slow. |
| Bounded submissions, chapter 38 ms threshold | 876 rendered frames over 29.98 s (29.2/s); completion average 34.05 ms; p95 37.6 ms | One automatic change selected the middle software buffer. RAF p95 stayed 16.7 ms, with 7.6 ms remaining GPU work at the end. |
| Short repeat with the chapter threshold | 103 rendered frames over 3.98 s; two automatic changes reached 640×360 | The budget responds to changing load. This warmup-inclusive run had a 47.7 ms completion p95, so the longer sample is not a universal result. |
| Manual 75% software setting, 720×405 | Fixed-view medians roughly 28–35 ms across recorded runs | A usable quality control, with a visible resolution tradeoff. HUD remains sharp. |

Local ready times were around 1.1–1.3 seconds in these runs; they include local asset delivery and driver caching conditions. The 30-second live probe retained 268 geometry resources, 50 textures and 22 shader programs. Stable resource counts over this short interval do not prove VRAM/heap byte stability or absence of long-session leaks.

## Verification

- `verify-under-green-frame-lifecycle.cjs`: normal production context with a synthetic 120 ms GPU delay; real W input retains 3.84 m/s fixed-step movement while only one fence is outstanding. Pause freezes simulation and stops repeated scene submissions, blur clears movement, sustained contention reduces quality, and a user-selected lower resolution stays authoritative. Maximum observed outstanding fences: one. Artificial delays test lifecycle correctness, not device speed.
- `verify-under-green-render-quality.cjs`: settings persist through Under the Green, Level 1 and Back Nine; unknown fields survive; normal/test context policy is correct. Four viewport sizes verify 50%/100% rendering, unchanged player/time and identical HUD rectangles. Full-page captures cover 2560×1600, 1280×720, 844×390 and 390×844.
- `verify-software-frame-budget.cjs`: default behavior, configurable thresholds, stable middle-buffer selection, recovery and invalid configuration pass. Default consumers retain their previous thresholds.
- `verify-frame-wake.mjs`, Under the Green core simulation and the chapter controller-menu suite pass. Controller navigation includes the new setting without requiring mouse input.
- Required standard client: latest `output/under-green/render-quality/standard-client/shot-1.png` and `state-1.json` inspected. Ready/playing, 3.84 m/s, explicit capture buffer enabled, no error artifacts. The standard client uses manual stepping and is not a live frame-rate benchmark.

Inspected the high-resolution settings and lower-resolution gameplay, portrait settings/gameplay, and ordinary production-context software gameplay. Signal shapes, landing stripes and HUD remain distinguishable at reduced detail; physical-device usability still needs observation.

## Remaining acceptance

Continue physical phone/integrated-GPU qualification, full-route and long-session memory/thermal measurements, loading/compilation profiling on slower storage, and unfamiliar-player testing. GPU drain time measures queued work, not end-to-end controller/display latency. The renderer changes do not close the remaining material, camera-clearance, animation or pacing requirements.
