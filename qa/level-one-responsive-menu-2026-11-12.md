# Responsive Level 1 clubhouse — November 12, 2026

Main menu, rejected change requests and clock-out now have responsive native
controls. Original opening/dawn artwork remains behind the panel. Portrait fills
the stage; the central content scrolls while status and auxiliary actions remain
visible. All five main actions, first-run invitation, Night Order portfolio,
records, stamps, shot book, overtime and three chapter links are retained.

## Behavior

- Native buttons have 44px minimum targets, visible keyboard focus and text that
  follows the existing size preference. All menu content fits horizontally at
  320px with maximum text size. Long content scrolls vertically.
- Existing game functions still own starts, replay, settings, change rejection,
  clock-out, career unlocks, order rotation, overtime and compatible records.
  Locked order/overtime buttons are genuinely disabled; keyboard attempts still
  report their original lock reason without changing the selection.
- Begin respects the saved opening-story skip preference. Replay deliberately
  opens the story even when that preference is set, then enters the real round.
- Keyboard arrows render selection synchronously so rapid Arrow/Enter cannot
  confirm an old focused order or action. Enter/Space on native stamp/shot-book
  summaries expand/collapse their details without starting the selected action.
- Controller D-pad retains menu/order navigation; right stick scrolls, LB
  opens/closes portfolio details, RB toggles overtime, X/Y open existing comfort
  and journal dialogs. B closes those dialogs. Physical hardware acceptance is
  still pending; this verification injects the browser Gamepad API.
- Original comfort/journal buttons and chapter links are moved into the menu
  while needed and restored on leaving it. The same dialogs and URLs are used.
- Chapter visibility no longer serializes the entire debug report every 350ms
  on this page. The presenter controls visibility directly; legacy pages without
  it retain the original fallback. No overall frame-time improvement is claimed.

## Verification

Final `node tools/verify-course-menu.cjs` (32837) and `--software` (18788) both
exit 0 with ten groups and no page/console errors. Each covers:

- 2560x1600, 1280x720, 844x390, 390x844 and 320x568, maximum text size, bounded
  card/footer, scrollable content, no horizontal overflow and 44px controls.
- Actual CDP touch swipe, native taps, Home/End scrolling and no accidental
  activation from the gesture.
- Rejection reason/Dismiss/Escape, fast keyboard Settings entry and return,
  clock-out Return, and pixel-still menu artwork under reduced motion.
- Actual Begin/story/briefing, subsequent skip-enabled Begin, explicit Replay
  despite that preference, and return into the actual first-hole mode.
- Locked rotation versus unlocked selection, all three order cards, all twelve
  stamps, three shot-book entries, overtime and compatible record filtering.
  Career progression is fixture-driven; this is not a claim that those stamps
  were newly earned during a natural full run.
- Native keyboard details and injected controller navigation/scrolling/details/
  overtime/dialogs. The chapter test checks all three URLs and actually follows
  the Under the Green link.
- Instrumented debug serialization: zero calls during an 1100ms menu wait and
  still zero after actual round startup. The pre-fix fixture observed four calls
  in 1100ms (`output/course-menu/serializer-before.json`).

Existing settings regression 35910 passes all eight groups. Pause regression
69063 passes all six groups including frozen state, restart, settings, map return,
controller dialogs and return to the new menu. Syntax checks pass.

Installed presented client 62876 exits 0 after two arrival input bursts. Latest
page/state inspected: first_hole, Tee, movement released, four balls and zero
checks. No error artifacts. Readiness remains 56/57; `gameplay_frame_budget` still
fails. This pass is not a performance qualification.

Screenshots inspected: high-resolution fresh menu and portfolio, ordinary desktop
menu and arrival, compact fresh/rejection/clock-out, and controller-expanded
portfolio. Artifacts are in `output/course-menu/hardware/`, `software/`, and
`standard-client/`.

## Regressions caught

The native-details test failed before the keyboard fix: Enter on a stamp summary
started the round. The failure is retained in `details-before.json`. Both final
renderers pass the same assertion after the fix.

An older pause assertion expected the comfort button directly under game-shell.
The intended new parent is the menu footer. That intermediate failure is retained
in `pause-parent-before.json`; the revised check verifies one visible original
button, real dialog opening/closing, and unchanged menu mode.

Earlier menu checks also exposed stale order focus on rapid Arrow/Enter and
unnecessary debug-report polling; both are covered by the final suite. Earlier
failure artifacts remain historical; final report.json files record success.

## Remaining scope

This closes the menu responsiveness pass and verifies repeat-opening/replay
behavior. Full physical-device/accessibility acceptance, gameplay pacing,
character/environment art, complete-route fear/fun/listening tests and frame
budgets remain open in the full Level 1 ledger. No whole-overhaul completion claim.
