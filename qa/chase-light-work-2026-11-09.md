# Chase software lighting and upload work — 2026-11-09

## Changes

Software-rendered static batches and instanced pine groups now use a prepared Lambert variant without point-light calculations only when conservative bounds prove that neither headlight can contribute. Ambient, hemisphere and moon lighting, fog, textures, alpha cutouts and pixel grading remain. Nearby groups immediately return to the original shader. Tree light bounds come from the actual wood/needle geometry transformed by each placement; all selected trees must be outside both lights before a group switches. Unlimited ranges retain full lighting. Hardware uses the original material path.

Reused `local-light-culling.js` for static batches and added `zero-point-light-material.js` for tree variants. Added paced warmup for the variants, deduplicated by shader/attribute layout. No runtime compilation is deferred into gameplay. Static geometry and instance buffers remain shared.

Timber matrices are cached per hurdle. Intact or settled rails write/upload nothing; an active break updates six pieces, with upload ranges retained until drawing. Reset and Reduced Motion remain correct. No rail, clipping, wet effect, vehicle detail, tree, shader-based pixel grading or resolution was removed/reduced.

Only existing rendering modules `back-nine-scene.js` and `course-pines.js` and the HTML version changed, plus the new shader helper, tests and documentation. `back-nine-sim.js` and `back-nine.js` match the task-start snapshots byte-for-byte. Pressure director, original panic, audio, Joe navigation, vehicle physics and input code were not changed.

## Measurements

Fixed 960x540 SwiftShader, sequential alternating baseline/new scenes, both running current pressure effects and geometry. Baseline snapshots in `output/chase-light-work/baseline-source/`.

| Test | Baseline | Updated |
| --- | --- | --- |
| Wet view median pairs | 44.6 / 45.3 ms | 41.9 / 42.3 ms |
| Wet p95 pairs | 50.8 / 52.0 ms | 47.5 / 45.9 ms |
| Foliage median pairs | 49.7 / 49.0 ms | 49.4 / 49.3 ms |
| Foliage p95 pairs | 53.1 / 55.5 ms | 56.4 / 56.4 ms |
| Range median pairs | 39.1 / 39.1 ms | 35.7 / 37.9 ms |
| First full moving replay median / p95 / max | 49.0 / 55.3 / 65.6 ms | 47.4 / 54.1 / 60.1 ms |
| Final moving replay median / p95 / max | 49.3 / 55.5 / 62.8 ms | 47.5 / 54.3 / 69.1 ms |

Each moving replay covers 180 frames with live simulation, pursuit, contact protections, rear-view changes, foliage and wet effects. Draw counts are unchanged (mean 92.85). Results show modest steady savings, especially wet/range views, not a consistent improvement in worst-case spikes. Foliage p95 remains mixed and the final replay's maximum is worse; host/driver scheduling and raster costs remain unresolved. No stable-60-FPS claim.

Software shader programs 17 -> 22; hardware remains 17. Both remain 34 textures, two local lights, nine voices, 32 spray slots and 72 timber pieces. Final preparation still 15 paced batches, largest 2,060,232 bytes. Fresh-browser ABBA with shader disk cache disabled: old loading 3.909/3.943 s, new 4.275/4.224 s. About 0.3 s additional software preparation is a tradeoff for avoiding first-use compilation. Before deduplicating preparation draws, new loading was 4.47–4.79 s and 17 batches; that redundant work was removed.

Discarded experiment: per-fragment point-light early exit matched images but slowed wet frames. It is not shipped; diagnostic source is under output only.

## Verification

- Seventeen static views: fifteen pixel-exact; two have one RGB pixel changed each (three channels; max channel delta 1 and 22/255). Geometry/texture selection is unchanged; these tiny shader/texel rounding differences are bounded by the test. Six moving captures in each replay are pixel-exact. Simulation states match exactly every frame.
- No new view-time GPU buffer allocations across the tour. Production boundary test stays at 22 programs/34 textures after near/far, off and unlimited lights. Selected transformed tree geometry (10,672 vertices across all forms) lies inside the conservative light bounds.
- Intact/settled timber attribute versions do not change; active break uploads six pieces; Reduced Motion gives the same settled matrices.
- Local-light unit suite: ranges/safety margin, multiple/moving/parented lights, cached selection, shader chaining, preparation and disposal.
- New pressure/alongside/shortcut simulations and all six winning routes pass. Navigation signature remains 47348588, no runtime edge rebuilds. Baseline/current simulation and input modules byte-identical.
- Software pressure browser and ram windup/audio/rendered-hull suites pass; mute, effect pools, Reduced Motion and first-use resources stable. Hardware keyboard, touch, controller, pause, checkpoints, reload, retry and garage completion pass. Hardware shader count stays 17.
- Inspected 2560x1600, 1280x720 and 844x390 screenshots. Installed develop-web-game client used after changes; no browser errors.

Evidence: `output/chase-light-work/` (comparison.json, visual-comparison.json, boundaries.json, startup.json, routes.json, screenshots and client). Further work should target visible-foliage raster costs and driver scheduling tails. Human feel tests remain prepared for later; no changes to the authored chase rhythm.
