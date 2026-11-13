# Joe body and face rebuild — November 6, 2026

Historical asset record. The subsequent [character refinement](joe-character-refinement-2026-11-06.md) updates posture, face shaping, hands and collar. Shared model test output directories now contain the latest captures; this pass's portrait/full body and performance report remain archived in `output/joe-body-rebuild`.

The user accepted the mower but said the body and face needed substantial work. This pass replaces the earlier lofted head and tube-based clothing with an anatomical mesh foundation, refitted to Joe and the existing 17-bone pushing rig. The updated asset is integrated in the default local game and `joe-model-preview.html`.

## Changes

- Modeled eyelids, eye surfaces, lips, ears, nose and jaw replace the simpler head surface. A new generated facial albedo retains brown brows, cold eyes, stubble and restrained expression. UV landmarks are aligned to the mesh; the swept hair follows the anatomical scalp.
- Connected sweater shoulders, torso, sleeves and trouser pelvis replace overlapping tubes. The rest pose is fitted to the existing shoulder/elbow/hip/knee joints. Cloth allowance, waist shaping, knee/ankle folds and cuff boundaries give the body a more natural silhouette.
- Fine worn wool replaces the oversized knit. Both the face and wool maps are generated at 1254×1254, with exact prompts saved in `assets/enemies/joe-hd/prompts/face-albedo-v2.txt` and `wool-fine-v1.txt`.
- The shirt has a real V opening cut into the sweater, a fitted inset, separate folded collar and open neck band. Collar panels are fitted before adding thickness to avoid collapsing their two surfaces into z-fighting. Neck vertices are fitted elliptically inside the band; newly cut clothing vertices retain torso weights.
- Hand skin uses continuous native UVs instead of per-face projection. Shoes have shaped rather than rectangular soles.
- The approved mower is preserved. Exact buffer hashes for geometry, normals, UVs and indices, embedded texture hashes, material values, node transforms and wheel metadata match the pre-rebuild GLB for the deck and all four wheels. Evidence: `output/joe-body-rebuild/mower-preservation.json` and its comparison script.

The source foundation is MakeHuman's CC0 core graphical data, pinned to commit `a8bc2d54ff0ac92e78ff71431b1023eda42bf482`. The original assets, license and SHA-256 provenance are retained in `assets/enemies/joe-hd/model/anatomy`. No upstream application code was copied. See [source provenance](../assets/enemies/joe-hd/model/anatomy/README.md). The browser downloads only the derived GLB, with no external service dependency.

Walk/idle blending, grip anchors, wheel motion, gameplay movement, navigation and AI behavior remain intact. Starts still blend over 0.28 seconds, stops over 0.38 seconds, with reversible transitions and independent 3.6-second idle breathing. This pass adds no facial animation system.

## Validation

- Blender 5.1.2 background build: six mesh objects, 17 bones, 59,096 source vertices, 116,996 triangles, **zero unweighted vertices**. Runtime has 25 material primitives. Embedded-texture GLB is **13,195,284 bytes**.
- `tools/verify-joe-polish.cjs`: four groups pass, including repeated/interrupted starts and stops, grip, per-frame foot displacement, pause/duplicate rendering and reduced motion. Maximum sampled grip error is 0.000012765 m against the 0.005 m gate.
- `tools/verify-joe-model.cjs`: six groups pass in the actual game, including camera-independent geometry/heading, twelve gait phases, wheel motion, search idle and scene rebuild. No browser errors.
- `tools/verify-joe-preview.cjs`: walk/idle, pointer orbit, turntable and Face controls pass at 2560×1600, 1280×720, 844×390 and 390×844. No browser errors. Actual screenshots were inspected, including front/oblique/rear portraits, full body and compact portrait view.
- The installed web-game Playwright client completed `next-pass-onboarding.json`; its screenshot and JSON were inspected. The state reports the final 17-bone model ready with no load error. Joe is distant in this opening screenshot, so close in-game evidence comes from the separate model suite.
- Static release verification passes 90 scenarios with no warnings/failures; its 14.49 MB image inventory excludes the 13.20 MB GLB. `git diff --check` passes. The viewer suite also passes after the new GLB cache version was added.

Evidence: `output/joe-body-rebuild`, `output/joe-model/polish`, `output/joe-model/studio`, `output/joe-model/acceptance`, and `output/joe-model/performance/report.json`. The shared model test directories now represent this rebuild, not the previous asset.

## Rendering cost and remaining artistic limits

Three five-second isolated render samples per representation were taken at 1280×720 on RTX 3090/D3D11, Chromium 148, without video and with simulation held. Median frame interval is 16.7 ms for both; p95 is 16.7–16.8 ms for sprites and 16.7 ms for the model. Both first samples contain one interval over 50 ms, with 286 sprite samples versus 250 model samples across that five-second window. Subsequent samples have 301 intervals and no >50 ms intervals. The startup hitch is therefore not hidden by the median/p95 figures. The report records the final GLB hash.

The model adds 49 submitted draw calls and 233,990 submitted triangles, including shadow passes, over the sprite at sampled endpoints. Compared with the previous model, geometry increases by 55,023 triangles and GLB size by 4,430,064 bytes. These refresh-limited short samples do not qualify sustained gameplay, load-time comfort or physical mobile hardware.

This is a substantial structural rebuild, not proof of final artistic acceptance. The illustration still has a more deliberate lowered-chin expression, asymmetry and cloth-fold composition. Exact facial likeness, detailed hand anatomy and a complete facial/action animation library remain limitations. Human testing remains prepared for later as requested. No deployment or commit was performed.
