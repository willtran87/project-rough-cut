# Final Cut: preserve authored reeds while reducing software rendering work

This is verified progress on FV71. The full72-item visual objective remains active; neither overall performance nor Level1 visual parity is accepted by this pass.

## Final implementation

`web/final-cut-reeds.js` retains all3,753 clumps,202,662 vertices and225,180 original triangles. Materials, textures, shader animation, contact history and simulation are unchanged. `web/final-cut-reed-culling.js` partitions visibility into36 eight-metre sections and compacts the original index order into one draw before each camera or shadow view. A camera never decides which off-screen shadow casters another light needs.

Section bounds include the independent maxima of simultaneous wind, warning and physical contact:3.085m in x,2.55m in z, and12% of plant height downwards, with numerical margin. Whole-mesh bounds enclose their union. The existing `compactVisibleIndices` helper retains pending update ranges and avoids re-uploading unchanged packed runs. There is still one geometry/vertex/contact buffer set, one material and one depth material. No plant is deleted or simplified.

The final optimization is enabled only on the software fallback. Hardware retains the original static index buffer because paired measurements showed that its upload overhead outweighed the saved vertex work. `web/final-cut-scene.js` selects the tier from its existing renderer detection. This choice changes processing, not artwork or concealment.

## Final evidence

- Hardware25967 PASS22 views/five viewport sizes, including2560x1600. This diagnostic forces culling on to validate the algorithm on that backend; it refreshes directional moon shadows and both headlights. Original vertex attributes and triangle order are exact; all index ranges cover the original mesh once; extreme animated positions remain bounded. Culled versus forced-full rendering produces exactly identical framebuffer bytes in every view.
- Software84789 PASS the same22 views, including960x600 internal desktop rendering and native compact sizes. Its backend has no moon shadow; the later explicit moon-refresh assertion does not change this path. Every culled/unculled framebuffer comparison is exact.
- Original versus optimized test objects differ at0–7 isolated pixels in native views and0–1 in software views due to coincident surface ordering between separately constructed test materials. The actual culling comparison remains byte-identical. No broad old/new pixel-identity claim is made from the diagnostic objects.
- Final hardware production-tier A/B is separately byte-identical to the original reed module at2560x1600, with equal326draws/3,391,880submittedtriangles and no errors. `output/final-cut/reed-culling/batched/tier.json` records that the hardware culling flag is disabled.
- Vegetation1742 PASS: real keyboard strafe, simulation-driven passage, plant contact/bend/wake,3.6-second recovery and redraw idempotence. Established report path: `output/final-cut/visual-reeds/motion/report.json`.
- Concealment30372 PASS all48 exact hidden-rig present/removed comparisons: four cardinal entries, near/far, three lateral offsets and standing/crouched viewpoints. Final path: `output/final-cut/reed-culling/batched/sightlines/report.json`.
- Installedclient63369 terminal exit0: fresh image/state inspected, ready/playing, intro completed, player y4.7372,960x540 and single-draw culling active. After the hardware-only tier selection, installedclient91055 also exits0 with a fresh inspected ready briefing frame and software culling active. No error artifacts. The full input receipt covers the unchanged enabled software branch; the short post-selection receipt validates final loading/tier selection.
- Native working-light/contact views, software warning view, and both fresh client captures were inspected.

## Paired rendering cost

Final measurements ran after all owned browser jobs finished; process inventories immediately before/after showed no other test clients. Same960x540 scene; old/new/new/old order, two warmup and seven synchronized render/readback samples per condition; every moving shadow refreshed.

- Software88974: original medians1084.6/1083.3ms; optimized1029.0/1029.4ms. About5.05% less synchronized rendering time. Submitted triangles1,903,966 to1,421,326, a25.35% reduction, with99draws in both conditions.
- Hardware forced-optimization study: original6.1/5.8ms; optimized7.5/6.9ms with225draws and refreshed moon/headlight shadows. This regression is why production hardware retains the static buffer. The exact production-tier comparison above validates that choice.
- These are synchronized render/readback costs, not a claim of presented-frame FPS. The software scene still takes approximately one second per measured render and remains unacceptable. FV71 stays in progress. Stable allocations or correct routes cannot substitute for the missing full performance gate.

## Superseded prototype and next work

The initial36-mesh prototype preserved the art but added51draws in the working-beam view. It was replaced by the single-draw index approach. Its softwarecost33364 had concurrent UnderGreen browser work and is not isolated evidence. Historical receipts outside the `batched` directory refer to that prototype.

The ablation96750 identified significant reed and shading/shadow costs. Removing the rig also removes its descendant lights and their world shadow passes, so that result cannot attribute all savings to machine geometry. Next measure remaining fragment-lighting, alpha overdraw and static world-shadow work separately. Preserve every authored surface and physical shadow. FV13 atmospheric scattering and the remaining environment, pixel/material, Joe, story/UI and matched Level1 gates remain outstanding.

Final production/test source snapshots and hashes are in `output/final-cut/reed-culling/source/`. All owned test handles are terminal. No commits, deployment, agents or unrelated edits; server4187 is preserved.
