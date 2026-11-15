# Back Nine: open fairways and routes

The user identified the open fairways and routes as the part that still felt artificial. This pass reorganizes that space while retaining the existing chase and route choices.

## Changes

- Broadened the six curved fairways, with baked vertex-color collars blending the mown strips into surrounding rough. All six now terminate at a putting green; added the missing seventeenth green and adjusted nearby green positions/shapes to fit the available turf.
- Moved tee markers to the starts of the holes. Greens have shallow irregular contours instead of exact circles.
- Relocated and reduced optional planting beds toward the course boundaries. Fifteen beds remain after the existing route/foot-gap/feature-clearance filters. Existing sightbreaks, service features, gates, routes and objective positions remain intact.
- Smoothed the main route's visual bends. Secondary routes use muted compacted wheel tracks. Shortcut tracks now sit below pavement at intersections rather than drawing black rails across it. These use spatially culled ribbons and existing textures/material batches.
- Darkened the sky further while adding a restrained ground-only night fill so mown turf and route choices remain readable. No additional lights, postprocessing layers, particles or texture assets.
- Rebuilt mower navigation for the moved planting. Signature 2693326411, 4410 nodes. Updated browser import revisions.

## Verification

- `verify-fairway-navigation.mjs`: 68 baked routes match the live-clearance fallback; zero runtime edge checks for the bake; planted beds clear driving corridors.
- `verify-back-nine-choices.mjs`: five cart gaps, three foot gaps, reachable mower detours, seven tight driving branches, feasible interception, relay-gated damage, late ram/ejection/on-foot victory and retry restoration all pass.
- `verify-runner-controls.mjs` and `verify-mower-ram.mjs`: steering, camera/look-back, fence sliding, charge recovery, siren reduced motion, solid contacts and post-ram escape windows pass.
- `verify-fairway-design.cjs`, hardware and SwiftShader: eight course views at 2560x1600, plus 1280x720 and 844x390. No browser errors; six greens, six fairways, two reservoirs, four service courts and 148 lanterns confirmed. Screenshots inspected.
- `verify-fairway-views.cjs`: driving views and diagnostic overhead views confirm fairway/green alignment and border planting. The overhead camera/fog are test-only and do not represent the gameplay view.
- Installed standard Playwright gameplay client: two on-foot input sequences completed, latest screenshot/state inspected, no error artifacts. Browser steering test also completes the powered garage on foot.
- Release verification: 90 action scenarios, 67 referenced runtime images, no missing assets or warnings.

## Rendering cost

Evidence is in `output/fairway-design/`. The paired test renders old/new worlds alternately on the same renderer at a fixed 960x540, with 48 samples per version/view and static camera/state. It includes the original planting/nav snapshot. The full-page captures are visual fixtures; they are not complete human playthroughs.

| SwiftShader view | Median before → after (ms) | p95 before → after (ms) |
| --- | --- | --- |
| Wet lane and mower | 46.1 → 46.0 | 57.4 → 50.0 |
| Reservoir shore | 35.9 → 37.0 | 39.9 → 42.2 |
| Green | 39.0 → 38.0 | 47.0 → 47.0 |
| Runner and foliage | 36.1 → 37.0 | 43.9 → 39.9 |
| Clubhouse | 33.1 → 34.0 | 37.8 → 39.1 |
| Mower facing camera | 32.8 → 34.0 | 38.1 → 49.6 |

CPU scene-update p95 stays at or below 0.6 ms in the current paired samples, with zero new GPU buffer allocations during the samples. Standalone software scenes retain 128 static batches, 22 compiled programs, 36 textures and 140 trees. Cullable pieces increase from 4893 to 4936. Hardware static-view medians remain approximately 6 ms.

These results support a small median-cost change, not a claim that software spikes are fixed. Tail timings remain mixed, especially facing the mower. The sequential full-course test is useful for visual/console checks, but its before/after timings vary with system load; use the alternating fixed-resolution test for comparison.

## Later human playtest

Check whether the maintained fairway shapes and wheel tracks explain route choices at chase speed, and whether the darker skyline remains readable on the player's display. Human playtesting remains deferred as requested. The movement, damage, pursuit tuning and objectives were not redesigned in this pass.
