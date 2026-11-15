# Under the Green pass 96: keeper cabinet silhouette

Replaced twelve repeated shallow drawer fronts with two tall doors, two central drawers and one visibly recessed empty drawer bay. One door has an unequal splintered lower edge beside the root; the opposite door drops slightly. Existing high-resolution timber art uses physical UV scale and different grain orientation on vertical doors/horizontal drawers. Restrained vertex tint darkens old flood damage. The top, open ledger, repair materials, protected records and lamps are unchanged.

The new cabinet has a real back, sides, bottom, inset plinth, runners, framing and small hinges/handles. Three lower masonry pieces within the fitted cabinet were shortened to an 8cm footing to expose its real interior. The opaque cabinet closes that space; original navigation/collision remains. Its maximum front remains at course y11.50m, inside the previous hardware envelope. The missing drawer is decorative and has no interaction.

## Verification

- Final native2560x1600 and software960x600 browser passes: 32 views each, covering approach, desk, repair, packet, oblique, map, rack, cabinet, door, socket, flood; plus1280x720,390x844,844x390, actual C/Q, E sluice closure, pause and Reduced Motion. No page/console errors. Exact camera-return images remain stable.
- 1872 camera-clearance poses per renderer pass. 293 native/608 software unaffected mesh hashes and all outside-cabinet triangle hashes match, excluding keeperStone because its carved pieces intentionally change. The independent wall-piece comparison proves only the three intended lower pieces change;323 other walls are identical.
- Geometry test:1740 rays through the lower aperture from three frontal/oblique eyes hit actual cabinet geometry. The drawer-centre ray reaches z=-11.0195m, proving a real inset, not a flat facade or open void. All geometry attributes finite; bounds stay inside the fitted recess and previous face. Browser sight probes also retain opaque backing.
- Existing desktop story geometry remains above the worktop. Matched light lists, texture counts, player states and action behavior are unchanged. No new colliders/lights/textures.
- Installed gameplay client completed12bursts; final active play at(0,13.192),elapsed2.533,entrance checkpoint0,actual960x540. Initial five-second click while Preparing timed out; subsequent Enter bursts started the ready game. No error artifact; final shot11 inspected.
- Inspected native cabinet/door/approach/flood, compact portrait/landscape, software cabinet/door/portrait and final client image. This is local scene acceptance, not whole-route art acceptance.

## Cost and limits

Native matched views add1draw/1program and remove552triangles; textures remain equal. Software adds1draw with unchanged program count; triangle change depends on existing culling (close desk +116, approach/flood -552). No additional maps or lights. Timings below are24alternating GPU-fenced samples after6warm pairs, on a shared machine; they do not prove a frame-rate target.

| Renderer | View | Median ms before -> after | p95 ms before -> after |
|---|---|---|---|
| hardware | approach | 8.4 -> 8.9 | 10.3 -> 10.2 |
| hardware | desk | 7.5 -> 7.6 | 9.1 -> 8.8 |
| hardware | flood | 8.3 -> 8.3 | 9.7 -> 9.7 |
| software | approach | 93.0 -> 91.7 | 98.9 -> 106.2 |
| software | desk | 104.6 -> 108.1 | 117.0 -> 123.0 |
| software | flood | 108.8 -> 114.1 | 119.6 -> 127.5 |

Native median differences are small. Software is mixed and slower at close/flood views; no performance-parity claim. Broader software performance remains unresolved. Cabinet geometry/art is retained; this does not satisfy the whole-level performance gate.

## Scope and artifacts

Advances keeper composition/damage (V11/V12/V39 and review35). V39 already had local acceptance; no requirement status is promoted here. All53requirements,48refinements and7whole-level gates remain in scope. This does not finish the gallery, water, bunker/range compositions, shared material audit, vignette/bob acceptance or whole-route parity/performance.

Runtime: web/under-green-keeper-cabinet.js, web/under-green-keeper-workspace.js, web/under-green-keeper-layout.js. Source snapshots, final source manifest, geometry report, native/software reports, budget samples and client artifacts: output/under-green/visual-pass96/. Final source SHA256 values verified against the tested build.
