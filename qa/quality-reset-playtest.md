# Quality reset: sessions prepared for later

Status: prepared, not conducted. The user explicitly deferred human testing. No testers were contacted, no participant findings are claimed, and no approval is being requested now.

Use a separate fresh browser profile for novice sessions; preserve the player's normal saves. Open the local candidate and record anonymous ID, build/ruleset, device/OS/browser, viewport, scene resolution, FOV, input device and audio output. Export the in-game feedback report after each attempt. Automated reports labelled QA fixture are not participant data.

## A — Uncoached novice, about 15 minutes

Ask only: “Try to escape the course.” Do this before any practice or explanation. Record the first movement, first actual look at Joe, first intentional lure, first route choice, first check, capture and voluntary retry. Log wrong turns lasting >10 seconds, camera corrections, collisions the art did not predict, and help given. Never count a tutorial acknowledgement as a demonstrated skill.

After the attempt ask: What attracted Joe? What stopped him seeing you? Where were you trying to go? What felt satisfying or frustrating? Rate visuals, movement, navigation, feedback and fun separately, with a concrete example for each. Offer a retry neutrally and record the reason for accepting or declining.

## B — Returning player and choices, about 15 minutes

After session A, use Movement practice and Bell encounter. Compare the same short route in the saved before/after builds, counterbalancing order. Keep device, resolution and sensitivity fixed. The controls expose the immediate default and optional 80 ms start comparison; record overshoot/corrections, not just completion.

Try quiet versus loud Field Log, ball versus armed blackout, cart versus hedge retreat and shed versus drain. Ask the player to predict each cost before acting. Record whether the predicted advantage occurred, forced waiting, empty travel, longest confusing segment, relief after a chase and the next plan they want to attempt. Optional discoveries should not feel required to escape.

## C — Physical controller and touchscreen, about 10 minutes each

Use actual hardware, separate from mouse results. Test slow diagonal movement, fine aim, a 180° turn, simultaneous movement/look, stance changes beside cover, focus loss, release/cancel, nearby target selection, map, quiet hold cancellation and retry. On touch test two fingers and the left/right thumb zones in landscape. On controller test a real dead zone and reconnect. Record hand fatigue and discomfort; stop if requested. Synthetic event tests do not establish ergonomics or physical input latency.

## D — Sound and sustained pacing, about 10 minutes each output/device

On actual headphones, then speakers/mono if relevant, locate the mower with eyes away from the HUD. Turn 180°, move behind solid cover, trigger a nearby and distant grass/sand/water/metal hit, hear a bell investigation and a chase/recovery. Compare actual gameplay cues; left/right audition tones are only a channel check. Record masking, startling peaks, repetitive lines, misleading direction and caption usefulness at comfortable volume.

Record a ten-minute unrecorded timing run separately from video capture: device, browser, GPU, resolution, median/p95/p99 displayed intervals, >50 ms stalls and scene/time. Initial target remains median near 16.7 ms, p95 ≤20 ms, p99 ≤33.3 ms. A software-rendered shared-host run does not qualify the player's device.

## Blank record

| ID/session | Device/input/audio/build | Wrong turns/corrections | Capture explanation | Best/worst moment | Five ratings with reasons | Voluntary retry/next plan | Timing/discomfort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pending | | | | | | | |

Keep engineering pass/fail, editorial visual review, measured pacing and player acceptance separate. Reopen an outcome when a player reports the same problem, even if its regression tests pass. Two similar misunderstandings should drive a revision, not another tutorial panel by default.
