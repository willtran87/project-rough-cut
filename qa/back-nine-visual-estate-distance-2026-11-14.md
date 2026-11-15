# Back Nine distant estate architecture — 2026-11-14

The Back Nine horizon now includes a keeper's cottage, a braced water tower and a service barn, each with a restrained warm window or enclosed lamp. Together with the accepted three-layer woodland, these provide atmospheric depth and recognizable silhouettes beyond the playable course. BV20's distant-scenery scope is accepted; this is not acceptance of whole-level visual parity or software performance.

## Implementation

- `web/back-nine-estate-distance.js` builds 89 pieces into four material batches: 2,104 triangles and 3,068 vertices. Roofs and triangular gables are closed. Timber braces, tank bands, a ladder, chimneys, mullions and inset doors give the silhouettes physical depth.
- All geometry lies more than 217 world units from the distant-scene origin, behind the 175-unit boundary woodland. Broad hill foundations intersect the building bases and disappear behind the trees.
- The architecture uses its own 0.26 parallax influence, between the wooded slope and nearest woodland. It reuses three cached architecture texture crops. Its small lights are illuminated surfaces, without additional renderer lights or animation loops.
- Only Back Nine's opt-in estate horizon includes these structures. Four import-map entries use `20261114-estate-distance-2`; unique keys and served source bytes were checked.

## Verification

Evidence root: `output/back-nine-visual-upgrade/estate-distance`.

- Geometry checks pass for finite positions/UVs/colors, normalized normals, boundary separation, roof ray intersections and exposed lamp panes. Course/navigation data is unchanged. The prior horizon's 360-ray and mirrored-seam checks also pass.
- `final-native` and `final-software`: six legal gameplay views at 2560 × 1600, plus 1280 × 720 and 390 × 844. Pause/resume, full restart and console/page error checks pass. Actual screenshots were opened, including all three native landmarks, software barn and desktop/portrait garage approaches.
- `before-native` uses the saved pre-architecture horizon, retaining the accepted three woodland layers. Six matched views preserve player, cart, Joe, time, objective, checkpoint, service, utility, navigation and destruction state.
- Direct default-backdrop comparisons at three headings/positions change zero pixels on either renderer. Existing default texture transforms are unchanged. Long travel and an independent turn alter horizon projection; layer origins follow their specified influence and world moon coverage remains unchanged.
- Disposal observers record seven geometry and seven material disposals, including the four new batches, and zero shared texture disposals.
- At 960 × 540, actual full-scene pixel readback with the structures/lamp batch hidden independently confirms visibility through foreground occlusion. Native cottage/tower/barn affect 2,798 / 1,080 / 1,769 pixels; their lamps affect 15 / 2 / 6 pixels. Software results are 2,797 / 1,087 / 1,772 and 15 / 2 / 6.
- Compared the accepted views with the existing Level 1 `output/back-nine-art/level-one-2560.png` reference. Back Nine now has separate ridge, slope, woodland and architectural silhouettes, with warm light accents. Level 1's stronger foreground framing and planting density remain useful targets for the other ledger items. This reference inspection is not a fresh whole-Level-1 runtime test.

Installed standard gameplay clients also pass native and software forward/turn/rear-look input bursts. Both finish at `(20.99670594253312,83.94355811194566)` with player/cart/Joe/time/checkpoint identical to the preceding horizon pass. No error artifacts; actual page screenshots and state were inspected. Native 2560 × 1440 average/P95 is 11.93/15.70 ms; software 640 × 360 is 139.71/184.80 ms. These observations reinforce that software fidelity and performance remain unfinished.

## Cost and limitations

Matched before/after captures add four draw calls, two shader programs (33 → 35), and no textures (55). Main-scene triangle statistics exclude the backdrop; the new backdrop geometry adds 2,104 triangles separately.

The profiler alternates the new architecture's visibility in the same prepared world, with 36 GPU-fenced samples per variant at each of three views. At 960 × 540, native median baseline → current is cottage 7.1 → 7.1 ms, tower 7.0 → 6.5, barn 6.7 → 7.0. Software is 98.0 → 116.0, 73.0 → 82.4, and 71.0 → 75.0 ms. These short shared-host samples show additional software cost, not a speedup or whole-level budget acceptance.

The first placement hid the cottage and turned the lit facades away from the course. `first-native` is rejected intermediate evidence and also ended on a test-fixture null-map disposal error. `oriented-native` corrected the facades but predates the broader, lighter hill foundations; only `final-*` represents accepted placement. No test failure was fixed by suppressing a production error.

The playable middle distance, actor motion/grounding, cross-asset pixel density and full-load/software fidelity remain open under their separate ledger items.
