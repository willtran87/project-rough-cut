# Software visibility work — 2026-11-07

This pass reduces CPU work in scenery visibility checks. It keeps the restored mist, ghost Joe model/sightings, pixel-art materials, geometry, software frame budget, movement and Joe navigation unchanged.

## Changes

The old solid-cover proof projected all eight corners of each candidate box, then tested those corners against every edge of a contracted cover silhouette. The new proof lifts each silhouette edge into a world-space plane once per camera update. Each box then needs only its minimum support corner for that plane. Positive clip W preserves the inequality; existing near/far-plane guards remain, with a conservative tolerance at numerical boundaries.

Each static batch also identifies which camera-frustum planes contain its whole bounding box. Its individual branches, leaves and other parts need to test only the remaining planes. A camera turn or move recomputes these masks; no delayed visibility results or GPU queries are used.

No triangles, textures, effects or shadows are removed by this pass. Only `solid-occlusion.js` and `pixel-world-props.js` change runtime behavior, with the new small `frustum-box.js` helper and an HTML cache revision.

## Verification and measurements

- Deterministic comparison against a frozen eight-corner oracle: 144,000 occlusion decisions match. Another 432,000 nested-box tests match Three's ordinary frustum test, including varying camera positions, rotations, aspect ratios and FOV.
- The isolated occlusion test approximately halves CPU time. This is a microbenchmark, not an FPS claim.
- The combined course comparison passed 23 views with identical framebuffer pixels and submitted triangles. No new shader programs appeared during movement.

The moving comparison alternates reference/optimized/optimized/reference in the same warmed SwiftShader browser, with 40 submitted frames per block. Median visibility-check CPU milliseconds:

| View | Reference 1 | Optimized 1 | Optimized 2 | Reference 2 |
| --- | ---: | ---: | ---: | ---: |
| Pond | 2.3 | 2.0 | 1.6 | 1.9 |
| Opening | 2.3 | 1.6 | 1.6 | 2.3 |
| Border | 0.8 | 0.7 | 0.7 | 0.9 |

Opening visibility work fell about 30%. Pond visibility p95 fell from 4.2/3.9 ms in reference blocks to 3.1/2.7 ms in optimized blocks. Total submitted-frame times remain dominated by software rasterization: pond medians were 82.9/83.2/66.9/67.1 ms in alternating order, with p95 around 84 ms in all four blocks. This does not demonstrate a dependable overall pond FPS gain.

Final integration checks:

- 21 full-geometry versus culled framebuffer comparisons remain pixel-exact. Seven boundary cases pass: cover behind/in front, partial overlap, near/far crossings, inside cover and looking away.
- All 15 atmosphere groups pass on hardware and SwiftShader, including visible default pond mist, world-anchored ghost Joe, opaque-wall ghost occlusion, comfort settings, course tears, replay trails, pause/map and first-event shader preparation.
- High-resolution 2560×1600, 1280×720, 800×600 and 844×390 touch views pass. Pond mist, ghost Joe and touch screenshots inspected.
- Gameplay intelligence passes nine groups, including 29 obstacle approaches, evidence-led search and actor animation continuity. Release verification passes 90 fixtures without warnings or failures.
- All 27 other existing runtime snapshots are byte-identical to task start, including the effects, ghost, Joe model/navigation, simulation, water, frame budget and preparation modules. Syntax and whitespace checks pass.
- The installed normal-play client passed three iterations: 28 units travelled, 586 scene submissions, ghost asset ready, no renderer errors/error artifacts. Final screenshot and state inspected. The local server serves revision `20261107-visibility-planes`.

The rejected backface-removal experiment reduced submitted triangles but did not produce a reliable timing gain and changed two framebuffer channels. Its diagnostic files remain under `output/software-faces-20261107`; none of that geometry filtering is in the game.

Evidence directory: `output/software-faces-20261107`. Software rasterization of exposed foliage remains a bottleneck. CPU visibility savings do not establish smooth 60 FPS or elimination of all frame spikes. Human playtests remain deferred, as requested. No commit or deployment was made.
