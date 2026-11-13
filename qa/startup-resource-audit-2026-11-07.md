# Startup resource audit — November 7, 2026

User reports other graphics applications freezing while the game loads. This read-only audit confirms bursty startup work and redundant asset preparation. It does not reproduce the other application's freeze, measure device-wide utilization, or establish VRAM exhaustion/driver failure. No game behavior or assets changed.

## Method and evidence

`node tools/audit-startup-resources.cjs`: one fresh headless Chromium page, 1280×720, ANGLE D3D11 on NVIDIA RTX 3090, revision `20261107-floodlight-sync`. Diagnostic hooks are injected through Playwright response routing only. Main-thread CPU sampling and WebGL call wrappers add overhead. Browser HTTP cache is cold; OS and driver caches are not guaranteed cold. Scene timing starts at the requested course build, after initial page/asset loading. The CPU profile includes page loading and setup before that point. This is one instrumented sample, not a benchmark distribution.

Evidence: `output/startup-resource-audit-20261107/hardware.json` and `startup.cpuprofile`. An initial diagnostic injection referenced `window` inside a worker and forced the fallback builder; its timing is invalid and retained separately as `instrumentation-fallback-invalid-timing.json`. The corrected run had **137 worker trees, zero fallback trees**, and no page errors.

| Observation | Corrected run |
| --- | ---: |
| Course ready, from request | 6.50 s |
| Scene construction phase, including awaits | 5.01 s |
| Terrain construction, including yields | 1.05 s |
| Largest loading RAF gap | 316.7 ms |
| Longest loading main-thread task | 325 ms |
| Compile/upload preparation jobs | 782 ms total elapsed |
| Final static-root buffer preparation | 782 meshes / 256 ms |
| Largest static buffer submission slice | 7.1 ms |
| Final scene warmup submission | 63.8 ms |
| Subsequent GPU-fence wait | 472.4 ms |
| Compiled program variants | 55 |
| Renderer allocated geometry / texture counts | 845 / 94 |
| Cumulative bufferData payload | 62.84 MiB / 5,577 calls |
| Longest texSubImage2D call | 105.4 ms |
| JS heap used at capture | 138.12 MiB |

These phases overlap; do not add them as independent costs. Fence wait includes scheduling/polling delays and is not pure GPU execution time. WebGL call timings measure CPU submission, not asynchronous GPU execution. BufferData volume is cumulative submitted data, not measured resident VRAM.

## Findings and recommended order

1. **Loading has CPU yielding but no sustained GPU submission budget.** `render-preparation.js` compiles every material in a group together, uploads textures with a time check after each upload, and submits static geometry in 24-mesh batches. A single upload can exceed the nominal 5 ms slice. `scene-3d.js` waits for GPU completion after the final warmup; it does not pace each loading batch against completion. Prepare essential opening resources first; bound later batches by bytes/time and outstanding GPU work. Suspend optional work while the tab is hidden. Maintain an explicit ready gate for gameplay-critical resources so deferred work cannot reintroduce first-encounter stalls.

2. **Legacy/fallback artwork is still eagerly prepared during the 3D path.** 52 image load events occur before course construction, and 69 events across 54 distinct image URLs by readiness. Those 54 images represent about 316.34 MiB at RGBA8 dimensions; all load events represent 403.26 MiB if every decoded copy were separate. These are pixel-footprint estimates, not physical-memory measurements: browser decoder sharing and eviction can change residency. The PixelArt cache separately retains 17 source-image promises (98.91 MiB RGBA8 dimensions) and 57 crop canvases (50.68 MiB base pixels). The caches overlap with the image inventory and must not be added as independent memory totals. Most concretely, `scene-3d.js` pre-crops **27 legacy Joe sprite cells, 11.52 MiB of canvas pixels**, even when the real Joe model is selected. Load renderer-specific manifests and prepare fallback direction cells only when the fallback is needed; share decode ownership across consumers.

3. **The full static course is constructed and uploaded before entry.** The inventory contains roughly 976,000 triangles across unique attached geometries, including actor/effects/parallax and invisible objects; this is not the visible per-frame triangle count. About 63.7 MiB of geometry attribute/index arrays are attached at capture, excluding unreferenced LOD arrays and temporary construction copies. Merging creates colors plus preserved surface-position/surface-normal attributes, then final combined arrays, creating temporary allocation pressure. The main-thread profile attributes about 333 ms self time to static merging, 281 ms to terrain building, and 205 ms to garbage collection across the audited startup. Prebake deterministic world geometry/terrain, retain spatial chunks, and stage distant decoration uploads. Preserve collisions and navigation independently of decorative mesh residency.

4. **Joe's close model is expensive to load before he is near.** Original model: 141,248 triangles, 27 meshes, 14,590,884-byte GLB. Distant model: 22,598 triangles, 1,314,492-byte GLB. Both load before actor readiness; LOD saves later rendering work but does not eliminate the initial close-model download/decode/preparation. Prepare the distant model first and stage the close model safely before encounter distance; consider a better close mesh with texture/baked detail. Preserve face, hair, silhouette, animation, mower and pathing. This is a secondary target after scheduling and unused assets, not a reason to indiscriminately reduce art resolution.

5. **Large texture preparation remains a burst.** The ground canvas is 1536×4096: 24 MiB of base RGBA8 pixels and about 32 MiB with a full mip chain. It is rebuilt at startup. Traversed scene material textures total about 134.30 MiB under an RGBA8-plus-mips estimate; this is not measured VRAM and excludes shader-only texture references, driver allocations and some render/shadow targets. Prebake or tile the ground and measure uploads individually. Retain nearest pixel sampling and authored detail.

The software-rendering foliage/pond bottleneck is also still open according to prior paired QA. It should not be conflated with this hardware startup result. Ghost Joe is a 1.61 MiB GLB / 5,648-triangle model; current evidence does not make ghosts or mist the first optimization targets.

## Interpretation

The strongest actionable issue is concentrated preparation and avoidable duplicated work. The observed texture and geometry estimates alone do not establish an out-of-memory condition on the RTX 3090. Confirming cross-application disruption requires correlating the affected app with GPU-engine utilization, dedicated/shared memory and CPU during loading; persistent hangs would also warrant checking driver events. No such diagnosis is claimed here.

Implement batching/backpressure and renderer-specific asset loading first, then prebuilt world/terrain and staged Joe LOD preparation. Validate unchanged visuals, movement/pathing and first-use effects; compare repeated startup runs and responsiveness of the affected graphics app. No runtime fix, deployment or human playtest was performed in this audit.
