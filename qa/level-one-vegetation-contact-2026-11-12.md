# Level 1 vegetation contact and recovery

Full Level 1 scope stays active. This advances X8/V8/V6; it does not complete
all environment response, route readability or human experience acceptance.

## Change

Before this pass, low course plants were static and pond reeds only swayed with
wind. Existing simulation-owned footprints, mower cuts and clippings already
provided persistent evidence and were retained.

`course-vegetation-contact.js` supplies a bounded field for the player and Joe:
each has a current body envelope and two recent locations fading over 1.2
simulation seconds. Joe's envelope is centered 0.45 m ahead of his feet along
the rendered effectHeading, between his stance and the deck. Plants bend away
locally with their roots fixed. Small plants get proportionately smaller bends;
tips move at most 0.45 m. Wind remains independent.

The shader works on the existing six instanced course-understory batches and
the existing batched pond reeds, including their shadow depth material. It adds
no geometry, textures or draw calls. Bounds gain 0.65 m padding for bent tips,
including per-instance and software reed-part culling. Off-course woodland
plants, opaque hedges, physical collision, hearing, concealment and AI tracking
rules are unchanged.

Repeated renders do not advance history. Pause freezes it. Restarts clear old
history, and a position jump over 4 m cannot bend an intervening strip. Reduced
motion keeps immediate physical displacement and removes lingering recovery.
No new rustle/noise rule is introduced; existing footsteps and mower sounds
remain the audio layer. Dedicated vegetation-sound and human mix acceptance
remain open.

## Verification

- `test-course-vegetation-contact.mjs`: body/deck position, bounded history,
  decay, repeated rendering, pause, teleport, reduced motion, restart and absent
  actors. `verify-static-instance-culling.mjs` also checks a bent tip entering
  the frustum while its original plant is outside.
- Hardware contact session 6493 passes six groups. Actual authored plant
  placement is collision-valid. Disabling only contact uniforms changes 16,788
  scene-target channel samples; restoring them reproduces the exact image.
  Actual Joe investigation movement produces wakes and simulation-owned mower
  cuts. Actual W movement drives player contact; waiting after release clears
  its wake. Pause/reduced motion and resource stability pass.
- A legal west-pond placement (-101,215), observed from (-100,193), bends actual
  reed pixels: 28,613 changed channel samples when only the reed contact field
  is disabled; exact restoration when re-enabled. Both images were inspected.
- Actual views captured at 2560x1600, 1280x720, 844x390 and 390x844. High-res
  bend/control/pass images, compact contact and pond-edge pair inspected.
- Final software contact session 5708 passes the same six groups without
  browser errors: 9,517 changed understory channel samples and 6,560 reed
  samples, with exact restoration. Ordinary software contact and shore images
  were inspected. Resource counts remain stable within each renderer's run.
- Report serialization initially reused `passed` for the captured post-pass
  state, overwriting its boolean success field. The verifier and both completed
  reports now name that snapshot `passState`; the successful terminal assertions
  and their evidence were unchanged.
- Water regression 93749 passes four groups, including floodlight reflection
  power, repeated/pause/comfort behavior, reed shadow-depth compilation and
  stable GPU resources.
- Understory regression 4908 passes: exact full-versus-culled scene-target pixels
  at five views, movement/pause/four sizes, turn/re-entry resource stability and
  real world teardown/rebuild with six fresh batches and 1,610 instances.
- Installed presented client 8804 completed two ordinary arrival movement
  bursts. Latest screenshot/state inspected: first_hole, Joe patrolling, clear
  Audit Bell objective, no browser-error artifacts. Readiness remains 56/57;
  gameplay_frame_budget is still the failing check. Final syntax checks pass.

All owned verification/profiling sessions finished. The existing local server
and unrelated chapter work are preserved.

## Performance limits

Short software ABBA shader-on/off render-fence probe 20763 finished without
errors at 640x360. Timing drifted substantially: shader-off opening/shore medians
went from 62/65 ms in the first block to 74.4/90.2 ms in the last. Shader-on
blocks were 62/68.9 and 69.9/82 ms. This does not isolate a reliable overhead or
establish frame-budget acceptance. The separate culling regression preserves
the culling benefit but is not evidence of a gain from this visual feature.

The full performance gate, broader natural-route sound/visual reception and
human fun/fear/device acceptance remain open. Artifacts are in
`output/course-vegetation-contact/`, `output/course-understory-culling/`, and
`output/water-hazard-craft/`.
