# Level 1 range pennant: crafted landmark and source lighting

Partial V04/V08/V14 progress. The full comprehensive upgrade remains active.

The former dark pennant outside the range has been replaced by a constructed marker beside the existing east floodlight. A 256×128 pixel cloth texture has a broad range emblem, stitched hems, connected wear and sparse tears. Grommets, ties, collars, diagonal supports and a capped mast connect it physically to the fixture. Twelve fixed parts share one vertex-colored Lambert mesh; the cloth is the second mesh. No new light is added.

The cloth uses the shared course wind at its actual anchor, including a still draped reduced-motion pose. Its depth material shares the alpha map and deformation. The support's conservative outer radius is 0.6247m inside the existing 0.72m blocked footprint; minimum cloth height including the deformation allowance is 3.22m. Existing 28 symmetric path lanterns and ambient intensity 0.005 remain.

Final native and software runs of `node tools/verify-course-range-pennant.cjs` (add `--software`) pass. Four legal approach/reverse viewpoints, two moving cloth poses, reduced motion, outage, pause, warm resource stability and rebuild disposal are covered. Both runs verify exactly two visible meshes and exact-once disposal of cloth geometry, map and depth material.

Isolated cloth lighting uses the actual existing east light and material. Native on/off/on RGB totals are 1,392,732 / 42,231 / 1,392,732; software totals are 1,394,685 / 44,648 / 1,394,685. The material has zero emissive contribution. This proves local light response, not whole-level shadow or lighting acceptance.

Inspected final 2560×1600 approach and close views, ordinary 1280×720, phone 390×844 and software approach. The marker is now visible from the checked approaches and the cloth detail reads at close range. The narrow view is deliberately aimed at the marker. Warm native resources are 976 geometries / 105 textures / 99 programs; software 760 / 105 / 108. Counts are bounded during the fixture, not proof of full-play resource stability or frame rate.

Installed web-game client completed eight bursts after batching (session 8156 terminal). Shot/state 7 shows actual first_hole gameplay at x13/progress24, travel34, no error artifact. The adaptive software screenshot is input/startup evidence, not the high-resolution art reference. Final targeted sessions 89926/23338 are terminal; the old session90270 handle was missing when revalidated.

Evidence: `output/level-one-range-pennant/{before-native,after-native,after-software,client}`. Current source hashes accompany these artifacts. Broader composition, canopy motion, sign lighting and whole-level performance remain open.
