# Level 1 — physical pond runoff and contact ripples

This is partial progress on V08/V15/V18. All V01–V21 requirements and the 24-point user-facing scope remain active.

## Current implementation

- The eastern pond has a hollow iron outlet, recessed backplate, collar, fixings, masonry cheeks/lintel and a grounded foot. The small maintenance apron removes only intersecting reed clumps. Existing route/collision geometry is unchanged; all fixture vertices remain inside the previous pond footprint.
- A single bounded droplet follows an analytic gravity trajectory from the pipe lip. Rings start at its actual water-plane intersection, expand into broken pixel arcs, and fade. The droplet and ring share the same trajectory, coordinate system and clock. There is no player/ball water interaction claim: the existing game blocks those actors from entering the ponds.
- Removed the unrelated cyclic rings from all three pond shaders. Existing wind-driven surface strokes, banks, shallow detail and floodlight reflections remain.
- The outlet/droplet use real scene lighting. Ripple highlights follow the existing floodlight's power and tint. No new light, texture or ambient fill; the 28 symmetric path lanterns are retained.
- Ripples use up to three tiny instanced quads, clipped against the same irregular wet edge, instead of evaluating contacts over the entire pond. One droplet instance and three ring slots are allocated once. World reset owns disposal of both geometries and materials.
- Software batching gives the small lit outlet its own group, so it cannot promote a larger distant stone/metal batch to the full point-light shader. Hardware batching retains its previous policy.

## Rejected / superseded candidates

The service-pond placement was too dark and obscured. A far-bank eastern placement was also outside useful source illumination. Final placement is on the eastern pond's northwest shoulder, under the existing floodlight, with a small gap in the reeds. Earlier `after-*`, `lit-candidate`, `near-source`, `final`, `verified`, `optimized` and `local` folders are intermediate evidence. The first phone framing followed keyboard movement and cropped out the fixture; final responsive checks deliberately re-aim at its physical lip.

Whole-pond contact-shader candidates incurred a repeated software timing increase. CPU-side fades and narrow distance rejection did not resolve it. Local ripple quads preserve the appearance and bound fragment work; separating the outlet's lit batching then brought this fixture back in line with baseline. Do not present the intermediate implementations as accepted code.

## Validation

`tools/verify-course-pond-runoff.mjs` passes 17,281 samples across 120 seconds: physical flight/impact continuity, irregular wet-edge containment, bounded lifetime/count, repeated draw, pause, reduced motion, density-off and rewind. Geometry checks cover 445 vertices in the helper's simple-box fixture; production uses the existing beveled-box builder.

Final browser evidence belongs in `output/level-one-runoff/accepted/{after-native,after-software}`. It covers legal approach/outlet/side/other-pond views at 2560×1600 (native2492×1402; software960×540), plus1280×720 and390×844. Actual floodlight outages/restoration retain contact clocks, real Escape pause freezes motion, reduced motion clears animated effects, keyboard traversal leaves the source anchored,60 updates retain resources, and rebuild disposes both droplet/ripple geometry and materials exactly once. Browser console errors must remain empty.

## Timing evidence and limits

All timings are24 warmed submit-through-GPU-fence samples with2ms polling in one close outlet fixture. They are not a full playthrough or a60FPS guarantee.

- Original native baseline: median12.3ms/p9513.2ms;369draws/500630triangles.
- Initial whole-pond candidate: software103.1ms/p95133.3ms versus baseline82.1ms/p9595.1ms. CPU-fade candidate remained115.1ms versus88.8ms baseline.
- Local quads before batch separation: software117.4ms/p95141.3ms.
- Final isolated batching: software85.8ms/p9595.2ms; paired baseline87.2ms/p9599.4ms. Final72draws/29438triangles versus baseline68/28066. This comparison supports no observed regression in this fixture, not a speedup claim. Software performance remains poor and V21 remains open.

## Remaining work

Broader scene composition, palette and near/mid/far material consistency still need whole-level review. Pond wave strokes remain visually regular; broader water lighting, other contact sources, submerged vegetation and puddle treatment remain incomplete. This local outfall does not complete V08, V15, V18 or the comprehensive visual upgrade.

## Final recorded results

Both accepted browser reports pass all7 checks with no errors and28lanterns. Inspected native high-resolution contact/outage views, native1280 and390 responsive views, and final software contact view. Final native timing is10.7ms median/p9512.7ms,372draws/503586triangles. Final software timing is in `isolated-budget/after-software/budget.json`, paired against `isolated-budget/before-software/budget.json`. Texture count remains103; geometry/program increases are bounded, and both renderer checks retain warmed resource counts.

The installed development client completed8iterations. Inspected `accepted-client/shot-7.png` and `state-7.json`: actual first_hole, ready/baked, playerx13/progress24/travel34,28lanterns, no error artifact. Adaptive640×360, average completed scene56.15ms/p9561.30ms. This is startup/input evidence; it does not replace the native-resolution fixtures or establish acceptable overall software performance.

Six runtime/verifier hashes are saved in `output/level-one-runoff/source-hashes.json`. All owned jobs are terminal. No gameplay, navigation, Joe, lantern-layout, ambient-light or other-chapter changes were made by this pass.
