# Under the Green: grip and strike contract

Joe now holds the trimmer with a two-bone arm solve. The tool pivots at the handles, and both wrists follow the handle grips during carry, preparation, sweep and recovery. His chest turns with the weapon while the head counter-turns to retain the forward gaze. The original Joe model, face and pixel materials remain in use.

`web/under-green-trimmer.js` defines the shared weapon dimensions, pose transitions, blade endpoints and body-contact test. `under-green-actor.js` constructs and poses the actual blade from those dimensions; the simulation uses its capsule instead of an unrelated forward rectangle. Standing and crouching body clearance are included. Wind-up and recovery are non-damaging, and an ordinary strafe can escape the committed sweep. Existing solid-cover line-of-sight rejection remains active.

Walking still uses applied distance. The actor blends toward the existing planted idle when stopped, reverses the gait during water backsteps, and adds restrained foot contact shadows. This is an initial locomotion improvement: heading/path alignment and all corner/turn clearance remain open.

The animation mixer caches unchanged values. Applying procedural chest/head rotations without first restoring the last animation pose caused those rotations to accumulate on duplicate renders. The actor now restores the base pose before evaluating animation and applying IK. Ninety duplicate renders produce identical reported head, hand, foot and blade state.

Verification:

- `tools/verify-under-green-trimmer.mjs`: blade/body capsule contacts across four headings and 28 sweep ages; safe outside clearance; no damage during wind-up/recovery; continuous phase endpoints; real strafe dodge and stationary defeat.
- `tools/verify-under-green-trimmer.cjs`: 72 rendered poses covering four headings and walking, search, preparation, sweep and recovery. Maximum measured wrist-to-grip error was approximately 0.00000014 m; maximum rendered/authoritative blade-endpoint difference was approximately 0.000000000000007 m. These are consistency measurements, not claims of perceptual quality.
- Browser captures at 2560×1600 and 390×844. Wind-up and end-sweep screenshots were visually inspected after correcting the accumulated-rotation defect. Required standard web-game client ran two bursts; its screenshot and state were inspected.
- Existing simulation, encounter-design, 24 first-crossing comparisons, folded-course completion and gate/save rules pass with the new contact geometry.

Evidence: `output/under-green/trimmer/pose-samples.json`, `browser.json`, `rules.json`, pose screenshots and `standard-client/`.

Still required: full weapon/actor clearance against walls, cover and moving gates; natural planted turns; interruption-pose transitions; strike comfort and readability with unfamiliar players. A matching hit capsule does not certify that every rendered corner pose is free of clipping. Audio has not received a perceptual listening review.
