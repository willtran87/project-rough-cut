# Level 1 portrait gameplay

Ordinary direct-rendered Level 1 gameplay and its briefing now use the available
portrait height instead of a short 16:9 strip. The camera uses the actual viewport
aspect ratio; it is not a stretched landscape image. Simulation coordinates,
movement, interaction rules and the user's vertical FOV remain unchanged.

This advances P1/P2/P8. It does not complete all responsive or device acceptance:
maps, Listening Focus, pause/results and older canvas menus still use their
landscape layout. Returning to ordinary gameplay restores portrait. The narrower
horizontal view needs normal looking/turning, as expected with a portrait camera.

## Changes

- `course-viewport.js` provides render dimensions with the existing quality-tier
  pixel budget and portrait touch geometry. Landscape target sizes are unchanged.
  The render signature includes camera aspect so a resized frozen view is rebuilt.
- Touch geometry is authored in physical CSS pixels, converted into existing
  logical input coordinates. Elliptical logical radii become round screen controls;
  the hit test and joystick normalization use the same conversion. Action circles
  are 48-54 pixels across, movement is 108, and Pause is 64x44. Rotation clears
  held movement/aim instead of steering from obsolete coordinates.
- DOM HUD text, resources, Map and touch controls occupy separate portrait areas.
  Long messages at the maximum 1.3 text scale scroll within a bounded region,
  exposing the current action first. Touch scrolling and keyboard Home work;
  scrolling leaves the player's position unchanged. Threat text joins that stack.
- The safe opening phone is moved farther away and toward the center in portrait.
  Club placement accounts for grip rotation so both gripping hands stay in view;
  sleeve origins also adjust. Landscape model poses retain their original values.
- Full-height portrait applies only to the direct 3D gameplay/briefing path.
  Legacy/copy modes retain their existing layout. Cache tag:
  `20261112-course-portrait`.

## Verification

`node tools/verify-course-viewport.mjs` passes all four landscape quality tiers,
portrait aspect/pixel-budget rounding, physical-circle bounds and non-overlap.

`node tools/verify-course-portrait.cjs` final process 57604 exits 0. Final software
run `--software`, process 33700, exits 0; it preceded only the keyboard-focusable
message attribute, covered in final hardware and installed-client checks.
Both renderer runs verify:

- Actual portrait briefing Start (including scrolling to the button).
- 2560x1600, 1280x720, 390x844, 320x568 and a return to 844x390 landscape.
- Portrait view fills over 90% of viewport height and camera aspect matches it.
  At 390x844 the canvas is 834.625 CSS pixels high; at 320x568 it is 560.3125.
- All portrait touch targets are on-screen and at least 44x44 CSS pixels.
- Maximum text-size stress separates objective, buttons, messages and resources.
  Actual touch scrolling works. Final hardware also focuses messages and uses
  Home, then returns to touch through an actual touch before reading button bounds.
- Real two-finger movement plus looking; release stops movement. Run toggle,
  Rear, Crouch, Listen and charged Chip act through their rendered touch regions.
- Pause/resume and map round trips restore portrait; rotating during movement
  clears the old contact. Portrait Use files an unlocked drain and reaches victory.
- No page or console errors. `report.json` contains measured viewport/target boxes.

Earlier failures were inspected rather than treated as passes. The existing
landscape shell's padded CSS ratio differs slightly from 16:9, so its assertion
now checks the preserved camera contract; portrait checks actual CSS aspect.
CDP look events need observable input state before assertions. Keyboard Home
correctly switched input method and hid touch buttons; the final test uses an
actual touch to reveal them before continuing. Screenshot inspection also caught
header/button overlap at maximum text size and cropped gripping hands; both
were corrected before final captures.

Existing `verify-touch-run-browser.cjs` passes after final control positions:
actual two-contact sprint/look, cancellation, pause/blur and shared hold/toggle
preferences across Level 1 and Under Green. Player-craft browser process 66001
exits 0: actual Space/cancel, frozen pause, follow-through, reduced motion,
four sizes, resource stability and one replacement after scene rebuild.

Final installed-client wrapper process 73456 exits 0 after two normal opening
input bursts. Latest page/state were inspected. No error artifacts; readiness
only fails `gameplay_frame_budget`. Software completed-scene p95 was 66.5 ms over
120 samples. This is not a controlled performance comparison or a 60 FPS claim.

Artifacts: `output/course-portrait/hardware/`, `software/`, and
`standard-client-final/`. Inspected the high-resolution desktop, portrait world,
phone, gripping hands, maximum text-size stress and returned landscape captures.
Physical-phone comfort, whole-route portrait balance, full menu/map/Focus
responsiveness and human acceptance remain open.
