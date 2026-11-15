# Back Nine: retain authored banks on flat ground

Partial BV48 progress following the bunker-bank art pass. The bank's original triangles now remain intact where the underlying terrain is provably flat. Full terrain-cell clipping remains active around every authored hill and hollow, with the existing neighbouring-cell safety margin. Bank shape, material bands, footprint geometry, texture density and terrain height are retained.

`course-terrain.js` adds an opt-in `retainFlatTriangles` argument; its default remains false. Only the four layers tagged `bunkerSurface` by `back-nine-bunker-banks.js` opt in through `back-nine-scene.js`. Existing callers retain the prior output. Flat-area lighting normals now follow the original bank triangles instead of redundant grid subdivisions; this is not a pixel-identical image claim. Before/current gameplay views were inspected for edge softness, bank shape and surface contact.

All four bunkers decrease from 89,936 to 53,780 terrain-contoured triangles (40.20%), and from 49,228 to 30,014 vertices. No new shader, texture, material, light or per-frame update is introduced. Nine matched native views retain their draw counts, 32 programs and 53 textures; visible triangle reductions range from 5,521 to 20,267. All nine player states match the previous bank pass.

## Checks

- `node tools/verify-back-nine-bank-tessellation.mjs`: 48 saved-implementation comparisons prove default index and attribute buffers remain bit-identical. All footprint buffers remain identical. Maximum projected area difference from float tessellation is 0.00005451 square metres. Every bank has fewer triangles.
- `node tools/verify-back-nine-bunker-banks.mjs output/back-nine-visual-upgrade/bunker-depth`: current output retains finite/upward geometry, closed seams, transparent outside edges, flat road approaches, terrain clearance at vertices and triangle interiors, and unchanged course/navigation data.
- `node tools/verify-back-nine-route-margins.mjs`: 3,709 route/court/minor-route pieces and 141,743 triangles retain their expected common-terrain clearance and alpha. The shared helper's default path remains unchanged.
- Native and software runtime captures include nine views at 2560x1600, plus 1280x720 and 390x844. Reports contain no page, console or texture errors. Native actual buffer is 2560x1440. Actual images were inspected, including the four bunker areas, road, wet surroundings and responsive views.
- The installed standard client ran two 60-frame forward bursts through `tools/verify-presented-client.mjs --back-nine --bunker-banks --high-resolution`, native and software. Both end at exactly (14,229.06133632691927), sand surface, 4.8 m/s, with identical player state to the prior pass and no error artifacts. Both final page images and state snapshots were inspected. Native retains 2560x1440 (final average 11.45/P95 12.70 ms); software drops to640x360 (78.26/105.60 ms). This software result does not meet the high-resolution fidelity target.

## Performance evidence and limits

The first sequential software comparison was noisy and measured worse timings despite the geometry reduction: sand-entry median 91.7/119.0 ms, road 90.1/128.0 ms (baseline/current). Several other chapter/browser jobs were confirmed active on the shared host. This is not proof of a speed improvement. A second profiler prepares both worlds on one renderer and alternates short measured blocks with GPU completion fences; its results are recorded in `paired-*`.

The alternating comparison uses 36 measured frames per world/view at fixed 960x540. Native sand-entry median improves 7.9 to 7.0 ms (P95 12.0 to 8.1); road median stays 7.0 ms (P95 8.0 to 8.1). Software sand-entry median is 153.9 to 150.8 ms (P95 206.7 to 194.0); road is 178.3 to 166.0 ms (P95 253.8 to 247.7). These are scoped observations with two prepared worlds and shared host load, not live gameplay FPS or a repeatable global speed guarantee. The geometric resource reduction is independently verified.

The scope remains resource reduction with retained art, not whole-level frame-rate acceptance. High-resolution software fidelity and combined chase/flood/destruction load remain open. Stronger middle-distance composition, ground variation, character motion and static grounding also remain required by the full 48-item objective.

## Rejected experiments

An early sand draw changed one software pixel at an overlap. Removing wholly covered turf exposed a one-pixel software raster seam. A depth-only sand prepass retained exact pixels but measured slower. None of those experiments is in production; their temporary helper files were removed. The original grass backing, ordinary draw order and single colour pass remain.

Evidence is under `output/back-nine-visual-upgrade/bunker-depth/`. `baseline-source` preserves the pre-optimization bank implementation. `tessellation-native` and `tessellation-software` show the retained production approach. `probe-*`, `trim-*` and `prepass-*` are rejected exploration, not acceptance evidence. The previous bunker-pass manifest was checked and remains intact.
