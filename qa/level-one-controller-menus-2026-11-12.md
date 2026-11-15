# Campaign controller menus — November 12, 2026

Implemented Level 1's remaining canvas/DOM menu integration and a shared controller session guard. The current game, not a replacement menu, is exercised by `tools/verify-level-one-gamepad-menus.cjs`.

- D-pad reaches all 26 existing canvas settings rows; selection remains visible and a slider changes through controller input. The bindings page can be opened and closed. Assigning a physical keyboard binding still requires that keyboard key.
- X opens Controls & comfort; Y opens the field journal from the clubhouse or pause screen. The shared DOM adapter handles focus, scrolling, checkboxes, sliders, tabs and Back/Start. Collected journal articles can receive focus, so long entries scroll into view on a portrait phone.
- The shared `gamepad-session.js` guard requires neutral input after connection, context changes, replacement controllers and returning focus. Background input cannot activate a menu. Disconnecting during controller gameplay pauses the round. Closing a dialog with Start or Back cannot also resume the underlying pause screen.
- Gameplay mappings are preserved, including X chip/Y map in Level 1 and Back Nine steering/follow camera. The meaningful-input check also recognizes vertical-only right-stick input.

Verification completed:

- `node tools/verify-gamepad-session.mjs`: first connection, held buttons, stick deflection, replacement identity, analog button values, context changes, background/focus and one-shot disconnect.
- `node tools/verify-level-one-gamepad-menus.cjs`: actual controller-only start/prologue skip/briefing, settings, comfort, journal, movement, pause/resume, disconnect/reconnect, focus loss, result Retry and return to clubhouse. Retry begins from a result fixture; this does not retest physical capture.
- `node tools/verify-chapter-gamepad-menus.cjs`: Under the Green and Back Nine adapters pass after the shared guard change.
- `node tools/verify-interact-controls.cjs`: keyboard migration, real E/G activation, remapped prompts, conflict swaps and persistence pass.
- Required standard client, six iterations of `output/actions-golf-input.json`: final `output/level-one-gamepad-menus/standard-client-final/shot-5.png` and `state-5.json` inspected. The first shorter attempt remained in the opening story; the final attempt reaches `first_hole` with course assets ready. The canvas-only capture omits the native HUD; full-page controller captures establish menu presentation.

Full-page menu captures cover 2560×1600, 1280×720, 844×390 and 390×844. Inspected high-resolution comfort, portrait comfort/journal and ordinary desktop pause. Focus is visible and journal scrolling works. No page errors were reported by the controller suites.

Limitations: the Gamepad API is injected in browser tests; actual controller hardware, browser-specific mapping and thumb ergonomics remain pending. This closes the missing Level 1 navigation implementation, not the full campaign accessibility or device-acceptance scope.
