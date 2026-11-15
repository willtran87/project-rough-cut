# Back Nine shrub and planting-strip craft — partial

Continues the full 48-item visual objective; does not establish whole-level Level 1 parity.

## Changes

- Replaced 44 broad smooth border-shrub forms with overlapping illustrated evergreen growth and smaller concealed cores. Border placement remains beyond the playable fence.
- Added layered fern/hosta faces and crowns to all three tall windbreaks. Their opaque centres retain functional visual cover, inside the original footprint and above runner eye height. Segmented geometry gives the top and sides an uneven profile instead of a ruler-straight box.
- Five destructible planting strips now carry nursery ferns, dry range grass or clubhouse flowers. Ninety plant clumps belong to the existing three collapsing chunks per strip, so the leaves move with destruction rather than staying suspended in the opened gap.
- Foliage rendering accepts variable-width and single-face cards. Single faces on windbreak sides avoid unnecessary planes projecting across the lane. World-space wind/contact/light positions support foliage on moving chunks. Vehicle-part batching preserves the foliage atlas UVs instead of replacing them with generic projected UVs.
- Reuses the existing Level 1 atlas/material: 924 added shrub/strip clumps; total 6,443 clumps / 12,606 cards. Native 27 programs / 46 textures, software 34 programs / 46 textures. Counts are resource observations, not performance equivalence.

## Verification

- `verify-back-nine-shrub-craft.mjs`: finite geometry/normals, 832 core vertices, original opaque cover footprint/eye-height coverage, variable top profile, planter foliage within destructible footprints, border foliage outside the playable fence.
- `verify-course-destruction.mjs`: all 23 destructible feature types/instances retain Joe-only destruction, player collision, opened camera/ejection/cart gaps and reset behavior. Actual simulated pursuit drives through the parked cart. This preserves existing physics; it is not a claim of new material-specific impact mechanics.
- Existing detail and bed-craft tests pass after the foliage changes.
- `verify-back-nine-shrubs-browser.cjs`: final native run `native-final` passes 21 views, including whole/falling/settled states for all five planting strips, four border/windbreak compositions, and 1280x720 / 390x844 views. Initial viewport 2560x1600. Uses the actual mower collision resolver to initiate destruction, then advances the simulation/animation; it does not fake the broken flag. Pause freezes the simulation clock and actual restart restores unbroken strips. No browser errors.
- Software `software-final` passes 12 views, including two strips through the same destruction sequence, all four compositions, both responsive sizes, pause and restart. Its 2560x1600 viewport renders through the existing lower-resolution software budget; it is not a native-resolution acceptance.
- Inspected native border, hedge, nursery and range planter artwork, falling/settled aftermath, and both responsive sizes; inspected software nursery planter. `pass1`/`native` and `native2` retain intermediate designs; final selected hedge geometry is in `native-final` / `software-final`.
- Installed gameplay client via `verify-presented-client.mjs --back-nine --shrubs-art` and the approach/turn/leave action fixture: both screenshots/states inspected. Player moves to (6.23,96.76), then (4.63,90.61), remains on foot, no damage/destruction caused by player. Both bursts 960x540; completion average 40.0/37.9ms, p95 48.7/46.8ms. No error artifacts. Evidence: `output/back-nine-visual-upgrade/shrubs/client`.

## Remaining requirements

Vegetation, material-specific destruction and aftermath remain partial. Collapse still flattens the strip too uniformly; it needs recognizable scattered masonry/soil/branches and material-specific impact effects. Hedge leaf scale/repetition and broader species diversity need further art review. The previous software traversal/flooding downscales are unresolved; this shorter successful client run does not close the combined-load fidelity gate. Narrow mobile HUD still obscures too much gameplay. Player/model quality, machinery, lighting/weather, environment stories, camera/UI and the other full-scope items remain open.

All owned browser processes are terminal. Server4187 preserved. No agents, commits, deployment or goal completion.
