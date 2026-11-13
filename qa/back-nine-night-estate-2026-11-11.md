# Back Nine: darker, maintained course — 2026-11-11

## Changes

- Rebuilt six fairway surfaces as tapered curves with directional mowing bands instead of overlapping rectangular strips and round caps. They use existing vertex-tinted turf batches. Removed a redundant full-surface apron during profiling.
- Grass rough replaces the former architectural floor texture; muted verge/asphalt colors distinguish maintained lanes from rough. Foot trails use continuous ribbons, with corner rounding limited to 35 cm inside narrow route corridors. Paved paths draw above foot-trail crossings.
- Redistributed five existing boundary trees into established solid planting islands, reducing repeated shrub lobes. Total tree count remains 140; no new collision footprints.
- Later service barriers now resemble maintained estate hedges on stone footings. Nursery storm debris becomes a planted strip; the final storm-fallen tree remains as a deliberate warning. Parked carts no longer have inexplicably illuminated headlights.
- Added marked maintenance parking bays, supply racks, covered pipe storage, drainage grates, small identification plaques and relay-apron drainage detail. Removed loose barrels. Irrigation machinery now has enclosed cabinets, door handles, vents, warning plates and existing pipework on proper bases.
- Darker blue-black fog, reduced hemisphere/ambient/moon illumination, darker sky/cloud/moon tint. Headlights, siren, destination lights and route lanterns retain their readable intensities. No additional lights, transparent effects or animation loops. Parallax `night` defaults to zero, preserving Level 1's existing appearance.
- Updated relevant import-map URLs for refreshes. Frame-pacing fix remains intact.

## Preservation and checks

No course collision, navigation, path centerline, shortcut, surface-physics, objective, movement, damage or Joe AI edits. Navigation remains baked with signature 3095194091 and 4,410 nodes.

- Route choices: five cart gaps, three foot gaps, seven drivable tight branches, mower detours/interception, late ejection through a foot gap to victory, retry all pass.
- Runner controls/collision sliding, camera sweep, ram retreat and escape windows pass.
- Release verification: 90 action scenarios, 67 runtime images / 26 MiB; no failures or warnings.
- Installed standard gameplay client: on-foot input bursts and screenshots; no errors.
- Eight matched before/after views on both D3D11 and SwiftShader. Inspected 2560×1600, 1280×720 and 844×390 output, plus close mower and on-foot shots. Paths, lamps, player and destination remain readable against darker terrain. Small footpath corner refinement followed these captures; final standard-client captures include it.

## Rendering cost and limitations

Final scene: 4,766 static pieces versus 4,761, 127 batches versus 126, unchanged 140 trees, textures 36→35. Hardware shader programs remain 17 (software 22). No new GPU buffers allocated in sampled repeated updates/draws. Existing geometry, texture atlases and batching are reused.

D3D11 eight-view completed-draw medians remain approximately 6 ms. Fixed 960×540 SwiftShader ABBA samples were noisy: final focused median before→after was wet-mower 52→52 ms, runner-foliage 44→42.7 ms, clubhouse 38→38 ms. Tails were mixed: wet-mower p95 61.2→75.1 ms, runner 65→48.1 ms, clubhouse 51.4→42.9 ms. Earlier samples also varied substantially. This is **not** evidence that software frame spikes are resolved or that this art pass improves performance. Longer representative playtesting is still needed, particularly for wet-lane tails and readability on dim displays.

Tools: `verify-night-estate.cjs`, `verify-night-estate-performance.cjs` (optional `--focus`), existing route/runner/ram/release tests. Evidence and task-start sources: `output/course-night-estate/`. `software.json` is an intermediate art pass; `hardware.json`, `paired-performance.json`, `focused-performance.json` and the standard client reflect subsequent refinements as described above. Paired-performance screenshots use fixture scenes, so their HUD is not the fixture's objective state; the full game and standard-client captures have matching HUD state.

Served locally on port 4187. No deployment or commit.
