# Level 1 moon source alignment

Local V10/V11/V16 progress within the full 35-item/V01–V21 scope. No full checklist item is accepted by this pass.

## Change

The visible moon was at bearing (-280,280,-720), while the physical directional source used (-20,40,10): a 75.23-degree disagreement. `course-moon-direction.js` now supplies the unchanged visible position and its proportional (-14,14,-36) shadow-camera offset. Level 1 initializes and follows the player with this same source bearing. The existing snapped shadow target, map dimensions, filtering, bias and depth range remain intact. Non-volume fallback lighting retains its previous direction. Other chapters' visible moon position is numerically unchanged.

Source intensity, ambient/hemi levels, lantern count/positions, local fixtures, cloud attenuation and nightfall logic are unchanged. This fixes directional coherence; it does not claim to solve the still largely black cover silhouettes. Front-facing Joe can remain almost entirely dark when backlit and outside practical light pools. Wider composition and actor readability remain open.

An earlier tree-spacing experiment was rejected because its matched opening/service views gave insufficient improvement. Its source and 11-view before/current evidence remain in `output/level-one-skyline-gaps`; the production woodland-composition module was restored byte-for-byte before the moon pass.

## Evidence

- Full verifier: native after85967/before3699 and software after53652/before48353 exited0. Each records45 views at2560×1600,1280×720 and390×844, including all23hedges, route views, actual movement, pause/resume, bounded warm resources and reset/rebuild. No browser errors.
- Ninety before/current pairs preserve object, obstacle,28lantern, stone, hedge-core and solid-interior inventories, camera poses and resolution. Draw/triangle differences are zero. Both software versions match full geometry and restored frames exactly.
- Native shadow verifier2282 exited0:10views, five moving-camera poses with exact cached-vs-forced-fresh shadow hashes and bounded20draw resources. Images inspected include the largely unlit close Joe; cache correctness does not prove good encounter composition.
- Direction audit at opening/crossing/range verifies zero source-bearing error and at most0.1083degrees apparent difference due to finite sky distance/viewer eye height. Actual cloud-modulated source intensities and ambient/hemi powers match baseline exactly at all three poses. Initial audit58624 incorrectly expected unmodulated0.14 and failed; corrected audit compares the actual baseline powers. Final before/current direction reports pass. Tool handles41747/87913 were lost on runtime refresh; complete reports and process absence establish terminal state, without claiming recovered exit codes.
- Installed client native17247 exited0; software84100 handle was lost on refresh, with no matching live process and complete two-burst artifacts/no error file. Final states match: first_hole,x13,progress16,clearance46.49,readytrue,errornull. Both final page images inspected. Native2492×1402; software retains its adaptive lower resolution.
- Selected opening/range, ordinary desktop hedge, portrait software hedge and Joe shadow views inspected. No new GPU buffers, materials, programs or geometry are authored. The native warm geometry difference is1036→1035; software795→795; textures118 and programs110native/122software remain bounded. This pass has no fresh isolated timing claim; full performance acceptance remains open.

Artifacts: `output/level-one-moon-alignment/`. Source snapshots and served-file hashes are recorded under `verified-source/`. Remaining work includes full opening/route composition, consistent pixel density, material and actor finish, transitions, extended play, software fidelity and performance. All35 requirements remain active.
