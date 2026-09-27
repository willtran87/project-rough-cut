# Horizontal free look prototype

Implemented on `codex/horizontal-free-look`, based on published main `612bd49`.
This is a local playable prototype; it has not been merged or published.

## Controls and behavior

- WASD moves relative to the camera. W/S moves forward/backward and A/D strafes.
- Click the game to capture the mouse for horizontal look. Dragging also works
  when capture is unavailable. Escape releases capture and pauses; menus retain
  a normal cursor. The vertical camera remains fixed.
- The controller right stick turns; the left stick/D-pad moves. Disconnect clears
  rotation. Touch supports simultaneous left-pad movement and a swipe beginning
  in open screen space, without stealing the existing action buttons.
- R/R3/Rear remains a temporary rear glance. It preserves the movement heading
  and returns to the chosen view when released.
- Shots aim relative to the camera, including a turn immediately before release.
  Map facing, objective bearings, hazard clearance, directional captions, listening
  indicators, and mower stereo position use the appropriate view direction.
- Exit access and deliberate filing cancellation remain intact.

## Presentation

Retains the current pixel artwork, fixed horizon, lighting, foreground framing,
and projected sprite presentation. Course ground lines project from world space;
the existing rear boundary appears when facing south. Scenery fade opacity now
respects its parent layer, and the moon is confined to the forward hemisphere.
This does not add three-dimensional models or new side/back sprite paintings.

Small turns respect the existing scenery refresh interval. The player's map arrow
renders live over cached map terrain; resets and large turns invalidate the caches.
Parallax source crops reuse bounded-resolution atlas buffers (maximum 2048 pixels).
The compact/desktop control hints describe the new look controls. The desktop HUD
also clears the secondary guidance/echo panel after correcting an overlap.

## Validation

- `node tools/verify-free-look.cjs`: seven functional groups pass, no browser errors.
  Includes 16 cardinal-heading WASD cases, centered shot projection at all four
  headings, immediate-turn shot release, camera-relative clearance, rear glance,
  real browser mouse capture/pause, synthetic controller and touch input, and both
  exits through victory while facing backward with approach movement held.
- `node tools/verify-gameplay-polish.cjs`: all 12 existing regression groups pass,
  including ordinary Audit Bell traversal, review rewards, input ownership, pursuit
  settings, both exits, retry, and pause/resume.
- Official skill client opening gameplay replay: 57/57 runtime readiness checks
  pass, no error artifact; final screenshot inspected. This replay does not turn.
- Actual views inspected at 2560x1600, 1280x720, 800x600, and 844x390, including
  opening, station, shed, side/rear views, and touch controls.
- `node tools/verify-release.mjs` and `git diff --check` pass. The release verifier
  checks syntax/assets and parses fixtures; it does not execute all 89 fixtures.

Evidence is in ignored `output/free-look/`. Source interception exposes test-only
setup helpers; these are not shipped with the game. Staged setups do not establish
a natural full-round win. Controller/touch events are synthetic.

## Remaining acceptance work

Continuous-turn profiling reduced average render time from roughly 23 ms with
forced redraws to roughly 11 ms after cache changes, but the final headless sweep
still reports a 27.3 ms p95 and fails the 16.7 ms frame-budget check. The published
baseline also fails that gate in the same profiling harness. The ordinary final
opening replay reports 2.54 ms average and 4.3 ms p95. These different runs must not
be presented as a verified device frame rate or full performance acceptance.

Before treating this as a release replacement, playtest continuous turning on real
hardware, inspect the sprite appearance while circling objects, and compare Joe
encounters/navigation against the fixed-view version. Tune sensitivity and pursuit
balance from that evidence. Human enjoyment and physical device suitability remain
unverified; the functional prototype is ready for those comparisons.
