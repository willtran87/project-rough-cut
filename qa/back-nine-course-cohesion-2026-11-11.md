# Back Nine course composition — 2026-11-11

This pass changes the environmental composition beyond the previous palette/landscaping refinement.

## Implemented

- A narrower paved main cart path with compacted shoulders; seven secondary routes are now twin wheel tracks through turf. The full original driveable corridor and speed/collision rules remain. Four paved service connectors/main routes retain a clear hierarchy. Route centers, forks, joins and gate clearance are unchanged.
- Four flush groundskeeping courts group existing buildings, equipment and openings. Stone corner courses establish working areas without introducing solid curbs.
- All remaining service-fence panels use estate hedges on stone footings with the same obstacle envelope. The pump-yard trailer becomes a pump house; one secured turf trailer remains beside the reservoir. Stores share clubhouse materials, stone bases/piers, gutters, downpipes, windows, sills and vents. Route hints now refer to the pump house and grounds store.
- Eight shallow landscape banks outside the boundary fence and sparse opaque reservoir reeds make the perimeter less flat. No terrain-height or collision changes within the course.
- Contoured grass bunker lips and a small 128×128 pixel sand/rake texture replace the former flat stone-textured sand and separate straight rake marks.
- Darker sky tint and blue-black fog; wet valleys smoothly thicken the existing fog and dim moonlight slightly. No new lights, transparent effect layers or per-frame texture work. Headlights, siren and exit lights remain readable. Reduced-motion settings still suppress motion/shake effects; the valley treatment is spatial and steady.
- Paired lanterns remain but spacing now follows route type: 28 m on paved routes and 36 m on service tracks, 166→148 total. Existing subtle flicker remains.

## Checks

- Eight before/after views in Chromium SwiftShader and D3D11; final hardware screenshots at 2560×1600, 1280×720 and 844×390. Inspected fairway forks, reservoir/bunker, clubhouse and on-foot store views. No browser errors in completed runs. A fog-expression parse error during implementation was corrected before successful full runs.
- Installed standard web-game client ran two on-foot action bursts and captured state/screenshots. Runner browser checks verified steering, automatic camera, look-back, reverse and garage completion.
- Route choices test passed all five cart gaps, three foot gaps, seven tight branch drives, Joe interceptions/detours, late cart loss through an on-foot escape gap, victory and retry.
- Runner collision/camera and mower retreat/escape-window tests passed.
- Release verification passed 90 action scenarios; 67 runtime image assets, 26 MiB; no failures/warnings.
- Navigation signature remains 3095194091 with 4,410 baked nodes. No pathing, simulation, damage, player controls or frame-pacing edits.

## Cost

Final static pieces 4,768→4,893; material/spatial batches 127→128; trees remain 140. Hardware shaders remain 17 (software 22). Textures 35→36 due to the small generated sand tile. No sampled runtime buffer allocations. Shared spatial batching/culling remains active.

Fixed 960×540 SwiftShader ABBA comparison, 48 samples/version/view:

| View | Median before→after | p95 before→after |
| --- | --- | --- |
| Wet lane + mower | 45.0→45.0 ms | 50.0→50.0 ms |
| Shore | 36.0→36.0 ms | 40.0→39.9 ms |
| Green | 36.1→37.0 ms | 52.5→43.0 ms |
| Runner + foliage | 38.0→37.0 ms | 43.0→40.0 ms |
| Clubhouse | 35.0→35.0 ms | 39.2→38.8 ms |
| Front mower | 34.0→33.9 ms | 38.8→39.0 ms |

Hardware eight-view medians stayed approximately 6 ms. These controlled draws support broadly comparable cost; they do not guarantee whole-game frame rates or eliminate software-rendering spikes. Human readability on dim screens and sustained play remain later playtest items.

Evidence: `output/course-cohesion/`. `software.json` is the initial composition pass before the final bunker texture/lip refinements; `hardware.json`, `paired-performance.json` and standard-client output include those refinements. Performance fixture screenshots have a static HUD from another state; full-game captures show the matching objective.

Tools: `verify-course-cohesion.cjs`, `verify-course-cohesion-performance.cjs`, existing standard-client/runner/route/ram/release checks. Source files and import-map revisions updated locally; no deployment or commit.
