# Under the Green: occupied keeper room and recovery

The preceding range sweep retained a live state where the player and Joe were both inside the keeper room. Its fixed crouch pilot kept dodging and requesting closure. The gate correctly refused, but the actual browser message incorrectly located Joe at the threshold: “Joe is at the threshold. Draw him back before closing the sluice.” The action still read “Close the keeper’s sluice.” This event message was visible; the suspected immediate priority suppression was not reproduced. After the event, the generic nearby detail would again say to stay inside.

## Player-visible change

The release now distinguishes a body inside the room from an occupied threshold or a tool crossing it. After a refused request, its action reads **Sluice blocked** and the nearby detail retains the relevant explanation. For an occupied room, the instruction is to draw Joe across the spillway, dodge his swing, then run back to the release. Turning away hides contextual interaction detail; clearing the obstruction restores ordinary closure instructions. Imminent attack and water-recovery messages retain priority.

If actual blade contact follows a requested, still-blocked closure, defeat coaching explains the unsealed room and the recovery tactic. A stale earlier refusal cannot select this coaching once occupancy has cleared. This is transient encounter feedback, omitted from saves and retry reconstruction.

`web/under-green-sluice.js` owns the local obstruction classification and wording. Simulation, interaction detail and defeat coaching consume it. The boolean closure condition is the same existing body/tool interlock. Gate speed, threshold dimensions, water cadence, player movement, Joe’s speed and committed attack rules are unchanged. This chapter-specific logic does not alter mower captures or other chapters.

## Recovery evidence

The stable fixture `tools/fixtures/under-green-keeper-occupied.json` retains the stalled run’s physical, perception and attack state; only diagnostic event history and telemetry were removed. Both test routes start there and use ordinary sprint/strafe inputs. They move along the dry bank, cross on a real opening, draw Joe out, evade a committed swing from the far bank, then return to the release. Joe follows his normal perception, navigation and water rules throughout.

| Return side | Time to results, including safe aftermath | Water hits | Input frames |
| --- | ---: | ---: | ---: |
| West | 27.97 s | 0 | 1,678 |
| East | 27.45 s | 0 | 1,647 |

The final gate is fully closed with the player inside and Joe outside. Every simulated frame checks both bodies against solid geometry. Maximum player and Joe displacement remain within 6.08/60 and 2.1/60 metres per step. All 555 sampled simulation tool-clearance checks pass. No actor teleport, time reset, grace grant, enemy disable, attack alteration or occupancy bypass occurs during either recovery.

This establishes an escape from that retained state. It does not establish that sustained crouching can solve every arrival, or that an unfamiliar player will recognize and execute the tactic. The original 144-case fixed-policy balance report remains failed and is not rewritten as a passing report. Broader mixed-route/stance decisions and sprint route tradeoffs remain open.

## Verification

- `tools/verify-under-green-keeper-counterplay.mjs`: requested feedback, persistent detail, camera-facing scope, pause, cleared occupancy, save exclusion, tool-only threshold obstruction, interrupted closure, actual occupied-room defeat and both physical recovery tapes pass.
- `tools/verify-under-green-keeper-counterplay-browser.cjs`: eight actual simulation/renderer replays across 2560×1600, 1280×720, 844×390 and 390×844; 52 views including refusal, persistent detail, recovery stages, completion and defeat; zero page/console errors. Small contexts enable the actual touch interface. All replay endpoints match the retained inputs. The persistent-detail fixture expires only the event banner at the denied-use instant; it does not claim an uninterrupted stationary player survived until expiry.
- Existing gate/save rules, interaction rules, interaction browser priority/remapping checks, outcome checks and main simulation (13 groups, seven full routes) pass. The final outcome addition also passes the focused actual-death and existing outcome checks. The installed gameplay client’s final state is ready, lesson crossed, zero water hits at 7.03 seconds; its final screenshot was inspected.
- Visually inspected the high-resolution refusal, ordinary desktop return view, landscape refusal, portrait persistent detail and defeat panel, plus the final gameplay-client capture. Text and controls remain visible. Rendered all-space mesh clearance, human cue recognition, actual touch/controller ergonomics and listening are separate acceptance requirements.

Evidence is under `output/under-green/keeper-counterplay/`: `baseline-browser.json`, `verified.json`, `browser.json`, both `attempt-*.json` tapes, `defeat.json`, screenshots and `client-final/`.

Next: evaluate mixed branch and stance policies across the complete range sequence and judge sprint tradeoffs using exposure as well as travel time. Expand the occupied-room recovery envelope to earlier reachable states and pressure profiles before making a broad fairness claim. Human, listening and physical-device sessions remain unperformed.

Later evidence: `qa/under-green-reactive-counterplay-2026-11-12.md` reproduces generic close-approach caption suppression from a different, continuously reached threshold state. It records the local priority fix, full closure/cancellation guidance and a 24-policy recovery envelope with successful and failed outcomes retained. The original fixture results above are unchanged.
