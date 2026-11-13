# Back Nine player character detail

The player now has a shaped jaw/chin/nose, tired eyes and brows, stubble, layered swept hair with strand texture, shaped ears and sideburns. The work shirt has continuous folds, twill, stitching, a collar, pocket, badge, buttons and belt loops. Hands include thumbs, fingers and knuckles; trousers and work boots have pockets, cuffs, laces, toe and sole detail.

Driving uses the same character geometry and materials as running. Its seated pose is prepared and merged into nine material batches before play; the animated on-foot version retains 24 meshes. The old primitive seated driver is removed. Hands are checked against the steering rim. Collision hulls, steering controls, automatic camera and Joe's simulation are unchanged.

## Verification

- Before/after model views and running/turning/reversing checks at 2560x1600, plus 1280x720 and 844x390 views. Screenshots inspected, including the face, rear silhouette, driving pose and ordinary chase camera. Reworked initially exaggerated features and raised clothing pieces after inspection.
- Feet remain approximately 0.012–0.024 m above ground throughout sampled strides; facing stays within the existing 15-degree allowance. Seated hand centers are within 0.09 m of their steering-rim targets.
- Software ejection checks pass both directions, rotated seats, immediate movement, pause and reduced motion without new runtime buffer allocations. Run-over animation, death and associated sound/resource checks pass.
- Automatic camera/steering and on-foot finale checks pass. Installed standard Playwright client passes two action iterations; no browser errors. Release verification passes 90 scenarios, 67 runtime images / 26 MiB.
- Hardware/software comparison evidence: output/player-craft/hardware.json and software.json. Ejection/death evidence: output/cart-ejection and output/runover-drama.

## Cost and limits

Animated model triangles: 4,054 → 10,594; meshes remain 24. The seated version adds six draws over the original three-batch primitive driver. One additional generated 128x128 hair texture (37 scene textures instead of 36); shader count unchanged (22 software). No additional downloaded assets, lights, postprocessing or per-frame geometry construction. Seated geometry is allocated during preparation, and ejection reuses the already-prepared animated actor.

Hardware view samples remain around 6 ms GPU completion. Isolated software comparisons added about 0.4–1.8 ms to the median on-foot view; the final sample was 29.1 → 30.9 ms median and 36.2 → 36.0 ms p95. Seated-view final sample was 35.9 → 35.1 ms median and 42.2 → 46.9 ms p95. These short samples vary and are recorded in the JSON evidence; this detail pass is not a claim that existing software rendering stalls are resolved. Visual comparison and automated animation checks do not replace a human full-chase playtest.
