# Level 1 responsive pause screen

Direct-rendered Level 1 now pauses into a responsive DOM panel over the frozen
world. Portrait keeps the gameplay camera aspect and full height. The existing
four pause actions still call the same resume/settings/retry/menu transitions.
Legacy/copy rendering retains its original pause screen.

## Presentation and input

- Current assignment, next action, checks, balls, exit access and Joe's state,
  distance and sightline remain available. Removed the misleading distance-along-
  course percentage from this new panel; completed checks are explicit.
- Desktop uses assignment/actions columns. Portrait places actions first so Resume
  is immediately reachable; the assignment follows in the same scroll area.
  The header and comfort/journal actions remain fixed. Text follows user scale.
- Keyboard and controller selection use the existing pause index. Native buttons
  activate through Enter/Space, click or touch without duplicate global handling.
  Selection and viewport/text-scale changes keep the selected action in view.
- Controls & comfort and Field journal are the original buttons, temporarily
  reparented into the panel and restored on leaving pause. Journal availability is
  refreshed immediately so first-frame presentation does not await its old timer.
- Open DOM dialogs keep focus; the pause renderer does not take it back. Existing
  X/Y dialog shortcuts and their controller navigation remain available.
- Rendering the frozen 3D world omits its gameplay HUD before showing the DOM
  pause panel. Telemetry identifies this layout and its uniform veil. Cache tag:
  `20261112-course-pause`.

## Verification

`tools/verify-course-pause.cjs` uses actual keyboard/touch input and an injected
controller. Final hardware process 98118 and software process 95897 exit 0 with five
check groups and no page/console errors. Checks include:

- A paused simulation snapshot remains identical after 1.5 seconds of stepping.
- 2560x1600, 1280x720, 844x390, 390x844 and 320x568 fit without horizontal
  overflow. Portrait retains over 90% viewport height. Fixed optional action
  targets remain at least 44px tall and on-screen.
- Maximum text scale at 320px; arrow selection and native Enter open the real
  settings screen. Settings, comfort and journal return without advancing time.
- Touch Resume preserves exact elapsed time and player position. Pausing from
  the map and resuming restores the open map.
- Controller Menu, D-pad and A select/resume through the existing actions. Final
  hardware additionally verifies X/Y opening comfort/journal and B closing each;
  software preceded this test-only coverage extension.
- Restart resets elapsed time and checks. Return reaches the main menu and
  restores the optional launch buttons to their original parent.

The first run failed an exact-time assertion because the test called
`advanceTime(0)` after resuming; that helper deliberately advances one frame.
The corrected assertion reads immediately after the actual Resume click. No
simulation timing rule was changed to accommodate the test.

`verify-course-map.cjs --software`, process 39461, exits 0 with all four groups,
including map pause/resume, both route selections, touch and controller input.
Installed client wrapper, normal arrival fixture, two iterations, process 6292:
exit 0. Final page/state inspected, no error artifacts. Readiness is still 56/57,
only `gameplay_frame_budget` fails; software completed-scene p95 was 94ms during
concurrent tests. This is not a performance comparison or an FPS claim.

Inspected high-resolution desktop, compact landscape, maximum-size portrait text,
and normal installed-client gameplay screenshots. Artifacts:
`output/course-pause/{hardware,software,standard-client}`.

## Remaining

This advances P2/P8 without completing the full Level 1 plan. Results and the
legacy settings/main menu still need responsive treatment. Physical devices,
whole-route accessibility, human comprehension/fear/fun, dramatic pacing, player
model parity and stable frame times remain open. No commit or deployment.
