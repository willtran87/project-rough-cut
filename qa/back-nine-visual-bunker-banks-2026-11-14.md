# Back Nine: bunker banks and maintained sand

Partial BV08/BV11/BV14 progress. All four bunkers now blend sand through exposed soil into low, irregular grass banks. Each has an eight-step entry trail and angular variation in damp sand. The old opaque green ring and dark perimeter are replaced by feathered material bands. Bank height falls to zero beside cart paths. Collision, navigation, sand slowdown and flood timing remain owned by the existing simulation.

`web/back-nine-bunker-banks.js` builds four layers per bunker, plus footprints. `back-nine-scene.js` contours them to the shared terrain and batches them into the existing grass/soil materials and one transparent sand material. That material reuses the loaded sand texture; there are no new texture assets or lights. Footprints draw in the sand batch after the shoulder, so they are not obscured by the translucent sand. The full four-bunker geometry after terrain clipping contains 49,228 vertices and 89,936 triangles.

The planting clearance rule now excludes maintained sand, including plant spread. This removes 107 misplaced clumps: 4,737 decorative plants remain, with all 27 authored pockets populated. Vegetation beside the bunkers remains. The persistent mowing memory still registers and retains every remaining plant in its unchanged 32 KB allocation.

## Verification

- `node tools/verify-back-nine-bunker-banks.mjs`: finite geometry, upward triangle winding, closed seams, zero-alpha outer edges, 1,215 road-adjacent samples without a raised lip, terrain contact at vertices and triangle interiors, and unchanged course/navigation data. Four distinct world placements each retain eight footprints.
- `node tools/verify-back-nine-planting.mjs`: every plant's sampled silhouette clears maintained sand, paths and solids; all 27 pockets and district mixtures remain populated.
- `node tools/verify-back-nine-foliage-mowing.mjs`: all 4,737 plants can be flattened and retained; unchanged 32,768-byte texture and zero frame-rate edge difference in its fixture.
- `tools/capture-back-nine-bunker-banks.cjs`: native/software captures of all four bunkers, bank edge, cart route, wet-bank and flooded surroundings, plus 1280x720 and 390x844 bank views. Nine 2560x1600 views per renderer; native gameplay buffer 2560x1440. Reports contain no console/page or texture errors. Actual native, software, responsive and before/current images were inspected.
- The installed standard web-game client runs through `tools/verify-presented-client.mjs --back-nine --bunker-banks --high-resolution`, with and without `--native-renderer`, two 60-frame forward input bursts. Both finish at (14,229.06133632691927), on foot, sand surface, 4.8 m/s. Both state snapshots and final page images were inspected; no error artifacts. Native buffer 2560x1440, software 960x540. The final native sample averages 11.30 ms/P95 12.40 ms; software 62.60 ms/P95 84.60 ms. These are short traversal observations, not whole-level budgets.

## Resources and limits

Eight matched native views retain 53 textures. Programs increase from 31 to 32, draw counts increase by zero or one, and visible triangles increase by 14,364–36,077 depending on the viewpoint. Player state matches every baseline view. The baseline is the saved pre-bank scene and planting source; unrelated live modules remain shared.

The dedicated profile compares baseline/current at fixed 960x540 with GPU completion fences, eight warmups and 32 measured frames for a sand entry and the western cart path. Reports, including reverse-order software measurements, are saved under `profile-*`. These measurements must not be interpreted as full chase, destruction and flooding acceptance.

Software sand-entry medians: baseline 50.9/current 59.0 ms in the first order, baseline 58.1/current 67.0 ms in reverse order. Road medians: 57.1/62.0 ms and 62.9/66.0 ms. Sand-entry P95: 55.0/75.1 ms and 64.8/72.0 ms; road P95: 62.8/87.0 ms and 67.1/69.0 ms. The repeated added cost is a real outstanding concern, especially for the broader high-resolution software target. No regression-free or full performance acceptance is claimed.

The single native fixed-resolution run measures sand-entry median 7.1/8.2 ms and P95 12.0/15.0 ms; road median 7.8/14.5 ms and P95 12.6/25.9 ms (baseline/current). The road delta is not explained by this short run. Retain these data and investigate bank tessellation/transparent overdraw before any performance acceptance; do not extrapolate the smoother installed-client sample into a regression-free claim.

Broader gravel/court wear, individually authored bunker shapes and larger sand-pattern variation remain open. The course still needs stronger middle-distance composition, material/actor parity, static grounding and combined-load visual performance. These improvements do not complete BV08/BV11 or establish whole-level Level 1 parity.

Evidence: `output/back-nine-visual-upgrade/bunker-banks/`. `before-native` is the pre-bank baseline; `after-native` is an intermediate candidate before the planting/footprint corrections. `final-native`, `final-software` and `client-*` show the current accepted local changes. Source snapshots and a SHA-256 manifest preserve the reviewed files.
