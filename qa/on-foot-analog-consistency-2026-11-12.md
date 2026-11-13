# On-foot controller consistency — November 12, 2026

The preceding goal work made progress: the fixture-support pass changed authored geometry and produced inspected clearance evidence. This pass continues the full 44-item implementation, following the user's build-prompt clarification. It does not close the full goal.

## Reproduction and change

The new browser test uses ordinary controller menu actions in Level 1 to select deadzones of .22, .1 and .3. It then loads Under the Green and Final Cut, reloads each chapter, places the player on unobstructed ground and supplies emulated controller input through `navigator.getGamepads`. It exercises actual chapter input and simulation; it does not inject a precomputed movement vector.

Retained baseline: `output/on-foot-analog/baseline.json`. Twelve Final Cut movement cases disagree with the shared radial movement contract. At .22 deadzone, a diagonal of approximately (.198, .198) moves zero metres instead of .147692 metres over half a second. At a saved .3 deadzone, a cardinal .28 input incorrectly moves .147692 metres. Under the Green's movement cases already match. Final Cut also ignores the saved threshold for looking and uses a linear look response instead of the existing on-foot 1.35 curve.

`web/final-cut.js` now reads the saved deadzone, uses `RCFoundation.stick` for movement and matches the existing look-response curve. Its camera uses the opposite internal pitch convention from Under the Green, so that sign is preserved; negative vertical stick input still looks upward in both scenes. `web/under-green.js` and Final Cut now recognize a movement diagonal outside the radial deadzone as controller activity even when its individual axes remain below the threshold. This keeps the active-device guidance consistent with accepted movement.

No movement speeds, hazard rules, scene geometry, chapter saves or Back Nine steering are changed. This uses the existing shared movement utility rather than introducing another controller abstraction.

## Evidence

- `node tools/verify-on-foot-analog.cjs --baseline`: 66 recorded cases, 12 movement mismatches, no page errors. Original baseline retained.
- `node tools/verify-on-foot-analog.cjs`: 66 cases, zero movement mismatches and no page errors. Covers neutral, threshold boundaries, small diagonals, proportional cardinal/diagonal movement, full deflection, reverse movement, immediate release, device-label switching and look thresholds/response. All three settings are selected through Level 1's controller menu and read after chapter navigation/reload.
- `node tools/verify-final-cut-controls.cjs`: passes remapped real pump interaction, persisted preferences, controller sprint/listen precedence, Start pause/resume, blade defeat/retry and actual simultaneous touch/cancellation paths. Captures settings at 2560×1600, 1280×720, 844×390 and 390×844, with separate touch contexts for compact gameplay.
- `node tools/verify-under-green-controls.cjs`: passes established movement/stance speeds, diagonal normalization, immediate stopping, real pointer-lock normal vertical look, rear glance, proportional controller input, touch run and inherited bindings/spatial preferences.
- Visually inspected both 2560×1600 analog captures and the Final Cut 390×844 touch capture. The controller guidance is present and the compact touch controls remain visible. This input change is not an architectural or art acceptance pass.
- Installed `web_game_playwright_client.js` completed three movement/release bursts in Final Cut, exit 0. Inspected `output/on-foot-analog/client-final/shot-2.png` and `state-2.json`: ready, playing at 6.95 seconds, stopped after release, no error files. The client image is canvas-only; the separate browser captures above include the DOM HUD.

The targeted test compares Under the Green and Final Cut against Level 1's existing source contract and shared helper; it does not claim a new exhaustive Level 1 movement test. Controller inputs are emulated. Physical-controller comfort, first-time comprehension, remaining shared-setting consumers and full chapter experience acceptance remain open. Existing ledger statuses stay unchanged.
