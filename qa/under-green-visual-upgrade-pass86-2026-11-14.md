# Under the Green visual pass 86 — range landing lining

Status: local implementation and verification complete; full upgrade remains in progress. Full 53-item plan and 48-item refinement review remain active.

## Change

The west side of the middle range landing has a folded, thick metal lining panel, two bent seams, retained strap/bracket, fixed purlins, trapped earth and two tapered roots. The intact roof remains above it. The panel's minimum height is approximately 3.526 m. Existing materials are reused.

The existing range-middle lamp moves from x16.5 to x10.7 at y28.575. Its old ground mast/cantilever is replaced by a ceiling stem seated in the current solid slab. Source count, power, color and reach are unchanged. The new pool reveals the underside of the damage and creates an off-center focal point. Hazard signals, floor layout, physics and pursuit remain unchanged.

The first preview was too dark to explain the failure. Relocating the existing lamp improved the side and return view. A trial shallow earth patch beneath the panel looked pasted on and was removed. Folded seams remain. This is a local range composition improvement; repeated signals and broader range identity still require whole-scene review.

## Evidence so far

- Native `tools/verify-under-green-range-lining.cjs`: 29 before/after/state views; 1920 camera poses without intersections; 96 paired signal rays without new obstruction; identical player state and texture count. Lamp comparison allows only the intended middle-source x movement. No page/console errors.
- Native 2560x1600 lining, side-route and 390x844 lining screenshots inspected. Other checked viewports: 1280x720 and 844x390. Actual resolution is recorded per view.
- Generated sheet has finite positions/normals/UVs, closed two-face edge topology and positive signed volume. All 18 new dressing parts remain above 3.5 m. The geometry verifier also checks restored-view stability, Q, crouch, pause, reduced motion, flood and control views.
- The first native verifier ended with an obsolete unchanged-lamp assertion after its geometry/camera work. Correcting the comparison for the authorized light move produced a full passing rerun; no runtime fix was needed.

- Software verifier also passes 29 views, 1920 camera poses and 96 unblocked signal rays, with no page/console errors. Large viewport scene renders at actual960x600; native renders at2560x1600. Software side/flood screenshots inspected. These are different resolution paths, not pixel-identical renderer comparisons.
- Existing moving-clearance test (`--dry`) completes its simulated full route with1379 sampled actor frames and106 rendered geometry checks. No scenery intersections; maximum foot error2.42e-7m, no browser errors. This checks one route and does not accept every pursuit state or full-level clearance gate.
- `verify-under-green-interactions.mjs` initially failed its obsolete expectation that a retry restores the bypass. Current snapshot/readSave intentionally omit in-run progress. Updated only that test to require bypass reset, checkpoint0 and the entrance player state. All four interaction groups then pass. Runtime save/input logic was not changed.

- Installed skill gameplay client finishes12 bursts at ready/playing (0,13.192), elapsed2.5333s, checkpoint0, no error artifacts. Initial disabled Preparing click times out; subsequent action inputs complete the intro and enter play. Final gameplay screenshot inspected. This is the normal-entry smoke check; the custom district fixtures cover the actual changed area.

## Comparative frame cost

Six warm-up pairs and24 alternating GPU-fenced samples per view, with moving camera yaw. Native actual2560x1600:

| View | Median before / after ms | P95 before / after ms |
|---|---:|---:|
| Range approach |18.2 /18.7|21.1 /22.4|
| Lining close view |10.2 /10.7|12.4 /13.0|
| Range flood |14.5 /14.3|18.3 /16.3|

Native approach/close cost rises about0.5ms; flood median/tail improve in this sample. No texture increase. The visual comparison records roughly364–378 additional submitted triangles in these range fixtures, plus0–2draws, with programs211→219. This does not establish a whole-route frame budget or startup/memory acceptance.

Software actual960x600, same alternating moving-camera method:

| View | Median before / after ms | P95 before / after ms |
|---|---:|---:|
| range-approach | 218.6 / 224.7 | 273.1 / 270.4 |
| lining | 60.2 / 72.2 | 88.8 / 101.9 |
| range-flood | 222.1 / 218.4 | 274.3 / 246.7 |

The close view regresses by12.0ms (about20%); approach rises6.1ms; flood median falls3.7ms. Retain as measured art progress with an explicit performance cost. Absolute software performance remains unacceptable. Do not promote the performance gate or claim this geometry is free because it reuses textures.

Keeper control JPEGs are byte-identical before/after on both renderers. Gallery control shows a small distant illumination change (JPEG maximum channel difference7native/5software). Its final native image was inspected. Practical lighting still lacks full geometry occlusion, so this pass does not establish that light cannot travel through enclosing walls. Source occlusion and the darker east side route need broader route-level acceptance; consider fixture shielding or static occlusion before further lamp repositioning.

## Closure and remaining work

Final runtime files: `under-green-range-lining.js`, `under-green-district-enclosure.js`, `under-green-scene.js`. Snapshots and SHA256 values are in `output/under-green/visual-pass86/final-source-manifest.json`. The interaction verifier change is test-only and preserves the user-required entrance retry contract. Syntax checks pass.

All owned verification processes reached terminal results. Native first attempt failed only the outdated lamp assertion; the rerun and software run pass. The interaction test initially failed its outdated checkpoint expectation, then passed with entrance-reset assertions. Native/software budget, moving-clearance route and installed client finish successfully. No agents, CUA, image generation, commit or deployment.

No requirement status or whole-level gate is promoted. Continue the53requirements/48refinements: coherent gallery/material work, water/depth/motion, district composition, actors/presentation, matched Level1, route/responsive/comfort and performance remain broader acceptance work. This pass improves one range landmark and records its limits.

