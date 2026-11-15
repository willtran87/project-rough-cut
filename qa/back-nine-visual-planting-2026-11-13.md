# Back Nine planting composition — partial visual upgrade

This advances the full 48-item visual goal. It is not a whole-level Level 1 parity acceptance.

## Implementation

- Added `web/back-nine-planting.js` to author the layout independently of rendering. Replaced repeated small border/roadside clusters with irregular lobed groups, lower plants at their edges, and 27 rough-ground pockets across nursery, wetland, range and clubhouse areas.
- 4,844 plants / 9,688 crossed cards, versus 4,816 plants previously. Distribution: 2,169 boundary, 1,570 verge, 1,105 authored-pocket plants. All 27 pockets contain plants after clearance filtering.
- Reused all six original Level 1 verge illustrations. Fern/hosta and evergreen groundcover dominate the nursery; reeds occur only near physical wet zones; dry grasses dominate the range; flowering/groundcover groups distinguish the clubhouse approach. No new atlas or texture.
- Added per-plant habitat tint, darker root shading and species-specific wind flexibility. Retained actual mower contact bending. Native shaded faces now retain the illustrated leaf detail using a modest material-coloured fill; software retains vertex-evaluated headlights/beacon lighting.
- Plant placement accounts for the full card width when clearing roads, footways, greens, fixtures and existing solids. It adds no obstacles and does not change navigation or collision rules.
- A separate attempt to lift the old rounded hedge surfaces was rejected after visual inspection: it added two shader variants without adequate visual improvement. `back-nine-surface-finish.js` is byte-identical to the previous pass's source manifest. Existing hedge silhouettes/materials still need a dedicated art pass.

## Evidence

- `node tools/verify-back-nine-planting.mjs`: every plant's sampled full footprint clears paths/solids; greens and fixture approaches retain clearance; all 27 pockets populated; habitat mixes differ and reeds stay in wetland; layout remains under 5,000 plants. Report: `output/back-nine-visual-upgrade/planting/layout.json`.
- `node tools/verify-back-nine-detail.mjs`: original ghost movement, plant path clearance, mower particle trajectory/pause/reset/reduced-motion and culling restore checks pass. Current plant count 4,844.
- `node tools/verify-back-nine.mjs`: all 12 driving/ejection routes and core movement, pursuit, collision, pause and no-checkpoint retry checks pass. No simulation source changed.
- `node tools/verify-back-nine-planting-browser.cjs output/back-nine-visual-upgrade/planting/accepted-final`: actual nursery/wetland/range/clubhouse views at 2560x1600; wind time advances with simulation, actual pause freezes it, reduced motion disables wind; 1280x720 and 390x844 captures. Final 27 programs / 46 textures, no page/console errors. Native screenshots inspected across all four habitats and smaller sizes. Earlier `final/` folder is the rejected hedge experiment, not accepted evidence.
- Installed client via `tools/verify-presented-client.mjs --back-nine --planting-art`: actual on-foot forward/turn/stop input traverses the nursery group, from (6,44) to approximately (12.24,59.00). Both bursts retain 960x540; average completion 49.6/48.1ms, p95 63.7/57.1ms. Both screenshots/state files inspected; no error artifact. Evidence: `output/back-nine-visual-upgrade/planting/client-foot/`. This ran before the temporary hedge experiment; the final reverted surface helper matches that tested source.

## Remaining work

BV14/15/17/18/42 advance but remain in progress: plant groups still need closer integration with authored roots/rocks/neglected corners; the six atlas species do not supply all requested brambles/saplings; wider district enclosure and middle-distance landmarks remain sparse. Existing rounded hedge beds are dark and geometrically simple. Broader player/mower/destruction/lighting/weather/camera/UI requirements and combined-load performance remain open. The earlier flooded-traversal software downscale is not resolved by this pass.

All owned jobs are terminal. Existing server4187 remains. No commit/deploy, Level1 modification, agent delegation or goal-status change.
