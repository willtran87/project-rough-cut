# Level 1 playable arrival

Part of the full Level 1 experience goal, which remains incomplete. Scope is
tracked in `design/level-one-experience-plan-2026-11-12.md`.

## Delivered

- The current 3D renderer now builds the south service boundary as iron gates,
  stone pillars, side fencing, lamps, a chain and a padlock. Previously its
  gameplay boundary and legacy art existed, but this geometry was absent from
  `scene-3d.js`. Gate geometry stays beyond the existing collision boundary.
- A one-time latch sound occurs 0.55 seconds into playable time. Sound originates
  behind the starting position at the gate; the chain settles visibly. Contact
  uses the existing boundary impact timer. No new collider, light or shadow map.
- A brief held phone shows the delivery marked DONE / CLOSED BY JOE and COURSE
  SECURED. It does not take input or turn the camera, yields to aiming, flight,
  interactions, map/focus and danger, and stows after 6.2 seconds. Caption text
  repeats the essential information for small displays when threat captions are
  enabled. Reduced Motion removes the lift and chain movement.
- Tutorial time does not consume the beat; pause freezes simulation; quick
  rematches, rehearsals and late fixtures skip it. The existing story replay
  remains available.

## Verification

- `node tools/verify-course-arrival.mjs`: passed latch-once, inactive clock, skip,
  finite bounded recoil, reduced motion/flashing and phone lifetime checks.
- `node tools/verify-course-arrival.cjs`: passed actual guide dismissal, pause,
  resume, one latch, phone display/stow, map/aim/danger priority, real keyboard
  movement into the south boundary, quick-rematch and rehearsal skips. Captured
  and inspected 2560x1600, 1280x720, 844x390 and 390x844.
- `node tools/verify-presented-client.mjs --level-one --url http://127.0.0.1:4187
  --actions-file tools/fixtures/course-arrival-input.json --iterations 2
  --pause-ms 250 --screenshot-dir output/course-arrival/standard-client`: passed;
  latest page image and text state inspected, no error artifacts. Mode first_hole,
  ready renderer, active arrival/phone, live movement and turning.
- `node tools/verify-encounter-refinement.cjs`: passed bell activation/orientation,
  quiet log cancellation/completion, loud log, valid/invalid release diversion,
  close escape/rearm/capture/pause, urgent HUD at four sizes, Joe poses, boundary
  movement, shed and drain filing/sealing victory. Corrected old fixture Enter
  to current default E; did not restore obsolete gameplay bindings.
- `node tools/verify-encounter-experience.cjs`: passed two timers, chase/lure
  protection, three objective traces/aftermaths, shelter relief, finale readiness,
  pause, ignored-timer recovery, close-call feedback and stereo mechanism cues.
  Disabled unrelated random apparitions in these isolated encounter fixtures:
  live ghosts correctly defer aftermaths, so the old timing assertion was not
  deterministic. Ghost coexistence still requires its separate verification.
- Both older encounter fixtures now skip the illustrated intro explicitly.
- `node tools/verify-release.mjs`: 90 scenario definitions, 67 referenced images,
  no missing/unreferenced images or warnings. This validates the release manifest
  and fixtures, not 90 completed human playthroughs.

## Cost and limitations

Gate: 199 instances in four batches. Phone: eight simple meshes and one 512x768
runtime text texture. Browser check confirms shaders/textures are prepared before
play and do not increase when the phone first appears (observed 65 programs, 98
textures for that complete scene). No new per-frame geometry or audio loop.
This is resource/lifecycle evidence, not a frame-rate improvement claim. Software
rendering still adapts resolution under load; hardware/device and sustained-route
performance acceptance remains open.

The later first-impression pass adds the spoken PA, first Joe staging and optional
impossible tee detail; see qa/level-one-first-impression-2026-11-12.md. Phone/hand
visual refinement, the larger zone pass and all other unchecked requirements
stay on the plan.
No human pacing, fear, fun, readability-on-physical-display or listening results
are claimed.

Artifacts: `output/course-arrival/`, `output/encounter-refinement/`, and
`output/encounter-followup-20261108/hardware/`.
