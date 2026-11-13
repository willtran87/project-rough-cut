# Rough Cut quality-reset candidate — 2026-11-06

**Presentation follow-up:** the user requested the original pixel-art flavor after this pass. The default now uses the [pixel-art restoration](pixel-art-restoration-2026-11-06.md). The sustained timing report below belongs to the preceding smooth-art candidate; it does not qualify the later art revision. Gameplay contracts remain covered by the regression rerun.

The recurring complaints are treated as unresolved player outcomes. This pass changes the underlying presentation, controls, physical routes and feedback; it does not award new fun grades from automated passes. Human sessions remain prepared for later as requested. No deployment or commit was made.

## What changed

- Ordinary play presents WebGL directly, with a small native HUD. A measured full-texture HUD experiment was slower and was replaced. The old copy path is retained for comparison.
- One effective sensitivity per device; raw look; immediate movement by default; smooth stance eye height; focus loss clears movement. The normal Controls & comfort dialog exposes independent preferences.
- The opening has a clear lane and a visible Joe observation opportunity. Ground paths are authored, collision checked and inside the course. Smaller box-shaped carts replace wide elliptical collision skirts; service cover now leaves a western passage.
- Revised carts, mower/Joe, mixed vegetation, sky, terrain/path treatment, ground contact shading, shed and drain. Static meshes are spatially partitioned. Small foliage geometry was reduced after profiling exposed a regression.
- Pitch selects a chip's ground request; charge affects loft/roll. Preview, release and flight share calculation. Impact and rest markers differ. Visible, faced targets own Use; hidden and rear targets do not steal it.
- Club anticipation/follow-through, persistent ink/lever/valve/gate/door state, actual world-space material particles, and camera-relative impact/settle audio. A single instruction priority replaces competing opening prompts.

## Evidence and limits

`tools/verify-quality.cjs` passes 16 checks, including the opening sightline, pitch/charge separation, facing/occlusion, shared Use gate, stance interpolation, single sensitivity, every authored path and course bound, cart contact sliding, instruction priority, actual mower acoustics, sampled audio output, material particles, shot-plan/rest agreement, focus loss and normal settings. Ordinary chip resting position matched the shown plan within 0.001 course units in the recorded case; this is not an exhaustive physics tolerance certification.

`tools/verify-spatial.cjs` passes 12 checks. It covers scale, raw mouse/inversion, immediate movement, optional acceleration, synthetic controller/touch, a real chip/roll, ordinary bell Use, persistence and responsive captures. `tools/verify-rebuild.cjs` passes 13 checks. `tools/verify-experience.cjs` passes its interaction/settings suite and 63 collision-driven approaches across all three variants. `tools/verify-engagement-followup.cjs` passes six groups covering both recovery choices, authoritative variant lighting, Joe's inspection/fresh-sight priority, discoveries, feedback form and real exit hold preview. The release verifier passes 90 action-scenario integrity checks with no warnings. These establish behavior, not enjoyment.

Both Standard exit routes completed with ordinary keyboard/mouse actions, all three checks and zero browser errors. The runner uses read-only route planning and deterministic time advancement; it is not an uncoached player. The current recorded shed attempt spent about 27 s exploring, 9.8 s threatened, 11.2 s hidden and 5.9 s waiting; drain about 24.5/15.1/10.1/2.9 s respectively. Neither scripted attempt entered chase. These show that the full route can be executed without forced long waits, not that pacing, pursuit challenge or human completion time is qualified.

Visual review used full-page captures at **2560×1600**, then **1280×720**, **800×600** and **844×390**. Opening, cart front/side/rear, Joe, bell, log, range, shed, drain, aim/flight, choices and settings were inspected. The installed web-game client also ran; its canvas-only screenshot omits the native DOM HUD, so it is supplemental evidence. The new scene is a coherent low-poly candidate, not a claimed final art-quality acceptance from the user.

Performance results are recorded separately in `output/quality-reset/presentation/report.json`; the full-texture and dense-foliage experiments are preserved beside it. The software renderer, host, browser, scene resolution, frame distributions, event-to-next-rAF samples and CPU submission stages are recorded. Submission timings are **not GPU execution timings**, and synthetic event-to-rAF is **not physical input-to-display latency**. The separate sustained RTX 3090 result below meets the proposed pacing gate for that configuration; broad device and physical-control qualification remain open.

