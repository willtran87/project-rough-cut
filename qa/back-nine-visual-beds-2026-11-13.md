# Back Nine planted beds — partial visual upgrade

This advances the full 48-item objective. Whole-level Level 1 parity remains unverified.

## Implementation and visual review

- Fifteen existing hedge/tree beds receive irregular ground edges, 135 low shrub cores, 675 illustrated plant clumps, 75 tapered curved roots and 60 half-buried stones. Existing tree placements are grounded on terrain. Collision/navigation footprints are unchanged.
- Reuses Level 1 fern/hosta and evergreen illustrations in the existing foliage atlas. Variable-width crossed cards support broad leaf clusters independently of plant height; existing wind, lighting, contact bending, pause and reduced motion apply.
- The initial `beds/pass1` rendering was rejected: its broad rounded cores looked like dark cushions. Selected `beds/pass2` reduces the opaque cores, varies crown spacing/heights, overlaps five leaf clumps per crown, and breaks up the ground edge. Native nursery/clubhouse screenshots visibly show individual leaves replacing those broad smooth bases.
- Runtime total is 5,519 plant clumps / 11,038 cards, including the unchanged 4,844 verge/pocket plants. Native resource count remains 27 shader programs / 46 textures. This does not prove equal GPU cost: overdraw and geometry increased.

## Verification

- `node tools/verify-back-nine-bed-craft.mjs`: finite root geometry/normals, terrain-relative buried tips, roots inside existing beds, full foliage widths inside the bed margin and clear of roads/footways. Fifteen beds / 285 opaque pieces. Evidence: `output/back-nine-visual-upgrade/beds/contracts.json`.
- Existing `verify-back-nine-planting.mjs` and `verify-back-nine-detail.mjs` pass. These cover the pre-existing 4,844-plant layout and ghost/particle/culling behavior; the dedicated bed test covers the new plants.
- `node tools/verify-back-nine-planting-browser.cjs output/back-nine-visual-upgrade/beds/pass2 --beds`: four actual on-foot views at 2560x1600, plus 1280x720 and 390x844. Wind advances, actual pause freezes it, reduced motion suppresses it. No page/console errors. Nursery, clubhouse and both smaller clubhouse captures inspected. The view called `wetland` is actually a west-side nursery bed at the authored test coordinates, not a wetland species acceptance.
- Installed gameplay client through `verify-presented-client.mjs --back-nine --beds-art`: `beds/client` reaches the existing bed collision boundary at approximately (33.18,64.64), turns, and stops. Both captures stay 960x540; frame completion average 52.2/52.3ms, p95 59.4/62.7ms.
- Installed client with `tools/fixtures/back-nine-beds.json`: `beds/client-around` approaches that boundary, turns away and leaves it. Final positions (26.91,64.12), then (23.04,59.08). Both final captures are 800x450 after one automatic resolution reduction; averages 49.3/38.6ms, p95 58.8/47.3ms. Final screenshots/state inspected. No error artifacts. These are movement/fidelity observations, not a sustained performance acceptance.

## Open work

BV14/16/17/42 remain partial. Roots are implemented and geometrically checked but mostly hidden by branches/leaves in ordinary views; their visual composition needs further work. Broader trunk/bark/limb/ivy detail and district-specific bed species remain. Other large smooth shrub forms elsewhere in the scene still need treatment. Mobile HUD occupies too much of the narrow gameplay stage. Software quality loss during the longer traversal and prior flooding pass remains unresolved under BV48. No full combined chase/flood/destruction stress acceptance.

All owned browser jobs are terminal. Existing server4187 retained. No commit/deploy or goal completion.
