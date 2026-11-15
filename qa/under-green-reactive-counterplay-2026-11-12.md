# Under the Green: keeper response feedback and recovery envelope

Scope: review 1, 2, 8, 13, 22, 35, 39, 41 and 44. The full 44-item objective remains active.

## Reproduced defects

A retained Standard cautious route reached the release at time 94.2833 with Joe and his tool approaching the threshold. The gate correctly refused. In the rendered game, an ordinary E request generated the correct four-second rejection message, but the player saw only “THE TRIMMER IS AUDIBLE” because the generic close-approach candidate had priority 80 and the requested event had priority 60. `priority-baseline.json` retains both the authoritative message and the incorrectly displayed caption; its matching high-resolution image is retained separately.

The same issue was reproduced during an accepted closure and after backing out of the room. The ordinary proximity caption hid “Stay inside” and “Closure cancelled” respectively. Those separate baseline reports/images remain in this directory. An actual rear-glance image also showed APPROACH water advice while closure required staying inside.

These are current, reproduced presentation defects. The older keeper-counterplay review did not reproduce immediate suppression in its different occupied-room fixture; that narrower finding remains historical evidence, not a contradiction.

## Changes

- The post-pump objective explains arriving ahead of Joe and keeping him outside. The release detail names the clear-threshold requirement before an unsuccessful request.
- Threshold and room refusals now provide the same concrete recovery tactic: cross on a safe opening, draw Joe after you, dodge and run back to the release. Failure coaching consumes that same local text.
- Gate response events have an explicit transient `messageKind` and priority 85, above ordinary proximity text. This includes accepted, refused and cancelled closure. Ordinary `say` calls reset the category; the direct masonry-strike message writer does too. The category is omitted from durable progress.
- Queried blocked-control detail remains at priority 85 after its event banner expires, while the control is relevant. Turning away retires that contextual fallback. Active closure retains its known commitment reminder during a voluntary rear glance and in the pause objective.
- Immediate attack warnings (100) and water recovery (95) retain precedence. No shared caption-selector behavior or sibling chapter messages changed.
- Crossing advice is hidden during active closure so it cannot invite the player back into the spillway. Actual physical outlet signals remain visible. Backing out cancels closure under the existing rules and restores relevant crossing advice. Compact HUD framing persists through the active closure.

No movement speeds, enemy perception/speed, attack timing, water cycles, gate eligibility, invulnerability, save semantics or geometry changed in this pass.

## Recovery evidence

`probe-under-green-reactive-counterplay.mjs` examines the retained Standard failure and a regenerated Relentless cautious arrival at offset 1.5. It takes continuous physical state at the first refused release and at the later audible attack preparation. Each state is tried after 0, 0.25 and 0.5 seconds of stationary reaction, returning on each side. Joe remains live, water time continues, and the existing counterplay pilot supplies ordinary sprint/strafe movement.

The 24 attempts contain **nine escapes and 15 captures**, all with zero water hits. The failures are retained. Their outcome is not a claim that those states are unavoidable: most failed policies survive their first attack and lose later while turning on the bank or returning.

All four responses 250 ms after the first refusal complete:

| Pressure | Return side | Seconds after response, including safe aftermath | Water hits |
| --- | --- | ---: | ---: |
| Standard | West | 20.317 | 0 |
| Standard | East | 20.033 | 0 |
| Relentless | West | 19.667 | 0 |
| Relentless | East | 19.067 | 0 |

`verify-under-green-reactive-counterplay.mjs` replays all 18,726 input frames. Mode, elapsed time, both actors' final positions and water hits match each retained attempt. There are no solid-world overlaps; maximum per-step movement stays within ordinary player sprint and Joe walking bounds. Every secured frame has the player inside, an unobstructed gate and full closure. This is evidence of specific recovery options, not universal recovery or a claim that a person can read and act within 250 ms.

## Browser and regression checks

Final browser session 90376 exited 0: **12 continuous replays and 72 views**, no page/console errors. Two successful policies and one retained failed policy are replayed at 2560×1600, 1280×720, 844×390 and 390×844. Endpoints match their source tapes. Ordinary desktop E and compact browser-touch Use exercise the current refusal. Keyboard rear glance, pause and backward retreat exercise closure commitment and cancellation; compact screenshots explicitly restore touch input mode afterward. This is not a physical-device test.

The same browser script checks the approach objective, accepted-closure caption, reminder while the release is behind the camera, pause objective, cancellation feedback, water-advice restoration, persistent queried interlock, contextual retirement when looking away and imminent-attack priority. Historical event text is cleared at the beginning of recorded recovery replays without changing either actor or simulation time; it is not used as proof of current wording.

The first browser failures were genuine priority regressions, retained as baseline artifacts. Subsequent 60/64/68-view passes preceded the added closure/cancellation checks; the final 72-view report covers the final runtime. The later harness refinement explicitly restores touch mode after keyboard rear/retreat actions so compact captures show the actual touch controls.

Existing interaction, gate/save/timing rules, keeper-counterplay and outcome regressions pass. The two earlier occupied-room recovery tapes still complete with the same 27.967/27.450-second outcomes and zero water hits. Final installed gameplay client session 18580 exited 0: playing at 11.2 seconds, lesson crossed, zero water hits and no error artifacts. Latest shot/state inspected. High-resolution refusal and closure-rear, portrait refusal/cancellation and landscape attack-priority views were inspected.

## Reproduce and limits

Use `tools/probe-under-green-reactive-counterplay.mjs` to generate the expanded study from the existing reactive-route tapes. `--closure-only` regenerates the accepted-closure fixture without rerunning that study. Run `tools/verify-under-green-reactive-counterplay.mjs` and `tools/verify-under-green-reactive-counterplay-browser.cjs` against the resulting artifacts under `output/under-green/reactive-counterplay/`.

The pilots know the map and phase contract and turn instantly toward scripted goals. They do not establish human comprehension, realistic turn ergonomics, fear or enjoyment. Preserve the original six captured reactive attempts, all 15 failed recovery policies and earlier fixed-crouch balance results. Next investigate bank reversals/return choices in the late recovery policies and the other four captured range approaches before deciding whether geometry or timing needs adjustment. Continue the broader architecture/theme, shared-consumer and device/performance requirements. No unfamiliar-player, human listening or physical-device session has occurred.
