# On-foot prompt preference audit — November 12

Review items 6 and 38, with shared wording ownership relevant to 44. The previous goal turn implemented and verified encounter contracts. This pass checks remaining control instructions against the actual inherited preferences.

## Reproduced gaps

`output/on-foot-prompt-preferences/baseline.json` records real browser startup with I/J/K/L movement, V crouch and toggle crouch enabled:

- Level 1's canvas `aria-describedby` instructions still advertised WASD.
- Its cover-shred instruction said `HOLD V` despite the enabled toggle.
- Under the Green and Final Cut resolved the correct keys but their control guides did not explain the selected hold/toggle mode.

Static default copy in chapter HTML is replaced by the existing runtime guides before play becomes available. Fixed menu keys and Back Nine's separate profile are intentional and were not remapped by this work.

## Changes

- Added one small shared `onFootActionVerb` helper in `control-profiles.js`. Keyboard/controller crouch and sprint honor their respective toggles. Touch crouch stays held; touch sprint follows its own toggle preference.
- Level 1's accessible canvas description now updates from current bindings and comfort preferences, independently of whether the live gameplay status changed. It only writes the DOM when the description changes. The pre-boot HTML no longer advertises an unverified default mapping.
- Level 1's cover-shred and active Nerve instructions use the correct crouch action. Already-crouched players are told to stay crouched, so a toggle user is not instructed to tap again and stand up. Diagnostic control text also uses the current hold/toggle verbs.
- Under the Green and Final Cut guides explain keyboard, controller and touch behavior using the same helper. Under the Green identifies RT's toggle behavior and RB's held fallback. Touch hint text names touch controls; these hints are normally hidden by touch CSS.

No binding, input, camera, speed, pursuit, water or save rules changed. Back Nine keeps its separate controls.

## Verification

`tools/verify-on-foot-prompt-preferences.cjs` passes with no page errors:

- Current remapped canvas description, toggle-aware danger instruction and guides in all three on-foot chapters.
- Actual keyboard presses in Under the Green and Final Cut: old C no longer crouches, V toggles on and off after release.
- Actual browser touch events in both chapters: Crouch is held, then released, even while keyboard toggle crouch is enabled. This is browser emulation, not a physical-device test.
- Change crouch to X through Under the Green's visible keyboard editor, use it, switch to hold mode through the visible comfort controls, and verify held/released behavior.
- Navigate to Level 1: inherited X/hold instruction is correct. Reset keyboard bindings and verify the canvas description changes back to WASD without requiring a status change. Final Cut subsequently inherits the reset and held modes.
- Eight settings-guide captures at 2560×1600, 1280×720, 844×390 and 390×844 have no horizontal text overflow. The high-resolution Under the Green and portrait Final Cut captures were opened and inspected.
- Syntax checks pass for all four edited JavaScript modules. Installed gameplay client session 95274 exited 0; screenshot/state inspected: lesson crossed with zero water hits, Joe entering physically, movement release gives zero speed.

An intermediate expanded verifier incorrectly read Final Cut's crouch state as `player.crouched`; that chapter exposes `player.crouch`. The test now reads the actual chapter contract and the final actual-input run passes. No runtime change was made to satisfy that mistaken assertion. The original baseline is protected against overwrite.

The source search also reviewed remaining literal WASD/E/Q/R/Shift/hold instructions, distinguishing runtime-replaced fallback HTML and fixed menu actions from gameplay bindings. This is not a claim that every contextual sentence or screen-reader workflow has been tested. Physical controller/touch ergonomics, screen-reader listening and unfamiliar-player comprehension remain open. The full 44-item goal remains active.
