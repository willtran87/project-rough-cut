# Under the Green — bounded opaque-wall culling

Scope: review items 23, 40, 41 and 44. This pass addresses demonstrated rendering cost without changing movement, water, pursuit, attacks, route geometry or visible scene detail. The full 44-item implementation and experience acceptance remain open.

## Evidence and rejected approaches

The prior actor-culling build failed the unchanged software floor: 23.18 submissions/s in its slowest warmed window, against 24 required. That failure remains in `output/under-green/actor-culling-candidate/soak/`.

`tools/profile-under-green-route-views.cjs` sampled 114 ordinary route states with completed RGBA readback. Root-gallery and bunker views had substantial rendering cost beyond CPU submission. These are diagnostic fixed-view timings, not production FPS. Reports and screenshots are in `output/under-green/route-view-costs/`.

A signal-batching experiment removed 84 draw calls in the root gallery but did not produce a dependable paired benefit and changed 3 framebuffer bytes in one bunker view. It remains an isolated test fixture, not runtime code. Component-omission diagnostics also remain test-only: removing water, backdrop, actor or lighting changes the scene and is not a qualified optimization.

The first opaque-wall candidate projected every wall. Of 114 route views, two changed thin painted route edges. A small-volume exemption corrected those samples, but an extreme upward view revealed a thin flagpole difference. The retained diagnostics identify each original failure. Exempting parts thinner than 10 cm preserved all 230 final views, but projecting all 326 walls increased moving-camera CPU work enough to erase the rendering benefit. The unbounded candidate was replaced with a bounded subset; its failed performance comparison remains in `solid-culling/volume-final/`.

## Runtime implementation

- `solid-occlusion.js` accepts an optional positive integer `maxSolids`; the existing default remains unbounded. The finite path selects the nearest eligible wall bounds ahead of the camera, then applies the existing contracted convex-hull proof. Omitting an occluder can only leave additional geometry visible.
- `course-batch-culling.js` accepts optional static occlusion callbacks. Camera changes update the proof; an unchanged camera does not rebuild it. Existing triangle order and selective index uploads are preserved. QA inspection restores every authored piece and invalidates the camera cache before rendering resumes.
- Under the Green's software path supplies at most 24 opaque wall interiors, inset 5 mm from the actual wall volumes. Gates, openings, water and decorative surfaces are not occluders. Parts thinner than 10 cm retain their original rendering path, covering route paint and thin posts. The hardware path does not use the new occlusion.
- Back Nine retains the default course-batch helper without occlusion. Level 1 retains the default unbounded solid helper. Their existing semantics are covered by helper comparisons below; this pass does not claim a new full-chapter browser regression for either consumer.

## Verification

`tools/verify-under-green-solid-culling.cjs --output=output/under-green/solid-culling/bounded-final` passes 230 integrated comparisons: 114 continuous-route samples; four selected poses at 2560×1600, 1280×720, 844×390 and 390×844, requested resolutions .5/1 and FOV 45/58/85; four additional capture poses; and 16 extreme pitch/eye-height cases. All framebuffer bytes match with the optional cover proof enabled/disabled. Full QA geometry is restored, the next render matches, stationary index uploads remain zero, and there are no browser errors. The four final screenshots were inspected. Compact views use keyboard UI, not physical touch qualification.

The moving-view test measures CPU submission plus complete framebuffer readback in ABBA order, with 64 measured frames per block. In the bunker, baseline medians are 37.2/38.6 ms versus bounded 33.5/32.0 ms. Root-gallery results are mixed: baseline 38.3/35.6 versus bounded 36.0/36.6. CPU work increases modestly with bounded checks; the bunker rendering reduction outweighs it in this comparison. These timings are paired diagnostics, not sustained FPS or evidence of a universal speedup.

The bounded-helper test passes 96,096 subset comparisons with 18,583 hidden results and limits 1/4/24. It rejects invalid budgets. The default solid proof passes 144,000 comparisons against its eight-corner reference plus 432,000 frustum checks. The course-batch test passes 48 full restore/recull cycles and optional-cover cache invalidation/restoration cases. These checks preserve the unchanged default consumers' helper behavior.

The installed ordinary-input game client completed successfully. Its latest screenshot/state show ready/playing at 2.567 seconds, released movement stopped, normal vertical-look preference, and no error file. Artifacts: `output/under-green/solid-culling/client-final/`.

## Sustained measurement

The five-minute production-loop software measurement in `output/under-green/solid-culling/soak/` completed successfully; the independent analyzer also exits 0. Viewport 2560×1600, FOV 85, requested resolution 1, Chromium 148.0.7778.96 / SwiftShader. Ready time is 1,189 ms. The scene adapts from its 960×600 ceiling to 480×300, with native HUD separate.

Warmed rendering averages 31.11 submissions/s; the slowest window is 26.29, above the unchanged 24 minimum. RAF p95 is 16.8 ms. All four complete routes exactly match independent simulation contracts for position, elapsed time and water hits (walking has one expected hit, the other three have zero). Resources plateau at 290 geometries, 56 textures and 21 programs; all 16 audio voices remain allocated; post-GC heap changes by −412,612 bytes; the outstanding-frame queue stays at one; no page/context errors occur. The final keeper-room capture was inspected.

First-use windows are 30.91, 28.65 and 22.56 submissions/s. The last does not meet the warmed floor and is retained explicitly as unfinished first-use performance. This is not a cold-cache measurement. The warmed pass establishes this defined local workload only; it does not resolve all performance acceptance.

The source manifest captured during startup and compared at termination is unchanged for Under the Green and both edited shared helpers. Concurrent changes occurred only in `back-nine.html`, `back-nine.js`, `chase-player.js`, `game.js`, `index.html` and `scene-3d.js`, none loaded by this chapter. The comparison is saved beside the measurement. Cross-run timing differences alone are not attributed entirely to the optimization; the within-run paired comparisons provide the attribution evidence.

Earlier failures remain authoritative for their respective builds. This result supersedes the current warmed software-budget failure without erasing its history.

Remaining acceptance includes other sustained aspect/device workloads, cold/slow loading, physical controllers/touch and integrated GPUs, extended thermal sessions, and unfamiliar-player comprehension, fear, enjoyment and listening. No automated result here establishes those experiences.
