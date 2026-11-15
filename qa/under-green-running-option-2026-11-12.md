# Under the Green — explicit running windows

Review items 5, 6, 9, 10, 13, 35, 38 and 41. This is a local water-decision improvement using the existing on-foot controls, movement constants and settings. It does not change water cycles, speed, Joe's pursuit or the wet/dry route geometry.

## Player-visible behavior

At a safe bank, the water card can now distinguish a closing window that walking cannot clear but running can. It explicitly names the player's Run control, hold/toggle behavior and time until the surge. The expanded text states that walking will not clear and retains the dry route or next opening as an alternative. The compact row includes the Run binding itself, since phones intentionally hide the explanatory paragraph.

The underlying advice still reports WAIT at the current walking pace. The optional running calculation uses the same approach distance, channel depth, far-bank clearance and 350 ms reserve as ordinary crossing advice. It only appears within one metre of the decision bank, outside the water, during a real timed safe interval. It is unavailable while crouching, listening, stumbling or recovering. Permanent drained/blocked states do not acquire invented timers. The return's actual two-second pump warning is included in the timing tests.

The simulation now exposes the already-selected sprint stance for presentation. This prevents an active Run toggle from being offered again when the optional movement-start ramp temporarily reports zero or partial speed. No movement calculation changed.

## Evidence

- `tools/verify-under-green-running-option.mjs`: 588 boundary cases across seven timed outlets, both banks, three approach distances and both immediate/eased movement starts. Samples bracket both walk and run recommendation boundaries. All 312 offered crossings clear after 250 ms of reaction delay, with zero water hits and no body overlap. Joe is deliberately inactive in these timing fixtures; they do not promise safety from an approaching trimmer. Permanent event-state and incompatible stance guards are also checked.
- Existing `verify-under-green-crossing-advice.mjs`: 4,698 scenarios, 1,158 advertised crossings pass; 576 obstructed/multi-outlet fixtures remain explicitly excluded. Existing walking recommendations still require no hidden sprint.
- `tools/verify-under-green-adaptive-pace.mjs`: 165 continuous pump-checkpoint-to-exit routes with live Joe, across a full quarter-second arrival cycle plus selected boundary neighbors. The pilot normally walks and accepts the same bank running option as the UI. All complete with zero water hits. Eleven routes use 13 running choices, covering wet, wet/dry and dry/wet policies. Three complete input tapes are retained. These route orders remain planned; reactive branch selection and cautious stance-changing policies are still separate work.
- `tools/compare-under-green-running-routes.mjs`: all eleven applicable comparisons retain the same initial phase, route order and live Joe. Each adaptive route finishes more than 0.5 seconds sooner than its walking-only counterpart; the maximum gain is approximately 12 seconds. These are scripted route times, not human completion times or preferences.
- `tools/verify-under-green-running-option-browser.cjs`: eight ordinary-input crossings using keyboard, emulated gamepad polling and actual browser touch events. Hold and toggle controls pass; toggle cases also enable the movement-start ramp through ordinary settings UI. The remapped T / RT / Run labels agree with input. The option retires when Run is already selected, on incompatible stances and after expiry. Pause freezes the seeded state. Each crossing includes a 250 ms reaction interval, live Joe and no water hit.
- Under the Green movement/look regression passes. Pump/event guidance regression passes, including the persistent return-flow routes. After adding sprint-intent presentation, three representative adaptive policies reproduce their exact prior elapsed time, choices and outcomes (`active-run-regression.json`).

The initial 42-route sample completed but exercised a running choice on only one route order, failing its coverage assertion. `initial-42.json` preserves those results; its original `passed` field represented route invariants only and must not be treated as coverage acceptance. The expanded report explicitly includes coverage in its pass condition. The original all-crouch/range-balance failures remain unchanged elsewhere; this pass does not retroactively close them.

Browser fixture corrections established the actual last-used device after keyboard-operated settings. A neutral controller is not evidence of gamepad use, and touching the scene is necessary to restore touch controls after keyboard input. Runtime device arbitration was preserved.

## Visual and experience limits

Inspected 2560×1600, 1280×720, 844×390 and 390×844 captures with the actual Run option visible. The compact row leaves the central signal, far bank and touch controls visible; desktop text explains the walking/run distinction. Inspected normal gameplay from the installed web-game client as well as full-page HUD captures.

This is mechanical and visual evidence. It does not establish that an unfamiliar player notices and reads a short running window comfortably, enjoys the choice, or prefers it to a dry route. Physical phone/controller ergonomics, human comprehension, broader pressure/occupied-bank configurations, fully reactive branch policies and the rest of the 44-item scope remain open. The option is an opportunity, not a requirement to keep Joe artificially close or to sprint every crossing.

Artifacts: `output/under-green/running-option/` contains timing rows, exclusions, route results, same-state comparisons, input tapes, browser captures and client output.
