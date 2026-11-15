# Pass 66 — gallery plaster failure and connected seepage

Scope: local refinement of V08/V12 and the gallery reference composition. All 53 requirements, 48 refinements and seven whole-level gates remain active. This pass does not establish Level 1 parity or complete the gallery.

## Result

The western roof-root entry now exposes masonry beneath an irregular plaster failure. Nineteen thin, closed plaster chips follow selected fractures. Three opaque, feathered pigment patches connect roof moisture to a broad wall stain and narrower descending trail. They use the receiving surfaces' physical UV coordinates, light response and existing texture maps. The two cloned materials participate in the existing damp finish and are disposed with the scene.

The original roof and walls remain intact. The failure is a shallow surface finish, not a new aperture. No collision, navigation, movement, input, enemy, flood or checkpoint code changed. The connected canopy and existing root foundations remain.

## Corrections made during review

- Corrected mirrored course coordinates and fragment rotation in the inherited unfinished prototype.
- Replaced its conspicuous thick, widely spaced plaster blocks with thinner, smaller fragments and a more detailed irregular contour.
- Geometry verification found the initial stain/failure extending beyond the gallery's actual narrowing at course y=16. Contained the finish within the real roof and west wall; checked every source vertex against their receivers. Initial previews are superseded by hardware/software evidence.
- Included the new materials in damp calibration so their white feathered edges match the receiving material response. Added explicit disposal and replaced a guessed minimum height with a computed value.

## Verification

Evidence root: `output/under-green/visual-pass66/`.

- `geometry.json`: 2,869 source vertices / 1,384 added triangles, 70 contour points, 19 closed outward-facing fragments. Finite bounds, downward ceiling normals, inward wall normals, original roof backing, actual west-wall receivers and disposal of both new materials pass. Lowest wall pigment is 1.94349m; raised pieces remain above 4.12m.
- `hardware/report.json` and `software/report.json`: 32 views each, including ten matched before/after fixtures, ordinary desktop, compact portrait/landscape, crouch, Q lookback and reduced motion. Actual native target 2560x1600; software target 960x600 at that viewport, 960x540 at ordinary desktop, and 390x844 / 844x390 in compact views.
- Each renderer checks 2,688 standing/crouching camera poses across pitch, FOV, aspect and heading: no intersections. Camera-return pixels are stable, and pause freezes elapsed simulation time.
- All existing structural triangle fingerprints remain present with identical multiplicity; additions equal exactly 1,384 triangles. Original counts: 281,622 native / 206,890 software. No original enclosure geometry was removed. 144 upward roof rays pass in both baseline and final scenes per renderer. New stain UVs match receiving world coordinates. No missing vertex-color attributes or page/console errors.
- Matched player state, light sources, actual resolution and texture counts agree before/after. Native gallery approach adds two draws (526 to 528), 1,384 visible triangles (390,386 to 391,770), and two programs (211 to 213); 55 textures remain. Other views can cull some additions.
- `route/moving-clearance.json`: successful dry traverse, 1,379 frames / 106 rendered body-and-scythe checks, no intersections; maximum foot error 2.414686e-7.
- Installed web-game client, seven action bursts: initial Preparing-button timeout recovered through subsequent Enter input. Final `state-6.json` is ready/playing, player (0,8.072), elapsed 1 second, checkpoint 0. Inspected `shot-6.png`; no error artifact. Actual client target 960x540. This is a startup/movement smoke test, not a complete manual playthrough.
- Inspected final native close/approach/portrait and software close/wall/landscape images. `source/manifest.json` records six final source/verifier hashes and copies, with the pre-change scene kept separately.

## Limits and next work

This is a local construction/moisture improvement. The effect is strongest beneath the canopy, with subdued visibility from the distant entrance. Broader floor/ceiling composition, bunker/range/keeper variation, water/actor motion, matched Level 1 acceptance and full-route performance remain open. Software rendering remains a particular concern. No gate or item status is promoted by this pass.

## Local rendering cost

All owned visual, traversal and client jobs were terminal before sequential native and software measurements. The profile alternates two prepared scenes for24GPU-fenced samples after6warm pairs. Another FinalCut browser verification was live before native timing and a FinalCut software verification was live during software timing; this is shared-host evidence, not an isolated benchmark or speedup claim.

| Renderer / view | Median ms before → after | P95 ms before → after |
|---|---:|---:|
| hardware / gallery | 18.3 → 17.5 | 21.6 → 51.4 |
| hardware / roof | 7.7 → 8.7 | 10.9 → 10.6 |
| hardware / wall | 8.7 → 7.9 | 9.9 → 9.7 |
| software / gallery | 232.3 → 238.4 | 284.2 → 279.6 |
| software / roof | 121.5 → 130.8 | 160.2 → 169.4 |
| software / wall | 64.8 → 70.9 | 92.0 → 109.7 |

Native target2560x1600; software960x600. Native gallery P95 includes a large spike. Software median increases6.1–9.3ms across these views and remains far below a playable high-resolution target. Do not close the performance gate.
