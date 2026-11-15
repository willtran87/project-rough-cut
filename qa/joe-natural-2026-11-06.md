# Joe: softer hair, face and clothing

Implemented on the actual skinned 3D game model, using the existing high-resolution pixel material maps. Editable Blender source and the runtime GLB are regenerated. No new raster assets or external sources were needed.

## Changes

- Replaced thirteen separate raised hair strips with one continuous scalp-following mesh. Ten irregular flow guides produce shallow swept relief, continuous strand UVs avoid per-strip texture resets, and an off-center forelock breaks up the uniform forehead edge.
- Reduced jaw widening, brow projection, eyelid lowering and mouth-corner offsets for softer facial planes while retaining the intent expression and slight asymmetry.
- Reduced upper-sleeve padding and lowered/rounded shoulder caps. Broader, spatially tapered waist creases and localized inner-elbow gathering replace sharp full-width torso folds and annular sleeve ridges. Retained some fold depth after the first comparison looked too smooth.
- Retained nearest-filtered pixel materials, face/skin blending, real 3D silhouette, gait, hand contact, wheels, movement, navigation, parallax and rendering preparation. Mower geometry and materials compare exactly with the pre-change GLB.

## Asset

- 71,551 source vertices, 141,248 triangles, 17 bones, six Blender mesh objects, 27 runtime material primitives; zero unweighted vertices.
- GLB: 14,590,884 bytes; SHA256 `45600346a5542a8f598a0d4651424c948b64b9c48aea1ae28c996d7623523074`.
- 1,154 fewer vertices, 1,316 fewer triangles and 122,608 fewer bytes than the preceding asset.
- Before/after screenshots use identical camera, lighting and idle clocks: `output/joe-natural/after-portrait.png`, `after-profile.png`, `after-full.png`, and corresponding `before-*` captures.

## Verification

- Five animation-polish checks passed: exported FaceBlend data, repeated start/stop transitions, pause, rapid reversals, stable grip and reduced motion. Maximum sampled hand error: 0.000017735 m (5 mm gate).
- Six game-model acceptance groups passed, including 12 gait samples, camera-independent geometry, wheel motion, planted search, viewport changes and scene rebuild.
- Viewer controls passed at 2560x1600, 1280x720, 844x390 and 390x844. Close-up, side, rear and in-game renders were inspected.
- Mower preservation: exact comparison of all five mower/wheel nodes, including geometry/index/normal/UV data, embedded textures, material values, transforms and wheel metadata. Report: `output/joe-natural/mower-preservation.json`.
- Release validation: all 90 action scenarios passed; no warnings or failures. Runtime image inventory remains 14.49 MB, excluding the separately reported GLB.

- Installed web-game client completed two onboarding action bursts. Final screenshot and state show the rendered course, 14 m player travel, ready assets and no error log. The first manual-clock capture remains held during preparation; the second is the gameplay evidence.
- Preparation lifecycle passed held simulation, pause/resume, failed-model fallback and cancellation/rebuild. First active model submission: 24.8 ms. Initial preparation took 3.10 s, with a 666.7 ms largest preparation-frame interval and 140.9 ms warm-up submission. This is not a claim of stall-free loading.
- Isolated GPU render profile (RTX 3090 / D3D11, Chromium 148, 1280x720): three five-second samples per representation; all model samples median 16.7 ms, maximum 16.8 ms, zero intervals over 50 ms. This is a short render-cost fixture, not sustained gameplay or physical-mobile qualification. Reports archived in `output/joe-natural/performance.json` and `preparation.json`.
- JavaScript syntax and tracked whitespace checks passed. Build changes are recorded against the pre-turn builder in `output/joe-natural/model-changes.diff`.

This is a softer interpretation of the original illustration, not an exact likeness. Painted lighting, hairline detail and cloth design in the reference still exceed this dynamic model; artistic acceptance and human playtesting remain outstanding. Human tests remain prepared for later as requested.
