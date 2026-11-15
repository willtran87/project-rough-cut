# Back Nine — footpaths and minor route wear

Partial BV08 implementation; the full 48-item objective remains active. This closes the unfinished minor-route pass, not the whole surface-transition requirement or Level 1 parity.

## Implementation

- Three footpaths now have a feathered soil bed and narrow turf fringe following the shared rounded centreline. Removed both old overlapping opaque bedding strips. Soil sits .036m above terrain, beneath the unchanged .042m stepping stones.
- Three shortcuts and fourteen service spurs now have irregular turf shoulders and illustrated twin soil tracks. Service connections use the same feature-to-route projections as before. Soil fades where these tracks meet paved corridors.
- Five cart apertures retain twin tire scuffs, now feathered rather than opaque rectangular strips. Their scuffs can remain on paving intentionally.
- Existing 1254-square ground and sediment art, shared materials, wet masks and explicit turf-before-soil layer order are reused. No new texture handles. Cache versions updated in Back Nine HTML.
- No movement, collision, AI, bell, checkpoint or difficulty changes.

## Evidence

`output/back-nine-visual-upgrade/minor-routes` links to `D:/CodexArtifacts/project-rough-cut/visual-upgrade/minor-routes-20261114`.

- `before-native`, `native`, `software`: six matched high-resolution views (shortcut, service spur, cart aperture and three footpaths) at 2560x1600, plus 1280x720 and 390x844. Browser checks passed, including pause/restart, actual material layer order, stable resources and no console/page errors. Native reports 30 programs / 53 textures; software 37 / 53.
- Images inspected: matched range-foot before/after, native shortcut, spur, garage footpath, software portrait footpath, and both final client gameplay frames. Soil leaves the pavers visible, tracks blend at paving, and foot openings remain legible at desktop size. Portrait HUD still obscures much of the small stage.
- `client-native`, `client-software`: installed standard client through `tools/verify-presented-client.mjs --back-nine --minor-routes --high-resolution`, fixture `tools/fixtures/back-nine-minor-routes.json`, two 60-frame forward bursts. Start (-36.5,342), intermediate y348.857, finish y356.057; both remain on path and cross the range gate at y350. Screenshots and text states inspected; no error artifacts.
- Native client buffer 2560x1440, final average11.43ms / p9512.5ms. Software640x360, final average192.33ms / p95236.3ms. These are short harness samples; software is below the required quality/performance bar.

## Geometry and movement checks

`node tools/verify-back-nine-route-margins.mjs` passes 3,709 pieces, 105,051 vertices and 141,743 triangles. Vertex and triangle-centroid terrain clearances remain within tolerance; RGBA feathering and upward winding are checked. Course data/navigation state are unchanged by construction.

`node tools/verify-back-nine-minor-routes.mjs <baseline-source/chase-route-art.js>` passes exact pre/post retained clue geometry/placements: all141 pavers and jamb hardware, SHA256 `79e47b5b4c652d425e3a3b82806181d8f5d82e09f1440781ba8ba52f5178500a`. Service-spur endpoints remain on their feature and authored route. Foot bedding maximum measured width1.17347m; soil height .036m. All three footpaths pass current simulation movement at30/60Hz, covering6.908/6.857m in one second, reaching7.2m/s, with path classification and no collision throughout.

The older `verify-chase-footpath-surfaces.mjs` passes its dense surface classification loop but stops at an obsolete hard-coded navigation signature: expected2693326411, current1799212627. It is not reported as passing or silently weakened. Current minor-route geometry/behavior checks are independent of that historical signature.

Two initial standard-client invocations failed due to harness arguments (wrong start selector, then missing `?test`); corrected runs finished successfully. These were test setup failures, not gameplay results.

## Remaining

Fixed-view software budget at960x540 uses saved pre-pass scene/landscape/terrain/route-margins/route-art sources, eight warm frames and40 GPU-fenced samples. First order: baseline median91ms/p95111.6ms, current141.1/158ms. Reverse order: current134.9/188ms, baseline135.3/163ms. Draws139 to136, triangles169410 to172867; programs37 and textures53 remain equal. Other active browser tests were observed on this shared host. The timing difference is inconsistent across order, so this does not establish a regression-free pass or a reliable isolated cost. Both versions' software performance remains poor.

Bunker joins, broader court/gravel wear, repetitive ground artwork, actor/detail parity, contact shadows, composition, ghost presentation, portrait UI and combined-load performance remain open under the full ledger. The minor-route pass adds geometry; fixed-view measurements do not establish whole-level performance.
