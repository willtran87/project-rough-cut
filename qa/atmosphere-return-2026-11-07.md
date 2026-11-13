# Readable atmosphere and 3D ghost Joe — 2026-11-07

The 3D course now restores five missing or hard-to-see atmospheric cues while retaining the existing pixel-art materials, movement, Joe navigation and software-renderer safeguards.

## Delivered

- Terrain-following mist chooses nearby visible cells; pond wisps receive priority within the existing 10/24-instance software/hardware pool. Zone fog density now affects opacity. Wisps remain visible with default Clear Scenery, without a forced horror surge.
- A real, depth-tested ghost Joe uses a baked pose of the existing textured Joe and mower. The asset has 5,649 triangles, one draw, a 1024-square atlas and a 708,644-byte GLB. Pixel cutouts and restrained spectral shading provide the fade; there are no additional shadows, animation mixers, collision bodies or AI agents.
- Manifestation anchors remain fixed in world space when the player turns. Placement checks authored solid footprints. Ambient sightings remain at authored course locations. Chase and map states suppress distracting sightings.
- Original course-tear art returns as restrained edge interference on the existing 256×144 feedback canvas. It does not read back the scene framebuffer or cover the central action.
- Powered floodlights receive bounded, depth-tested haze shafts (2/3 instances), and recorded runs receive terrain-grounded dashed replay trails (32/64 segments). Replay evidence remains available when decorative effects and scares are disabled.

## Preferences and normal play

`Ghost sightings` is a separate persisted checkbox under **Controls & comfort** and defaults on. `Scare flashes` still defaults off, and existing saved choices are respected. Slow manifestations and ambient ghost sightings therefore no longer depend on enabling flash effects. Course tears and brief Joe flashes require Scare flashes. Reduced Motion suppresses animated scares. Pause freezes atmosphere; the map hides scare feedback.

The existing horror director still controls event timing. A ghost is not guaranteed to appear immediately. Brief Joe flashes last 0.70–0.90 seconds in 3D; legacy 2D timing remains unchanged.

## Verification

- `verify-atmosphere-return.cjs` passes 15 groups on hardware and SwiftShader: real world geometry, fixed anchors, independent persisted settings through the actual controls UI, Reduced Motion, pause/map, zero-density evidence, pond visibility, replay trail, powered shafts, shader preparation, disposal and viewport anchoring.
- Ghost framebuffer comparison: 13,780 changed color channels in open space, zero changed channels behind an opaque wall. This tests rendered occlusion rather than just material flags.
- Default software pond mist changes 81,358 framebuffer channels, mean absolute difference 0.402. Hardware visibility also passes. These are visibility checks, not claims of aesthetic quality.
- Screenshots inspected at 2560×1600, ordinary desktop sizes and 844×390 touch. Ghost orientation/shading and mist softness were refined from the actual captures.
- `verify-ghost-lifecycle.cjs` passes failed-model fallback and dispose-before-load completion. Failed ghost loading retains the existing original-art apparition card.
- Gameplay intelligence passes nine groups, including 29 obstacle approaches, evidence-led search, non-teleporting patrol/interception and original Joe animation/LOD continuity.
- Rebuild acceptance passes 13 groups, including exact 24-unit walking, immediate braking, keyboard/touch/controller choices, map routes and saved comfort settings. Its old test harness now waits for scene preparation before sending movement; otherwise input was correctly blocked by the loading gate.
- Release verification passes 90 fixtures without warnings or failures.
- The installed normal-play client completed three iterations: 28 units travelled, 586 scene submissions, ghost asset ready, no renderer errors or error artifacts. The final screenshot and state were inspected. Syntax and whitespace checks pass.
- New materials and ghost buffers prepare behind the loading gate. The first exercised effects create no new shader programs.

## Cost and limits

All effects together have a nine-draw upper bound, with frustum culling and bounded instance pools. The new model adds approximately 692 KiB; the existing image inventory remains 55 images / 17.94 MiB. That image total does not include the GLB.

Fresh-process moving software profiles varied substantially between runs: an earlier pond median was 66.7 ms, while the late pass reached 233.4 ms (p95 250.1 ms). These results do not establish a speed improvement or smooth software rendering. The existing visible-foliage bottleneck and frame spikes remain.

A same-browser comparison alternated the task-start effect implementation and the restored effects on the same world at fixed 640×360 resolution. Each block discarded four warm-up samples and measured 16 complete synchronous GPU passes. Median milliseconds per block:

| View | Before 1 | After 1 | After 2 | Before 2 |
| --- | ---: | ---: | ---: | ---: |
| Opening | 36.7 | 34.5 | 32.2 | 33.9 |
| Border | 44.1 | 39.5 | 39.3 | 39.7 |
| Pond | 45.6 | 46.1 | 46.3 | 46.6 |

This isolates a small normal-atmosphere cost at the pond, within the observed run variation. It is a diagnostic throughput comparison, not real-play FPS, and no ghost event was active in these timing blocks. Ghost event verification separately checks the one-draw/5,649-triangle bound and shader preparation. All new effects retain the existing software frame-budget and presentation-backpressure controls.

Runtime comparison with the task-start snapshot changes only `foundation.js`, `game.js`, `index.html`, `pixel-effects.js`, `rebuild-ui.js` and `scene-3d.js`, plus the new ghost module/asset. Joe's model/navigation, world geometry, water, local-light culling, index streaming and frame-budget modules remain identical to that snapshot.

Evidence is under `output/atmosphere-return-20261107/`. Human playtesting remains prepared for later, as requested. No commit or deployment was made.
