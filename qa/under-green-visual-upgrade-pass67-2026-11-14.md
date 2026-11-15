# Pass 67 — bunker shoring and interrupted soil seams

Local progress toward the complete 53 requirements and 48 refinements. No item status or whole-level gate is promoted.

## Implementation

Ten bunker spans now use seven authored support profiles: differing beam heights/slopes, unequal knee braces, fitted bearing blocks and paired timber packing against the actual ceiling. Timber has narrow beveled edges, closed ends, grain aligned with its length and fixed texture offsets that select different knots and wear from the existing 1254px artwork at its existing physical scale. The narrow western span at course y=64 has paired sister timbers, seated straps and bolts. Soil seams now vary in elevation and thickness and taper out across gaps.

The original opaque roofs, retaining faces, turf and inspection openings are preserved. All changed pieces remain in the upper bunker dressing, from 3.31m upward. No floor posts, collision/navigation changes, new texture/material/light, shader modification or per-frame animation was introduced. The original stone coping and soil spills remain.

Sources: `web/under-green-bunker-shoring.js`, `web/under-green-district-enclosure.js`, `web/under-green-structure.js`. Evidence: `output/under-green/visual-pass67/`.

## Verification

- `geometry.json`: ten frames, one reinforced span; closed outward-facing timber, finite positions/normals/UVs, longitudinal grain scale, bounded geometry and no intersection with inspection apertures. Opaque enclosing earth/sand/turf/range surfaces remain byte-identical. Added 413 source meshes and removed 233 are merged by the existing scene batching; net 2,928 triangles. Changed geometry lies between 3.30999994m and 4.80149984m. Packing deliberately overlaps the 4.8m roof underside slightly.
- Broad paired `hardware/report.json` and `software/report.json`:37 views each, including both travel directions, main/dry bunker routes, repaired span, flood fixture, gallery/keeper controls, desktop/portrait/landscape, crouch, Q rear view and reduced motion.4,536 camera poses per renderer find no intersections. Camera return is pixel-stable and pause holds elapsed time.
- Six exterior magenta-sentinel checks per renderer at near/distant distances and two wall heights remain fully occluded, with an initially visible positive control. Exact outside-region triangle fingerprints match: 278,530 native / 203,798 software triangles. Player state, lights, actual target resolution and texture counts match before/after. No console/page errors.
- Broad suites preceded the final texture-offset-only change. Geometry, normals, layout and material/shader identity are unchanged by that refinement. The final unit verifies offset-only UV changes with exact position/normal parity; `grain-hardware/` and `grain-software/` provide eight final views each including all three smaller sizes. Final images were inspected. These focused final captures supersede earlier close-up artwork; broad clearance/occlusion evidence remains applicable to identical geometry.
- Native actual 2560x1600, ordinary 1280x720, compact 390x844/844x390. Software actual 960x600 at high-resolution desktop, 960x540 at ordinary desktop, and compact native sizes. Screenshot dimensions are not mistaken for scene target resolution.
- Final dry traversal: 1,379 frames / 106 body-and-scythe checks, no intersections, maximum foot error 2.414686e-7. Installed client seven bursts recovered from a Preparing-button timeout; final ready/playing at (0,7.304), elapsed .75s, checkpoint 0, actual 960x540. Inspected final shot/state; no error artifact.
- At the native dry-corridor view, draws 345 unchanged, triangles 298,314→300,774, 59 textures and 213 programs unchanged. The gallery control sees one additional static batch; keeper control counts remain unchanged. This is a small added geometry cost, not a zero-cost claim.
- Six final source/verifier snapshots and SHA256 hashes are stored under `source/`; the pre-grain module is retained to identify the artwork-only refinement.

## Remaining work

The bunker now has more construction variation and a localized repair, but broad bank silhouettes, richer material separation, full district composition and Level 1 parity remain open. Whole-route water/actor motion and high-resolution software performance also remain open. No full-level completion claim follows from these local tests.

## Local rendering cost

All owned visual/client/route jobs were terminal before sequential native and software timing. Each profile alternates two prepared scenes for 24 GPU-fenced samples after six warm pairs. Other active render/performance jobs were recorded in the process inventories; results are shared-host comparisons, not isolated benchmarks.

| Renderer / view | Median ms before → after | P95 ms before → after |
|---|---:|---:|
| hardware / corridor | 13.0 → 11.9 | 17.8 → 13.6 |
| hardware / repair | 10.5 → 8.9 | 12.8 → 10.5 |
| hardware / main | 14.6 → 13.0 | 19.0 → 14.6 |
| software / corridor | 218.3 → 228.9 | 283.7 → 273.6 |
| software / repair | 91.7 → 92.8 | 121.0 → 108.5 |
| software / main | 259.3 → 264.5 | 314.9 → 327.8 |

Native target 2560x1600; software 960x600. Software median increases are 10.6ms in the corridor, 1.1ms at the repaired span and 5.2ms on the main route. Absolute software performance remains poor. Lower native medians are not evidence of a speedup under concurrent load. The full performance gate remains open.
