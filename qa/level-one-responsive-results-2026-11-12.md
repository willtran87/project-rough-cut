# Level 1 responsive results

Direct-rendered victory and defeat now use a responsive review panel with a
scrollable body and fixed result actions. Portrait fills the viewport. The
existing route/capture artwork is drawn into the panel's 16:9 artwork canvas,
preserving its framing instead of stretching it into portrait.

## Preserved information and behavior

- Defeat retains the incident cause, recorded evidence, counterplay, repeated
  incident count, clean-break outcome, Joe's expression and dialogue, checkpoint
  count and unranked Continue status. On phones, evidence precedes optional
  dialogue. Turning subtitles off hides dialogue while retaining tactical advice.
- Victory retains grade, score, route/order, matching record, time/echo, exposure,
  pursuit, close calls, resources, score events, earned stamps/discoveries,
  milestones and next-run guidance. The old painter and new panel share extracted
  score-note/statistic/milestone functions; scoring rules were not changed.
  The new scroller can show every score event instead of the old six-event cap.
- All three actions still use `resultActionPresentations` and the existing action
  dispatcher. Shed and drain launch their actual chapters. Continue restores the
  saved safe point, Restart resets the run, Next Order starts another order, and
  Clubhouse returns to the menu.
- Keyboard Page Up/Down/Home/End and the controller right stick scroll the review.
  Existing left/right selection and confirmation remain. Controller Y opens the
  journal; B closes that dialog. The original journal button is reparented and
  restored, with availability extended to compact results.
- A regression exposed stale DOM focus when arrow and Enter arrived before a
  frame. Result and Pause confirmation now use the authoritative selection in
  the existing keyboard dispatcher; its preventDefault prevents a second native
  activation. Touch/click and Tab focus still target their own buttons.
- Reduced motion holds the capture tableau still. Victory artwork/motes use a
  fixed time under reduced motion. Capture flash and red sweep honor the flashes
  preference. Legacy/copy result layouts remain available.
- Cache tag: `20261112-course-results`.

## Verification

`tools/verify-course-results.cjs` tests actual bell interaction, automatic safe
point, physical capture, Continue, real exit filing from ready-exit fixtures and
actual chapter navigation. Final hardware 21027 and software 96548 exit 0 with six
groups and no errors. Final hardware additionally checks victory-art pixel
equality under reduced motion; software preceded this test-only extension.

Coverage includes 2560x1600, 1280x720, 844x390, 390x844 and 320x568; maximum text
scale; no horizontal overflow; all fixed action buttons on-screen and at least
44x44; recorded cause/counterplay; resource/check restoration; reduced-motion
capture pixel equality; hidden dialogue preserving evidence; controller scrolling,
selection and journal; unranked drain victory preserving career records; ranked
shed score; both real chapter URLs; Next Order, Restart and Clubhouse.

`verify-course-checkpoint.cjs`, process 21371, exits 0 after the rapid-confirmation
fix. The earlier 64986 failure was a real UI bug: ArrowLeft then Enter activated
the old Continue focus rather than the newly selected Restart. The final same
sequence proves fresh reset. Other checks retain multi-checkpoint restoration,
safe-save guards, unranked career protection, receipts and both exit unlocks.
Only its old expectation that the journal was hidden on small screens changed;
it now verifies the visible journal is inside the new result panel.

`verify-course-pause.cjs`, process 1614, exits 0, including a new arrow/Enter
sequence without an intervening frame, plus existing settings/dialog/controller,
freeze/resume/map/restart/menu checks.

Visual review includes high-resolution capture, maximum-text portrait capture
with evidence before dialogue, compact landscape shed victory, and both route
artworks. Artifacts: `output/course-results/{hardware,software,standard-client}`
and `output/course-checkpoint`.

Installed client wrapper, normal arrival fixture, two iterations, process 80853:
exit 0; final page/state inspected, no error artifacts. Readiness remains 56/57,
only `gameplay_frame_budget` fails. Software completed-scene p95 was 140ms while
other browser tests ran; this is not a controlled performance comparison.

## Remaining scope

This advances P2/P4/P5/P7/P8. It does not complete the full Level 1 plan. Legacy
settings, clocked-out and main menu responsiveness, physical devices, human comprehension,
whole-course horror/fun/pacing, player model parity and frame-time stability
remain open. Ready-exit fixtures prove filing and handoff, not a whole walked
route. No commit or deployment.
