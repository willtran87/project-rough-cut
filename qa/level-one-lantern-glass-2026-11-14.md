# Level 1 lantern glass

## Result and scope

The path and station lanterns now have deliberately clustered pixel glass: bright mantle centres, darker pane edges, a stepped soot rim and sparse wipe/condensation marks. A shared 96×64 map wraps the existing glass cylinders with their original cylindrical UVs. The four pane divisions align with the existing frame bars. Seven colour steps retain the warm source and allow the station's green completion tint to remain distinct.

No geometry, draw calls, lamp placement, collision, light power or ambient setting was changed. All 28 symmetric path lanterns and the existing 40 lighting anchors are retained. The change is local V01/V09/V10 craft progress, not completion of the full visual checklist. Broad dark-area composition, wider material hierarchy and software resolution/performance remain open.

## Evidence

- `tools/verify-course-lantern-glass.cjs` passes 29 views per renderer: all 14 path pairs, all nine station lamps, opening/near/closer views, 1280×720, 390×844 and movement. High-resolution viewport is 2560×1600, with actual native target2492×1402 and controlled software target800×450.
- 58 matched before/after pairs preserve camera poses, complete inventories, draws and triangles. Disabling only the new glass map reproduces the original flat-glass render byte-for-byte in every matched view. `comparison.json` records this oracle. It proves that the surrounding scene and lighting were not changed to obtain the new appearance.
- All 29 software full-geometry/culling/restoration comparisons are pixel-exact using the corrected full-index reference helper.
- `tools/verify-course-lantern-state.cjs` passes real Audit Bell Use on both renderers. The lamp changes from0xe2bd6c to0x8cc991 with the new map still attached; the bell animates and the objective advances. Source powers vary during motion and return to their original values under reduced motion. Pause and rebuild checks pass.
- Warm resource counts are stable. Exactly one shared glass texture is added; scene rebuild disposes it once despite its use by both batches and station material clones. The test compiles additional flat-map comparison shader variants, so its program counts are not a production-only resource estimate.
- Installed gameplay client passes on both renderers. At 2560×1600, native target2492×1402; the adaptive software run moves from960×540 to800×450. Both remain in `first_hole`, moving from x16/progress484 to x18/progress486 with positive clearance and no errors. Final screenshots were inspected.
- Initial all-pairs fixtures tried to place the camera just behind the playable entrance. The fixture was corrected to clamp to valid course bounds before obstacle clearance search; production movement was unchanged. Failed runs65031/30362 are superseded by successful65632/28701. Baselines92713/17156, interactions30138/97589 and clients74121/52392 all exited0.

Artifacts: `output/level-one-lantern-glass/`. Useful comparisons: `before-native/dead-lantern.jpg` → `after-native/dead-lantern.jpg`; portrait `after-native/lantern-390.jpg`; actual movement `client-native/page-1.png`.

## Cost

The texture adds one small shared allocation and a glass texture lookup. Geometry and draw submissions remain identical. Sequential presentation/readback fixture medians (12 warm frames, then three groups of12):

| Renderer | View | Before | After |
|---|---|---:|---:|
| native | near lantern | 9.1ms | 10.7ms |
| native | opening | 7.9ms | 9.5ms |
| software | near lantern | 165.8ms | 105.6ms |
| software | opening | 130.9ms | 90.0ms |

Opposing timing shifts are not evidence of a speedup. A same-scene alternating comparison is recorded separately to investigate the native cost. These fixture measurements include synchronization/readback and are not gameplay FPS. The software performance requirement remains unmet.

## Same-scene alternating cost

Each block rendered24frames, discarded12warmups and synchronized with full-target RGBA readback. Both variants shared one loaded scene, camera and geometry. Median of three block medians:

| Renderer | View | Flat glass | New glass |
|---|---|---:|---:|
| native | opening | 15.7ms | 15.5ms |
| native | near-lantern | 15.0ms | 16.9ms |
| software | opening | 71.5ms | 74.1ms |
| software | near-lantern | 85.7ms | 84.3ms |

The native near view is1.9ms higher by this summary, while its final mapped block is lower than its adjacent flat block. Software opening is2.6ms higher and near view1.4ms lower. These mixed, variable results do not establish a performance improvement or neutrality. The small added texture cost is retained for the visible craft improvement; whole-scene performance acceptance remains open. Native24608 and software25975 exited0. All8source hashes match final production/test files.
