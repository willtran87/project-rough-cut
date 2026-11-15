# Back Nine planting composition

Partial BV14/BV15/BV17/BV18 progress: thirteen long planting compositions give the nursery, irrigation banks, night range and clubhouse more distinct foreground and middle-distance structure. This does not establish whole-level Level 1 parity or finish all vegetation species and landmarks.

## Change

`web/back-nine-planting.js` adds authored axes for fern edges, a glasshouse border, windbreak margins, wetland reeds, dry range drifts and abandoned formal planting. Curved interpolation, scalloped widths, shared clearings, staggered positions and height-dependent species create irregular masses. All use the original Level 1 six-panel verge atlas, existing wind, culling and mowing material.

The first layout looked like three parallel rows in gameplay; it was rejected. The curved version retains 841 new sweep plants and the existing 27 pockets. Shared occupancy removes 25 overlapping old plants, for 5,553 mowable plants total versus 4,737 previously (+816). Every sweep retains 33–105 plants after clearance checks. Raised beds, woody hedge foliage, routes, physics, navigation and AI are unchanged.

`web/chase-course-detail.js` fits the bases of ground-grown cards to the terrain, fading the correction upward. The old centre-height placement could differ from terrain by roughly 11.7 cm at a wide card edge in the sampled layout. The final actual merged geometry has 22,212 ground-contact vertices with maximum error 0.0048 mm. Raised planter cards retain their original base. This is baked during preparation, using the already sampled ground values; no new per-frame shader operation or terrain query.

Two import-map entries use `20261114-planting-composition-3`. No new asset, texture, light, shader or draw batch was introduced. Small existing scattered stones follow the revised detail-plant list; their count rises from 153 to 180. All placements remain decorative.

## Checks

Evidence: `output/back-nine-visual-upgrade/planting-composition`.

- `layout.json`: 88,848 footprint samples clear routes, solids and sand; green/fixture margins remain open; reeds occur only in wetland habitat. All thirteen sweeps and all 27 existing pockets retain plants.
- All 5,553 plants can be cut and retain their settled state in the same fixed 32KB mowing texture. Existing mowing tests pass deck bounds, pause, rewind, reduced motion, teleport rejection and 30/120Hz agreement (zero differing plants).
- `grounded-native` and `grounded-software`: fourteen normal chase-camera views across the course, before/after/return mowing views, reduced motion, 1280×720 and 390×844. Primary viewport 2560×1600. Actual images inspected, including nursery, range, wetland, clubhouse, flattened trail and phone layout. Pausing freezes physical state; restart clears mowing and retains checkpoint zero. No page/console errors.
- `before-native` is the saved original layout. `first-native` is the rejected row composition; `curved-native` predates the ground-contact fix. The accepted source is the grounded version.
- Fourteen matched district views retain 35 programs, 56 textures and identical draw counts. Visible triangles increase by 664–1,792 in those views. The normal nursery view adds 1,756 triangles.

The native two-world alternating profile uses the same renderer, fixed 960×540 resolution and GPU-completion fences, with 36 measured samples per candidate. Nursery median 8.0→8.0 ms, range 7.9→8.0 ms, road 6.8→7.1 ms. P95 results are noisy (range 10→13 ms, road 8.1→12.8 ms). Shared-host work limits timing conclusions; these are scoped measurements, not a regression-free performance claim.

Software alternating profile: nursery median 97.0→99.9 ms / P95 105.1→106.0; range 79.4→82.1 / P95 86.1→87.0; road 84.0→83.1 / P95 96.2→100.9. The added vegetation has a small measured cost in the two planted views. Software remains far below the desired frame rate and visibly coarse; no whole-level performance acceptance.

The installed standard client uses the existing `--foliage-mowing` fixture and `tools/fixtures/back-nine-mower-scars.json` for two normal movement/steering/rear-glance bursts. Native final state: Joe is charging at 14.8 m/s, with 77 plants cut (67 settled, 10 collapsing). Actual screenshot/state were inspected. Final native 2560×1440 observation is 11.96 ms average / 12.80 ms P95. The software client also completed: identical final physical state and mowing counts, with 131.17 ms average / 182.70 ms P95 at its 640x360 internal resolution. Both final page screenshots were inspected. Comparison audit passes all 20 paired states, native/software physical equivalence, served source bytes, import uniqueness, and matched resource counts. The saved evidence manifest hashes were verified.

Software high-resolution fidelity/performance, broad course composition, additional vegetation families and encounter framing remain open on the full 48-item ledger.
