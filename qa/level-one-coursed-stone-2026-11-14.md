# Level 1 coursed-stone cover — 2026-11-14

Partial V01/V08/V09/V11 progress toward the full 35-item/V01–V21 visual upgrade. The previous drainage-ground turn was progress. A fresh 14-view route survey identified a larger visual weakness: smooth stone cover bodies with large, separately attached rounded blocks and pillow-like stones along their rims.

## Result

All six stone cover objects now have five staggered courses, 580 stones in total. Arc-length spacing keeps blocks proportionate around narrow oval ends. The constructed skin follows the original 32-sided tapered body, with small chamfered corners, thin joints, restrained three-colour variation and a fitted upper course. The existing clustered stone texture remains attached to real geometry and receives the existing lights. No glow, material map, shader family, light or animation update was added.

The original opaque body remains behind the joints. Its gameplay collision, golf-flight profile and software occluder vertices are unchanged. The skin's maximum radial offset is 33 mm and its top is 8 mm above the former core; the much larger decorative rounded blocks/rim pillows were removed. Hedges, other scenery, source intensities and all 28 symmetric path lanterns retain their previous data.

The skin is split into eight angular sectors per existing colour, then enters the regular material/spatial batches. A first three-piece aggregate was visually correct but increased submitted geometry on narrow software views; it was replaced. Sector equivalence checks prove every triangle position, normal and palette is identical to that aggregate candidate. Construction geometry falls from 56,880 triangles in the old blocks/rim decorations to 27,840 in the new skin, excluding the unchanged opaque cores.

## Verification

- `node tools/verify-course-stone-courses.mjs`: five distinct cover sizes, deterministic construction, finite attributes, a 34 mm envelope bound, and 1,600 exterior rays. Every ray hits the skin/core; 300–309 of each 320 samples hit the new stones before the core. The core closes the thin joints. Initial standalone-skin rays could look through legitimate joints at the rear of the hollow skin; the final test includes the production core and checks which surface is hit.
- `node tools/test-course-cover-flight.mjs`: existing low/high shots, closest cover, misses, narrow cover, profile sharing, rebound/contact continuity and 5,025 clearance samples pass. Simulation code was not changed.
- `tools/verify-course-stone-courses.cjs`: 15 views per renderer and baseline, including all six walls, route/oblique views, 2560×1600, 1280×720 and 390×844 viewports, actual walking, pause/resume, 12 subsequent turns with stable warm resources and rebuild. All six constructed skins return after rebuild. No browser errors.
- Native targets are 2492×1402, 1193×671 and 379×833. Software comparison fixtures fix the existing budget to 0.625 to prevent resolution changes from invalidating paired pixel comparisons. Actual installed-client runs retain the real adaptive budget (800×450 then640×360).
- Thirty matched views preserve object positions/hulls/forms/poses, all simulation obstacles, light positions/intensities, lantern data, software solid-interior vertices, camera poses and render resolutions. Final native submissions save 5,184–20,400 triangles; software saves 0–6,384. Draw counts do not increase. Native geometry resources add one spatial batch; software uses the same number of batched geometries as baseline. Textures/programs remain unchanged. These counts do not establish frame-rate acceptance.
- The installed develop-web-game client runs two real forward/lateral bursts on both renderers through `verify-presented-client.mjs --level-one --stone-courses`. Both remain first_hole and move from x−2/progress233 to x−7/progress237. Native/software page images and text states were inspected; no error files.

## Culling finding corrected by follow-up

The earlier apparent whole-scene culling errors were induced by the verifier's full-index overwrite, which left cached compaction offsets, visibility flags and pending upload ranges inconsistent. They were not established production rendering defects. The original failed diagnostic reports remain preserved for traceability.

The corrected shared helper now invalidates that metadata and performs a complete reference upload. All15baseline and15current software views match full geometry exactly, and all30restored compacted frames match their original images exactly. Both reports now record wholeWorldCullingExact:true. The regression-only threshold has been replaced with strict zero-difference assertions. See qa/level-one-culling-reference-2026-11-14.md for the reproduced test bug,128index-reference transitions and refreshed artifacts.

The two stone-only colour/depth experiments were unsuitable acceptance oracles and are not evidence of a production defect. The broad246/255software-error finding is withdrawn for these views. Software high-resolution performance, other moving/light states and full artistic acceptance remain open.

## Art limits and evidence

The water-crossing wall now reads as constructed coursed stone from near and route distances, with a quieter fitted silhouette. Unlit walls remain almost black, and the material still needs broader causal dampness/erosion variation. This pass improves a prominent repeated asset family; it does not complete route composition, colour scripting, global pixel-density consistency, software fidelity/performance, or the full visual checklist.

Artifacts: `output/level-one-coursed-stone/{before-native,after-native,before-software,after-software,client-native,client-software}`; source baselines, aggregate candidate source/reports, sector-equivalence.json, comparison.json and seven current-source snapshots with SHA-256 manifest. The initial route survey is `output/level-one-route-hierarchy/before-native`; the candidate route survey remains under `candidate-native`.
