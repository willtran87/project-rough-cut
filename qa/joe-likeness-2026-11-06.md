# Joe likeness refinement

Implemented the request to bring Joe's hair, expression, shoulders and clothing folds closer to the original high-resolution pixel-art reference. This is a local game-model update, with editable Blender source and a regenerated GLB. No new raster generation, external source art, commit or deployment.

## Visible changes

- A lifted, continuous hair base with thirteen shallow overlapping locks follows the scalp from the forehead toward the crown. Short sides and exposed ears remain. Pixel strands follow the combed-back flow.
- Lower inner brows, modest eyelid narrowing, asymmetric mouth corners and a small sideways pull create a more deliberate stare and restrained smirk.
- The upper torso moves farther into the pushing stance, with lower forward shoulders. The rig's rest bones follow the same deformation; the wrists, feet, gait and mower contact contract remain intact.
- Broad curved folds and adjacent creases are sculpted into the subdivided garment before runtime simplification. Sleeve compression follows upper-arm/forearm axes. Waist folds vary in angle and width, trousers gain knee/ankle gathers, and a fitted continuous strip forms the knit V-neck edge.
- An authored face-to-skin mask removes the abrupt material boundary around the temples, ears and jaw. Skin fallback samples the mesh's rest coordinates rather than the clamped face UVs. The existing high-resolution generated maps, nearest magnification and stepped lighting remain in use.

This remains an interpretation of the illustration. Exact likeness, full facial animation and human artistic acceptance are not claimed. The reference still has more deliberately painted lighting and micro-detail than the dynamic model.

## Asset and invariants

- 72,705 source vertices, 142,564 triangles, 17 bones, six Blender meshes and 27 runtime material primitives.
- 14,713,492-byte GLB; SHA256 `61c314eac878bea6c71258d1fad374fd300752e009666cfd349c100b757d2d88`.
- Zero unweighted vertices. The builder refuses an unweighted export.
- Five mower/wheel nodes match the preceding GLB exactly: geometry, normals, UVs, indices, material/embedded-image hashes, transforms and wheel metadata. Evidence: `output/joe-likeness/mower-preservation.json`.
- The `FaceBlend` color attribute is explicitly exported by name. A regression check requires both 0/1 endpoints and more than 100 interpolated samples in the actual loaded GLB; this catches Blender's default material export substituting solid white vertex colors.

## Verification

- Identical-camera, lighting and idle-clock before/after portraits, profiles, full-body and mower captures under `output/joe-likeness`; final images visually inspected.
- Animation polish: five checks, including exported blend-mask data, start/stop transitions, pause, reversals, stable grip and reduced motion. Maximum sampled hand error 0.00001799 m, below the 0.005 m gate.
- Actual game model: six acceptance groups, including 12 gait samples, camera-independent heading, wheels, stationary search, viewport changes and scene rebuild.
- Viewer orbit/turntable/pose controls and screenshots at 2560×1600, 1280×720, 844×390 and 390×844. Front, oblique, profile and rear views inspected.
- Release validation: 90 action scenarios, no failures. Runtime image inventory is 14.49 MB and excludes the separately reported GLB.
- Installed web-game client onboarding uses two action bursts because its manual clock holds the initial frame while asynchronous assets prepare. The second screenshot and state are the gameplay evidence.
- GPU profile: RTX3090/D3D11 Chromium148, three isolated five-second samples per representation at 1280×720, held simulation. Median16.7ms, maximum16.8ms, zero intervals over50ms. Preparation lifecycle passed held simulation, pause/resume, failed-model fallback and cancellation/rebuild; first active model submission15.7ms. Loading preparation took3.06s with a700ms largest preparation-frame interval in that fixture. Reports: `output/joe-likeness/performance.json` and `preparation.json`. Initial loading remains distinct from active gameplay frame time; this pass does not claim stall-free loading or physical-device performance qualification.

Game movement, navigation, parallax and the rendering-preparation implementation were not changed by this pass. Human playtests remain deferred as requested.
