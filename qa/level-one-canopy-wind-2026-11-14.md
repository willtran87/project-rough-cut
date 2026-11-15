# Level 1 connected canopy wind

This is a partial V06/V14 improvement within the full V01–V21 visual upgrade. The preceding spectral-surface turn made implementation and verification progress. Current tree source inspection found detailed crowns and three forms, but no tree motion while the nearby verge, reeds and cloth already responded to wind.

## Change

- All 137 existing 3D trees now use the same course wind clock/direction as the other vegetation. The geometry, textures, placements and three forms are retained.
- `course-tree-wind.js` binds a shared height-dependent shear to every branch, trunk and needle surface of each tree. The bottom .6m stays fixed, and movement grows toward the crown. Maximum horizontal displacement is capped at .25m plus a small crosswind component; vertical positions and canopy walking clearance stay unchanged.
- Six static coefficients per vertex avoid per-vertex trigonometry. The shared wind uniforms already provide the time terms. Normals follow the analytic shear so illumination stays attached to the moving form.
- `pixel-world-props.js` separates tree materials from fixed timber before merging, preserves the new attributes, and expands batch and piece bounds by .27m. Actual depth and point-distance shadow materials use the same deformation. Ten shared shadow materials dispose exactly once on rebuild.
- Pause, smooth reversal, reduced motion and effect-disable behavior come from the existing wind controller. The gameplay simulation, physical obstruction data, light output and 28 symmetric lanterns are unchanged.

## Verification

`tools/verify-course-tree-wind.mjs`: 516,132 pose/direction samples, including 71,685 rooted samples; largest sampled displacement .253503m stays inside .27m bounds. Coincident vertices from separately built branch/card geometry receive identical coefficients. Shared uniform pause and reduced-motion checks pass.

`tools/verify-course-wind.mjs`: existing shelter, reversal, pause, reset and phase-equivalence checks pass.

`tools/verify-course-canopy-wind.cjs`:

- Native before/after and final software runs use the actual level at 2560×1600. Five approach/woodland views each have two wind poses. Additional 1280×720 and 390×844 views, reverse wind and reduced-motion captures are retained.
- Actual assembled geometry contains 264,241 tree vertices, including 22,911 fixed lower vertices. All phases are finite/normalized; peak bend weight is .25. Both shadow material types are attached.
- The production GPU bend matches a CPU-baked vertex/normal reference with zero changed channels on both renderers, including normal world rendering with shadows enabled as configured by the renderer.
- Eight culling views: all native and seven software shaded comparisons are pixel-exact. One software view differs by at most 2/255 across 2,362 channels. Adding one entirely offscreen trunk reproduces this colour difference; compacted indices match their expected contents. With wind removed the difference is zero. An independent unlit, per-piece colour-ID comparison preserves exact pixel coverage and frontmost piece identity, so the observed discrepancy does not show a missing branch. A software shading-precision explanation is consistent with this evidence, but is not proven. This is a bounded colour discrepancy, not a blanket pixel-exact claim.
- The diagnostic's full-index replacement clears stale partial-upload ranges. That fixture correction alone did not remove the colour discrepancy. A temporary ID-shader vec4/vec3 mistake was fixed before the final passing run; production shaders did not generate that error.
- Repeated frames and pause freeze wind; reversal passes through calm; reduced motion holds a still pose. Warm resource counts remain stable. All ten owned shadow materials dispose exactly once on a scene rebuild. No browser errors in the final runs.
- 28 path lanterns and ambient intensity .005 verified on both renderers.

Artifacts: `output/level-one-canopy-wind`. The high-resolution native opening/east pose pair was opened and inspected. Further final smaller-screen/software inspection is recorded with the completion notes below.

## Cost and limits

The tree buffers add six floats per vertex, approximately6.34MB of immutable attribute data. Separating moving timber raises the measured initial native geometry count from939 to966; texture count stays107. Geometry and material counts vary with warmed views and renderer, so these counts are not a frame-rate result.

The `--budget` mode compares the same merged scene with the tree deformation shader enabled versus compiled out at960×540. It refreshes shadows and uses synchronous pixel readback; it excludes the backdrop/compositor and does not measure the additional batching/loading cost against the original build. Native round-median averages, static/animated: opening6.35/6.55ms, east3.90/4.05ms, range6.60/6.35ms. Small differences are noisy and are not a speedup claim.

Whole-level/software performance, vegetation habitat and silhouette composition, canopy shelter refinement, and the remaining full visual checklist stay open. This pass adds coherent tree motion; it does not accept the entire environment or V14 category.

Software shader-only static/animated round-median averages: opening98.10/92.50ms, east180.45/114.15ms, range108.00/110.35ms. The large round-to-round variation makes these unsuitable for a speedup or regression-free claim. The complete software frame budget remains unaccepted.

Final native1280×720/390×844 woodland and software2560×1600 pond views were opened and inspected. The silhouettes retain dark intervals and the original lighting; the software image remains limited by its existing render-resolution budget.

## Gameplay and cached-light check

The installed web-game client completed eight bursts; final state7 is first_hole at x13/progress24/travel34. Screenshot/state inspected with no error artifact. Completed software scene average85.75ms/P9595.40ms over120samples remains outside the target budget; this is not a paired comparison with prior turns.

Current rendered-world metadata places the nearest padded moving-tree bounds6.947m from the opening sign's1.85m source. Its cached static shadow therefore does not need a new tree-wind invalidation path in the checked layout. Evidence: sign-shadow-clearance.json. Broader variant/full-route acceptance remains open.