## Measured presentation result

Unrecorded comparison: Windows, Intel Xeon Gold 6148 @ 2.40 GHz, Chromium 148.0.7778.96, ANGLE/Vulkan **SwiftShader software GPU**, 1280×720 viewport and 960×540 scene. No other browser suite ran concurrently. Each of six scenes has a five-second sample, after initial load; this is a short engineering comparison.

| Scene | Copy median / p95 ms | Direct + native HUD median / p95 ms |
| --- | --- | --- |
| Strafe and turn | 33.3 / 50.0 | 33.3 / 50.0 |
| Maintenance | 33.3 / 50.0 | 33.3 / 33.5 |
| Chase fixture | 33.3 / 50.0 | 33.3 / 50.0 |
| Interaction | 33.4 / 50.1 | 33.4 / 50.0 |
| Pause | 16.7 / 16.7 | 33.3 / 33.4 |
| Retry scene | 33.3 / 50.0 | 33.3 / 50.0 |

The direct path was selected for active-input responsiveness, not a claimed FPS win: synthetic event-to-next-rAF p95 was 2.8–4.8 ms versus 34.8–42.1 ms in moving scenes. Median CPU simulation was 0.6–1.1 ms, native HUD 0.4–0.5 ms and GPU composition submission about 0.1 ms; the copy path blocked around 20–29 ms median. Actual GPU execution is asynchronous and is not measured by submission time. Direct pause remains slower than copy on this software GPU, although paused-world and unchanged-HUD reuse eliminated repeated world work and texture uploads. The occasional active-scene ~50–83 ms intervals remain a reason **not** to claim the frame-budget gate is met.

An earlier dense-foliage candidate reached 50–66.6 ms median active frames. Reducing subpixel leaf geometry and culling in X as well as depth removed that regression while retaining the larger vegetation silhouettes. Its report is retained as `dense-foliage-comparison.json`. The earlier full-HUD-texture experiment is retained as `full-texture-comparison.json`.

## Sustained NVIDIA hardware result

A later Windows inventory identified an **NVIDIA GeForce RTX 3090**, driver 32.0.16.1088, in addition to the virtual monitor. Chromium was explicitly launched with `--use-angle=d3d11 --ignore-gpu-blocklist`; WebGL confirmed ANGLE/NVIDIA/Direct3D11 rather than SwiftShader. CPU/browser/viewport/scene resolution stayed as above. Command: `node tools/profile-quality.cjs --hardware --sustained`.

Five active scenes ran for 120 seconds each (ten active minutes total), plus ten seconds paused. Each scenario uses the real game loop and ordinary DOM input; actor positions and encounter pressure are held as fixtures so a long benchmark does not end in defeat. It is a rendering/simulation endurance test, not a ten-minute human play session. Two initial rAF samples per scene are excluded; first-load time is not qualified by this result.

| Scenario | Samples | Median ms | p95 ms | p99 ms | Max ms | >50 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| turn | 7200 | 16.7 | 16.7 | 16.8 | 33.3 | 0 |
| maintenance | 7201 | 16.7 | 16.8 | 16.8 | 16.8 | 0 |
| chase | 7201 | 16.7 | 16.8 | 16.8 | 16.8 | 0 |
| interaction | 7201 | 16.7 | 16.7 | 16.8 | 16.8 | 0 |
| pause | 599 | 16.7 | 16.8 | 16.8 | 16.8 | 0 |
| retry | 7202 | 16.7 | 16.7 | 16.8 | 16.8 | 0 |

**The proposed 60 Hz pacing gate passes on this named configuration.** This does not certify low-end GPUs, physical input-to-display latency, controller/touch ergonomics, speakers or player enjoyment. The software-renderer miss remains documented rather than replaced by the better hardware result. Raw report: `output/quality-reset/sustained-hardware/report.json`; its game and renderer SHA-256 hashes were checked against the candidate. An initial long-run harness attempt was aborted when its strafe scene ended in defeat; it is excluded from this result.

