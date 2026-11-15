# Under the Green: Joe entrance optimization — 2026-11-15

The reported one-time entrance hitch was traced to the first navigation graph construction. A separate forced-software diagnostic exposed queued GPU work and first-use rendering resources. This implementation preserves the authored visual assets and the simulation's pursuit/attack rules.

## Changes

- Build the immutable course graph and search workspace during scene loading, before Begin chapter is enabled. Reuse the stable heap, costs, predecessor storage and heuristic distances across route requests; cache gate-blocked nodes. Queue order, costs, water windows, route smoothing and evidence-based destinations are unchanged.
- Replace the debris pool's whole-scene warmup render with `under-green-render-preparation.js`. Prepare shader reflection and textures, then upload the actual meshes in bounded batches. This includes instanced debris, skins/bone textures, morph targets and initially hidden effects. Tiny draws prepare driver pipelines; all borrowed children, visibility, culling, ranges, groups, instance counts and renderer state are restored.
- Await each practical-shadow atlas lamp's GPU batch and the final first real frame before readiness. Simulation does not advance while loading. The work remains necessary but happens before play.
- Apply the existing conservative 3 m actor visibility sphere to native rendering too. Animation, pursuit, attack timing, sound and projected shadows continue independently. No mesh/texture/detail/resolution reduction was introduced.
- Build lighting diagnostics only on a stats request instead of constructing the full diagnostic object on every frame.
- Record actual render submissions in the entrance profiler and add explicit first/repeated entrance acceptance. Keep the 55 FPS native sustained floor and existing resolution/resource assertions. Correct soak startup to handle the automatically opened narrative before clicking Begin chapter.

## Behavior and visual evidence

- 800 varied route requests compared against a preserved original planner: exact routes, destinations and crossing identifiers.
- Four full dry/wet and walking/running input replays: Joe's entire state matches the original planner at every one of 16,198 simulation steps, and complete final run states match.
- 15-view framebuffer comparison: exact SHA-256 pixel equality at 2560x1600, 1280x720 and 390x844. Includes districts, water, entrance/walk/windup/sweep poses, a visible moving ghost and offscreen Joe. Offscreen draw culling changes draw work while preserving pixels. First masonry strike activates six chips without increasing geometry count (582 before/after).
- Existing soak instrumentation checks and 11 analyzer mutation cases pass.
- The older navigation test has a <=2.1 m/s assertion that conflicts with the previously requested faster unseen movement. It fails this assertion; behavior was not changed to satisfy this obsolete expectation. The original-planner equivalence checks above cover this implementation directly.

## Entrance measurements

Native D3D11, 2560x1600, FOV 85, instrumented ordinary input/RAF loop:

| Measurement | Result |
| --- | ---: |
| Original first-route frame CPU | 41.5 ms |
| Optimized first-route frame CPU | 11.5 ms |
| Repeated first-route frame CPU | 8.2 ms |
| Maximum entrance-window frame CPU | 24.9 ms |
| Longest submission gap across both attempts | 27.8 ms |
| First new submitted frame | 16.9 ms |

No buffer allocations, texture storage allocations, shader links or uniform reflection occur in the 6–10 second entrance window. Graph access during play takes below the instrument's 0.1 ms precision. Native entrance acceptance passes.

Forced SwiftShader is a separate, unresolved performance qualification. Startup submission improved from 39.1 seconds in the original diagnostic to 203 ms, with no first-use entrance allocation/reflection. However, a 1.342-second GPU presentation gap remains in the tested fallback run, so software entrance acceptance fails its unchanged 1-second maximum-gap check. Do not report software smoothness or 30/60 FPS acceptance. Preparation-time work is not counted as gameplay responsiveness. Additional separate-part and tiny scene-view preparation did not eliminate the fallback spike and was removed. The retained preparation uses the actual raster state and one-triangle batches. No fallback acceptance threshold was relaxed.

## Final verification

- Five-minute native soak and analyzer PASS: 59.89 FPS average; slowest warmed window 59.78 FPS; initial windows at least 59.85 FPS; all four routes match; 582 geometries / 81 textures / 218 programs remain stable; no errors. This sustained run preceded the last loading-only simplification; the final native entrance profile also passes.
- Final visual comparison PASS: all 15 original/candidate framebuffers remain identical after the retained loading changes. High-resolution Joe/ghost and narrow-layout captures were inspected.
- Installed gameplay client PASS with a loading allowance: 16 action bursts, final state playing/ready, player moved from y=5 to y=9.608, no errors; final gameplay capture inspected. The shorter initial test correctly stayed gated at Preparing.
- Final retained-code forced-software qualification FAILS only the maximum presentation-gap check: first new submission 203 ms, maximum gap 1.342 s. Both entrances execute, graph access is prepared, no entrance cold rendering calls occur, and there are no errors. This remains a fallback rendering limitation, not a passed freeze fix on every backend.

Artifacts are under `output/under-green/entrance-fix/`. The original audit remains `qa/under-green-entrance-optimization-audit-2026-11-14.md`. Native observations are local measurements, not promises for every GPU, cold driver cache, phone, or software rasterizer. The broader visual-upgrade goal remains paused.

Final reports: `native-release/acceptance.json`, `software-release/acceptance.json`, `hardware-soak/hardware-analysis.json`, `visuals/report.json`, `navigation.json`, `behavior.json`, and `client-ready/` under the artifact directory. All owned test browsers/jobs completed; the existing development server was preserved.
