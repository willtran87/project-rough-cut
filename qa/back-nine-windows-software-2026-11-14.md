# Back Nine Windows software rendering

The new Windows WARP path passes the **60 ms median and p95 presented-frame target** in both moving stress fixtures at **960×540**, the existing maximum software resolution. The separately forced SwiftShader path still fails. This is a Windows software-mode qualification, not a claim that every software driver or machine meets the target, or that software matches native 1440p fidelity.

## Play

Run **`Play Back Nine (Software).cmd`** from the project root, or:

```powershell
node tools/play-back-nine-software.mjs
```

The launcher needs Node.js and an installed Chrome or Edge. It serves only `web/` on `127.0.0.1:4188`, opens the game with `--use-angle=d3d11-warp`, and uses a separate profile under `output/back-nine-software-profile`. It closes its server when its browser exits. It does not change installed browser files, the user's normal profile, global graphics settings, or the existing port-4187 development server. `--port` and `--browser` allow explicit alternatives. Chrome 157.0.8103.40 was tested; Edge discovery exists but was not independently qualified.

WARP is the Windows software rasterizer exposed by ANGLE's [D3D11 WARP selection](https://chromium.googlesource.com/chromium/src/+/master/ui/gl/gl_switches.cc). Runtime tests require the actual WebGL renderer to identify **Microsoft Basic Render Driver**. An accidental NVIDIA/hardware result fails the test. A web page cannot select the browser's ANGLE backend itself; the launcher makes that selection concrete and reproducible.

## Changes

- WARP skips the extra CPU triangle/sample-projection pass. The ordinary piece/frustum/solid-occluder culling remains. The GPU receives the original triangles, indices and attributes; there is no mesh simplification. SwiftShader and unrecognized software drivers retain the prior sample-coverage path.
- The frame budget now includes UI, scene updates, animation and culling before GPU completion. Previously its clock started after scene updates, hiding that CPU work. Thresholds, quality-recovery rules and resolution steps remain unchanged. Back Nine now allows another downshift after eight net over-budget frames during the cooldown, instead of forcing 24 extra slow frames at an unaffordable intermediate step. Other chapters retain the previous default policy. A deterministic 90 ms pixel-bound workload reaches the same final quality with 22 slow frames instead of 46; isolated stalls still do not lower quality and sustained headroom restores it.
- The full-browser test exposed unnecessary missing-favicon requests. An explicit empty favicon removes those errors. The updated modules have new cache keys.
- Tests now record renderer identity and a separate performance-acceptance result. `--require-budget` fails unless both median and p95 are below 60 ms. Functional success alone cannot qualify performance.

All textures, shaders, lights, fog/mist, particles, models, gameplay and existing draw distances remain. No resolution step was lowered. The qualified WARP run retained 960×540 rather than the 640×360 reached by the forced SwiftShader run.

## Paired measurement

Same loaded WARP scene, fixed **800×450**, alternating moving blocks; total includes update and GPU fence completion. The two paths produced **zero differing RGB pixels**, with identical draw counts.

| View | Extra CPU sample pass: median / p95 | Ordinary visibility culling: median / p95 | Mean scene update before → after |
| --- | --- | --- | --- |
| On foot facing Joe | 43.5 / 49.9 ms | 36.0 / 44.7 ms | 12.20 → 4.51 ms |
| Cart | 35.9 / 42.6 ms | 28.7 / 34.1 ms | 10.18 → 3.56 ms |

This is the causal comparison supporting the WARP-specific change. Absolute results from different runs below also reflect host load and browser configuration; do not attribute all their differences to the code change.

## Real application and launcher

Both stress scenes include the existing simultaneous-destruction fixture, wet ground and Joe. Each has 60 recorded warmup renders with simulation time frozen, preserving the fresh debris pool, followed by 60 moving measured frames; the established first-ten-sample exclusion remains. Warmup is retained separately in the reports, not counted as passing measured frames. These timings include UI, scene updates, drawing and GPU completion; they are not an assurance that every cold frame or whole-route simulation interval is below 60 ms.

| Run | Internal resolution | Cart median / p95 | Foot median / p95 | 60 ms gate |
| --- | --- | --- | --- | --- |
| Optimized WARP, full Chrome | 960×540 | 47.6 / 58.5 ms | 55.8 / 58.3 ms | Pass |
| Isolated launcher before transition follow-up | 960×540 | 47.6 / 51.6 ms | 49.3 / 59.3 ms | Pass |
| Final isolated launcher | 960×540 | 45.0 / 46.7 ms | 52.3 / 56.1 ms | Pass |
| Native regression | 2560×1440 | 15.5 / 16.7 ms | 18.4 / 19.5 ms | Pass |
| Forced SwiftShader | 640×360 | 91.2 / 110.8 ms | 119.9 / 143.0 ms | **Fail** |

