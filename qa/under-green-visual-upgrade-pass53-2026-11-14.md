# Under the Green pass 53 — paving and historical floor wear

Previous goal turn: progress, implementing and verifying the service-hardware material pass. This pass advances the existing floor composition and high-resolution sampling requirements. All53 original requirements,48review refinements and seven whole-level gates remain in scope.

## Changes

- The constant1.46m half-bond slab grid now uses mixed1.24–1.76m slab widths with staggered course offsets. Course depth remains1.16m. Occasional corner repairs have a separate restrained pigment and mortar seam. Most paving remains intact.
- Nine authored historical wear paths cover the gallery, service junction, bunker channel and bypass, pump approach, range channel and bypass, and middle landing. Broad interrupted patches gently darken used stone and compress existing sediment. They do not brighten a safe route, change hazard state, or modify movement. Both dangerous crossings and bypasses receive wear.
- Wear occupies the existing1024square deposit map's unused alpha channel. Raw RGBA DataTexture storage replaces CanvasTexture storage so zero wear cannot erase the independent mud/sand/wetness channels through Canvas2D alpha premultiplication. Same texture dimensions and GPU storage class; one additional temporary1024square canvas during construction, no per-frame map updates.
- Corrected floor shader coordinate quantization from128samples/metre to313.5, matching the existing concrete, sand and sediment source density. The earlier lower-resolution shader grid discarded fine art before filtering.
- No new texture images, lights, draw batches, geometry, colliders, speed rules or simulation behavior. The code changes are local to `under-green-ground-finish.js` and new `under-green-floor-wear.js`.

## Evidence and corrections

The first centerline audit found eight samples passing through the pump buttress. The historical trail now bends south of that support. The final check samples3,095positions at player radius0.3m: all on floor and clear of solid obstacles. The final wear painter emits3,090bounded polygons across1,030patches; channel3 strength stays0–105. Both original and corrected reports are retained underpass53-source.

The initial pass53-ground captures precede this path correction. The pass53-final hardware captures include it but precede the sampling-density correction. Final acceptance evidence is only `pass53-accepted/{hardware,software}` and final client/budget receipts described below. Earlier artifacts are retained, not counted as final verification.

Final native suite:39views at actual2560x1600, plus1280x720/390x844/844x390 responsive fixtures. Thirteen paired floor/district views, nine responsive views, flood, actual crouch, actualQ and Reduced Motion. All20floor/walkway batch position/index hashes and world matrices match baseline. Paired player state, resolution, draw/triangle/texture/program counts match; program count144. Texture counts are cumulative over the chosen fixture order and should not be compared directly with a different pass's order.

The verification compares all three deposit-channel hashes in CPU storage and actual1024square GPU readback. Mud, sand and wetness match baseline exactly, including orientation.53,634native and52,836software texels have nonzero deposits with zero wear in the final audit, demonstrating why independent raw channels matter. Camera-turn return produces an identical image at the entrance-floor fixture. No shader/page/console errors in the native suite.

Inspected final native entrance, gallery and wall-base views. Final software bunker, portrait entrance and crouch captures were also inspected. The variable paving and small corner repairs improve rhythm; broader floor material variants and route-wide composition remain open. This is not a full Level1 parity or human playthrough claim.

Geometry/collision functions remain unchanged. Position/index/matrix equality supports retaining existing geometry-clearance evidence; no fresh full-route actor/scythe clearance is claimed.

## Scope retained

V02/V03/V04/V06 advance locally and remain in_progress. V20 is locally implemented: readable varied worn slabs and muddy joins now accompany the previously verified six localized pools and two continuous runnels. This does not qualify fullLevel1 parity or whole-route motion. Full district composition, material variants, wet highlight direction, actor/ghost presentation, illustration cohesion, camera finishing and all seven release gates remain open. No completion, commit, deployment or agent delegation.

Final software suite also passes39views, identical deposit-channel CPU/GPU hashes, geometry and resource-count checks, zero page/console errors. Its desktop target is960x600, not native2560detail. Final crouch eye height1.126m and Qrear amount0.983 confirm actual key transitions.

Installed develop-web-game client rerun after both corrections: seven bursts, finalready/playing(0,8.84), final screenshot/state inspected, nine wearpaths/1,030patches active. Initial5second Preparing-click timeout recovered through subsequent menu input, terminalexit0, noerrorartifacts. Evidence:pass53-client-final. Earlierpass53-client is intermediate only.

## Final local rendering cost

Six warm frames,24alternating GPU-fenced samples per view, native followed by software after other owned render jobs ended. Native2560x1600, software960x600. These are fixture-render timings rather than ordinary-input FPS.

| Renderer / view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| hardware / gallery | 15.1 / 17.5 | 14.7 / 16.3 |
| hardware / pump | 9.0 / 10.5 | 8.5 / 10.5 |
| hardware / range | 10.6 / 12.7 | 10.6 / 12.4 |
| hardware / keeper | 10.1 / 12.3 | 9.5 / 11.3 |
| software / gallery | 226.6 / 298.7 | 221.0 / 274.1 |
| software / pump | 166.7 / 186.2 | 163.1 / 185.4 |
| software / range | 126.1 / 149.7 | 134.5 / 152.8 |
| software / keeper | 194.5 / 250.1 | 201.2 / 252.1 |

Native values are close or lower in this sample. Software is mixed: range median increases8.4ms and keeper6.7ms, while gallery/pump medians decrease. No general speedup or no-regression claim; software remains far outside a playable budget. Allpaired draw/triangle/texture/program counts andresolution match.

All owned jobs are terminal: intermediate70745/85948/57678/74580/25664; finalnative67464, finalsoftware71158, finalclient5198, nativebudget26446, softwarebudget21059. Server4187retained. Final runtime/harness SHA256values match accepted-verification-hashes.json; final-hashes.json retained. Ledger32implemented/20in_progress/1pending; allseven gatespending.
