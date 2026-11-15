# Back Nine pass21 — readable maintenance footpaths and consistent footing

Previous goal turn made progress: survival audio/caption fixes remain. This pass advances the original38-item objective through route readability, dependable on-foot footing and matching contact audio. The complete goal remains active; human playtests are still deferred/prepared.

## Retained changes

The three foot-only routes previously displayed inset paving while much of their centreline was classified as rough. They now share one precomputed rounded centreline between art, movement and contact sound. Added a continuous .82m compacted maintenance bed beneath the existing141slabs, using existing track material, textures and static batches. No new signs, props, lights, collision shapes or routes.

`chase-footpath-layout.js` precomputes33segments and three bounds. `runnerSurfaceAt` recognizes these maintained strips, preserves wet ground priority, and leaves all other terrain rules alone. The runner reaches the existing paved speed7.2m/s on the bed instead of rough6.6m/s; stepping off it restores the actual ground. Cart/mower traction continues to use the original `surfaceAt`. Footstep contacts classify their actual sole positions through the same runner surface query, rather than using the old vehicle-only ground map. Foot motion, gates, collisions, Joe's speed/charge rules and navigation are otherwise unchanged.

Updated Back Nine import aliases for course, simulation, route art and runner audio. Source snapshots before this pass are in `output/back-nine-experience/footpath-surfaces/baseline-source/`.

## Gameplay and audio evidence

- `verify-chase-footpath-surfaces.mjs`:680centreline samples and inner lateral samples all have firm footing and remain physically clear. Compared269,031whole-course samples with the actual prior course module: **all vehicle surface classifications remain identical**. Runner-only differences are confined to the visible strips; wet priority is preserved. At30/60Hz, each straight strip reaches7.2m/s without stepping across a wall. Warm100,000query sample takes about11ms total; this is a helper CPU microprofile, not a frame-time claim.
- `verify-runner-passages.mjs`:48routes, both directions,30/60Hz and four Joe separations.46complete, the same two close reverse garage approaches are actual catches, zero penetrations, zero snags. With distant Joe, forward60Hz passage times change range6.80→6.63s,garage6.10→6.07s,reservoir6.80→6.45s. Benefits remain modest and depend on staying on the paving; there is no hidden invulnerability.
- `verify-chase-variation-routes.mjs`:64full live-Joe wins,42cart/22foot finishes, seven encounter patterns; minimum surviving cart health4. This covers the ordinary course/alternate routes, not every possible human maneuver.
- `verify-back-nine-choices.mjs`:five cart apertures, three foot apertures, reachable mower detours, seven driving branches, damage rules and actual late ram→ejection→foot gap→garage victory with live Joe pass. `verify-chase-route-guidance.mjs` keeps route hints optional and the breakdown surprise unspoiled.
- `verify-chase-breakdown-clearance.mjs`:1,401placements, at least five escape options each, four fatal-impact recovery scenarios and useful wreck cover pass. Minimum reachable distance5.057m. Wreck escape scenario5.43s versus3.05s exposed; no forced vehicle removal or collision bypass.
- `verify-runner-footstep-audio.cjs`:surface tone/level differences, mute, pause, retry, stale contact and allocation checks pass. New browser checks additionally assert actual presented contacts on all three new strips use `path`, rather than relying on generic source positions.

## Visual and live-input verification

`verify-chase-footpath-browser.cjs`, hardware and `--software`:three routes at2560×1600,1280×720,844×390. Real W input advances along every route; inspectable posed runner, actual hard footfalls, reduced motion and pause checks pass. All18rendered route views are saved. Inspected the range at high resolution, reservoir at ordinary resolution and garage at compact resolution. Surface edges and original inset slabs lead through the physical narrow gaps without arrows or glowing routes.

First version of the browser fixture presented only one frame after650ms of simulation and consequently did not produce a reliable foot contact. Corrected the fixture to present13frames at50ms intervals; actual contacts then pass in both renderers. The game's contact-driven audio was not weakened to accommodate the test.

Hardware20/software25programs,40textures,1114startup buffer uploads,12voices; no extra updates/late allocations or console errors. New triangles merge into existing track batches. The four measured views retain97/91/89/128draws in the sequential before/after comparison and add only14–26visible triangles depending on view.

Installed standard client: `verify-presented-client.mjs --back-nine --foot-gap`, two one-second W bursts. Inspected screenshots and text states: first reachesy774.55 with hard path footsteps; second reachesy781.66 after leaving the bent strip, correctly returning to rough footsteps. Eight contacts played, none dropped;960×540software canvas,25programs,40textures,12voices. Navigation signature2693326411, baked grid and zero runtime edge checks retained.

## Rendering cost and limits

Artifacts include `moving-performance-first.json`, `moving-performance.json` and `paired-performance.json`. The first sequential experiment overlapped the end of an independent CPU regression and cannot isolate cost. Repeated without that job, sequential baseline runs still changed dramatically: for example the unchanged foliage median80.4→48.4ms. Do not derive speedups or regressions from those absolute cross-run values.

Added a same-scene diagnostic which alternates only the new bed indices at each identical moving pose, retaining original vertex attributes, all other triangles, material state, camera and beacon refresh. Both variants upload the index buffer through the same path; each draw waits for GPU completion.64paired frames per view, fixed960×540, one existing track batch, maximum24visible bed triangles removed for the comparison. This isolates marginal bed cost; it is not the final game's displayed FPS.

Original→added median/p95ms:

| View | Median | p95 |
|---|---|---|
| Range footpath |59.4→59.8|64.1→65.5|
| Garage footpath |56.6→57.4|61.7→62.7|
| Reservoir footpath |65.8→66.7|73.6→72.7|
| Foliage with mower |68.4→66.9|79.3→79.0|

Retain the modest readability/footing improvement with the measured .4–.9ms median cost in the foot views explicitly acknowledged. No overall software-frame or startup improvement is claimed. Performance remains open; no new material, shader, texture, draw batch or audio node is introduced.

## Remaining scope

This closes the specifically identified foot-surface mismatch and improves#5,#6,#21,#23,#29 without declaring their whole-course experience audits complete. All38requirements remain in the ledger. Broader district composition, landmark/darkness readability, omen variety/frequency, natural full-run audio/dialogue acceptance, cold startup/retry behavior and measured worst-case rendering still require work. Next prioritize cold-start/retry evidence and remaining natural route/encounter acceptance alongside a new renderer hypothesis; do not repeat rejected geometry/index changes as presumed wins. Human recognition/comfort/balance questions remain prepared, not answered. All owned tests observed terminal; local server retained.
