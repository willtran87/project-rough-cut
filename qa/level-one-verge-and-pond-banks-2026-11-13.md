# Level 1 verge lighting and pond banks — partial visual upgrade

The full V01–V21 scope remains active. This pass improves V06/V10 local material response and V15 shoreline/depth presentation; it does not accept those categories wholesale.

## Implementation

- `course-verge-material.js` replaces the understory's unlit material with Lambert lighting. Upward rounded-clump normals keep overhead sources readable on both card faces. The same shading now applies to reeds, retaining their original atlas, contact deformation, wind and depth shader.
- 805 understory clumps / 1,610 cards retain their exact instance matrices. No added fill lights or emissive plant colour. Ambient remains .005 and path lanterns remain 28.
- `course-pond-bank.js` builds three low, irregular, raised banks in the existing shore footprint. The water shader uses the same analytic edge; bank geometry overlaps that cut to avoid cracks. The outer shore radius remains 1.015 of the obstacle ellipse; gameplay collisions are unchanged.
- `pixel-water.js` adds clustered shallow stones/sediment, finer world-anchored pixel steps, a dark meniscus and gradual shallow/deep colour changes. The first candidate still showed a bright green rim and was rejected. The final candidate has stronger coves and darker base water/glints, retaining the powered floodlight reflection.
- Each bank replaces 192 triangles with 512. Existing material batches are reused; no new textures or lights. One opaque water draw per pond remains.

## Evidence

- `output/level-one-verge-lighting/before/report.json`, `after/report.json`, `after-software/report.json`: actual plant geometry/materials isolated under an existing source at full/dim/off/restored power. Old unlit plants returned identical luminance at every power. New native totals were 99,876.542 / 18,194.886 / 0 / 99,876.542; software 101,699.755 / 19,358.530 / 0 / 101,699.755. This diagnostic deliberately hides other objects/lights and fog; it is evidence of source response, not a gameplay screenshot.
- All six instance buffers match before/after: 1226381349, 1368141509, 2617043193, 2166136261, 1836877341, 2295867245. Capacities remain 224/252/638/0/172/324. Ambient .005, 28 lanterns and actual keyboard movement/pause verified.
- `tools/verify-course-pond-bank.mjs`: 3,072 downward raycasts cover all three exact water cut edges with upward bank faces and no cracks. All bank vertices stay in the previous shore footprint. Wet radii range .80058–.93942 of the original ellipse.
- `output/level-one-pond-banks/before-native` is the prior water/reed baseline. `final/after-native` and `final/after-software` are the accepted candidates. The intermediate top-level `after-*` folders are superseded.
- Final browser checks exercise actual floodlight cut/restoration, repeated rendering, pause, reduced motion, reed wind, the shadow-depth shader, and 40 warm updates with stable geometry/texture/program counts and no console/page errors.
- Inspected final native approach/east/close views and ordinary desktop/portrait shore views; inspected final software approach. Viewports 2560×1600, 1280×720, 844×390 and 390×844. Native high-resolution scene 2492×1402; software uses its lower adaptive budget and does not establish native-resolution parity.
- Final `output/level-one-pond-banks/contact/{hardware,software}` checks actual mower investigation and W movement, contact-uniform pixel differences/restoration, lingering-wake expiry, reduced motion, and a legal pond-edge reed contact. Hardware reed comparison changes5,572 channels; software1,784; restoring the real contact uniforms reproduces the exact image. Actual mower travel adds three simulation-owned cut marks. Warm resource counts stay stable; all four viewport sizes render without errors.
- Installed standard web-game client ran8 action iterations into actual `first_hole` gameplay, with forward/right movement to x7/progress12/travel17. Final screenshot/state inspected; no error artifact. Its adaptive640×360 capture verifies input/start flow only, not high-resolution fidelity or the pond art. Focused browser captures above cover those.
- Syntax checks pass for all five modified runtime modules. `output/level-one-pond-banks/source-hashes.json` records the tested source versions.

## Bounded performance comparison

`output/level-one-pond-banks/budget` compares the combined original verge + pond state with this pass. Serial browser runs, 10 warm-up frames then 24 measured frames, CPU submit through GPU fence with 2ms polling. Software fixed at 960×540. These samples do not establish whole-level FPS, and other work on the shared machine can affect timings.

| Renderer/view | Before median ms | After median ms | Draws before/after |
|---|---:|---:|---:|
| Native pond | 11.5 | 11.7 | 449 / 449 |
| Native floodlight | 12.8 | 11.7 | 555 / 555 |
| Software pond | 105.7 | 102.4 | 164 / 164 |
| Software floodlight | 114.9 | 101.5 | 147 / 147 |

Software p95 remains around150ms: performance acceptance is still open. No performance improvement is claimed from these noisy bounded samples.

The standard client independently reports software completed-scene average102.89ms/p95121.4ms and fails the existing `gameplay_frame_budget` readiness gate. Input and presentation checks passing do not override that failure.

## Remaining work

Actual-contact water ripples are not implemented by this pass; the existing timed rings remain. Submerged plants, richer bank dressing, view-dependent puddles and broader lighting coherence remain open. Reed silhouettes still read as crossed cards at some angles. Whole-scene composition, character close inspection, and all other ledger requirements remain active.
