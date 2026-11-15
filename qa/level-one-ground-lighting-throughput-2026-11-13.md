# Level 1 ground-lighting throughput

Partial V10/V21 progress. The previous goal turn implemented fixed lantern lighting; this turn addresses its rendering cost without reducing source coverage, pixel detail or the requested darkness.

## Final change

The floor originally evaluated seven normal point sources and looked up nearby lanterns for every fragment. `course-ground-lighting.js` now assigns every source that can reach each 2m ground cell, then computes source vectors at its vertices. The current course has 47 sources: 40 existing lantern/station anchors and seven existing building/floodlight point sources. At most six can reach a cell. Every candidate is retained; there is no camera-based selection or source-count truncation.

`course-lantern-ground.js` represents the same 48×130m plane with 1,560 indexed quads: 6,240 vertices and 3,120 triangles. Position, normal, winding, UV scale and surface area match the original plane. Duplicate cell-edge vertices carry constant candidate IDs. This adds 3,118 triangles to the existing ground draw, with no extra draw, texture or scene geometry object.

The specialized material replaces only the floor's standard point-light loop and lantern lookup. Its inverse-square falloff, cutoff, colour, power and Lambert response match the original lights. Moon/ambient/hemisphere lighting, shadows, turf detail, wet-ground treatment and fog retain their original paths. Source uniforms update after floodlight/scene power changes, so outages do not lag a frame. Other scenery continues to use the existing fixed lantern field and normal sources.

Specialization requires a supported planar transform, finite shadowless inverse-square point sources and sufficient varying capacity. The current shader uses 18 vectors including its reserved existing varyings. Unsupported configurations use the existing generic lighting without losing sources or changing geometry. Material hooks restore on disposal; the existing world lifecycle disposes the replacement ground geometry.

## Rejected first candidate

Selecting only lanterns at ground vertices preserved their light but gave little consistent timing improvement because all seven larger lights still ran per pixel. That candidate was replaced by the complete ground-source specialization. Its source is archived in `output/level-one-lantern-throughput/lantern-only-candidate.js`.

Comparing original and tessellated geometry initially showed seven larger channel differences at wall/prop contact edges in one 512px software fixture. Interior shading remained within one value. The lighting oracle now compares identical tessellated geometry with ordinary physical lights; the separate geometry test proves the original plane/UV/normal invariants. Full-level before/after screenshots are also inspected for seams or visible contact changes. This distinction avoids misclassifying a geometry-rasterization edge difference as a lighting error.

## Verification

- `verify-course-lantern-ground.mjs`: 18,720 sampled triangle positions retain every reachable source, including different-radius normal lamps and a parent-transformed source. Verifies constant candidate IDs, no duplicates, exact plane area, winding, UVs/normals, power/visibility updates, insufficient-capacity and shadow-caster fallbacks, disposal and restored material hooks.
- `verify-course-lantern-field-render.cjs --ground`: five physical-reference views on each renderer, including mixed lamp colours/ranges and an outage. Maximum channel difference1/255; no errors. Reports under `output/level-one-practical-lighting/field-reference-*-ground`.
- `verify-course-ground-lighting.cjs`: 28 full-course comparisons on each renderer (seven positions × two turns × normal/outage). Optimized ground versus the original generic lantern field and normal point-light shader. Maximum difference1/255. Reports under `output/level-one-lantern-throughput/reference-*`.
- `accepted/after-native/report.json` and `accepted/after-software/report.json`: all four course checks pass, including pause, movement, flicker, unchanged28-lantern symmetry/ambient.005, stable warmed resources and rebuild. Current texture counts104; program counts98 native/107 software. The ground specialization is confirmed active with47sources/six maximum candidates.
- Captures cover2560×1600 (native scene2492×1402),1280×720 and390×844. Native dead-green, phone and ordinary-desktop opening, software dead-green and standard-client gameplay captures have been visually inspected. Paired lanterns retain their pools, ground texture remains visible and no cell seams were apparent.

## Final timing and client evidence

The last interleaved benchmark alternated baseline and optimized paths in ABBA order within the same scene, with 24 warmed samples each. Baseline uses the original two-triangle floor and generic lighting. Both renderers finished without errors. Medians in milliseconds:

| Renderer | Opening before → after | Audit before → after | Pond before → after |
|---|---|---|---|
| Native | 12.5 → 11.7 | 12.7 → 12.3 | 10.6 → 8.9 |
| Software | 127.3 → 122.3 | 116.9 → 112.2 | 147.0 → 143.3 |

Tail results are mixed: native opening p95 rose13.9→14.3ms and software audit171.5→171.9ms. Other p95 values improved. These limited fixtures support modest median savings, not a general frame-rate guarantee. Separate browser launches varied substantially and are not used for a precise speedup claim. Reports: `output/level-one-lantern-throughput/reference-{native,software}/paired-budget.json`.

The installed game client completed eight iterations and reached first_hole; shot-7 was inspected. Its adaptive640×360 run reported132.8ms average completed scene and276.8ms p95, still failing `gameplay_frame_budget`. No performance acceptance is claimed. All owned lighting jobs, including the paired benchmark handle79270, reached terminal state. CPU geometry report and eight source hashes are saved alongside the artifacts.

## Scope and remaining work

The full V01–V21 visual-upgrade ledger remains active. Source shadows/structural light blocking, broader composition and material consistency remain unfinished. Software performance was already below the gameplay-frame-budget gate; bounded timing improvements do not establish full performance acceptance. Preserve fixed lighting, all28 symmetric path lanterns, low ambient, Joe's larger mower/no beacon and organic ghosts.
