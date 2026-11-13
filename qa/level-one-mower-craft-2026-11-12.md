# Level 1 mower detail and contact shading — 2026-11-12

This pass advances X4/V6/V7/V8. It does not establish that the entire mower or
character art direction, grounding, or horror acceptance is complete.

`web/course-mower-craft.js` adds a riveted uneven front guard, patch plates, deck
wear, a soot-dark exhaust/heat shield, an exposed turning pulley behind bars and
a loose discharge flap. Details share the existing Joe actor transform and
receive world illumination. The GLB and its grip, gait, wheels and gameplay
collision are unchanged. The front guard follows the apron with a small visual
protrusion; no new damage zone is introduced.

Pulley motion follows simulation time. Flap rattle follows actual traveled
distance and speed, rather than viewer position. Pause/repeated presentation
preserve both; reduced motion freezes these cosmetic movements. Static parts
are merged into one mesh. Added geometry totals 546 triangles including the
three contact planes; there are seven additional mesh submissions when visible.

Soft horizontal contact shading sits beneath the mower and each shoe. Foot
shading follows the existing skeletal foot position and fades with lift. This
is supplemental ambient contact, not a replacement for actual terrain fitting
or directional shadows. The original soles are already near y=0; the software
renderer has no moon shadow. The added contact is subtle, especially beneath
the deck and bright beacon.

## Evidence

- `node tools/verify-course-mower-craft.cjs`: final process 56800 exit 0, five
  groups, no browser errors. Earlier runs 21271/97246 also exited 0.
- 24 real skinned animation phases retain hand error below 0.005 m. Foot-contact
  strength changes with lift; travel produces nonzero flap motion. Pause,
  duplicate render and reduced motion checks pass.
- Sixty engine animation samples retain 925 geometries, 104 textures and 70
  programs. This checks allocation stability, not GPU frame-time performance.
- Actual course rebuild removes the previous craft and creates one replacement.
- Inspected front, quarter and stride images at 2560x1600, plus 1280x720,
  844x390 and 390x844. Original guard placement was hidden behind the deck;
  final placement is visible. Existing portrait letterboxing remains.
- Contact-only on/off comparison, same pose and rendering: changes within
  (816,1032)–(1439,1343), 348 pixels darkened by more than 3 luminance levels.
  `output/course-mower-craft/contact-pixels.json` records this narrow evidence.
  Earlier temporary zero-uniform fixture incorrectly suppressed the mower
  contact; removed and reran the final comparison.
- Installed gameplay client: 13251 and final 85426 exited 0, two input
  iterations. Final page-1/state-1 inspected, first_hole x13/progress16, no error
  artifacts. Existing hidden_collision_owned_by_parent_art and
  gameplay_frame_budget readiness failures remain.
- Encounter refinement 97207 exited 0: eight groups including actual filing,
  distraction, escape/pause, grip and both shed/drain victory routes.

Artifacts: `output/course-mower-craft/`. No human terror/fun acceptance,
sustained hardware performance or full terrain/LOD acceptance is claimed.
Further mower art direction, player parity, expressive movement and zone
composition remain part of the full Level 1 goal.
