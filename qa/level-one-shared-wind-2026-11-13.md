# Level 1 shared wind response

Partial V06/V14 progress. Previous goal turn was progress: implemented and verified the sign construction pass. The full comprehensive visual goal remains active.

## Change

`course-wind.js` ties verge plants, reeds, the hanging maintenance sign and range pennant to the existing crosswind strength/direction. A small background breeze remains in calm weather. Direction changes ease through zero; a shared world-space gust pattern varies across the course. Flexible plants and cloth respond faster than the hanging sign. This is cosmetic: gameplay wind, hearing, cover, movement and navigation are unchanged.

Shelter is baked from all59 current solid footprints, for eastward and westward flow separately. A windbreak reduces movement inside its footprint and through a4m lee, fading at lateral edges. It is a bounded approximation using ground footprints, not an airflow simulation or complete building/canopy model. Tall vegetation above shelters and broader architecture exposure remain artistic/audit work.

Verge cards now have two vertical segments; reeds have three when shared wind is supplied. Their squared-height response permits curvature while UV-root vertices remain fixed. Maximum wind displacement is.08m for verge and.16m for reeds before height/exposure scaling. Existing contact response remains, and the combined displacement fits the existing.65m culling padding. Reed colour and shadow-depth shaders share the same wind uniforms/deformation. Source texture resolution, placement, plant count and materials are retained.

The pennant has a restrained traveling ripple plus a static fold/drape when reduced motion is enabled. Its bounding sphere includes.30m of deformation padding. The hanging sign responds with a slower tilt at its original suspension. Pause/repeated renders do not advance wind. Reduced motion or disabled effects set wind drive to zero and freeze its clock; body contact retains its pre-existing accessibility behavior.

## Culling and precision corrections

Software frustum culling compacts plant matrices. Wind attributes must follow each plant, so `static-instance-culling.js` now accepts an optional list of per-instance attributes to compact/restore with those matrices. Existing callers default to an empty list and keep their previous behavior. The course opts in for shelter and the two baked phase attributes.

The first runtime identity check found that baking from double-precision placements could disagree with the actual Float32 matrix translation at a narrow obstacle edge. Baking now uses the same Float32 coordinates. Final checks match the exposure function within2.97e-8 for all1610 native cards and409 currently visible software cards. A software test initially aimed at the sky and correctly found zero visible plants; the test was corrected to use the verge view before checking compaction.

## Verification

- `verify-course-wind.mjs`: shelter direction/range, multiple blockers, smooth reversal, repeated frames, pause, reduced/disabled effects and time reset pass.
- `verify-static-instance-culling.mjs`: custom shelter attributes retain stable identity through camera changes and exact restore; existing matrix/colour, padding and upload tests pass.
- `test-course-vegetation-contact.mjs`: body contact, wakes, decay, pause, teleport, reduced motion and restart still pass.
- `verify-course-wind-browser.cjs` on native/software: shader compilation, actual source/attribute integration, pause/reversal/reduced behavior and stable warmed resources pass without browser errors.28 lanterns, ambient.005 and1610 verge cards remain.
- Inspected paired2560×1600 verge views and the pond view. Bending is restrained and the ground texture/lighting remains intact. High-resolution hanging-sign inspection shows the prop remains physically attached.
- The initial pennant camera was poorly aimed. A dedicated `--props` pass aimed at its actual world center and captured normal/reduced states. It remains a dark silhouette against nearby trees; flag readability/composition is explicitly **not accepted** by this pass.
- Installed game client completed eight iterations after the final phase optimization, reached first_hole, travel34 and produced no error artifact. Final shot/state7 inspected under `final-client`. Software completed-scene average111.9ms/p95136.4ms remains below the gameplay performance target. Earlier direct-trigonometry run was100.9ms/p95115.8ms; separate launches are not a controlled speed comparison.

Artifacts: `output/level-one-wind`. Full world source snapshots for before comparisons are under `baseline`; current reports are under `after-native`/`after-software`. Native1280×720/390×844 verge and software pond captures have also been inspected. Plant shapes remain attached to their origins; HUD and source lighting remain readable at those views.

## Shader cost and unresolved performance

The final version bakes spatial sine/cosine terms once and updates six temporal coefficients once per frame, retaining the same gust equations. This removes repeated trigonometric evaluation from vegetation vertices.500 phase samples agree with the original equations within3.36e-8. The extra attributes travel with culling, and reduced/disabled wind skips deformation arithmetic. Curved geometry is retained on both renderers.

A same-scene ABBA software comparison (24 warmed samples each, fixed960×540, CPU submit through GPU fence) measured direct trigonometry versus the final phase expansion:

| View | Direct median/p95 | Expanded median/p95 |
|---|---|---|
| Verge |171.2/183.3ms|169.5/181.2ms|
| Pond |241.0/283.4ms|238.5/285.2ms|

This supports only a small median benefit, with a slightly worse pond tail. It does not solve overall software performance. Separate old-motion→curved-motion launches measured103.5→117.6ms verge and145.7→176.4ms pond before phase optimization; later standalone final timings were178.2/236.0ms. Host variability is substantial, and added geometry/deformation cost remains an open V21 concern. The earlier contended run is archived as `contended-budget.json`, not used as acceptance evidence.

All owned jobs ended normally, including final client chain37630 and paired benchmark32841. Source hashes are recorded alongside reports. No whole-level performance or complete V14 acceptance is claimed.

## Remaining scope

Tree/canopy motion, broader shelter composition, near/far movement hierarchy and the pennant's actual visibility remain open V14 work. This pass does not complete V06, V14, V21 or the full visual-upgrade ledger. No global lighting increase or additional scenery was used to make movement conspicuous.

Follow-up: the range pennant's readability gap was addressed by relocating and rebuilding the marker beside the existing east floodlight. See level-one-range-pennant-2026-11-13.md for final source-light, geometry, wind and responsive evidence. The original too-dark captures remain historical evidence; canopy motion and full V14 acceptance remain open.
