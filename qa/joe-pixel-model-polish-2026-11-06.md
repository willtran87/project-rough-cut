# Joe model polish — November 6, 2026

Historical record. The subsequent [body/face rebuild](joe-body-face-rebuild-2026-11-06.md) supersedes this asset's geometry and textures after the user accepted the mower but rejected the body and face. Walk/idle blending remains in use. Shared output test directories now contain the latest rebuild's captures.

This pass addresses the face, hair, collar, shoulders and walk/idle transitions requested after the first real 3D model. The original high-resolution Joe reference (`assets/enemies/joe-hd/source_sheets/joe-hd-reference-v2.png`) and generated face material were visually compared with the runtime model.

## Art and animation changes

- Head loft now has a narrower jaw, cheek planes, recessed eye sockets, a brow ridge and a nose profile aligned with the facial texture. Stubble, wrinkles and the original restrained expression remain in the high-resolution pixel map.
- Hair follows the actual scalp loft, with a raised swept crown, asymmetric hairline, narrow part, surface ridges and tapered sideburns. Scalp intersections found in the intermediate revision were corrected.
- The blue-gray shirt has fitted, thickened collar folds, stitching, a smaller neck opening and woven pixel detail. Subdivided panels follow the chest instead of clipping through the sweater. The weave reuses the existing generated twill texture with a material tint; no new image-generation call was needed.
- Shoulder caps were removed. Torso and sleeves are merged into one remeshed garment, with smoothed bone weights, a sloped shoulder line, consistent texture scale and reduced runtime topology. Elbow targets are closer to the body, giving a more relaxed pushing posture.
- Starts blend over 0.28 seconds; stops settle over 0.38 seconds. Speed hysteresis avoids rapid toggling near rest. Transitions can reverse from their current weight. Distance still owns the walk phase and wheel rotation. A 3.6-second breathing cycle and eased head poses soften idle behavior; Pause and duplicate renders do not advance them. Reduced motion suppresses decorative breathing.
- The model viewer adds a Face/full-body toggle, including compact portrait layout support.

The editable Blender source and GLB are rebuilt from `tools/build-joe-model.py`. Final geometry: 17 bones, 31,645 source vertices, 61,973 triangles, zero unweighted vertices, 26 runtime material primitives. Embedded-texture GLB: 8,765,220 bytes. Gameplay movement, navigation, collision, AI and parallax logic are unchanged.

## Verification

`tools/verify-joe-polish.cjs` exercises repeated starts/stops, interrupted transitions, fixed hand anchors, bounded per-frame foot movement, stationary wheel behavior, pause, duplicate renders and reduced motion. The sampled transition grip error is below 0.000024 meters against a 0.005-meter gate. This is an anchor test, not a claim of a complete foot-plant IK system.

The actual game model test passes all six groups, including camera-independent geometry/heading, all-angle captures, 12 walk phases and scene rebuild. Its clock now advances through blending before the gait samples, so it verifies a fully weighted walk rather than only clip phase metadata. The viewer test passes ordinary pointer/button interactions, turntable, Face view and controls within bounds at 2560×1600, 1280×720, 844×390 and 390×844. No browser errors were reported in these tests. The spatial integration suite passes all 12 groups (movement/release, mouse/controller/touch look, interaction, ball flight, pause and settings). The installed web-game client completes the onboarding action sequence with the final model loaded. Static release verification passes 90 scenario checks; its image-only size summary excludes the GLB. `git diff --check` passes.

Final front/oblique/rear portraits, full-body studio views, compact portrait Face view and the installed web-game client's actual gameplay screenshot were inspected. Evidence is in `output/joe-model/polish`, `output/joe-model/studio`, `output/joe-model/acceptance` and `output/joe-model/polish-client-final`. The transition video includes ordinary viewer button-driven walk/stop behavior as well as deterministic pose samples.

## Cost and limits

The final short comparison uses three five-second render samples per representation at 1280×720 on RTX 3090/D3D11, Chromium 148. Both sprite and model have 16.7 ms median and 16.7–16.8 ms p95 intervals. Both have one >50 ms interval in their first sample. The model adds 51 submitted draw calls and 123,944 submitted triangles including shadow passes over the sprite at the sampled endpoints. Compared with the first GLB, mesh triangle count increases by 27,228; draw-call count is unchanged. Evidence and final GLB hash: `output/joe-model/performance/report.json`.

These are refresh-limited, short rendering samples with held simulation. They do not qualify sustained play or physical mobile hardware. The asset remains a stylized 3D interpretation of the illustration, not an exact image match. It has no full facial rig or complete authored enemy action library. Human art/playtest acceptance remains deferred as requested. No deployment or commit was performed.
