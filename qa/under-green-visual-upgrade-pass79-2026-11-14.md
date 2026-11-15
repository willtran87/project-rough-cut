# Under the Green pass79: pump casting, supports and work light

Local refinement of V11/V31/V35/V36. The complete53 requirements,48 refinements and seven whole-level gates remain active; no completion status promotion.

## Retained changes

The existing pump work fixture moved from(-24.5,42.1) to(-24.9,41.1), retaining height2.8, its actual roof hanger, warm palette, power, reach, downward beam and independent flicker. This brings the source forward of the front casting so the enamel, flange, bolts and strainer read from the approach. Sixteen cooling fins, four feet and two skids have narrow inset cast bevels. Four tapered saddles now connect the curved motor/volute housings to their feet, resolving the visible floating gap. Broad faces remain dark; there are no added lamps, textures, materials, colliders or UI. Existing physical texture mapping and batched geometry remain.

## Verification

Artifacts: output/under-green/visual-pass79/. Preview folders precede final saddle geometry; hardware/software are authoritative final suites.

- Actual machine geometry unit passes8,487 low vertices inside the original2x3m footprint, finite geometry above floor and404 occupied samples through four mounting paths. Complete machine7,744 triangles.
- Native53740 and software33267 exited0:31 captured states each,2,112 camera poses each without intersections. Front, side, base, return, distant approach, operating controls, flood, lamp minimum, reduced motion, Q rear and crouch covered. Native2560x1600 plus1280x720/390x844/844x390; software desktop960x600/960x540 and compact native buffers.
- Native front/base/minimum-lamp/portrait controls, software front/base and installed-client screenshots inspected. Controls remain readable. Real E input diverts the pump, pause freezes elapsed time, and returning to the same camera yields identical pixels.
- Geometry fingerprints outside the lamp and machine envelopes match:306981 triangles/hash3838763705 native,232649/hash3482876207 software. All other lamp definitions, paired player states, resolutions and texture counts match. Gallery/range paired screenshots are byte-identical. Bunker screenshots are not exact: subtle central-region differences up to5/255 native and4/255 software; inspected amplified difference image, no broad scene change. Do not claim outside-region pixel parity for the bunker. No browser errors.
- Moving-route59628 exited0:1,379 frames,106 Joe body/tool geometry samples, no intersections; max foot error2.414686e-7.
- Installed client46997 exited0 after8bursts. Initial Preparing click timed out, later Enter recovered; finalready/playing,checkpoint0,elapsed1.5333,player(0,10.12). Image/state inspected,no error artifacts.
- Native front/base views add464 submitted triangles. Pump view84to83draws,130826to131288triangles; controls412draws unchanged. Shader variants221to218; textures unchanged. These counts do not prove performance.

## Cost and remaining scope

Sequential native timing95821 exited0: pump9.2/8.0ms,operator14.3/12.1ms,gallery19.7/17.8ms baseline/current medians. Software timing51206 exited0: pump101.5/101.1ms, operator165.8/162.7ms, gallery200.7/199.4ms baseline/current medians. Six warm pairs and24 alternating GPU-fenced samples per fixture. These shared-host local diagnostics do not establish an overall speedup or production pacing acceptance; software remains far too slow. Both owned timing jobs are terminal. Full district compositions, channel/flood art and motion, actors/current matched Level1 comparison and whole-level performance remain open. Existing software rendering is too slow and is not qualified by these static images.
