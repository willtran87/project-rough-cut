# Under the Green pass 89: continuous opaque wall occluders

Scope: conservative software rendering optimization supporting the existing visual/performance requirements. The complete 53-item plan, 48 refinement items and seven release gates remain in scope. No artistic category or whole-level gate is accepted by this pass.

## Change

The camera and fixed-light visibility checks previously received 334 individually inset wall pieces. Adjacent physical wall pieces consequently had artificial gaps in their occluders, and the bounded camera selection could spend several of its 24 slots on fragments of one wall.

`web/under-green-wall-occluders.js` merges only overlapping or exactly touching boxes with identical cross-sections on the other two axes. It cannot bridge a physical gap, flatten an L shape, or fill the keeper-room recesses. The 5mm interior inset happens after merging. Inputs are cloned and remain unchanged.

`web/under-green-scene.js` supplies 125 merged boxes to fixed-light occlusion and 147 to camera occlusion. Newly merged camera spans are capped at 8m; original larger pieces are preserved. This retains useful nearby coverage when another wall span crosses the near plane and is conservatively rejected. Both integrations remain software-only. Rendered geometry, collision, textures, fixed lamps, baked shadow atlas, moving actors and gameplay are unchanged.

## Completed verification

- `node tools/verify-under-green-wall-occluders.mjs`: six explicit joining/gap/recess cases. All 334 source boxes remain covered. Source-boundary partitions prove all 1,261 cells in the unrestricted output and 1,226 cells in the capped output belong to actual wall geometry. Inputs remain unchanged and all inset boxes remain nonempty.
- `node tools/verify-under-green-merged-cover.cjs` and `--software`: all 31 paired frames per renderer are pixel-identical to the saved pass-88 scene. Seven districts, six pressure times, three flood states, E pump operation, E release through gate travel, Q, crouch, pause and reduced motion. No page or shader errors.
- Viewports: 2560x1600, 1280x720, 390x844 and 844x390. Actual native desktop scene is 2560x1600; software desktop scene is 960x600. Native and software gallery images were opened and inspected.
- Syntax checks pass for the runtime helper, scene and comparison script.

- `node tools/verify-under-green-merged-cover.cjs --software --motion`: all 63 paired frames are pixel-identical across seven districts, with eight turn increments and return to the original heading, small position offsets and pitch changes. This exercises near-plane rejection and visibility restoration. No browser/shader errors. The keeper recess image was inspected.
- Fixed lamp definitions, animated levels and dynamic material counts match in all 62 ordinary paired views. The complete native practical-light configuration is unchanged after excluding independent startup bake timings. An initial strict telemetry comparison failed only because it included those timings; the corrected configuration comparison passes.

- The installed web-game client completed 12 bursts and exited successfully. Its first click timed out on the disabled Preparing button; subsequent Enter actions advanced through the opening and reached gameplay. Final state: ready, playing, position (0,13.192), elapsed 2.533 seconds, checkpoint 0, actual software target 960x540. No error artifact. The final gameplay screenshot was opened and is pixel-identical to the pass-88 client screenshot.
- Final runtime snapshots and hashes are stored in `output/under-green/visual-pass89/final-source-manifest.json`; all six hashes were revalidated after the browser/client checks.

All owned process handles are terminal. The pass is retained as a local rendering optimization. No agents, CUA, generated artwork, commit or deployment were used.

## Measured cost

`node tools/verify-under-green-merged-cover-budget.cjs --software --turning` completed successfully. Each view has six warm pairs and 24 alternating GPU-fenced samples at actual 960x600. These are provisional shared-machine measurements, not a live adaptive-resolution or minimum-hardware qualification.

| View | Before median / P95 ms | After median / P95 ms | Submitted triangles before / after |
| --- | ---: | ---: | ---: |
| Gallery | 243.7 / 278.6 | 233.1 / 265.8 | 289,873 / 275,975 |
| Crossing | 215.6 / 286.1 | 215.2 / 285.6 | 201,066 / 197,792 |
| Flooded pump | 222.8 / 281.2 | 199.1 / 256.1 | 192,905 / 181,983 |

Draw counts are unchanged at 812, 645 and 637 respectively. Static surface/light pairs fall from 2,329 to 2,241, material variants from 689 to 677, and measured shader programs from 225 to 222. Textures and native lighting behavior remain unchanged. Median time improves approximately 4.3% in the gallery and 10.6% at the pump; crossing is effectively unchanged. Absolute software frame times remain too high, so the performance gate stays pending.

Baseline source snapshots and reports are under `output/under-green/visual-pass89/`. The native path is not modified and has no new performance claim. Broader pixel-art quality, district composition, matched current Level 1 comparison, startup/memory, accessibility and whole-route acceptance remain open.
