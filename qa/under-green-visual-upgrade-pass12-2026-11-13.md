# Under the Green visual upgrade — pass 12

The full objective remains all 53 visual requirements and seven release gates. Previous turn completed V33 evidence and updated the comprehensive plan. This pass advances V23 spray finish and V25 color consistency.

## Implementation

Added under-green-spray.js with deterministic world-clock samples. Stream droplets follow the existing shared nozzle paths, with short ligaments near the outlet, downstream spread, and low-frequency emission variation. New rounded masks replace long tapered streaks. Maximum sampled droplet length is 8.43 cm; most are substantially shorter. Impact fans follow incoming horizontal momentum with 9.8 m/s² gravity and peak at about 22 cm. Jet landing height follows the actual channel/flood surface. Camera-facing orientation follows projected travel on both channel axes.

Replaced fixed breathing mist puffs with two overlapping short-lived clouds per jet. They expand, drift from the impact, and fade to zero at phase wrap. World time drives all phases, so looking away never restarts them. Reduced Motion freezes decorative motion; authoritative water state remains live. Existing pause, contact history and retry semantics are retained.

Particle lighting preserves contributions from the actual fixed practical lights but restrains saturation after shading. Silt-colored texture and instance variation replace cool green palettes. Opaque architecture still depth-tests the effects. Spray clouds use diffuse-only lighting; droplets and ripple crests retain specular response. All three effect pools use one pass, with no extra artwork textures, lights, postprocess or gameplay obstacles. Mist capacity is 128 planes; existing drop/ripple capacities remain unchanged. The initial hardware fixture uses 379 draws versus 380 before, unchanged submitted triangles and 69 textures.

## Verification so far

- Pure spray sampler: 663,552 samples, finite/bounded dimensions, all drops at/above their current water surface, gravity-derived splash velocity, deterministic repeat, cloud centers within authored floors and invisible particle reset phases.
- Existing water contacts suite passes actual player/Joe/blade/drip locations, dry suppression, pause, capacity and retry.
- Existing water contract suite passes 173,304 state comparisons, 23,120 waiting comparisons and 23 invalid definitions. Shared timing/navigation is unchanged.
- Existing hardware 47870 and software 74445 water-art regression: 17 views each, low/warning/surge/recession and flood rise/high/fall/damp, real player/Joe contacts, pause/reduced/retry, four viewports and zero errors. These preceded the final diffuse-only cloud material adjustment.
- Initial targeted hardware 90162/software 55627: six before/after contexts including cold crossing, keeper, side, rear, x-axis outflow and high flood. Both pass visible effects, exact wall occlusion, rear restore, moving phases, pause, Reduced Motion and four viewports. Native hardware is 2560x1600; software actual target is 960x600. Cyan fraction in positive effect contribution falls about 70 percent in the two cold-lit views. This metric is specific to those captures, not a universal art-quality score.
- Initial targeted 960x600 timing (GPU fence completed, six warmup and 24 samples per version, sequential before/after): hardware median 10.9→10.7 ms, p95 12.0→15.8; software median 134.8→139.0 ms, p95 140.1→142.0. Diffuse-only mist subsequently replaces Phong mist; final receipts pending below. No performance improvement or full software gate acceptance is claimed.
- Inspected native surge/side/keeper and motion endpoints plus 390x844. Muted irregular droplets preserve the pressure arc and impact while avoiding cyan streaks. The scenery is not accepted as complete by this water pass.

The first targeted harness 56438 timed out because Windows CRLF prevented a test-only instrumentation marker from matching. It reached terminal before replacement. Normalized line endings and added an explicit marker assertion. No runtime defect caused that timeout.

Final targeted hardware 72840 is running; final software and installed skill client still required. Evidence: output/under-green/visual-upgrade/spray and pass12-baseline. Full source snapshots and ledger acceptance follow final receipts.

## Remaining scope

V23 may be accepted after final visual/client receipts. V25 still needs full water-reflection acceptance. The other materials, architecture, roots/mud, actors, machinery, fixtures, UI and all seven release gates remain active. Next V49 source finding: ShapeGeometry chevron UVs use local coordinates rather than a normalized lens-art domain, flattening its texture; lamp shapes and their housings also need a coordinated physically recessed finish. Preserve the three shape/color states and actual sightline/clearance checks when fixing it.


## Final receipts

Final diffuse-only cloud build: hardware 72840 and software 9267 terminal PASS. Six before/after contexts each, six motion frames, exact solid-wall occlusion, stable rear restore, pause and Reduced Motion, plus 1280x720, 390x844 and 844x390. Hardware actual 2560x1600, software actual 960x600 in the high viewport. Zero browser errors. Final cold-crossing cyan fraction is .0770 versus .2476 before on hardware and .0855 versus .2598 on software; keeper .0709 versus .2232 hardware and .0712 versus .2338 software. Final hardware crossing/side, software keeper/landscape and installed-client screenshot inspected.

Final timing at 960x600: hardware median 10.9→10.0 ms, p95 12.0→15.0; software median 150.1→151.0 ms, p95 153→154. Sequential samples vary across runs (the baseline itself rose from134.8 to150.1 software), so do not attribute the whole difference between runs to the cloud-material adjustment. This pass does not meet the full software performance gate.

Installed skill client 28641 terminal exit0. Five fresh image/state pairs, final playing at (0,16.52), opening inactive/completed, actual960x540, no errors artifact. Final shot4 inspected. All three final runtime source snapshots match byte-for-byte. No owned verification processes remain.

V23 remains in_progress: native breakup/color/fans/clouds are improved and verified, but individual droplets are faint in the smallest software landscape view. The physical signal and HUD remain readable. Finish screen-space particle-footprint/readability tuning before asserting its full hazard-envelope acceptance. V25 remains in_progress for full reflection acceptance. No release gate is marked complete. All53requirements and7gates remain active.
