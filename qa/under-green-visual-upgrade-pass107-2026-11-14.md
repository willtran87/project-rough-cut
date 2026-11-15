# Pass107: finer illustrated paving material

Paving material refinement integrated and locally verified. Full-level visual and performance acceptance remains open.

## Change and art decision

The existing 1254-square paving field had broad diagonal marks that became indistinct under dim game lighting. Built-in image_gen produced a stronger clustered v2. In-game comparison rejected its large flakes because they resembled peeling plaster. A targeted edit produced v3 with smaller stone pits, mineral fractures and quieter rubbed areas. The original generated PNG is copied unchanged into web/assets/under-green/paving-field-v3.png; exact generation/edit prompts and source paths are saved beside the v2/v3 assets. V2 remains provenance only.

The runtime change replaces the floor asset in web/under-green-crafted-surfaces.js. Existing course sizes, slab rotations and offsets, mortar/repair/split patterns, independent deposit/wetness/wear masks, lighting and collision stay intact. This is local to Under the Green. Both old and new images are 1254x1254 RGB, at 313.5 source texels/metre over a four-metre field. The new PNG is 2,131,667 bytes versus 1,878,674 bytes; GPU allocation and texture/sample/draw counts should remain the same. Actual startup/decode cost is not yet qualified.

## Verification scope

tools/verify-under-green-paving-material.cjs compares the actual current loader against the saved pre-change loader. The prior preview used image routing to compare candidates before runtime integration. Both previews passed eight paired captures. Inspected before/after floor at 2560x1600; v3 retains more fine stone detail without the large peeling shapes in v2. This is a material improvement, not approval of the complete gallery or Level1 parity.

Full runs cover six districts, four gallery detail/return/boundary views, four flood times, compact viewports, Q/crouch, camera-return stability, pause, Reduced Motion, exact unchanged deposit channels and paired resource/player/light records. Hardware/software timing is local and separate from full-route performance acceptance. Installed gameplay client must run after the final integration.

Manifest: output/under-green/visual-pass107/source-manifest.json. Baseline: output/under-green/visual-pass107/source/under-green-crafted-surfaces-before.js. Full 53 requirements, 48 refinements and seven release gates remain the objective. No status promotions are implied.

## Native terminal result

Native verification exited 0 with 38 captures and no recorded browser errors. All four deposit channels and mask statistics are exactly unchanged. Paired player, light, resolution and resource records match. Camera return is pixel-identical; pause freezes elapsed time. Desktop rendering is actual 2560x1600, with 1280x720, 390x844 and 844x390 also captured. Inspected gallery floor, pump, range, bunker and compact portrait. The new fine marks remain restrained under cold service lighting and stronger near the pump lamp.

Local warm GPU-fenced medians before/after: approach 26.9/26.2ms, floor 26.4/26.7ms, crossing 20.8/20.7ms. P95: 29.9/27.4, 29.5/30.7 and 23.7/22.5ms. Four warm pairs and 24 alternating samples per view. These mixed small differences do not establish a speedup or whole-route performance acceptance. Source comparison confirms the runtime loader differs by exactly the one asset-name replacement.

## Software terminal result

Software verification exited 0 with 38 captures and no recorded browser errors. The same deposit, state/resource, camera-return and pause assertions passed. Large captures render at 960x600, 1280x720 at 960x540, and compact 390x844/844x390 at native dimensions. Software floor inspected: fine stone markings remain visible, with the expected reduction in detail from the smaller render target.

Local medians before/after: approach 200.5/196.9ms, floor 165.3/165.3ms, crossing 208.9/204.9ms; P95 285.2/281.6, 237.0/233.8, 308.4/256.1ms. These samples overlap task-owned report compression during a low-disk episode. Treat timings as provisional comparison only; they do not qualify frame pacing or demonstrate an optimization. Absolute software cost remains poor.

Storage recovery compressed another 150 task-owned JSON files (126,266,562 logical bytes), then 385 files (143,668,403 logical bytes). SHA256 before/after checks preserved every file's contents and path. No deletion.

## Final gameplay check

Installed client exited 0 after ten bursts, ready/playing at (0,8.072), checkpoint 0, no error artifacts. Final shot9 inspected. The initial five-second Preparing-button timeout recovered through the subsequent action sequence. All 138 runtime/asset hashes in the pass107 manifest remain unchanged after verification. All owned jobs are terminal.

No requirement status promotions: 33 implemented, 19 in_progress, one pending; all seven full-level gates remain pending. Retain the finer stone and integrated sediment. Next priorities remain whole gallery/crossing composition, source-lit material separation, shore contact, district construction variation and performance. This pass does not qualify pursuit AI, ghost/attack animation or the full game's Level1 parity.
