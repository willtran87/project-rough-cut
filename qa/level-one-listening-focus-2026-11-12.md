# Level 1 responsive Listening Focus

Listening Focus now uses the ordinary direct-rendered gameplay HUD and keeps the
portrait camera and touch controls. It no longer switches a portrait player back
to a short landscape view. Legacy/copy rendering retains its existing overlay.
This advances P2/P3/P8; the full Level 1 plan remains incomplete.

## Behavior

- A steady compass and written Joe bearing use the current view, including rear
  look. The old written bearing used world axes; it is corrected in both paths.
  Distances use physical metres, with no double conversion of the DOM readout.
- Search trend and trail/last-seen locus follow existing eligibility. Cadence
  progress, blocked guidance and a forecast's bearing, distance and remaining time
  reflect the existing simulation. Presentation does not change those rules.
- Cover, wet turf, sand, Change Requests, recoverable balls, tracks and mower-cut
  evidence retain their original eligibility. Nearby clues open automatically on
  entering Focus, so a pointer-locked/controller player need not click to reveal
  them. Mouse/touch users can collapse the list. Long lists scroll in the bounded
  message area; the Joe header remains sticky.
- Required action/danger prompts and captions remain. Optional coaching yields
  to Focus. Disabling descriptive/threat captions, motion or extra effects does
  not remove the tactical readout. Desktop text scales with viewport size.
- The normal action progress bar and touch SVG have specific selectors, keeping
  them independent from the new cadence progress and compass SVG.
- Cache tag: `20261112-course-listening`.

## Verification

- `node tools/verify-course-listening.mjs`: view-relative bearings at five
  headings, metre conversion, search/forecast/blocked progress, expiry and no
  input mutation all pass.
- `node tools/verify-course-listening.cjs`: final hardware process 34025 exits 0,
  four groups and no browser errors. Actual held Q, four headings, five viewport
  sizes, eligible search evidence, actual crouch/Listen in authored rough earning
  a forecast, pause freezing progress, forecast expiry and comfort preferences.
  Earlier software process 83430 exits 0 before the final text scaling/default
  clue expansion/forecast wording adjustments.
- `node tools/verify-course-portrait.cjs --software`: final process 19714 exits 0,
  eight groups, no errors. Includes actual simultaneous held Listen and movement,
  full-height camera, release, touch action regions, rotation cancellation,
  briefing, max-size ordinary messages, pause/map and ready-drain victory.
- `node tools/verify-on-foot-focus.cjs`: process 14245 exits 0. Remapped held
  Focus still takes precedence over sprint at 2.4m/s; Under the Green keyboard,
  injected controller, actual touch, cancellation/pause/blur regression passes.
  These are input tests, not physical-device acceptance.
- Installed client wrapper with `--level-one`, course-arrival-input.json,
  two iterations and 250ms pause: process 23824 exits 0. Inspected final page,
  state and errors. No error artifacts. Readiness remains 56/57; only
  `gameplay_frame_budget` fails. Completed-scene p95 was 85.4ms under software
  rendering with other test jobs running; this is not a controlled comparison.
- Inspected desktop 2560x1600, compact landscape 844x390, portrait 390x844,
  expanded search at 320x568, cadence reading and final software touch Focus.
  Final default-expanded clues stay above the 390px touch controls. Initial
  desktop inspection prompted larger responsive text.

Artifacts: `output/course-listening/{hardware,software,standard-client}` and
`output/course-portrait/software`. Older reports/screenshots may precede the
specific final adjustments described above. No overall FPS or human fear/fun
acceptance claim is made.

## Remaining

Maps, pause/results and older canvas menus still need responsive treatment.
Long-list controller navigation, maximum-scale Focus with every possible clue,
whole portrait routes and physical devices need broader acceptance. Whole-level
pacing, visual composition, player model parity and stable frame time remain in
the authoritative plan. No deployment or commit was performed.
