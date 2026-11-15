# Under the Green pass 46 — flood contact on real surfaces

Status: locally verified. Previous goal turn was a list-only response and made no implementation progress. This continuation revalidated the unfinished runtime change and completed its expanded physical audit. Full 53-item scope and all seven release gates remain active.

## Implementation

`under-green-flood-wetness.js` binds 102 actual low opaque meshes through 19 isolated material variants. Roots, masonry, mud, timber and machinery receive world-anchored wet darkening and a restrained contact highlight at the physical waterline. The wet band remains after recession and dries according to the existing flood clock. Actor materials are excluded. Material-specific setup runs before the final wet specular adjustment.

The previous separate flat wall film is removed. No images, lights or geometry are added. No collision, input, pursuit, flood depth, timing, penalty or checkpoint changes. The compatibility `wallFilm.segments` statistic describes 326 authored boundary segments, not additional draw planes. This is surface treatment for the authored flood footprint, not a fluid simulation.

## Evidence

- Final main review: 110 views and 75 deterministic camera-turn steps per renderer, including all channels, shallow patches, flood phases, 2560x1600, 1280x720, 390x844 and 844x390. Pause, Reduced Motion, exact frozen-camera return and shader/page error checks pass. Native target 2560x1600; software target 960x600 in the desktop viewport. Artifacts: `pass46-final`.
- GPU diagnostics use actual production root, machineIron and keeperStone material hooks on a translated, rotated, nonuniformly scaled diagnostic mesh: 138 samples per renderer verify wet/dry separation, contact height, recession, next cycle and reset. Maximum permitted readback error is .009; all pass.
- Expanded physical audit, freshly run on both renderers: 201 times across 100 seconds; 26,532 actual leaf-matrix samples (132 leaves); maximum depth .38m. Actual 1,242 flood triangles cover all 621 floor tiles, area 1778.189993 versus expected 1778.190000 square metres. Vertical rays hit water at every tile centre. All 33 audited masonry meshes retain opaque depth-tested materials. Keeper book, paper, log, plan and rack remain above the maximum flood; lowest protected object is .57m. Artifacts: `pass46-receivers`.
- Inspected native keeper high flood, gallery drainage, pump high flood, software pump residual dampness and installed-client final gameplay. Elevated records stay above the flooded floor; roots and wall bases join the water. These are controlled views, not whole-route artistic acceptance.
- Installed client completed five bursts and reached playing at (0,8.84); final shot/state inspected, no error artifacts. `pass46-client`. Its initial Preparing timeout recovered on later input bursts.
- Original dry comparison: keeper capture byte-identical; other inspected dry JPEGs had negligible rounding/compression differences (mean channel difference at most .000030/255, no channel differences above 8). Do not claim universal byte identity.

## Local cost and limits

Six warm and 24 alternating GPU-fenced samples per view; values are median/P95 milliseconds. Existing software timing job is terminal: its handle is absent, no verifier process remains, and the complete passing report exists.

| Renderer/view | Before | After |
|---|---:|---:|
| Native gallery dry |14.2 / 16.8|13.3 / 16.1|
| Native gallery flood |14.9 / 16.4|12.6 / 15.5|
| Native pump damp |7.9 / 8.9|7.7 / 8.8|
| Software gallery dry |152.3 / 163.1|157.3 / 223.0|
| Software gallery flood |165.0 / 179.4|168.1 / 175.4|
| Software pump damp |59.4 / 63.2|60.3 / 66.2|

Software cost remains poor, including a worse dry-gallery P95. These measurements do not establish ordinary-play frame rate or full-level performance acceptance. Artifacts: `pass46-budget`. Full Level 1 parity, route composition, motion, clearance, accessibility and performance gates remain open.

V26 has local implementation evidence for physical height, coverage, wet edges, debris and protected records. V22/V25 retain broader all-light/all-angle water-art review. Next: finish the physical gallery vaults and texture scale, then continue the remaining material/composition and whole-level gates.
