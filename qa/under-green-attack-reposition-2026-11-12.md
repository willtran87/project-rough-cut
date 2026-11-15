# Under the Green: blocked trimmer recovery

The retained four unfinished Range B pilot states exposed two separate issues: the pilot attempted to walk through Joe, and Joe repeatedly prepared attacks that struck the same wall. There was a usable short sideways escape, but the stationary wall loop was a real pursuit defect.

`web/under-green-attack-position.js` now lets Joe choose a short physical reposition after finishing a wall-blocked attack's full recovery. The choice uses the currently visible player and rejects body, water and authored blade-motion obstructions. Joe walks at his existing pressure-profile speed. Losing sight cancels the plan. If the shortest turn is blocked by the carried blade, the mover tries the opposite direction with the same bounded turn rate and clearance checks. No player movement, attack reach, damage, enemy speed or hidden-player knowledge was added.

Six retained fixtures cover the original four blocked states and two later obstructed-turn states. `tools/verify-under-green-attack-reposition.mjs` checks stationary contact, ordinary-input escape, pause, loss of sight and hidden-player-location invariance. All six reach real blade contact if the player remains still; all six also retain an ordinary-input dry escape at their original stance without an additional water hit. The complete pressure-envelope report contains 516 cases and no unfinished pilots; caught cases are not counted as successful escapes or proof of unavoidable defeat.

`tools/verify-under-green-attack-reposition-browser.cjs` replays the actual simulation and renderer: 20 views across 2560×1600, 1280×720, 844×390 and 390×844, including the longer turn at high resolution. All 62 sampled actual-mesh clearance checks have no scenery hits; measured hand/foot constraint errors stay below 0.015 m. The recorded escape reproduces its simulation endpoint. Browser error list is empty. The close views show Joe turning and moving within the narrow connector, then facing the player for a new preparation. Inspection uses look input to frame him; gameplay does not force the camera.

Evidence:

- `output/under-green/range-recovery/reposition.json` and `reposition-tapes.json`
- `output/under-green/range-recovery/browser.json` and its stage screenshots
- `output/under-green/pressure-envelopes/verified.json`
- `tools/fixtures/under-green-blocked-attack.json`

Limits: these are retained physical fixtures, perfect-information scripted evasions and sampled rendered geometry. They do not establish first-time recognition, human animation quality, physical-device ergonomics, all-space clearance or comprehensive fairness. The continuous range-sequence comparison remains a separate balance requirement; completing these fixtures does not close it.
