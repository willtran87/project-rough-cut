# Final Cut — rear engine housing and open cab footwell

FC18/FC23/FC58 progress. The full 72-item goal remains incomplete.

## Implemented

- Replaced the full-width engine box beneath Joe's legs with a rear engine compartment and two narrow hydraulic side housings. Updated the authoritative `RIG_BODY` dimensions used by contact and rendering together. The frame, wheel and cutter dimensions are unchanged.
- Added chamfered green/cream sheet-metal forms, separate hood lids, hinges/catches, recessed rear radiator fins and side ventilation, removable service panels, corner fasteners, lower rub rails and front hydraulic mounting plates. Four merged indexed vertex-color meshes, 1,012 triangles, one shared Lambert material, no new textures/lights/render targets or animation clocks. Details stay within each owning contact envelope.
- Replaced the thick seat block with a shallow tilted cushion on a narrow pedestal; moved the seat back 6 cm rearward. The old seat intersected 1,518 sampled leg vertices. The actual posed boots remain about 10.8 mm above the existing floor; their IK targets were not moved.
- A first visual inspection exposed coplanar panel layers. Recessed the support surfaces and separated the relief before final verification. Final close views show the ventilation and panel borders without that flicker pattern.

## Evidence

`node tools/verify-final-cut-bodywork.cjs` and `--software` pass. Browser-only source instrumentation examines the shipped skin and rendered meshes; it adds no production debug API.

- Five seated actions (cutting, lever setting, checking, left/right steering), a live physical collapse, actual reload, and reduced-motion collapse.
- 4,870 actual leg skin vertices per pose. Separating bounds place all their triangles at least 0.35933 m from the rear/side housing volumes. This is a separation from the nearest housing, not a claim about all cab components.
- Exact triangle/box tests check all 18,970 visible skinned actor triangles against each of the three rendered seat pieces, including their real transforms. No intersections in the eight tested poses on either renderer run.
- Maximum rendered bodywork/contact-envelope excess is floating-point noise: 2.39e-8 m. Whole-rig rendered geometry restores with zero measured displacement after actual pause/reload.
- Repeated warmed camera sweeps keep geometry/texture counts stable. Four new bodywork geometries are reported. This resource check does not establish a frame-time budget or sustained FPS.
- High-resolution 2560×1600 rear, front, footwell and collapse views; 1280×720, 844×390 and 390×844 side views. Portrait naturally crops the free-look close view; controls and captions remain in the viewport.

Regressions pass: `verify-final-cut-rig.mjs` (eight groups, including 2,000 contact samples and captures at four frame rates); `verify-final-cut-rig-browser.cjs` (141 audited objects at eight poses); `verify-final-cut.mjs` (13 groups and seven complete simulation routes); `verify-final-cut-acting.cjs` (seated actions, full phase cycle, dismount continuity and pause/reload); `verify-final-cut-boarding.cjs` (one-actor transition); `verify-final-cut-hydraulics.cjs` (27 actual mechanism poses/eight wall heights, live deployment/collapse and restoration).

The final installed web-game client completed two ordinary input iterations. Its latest screenshot and text state were inspected: playing at 6.52 seconds, 90 draws / 68,404 triangles / 48 geometries / 17 textures in the mostly rig-free arrival view, no error artifacts. These arrival counts do not measure the close bodywork's drawing cost.

Two software attempts ended with localhost connection refusals in Playwright route.fetch during concurrent interception. The shared listener and HTTP 200 response were verified; no server was replaced. The verifier now instruments the exact local scene source directly, avoiding that redundant HTTP fetch. Completed software runs have no browser errors. A reduced-motion screenshot initially showed the safe checkpoint wall after reload; the verifier now repositions only its diagnostic camera after proving unchanged rig geometry, and the corrected shot shows the actual collapsed rig.

The uninterrupted Original-round browser route also passed (`verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/bodywork/route`): 134.8606 seconds, zero captures/balls/browser errors, nine screenshots. Only a completed-result fixture is used before selecting Replay; the subsequent controller run earns every crossing, pump, bell, physical trap and road escape through normal inputs.

Artifacts: `output/final-cut/bodywork/{hardware,software,client-final,route}/`, plus the current contact, acting, boarding and hydraulic reports.

## Remaining scope

These checks prove the tested seated/collapsed clearances, not collision-free boarding or dismount trajectories. Running-board and ground foot plants, suspension, fingers, steering-column/lever mounting polish, wheel/hub/chassis detail and the complete animation package remain open. Broader environment composition, supported-device performance, complete campaign/lifecycle acceptance and unfamiliar-player fun/fear/listening checks also remain open. Do not mark FC18 or FC58 complete from this pass.
