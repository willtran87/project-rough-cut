# Under the Green: late pursuit inspection

This pass improves one evidence-based decision; it does not complete the late-range tension requirement.

Joe now records a witnessed southward move into the east range maintenance route. After 1.5 seconds without fresh contact, he can inspect its fixed south rejoin at (12,13), walking along existing routes. A witnessed retreat cancels that assumption. Fresh sight or hearing still takes precedence. Speeds, player controls, water cycles and attack rules are unchanged.

The checkpoint-1 experiment placing Joe at (0,69.1) was rejected. It sent him into the bunker, then left him behind the permanent return flow after the pump. Its 63.83 m final separation was worse than the restored (0,55) setup's 38.09 m. Initial proximity alone is an inadequate checkpoint metric.

| Scripted route | Completion | Final separation | Comparison |
| --- | ---: | ---: | --- |
| Full dry walk with dodge responses | 75.92 s | 30.01 m | Previously 34.38 m |
| Full wet walk | 76.30 s | 28.89 m | Unchanged |
| Full sprint with dodge responses | 51.18 s | 32.79 m | Clean escape retained |
| Checkpoint 1 dry walk | 51.92 s | 38.09 m | Original checkpoint restored |
| Checkpoint 2 dry walk | 27.87 s | 25.97 m | Previously 33.81 m |

These pilots know the map and phases; the dodge pilot applies ordinary movement in response to a visible windup. They establish mechanical routes, not first-time duration or enjoyment. The full route still lets Joe fall too far behind for a strong final gate decision. Further work should address physical geometry and route tradeoffs while retaining earned escapes.

Validation:

- `tools/verify-under-green-late-pursuit.mjs`: witnessed direction, absent sighting, stationary sighting, observed reversal, identical pursuit decisions for different hidden destinations, unchanged maximum walking step, fresh sight overriding inspection, single inspection event, and five complete routes.
- `tools/verify-under-green-late-pursuit-browser.cjs`: real backward/forward keyboard movement updates the witnessed choice; rear glance remains available; a fixture recorded during the full route remains playable at 2560×1600, 1280×720, 844×390 and 390×844. No browser errors.
- Existing navigation suite: 48 arrival-phase crossings and bunker inspection pass. Rules suite passes gate, save, timing, interaction and binding checks. Service encounter browser still catches a player walking into the sweep and permits an ordinary sidestep.
- Required standard web-game client: two action bursts completed; latest screenshot and text state inspected. Player walks at 3.84 m/s; no error artifact.

Evidence is in `output/under-green/late-pursuit/verified.json` and `browser.json`; `before.json` and `inspection.json` retain the baseline and rejected checkpoint experiment. Screenshot review confirms readable controls and route markings, but also exposes repetitive low walls and a large empty background in the range perimeter. Portrait composition, final-route geometry, broader art quality, hardware performance and human testing remain open.
