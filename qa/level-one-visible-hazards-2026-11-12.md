# Level 1 visible equipment and opening route

Status: delivered improvements with bounded automated evidence; full experience goal remains open.

## Changes

The opening board detour crossed an invisible ball spill: simulation hazards existed but the 3D scene never received them. `noise-hazard-scene.js` now renders all 12 authoritative anchors across five types: tipped ball basket, tools, open golf bag, hose and stones. Ready/spent geometry is prepared once (two merged meshes per hazard, one shared material). Triggering changes visibility without allocating geometry or textures. No new collision obstacles.

A ball now activates equipment at initial ground contact or along its ground roll, not merely at its final rest position. The louder equipment investigation survives the ball rolling beyond it; the ball remains recoverable. Optional warnings precede contact and defer to active messages. Terrain contact keeps physical slowing/noise/navigation consequences but coaching waits for a clear interval, respects pause/preferences and teaches each terrain kind once. Distant unseen Joe no longer produces a misleading bearing caption for local footing.

Opening lessons prioritize actual available cover, movement and looking before optional ball practice. The fresh UI route learns cover at the west hedge, reads the welcome board, avoids the now-visible spill and activates the first real Audit Bell using keyboard/pointer input. It does not reposition Joe or alter AI to manufacture safety.

## Evidence

- `tools/verify-visible-hazards.cjs`: actual W contact, actual Space aim/release, landing/rolling triggers, recoverable ball, source retention, all five spent poses, pause, fixed resources and terrain message priority. Hardware and SwiftShader pass, no page errors. Hearing fixture now places Joe within audible range; older far-away investigation expectations were intentionally corrected by the subsequent hearing pass.
- `output/visible-hazards/hardware/report.json`: 913 geometries, 69 programs, 102 textures unchanged during trigger.
- `output/visible-hazards/software/report.json`: 1266 geometries, 69 programs, 102 textures unchanged during trigger. These counts are not a frame-time or performance acceptance claim.
- `tools/verify-opening-walk.cjs`: latest `output/opening-walk/report.json` passes fresh UI/input route, actual cover/board/bell, zero final detection, no page errors. Earlier final snapshot is also retained in `output/opening-walk/final/`.
- Current equipment hearing, encounter/exit and installed standard client evidence is recorded in the hearing QA.
- Inspected 2560x1600 prop/approach/contact and representative 1280x720, 844x390, 390x844 captures. Bag mouth/individual club heads remain visible after refinement. Portrait preserves the existing letterboxed stage, with substantial world coverage by wrapped messages; ergonomic acceptance remains open.

Earlier failure artifacts record development discoveries (audio destination argument, missing contact before ball rest, and a test target that did not roll beyond the radius). They are superseded by the terminal passing reports, not erased.

## Remaining

First-time human comprehension, controller/touch lessons, broad route balance, artistic recognition, sustained performance, and the remaining full ledger are unverified. No broad O3/S2/S3/S6 completion claim.
