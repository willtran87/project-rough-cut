# Level 1 golf motion — November 12, 2026

Advances X7/S2/V6. The full Level 1 overhaul and overall golf-feedback acceptance
remain open.

## Change

The 3D rollout previously rendered every ball at a fixed .055m height despite
the terrain planner already providing bounce coefficients. The new pure motion
helper applies two diminishing hops using those surface coefficients and shot
power. Sand/soaked ground absorb more of the bounce; an initial bank reduces it.
Stationary shots do not hop. The existing horizontal easing, rollout duration,
collision decisions, impact response and final recovery position are preserved.

A ground shadow follows the projected position and softens as the ball rises.
A short 65ms trajectory segment helps track the airborne ball. It disappears
at impact and is disabled under reduced motion; informative physical ball
movement remains. Ball/shadow/trail all disappear at rest, leaving the existing
recoverable ball. Three reusable meshes use no new textures and are disposed by
the existing scene lifecycle. The addition costs two draws during flight and
one during rollout; no overall performance improvement is claimed.

## Verification

- `node tools/test-course-ball-motion.mjs`: 108,108 samples over six surface
  bounce coefficients, three powers, three durations and bank/no-bank cases.
  Checks original planar path/endpoints, bounded lift, diminishing hops,
  continuous ground contact and stationary shots.
- `node tools/verify-course-ball-motion.cjs` hardware 89546: five groups, zero
  browser errors. Software 78233: same runtime/five groups/zero errors, before
  the last test-only bunker camera change. Earlier runtime passes 26084/12448
  also verify both renderers; 85178/40073 and 51997 cover intermediate bunker
  fixtures. All handles terminal.
- Actual Space hold/release spends one ball, displays the trajectory and shadow,
  then bounces and rests at the original recoverable target. Repeated rendering
  leaves the pose unchanged. Pause freezes position, visual state and distraction
  timer. Reduced motion hides the trail but preserves the ball's physical pose.
- Actual shots captured at 2560x1600, 1280x720, 844x390 and 390x844. Fairway
  flight/bounce and compact software flight were inspected. Numeric bunker
  checks use an actual Space shot and the authored terrain classifier; the final
  hardware fixture has no initial bank and stays outside a collision blocker.
- Repeated shots preserve 941 geometries/106 textures/74 programs on hardware,
  and 1287/107/83 on software in these fixtures. Actual rebuild observes all six
  geometry/material disposal events and one working replacement set. This is
  resource stability, not sustained frame-time qualification.
- `node tools/verify-ball-hearing.cjs` 48931 passes all six existing groups:
  near/far impact reception, pause, no renewed lure timer, direct-sight/chase/
  appeal priority, actual practice bell and throw/walk/quiet Release Review.
- Installed presented client 81390 passes two ordinary Space-shot iterations
  using `tools/fixtures/course-golf-input.json`. Latest screenshot/state inspected:
  first_hole, two shots used, two balls remaining, two recoverable balls, no
  active flight/roll, Joe investigating. No error artifacts. Readiness remains
  56/57 with only `gameplay_frame_budget` failing.
- JavaScript syntax checks pass. Artifacts: `output/course-ball-motion/`.

## Findings and remaining work

The initial rebuild test incorrectly required the retired ball's parent to be
null. The existing scene disposer retires the entire world and disposes its
resources; it does not individually remove every mesh from that retired world.
The corrected test checks actual disposal events, replacement identity and one
active ball. Initial failure 32070 is retained as `rebuild-parent-before.json`.

Three bunker views exposed foreground scenery obscuring valid shot positions.
The original approach also hit the bunker lip; later approaches reached sand
without an initial bank, but their screenshots still did not clearly show the
ball. These screenshots prove a remaining composition/visibility problem, not
successful bunker visual acceptance. Fairway screenshots do show the new motion.
Keep V2/V5/X1/X7 open and inspect the relationship between those decorative
meshes and navigable camera/shot positions in the next course-readability pass.

Follow-up: `qa/level-one-cover-flight-2026-11-12.md` separates legitimate cover
from the pine-card obstruction, corrects airborne cover contacts and verifies a
visible side approach to the bunker. The earlier screenshots remain evidence
of the original issue; they are not retroactively accepted as clear views.

The helper covers wet/mowed/rough coefficients numerically; these are not all
natural-route audiovisual playtests. Power/aim comprehension, all terrain views,
full golf polish, human satisfaction/listening and physical-device acceptance
remain open. Existing course trails and reactive reeds were found during X8
inspection; their full disturbance/contact/readability acceptance is still open.
