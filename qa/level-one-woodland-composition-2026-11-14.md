# Level 1 woodland composition

Partial V04/V06 improvement. Six authored pockets interrupt the continuous nearest decorative tree belt: arrival west, audit east, water west, green east, range west and range east. `course-woodland-composition.js` smoothly reduces selected trees to at least68% of their original uniform scale and moves them at most5.5m outward. The actual28 affected trees retain their original baked branch/needle geometry;109 other trees are unchanged. All137 remain. Ground anchoring is recomputed using the existing woodland height function. The second belt and collision-bearing trees are excluded.

The Audit Row comparison reveals a lower irregular foreground crown line, sky between the groups and more of the distant clubhouse. Arrival, pond-side and range views retain framing trees. The existing service-yard and clubhouse clearings are retained. Darkness remains deliberate: this pass changes silhouette composition, not surface illumination or the broader material standard.

## Evidence

- `tools/verify-course-woodland-composition.cjs --before`, default and `--software`:12views each, including10legal2560×1600 views plus1280×720 and390×844. Reports/screenshots under `output/level-one-woodland-composition/{before-native,after-native,after-software}`. Legal camera fallback is deterministic and recorded through actual camera coordinates. An initial fixture inside cover was corrected before the final baseline.
- Runtime inventory comparisons prove unchanged collision-cover positions/bounds, global lighting and all28path-lantern coordinates. All original tree forms are preserved, every moved trunk shifts outward, and unaffected trees match the baseline exactly. JSON normalization avoids treating omitted undefined fields as actual differences.
- Native inventory uses971geometries versus966before,107textures in both; relocating trees changes the existing spatial batch partition. No new geometry detail, texture or material family is introduced. This is not a performance improvement claim.
- Existing analytic tree-wind check passes516132pose samples and71685root samples; max displacement.253503m remains inside.27m padding. Shared-wind direction, shelter, pause, reversal and reduced-motion tests pass.
- Existing canopy verifier now accepts an optional `--out=` so this pass preserves earlier evidence. Native current-scene motion results: CPU-baked/GPU-deformed whole-scene reference exact,8culling views exact, pause/reduced/reversal checks pass,10custom shadow materials disposed once on rebuild, no errors. Evidence under `motion-native`.
- Software motion results also pass: deformation reference exact,7culling views exact; one view differs by at most1/255 across168channels with exact per-piece coverage and exact static-wind reference. Pause/reduced/reversal, resource stability and10shadow-material disposal checks pass. Evidence under `motion-software`. The small shading difference is bounded; its driver-level cause is not established.
- Installed web-game client completes8input bursts with no error artifact; final state is first_hole, x13,progress24,travel34. Final gameplay screenshot inspected. This is a short input smoke test, not full-route gameplay acceptance.

## Limits

Whole-route composition, material parity and software performance remain open. The client reports115.77ms average/128.70ms P95 completed software frames at640×360; part of its run overlaps the native motion fixture, so it cannot establish a causal before/after performance result. No60FPS claim. High-resolution captures on the software renderer use its existing lower internal render budget. This pass does not accept V04,V06 or V21 wholesale.