Final launcher warmup maxima were 52.0 ms cart and 60.6 ms foot. The earlier launcher run reached 63.0/66.0 ms during warmup. The native regression used the existing unextended warmup. Software fidelity and the SwiftShader limitation remain open in the visual ledger.

## Live keyboard-input follow-up

Real RAF-driven simulation was tested separately from the deterministic stress fixtures, holding W through both the cart and on-foot views. The scene includes Joe and initially broken props; damage grace prevents the benchmark ending in defeat but simulation and pursuit continue. After three seconds of actual movement, ten seconds were recorded per view. No manual time stepping was used.

An initial live run exposed a delayed on-foot downshift: p95 was 64.4 ms, with all over-budget samples concentrated in the first 40 measured frames. This prompted the responsive downshift fix above. The final live run recorded:

| View | Frames | Travel | Completion median / p95 | Presentation-interval p95 | Final internal resolution |
| --- | --- | --- | --- | --- | --- |
| Cart | 314 | 108.85 m | 31.3 / 43.3 ms | 42.0 ms | 960×540 |
| Foot | 297 | 69.67 m | 33.4 / 42.2 ms | 42.2 ms | 800×450 |

The on-foot maximum was 61.5 ms: this passes the median/p95 target, not an every-frame guarantee. The controller still uses the original resolution steps; it does not reduce the quality floor. Separate live runs are not a controlled attribution of all timing differences. Evidence: `live-input/` and `live-input-responsive/`.

## Verification

- 32 WARP full-geometry comparisons across 16 views at each of 960×540 and 640×360: **zero changed RGB pixels**. This checks the retained culling against restored complete geometry, not cross-driver floating-point equivalence.
- 720,000 triangle/frustum checks across 100 cameras, exact restoration, original-piece distance limits, and explicit sample-pass opt-out/default behavior passed.
- Existing 150,000 sample-coverage checks, 100 compiled/reference camera comparisons, resize/restoration, and lossless index-compaction tests passed.
- WARP, native and SwiftShader functional suites passed charging/exhaustion, bounded destruction pools, stable texture/program counts, pause/resume, restart from the start, and responsive layouts without browser errors. SwiftShader functional success does not pass its budget.
- The actual launcher passed local-only file serving, MIME/HEAD handling, traversal rejection, software renderer verification, the gameplay/budget suite and shutdown. Its owned browser and temporary server were confirmed closed.
- The installed gameplay client ran for WARP and native. Presented screenshots and state were inspected. Desktop **2560×1600**, ordinary **1280×720**, and portrait **390×844** captures were opened and reviewed.
- Syntax and source-hash checks passed. Unchanged baseline coverage/lighting files and final source hashes are recorded in `final-source.json`.

## Rejected work and test corrections

Per-piece fixture-light shader grouping preserved pixels but increased submissions and did not reliably improve timing; it was reverted. SwiftShader worker-count and affinity experiments did not reach 60 ms. Settings were tested only against a private browser copy; installed assets/settings were not edited. Whole-model backface removal was rejected because Joe's meshes have open boundaries. Material-removal diagnostics were browser-only probes and are absent from production.

Early WARP runs before the retained change missed the p95 gate. Two full-browser preparation attempts timed out; tests now explicitly bring the page forward before waiting for preparation, and subsequent focused runs passed. Missing-resource assertions initially failed on favicon requests; the real page was corrected. These failed experiments remain in the evidence directory.

## Reproduce

Run GPU jobs sequentially. The actual-launcher verifier starts its own server; other tests use the existing server on port 4187.

```powershell
node tools/verify-back-nine-software-launcher.cjs output/back-nine-software-recheck
node tools/verify-back-nine-live-software.cjs output/back-nine-live-recheck
node tools/verify-back-nine-final-polish.cjs output/back-nine-warp-recheck --warp --settle-budget --require-budget
node tools/verify-back-nine-software-invariants.cjs output/back-nine-warp-images 960 540 --warp
node tools/verify-course-batch-culling.mjs
node tools/verify-raster-visibility.mjs
node tools/verify-software-frame-budget.cjs
```

Evidence: `output/back-nine-shader-specialization/`, especially `warp-culling-paired/`, `warp-optimized/`, `launcher-final/`, `launcher-responsive/`, `client-warp-transition/`, `warp-invariants-960/`, `warp-invariants-640/`, `native-final/`, `swift-final/`, and both `client-*-final/` directories. No commit or deployment was made.
