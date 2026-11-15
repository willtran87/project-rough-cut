# Final Cut remaining static scenery rendering

Progress on FV71, within the full 72-item visual implementation goal. The preceding comprehensive-list turn made no implementation progress; this pass revalidated the remaining render cost and changed the production software path. Overall Level 1 parity and performance acceptance remain open.

## Implementation

The software renderer now also partitions the non-masonry static scenery on a 16m grid. The 4,349 original instance transforms, source geometry, materials, texture coordinates and shadow flags are retained. These materials use 230 batches instead of 35; including the previously partitioned masonry, the software scene owns 305 static batches containing 11,925 instances. Hardware keeps its original 40 batches.

Metal box/cylinder batches deliberately retain their original grouping. The first unrestricted prototype changed 479 pixels at overlapping metal fittings in the high-resolution overlook view because sorting the smaller meshes changes which coincident surface wins. Keeping that material unchanged reduced the same view's difference to two pixels. No visibility or collision workaround was introduced.

Bounding spheres include every transformed source vertex. Each camera and each light independently culls the new meshes. Static instance buffers retain the explicit disposal introduced in the previous pass. Graphics statistics expose the total static batching separately from masonry batching.

## Investigation

- `tools/profile-final-cut-light-branches.cjs` tests skipping spotlight/point-light work after Three's existing zero-contribution test. All sampled pixels matched, but wall timing worsened and the close-mower timing showed no consistent gain. This shader change was rejected and is not present in production.
- `tools/profile-final-cut-static-culling.cjs` explored 16/24/32m cells, initially including metal. The wall fixture showed about 16% lower cost at 16m, with one differing overlap pixel. This prototype result is not the final production timing result, since metal was subsequently excluded.

## Verified evidence

- Native forced-algorithm check 49297 and software 4327 passed 14 compositions at five viewport sizes, beginning at 2560x1600. Exact source-instance coverage, Float32 transforms, shared materials/geometry, shadow flags and transformed-vertex bounds were checked.
- New culled versus new forced-visible rendering is byte-identical in every tested view, including refreshed active lamp shadows. Original versus regrouped rendering has small coincident-edge differences: up to 163 pixels in the native bunker view and 25 in the software bunker view. These comparisons do not claim byte-identical original images. Inspect the per-view reports for exact deltas.
- Native production-tier comparison 54725 passed: exact screenshot bytes, 326 draws and 3,391,880 submitted triangles before and after. Hardware uses no new partitioning.
- Disposal 4724 passed: all 241 uploaded static-instance buffers were live before disposal and deleted after disposal; 305 owned meshes.
- Native bunker and software working-wall screenshots visually inspected. Mesh/texture resource counts remain stable through additional camera turns.
- Full-route and installed-client runs finished successfully; terminal receipts and isolated paired timing are recorded below.

## Remaining

FV71 is incomplete. No full-level frame-rate acceptance follows from culling improvements. Keep the remaining art, material, composition, machinery/Joe, effects, story/UI and matched Level 1 requirements active. The next visible priority is signage/focal hierarchy and differentiated refuge construction, while retaining the performance work and addressing remaining bottlenecks with evidence.

Full-route follow-up: 57685 terminal PASS. Three uninterrupted real-input direct/garage/drain finales, four heard ball redirects, both bank/open crossings, pump/bell/collapse/road and completion, zero captures and browser errors. 77 screenshots retained; direct completion screen inspected. This route test uses the unchanged hardware production path. The software partitioning is covered by the separate geometry/pixel checks, not by a software full-route claim.

Installed-client follow-up:21953 terminal exit0. Fresh shot-0.png/state-0.json inspected: ready/playing, intro completed, player(-1.8880,4.7372), yaw.05/pitch.2, software960x540,305static batches/11925instances. No error artifact. All other owned tests were terminal and the node process inventory showed no other browser tests before isolated benchmark92019 began. Seven final source/test snapshots with SHA256 manifest are retained under output/final-cut/static-culling/source/.

## Final isolated timing

Benchmark92019 completed normally. No other node browser-test jobs were present before or after the run. Each960x540 fixture refreshes all active shadow-casting lamps, including the cab, and synchronizes rendering with framebuffer readback. Each condition uses two warmups and seven measured samples in old/new/new/old order. Values below average the two medians for each condition:

| View | Original batches | Spatial batches | Reduction |
| --- | ---: | ---: | ---: |
| Working wall | 759.45ms | 657.80ms | 13.38% |
| Overlook | 1172.45ms | 1092.20ms | 6.84% |
| Close mower | 953.10ms | 855.35ms | 10.26% |

Submitted triangles fall from682,340 to595,664 at the wall,1,220,154 to1,161,682 at the overlook, and838,488 to754,464 at the mower. Draw submissions increase as expected. The production change improves all three paired conditions, but these absolute software costs remain unacceptable. This is synchronized render/readback cost, not presented FPS or hardware-device performance acceptance.

Final receipt: `output/final-cut/static-culling/software-cost/report.json`. All owned jobs are terminal, and all seven source/test snapshot hashes match the current files. The ledger remains17complete/26in_progress/29pending. Next visible work: FV34 signage/focal hierarchy and FV27 refuge identity against Level1; retain unfinished FV71 and all other visual gates. No agents, commits, deployment, deletion or unrelated production changes. Server4187 remains available.
