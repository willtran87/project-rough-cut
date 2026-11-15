# Level 1 Water Hazard motion and reflection — 2026-11-12

Advances Z3/V8/V9. The Water Hazard's complete composition, suspense and human
readability acceptance remain open.

Pond reeds now bend gently from rooted bases using the existing wind strength
and simulation clock. The shader operates on existing batched cards; there are
no extra reed draws or per-frame vertex uploads. Reduced motion holds the reeds
still. Shadow-depth rendering uses the same deformation, and batching/frustum
bounds include a 0.11 m motion margin beyond the maximum 0.095 m lateral bend.
Gameplay cover and collision data are unchanged.

Both Water Hazard ponds gain broken reflections of the actual nearby floodlight.
The reflection point uses the camera-to-mirrored-light ray intersecting the water
plane, so moving the viewer does not move the source. Reflection strength follows
the existing floodlight power function and shares the lens/pool tint function.
The distant third pond has no nearby source and gains no fictional floodlight.
This remains a stylized highlight in the existing opaque water shader, not a
full reflected scene or an additional render target.

## Evidence

- `node tools/verify-water-hazard-craft.cjs`: final 60444 exit 0, four groups,
  zero browser errors. Earlier completed passes 57528/2200 also exited 0.
- Actual review-lights-out state sets both nearby pond reflections and the
  floodlight fixture to zero; restoration returns them together. Same-time
  rendering, pause, and reduced-motion updates preserve motion clocks.
- Controlled matching 2560x1600 screenshots isolate reflection on/off and reed
  time changes. Final image comparison: 16,487 pixels differ by over 3 luminance
  levels for the reflected highlight; 432,274 for the reed phase change.
  Bounds and counts are in `output/water-hazard-craft/pixel-report.json`.
- Temporarily enabled the actual moon-shadow path in the test renderer and
  produced a shadow map with the reed depth shader, without shader errors.
  This checks the path on the available renderer, not hardware performance.
- Forty animated presentations keep 916 geometries, 106 textures and 87 programs
  after warming that extra shadow path. No sustained FPS improvement is claimed.
- `node tools/verify-floodlight-sync.cjs --software`: final 21974 exit 0;
  lens/pool/haze tint and power, on/dim/off/restored rendered brightness,
  independent lamps, real failure state, pause and shader reuse pass. Earlier
  93676 also passed.
- Installed gameplay client final 15178 exit 0: two actual arrival input
  iterations. Final page-1/state-1 inspected, first_hole and no browser error
  artifacts. Earlier 58677 also passed. Existing readiness failures remain
  hidden_collision_owned_by_parent_art and gameplay_frame_budget.
- Inspected shoreline at 2560x1600, 1280x720, 844x390 and 390x844. The pond,
  reeds and reflection remain identifiable. Portrait letterboxing persists.

The initial fixture wrongly assumed only two water surfaces existed. Inspection
showed a third distant pond; the final check specifically requires two real
floodlight sources and zero invented light at the distant pond.

Artifacts: `output/water-hazard-craft/`. Broader shoreline detail, shadow/source
occlusion across all viewing positions, dramatic zone pacing, navigation
comprehension, night-display readability and human horror acceptance remain open.
