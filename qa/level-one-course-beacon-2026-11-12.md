# Level 1 mower beacon — 2026-11-12

Implemented a physical caged red lamp on Joe's push mower and a rotating world
spotlight. This advances X4/X5/V7/P8; it does not complete the full visual or
horror scope. The separate Back Nine vehicle beacon is unchanged.

## Behavior

- Lamp mast attaches outside the mower deck, clear of Joe's handle grip. The
  reflector and beam rotate over 4.8 simulation seconds. Red light reaches the
  ground, mower and Joe in rendered captures.
- One 256-square shadow map uses a merged, simplified set of physical course
  blockers. The moving shed door uses its actual meshes. Software rendering
  enables this small shadow pass while leaving moon shadows disabled.
- Zero flashing or reduced motion produces a steady downward red light. Partial
  flashing strength reduces the physical sweep and intensity modulation.
- Lighting fades between 11 and 14 world meters from the camera; distant light
  and shadow work stops. The physical lamp remains visible.
- Unchanged steady scenes reuse their shadow. Door world transforms invalidate
  it even when the course clock is stopped; door posing precedes invalidation.
  Reentry refreshes the shadow. Pause does not advance the beam.
- Disposal removes the lamp, light, target and shadow proxies and frees owned
  geometry/materials/shadow map. Actual course rebuilding creates one replacement.

## Verification

`node tools/verify-course-beacon.cjs` passed eight groups with zero browser errors
(process 85898, exit 0). Artifacts: `output/course-beacon/final/`.

- Four beam phases, pause/repeated render, zero/partial flashing, reduced motion,
  nearby/far transitions, grip error below 0.005 m.
- Sixty nearby sweeps did not increase geometry, texture or shader counts.
- Stationary comfort shadow updates stayed at 1; a moving caster at frozen time
  advanced to 2; leaving/reentering advanced to 3. All eight owned geometry and
  material resources disposed exactly once. Actual scene rebuild detached the
  previous lamp and retained exactly one beacon/light/blocker set.
- `python tools/verify-course-beacon-pixels.py` passed. Matching 2560x1600 frames
  with only light intensity changed show 146,821 pixels with a red increase.
  A controlled visible wall with a matching shadow proxy blocks the red ground
  illumination: 697,004 pixels differ against the same wall with proxies disabled.
  This proves rendered light and shadow behavior, not every authored cover shape.
- Inspected 2560x1600, 1280x720, 844x390 and 390x844 screenshots. Lamp placement,
  grip and illumination are visible. Existing portrait letterboxing remains.
- ABBA fixed 640x360-buffer samples each submitted a world frame and awaited
  presentation. Off/on/on/off median elapsed values: 6.20/6.40/6.20/5.95 ms.
  This stationary local sample is not a sustained gameplay or hardware FPS claim.
- `node tools/verify-encounter-refinement.cjs` passed eight groups, including
  actual filing, distraction, escape/pause and both shed/drain victories
  (process 18062, exit 0).
- Installed gameplay client via `verify-presented-client.mjs --level-one` passed
  two arrival input iterations (process 19978, exit 0). Final page-1 and state-1
  inspected; first_hole, player x13/progress16, no error artifacts. Readiness still
  reports existing hidden_collision_owned_by_parent_art and gameplay_frame_budget.

## Remaining acceptance

Course blocker shapes are coarse approximations. Whole-route occlusion, beacon
anticipation around authored corners, illumination on visible player limbs and
human threat/readability acceptance remain open. Joe's apparent foot grounding,
mower silhouette/detail/animated mechanisms, player parity, portrait presentation
and broader performance require further work. Do not mark X4/X5 complete.

Earlier rejected occlusion camera placements hid the receiving ground, and a
cart fixture intersected physical geometry. Old hedge captures and the archived
failure artifact are diagnostic only; current cover-shadow/cover-unshadowed and
report/pixel-report files contain the accepted comparison.
