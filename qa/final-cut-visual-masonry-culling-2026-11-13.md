# Final Cut static masonry rendering

Progress on FV71. Previous goal turn made verified progress on software reed culling. The full72-item visual objective remains active; this pass does not establish overall performance or Level1 art parity.

## Implementation

The software fallback partitions the five arena-wide masonry instance batches into75 batches on a16m grid. All7,576 original ashlar/coping pieces retain their exact Float32 transforms, shared bevel geometry, materials, surface coordinates and shadow behavior. Native camera and light frusta reject each bounded batch independently. Hardware retains its five original batches.

No stones, material detail, shadow casters or collision envelopes were removed. The total instance-matrix data is unchanged; there are more smaller buffers, not copied vertex/texture assets. Static batches are named for diagnosis. Scene disposal now calls dispose on each owned static InstancedMesh before renderer teardown, releasing their uploaded instance buffers explicitly.

## Evidence

- Shading ablation25941: refreshed shadows~1033ms; cached shadows~580ms; disabling shadow receivers gives no meaningful gain; removing local lights with shadow maps disabled~344ms. Hiding only rig meshes while retaining its lights does not reduce cost in this wall-facing fixture. This corrects the previous ambiguous no-rig-and-lights attribution. Ablations identify work; they are not changes to the game.
- Prototype91162 compares8/16/24m grouping. All output pixels match the original.16m gives similar cost to8m with fewer submitted draws;24m loses some gain. This exploratory run is not the final performance receipt.
- Hardware forced-algorithm check terminal PASS14 compositions/five sizes including2560x1600. Software57652 PASS the same14 comparisons at its actual render sizes. Every old/new framebuffer and culled/forced-full framebuffer comparison is byte-identical. All7,576 instance matrices are present exactly once and every transformed source vertex is inside its batch sphere.
- Ten principal views include the overlook, working headlight wall, shelter interiors/exteriors, near corner, north road and both side approaches. Checks refresh all active shadow-casting lights, including the close cab lamp. Eight additional camera turns verify stable139geometries and60hardware/57software textures after warming.
- Production hardware tier67778 separately matches the pre-change scene image exactly at2560x1600, with equal326draws/3,391,880submittedtriangles and five original masonry batches.
- Software lighting18646 PASS actual pump/bunker/pavilion wall occlusion, moving exterior illumination, four real lamp positions, pause, reduced motion, physical collapse, exact saved/reloaded pixels and shutdown. Its concurrent timing numbers are not isolated performance evidence.
- Disposal11305 PASS:110owned static instance meshes,85uploaded instance buffers; all85 are live before disposal and all are deleted afterwards, verified with gl.isBuffer.
- Installedclient98676 terminal exit0. Fresh screenshot/state inspected: ready/playing, intro completed, player y4.7372,960x540,75masonry batches/7,576instances. No error artifact.
- Native pump interior and software working-wall images inspected. Final isolated cost5112 completed normally.

## Final paired cost

All owned browser checks were terminal before measurement. Process inventories before/after showed no other browser test jobs. At960x540, the benchmark refreshes every active shadow-casting light, including the moving cab spotlight. Old/new/new/old order, two warmup and seven synchronized render/readback samples per condition:

- Original medians1248.7/1256.3ms; spatial masonry745.5/745.9ms: approximately40.46% less synchronized render time in this fixture.
- Submitted triangles1,864,436 to682,340, approximately63.4% fewer, with132 to194draws. The smaller batches trade more submissions for much less off-screen camera/shadow geometry work.
- Do not compare these absolute numbers directly with the preceding reed-only benchmark: this test also refreshes the cab shadow. This is a matched comparison of the masonry change, not a presented-FPS measurement or a general-device performance guarantee.
- The remaining~746ms software cost is still unacceptable. FV71 remains incomplete. Final timing receipt: `output/final-cut/masonry-culling/software-cost/report.json`.

## Remaining

Final source/test snapshots are retained under `output/final-cut/masonry-culling/source/`. All owned jobs are terminal. Continue profiling the remaining color-pass lighting/overdraw and non-masonry shadow work; retain FV71 as incomplete until complete-device frame pacing, worst-case effects and memory budgets are met. FV13 scattering and the remaining pixel/material, mower/Joe, environment, effects, story/UI and matched Level1 requirements remain outstanding. No new full-route claim follows from these geometry/lighting checks. No agents, commits, deployment, deletion or unrelated edits; server4187 is preserved.
