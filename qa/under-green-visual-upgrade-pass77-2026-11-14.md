# Under the Green pass77: entrance vault and attached decay

Local progress toward V07/V08/V11/V12; the complete 53 requirements, 48 refinements and seven whole-level gates remain open.

The first 16 metres of the gallery now have a closed shallow elliptical soffit: 3.05 m spring, 4.15 m crown and unchanged 4.35 m roof top. Ten panels cover 160 square metres. Physical arc-length UVs preserve material density. Existing roof damage is clipped into matching strips before bending, so both its edges and triangle interiors remain seated. Upper wall-render remnants fit below the spring. Roots, existing lamps, routes and colliders are retained. Entry grille bars were seated into the wall after near-boundary camera checks found the former bars projected into the player space.

Evidence in `output/under-green/visual-pass77/`:

- Geometry unit: ten closed consistently wound panels, 1,336 triangles, 7,220 overhead probes without gaps, 4,568 attached-brick samples at 6.98-8.02 mm below the soffit, three retained wall brick windows. Attached finish minimum height 3.2316 m. Current wall-render unit also passes.
- Final native and software reports both pass 36 captured states, 7,488 legal camera poses without intersections, ten positive-controlled exterior roof-opacity tests, pause, rear glance, crouch, reduced motion and exact camera-return pixels. Outside-region fingerprints preserve 300,629 native / 225,897 software triangles. Pump/keeper images are byte-identical to the baseline. Backward input stops at course y=.328 with camera clearance.
- Native actual resolutions: 2560x1600, 1280x720, 390x844, 844x390. Software: 960x600, 960x540 and compact sizes. Native entrance/roof/portrait and software west-roof images visually inspected.
- Moving clearance route: 1,379 frames, 106 actor geometry samples, no intersections; 80 additional gallery Joe/scythe poses clear. See `route/moving-clearance.json` and `actor-clearance.json`.
- Installed client final state and image inspected: ready/playing, checkpoint0, elapsed1s, player(0,8.072), actual960x540; no error artifact. Initial Preparing click timed out and subsequent Enter bursts recovered. Final client session14032 exited0.
- Full suites/route/actor/client completed before timings. Native timing completion recovered through final report and absent process; software session60280 exited0. Alternating GPU-fenced medians baseline/current: native approach18.6/18.8ms, westroof7.8/7.9, crossing15.1/15.7; software185.0/185.7,61.4/72.4,191.8/181.9. Close software roof regression remains a concern. Other chapter jobs appeared in final process inventory, so these are local diagnostics, not isolated production pacing qualification.
- Native canopy submission530draws remains530, triangles422654 to427924. No additional textures, shader programs or lights in paired views. Full-level software performance remains unqualified.

No completion statuses are promoted. Continue floor/water integration, pump/range/keeper compositions, actor/motion review, matched current Level1 and sustained performance. The recent planning review supplied new six-district static evidence but did not implement additional features.
