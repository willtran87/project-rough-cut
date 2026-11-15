# Level 1 sign construction and wear

Partial V08/V19 visual progress, preserving the full V01–V21 upgrade scope.

## Implemented

The existing15 objective/route signs now have physical panel lips, slotted corner fasteners and connected post-grain marks. One-sided junction signs have rear board joints, battens, a continuous mast, bolted wrap brackets and a foot sleeve. Two-sided station boards use an underside saddle so construction does not obscure their reverse lettering. All parts join the existing body geometry; no new scene object, texture, draw batch, animation, collision or light was introduced.

The existing960×672 nearest-filtered atlas receives small connected paint chips and fastener stains at its borders. Lettering, arrows, wording, cell dimensions and state selection retain their original code. Wear is consistent between state cells. The approach sign remains the only extra route sign visible with clear navigation disabled.

Source: `web/course-sign-craft.js`, integrated by `web/objective-cues.js`. Original source is retained at `output/level-one-sign-craft/baseline/objective-cues.js`.

## Iterations and limits

A source-lit frame candidate was rejected after the gameplay capture showed its frame falling into near-black while its existing readable face remained bright. This pass retains the original vertex-shaded Basic material for both body and face. It is construction/weathering progress, not source-lighting acceptance; integrating sign faces and frames into the wider lighting language remains open.

Rear inspection also caught a gap between the short original mast and the new battens. The final one-sided assembly extends the mast through both brackets. Two-sided signs deliberately receive no rear battens, seams or grain over their text.

## Verification

`node tools/verify-course-sign-craft.cjs` and `--software` pass:

- The original two batches, atlas size, navigation preference and15 anchors remain.
- Ordered check completion, key/valve acquisition and both exit-ready states update correctly.
- Actual keyboard Use completes the Audit Bell and updates its label.
- Pause and repeated rendering retain state and warmed resource counts.
- No browser/page/console errors.

Inspected2560×1600 front/rear gameplay captures and the reverse Audit Bell sign; its text is unobscured. Inspected the software front view,1280×720 opening and390×844 opening. The opening sign naturally falls outside the narrow phone camera at its default heading, so `--responsive` additionally captures1280/390 views aimed at that sign. The phone lettering remains readable without HUD overlap; the very close view crops part of the outer right frame naturally.

Native resource counts stay942 geometries/104 textures/98 programs before and after. Software has715 geometries/105 textures/107 programs and stays stable through state transitions. These are warmed fixture counts, not extended-play acceptance. Body geometry rises6084→16272 vertices (+3396 triangles across15 signs). With normal navigation settings only the approach range is drawn:252→1404 vertices, adding384 triangles to its existing draw.

The installed game client completed eight iterations, reached first_hole and produced no error artifact. Inspected shot-7 and state-7: player x13/progress24, travel34. Software completed-scene average88.8ms/p95124.4ms; performance remains below the60fps goal and is not accepted by this pass. Reports and screenshots are in `output/level-one-sign-craft/{before-native,after-native,after-software,client}`. All owned sessions ended normally.

## Remaining work

Broader prop materials, structural lighting/shadows, terrain/composition and the rest of the comprehensive ledger remain open. The sign family has more convincing construction, but this does not accept all V08/V19 requirements or the overall high-resolution pixel-art goal.

Follow-up2026-11-14: the opening board now has a physical reading light and Lambert face/frame, with exact-once atlas cleanup. Default forward batches are3; full optional navigation uses7. See level-one-opening-sign-light-2026-11-14.md. The original pass above remains construction evidence; its Basic-only material/count statements describe that historical version.
