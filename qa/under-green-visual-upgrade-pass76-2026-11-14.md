# Under the Green visual pass 76: aged gallery render and runoff

Scope: refine the gallery's regular brick rhythm and connect wall decay to floor deposits. This is local progress toward the complete 53 requirements and 48 refinements. It does not establish whole-level parity with Level 1 or promote any of the seven release gates.

## Retained work

- Five unequal remnants of old lime render sit on the original east/west gallery walls, behind the existing roots. Three missing-plaster windows expose the intact brick backing. Their contours include small chips, a thin physical bevel, quieter concrete pigment and a darker damp foot.
- Four narrow seep trails emerge below the damaged areas; a west-side sediment fan connects to the floor. It reuses the existing packed deposit texture and changes only mud/wet channels in the authored footprint. Sand and historical wear channels remain exact.
- The first preview's dark flat edge was refined with a brighter lime pigment and shallow chipped edge. Geometry validation found incorrectly oriented hole walls; the hole contours are now opposite the outer contour and every seam is closed with consistent winding.
- Existing illustrated concrete and wetness maps are reused at the established world scale. Added surface geometry: 3,512 triangles for the five render shells and 640 for four seep trails, 4,152 total. There are no new image textures, lamps or colliders. Native paired views add zero to two draws and one shader program. Software batch culling submits only the relevant parts.
- Maximum inward offset from the original wall boundary remains 0.126 m, only 16 mm in front of the original brick face. The back is buried in the wall. Existing route, root geometry, opaque enclosure, movement, E/Q controls, pursuit and entrance-only retries are unchanged.

## Verification and inspected art

Artifacts: `output/under-green/visual-pass76/`.

- `verify-under-green-gallery-render-geometry.mjs`: five shells, 3,512 triangles, finite attributes, bounded wall intrusion/heights, front/back normals, closed oppositely directed seams and three genuine brick windows pass. Rays through the windows hit the original wall face. Two collinear zero-area cap triangles produced by Earcut have no coverage; they do not open the closed surface.
- Final native session 33530 and software 79418 both terminated successfully. Each covers 31 captured views/states: 11 before/after fixtures, six additional desktop/compact views and crouch/rear/reduced views. Each also passes 2,688 legal camera poses with zero hits, nine outside-wall sentinel tests with zero visible pixels after a positive control, camera-return pixel stability and pause freeze.
- Geometry outside the new wall-finish region has exact fingerprints: 303,702 native and 228,970 software triangles. Pump and keeper control screenshots are byte-identical. Player state, physical lamps, texture counts and render resolution match the baseline in each paired fixture. No recorded page or console errors.
- Deposit comparison changes 947 native and 920 software bytes, all increases in mud/wet channels inside the authored west-wall fan. The different totals reflect each renderer's existing deposit source; sand and wear bytes remain identical within each comparison.
- Actual native rendering: 2560x1600, 1280x720, 390x844 and 844x390. Software rendering: 960x600, 960x540 and the two compact sizes. A large software screenshot is not native 2560 detail.
- Opened and inspected native approach, west wall, floor and compact east-low views; software west wall; initial/refined close-wall previews; and final installed-client image. Render remnants break the brick pattern without covering the major roots or becoming bright panels. Broad ceiling/floor composition still needs further work.
- Installed web-game client session 74683 terminated successfully after eight bursts. Initial disabled Preparing click timed out; later Enter bursts recovered. Final ready/playing state: checkpoint 0, elapsed 1 s, player (0, 8.072), actual 960x540. Final state/image inspected; no error artifact. This is an entrance input smoke check, supplemented by the controlled gallery checks above.

## Cost and rejected draw-order experiment

All owned visual/client jobs finished before sequential baseline/candidate GPU-fenced diagnostics (native 9829, software 68380, both terminal success). Each fixture uses six warm pairs and 24 alternating samples per variant.

| Fixture | Native baseline / candidate median | Software baseline / candidate median |
|---|---:|---:|
| Approach | 21.3 / 21.1 ms | 274.0 / 266.2 ms |
| West wall | 8.5 / 8.5 ms | 61.2 / 73.3 ms |
| Crossing | 17.2 / 16.7 ms | 277.2 / 285.9 ms |

Other chapter render jobs were present in the saved process inventories. The crossing submits identical geometry and the new wall work is behind its view; its measured difference illustrates contention/variance. These numbers do not prove the magnitude of new geometry cost, a speedup or production pacing. The close-wall software increase remains a concern; absolute software performance is unqualified.

A follow-up explicitly rendered the opaque plaster before the wall, attempting to avoid shading covered brick without adding a depth pass. Native session 14964 and software 11814 each passed 18 exact raw-framebuffer/resource comparisons, including responsive, rear/crouch and elapsed-flood fixtures. Native normal/early medians were 20.3/18.4, 7.8/8.6 and 18.6/17.6 ms (approach/west/crossing). Software was 171.0/171.7, 60.9/61.3 and 189.5/191.4 ms. There was no measured software benefit, so this render-order experiment was removed. The final scene is byte-identical to the pre-experiment scene used for the full suites and installed-client check. The retained art is unchanged. Eight final runtime/tool snapshots have been byte- and SHA-256-verified. All owned jobs are terminal.

## Remaining acceptance

Full gallery composition, water/actor motion, pump lower-body separation, range framing, keeper room/counter integration, matched current Level 1 comparison, sustained performance and the seven whole-level gates remain open. The complete scope remains active; local geometry and screenshot checks do not close an art category.
