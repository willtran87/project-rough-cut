# Under the Green pass57 — bunker retaining finish

Scope: refine the bunker's continuous green metal cap into individually shaped stone coping, localized soil spills and old repairs. This advances V08/V12/V17 and local V02/V03 craft; it does not establish whole-level visual acceptance. The original 53 requirements, 48 review refinements and all seven release gates remain intact.

## Implementation

- `web/under-green-bunker-retaining.js` builds 133 chipped coping stones along 22 retaining edges, eight asymmetrical shallow soil deposits and two stepped repairs with nine seated stones each. Geometry is closed, consistently wound and anchored near its actual material/light cell.
- `web/under-green-scene.js` replaces 63 generic iron caps with opaque masonry cores spanning heights 1.79–1.89 m. These overlap the original lower wall and upper bank by 1 cm each. Existing upper retaining cap, roof overlap, walls, floor hull, navigation and occluders remain unchanged.
- The dressing projects at most 0.148 m into the route, within the old cap's 0.15 m extent. No new colliders, lights or texture images. Two owned material clones reuse current stone/concrete artwork and are explicitly disposed.
- First preview was rejected for flat soil cutouts and large pale mortar patches. Rounded closed deposits, restrained vertex shading and tightly fitted repair courses replace those. A further close review exposed wall-sized brick patterns repeated within each replacement stone; final UVs sample individual stone faces from the existing illustrated atlas. Soil silhouettes receive small deterministic irregularities.
- Adjacent materials retain physical world sampling. Coping face windows are capped to the authored stone bounds rather than repeating mortar within a single stone; broad coping faces therefore have variable source density. Full neighboring-material parity remains open.

## Evidence

`tools/verify-under-green-bunker-retaining.mjs` passes: 63 cores, 22 edges, 133 coping stones, eight deposits, two repairs, 161 closed parts, 6,732 triangles and 13,812 source vertices. Every construction part has finite vertices, nondegenerate triangles, paired closed edges and positive signed volume. Color attributes, core overlap, route-facing placement and material disposal are checked.

Final browser artifacts: `output/under-green/visual-pass57/hardware-final` and `software-final`, 33 views each. Native desktop buffer is 2560x1600; software desktop is 960x600 within a 2560x1600 viewport. Additional viewports: 1280x720, 390x844 and 844x390. Includes twelve paired scene fixtures, dry/flood views, near repairs, upper seam, gallery/keeper controls, crouch, Q and Reduced Motion. Zero page/console errors.

- 4,536 camera poses per renderer cover retaining approaches, standing/crouch heights, pitch and FOV extremes, portrait/landscape aspects and oblique directions. No geometry intersections.
- Six opacity checks per renderer place an exterior magenta sentinel behind the lower coping and upper enclosure, viewed from 4, 14 and 19 m. All yield zero visible sentinel pixels; an interior positive control confirms the probe is visible when unobstructed.
- Sorted triangle fingerprints outside the authorized bunker dressing volume match baseline exactly: 251,347 native and 183,795 software triangles. Software batch culling is restored before comparison.
- Camera departure/return yields identical PNG bytes. Pause freezes elapsed time. Paired player state, fixture lights, texture count and resolution match.
- Existing dry route replay passes 1,379 sampled frames and 106 rendered actor/weapon geometry audits. No scenery or camera intersections; maximum foot error is approximately 0.00000024 m. This is deterministic route replay, not a new ordinary-input whole-level playthrough.
- Final native corridor, flood and portrait repair, software corridor/portrait repair, and earlier final-candidate close repair/soil images were inspected. Long trim is visibly interrupted and repairs are quieter. Broader shoring repetition, bank integration, root composition and dramatic lighting remain art priorities.

Native corridor: 338→342 draws, 280,732→286,748 triangles. Native close repair: 345→348 draws, 289,286→294,918 triangles. Software corridor: 333→336 draws, 180,722→183,318 triangles. Textures remain 59; programs increase 162→169. Frame-time measurements and the standard-client result are recorded below after terminal verification.

## Remaining work

This is local progress. Keep gallery/range composition, pump silhouette lighting, water/actor motion review, full material cohesion and software performance open. No completion gate is inferred from these local tests. Verified source copies/hashes are retained under `output/under-green/visual-pass57/source`.

## Standard client and timing

Installed develop-web-game client completed seven input bursts, terminal exit0. Its initial five-second Preparing-button timeout recovered through subsequent input. Final shot/state inspected: playing, player(0,10.12), elapsed1.5333s, ready, no error artifact. This is an entrance smoke check; targeted browser fixtures verify the bunker.

Native alternating GPU-fenced sampling used six warmup pairs and24samples per state per view. All owned rendering jobs were terminal beforehand. One other observed Node unit process had no browser descendants; a later unrelated software browser test was allowed to finish before starting the software budget run. These short frozen-view samples do not establish sustained route performance or a speedup.

| View | Native median/P95 before→after ms |
|---|---|
| Corridor | 12.9/15.6→12.8/14.9 |
| Repair | 14.1/16.7→13.2/17.1 |
| Flood | 12.8/18.1→13.4/15.5 |

Native median cost is broadly comparable in this sample.

| View | Software median/P95 before→after ms |
|---|---|
| Corridor | 203.8/218.2→208.3/215.7 |
| Repair | 139.9/172.5→153.2/189.8 |
| Flood | 179.2/211.1→172.3/224.1 |

Software absolute performance remains poor. The repair median increased13.3ms (about9.5%) and itsP95 increased17.3ms; floodedP95 also increased despite a lower median. Do not claim a no-regression result. No other test process was present at software launch; an unrelated software browser test was detected after the final result printed, so possible late shared-machine contention further limits attribution. These measurements keep the performance gate open.

All owned sessions are terminal: surface-refined52739, hardware32220, software81633, route5035, installedclient4256, nativebudget63279 and softwarebudget96341. Both runtime source hashes match the final accepted copies. No commits, deployment, deletion or subagents.
