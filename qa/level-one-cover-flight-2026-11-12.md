# Level 1 cover contacts, canopy clearance and shot power

This advances X1/X7 and course readability. The full Level 1 goal remains active.

## Defects and changes

- Golf previously checked the requested landing position, allowing a low arc to
  pass through intervening hedge or stone cover. Opaque cover profiles are now
  shared by the rendered core and an airborne sweep. Low shots contact that
  core; sufficient height clears it. Aim preview, flight, contact effects and
  eventual recovery use the same plan.
- Cover hits rebound outward, fall to free ground and then use the existing
  rollout. The drop starts at the actual contact height without a ground snap.
  Foliage gets a muffled response; solid banks retain their distinct response.
  Pause freezes both motion and distraction time. Ground noise checks wait for
  the falling ball to reach ground level.
- Several earlier bunker pictures looked through legitimate hedge/sign/stone
  cover. Those blockers were retained. A separate rendered ray exposed a pine
  needle card only 0.137 m from the camera at a valid walking position. Hanging
  cards extending beyond an authored in-course pine's solid base now clear
  2.4 m. Their geometry/detail, upper crowns and off-course trees are retained.
- The DOM gameplay HUD lacked the shot-strength readout already present in the
  canvas fallback. A labeled live percentage and meter now accompany aiming;
  they disappear on release/cancel and share the responsive message region.

## Evidence

- `test-course-cover-flight.mjs`: low/high clearance, nearest contact, narrow
  cover, misses, contact continuity, drop/rest endpoints and 5,025 sampled
  rebound poses outside opaque cover.
- `test-course-canopy-clearance.mjs`: transformed hanging-card vertices clear
  eye level; interior foliage, upper crown, wood and vertex data stay unchanged;
  repeated preparation is idempotent.
- `test-course-ball-motion.mjs`: 108,108 ordinary-roll samples retain the
  original planar path, bounded surface lift and diminishing hops.
- Cover-flight browser checks use real Space holds/releases at the authored
  bunker lip: (-75,86), yaw pi, pitch -atan(1.65/.16/40). An 80 ms hold contacts
  the lip; an 850 ms hold clears it. They check pause mid-drop, recovery outside
  collision, hedge response, comfort settings and five viewport sizes.
- Final pre-meter hardware/software reports both passed five groups with no
  browser errors. All six authored pine reports have 2.4 m clearance, and the
  reproduced walking view has no visible needle hit within 1 m of the camera.
- Software ball-motion session 7041 finished successfully: five groups including
  repeated-shot resource stability, actual scene teardown/rebuild and a visible
  sand shot from (-45,76), yaw -pi/2, pitch -.52. Its bunker screenshot was
  inspected; the ball is visible over sand beside the retained stone cover.
- Final meter hardware session 50590 passed six groups, including exact live
  meter value, release/cancel lifecycle, unchanged inventory on cancellation,
  and 320x568 with maximum text size. High-resolution low/high preview, hedge
  contact, compact contact and 320px meter screenshots were inspected.
- Software session 21321 passed the same six groups without browser errors.
  Its 2560x1600 full-power and 1280x720 low-power views were inspected.
- Portrait session 1672 passed eight groups using actual CDP touches: charged
  Chip matches the meter, movement/look work together, Run/Rear/Listen/Crouch,
  pause/map, rotation release and the ready drain exit work. The 390x844 charged
  shot screenshot shows the meter above resources and controls without overlap.
- Installed presented client session 30433 completed two ordinary shot bursts
  on the final runtime. Latest page/state inspected: first_hole, two throws,
  two balls remaining, two recoverable balls and Joe investigating; no error
  artifacts. Readiness is 56/57, with gameplay_frame_budget still failing.
- Final JavaScript syntax checks passed for game, scene, props, HUD and browser
  verifiers. All owned test sessions finished; the existing server is retained.
- Artifacts: `output/course-cover-flight/` and `output/course-ball-motion/`.

## Limits and retained findings

This sweep covers opaque hedge/stone cores, not every cart, door, trunk,
architectural detail or decorative protrusion. It is a bounded sampled sweep
with contact refinement, not an analytic proof for every possible shot. The
canopy change fixes the reproduced authored-pine obstruction, not all possible
camera occlusion. Contact rings can still be partly occluded by decorative
stone detail; the physical core intentionally excludes those protrusions.

The first high-arc test used y=100 and actually descended onto the far roof.
Changing the paired test to y=86 creates a genuinely clearing arc. Old failure
artifacts remain; the newer reports identify the accepted tests. Meter test
failures before 50590 were caused by a non-UTF-8 middle dot in its expected
string, corrected to a Unicode escape without changing gameplay assertions.

Whole-course visual composition, natural-route novice understanding, every
terrain/prop interaction, physical devices, human fun/fear/listening acceptance
and sustained frame-time qualification remain open. No performance gain is
claimed from these changes.
