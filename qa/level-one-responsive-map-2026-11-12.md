# Level 1 responsive course map

The direct-rendered Level 1 map now keeps the portrait camera and uses a readable,
scrollable panel. The existing map painter still owns terrain, player position,
objectives, known Joe signals, evidence and route markings. Its cached background
is reused; the player arrow remains current. No new knowledge about Joe is granted.

## Changes

- A larger map shares a scroll area with the existing exit-plan buttons and course
  tool list. These are the original live consumers, reparented into slots rather
  than recreated with separate state. Legacy/copy rendering keeps its layout.
- Close and Pause remain visible above scrolling content, alongside current route,
  access status, threat and caption information. The UI states that time continues.
- Keyboard: H (or rebound map key) closes, Escape pauses, 1/2 selects shed/drain,
  arrows/Page Up/Page Down/Home/End scroll. Native Tab and button activation work.
- Controller: vertical stick/D-pad scrolls, LB/left selects shed, RB/right selects
  drain, Y/B closes and Menu pauses. Scroll speed uses simulation delta. Existing
  connection-neutral gating remains in force.
- Map input cannot move the player or start a chip. Opening cancels an active
  aim and stale touch/keyboard inputs, and releases mouse pointer lock. The world
  continues; pausing explicitly freezes it. Closing restores ordinary gameplay.
- Map rendering temporarily borrows a destination context and restores the exact
  previous context even when the cached map redraws. The main HUD texture is not
  uploaded for this DOM path. No overall performance improvement is claimed.
- Cache tag: `20261112-course-map`, including the reparenting UI script.

## Verification

`tools/verify-course-map.cjs` exercises real keyboard and touch input plus an
injected controller, with a safe authored-course fixture. Final hardware process
4599 and final software process 21573 both exit 0, four check groups each,
no console/page errors. Coverage:

- 2560x1600, 1280x720, 844x390, 390x844, 320x568. Panel inside viewport, no
  horizontal scroll overflow, minimum 44px Close, full portrait camera height.
- Time advances while browsing, touch selects the real preferred exit, and map
  scrolling does not displace the player. Tool descriptions remain visible in
  compact landscape instead of inheriting the old collapsed descriptions.
- Pause freezes time; resume restores map. Touch Close/Map and keyboard H work.
- Maximum text scale at 320px; keyboard scrolling/route selection; held movement
  and chip input in the map scroller cannot move or shoot. Controller scrolling,
  both route choices and B close behave correctly.

Two earlier test failures were diagnosed rather than ignored: Space activated
the focused Close button through native browser behavior (the non-shooting check
now focuses the scroller); a controller connected with an already-held stick was
correctly blocked by neutral gating (the test now connects neutral first).

`verify-course-portrait.cjs --software`, process 91136, exits 0 with eight groups,
including actual multitouch, Focus movement, map round trip, rotation and drain
victory. `verify-on-foot-focus.cjs`, process 42969, exits 0 with five groups,
including keyboard remapping, sprint precedence, injected controller, touch,
pause/blur and Under the Green regression.

Installed client wrapper, normal arrival fixture, two iterations, process 57725:
exit 0, final screenshot/state inspected, no error artifacts. Readiness remains
56/57, only `gameplay_frame_budget` fails. Software completed-scene p95 was
114.5ms with concurrent tests; this is not a controlled performance comparison.

Screenshots inspected: desktop 2560, compact landscape/portrait geometry, 320px
tool list and maximum-scale map, plus the installed-client normal opening.
Artifacts are under `output/course-map` and `output/course-portrait/software`.

## Remaining scope

This advances P1/P2/P8; full Level 1 acceptance remains open. Pause/results and
older canvas menus need responsive layouts. Physical controller/touch and human
route comprehension remain unverified. Whole-level horror pacing, composition,
player model parity and stable frame times remain in the authoritative plan.
