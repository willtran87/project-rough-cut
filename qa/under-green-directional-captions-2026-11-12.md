# Under the Green — range captures and audible direction

November 12, 2026. This pass investigates the four previously unexamined range-approach captures and implements lateral sound descriptions for review items 22, 34 and 38. All 44 requirements remain in scope.

## Findings from continuous attempts

`tools/probe-under-green-range-captures.mjs` reproduces the four Relentless cautious captures at CP2 offsets 0, 11, 11.5 and 11.99. Final positions and captured outcomes match the retained reactive-route report. The two connector attempts complete one scripted evasion before running toward Joe and stopping against his body. The two keeper-bank attempts perform no scripted evasion: their pilot rejects its compound sidestep-and-pass route and waits or advances toward the water. These are policy failures, not proof that the player cannot move elsewhere.

From each final windup, the diagnostic tries sixteen headings at walk/crouch/run pace after 250 ms or 500 ms: **384 separate short branches**. Every combination has an available evasion. At 500 ms, each source has 13–14 walking directions and 9–11 crouching directions that survive the two-second interval with over two metres separation and no world-solid overlap. This does not establish a complete escape or a person's ability to choose the direction; heading choice is perfect and instantaneous.

The actionable information gap is that **Joe is outside the camera view at all four windup starts**, while his audio pan is strongly lateral (absolute pan above 0.99). The prior urgent caption said only “close by.” The mixer already supplies a clear left/right signal, including when the camera is in rear glance.

## Implemented behavior

`web/under-green-observation.js` now describes a strongly lateral heard trimmer as “to your left” or “to your right” in:

- urgent unseen-attack instructions;
- ordinary heard-only pursuit captions;
- optional engine sound descriptions.

The description uses the same observed stereo pan as the mixer. The central band (absolute pan below 0.4), inaudible sources and nonfinite values produce no side. A centred sound is not labelled ahead/behind: the current stereo model does not distinguish those positions. Hidden walking, turning, searching, water waiting and recovery remain indistinguishable through these captions. Visible attack descriptions remain unchanged. Essential attack information still takes priority when optional pursuit/dialogue captions are disabled or sound is muted.

This is a chapter-owned wording adapter over the existing spatial-audio contract. It introduces no map marker, distance readout, hidden intent, new sound source, AI change, movement change or speculative campaign framework. The campaign-wide standard is that accessible danger information agrees with the audio; other chapters retain their own threat presentation.

## Verification

- `tools/verify-under-green-directional-captions.mjs` passes centre-band and audibility boundaries, camera-relative side reversal, hidden-state equivalence, centred-source ambiguity, visible attack wording and all four retained approach states.
- Existing threat-observation unit and browser regressions pass. Those cover actual rear glance, optional-caption/mute settings, urgent-message priority, opaque cover and aspect-dependent visibility.
- `tools/verify-under-green-directional-captions-browser.cjs` passes **16 ordinary-input evasions and 44 views** at 2560×1600, 1280×720, 844×390 and 390×844. Keyboard, emulated controller polling and browser touch events are used. All captures use maximum 1.4 caption size, muted sound and disabled optional pursuit/dialogue captions. Captions stay in bounds and do not intersect touch buttons.
- Each browser approach branches from its retained windup, performs one synchronizing simulation frame, waits 250 ms, then holds ordinary right strafe for 1.25 seconds. Positions and elapsed time match the simulation. All remain playing with zero water hits and 3.198–6.103 metres separation. These are short evasions, not full chapter completions or a universal dodge prescription.
- The browser checks the caption side against the actual mixer's `joePan` target, exercises held rear glance, and verifies sound-only mode does not disclose searching. No page/console errors.
- The first new browser run failed because a zero-time fixture redraw left the previous fixture's audio target intact. The harness now performs one real simulation update and includes it in its expected state. This was test setup staleness, not a shipped audio/caption mismatch. The final browser session 26927 exited 0.
- Installed gameplay client session 92954 exited 0. It ends at 9.667 seconds, lesson crossed, zero water hits and no error artifacts. Latest state/screenshot inspected. High-resolution range warning, portrait keeper warning and landscape rear-glance captures were also inspected.

Retained reproduction/branch evidence is under `output/under-green/range-captures/`. Caption rules, browser evidence and installed-client captures are under `output/under-green/directional-captions/`. Reproduction session 88333 and all browser/client processes are terminal; no test is pending.

## Remaining acceptance

The original six reactive captures and fifteen failed keeper-recovery policies remain preserved. Diagnostics now establish short movement alternatives for their examined attack states; they do not replace the original outcomes with wins. Human recognition of the warning, choosing a useful direction while glancing back, physical-device ergonomics and emotional impact remain untested.

Continue remaining architecture/theme coverage, actual shared-consumer gaps and cold-start/device qualification. Further pursuit changes should respond to concrete mechanical defects or observed player confusion, not a demand that every fixed pilot route succeed.
