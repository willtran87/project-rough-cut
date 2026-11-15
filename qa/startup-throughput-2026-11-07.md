# Cold startup and software rendering continuation — November 7, 2026

Cold entry is faster and has smaller main-thread stalls. Software rendering is still below the desired frame rate; this pass does not certify 60 FPS on software or physical target devices.

## Changes

- Build the original deterministic tree geometry in a module worker and transfer its typed arrays. Keep original materials, branch/needle geometry, object anchors and visibility batches. Unsupported or failed workers fall back to the original constructor; cancellation terminates outstanding work and an inactivity watchdog prevents indefinite loading.
- Consume unique static geometry arrays during merging; clone shared arrays before transformation. Yield within large merge groups instead of only between whole trees/buildings.
- Slice terrain grain, source-art painting, path grit, woodland construction and roof slates during loading. Await completion before gameplay starts and honor scene cancellation.
- React to eight sustained software frames above 60 ms instead of 80 ms. Retain the existing cooldown, slow recovery, original texture detail and 640×360 minimum internal resolution at a 1280×720 viewport. Hardware quality remains unchanged.

Movement, collision, Joe navigation/model, pixel-art sampling, water and effects modules are byte-identical to the task-start snapshot. No new image assets were added. Worker/fallback geometry hashes match exactly across all three tree forms.

## Paired cold-start measurement

Fresh Chromium pages, local server, SwiftShader at 1280×720. The baseline routes the task-start JavaScript snapshot; measurements include first completed GPU scene and real keyboard movement. These are local measurements, not population-wide guarantees.

| Metric | Before | After |
|---|---:|---:|
| First completed scene | 10.479 s | 8.514 s |
| Loading gate ready | 10.149 s | 8.201 s |
| Worst loading RAF gap | 266.6 ms | 166.7 ms |
| Longest main-thread task | 251 ms | 173 ms |
| Input travel | 47.9976 units | 47.9976 units |

First scene improved by 18.8%; worst loading gap by 37.5%. Static preparation warmed 1,134 meshes in 320 ms with a 5.1 ms maximum measured batch. Normal worker preparation constructed 137 trees without fallback.

Evidence: `output/startup-throughput-20261107/loading-and-art-software.json`. CPU profiles and intermediate experiments are in the same directory.

## Final moving-camera limits

60 actual world submissions per view, 1280×720 viewport, real RAF, deterministic camera motion. Software uses adaptive internal resolution; hardware uses full resolution and shadows.

| View | Software median | Software p95 | Software maximum | Hardware median/p95 |
|---|---:|---:|---:|---:|
| Opening | 100.1 ms | 116.7 ms | 116.8 ms | 16.7 / 16.7 ms |
| Border | 83.4 ms | 116.7 ms | 133.3 ms | 16.7 / 16.7 ms |
| Pond | 100.0 ms | 133.3 ms | 216.7 ms | 16.7 / 16.7 ms |

Software render-call CPU p95 was 0.6–0.9 ms across coalesced calls; the GPU queue remains the limiting factor. Opening adapted at samples 12 and 44, with no additional lowering of the resolution floor. Hardware RTX 3090/D3D11 had zero frames above 50 ms across 180 submissions. Software frame times vary between runs and this pass does not establish a steady-state throughput improvement.

Evidence: `output/startup-throughput-20261107/verified/after-{software,hardware}-moving.json`.

A subsequent task-start baseline run measured 83.3 / 99.9 / 83.3 ms medians for opening / border / pond, with 99.9 / 116.8 / 116.6 ms maxima. The final candidate was better at the border but worse in the other two views in these fresh-process samples. Treat that mixed result and the pond spike as an open performance issue, not an improvement claim. The baseline reached its first resolution reduction at opening sample 57; the new policy reached it at sample 12. Baseline evidence: `output/startup-throughput-20261107/before-software-moving.json`.

## Verification

- `verify-tree-preparation.cjs`: exact transferred/fallback vertex, index, UV, normal, tint and transform hashes; three tree forms; unavailable/failing worker and disposal.
- `verify-software-loading.cjs --software`: paired startup, matching object bounds/forms/anchors and Joe geometry, real input travel, no browser errors.
- `verify-software-frame-budget.cjs`: warmup exclusion, sustained load, cooldown, floor, slow recovery, isolated spikes and invalid samples.
- `verify-render-preparation.cjs`: simulation stays held while loading; primary and fallback first active submits 15.1 and 13.3 ms; no errors.
- `verify-visibility-culling.cjs`: all eight camera views have zero changed pixels against full geometry at matched resolution.
- `verify-gameplay-intelligence.cjs`: interception, evidence-led search, 29 clearance approaches, patrol, recovery, exit choices, aim feedback and Joe LOD/fallback pass.
- `verify-pixel-effects.cjs --software`: world-space/depth behavior, comfort settings, pause, simulation invariance, effect budgets and lifecycle pass.
- `verify-visual-polish.cjs` on hardware/software: water/wind/contact effects and 2560×1600, 1280×720, 800×600 and 844×390 touch layouts pass. Opening, water, touch and normal-play captures inspected.
- Installed development-skill Playwright client: three normal sequences, 28 units travelled, screenshot/state inspected, no error artifact.
- JavaScript syntax and whitespace checks pass; release validation retains 90 fixtures and 55 runtime images / 17.94 MiB.

## Rejected experiments and remaining work

Depth prepass increased software rendering cost. Nearest mip sampling and bounded point-light shader work had negligible/variable benefit. An 8 ms fence polling timer gave no reliable improvement over RAF. Sampling every preallocated compositor target increased loading time without reliably removing a resolution-switch spike. None of these experiments remains in runtime code.

Remaining issues include software GPU throughput, occasional moving-frame spikes and cold tasks above 100 ms. The original art and effects remain intact; reducing them is not presented as a completed fix. Human playtesting and physical-device qualification remain prepared for later as requested. No deployment was performed.
