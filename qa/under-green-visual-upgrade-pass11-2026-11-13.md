# Under the Green visual upgrade — pass 11

Full scope remains all53items and seven release gates. Previous turn completed V29 contact grounding. This pass implements V33 localized damp air; final normal-input client receipt is pending below before item acceptance.

## Localized humidity

Added under-green-humidity.js: six fixed pockets at the lesson, bunker, pump return, range-B and sluice water channels, plus the cold maintenance shaft. Five low puffs per channel and four at the shaft share a128x128pixel-cluster alpha mask, one instanced draw and58triangles maximum. No additive blending, new lights, depth prepass or full-screen postprocess. Actual opaque walls depth-test normally. Low pockets stay above the authoritative water/flood surface; shaft humidity stays below the ceiling.

A continuous analytic clock drives small slow drift and opacity variation. Visibility never starts/restarts a particle. Distance fade is smooth between26–32m, with a near-camera fade. Fixed lamps contribute small color shifts using their existing positions/colors and dampLampLevel. The air uses an inexpensive basic material rather than evaluating17surface lights per fragment. This is an authored approximation of scattering, not physically simulated volumetrics.

Reduced Motion freezes ambient drift/opacity, reduces density, and steadies lamp color through the existing steady lamp mode. Height continues following actual water state so visual immersion stays truthful. Simulation pause freezes it; retry uses the new run's clock. General depth haze now begins at14m instead of8m, retaining opaque fog at43m. This preserves nearby material contrast while localized pockets supply foreground dampness. Existing far-fog solid-depth shading and camera far200 are unchanged.

## Verification

- Pure sampler:23,258samples over200seconds in both bypass states,1,488,512boundary samples. Every puff remains finite, inside the physical floor boundary, and at least1.79cm above its water surface including card height. Deterministic repeat, stable IDs, all six pockets/capacity29, Reduced Motion fixed lateral positions/size/alpha pass.
- Final hardware50162 and software63119: eight A/B contexts (gallery,shaft,crossing,bunker,pump-return,keeper,high-flood,Joe) plus1280x720,390x844,844x390. Native hardware2560x1600; software high-viewport internal960x600. Actual pixel contribution in every context; maximum channel change8–11/255 hardware and8–11software. Real high-flood depth0.38 asserted. One draw throughout visible pockets.
- Wall-facing occlusion fixture produces exactly zero changed pixels with mist toggled, so the tested solid wall fully blocks it. Rear glance preserves all world samples exactly; elapsed time advances motion; pause freezes it. Reduced Motion holds drift/size/opacity while the water remains authoritative. Zero browser errors.
- Inspected gallery/crossing and Joe native screenshots; low mist preserves the readable body/scythe silhouette and bank signals. The effect is deliberately restrained. Additional responsive and software captures retained.
- Final normal-motion paired GPU-completed960x600 timing: hardware median10.1ms both enabled/disabled, p9515.0versus13.6; software126.0ms enabled versus123.1disabled, p95130.1versus128.0. Approximately2.9mssoftware median incremental cost. This does not resolve or accept the existing software performance gate. Initial reports (retained separately) timed with Reduced Motion enabled and are superseded by these normal-motion figures.

No simulation, movement/input, pursuit, scythe timing, checkpoint or banner changes. The outstanding V30 projected shadow, material/actor finishing, rest of the53requirements and all seven full-level release gates remain active.

Evidence: output/under-green/visual-upgrade/humidity, pass11-client and pass11-source. Final client result appended when terminal.


## Final client and visual review receipt

The installed client is no longer running. Its five screenshot/state pairs are present through shot-4/state-4; final state is under_green_playing, opening inactive/completed, player (0,16.52), render target 960x540. No errors artifact is present. The original process exit code was not recovered, so this receipt relies on completed artifacts and process inventory. Inspected final shot-4, native 2560x1600 gallery/Joe/keeper, hardware 390x844 crossing and software 844x390 crossing. Humidity remains restrained and does not bleach the route or Joe. Both final runtime files match the pass11-source snapshot byte-for-byte.

V33 is implemented against the local humidity requirement. Full matched Level 1 comparison, route-wide material acceptance and all seven release gates remain pending. Visual review still finds repetitive fine masonry contrast, long smooth pipe lengths, conspicuous flat signal shapes, sign/support overlap and cyan spray streaks. These remain explicit follow-up work rather than evidence of full-level acceptance.