## Item-by-item disposition

“Implemented” describes the candidate code. “Verified” describes the cited engineering check. Player-facing acceptance is deliberately separate.

| ID | Implementation / retained behavior | Verification and remaining acceptance |
| --- | --- | --- |
| QR01 | Stage profiling for simulation, world submission, copy, native HUD and composition; full frame distributions | Recorded benchmark; GPU execution time and physical latency are not inferred from CPU submission |
| QR02 | Direct GPU + DOM HUD adopted; copy and full-texture comparison evidence retained | Same scene/input/resolution comparison; full-texture experiment rejected after regression |
| QR03 | Spatial batches, cached geometry expansion, lower-detail tiny leaves, bounded effects and paused-world reuse | Profiling-driven changes; **ten-minute 60 Hz gate passes on RTX 3090**, fails on the software path; other device coverage remains open |
| QR04 | One sensitivity per device; raw look; focus/pointer-lock handling | Raw yaw/pitch, inversion, persistence and focus-loss regressions pass; physical devices later |
| QR05 | Immediate movement/reversal/braking default; separate optional start comparison | Exact speed/stop and approach tests pass; comparative physical feel later |
| QR06 | Exponential stance eye transition independent of actor motion/aim | Monotonic settling and cart-contact checks; physical comfort later |
| QR07 | Opening art reference rebuilt with scene, character and minimal HUD together | High-resolution editorial review completed; user's art acceptance remains open |
| QR08 | Distinct cart/mower, keeper, bell/log/cabinet, foliage and exit geometry | Front/side/rear and landmark screenshots; recognition without labels later |
| QR09 | Cart rectangles and shed box hulls; filler cart skirts removed | Shared footprint, sliding, path and both retreat checks pass |
| QR10 | Foreground props moved aside; center route and practice destination framed | Starting screenshot inspected at all sizes; novice wayfinding later |
| QR11 | Cool sky/depth, subdued terrain, warm useful fixtures, soft base shading | Exposure uses actual light state; dim-display/grayscale perception still a human/device check |
| QR12 | Mipmapped/anisotropic terrain, revised path transitions, mixed vegetation and sky | Scene inspection; motion/shimmer compared separately in recorded pass |
| QR13 | Observation at (0,65), junction near tee path split, bell pocket (86,148), recovery (20,100) | Clear opening sightline and complete bell/escape mechanics; newcomer understanding later |
| QR14 | Fixed designed path centerlines replace solver-painted ground routes | All centerlines/body clearance and ±112 X bounds checked |
| QR15 | Alternate approaches at bell, maintenance and range reconverge | Paired route geometry is clear; both opening paths and both exits complete through ordinary input; human prediction of costs later |
| QR16 | Bell frames, cabinet, water tower/clubhouse, lit crossings and actual exit structures | World screenshots; independent pointing/recognition later |
| QR17 | Existing map selection uses authoritative obstacle/action/access state and consistent zone labels | Selected-exit regression and both exit runs pass; map comprehension later |
| QR18 | Western service passage, revised paths and stable objective arbitration | No painted dead-end/collision crossing in checked routes; wrong-turn observations later |
| QR19 | Real observe/lure/check/cover/recovery loop and reusable Bell encounter | Interaction/inspection/breakaway tests and complete runs; player explanation later |
| QR20 | Distinct mower/keeper, actual body-facing vision, inspection head/body pause | Inspection and fresh-sight tests; animation readability without labels later |
| QR21 | Existing causal sight/hearing/cover/evidence rules retained | Facing and inspection regressions pass; capture explanations included in later protocol |
| QR22 | Bell lure, quiet-vs-loud held stamp, prepared release and two exit commitments retained | Actual advertised timing/signals and all actions verified; tactical variety acceptance later |
| QR23 | Named recovery cover and onward relocation lanes remain physical | Both release choices block sight and clear collision; scripted wins are not chase-fun proof |
| QR24 | Real hold/noise costs, armed 18 s blackout vs ball, route/access tradeoffs | Mechanism/lighting tests pass; situational preference balance awaits players |
| QR25 | Reticle/pitch ground targeting; charge controls loft/roll | Pitch monotonicity, charge independence and input regressions pass |
| QR26 | Shared plan and flight sampler; separate impact/rest markers | Live release uses preview; final ball matches indicated rest in checked case |
| QR27 | Shared range/facing/occlusion gate and incumbent margin | Hidden/rear target cannot commit; facing target can |
| QR28 | Club/hand anticipation, release and follow-through; cancellation retained | Aim/flight capture and input tests; physical action feel later |
| QR29 | Bell/clapper, persistent ink, lever, valve, drain grille, shed door consume real state | Action tests and mechanism captures; valve/grille have no invented tactical state |
| QR30 | Specific miss/busy/access messages; one-time pickup and hold semantics retained | Shared commit gates, pickup/action tests; no repeat reward |
| QR31 | Explicit instruction owner; lesson yields to action, choice, aim or danger | Priority regression and opening single-owner check pass |
| QR32 | Small goal/resources/context, secondary map and local target bracket | Four viewport bounds and touch separation inspected |
| QR33 | Action-response contract records cue, consequence, duration and cancellation | See design/action-response-contract.md; actual state regression checks |
| QR34 | Grass/sand/wet/metal world particles and material sounds | Real particles/audio exercised; bounded pool and reduced-motion counts |
| QR35 | Mower occlusion/pan retained; ball impact/settle now camera-relative, attenuated and filtered | Actual mixer sampled without clipping in the test; headphones/speakers remain deferred |
| QR36 | Normal Controls & comfort, size setting, captions, remapping and independent toggles | Accessible dialog, persistence and responsive checks; real-device comfort later |
| QR37 | Movement → visible Joe → optional deliberate chip → check/recovery; behavior records progress | Opening sightline and actual look/shot evidence recorded; uncoached teaching acceptance later |
| QR38 | Existing immediate retry and per-device learned controls retained | Retry path exercised; physical target-device two-second qualification remains open |
| QR39 | Fixed paths remove nuisance contacts; direct valve access and distinct encounter beats retained | Scripted phase durations recorded above; human empty-travel/forced-wait judgments later |
| QR40 | Physical shed door/drain grille; known requirement and real cancelable hold | Both exits complete with ordinary input; satisfaction of finale later |
| QR41 | Existing three visible lighting/access variants retained, no extra variants layered over unaccepted core | Authoritative differences verified; further expansion stays gated by core acceptance |
| QR42 | Optional discoveries/mastery remain optional; ordinary HUD shows only essentials | Complete exits require no optional checklist; voluntary replay desire remains unclaimed |
| QR43 | Input/stance/target/trajectory/priority/path contracts extracted into small module; HUD/scene separate | New contracts tested independently; large legacy module remains an acknowledged maintenance cost |
| QR44 | Renderer consumes authoritative obstacles, light power, action/exit anchors and live state | Scale, route, footprint, lighting and mechanism checks; no skirt compensating for wrong hull |
| QR45 | New regression cases target original failures | 16 quality checks plus existing suites; route smoke tests not converted into grades |
| QR46 | Before/after files preserved; identical scripted motion comparison and separate recording flag | Four required viewports inspected; recorded timing kept apart from unrecorded pacing |
| QR47 | Four distinct novice/returning/device/audio protocols and blank log prepared | See quality-reset-playtest.md; no recruitment or participant results |
| QR48 | Implementation, regressions, visual review, pacing and acceptance tracked separately | This ledger does not mark subjective complaints resolved by test counts |

## Outstanding acceptance

The candidate is ready for the deferred tests. The modelled art, controls and feedback have been reviewed as a candidate; their quality is not silently promoted to user acceptance. Do not label all 48 player outcomes “resolved”: pacing on additional devices, physical controller/touch comfort, real listening, uncoached navigation, art preference and voluntary replay still need their stated evidence. The user's repeated negative feedback is not overridden by these engineering passes.

Useful artifacts: `output/quality-reset/regression/report.json`, `output/quality-reset/shed/route.json`, `output/quality-reset/drain/route.json`, `output/perspective/acceptance/`, `output/quality-reset/presentation/`, `output/quality-reset/sustained-hardware/report.json`, and the before/after recordings. Historical November 5 and earlier November 6 reports remain historical.
