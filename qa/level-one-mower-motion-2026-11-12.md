# Level 1 mower acceleration, braking and turning

Advances X4/J5/S7. Full Level 1 implementation and experience acceptance remain
open. This changes real course movement, not just the rendered mower pose.

## Change

`course-mower-motion.js` limits acceleration to 64 and ordinary braking to 112
course metric units per second squared. Movement direction turns at a bounded
rate, easing from 2.9 radians/second at rest to 1.35 at cruise speed. Sharp
corners reduce desired speed; reversal sheds speed before Joe pivots and moves
in the new direction. Remaining distance limits approach speed and travel.
The integration uses actual course coordinates (x scaled by .72).

Normal terrain, course pressure, difficulty and overtime still determine the
requested top speed. Wet turf and sand feed their lower targets into braking.
The existing navigation route and swept collision query continue to own the
path. Collision, warning/reaction and recovery stops remain immediate, as do
AI holds; this is not a full inertial vehicle or planted-foot pivot system.
Existing correction out of an overlapping collider remains a separate safety
path. Inspection orientation is still separate from travel steering.

Actual travel continues to drive the gait, wheels, clippings and beacon
position. Physical speed is owned by movement commands and reset when AI
issues no movement command. An initial implementation reset it in the effects
update; that was corrected so duplicate effects updates cannot change physics.
`render_game_to_text().hole.joe.motion` exposes speed, heading, measured travel
speed and limits for inspection. No new geometry, material or audio voice.

## Evidence

- `verify-course-mower-motion.mjs`: analytic straight acceleration and stopping
  distance match at 30/60/144 Hz; reversal brakes, turns within its bound and
  travels in the opposite direction; zero elapsed time preserves movement.
  Curved trajectories are timestep approximations, not bit-identical paths.
- `verify-course-mower-motion.cjs`: final process 55934 exit 0, five groups,
  no browser errors. Actual course positions/speeds/headings demonstrate the
  start, cruise, brake, pivot and reverse sequence. Pause preserves motion and
  the rendered hand remains on its handle. Duplicate effects updates preserve
  speed and position.
- Seventy-one valid opposing obstacle approaches across the course reach their
  targets with swept clearance (1.9 metric units tested); longest is 282
  simulation steps at 60 Hz. Cases cover eligible clear endpoints, not every
  possible starting pose or complete player route.
- Real wet and sand regions reach their expected lower requested speeds:
  wet 22.2394 and sand 25.6644 metric units/second in the controlled fixtures.
  Those values include existing local pressure and are not universal caps.
- `verify-gameplay-intelligence.cjs`: 66556 exit 0, nine groups, including 29
  obstacle approaches, evidence-based pursuit, search expiry, director travel,
  exit-plan controls and original/distant actor transitions.
- `verify-predator-evidence.cjs`: 31562 exit 0, twelve groups, no errors;
  hidden relocation cannot change committed tactics, confirmed contact restores
  pursuit, real crouched movement escapes, and distraction handoff remains.
- `verify-course-close-push.cjs`: final 49460 exit 0, eight groups, no errors.
  Real sidestep survives, standing still captures, appeal interrupts, blocked
  pushes recover, copied targets ignore hidden movement, pose/grip and audio
  phase checks pass. This final pass follows the effects ownership correction.
- High-resolution 2560x1600 cruise/pivot and 1280x720, 844x390, 390x844 moving
  views inspected. Joe and mower are visible at desktop/landscape sizes;
  portrait retains the existing small letterboxed stage, with HUD partly
  covering Joe's head in this fixture. Portrait presentation remains unfinished.

Artifacts: `output/course-mower-motion/`, `output/gameplay-intelligence/`,
`output/predator-evidence/final/`, `output/course-close-push/`.
No human listening/fun/fear acceptance, full-run difficulty assessment, full
vehicle/footplant grounding or performance completion is claimed.


Final regression and installed-client results: encounter process39630 exited0,
eight groups including both ordinary shed/drain victories; no errors. Installed
client45889 exited0/two input iterations; latest page/state inspected, first_hole,
no error artifacts. Readiness remains56/57 with gameplay_frame_budget failing;
completed software-scene p95=87.1ms in this run. The timing is not an isolated
performance comparison. Final cache tag20261112-mower-motion. Syntax checks pass.
