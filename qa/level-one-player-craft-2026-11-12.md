# Level 1 first-person player craft — 2026-11-12

Advances X3/V9/P3/P8. Full player-model parity with Joe is not established by
this pass; body presence, broader animation/art direction and human visual
acceptance remain open.

## Changes

- `course-player-craft.js` supplies shared textured skin and woven teal shirt
  materials for the phone hand and two-handed club grip. Palms, individual
  finger joints, thumbs, nails, cuffs, cuff buttons and seams replace the old
  block/ellipsoid hands. The palette follows the existing runner's work shirt.
- Club has a tapered shaft, wrapped grip and grooved iron face. Phone screen
  content stays clear. Forearms extend below the camera and meet the cuffs as
  the club turns; they no longer end visibly in midair.
- Fixed poses are batched by material, including corrected outward winding
  for the mirrored left hand. Two small pixel textures are shared across props.
- Existing aim/charge/swing state owns the pose. Follow-through lowers the club
  over the end of the 0.4-second stroke and then hides it, instead of leaving it
  raised throughout the ball's flight. Reduced motion limits swing rotation.
- Scene disposal releases owned roots, geometry, materials and textures.
  Gameplay aim, trajectory, inventory, hearing and collision are unchanged.

## Verification

`tools/verify-course-player-craft.cjs`, final process 70703, exit 0, three groups,
zero browser errors. Actual Space aim/release, Escape aim cancellation, pause
during swing, completed follow-through, reduced motion, actual aiming at four
viewports and scene rebuild pass. The fixture supplies eight balls for repeated
pose checks and waits for both flight and rolling to finish between shots.

Inspected actual aim/swing at 2560x1600, 1280x720, 844x390 and 390x844. Aim point
and instructions remain readable. Existing portrait letterboxing and dense
portrait flight messages remain broader presentation work.

Forty repeated post-shot presentations keep 935 geometries, 106 textures and 70
programs. This is allocation evidence, not active-swing frame-time performance.
Actual scene rebuild detaches the former club and creates one replacement.

`tools/verify-course-arrival.cjs` process 67555 exited 0, including actual
opening/phone, suppression during aiming/danger, pause and prepared resource
reuse. Its 2560 phone screenshot was inspected; notification text is unobstructed.

`tools/verify-ball-hearing.cjs` process 56377 exited 0: six groups including
real throw/impact/investigation, pause, sight handoff, practice, and a real
throw–walk–Use quiet Release Review. This ran after forearm correction; final
later change only lowers the club during the tail of its follow-through.

Installed gameplay client final process 10106 exited 0 with two actual input
iterations. Final page-1/state-1 inspected: first_hole x13/progress16, no error
artifacts. Existing hidden_collision_owned_by_parent_art and gameplay_frame_budget
readiness failures remain. Earlier installed runs 59505/92383 also exited 0.

## Rejected iterations and limits

First grip direction was awkward; rotating the hands exposed abruptly cut sleeve
ends. Camera-anchored forearms fixed the visible disconnection. Initial test
incorrectly expected Escape while aiming to pause rather than cancel. Subsequent
small-screen fixtures attempted another shot while the ball was still rolling;
the final fixture explicitly waits for rest and asserts actual aim at each size.
Only the final report and captures in `output/course-player-craft/` support the
responsive-aim claim. Earlier 1574/47643/15919 test failures were fixture failures.

The new hands remain stylized fixed grips, not a complete articulated player
body. Further anatomy, cloth folds, interaction reach, close-wall clipping,
camera/FOV extremes, player illumination and sustained performance still need
acceptance. Do not mark X3 complete from this pass.
