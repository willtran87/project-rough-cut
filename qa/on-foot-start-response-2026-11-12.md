# Shared optional movement start — November 12, 2026

The preceding goal turn was progress: rear glance and device ownership changed runtime behavior and gained reproduced/final evidence. This pass continues the full 44-item implementation and applicable shared consumers.

## Reproduction

The browser test enables Ease into movement through Under the Green's settings, navigates to each chapter, reloads, and drives ordinary movement input from clear-ground fixtures. The retained baseline in `output/on-foot-start-response/baseline.json` records six Final Cut mismatches: walking, sprinting, Listening Focus, crouching, diagonal movement and reversal all start at full speed despite the saved preference. For example, the first 1/60-second walking frame travels .064 m instead of the established eased .0336 m. Under the Green already responds correctly.

## Implementation

- `web/movement-response.js` owns the existing optional 80 ms start response. Level 1, Under the Green and Final Cut consume it. Immediate response remains the default, full movement speeds are unchanged, and release never introduces drift. Reversal starts a fresh ramp. Disabling the preference clears transient ramp history so later re-enabling cannot inherit a completed start.
- Level 1's `spatialMotionScale` and Under the Green's movement replace their duplicated calculation with the shared helper. Chapter units and collision remain local.
- Final Cut passes the saved preference into its simulation and evaluates the start response once per input update, before its finer collision substeps. This preserves the same integrated response as Under the Green at the same update interval.
- Final Cut exposes the inherited checkbox in its on-foot settings. Its adapter now handles boolean spatial controls correctly. The checkbox sits beside its label, with a 44 px label target and 22 px checkbox. Back Nine steering is unchanged.

## Final evidence

- `node tools/verify-movement-start.mjs`: 15 cross-chapter comparisons / 30 chapter cases pass at 30, 60 and 120 Hz. Covers walk/run/listen/crouch/diagonal starts, full speed, release and re-enabling after immediate movement. This compares actual simulation displacement, not just the helper output.
- `node tools/verify-on-foot-start-response.cjs`: 13 recorded movement cases pass with zero mismatches/page errors. Includes the actual Level 1 consumer on clear calibration ground, Under the Green and Final Cut keyboard movement, reversal, persisted preferences after transition/reload, Final Cut controller starts/stops, ordinary UI changes back to immediate response and return navigation. Additional real touch contexts verify checkbox and movement/cancellation at 844×390 and 390×844.
- Visually inspected the final settings captures at 2560×1600, 1280×720, 844×390 and 390×844. Label and checkbox remain together, the explanation wraps, and scrolling exposes the option on compact screens.
- `node tools/verify-under-green-controls.cjs`, `node tools/verify-under-green-rules.mjs` and `node tools/verify-final-cut-controls.cjs` pass. Existing default movement, remaps, normal vertical look, controller/touch input, pump persistence and gate invariants remain covered.
- `node tools/verify-final-cut.mjs` passes, including seven complete simulation routes, contact at 30/60/120 Hz, refuge, save and ending invariants.
- Installed gameplay client completed a movement/release burst in Under the Green, exit 0. Inspected `output/on-foot-start-response/client-final/shot-0.png` and `state-0.json`: ready, playing at 2.5667 seconds, stopped, zero water hits and no error files.

## Intermediate failures and limits

The first new browser-test attempt timed out trying to reveal settings because controller disconnection had already paused the chapter and the harness pressed Escape again. The test now checks the mode before pausing. A later parallel attempt and Final Cut's existing control suite both timed out at readiness. An isolated startup probe then reached ready with no page/console errors; both suites subsequently passed sequentially. The timeout cause is not established, so these results are not a cold-start reliability or performance qualification.

The final full browser run after the checkbox layout adjustment is session 6602, exit 0. The prior passing integrated run was 77211. Intermediate failed handles 63620, 82836 and 97759 are terminal. No test process remains active from this pass.

This verifies the movement preference integration, not the full 44-item experience. Human/device ergonomics, listening, encounter comprehension and current performance qualification remain open. Continue the broader shared-consumer audit, including truthful feedback if spatial preference persistence fails; do not infer that a visible shared setting has every failure path covered.
