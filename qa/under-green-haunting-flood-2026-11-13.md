# Under the Green: hauntings, flood cycle, solid distance and E interaction

- Reuses Level 1's ghost Joe GLB and pixel-dissolve shader. One apparition at a time, five fixed clear sites, seven-second fade/hold/fade and at least 24 seconds between sightings. Sites require a clear sightline and 7–22m range. Close real Joe, recovery and sluice operation suppress ghosts. No collision, pursuit changes, invented Joe sounds or action banners.
- Whole floor union floods from the attempt clock. First warning at 32 seconds, six-second pressure rumble, eight-second rise, nine-second crest, ten-second drain, then a dry interval; cycle repeats every 66 seconds. Peak depth .38m, movement multiplier .74. Joe's navigation pace receives the same multiplier; strike timing stays unchanged. Bank guidance uses the slower expected pace during warning/rise. Pause freezes the cycle; retry starts dry. Reduced motion freezes cosmetic wave/head motion while water height remains authoritative.
- Dark lit/fogged flood material uses fragmented highlights. Flood sound reuses the aftermath noise voice while playing, retaining 16 total voices and the existing volume/mute/focus controls.
- Removed the outdoor sky/treeline backdrop from this underground renderer, filled empty distance with opaque fog-colored darkness, and extended the far clip from 65m to 200m. Actual north terminal wall intersects the test ray at 70.89m, beyond the former cutoff. No wall transparency added; geometry/occlusion remains unchanged.
- Migrates saved Enter interaction to E in this chapter, persisting the shared on-foot setting. If another action owns E, swaps that action to Enter rather than duplicating keys. Other custom bindings survive. E also starts/resumes/retries from menus; during play Enter does not operate the pump.

## Verification

- Pure rules: all five ghost sites clear, lifecycle/reset/real-threat suppression, flood phases/repetition/pause, actual walking 3.84m dry vs 2.8416m flooded in one second, conservative crossing pace.
- Browser suites: hardware and SwiftShader, 2560×1600, 1280×720 and 390×844. Actual ghost asset ready/visible, synchronized flood audio/render/simulation, pause/reduced motion, old Enter conflict migration, E pump operation, Enter no-op during play, reset state, wall occlusion and far clip. No browser errors.
- 120 existing water-state browser contract cases pass. Three map-aware full simulation routes (dry, timed water, sprint) finish in 75.98/89.58/51.78 seconds, with zero water hits and no solid intersection. Automated evidence does not establish human horror/balance acceptance.
- Installed gameplay client final run exited 0; screenshot and text state inspected. Final hardware ghost/flood and software flood/distant-wall screenshots inspected. Syntax and diff checks pass.
- Sequential production software smoke, 60 seconds at viewport2560×1600/FOV85: 23.90 rendered FPS overall; intervals24.59 and23.20 FPS; final completion p95 42.2ms at adaptive480×300. Includes flooding. No context/error report; no completed lap, so not a sustained stability qualification. No fresh hardware FPS claim.

Evidence: `output/under-green/haunting-flood/`. Broader implementation goal remains paused; no commit or deployment.
