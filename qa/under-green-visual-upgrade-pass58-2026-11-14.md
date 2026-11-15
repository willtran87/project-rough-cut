# Under the Green pass58 — gallery root canopy

Scope: improve the first gallery's dominant silhouette and connection between the existing living pillar, ceiling and walls. Local progress on V11/V14/V16, retaining V15's embedded masonry treatment. This does not establish full Level 1 parity or finish the reference bay's lighting/material composition. All 53 requirements, 48 refinements and seven whole-level gates remain active.

## Implementation and visual review

New `web/under-green-gallery-canopy.js` replaces the pillar's two short roof forks with two unequal spreading shoulders, two subordinate forks, a returning braid and six tapered feeders (three on the lower-detail path). The long east shoulder crosses the view diagonally; the shorter west shoulder ties it into the nearby wall. The central crossing instructions remain within the open silhouette.

Two new wall penetrations use the existing chipped masonry and tapered mortar-fracture builder. This was added after the first preview showed roots entering intact faces. Existing root geometry supplies measured bark UVs, ridged cross-sections, taper, branch collars and seam-normal treatment. Root/pillar collision, navigation, floor layout, walls, signals, lighting, actor behavior and controls are unchanged. No new materials, textures, lights or colliders.

Integration is in `web/under-green-root-compositions.js`. All changes are confined to the first gallery canopy and its two masonry joins. Branch data is exposed in the existing visual diagnostics. Source baseline, verified snapshots and final hashes are retained under `output/under-green/visual-pass58/source`.

Inspected native approach, near, reverse, underneath and both wall penetrations; compact portrait approach; software near and landscape reverse; standard-client final gameplay screenshot. The entrance now has a dominant connected transverse root shape instead of an isolated vertical pillar with short roof forks. The passage remains visibly open. Selective wet edge lighting, broader root variety and the rest of the gallery composition still need their wider art acceptance.

## Verification

- `verify-under-green-root-geometry.mjs`: passes for both detail paths, 153 roots / 17,634 vertices / 36 branch collars / 2,070 seam checks. Covers deterministic geometry, finite attributes, unit normals, bark-seam continuity, wall intrusion limits and the original pillar collider.
- `verify-under-green-gallery-canopy.cjs`: final 29 views per renderer, including ten paired fixtures, forward/reverse approaches, close/pitched views, distant control districts, 1280x720, 390x844, 844x390, crouch, Q and Reduced Motion. Native desktop actually renders 2560x1600; software desktop renders 960x600 within that viewport. Zero page/console errors.
- 2,112 camera poses per renderer cover the gallery floor, standing/crouch heights, pitch/FOV extremes, portrait/landscape aspects and four directions. No geometry intersections. Returning to a settled camera produces identical PNG bytes; pause freezes elapsed time.
- Sorted triangle fingerprints outside the permitted canopy/masonry volume match baseline exactly: 266,699 native and 195,154 software triangles. Batch culling is restored before comparison. Paired player state, lighting, render resolution and texture count match.
- Supplemental native joinery review contains six paired close/underneath captures; source is identical to the final full suites. Initial west/east general fixtures were not sufficiently centered on the new wall joins, so these focused captures provide the close visual evidence.
- Existing masonry receiver audit passes 448 physical support samples, including the new joins; no unsupported fragment backs.
- Current actual-ink sign audit passes all 2,304 crossing-lettering rays from both directions, standing/crouch heights and varied distances/offsets. Release lettering is clear within its tested reading distance. Seven other approach samples remain blocked at pump tags or the distant seven-metre sluice view; their positions lie outside this canopy's extent. This result is not whole-level sign acceptance.
- Dry route replay passes 1,379 sampled frames and 106 rendered actor/scythe geometry audits, with no scenery/camera intersections. Maximum foot error approximately 0.00000024 m. This is deterministic route replay, not an ordinary-input full playthrough.
- Installed standard client completes seven input bursts, terminal exit0. Initial five-second Preparing-button timeout recovers through later input. Final shot/state inspected: playing, ready, player(0,10.12), elapsed1.5333s, no error artifact.

## Rendering cost

Native approach: 525 draws unchanged, 383,858→386,546 triangles. Native near: 496→497 draws, 375,998→378,724 triangles. Native reverse: 55 draws unchanged, 95,566→98,254 triangles. Software approach: 524→525 draws, 259,234→260,322 triangles. Texture count stays55 and program count169.

All owned render/client jobs were terminal before sequential native/software timing. Other project sessions continued to launch rendering tests; after waiting for earlier jobs, the paired sampling proceeded under shared-machine load. Treat these results as provisional cost evidence, not an isolated performance acceptance run. Each view uses six warmup pairs and24alternating GPU-fenced samples per state.

| View | Native median/P95 before→after ms |
|---|---|
| Approach | 16.5/18.6→16.5/18.9 |
| Near | 15.6/17.0→15.2/17.2 |
| Reverse | 7.8/10.0→8.0/9.1 |

Native median cost is broadly comparable in this sample; no speedup is claimed.

| View | Software median/P95 before→after ms |
|---|---|
| Approach | 161.1/188.8→168.1/200.3 |
| Near | 168.0/179.2→172.4/186.2 |
| Reverse | 53.3/66.4→55.0/59.8 |

Software medians increase in all three sampled views, and absolute cost remains poor. Shared-machine contention limits attribution, but these results do not support closing the performance gate or claiming no regression.

All owned sessions are terminal: preview27920, hardware2808, software69888, signs59082, joinery71818, route77093, installedclient92234, nativebudget11201, softwarebudget66103. Entry support audit completed directly with exit0. Verified/accepted runtime source hashes match. No outstanding owned render job remains.

## Scope retained

Ledger counts remain32 implemented /20 in_progress /1 pending; all seven gates remain pending. Gallery wet/focal lighting, pump silhouette, range framing, water/actor motion acceptance and software performance remain substantial work. No commits, deployment, deletion or subagents.
