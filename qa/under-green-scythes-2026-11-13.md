# Under the Green: scythes, shadows and panic motion

Implemented the requested chapter-specific changes. Joe and apparitions carry a bent wooden grass scythe with a curved steel blade; Joe's existing hand IK, attack timings and swept hit capsule remain authoritative. Shaft/grip clearance is now sampled alongside the blade. Motor audio is replaced by proximity breathing and blade swishes. Level 1's ghost appearance is unchanged.

Apparitions bake the posed body and weapon into one dark, dither-fading mesh (19,294 triangles, one draw call when visible). A pointer-transparent vignette darkens the scene perimeter below the HUD. Movement adds bounded vertical bob, pitch and roll, strengthened by sprinting and Joe's proximity. It defaults to 25% in this chapter, stops when standing, and does not affect physical movement or mouse input. Its separate saved slider respects zero; Reduced motion overrides it. Shared Level 1 comfort settings are not changed.

Validation:

- `verify-under-green-scythes.mjs`: 1,000 motion samples, maximum 4 cm vertical offset, zero motion when standing/reduced/disabled; blade remains within the existing attack capsule.
- `verify-under-green-scythes-browser.cjs`: seven rendered views at 2560×1600, 1280×720 and 390×844; scythes and dark ghosts present, hand IK and static mesh clearance pass, vignette does not intercept input, no action banner, blade audio active, no motor starter, 16 audio voices. Default motion, pause freeze, reduced motion, zero persistence and untouched shared comfort pass. No console/page errors.
- `verify-under-green-clearance.mjs`: 1,288 floor/heading samples and 11,822 live route frames pass, including raised carry, close-wall turns and gate occupancy.
- `verify-under-green-moving-clearance.cjs --dry`: 1,379 rendered route frames, 76 geometry samples, zero intersections; maximum foot error 0.000000207 m.
- Dry/wet/sprint simulated routes complete in 75.983/89.583/51.783 seconds with zero water hits or solid intersections.
- Installed gameplay client rerun after the final motion default change. Final screenshot and text state inspected: ready, playing, normal stopped camera, no errors. Actual high-resolution and desktop/phone Joe/ghost screenshots inspected.

Artifacts: `output/under-green/scythes/`. No new performance claim; the visual checks are not a long-duration performance benchmark. All owned jobs finished. Existing server on port 4187 retained.
