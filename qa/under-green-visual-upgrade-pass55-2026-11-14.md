# Under the Green pass 55 — damp response and pump separation

Previous goal turn: progress implementing/verifying shared timber and 53 secondary roots. This pass advances selective damp highlights and the pump's material separation. All 53 original requirements, 48 refinements and seven full-level gates remain in scope.

## Changes

- Added material-specific thin-film response to 15 existing Phong materials: masonry, bark, sediment, enamel, iron, steel and rust. Existing independent wetness maps control the response; pigment does not become relief or emission. Steel retains more dry sheen; rust and sediment remain subdued.
- Reauthored six existing vertical wetness masks as thin interrupted trails. The first candidate merely amplified the old blurred masks and produced pale capsule-like bars; that candidate is rejected. The second candidate exposed too regular a dotted pattern. Final crafted-surface highlights are concentrated using the existing world-anchored seep field, leaving quieter dry stretches between them.
- Floor and mud horizontal mask pixels remain exactly unchanged. All illustrated source pigment pixels remain exactly unchanged. Mask dimensions, texture count and image downloads remain unchanged. No additional lights, geometry, postprocessing or transparent overlays.
- Pump enamel tint changes d4d1b9→dfd9c3; exposed machine iron changes81877f→a9afa2. These are diffuse material adjustments under the existing work lamp, improving metal/enamel separation while retaining black recesses. Shared machinery controls receive the same material treatment. Lamp locations, intensity profiles, fog, camera and gameplay are unchanged.
- The finish composes with existing flood wetness and practical-light hooks before their material variants are built. Floor, water, Joe and ghost presentation retain their existing specialized finishes.

## Verification and evidence

Final native suite: `output/under-green/visual-upgrade-local/pass55-final/hardware`, 37 views at actual2560x1600, plus1280x720,390x844,844x390. Includes district views, three pump approaches, a close root view, flood, actual crouch/Q, four camera-turn views, two lamp-dip times and Reduced Motion. Camera return is pixel-exact. All370 named mesh position/index hashes and world matrices are identical before/after. Paired draw/triangle/texture counts and resolution are identical; programs150→160.

All illustrated map hashes match baseline. Floor/mud horizontal wetness hashes match baseline; the six updated vertical masks are bark/panel/sand/concrete/tile/masonry. Both baseline/current lights-out renders match exactly, showing no added emission or artificial highlight without physical sources. No page/console errors.

Inspected native before/after pump, front casting, root, crossing, keeper and turned-camera views. The final result is a restrained material improvement; pump sides still need stronger overall composition and full illustration parity is not established. Initial `pass55-damp` and intermediate `pass55-refined` screenshots are retained as rejected/intermediate candidates, not final acceptance evidence. The initial bark fixture actually faced masonry; the final fixture is correctly aimed at the gallery root pillar.

No geometry or collision changes, so this pass does not rerun the expensive whole-route geometry audit or claim new route acceptance. The unchanged370mesh evidence supports retaining pass54's dry-route/camera clearance evidence. Actual E mechanism state, complete wet-route pursuit, human playthrough and broad hazard-cycle visual acceptance remain separate open gates.

## Scope retained

V03/V04/V05/V06 and V52 advance but remain partial. Local V28/V34/V35/V36 receive refinement evidence, not whole-level acceptance. Counts remain32implemented/20in_progress/1pending; allseven gatespending. Next work: keeper narrative composition, larger wet-root/mud integration, remaining material variation and unresolved software performance. No completion, commit, deployment, deletion or agent delegation.


## Verification closure (2026-11-14)

- Final software suite also passed 37 views, identical lights-out pixels, 370 unchanged named meshes, unchanged draw/triangle/texture counts and no page/console errors. Desktop software target is 960x600 within the 2560x1600 viewport; responsive targets are recorded separately. Inspected the final software portrait pump, turned-camera and Reduced Motion images. Native desktop uses actual2560x1600.
- Installed client evidence: `output/under-green/visual-upgrade-local/pass55-client`, seven bursts, final state ready/playing at(0,8.84),elapsed1.15. Initial Preparing click timeout recovered through later menu input; process exited0. Final shot/state inspected in the implementation turn.
- Native budget report is terminal/passed at `output/under-green/visual-upgrade-local/pass55-budget/hardware/report.json`. No matching budget process remained when revisited. Software budget then ran to completion (session17174,exit0) at `output/under-green/visual-review-pass55-software-budget/report.json`.
- Alternating GPU-fenced samples,6warmup pairs/24samples per state per view. These short frozen-view comparisons do not establish whole-level performance. Native at2560x1600; software at960x600. Draws/triangles/textures unchanged; programs150to160.

| View | Native median/P95 before→after ms | Software median/P95 before→after ms |
|---|---|---|
| Gallery |14.7/16.1→14.4/16.2|195.7/241.2→198.0/235.4|
| Pump |7.4/10.2→8.4/10.0|87.6/114.2→88.1/128.0|
| Range |13.8/15.7→13.1/15.3|205.0/223.1→211.2/229.4|
| Keeper |10.1/11.5→9.2/11.0|126.3/169.7→122.9/161.4|

The pump median on native and pump/range software costs remain concerns; no general speedup or no-regression claim. Software performance remains unsuitable for the intended playable quality bar. All four pass55 runtime source hashes match the verified manifest; final copy is `pass55-source/final-runtime-hashes.json`. No outstanding owned pass55 renderer job remains. Counts and gates remain unchanged.
