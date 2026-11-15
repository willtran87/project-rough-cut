# Under the Green pass 35 — continuous sediment banks

Status: verified local progress toward V17/V18, both remain in progress. All 53 requirements and all seven release gates remain in scope. The preceding list-only goal turn did not change implementation; this turn resumed concrete work against current sources.

## Change

- Replaced periodic tall mud wedges with deterministic overlapping compact lobes, irregular widths/strengths, rounded shoulders and thin 4 mm films. 37,924 physical samples have maximum height 27.95 cm and maximum face offset 19.7 cm (including wall half-thickness). About 52.9% of sampled wall length is below 2.5 cm, leaving quiet stretches.
- Join touching collinear wall partitions into 103 actual spans. Taper only at span ends. Render as 161 local chunks, preserving shared computed normals at all 58 internal joins. This avoids both partition seams and a single whole-level lighting/culling bound.
- Floor mud/wetness aprons now use the same world-space deposit profile. Existing outlet fans, bunker sand, puddle/runnel margins, leaf details and pump-foot collars remain.
- Preserve all 674 root-builder calls and non-mud geometry exactly. Existing 18 authored soil pockets remain. Scythe contact automatically consumes the same authored geometry as rendering.
- Total mud triangles including soil pockets: 25,856 to 25,712. Geometry pieces: 298 to 179. No new artwork, textures, lights or material features. Material craft still needs refinement: current mud has overly fibrous detail and does not yet establish full Level 1 parity.

## Evidence

- `tools/verify-under-green-mud-banks.mjs`: finite/indexed geometry, unchanged roots/other geometry, endpoint taper, maximum profile dimensions and exact shared normals. Report: `output/under-green/visual-upgrade/pass35-source/geometry-report.json`.
- `tools/verify-under-green-mud-banks.cjs`: final 20 native and 20 software views. Seven before/after fixtures across gallery, bunker, pump, range and keeper, plus 1280x720, 390x844, 844x390, actual Q rear glance, pause and Reduced Motion. Zero browser errors. Final evidence: `pass35-selected/hardware` and `pass35-selected/software` under the visual-upgrade artifact directory.
- Actual desktop rendering is 2560x1600 native and 960x600 software. Inspected final native bunker/pump close views and portrait gallery, plus software bunker. Tall pump wedges are gone; transitions into floor sediment align. Close materials remain a partial requirement.
- `tools/verify-under-green-moving-clearance.cjs --dry`: final selected geometry passes 1,379 route frames, 106 actual actor mesh audits and included camera configurations, no intersections. Final evidence: `pass35-selected-clearance`. This is not all flood/route/accessibility gate acceptance.
- Installed develop-web-game client: final `pass35-selected-client/shot-4.png` and `state-4.json` inspected, ready/playing at (0,8.84), actual 960x540. Initial 5-second Preparing-button timeout recovered through subsequent input bursts; no startup-performance claim.
- Same 68 loaded textures in all paired views. New local bounds produce 132 compiled programs versus 131 before; observed native draws -1 to +2, software 0 to +1. View-dependent submitted triangles vary despite fewer total authored triangles. Do not claim identical rendering cost.

## Limits and next work

V17/V18 remain partial: finish close mud material clusters, damp/dry/sand separation and causal deposition around structural failures, then review the full route in flood and pursuit. Preserve Level 1 movement, E/Q, full-level retries, no action/noise banners, opaque walls, scythe and moving dark ghosts. Full Level 1 comparison and software performance gates remain open.

Initial `pass35-final`, `pass35-clearance` and `pass35-client` directories are intermediate: the first candidate used unnecessarily dense geometry and a whole-level mud bound, and its browser run failed a program-count equality assertion. The selected runtime uses local chunks and the original sampling budget; only selected artifacts support the final result.

## Isolated rendering measurements

Six warm frames followed by 24 alternating GPU-fenced samples per before/after view, with native and software runs sequential and no other owned browser tests active. Values include CPU submission, polling and context overhead; these are scoped measurements, not a general FPS guarantee.

| Renderer / view | Median before → after (ms) | P95 before → after (ms) |
|---|---|---|
| hardware / gallery | 12.3 → 12.4 | 14.5 → 14.3 |
| hardware / pump | 8.4 → 8.1 | 9.8 → 9.7 |
| software / gallery | 91.2 → 89.8 | 95.0 → 96.8 |
| software / pump | 48.2 → 48.6 | 51.2 → 57.7 |

No meaningful native regression in these samples. Software remains too slow for the full performance gate. All owned pass35 jobs are terminal; server4187 and artifact junction retained.
