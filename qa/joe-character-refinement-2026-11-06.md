# Joe character refinement — November 6, 2026

The user asked to continue improving the rebuilt character. This pass refines the face, pushing posture, clothing and hands using the existing generated pixel maps. No new raster art or external source data was generated/downloaded. The original reference remains `assets/enemies/joe-hd/source_sheets/joe-hd-reference-v2.png`.

## Implemented

- Broadened the lower jaw, reduced protrusion around the lips, lowered the inner brow and added restrained mouth-corner asymmetry. Facial material now continues around the temples and cheeks; the old lateral cutoff made a straight, conspicuous skin seam.
- Moved the upper-body rest pose forward by up to 7.8 cm and down by 3.2 cm, with a 0.12-radian lowered-chin rotation. The deformation fades out above the wrists and hips. Bones and mesh share the revised rest pose, and the arm solver uses measured rest-bone lengths. Feet, hand anchors, mower and world movement rules are preserved.
- Added a fabric envelope across the chest, more sleeve allowance and broader diagonal waist folds, reducing the appearance of tightly traced pectorals.
- Rebuilt the exposed shirt as two panels with an open neckline, buttons, outward collar tips and a lower open collar band. A curved neck/chest patch closes the opening from oblique angles. Upper collar folds fit toward the neck rather than projecting too far off the chest.
- Replaced segmented constant-radius finger rods with continuous tapered curves, varied finger lengths and knuckles. Corrected thumbs to the inside of each hand, wrapping under the handle. Palms are narrower and flatter. The fingers remain rigidly assigned to the hand bones; this is not an independently animated finger rig.
- Removed obsolete tube-clothing construction that was generated then deleted during every build. The builder now fails before export if any body vertex lacks weights.
- Updated the GLB cache version. No changes to navigation, AI, movement or runtime walk/idle blend timing.

The approved mower still matches the saved pre-rebuild GLB exactly for positions, indices, normals, UVs, embedded texture hashes, material values, node transforms and wheel metadata. Report: `output/joe-character-refinement/mower-preservation.json`.

## Validation

Blender 5.1.2 produces six mesh objects, 17 bones, 64,445 source vertices, 127,660 triangles and zero unweighted vertices. Runtime has 25 material primitives. The GLB is 13,525,084 bytes, including textures: 10,664 more triangles and 329,800 more bytes than the preceding body/face rebuild.

- `node tools/verify-joe-polish.cjs`: four groups pass for repeated/interrupted start/stop, grip, bounded foot movement, pause, duplicate render, idle and reduced motion. Maximum sampled grip error is below 0.000015 m against a 0.005 m gate.
- `node tools/verify-joe-model.cjs`: six groups pass in the actual game, including camera-independent geometry/heading, twelve walk phases, wheel motion, search idle and scene rebuild. No browser errors.
- `node tools/verify-joe-preview.cjs`: viewer controls, orbit, walk/idle, turntable and Face view pass at 2560×1600, 1280×720, 844×390 and 390×844. No browser errors.
- The installed web-game Playwright client completed the onboarding action file. Screenshot and compact JSON were inspected; the final model is ready, 17 bones/127,660 triangles, with no model error. Close model visibility is covered by the separate actual-game captures.
- Static release verification passes all 90 scenarios with no warnings/failures. Its 14.49 MB image inventory excludes the GLB.
- `git diff --check` passes.

Actual front, oblique and rear close-ups, transition poses, compact portrait view and in-game orbit images were inspected. The collar opening and cheek seam were corrected through this review. Matching before/after portraits and side views use identical cameras, lights and idle clocks; the comparison script and baseline GLB are retained in `output/joe-character-refinement`. Current captures also live in `output/joe-model/polish`, `studio` and `acceptance`.

## Cost and limits

`tools/profile-joe-model.cjs` now records the maximum interval as well as percentiles so a first-use hitch cannot disappear behind a normal p95. The short RTX 3090/D3D11, Chromium 148 comparison uses three five-second samples per representation at 1280×720, without video, holding simulation to isolate rendering.

Both representations have 16.7 ms median and 16.7–16.8 ms p95 frame intervals. In the first sample, the sprite has a 416.7 ms maximum interval and the model a 1066.6 ms maximum interval. Later samples show no >50 ms intervals. This initial rendering hitch remains a limitation. The model adds 49 submitted draw calls and 255,318 submitted triangles including shadow passes over the sprite. These short, refresh-limited samples do not qualify sustained play, loading comfort or mobile hardware. The report and final asset hash are archived in `output/joe-character-refinement/performance.json`.

The character is an improved local candidate. Exact likeness and subjective style approval remain open; the face is still a fixed expression and there is no complete authored action/facial library. Human playtests remain prepared for later. No deployment or commit was performed.
