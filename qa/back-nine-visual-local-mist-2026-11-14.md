# Back Nine localized mist

BV40 is accepted at its stated scope: selective mist/haze that preserves interaction and escape clarity. The full 48-item visual upgrade remains unfinished. Headlight scattering, broader lighting/material parity and whole-level software performance remain separate open requirements.

Three shallow banks now occupy the nursery drainage hollow and the east/west reservoir hollows. They fade upward, drift slowly with simulation time, and stay anchored to the world as the camera turns. Near props and actors occlude the bank because extinction stops at the visible surface. A 42% opacity ceiling preserves silhouettes through overlapping banks. Reduced motion freezes drift; pause and rewind preserve deterministic placement. The existing distant valley haze remains.

Implementation is isolated to `web/back-nine-local-mist.js`, five integration edits in `web/back-nine-scene.js`, and two versioned import-map entries (`20261114-local-mist-4`). No new mesh, texture, render pass, collision, AI or irrigation rule. Final single-world counts remain 35 programs / 56 textures, with unchanged draw and triangle counts across all sixteen matched scenes.

## Visual evidence

Evidence root: `output/back-nine-visual-upgrade/local-mist`.

- [Previous reservoir](../output/back-nine-visual-upgrade/local-mist/final-before-native/east-bank-2560.jpg) → [localized reservoir bank](../output/back-nine-visual-upgrade/local-mist/vertex-native/east-bank-2560.jpg).
- [Joe through the nursery bank](../output/back-nine-visual-upgrade/local-mist/vertex-native/joe-through-bank.jpg) retains the mower silhouette, control lettering and escape junction.
- [Flooded state](../output/back-nine-visual-upgrade/local-mist/vertex-native/manual-flood.jpg), [dry state](../output/back-nine-visual-upgrade/local-mist/vertex-native/dry-bank.jpg), and [phone layout](../output/back-nine-visual-upgrade/local-mist/vertex-native/bank-390.jpg) were checked.
- [Actual native chase](../output/back-nine-visual-upgrade/local-mist/client-native/page-1.png) and [software chase](../output/back-nine-visual-upgrade/local-mist/client-software/page-1.png) were opened and inspected after the installed standard client's two movement/steering/rear-glance bursts.
- [Cart at the west hollow](../output/back-nine-visual-upgrade/local-mist/cart-native/west-cart-2560.jpg) verifies the higher driving camera. All three hollows were also captured in software cart mode.

Compared against Level 1's [floodlight haze reference](../output/level-one-floodlight-craft/after/approach-2560.png): the same restraint is retained—foreground surface detail, equipment edges and interaction cues remain visible through atmospheric effects. This comparison accepts the local mist treatment, not overall Level 1 parity.

The first mist was too faint and was rejected. The revised full per-pixel version established the visual reference but was too expensive in software. Final integration evaluates the same ellipsoid chord at existing mesh vertices and interpolates optical depth. The sixteen native comparisons against the per-pixel reference have mean channel differences below 0.25/255 in the recorded crops; actual images show no conspicuous holes, planar seams or lost control/actor detail. Pixel differences alone were not used to accept quality.

## Verification

- `tools/verify-local-mist.mjs`: 360 rays compared with 4,000-sample numerical integration; maximum integral error 5.94e-7 and segment-additivity error 1.46e-13. Zero-length/outside/above-bank cases, view independence, simulation drift, rewind, reduced motion, distant culling, and four material families pass.
- `tools/verify-local-mist.cjs`: sixteen scenes each for final native, software and the saved pre-mist baseline. Covers all hollows, approaches/reverse view, Joe, drift, manual flood/dry transition, relay and distant clear views, pause, restart, reduced motion, 2560x1600, 1280x720 and 390x844. All physical fields match baseline and both renderers; no page/console errors.
- `tools/verify-local-mist-carts.cjs`: three cart-camera scenes in each renderer, matching physical states and no page/console errors.
- `tools/verify-presented-client.mjs --back-nine --local-mist --high-resolution`: installed standard client, two input bursts in each renderer. Final player (-6.5147,241.3377), Joe (-10.3436,229.0164), charging at 14.8 m/s, checkpoint zero. Physical states match exactly across renderers. Final native 2560x1440 average 11.67 ms / P95 12.90 ms; software 640x360 average 110.55 ms / P95 151.80 ms.
- `tools/audit-local-mist.mjs`: matched sixteen states/resources, three cart states, both actual-input bursts, served-source byte equality and unique import keys. Accepted production/test sources and SHA256 evidence manifest are retained.

## Measured cost and limits

`profile-native-vertex` and `profile-software-vertex` use two prepared worlds on the same renderer, alternate short blocks, and fence GPU completion at 960x540. Each candidate has 36 samples per view. Shared host activity limits broader timing conclusions.

| View | Native median before → after | Software median before → after |
| --- | --- | --- |
| Nursery mist | 7.0 → 8.0 ms | 89.1 → 89.9 ms |
| Reservoir mist | 7.0 → 7.8 ms | 74.0 → 77.6 ms |
| Clear opening road | 7.0 → 7.1 ms | 65.9 → 65.7 ms |

Software P95: nursery 130.0→98.4 ms, reservoir 80.2→83.6 ms, road 70.0→69.9 ms. Native P95: 11.8→12.0, 11.5→11.0 and 8.1→11.1 ms. No claim that the entire level meets its performance target: software is still slow and coarse, and its pre-existing lighting differences remain visible.

The initial `profile-native` report is explicitly invalid because the adapted harness accidentally loaded old planting in its baseline. That route was removed before all accepted profiles. `first-native`, `second-native`, `final-native`, `final-software`, `profile-software`, and `profile-software-optimized` document earlier variants; accepted current renders use `vertex-native` / `vertex-software`, and accepted timings use the `-vertex` profiles.
