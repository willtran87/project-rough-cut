# Back Nine herbaceous groups — 2026-11-14

The actual windbreak traversal exposed a nearly continuous, shoulder-high fern ribbon. `web/back-nine-planting.js` now shapes three planting sweeps into eight authored islands: three at the nursery entrance, three beside its windbreak, and two at the clubhouse approach. Width and height feather down at each island's ends, with two metres or more between source envelopes. This is partial BV14/BV17/BV18 progress, not whole-level composition acceptance.

The first clubhouse candidate failed the existing population check: most of the old axis ran through protected turf and never produced visible plants. The final axis follows the entrance before the green and yields two actual groups. The test threshold was retained. Ten other planting sweeps are exactly unchanged. Existing textures, materials, wind, mowing and terrain anchoring are reused.

The three affected sweeps change from 239 to 133 plants. Plants taller than 1.2 metres change from 130 to 13, retaining taller focal clumps and lower edges. Freed occupancy admits three existing background plants: total 5,553→5,450. No collision, input, simulation or AI changes.

Evidence root: `output/back-nine-visual-upgrade/herbaceous-groups`.

- `groups.json`: all eight islands populated (12–21 plants per sampled group), source gaps/feathered height verified, ten unaffected drifts exactly equal baseline. Total planting count falls by 103.
- `layout.json`: all 5,450 plants pass full route/solid/sand/green clearance, with 87,200 sampled perimeter points. All 27 pockets and 13 sweeps retain plants. Every plant is mowable and settles in the unchanged 32KB memory texture.
- `before-native`, `final-native`, `final-software`: 15 matched views each. Main viewport 2560×1600; additional 1280×720 and 390×844. Actual native nursery, clubhouse, traversal and software phone/traversal images inspected. Pause freezes full run; restart checkpoint is zero; browser errors empty.
- `comparison.json`: all paired player/cart/Joe/time/objective/checkpoint/service/utility/navigation/destruction/failure states match. All checked native draw counts unchanged, programs remain 36 and textures 56. Scene triangle differences range −688 to +80; the small scattered-stone set follows plant-list indices and accounts for differences outside edited sweeps.
- Installed standard client, two actual movement/turn bursts each: both renderers end at player `(-5.527627985350055,137.74765124121095)`, identical to the preceding hedge pass. The previously obscured runner's legs are visible in both final page captures. Native canvas 2560×1440: final average 12.31 ms, P95 13.70 ms. Software adapted to 800×450: average 50.92 ms, P95 57.70 ms. Adaptive resolution and host load differ from the earlier pass, so these figures do not prove a speedup.
- `tools/audit-herbaceous-groups.mjs` verifies state/resource comparisons, both client outcomes, no client error artifacts, served source bytes and unique import keys. Accepted source/test snapshots and evidence manifest retained. Production changes are one planting module and its import version `20261114-herbaceous-groups-2`.

`first-native` predates the clubhouse-axis correction and is not final evidence. The initial layout assertion failure is resolved in final source; no assertion was relaxed.

Further work remains: broad fairway/middle-distance composition, additional woody/species silhouettes, larger architectural focal points, intentional Joe encounter framing, camera readability in other situations and whole-level performance. Software retains coarse rendering and pre-existing lighting differences. This pass improves grouping and local runner visibility; it does not establish full Level 1 parity or complete all 48 items.
