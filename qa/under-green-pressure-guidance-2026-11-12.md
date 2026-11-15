# Under the Green — live pursuit crossings and truthful route guidance

This pass advances review items 4, 5, 7, 10, 15, 29 and 41. It does not close the full recovery-envelope, unfamiliar-player or device-qualification requirements.

## Player-visible corrections

- The post-pump return warning no longer invents a nearby “pump-house side walkway.” The return occupies the entire corridor. On the pump side, guidance names the drained pump outflow; on the outside bank, it names the real backtrack through the bunker and spillway to the junction. The latter is a full loop, not a quick local detour.
- The permanently drained outflow no longer instructs the player to hurry before a nonexistent surge. The return before pump operation correctly explains that it remains low until the bypass is operated.
- The spillway HUD now names the “East dry walkway” instead of keeping a right arrow when the player looks backward. Physical signs retain their authored directions.

Only guidance text and the route label changed in gameplay. Movement, Joe speed/perception, phase timing, displacement and hit rules remain the existing implementation.

## Pursuit matrix

`tools/verify-under-green-pressure-envelopes.mjs` exercises 516 initial fixtures across all eight channels, three movement stances, five sampled periodic phases (including a surge beginning while inside the channel), and target Joe gaps of 3, 6 and 9 metres. The protected lesson keeps Joe absent. Event-controlled crossings use their usable states: return before pump operation and outflow after operation.

Initial actors occupy dry, body/tool-clear floor with a connected same-bank sightline. Joe then uses normal live perception, navigation and attacks; no actor is teleported or accelerated during an attempt. This validates fixture geometry, not the campaign history that would produce every initial position. Both pilots wait 250 ms initially. One follows crossing advice but waits naively; the other deliberately attempts a bad crossing, then uses authored detours and perfect-information attack dodges. Neither represents a human player.

| Channel | Cases | Cleared | Cleared after a water hit | Actual protected-displacement cases | Caught |
| --- | ---: | ---: | ---: | ---: | ---: |
| Lesson | 30 | 30 | 9 | 3 | 0 |
| Spillway | 90 | 63 | 27 | 9 | 27 |
| Bunker | 90 | 59 | 23 | 9 | 31 |
| Return | 18 | 18 | 0 | 0 | 0 |
| Outflow | 18 | 18 | 0 | 0 | 0 |
| Range A | 90 | 63 | 27 | 9 | 27 |
| Range B | 90 | 52 | 16 | 9 | 34 |
| Keeper spillway | 90 | 45 | 6 | 6 | 45 |

All checked physical invariants passed: no sampled player/Joe solid overlap, no movement exceeding the normal movement/displacement bounds, no capture during protected displacement, and no initially advertised signal-following crossing that failed or took a water hit. Protected displacement was actually exercised in 45 cases over 805 frames, rather than inferred from the absence of a protected-capture flag.

348 attempts cleared, including 108 after water hits; 164 ended in capture. Four Range B pilots remained alive but unfinished at the 30-second cutoff: walking/sprinting at cycle 3.75 and crouching at cycles 4.25/4.75, all in the approximately 9 m initial-gap band. These are unresolved pilot outcomes, not established unavoidable failures. A WAIT message only describes the water window; it does not promise safety from Joe.

The original pilot could repeatedly choose opposite dodge destinations during one windup and walk back into the same blade. That test defect was corrected to allow one dodge per committed attack. Retained `initial-pilot.json` and `boundary-entry-pilot.json` show the earlier, narrower experiments. The final report explicitly requires real in-channel displacement coverage for every periodic channel.

Visual replay also exposed a weak completion condition: passing the far-bank coordinate in the parallel dry corridor counted before the player rejoined the destination bank. The final matrix and browser replay require both far-bank clearance and a lateral position inside the destination corridor. `plane-clear-pilot.json` preserves the earlier result. Completion totals stayed the same after rerunning the stricter check; the tapes now include the actual rejoin.

## Browser and visual evidence

- `tools/verify-under-green-event-guidance.cjs`: actual Use operates the visible pump, then free look inspects its warning and latched return. Pause freezes the transition. Before-pump, warning, latched, outside-bank and drained-outflow captures pass at 2560×1600, 1280×720, 844×390 and 390×844. Smaller captures activate actual touch UI. Collision navigation confirms both named routes and the absence of an adjacent return walkway. Initial placement and the opposite-bank view are explicit fixtures.
- `tools/verify-under-green-pressure-replay.cjs`: replays six retained protected-recovery input tapes through the real browser simulation and renderer. Each matches the recorded time, outcome and water-hit count. Front, rear and cleared views are captured at 2560×1600. Rear views are frozen inspection poses, not an additional claim about human rear-glance use.
- `tools/verify-under-green-crossing-advice.mjs`: 4,698 valid isolated advice cases and 1,158 advertised crossings pass after the guidance changes. Its 576 multi-channel approaches remain explicitly excluded; this suite holds Joe inactive.
- Installed web-game client: two forward/idle bursts pass the protected lesson with normal walking, no water hits and no browser-error artifact. Final gameplay screenshot and state are inspected separately from the focused fixtures.

Reports: `output/under-green/pressure-envelopes/verified.json`, `browser.json`, `examples.json`; `output/under-green/event-guidance/browser.json`; `output/under-green/crossing-advice/verified.json`.

## Remaining acceptance

The matrix covers the authored forward approach, centered starts, standard pressure and selected phases/distances. Reverse approaches, wider lateral starts, other pressure settings, occupied recovery landings, chained range approaches, full-route history and human reaction/recognition need further evidence. The four unfinished Range B pilots warrant diagnosis before drawing layout conclusions. Screenshots do not establish animation quality in motion, audio intelligibility, fun, fear, physical phone ergonomics or sustained performance. No new human session occurred and no chapter-completion claim is made.
