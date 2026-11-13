# Final Cut — opening a view of the swale

Reworked the bank and final rough so the low swale can be seen from the existing protected overlook. This advances FC04/09/41/57. The distant basin remains a small part of the arrival view; unfamiliar-player recognition and the full dramatic composition are not proven.

## Authored changes

- The bank retains the same solid footprint, with an 8 m western section at 2.2 m high and an 8 m eastern section at 1.25 m. The west section still screens the longer approach; the east section permits a standing view over it and no longer hides a standing player under the existing sight rule. The unchanged three refuge islands remain the dependable shelters.
- The final central rough patch is 8 m wide, centered at x = -2, instead of 13 m centered at 0. Its wider eastern gap exposes the swale. Art, crouch concealment and mowing all use the shared sector dimensions. The sector ID remains `rough-2-1`, so existing saved cuts remain valid. The first and middle teaching strips are unchanged.
- Moved the bank notice wholly onto the tall western wall, clearing the new view. Split the wall stone and cap into adjacent volumes, removing their coincident faces while retaining the exact collision height.
- The dry swale has an irregular worn-clay basin around the existing wheel ruts. The actual saturation uniform still drives darkening and rising water; dry coloration does not prepare the trap or alter its trigger.
- Added a roof-level BUNKER marking within the existing static sign atlas. The first placement was obscured by the descending parapet and was rejected. The final larger lettering sits toward the back of the roof, where it is visible from the overlook. Ground-level shelter signage remains available on approach.

No overlook dimensions, camera controls, safe-start timing, movement, route waypoints, cutting footprint, pump/lure action or victory conditions were changed.

## Visibility evidence

`verify-final-cut-overview.cjs` probes actual rendered meshes from the actual camera. The pre-change baseline exposed **0 of 36** near-ground swale targets from the direct arrival position. Current D3D11 exposes **19/36**, and SwiftShader **18/36**, all within the arrival view at each tested aspect ratio. From the rear of the shared deck, both expose **14/36**; walking forward reaches the same observation point as direct entry. From beside the low bank, **32/36** are exposed. From behind the tall west bank, **0/36** are exposed, consistent with its retained screening role.

The bunker roof marking, pump sign, public-road sign and swale label have unobstructed center targets from arrival. At 2560 × 1600 all four centers are also inside the view. Narrow portrait framing requires free look to see the offscreen side landmarks. These ray samples verify obstruction/framing, not the legibility of every letter or a player's understanding of the solution.

Downward rays against the actual wall meshes verify 2.2 m and 1.25 m tops, including the cap. The verifier captures arrival at **2560 × 1600**, **1280 × 720**, **844 × 390**, and **390 × 844**, plus rear/front deck, both bank sections, fork, dry basin and flooded basin. Hardware/software images were inspected. The low-ground view is substantially clearer at the bank than at the distant arrival; no human comprehension claim is inferred from the sample count.

The original branch-view assertion incorrectly expected the rear-deck sample count to equal the front observation position. It was replaced with separate checks for the two actual camera locations, after inspecting the pump-roof and low-wall occlusions. The final report retains every blocked ray. No geometry was hidden from the verifier.

## Encounter and rendering checks

- `verify-final-cut-crossings.mjs`: seven groups pass, including 18 warning escapes across three frame rates/two directions, real middle-cover loss, body-clearance paths, honest exposure in the new gap, saved sector removal, fourteen fully cut phase comparisons and five complete routes. The bank route remains longer with less time in the cutting strip; each route finishes first in at least one sampled phase. This is not human balance acceptance.
- `verify-final-cut.mjs`: thirteen rule groups and seven complete simulation routes pass, including permanent refuge, checkpoint, capture, trap, both replay plans and fully cut recovery.
- `verify-final-cut-rig.mjs`: eight groups pass, including 2,000 arbitrary heading/steering footprint comparisons and contact at 30/60/120/144 Hz.
- `verify-final-cut-arrival-browser.cjs --crossings --overlook-start --out=output/final-cut/overview/routes`: three uninterrupted browser finales through normal Gamepad API movement/look/Use, zero captures and zero browser errors. Direct entry uses the bank (123.8681 simulated seconds); garage uses the open route (130.4964 s); drain uses a real fork ball distraction and the open route (131.7030 s, one selected ball redirect). These include middle-cover retreat, pump, actual trap and road completion. Earlier chapters are not played in these tests. Sixty-five captures include separate diagnostic boarding/record fixtures; those fixtures are not counted as uninterrupted playthroughs.
- `verify-final-cut-irrigation.cjs`, hardware and `--software`: five groups / 22 captures each, zero browser errors. Actual pump Use, six-second fill, ready state, both trap headings, reduced motion, exact pause pixels, reload, bounded residual flow and resource stability pass with the revised soil material.
- Installed develop-web-game client passes; latest screenshot/state inspected at 6.5 simulated seconds, waiting rig, dry swale, 48 geometries / 20 textures. This pass introduces no new texture. No new sustained performance qualification is claimed.

Artifacts: `output/final-cut/overview/{baseline,prototype,hardware,software,routes,client}/`, plus current crossing/rig/main and irrigation reports. `baseline/` was captured before the authored edits; `prototype/` is intermediate evidence. The study tool was converted into the current overview verifier after adoption, so routine reruns do not overwrite the baseline.

Remaining: first-time recognition of the refuge/road/swale relationship, the two-vehicle reveal illusion, broader dramatic pacing and environmental art, physical devices/listening, full campaign runs and sustained software-renderer performance. The original 72-item implementation goal stays active.
