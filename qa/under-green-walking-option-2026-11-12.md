# Under the Green: slow-stance crossing choices and reactive routes

Scope: review 1, 5, 6, 9, 10, 13, 35, 38, 41 and 44. Full implementation and human/device acceptance remain open.

## Runtime findings and changes

The optional movement ramp reports zero pace while idle. The HUD previously used `crossingSpeed || MOVEMENT.walk`, so an idle crouched player received **CROSS · 2.0s TO SURGE** in a fixture requiring about 2.41 seconds at crouching pace including the reaction reserve. The actual player state was crouched, with crossingSpeed 0. The retained browser reproduction is `output/under-green/walking-option/eased-idle-baseline.json`.

`movementPace(player)` now supplies the same stance and stumble calculation to simulation and the idle guidance fallback. Positive ramp speeds remain conservative inputs to advice. This extracts the existing calculation; movement speeds, stopping, acceleration, camera direction and hazard timing do not change.

At an unobstructed near bank, when the current slow pace cannot clear but walking can, the HUD offers an explicit **WALK** action. It names the required controls using current bindings and input device: release held Crouch/Listen, tap a crouch toggle, or perform both actions when both slow stances are active. The current-pace action remains `wait` until the player changes controls. The offer is absent in active water, danger, recovery, stumble, permanent/event-controlled safe states, or when no stance change is needed. It never silently assumes sprinting.

Portrait layouts suppress the duplicate Listening status beneath this offer; the offer itself names Listen and the touch control remains highlighted. This avoids overlap when the combined instruction uses two lines. Other layouts and ordinary Listening status remain unchanged.

## Walking-option verification

- `verify-under-green-walking-option.mjs`: **1,764 cases**, **1,092 offered crossings**, zero failed offered crossings. Both banks, three approach distances, boundary neighbors, three stance combinations, and both movement responses. The player waits 250 ms before releasing slow controls. Joe is inactive to isolate water timing; these tests do not guarantee safety from a nearby trimmer.
- The first timing fixture unnecessarily attempted to move the inactive entrance actor from the pump checkpoint toward its doorway every step. That live process was explicitly stopped after inspecting the fixture, then corrected to seed Joe at the actual entrance position. `timing-fixture-before.mjs` retains the old harness. Final timing session 72568 exited 0. This was a fixture-efficiency correction, not a game optimization or a silent restart after an observation timeout.
- `verify-under-green-walking-option-browser.cjs`: **18 actual-control crossings**, zero browser errors. Remapped T/Y keyboard controls, emulated LB/LT controller input, and real browser touch contacts; hold/toggle, crouch/listen/both, pause/resume and eased idle. Tested 2560×1600, 1280×720, 844×390 and 390×844. Current-pace warning persists before release; the option retires after release. Final session 11212 exited 0 after the portrait correction.
- Initial browser runs also caught harness lifecycle errors: controller activation lacked a neutral tick after menu exit, and the touch tap occurred before the manual frame presented the hidden panel. Those were corrected in the harness while preserving the production neutral-input gate and device arbitration. They are separate from the real eased-idle advice defect.
- Existing crossing-advice regression: **4,698 cases**, 1,158 advertised crossings, zero failures, 576 documented excluded combinations. Existing running-option browser: eight hold/toggle cases pass. Main simulation: 13 groups and seven continuous routes pass.
- Installed gameplay client: final session 68391 exited 0; playing at 11.2 seconds, lesson crossed, zero water hits and no error artifact. Final shot/state inspected. High-resolution combined-toggle offer, controller variants, portrait combined-touch offer and landscape Listening offer were inspected.

## Reactive route study

The route pilot now optionally decides independently at A and B from the current phase and crossing advice. It does not look up future phases, reset Joe between channels or force a particular wet/dry ratio. A cautious policy can stand for a selected crossing or a usable walking window. A separate observed variant follows audible-engine advice with short voluntary rear glances and responds to a close Joe only when he is actually visible, or to an audible imminent-attack cue.

The first 36 runs produced 32 escapes and four captures. The first full 162-run sweep produced 145 escapes and 17 captures; eight attempts had water hits. These are retained in `quick.json` and `full.json`, not relabelled as current successes.

One water hit exposed a pilot defect: its generic 0.7 m waypoint radius ended the keeper crossing before body clearance, after which it turned along the still-unsafe fringe. `standing-window-trace.json` records the sequence. New reactive runs use a 0.3 m landing tolerance; legacy fixed-policy comparisons retain their original inputs/results. Three existing adaptive-run tapes were reproduced with identical completion time and final positions before this reactive-only correction.

An initial observed sweep produced 156 escapes, six captures and no water hits, retained as `full-observed-initial.json`. The final policy additionally freezes travel heading during held rear view and waits for the forward view before evaluating a junction signal. The final `full-observed.json` contains 162 continuous attempts: 156 escapes, six captures, zero water hits, zero body overlaps and zero unfinished attempts. All 81 walking attempts finish. Cautious outcomes are Standard 26/27, Steady 27/27 and Relentless 22/27. All four A/B branch combinations occur. The previously problematic 8.5-second cautious arrival finishes on all three profiles without a water hit. Six captured outcomes remain recorded for counterplay investigation; they are not proof of unavoidable losses. Final route session 17886 exited 0.

The completed `reactive-routes/browser.json` records 20 matching replays and 72 views across all four sizes, with no browser errors. Sixteen replays finish and four reproduce the same retained capture at different sizes. The replay checks consecutive held-rear headings, final mode, elapsed time, water hits and position against each original tape. The process is no longer live and the final report was inspected; it was not restarted after context loss. High-resolution captured approach and portrait walking-choice screenshots were inspected.

## Acceptance limits

This study uses known authored routes and scripted evasion, with instantaneous scripted yaw changes when rear view is released. It cannot establish first-time comprehension, input-device turn ergonomics, fun, fear or route preference. A capture is a policy outcome, not proof of an unavoidable loss; a passing replay establishes agreement, not that every policy should survive. The original all-crouch failure matrix and sprint tradeoff criterion remain retained. No route timing or enemy speed was changed in this pass to make a test pass.
