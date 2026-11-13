# Rough Cut: later human playtest

Status: **prepared, not conducted**. No participants have been recruited or results recorded. The user chose to prepare these tests for later.

## Set up

Serve `web/` with the project's local server, then open the game in a browser. Use the local November 7 gameplay-intelligence candidate. The current session sequence is in [quality-reset-playtest.md](quality-reset-playtest.md). Public deployment is a separate action.

Use five initial players, preferably a mix of newcomers and returning players. Allow about 20 minutes per initial session, with an optional return session on another day. Record an anonymous participant code, browser, device, headphones/speakers, and input method. Do not clear someone's existing progress: use a fresh browser profile for a newcomer run.

From the menu or Pause, open **Field journal & playtest → Comfort & test guide**. Players can compare Standard, Calm, and Fixed View and audition left/center/right reference tones. Keep volume comfortable. Reference tones only check channel direction and relative level; listen to actual game ambience, mower, footsteps, clues, and chase cues during play.

## Session A: uncoached first attempt

1. Ask the player to escape. Do not explain the quiet/loud choice, rewards, or recommended routes first.
2. Observe a full attempt. Record confusion longer than 10 seconds, prompts they miss, unexpected captures, rewarding moments, and waits they describe as boring. Help only if they ask or cannot progress; record the help.
3. After the attempt, ask what they think attracted Joe and what stopped him seeing them. Ask whether they noticed the quiet log, ball/blackout reward, two release retreats, pennants, and field notes.
4. Offer a voluntary retry without urging them. Record their answer and reason before suggesting a test scenario.
5. In **Run feedback**, record ratings and the player's own explanation. Save locally, then download reports plus the current run before another run replaces the current evidence.

## Session B: compare choices

Use short rehearsals to compare the options if a full run would take too long. Keep rehearsal observations separate from first-run outcomes. Counterbalance the order: participants 1/3/5 try A first; 2/4 try B first.

| Comparison | A | B | Observe and ask |
| --- | --- | --- | --- |
| Field Log | Stand + Use: immediate, loud stamp | Crouch unseen + Use: stay still 1.6s | Was the cost understood? Did loud filing deliberately draw Joe away, or did quiet always feel preferable? |
| Optional review | Stand + Use: ball/reserve | Crouch + Use: arm 18s blackout | Did they notice the bell cost? Did the saved charge trigger on a useful crossing? Would they choose differently next time? |
| Release Review | Stand + Use: Range Cart retreat | Crouch + Use: Release Hedge retreat | Could they predict and reach the selected cover? Was the route toward an exit understandable? |
| Night Range | Standard steady lights / Eastern dim west | Closing Shift slowly trades bright sides | Did lighting change their route or timing without feeling arbitrary? |
| Movement | Standard View | Calm or Fixed View | Compare walking, turning, aiming, and a chase. Ask about control, dizziness, and fatigue; stop if uncomfortable. |

The clean break is a bonus: a missed retreat does not revoke a completed field check. A golf-ball lure at least 5.6 scene meters (35 internal course units) from the final station now permits a silent signature while Joe investigates it, provided more than .75 seconds remain and the player is unseen. The lure keeps its original lifetime. Compare this with the loud cart/hedge retreat after the uncoached attempt.

## November 7 encounter checks

After the uncoached attempt, observe whether players can distinguish Joe turning toward a sound, inspecting it, searching and pursuing. Ask what each visible response means before explaining it.

During a close encounter, observe whether the .65-second warning gives enough time to act without making Joe feel harmless. The player must move away; standing in reach still loses. The opportunity resets only after eight continuous seconds safely disengaged. Record missed warnings and repeated-contact attempts, especially with touch input. This timing remains a playtest hypothesis.

Ask players to identify the course edge before touching it, then walk alongside the rope. Record any segment that looks passable but is blocked, or any obscured exit approach. Ask whether the danger status/direction and single instruction were understandable while moving. Repeat with threat captions off only if the participant normally prefers audio cues.

## Targeted observation checklist

- **Joe reaction:** Did the player see Joe reach the evidence, stop, and inspect it? Did they connect the response to their own action without relying on the text confirmation?
- **Final encounter:** Did they read the exact stillness duration and risk preview before filing? If captured, can they explain a counterplay they would try? Was a retry attractive?
- **Landmarks and discovery:** With Route Thread temporarily disabled, can they recognize at least two areas from pennants/props? Listening Focus and map remain available. Ask which note or visual they remember without prompting a particular answer.
- **Audio:** Can they locate the mower left/right, distinguish a meaningful cue from ambience, and hear warnings at their preferred volume? Test actual speakers/headphones, not only automated browser audio.
- **Physical input:** Use a real controller or touchscreen where relevant. Synthetic controller/touch tests do not establish ergonomics, latency, or comfort.
- **Performance:** Record visible stutters, device/browser, scene, and time. Do a 10-minute return session on target hardware before making sustained frame-pacing claims.

## Evidence and interpretation

Reports remain in `rough-cut.playtests.v1` in local browser storage (latest 20); the download includes those saved reports and the current run. The form captures fun, clarity, tension, comfort, replay intent, device, choice rationale, and open comments. The run includes ruleset, variant/pressure evidence, station and reward choices, quiet cancellations, blackout triggers and movement time, inspections, discoveries, final-filing starts, and outcome. Movement during a blackout is only a proxy for usefulness; it does not establish that the blackout helped the player.

Check that imported files are actual participant reports. Acceptance tests create files explicitly labelled **QA fixture only — no human participant**; exclude these from human results. Rehearsals are marked and must not be counted as fresh successful escapes.

Use the following as decision prompts, not statistical proof from five people:

- If two players miss the same choice or misunderstand the same capture, revise the explanation or presentation and retest it.
- If one option is consistently ignored even after it is understood, examine its situational payoff before changing numerical balance.
- If players cannot identify two landmarks, strengthen the silhouette/composition where they became lost.
- Address any reproducible discomfort or audio intelligibility issue on the affected device before calling that device qualified.
- Compare voluntary retry and next-day return reasons. Do not upgrade the editorial fun/replay grades solely because feature checks pass.

## Blank results log

For physical objective wayfinding, ask a new player to reach the Audit Bell with the map closed after reading the briefing. Record whether the numbered direction board and station board are noticed, whether the turn is clear, and where they hesitate. After completing a check, ask what the muted checkmark/FILED sign means. Repeat at the Field Log, Release Review and one access mechanism; compare ordinary and small landscape displays. Human observations remain pending.

For the opening briefing, let a new player read without coaching. Before they confirm, ask them to name the first stop, the three required checks and one escape route. During the opening minute, record whether they follow the lantern path and understand that practice chipping is optional. Record reading time and any skipped/misunderstood step; do not infer comprehension from a successful button press.

For the optional tool map, ask the player to locate a circuit switch or cart timer using the letter markers. Before activating it, ask what its noise and timing will do. Afterward, check whether ready, countdown, ringing and spent states are clear, and whether the panel makes exit planning easier. Repeat on a small landscape screen. These observations are prepared for later; automated layout checks are not player feedback.

| Participant code | New/returning | Device/input/audio | Variant/pressure | Outcome/help | Fun/clarity/tension/comfort | Choice rationale | Voluntary retry | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pending | | | | | | | | |

No human findings are asserted in this document.

## Suspense encounter study — prepared 2026-11-08

After an uncoached run, try these in a second run. Record observations rather than explaining the intended reaction first.

- Find a brass cart timer near the service maze or release area. Explain the four-second delay before winding it, leave, and observe where Joe goes. Try one quiet release using the timer instead of a ball. The bell rings for six seconds; Joe can ignore it during stronger contact, and a wholly ignored timer can be wound again. Check the countdown and whether its response is understandable. Was the mechanism discoverable, and was the tradeoff clear?
- Compare ringing the bell, stamping quietly, stamping loudly and signing under diversion. After reaching safety, listen and revisit one station. Did its altered paperwork/tracks or delayed sound create suspense without suggesting an incorrect route or Joe location? Record if no sound occurred; fast or unsafe runs can suppress it.
- Settle behind hard cover while crouched and unseen. Does the short breathing window offer useful planning time? Is its expiry understandable? Returning to the same cover must not imply renewed protection.
- Describe a watcher's, stalker's and rusher's warning pose without consulting the note, then read the clubhouse field note. Try stepping aside or using cover. Record whether recognition helps decisions without making every encounter predictable.
- Escape through the route prepared earlier. Note the beacon, final approach and ability to cancel/retry filing. After a close escape or capture beside a timer, explain what happened and what you would change on retry.

Record fun, tension, clarity and comfort separately. Check audio on the intended speakers/headphones and Reduced Motion/zero decorative density. Human results remain pending; automated victories do not establish that the new pacing is fun.

## Fundamentals rebuild study addendum

After the uncoached novice run, use **Comfort & test guide → Movement practice** for 2–3 minutes. Walk, strafe, reverse, circle the corner, cross the gap, sprint, crouch and Use the gold marker. Ask whether the world stays planted and whether stopping/turning feels precise. Record baseline versus rebuilt version separately when comparing builds. There is no simulated ramp; the current course has no elevation traversal.

Then try **Bell encounter**: inspect the space, place a deliberate ball lure, ring the bell and make a clean break into the indicated cover. It is a separate rehearsal, not a full-run win. Record completion time, number of corrections, perceived cause of Joe's reaction and whether the player can explain the recovery. The 60–90 second target is a study hypothesis, not a measured result.

Try the visible quiet/loud and cart/hedge choices without first explaining posture shortcuts. Keyboard uses 1/2; controller uses RB to switch and A to confirm; touch uses the two buttons. Check that quiet filing releases its temporary crouch afterwards. On the expanded map, select a preferred exit and explain its access requirement.

Compare the default steady camera with optional bob, lean and shake independently. Test slow diagonal controller input and simultaneous two-finger movement/look on physical devices. Measure real presentation over at least 10 minutes on each named target device; the shared headless host is not a shipping performance qualification.


## Perspective comparison (prepared; no results yet)

Use two separate browser tabs/profiles, the default local URL and the same URL with `?renderer=legacy`. Keep input device and base sensitivity fixed. In Movement practice, circle the hedge corner, approach the cart from both sides, pass through the gap, stop, reverse, crouch and turn 180 degrees. Try the same Bell encounter in both views. Counterbalance presentation order. Do not infer preference from task success.

In the new view, compare Immediate response against the optional short start ramp, with the same FOV. Record overshoot, correction count, unexpected wall contact, discomfort, and which version the player chooses. Report all five ratings (visuals, movement, navigation, feedback, fun) separately, with a concrete reason. With guidance hidden, ask them to point to the next objective and identify the water crossing, clubhouse or night range from scenery.

Test mouse, a physical controller and a physical touchscreen as separate sessions. Confirm vertical look, simultaneous movement/look, chip release/cancel, choices and retry. Test quiet/loud stamps and actual stereo/mono cues with the preferred output device. Use at least a 10-minute run on each named target device; record renderer resolution, FOV, median/p95/p99 displayed-frame intervals, thermal changes and stalls. Synthetic DOM events and recorded videos cannot establish physical input-to-display latency.

The automated recordings under `output/perspective/realtime/` include fixture positions and scripted input. They are engineering comparisons, not human trial recordings. Keep the optional video-recording benchmark separate from unrecorded pacing results.


## Additional checks for smarter Joe and decision feedback

- Move laterally in clear sight, then break sight behind a hedge and quietly change direction. Record whether Joe's anticipation feels readable and his search can be escaped. Verify he physically walks when changing patrol routes.
- Lure him around a cart and through a hedge opening. Watch for corner oscillation, clipping, implausible shortcuts or overly easy loops; record the location and route.
- Open the map before and after collecting the key/opening the valve. Ask the player to explain the two exit tradeoffs and choose one. Chip onto grass, sand and water and ask what the preview predicts.
- After a win, ask whether the coaching matches the tactic used and makes a voluntary second attempt more appealing.
- On target hardware, approach/retreat from Joe across 11–14 m, turn quickly, and circle nearby scenery. Record noticeable geometry changes, stalls, texture shimmer and input delay. Record the GPU/backend; forced software rendering is a separate performance case, not evidence about the physical device's GPU path.

## Haunted-course pacing and finale (prepared 2026-11-08)

- Without explaining the rules first, ask what changes when a tilted-head ghost is watched, a stooped ghost is approached and stopped beside, or a rushing ghost appears to retreat. Then read Lost and Found and try each counterplay. Record comprehension, surprise and whether the behavior feels fair.
- Compare the hush before a sighting, the encounter and the 14–20-second breathing interval. Ask whether anticipation builds or the course feels empty. Do not compensate for a low scare rating by simply increasing frequency.
- Visit water, clubhouse, dead green and night range in both directions. Ask players to identify the location from scenery; check smooth palette transitions and readable footing at their normal display brightness.
- Complete each exit with the final approach enabled. Confirm the steady gold beacon is understood, the release-desk sound directs attention to the correct place, and filing can be canceled/retried. A live chase or player lure must take priority; missing the optional closing-round inspection is valid.
- Compare headphones and speakers, Reduced Motion and normal presentation. Record suspense, clarity, discomfort and desire to replay separately. These checks are prepared for later; no human results have been collected.

## Local circuit choices (prepared 2026-11-08)

- Find the pond and range switches without a walkthrough. Before pressing Use, explain the duration and noise tradeoff. Try staying in the lit route, taking cover and cutting power on separate runs.
- After a cut, leave the switch and cross quietly. Judge whether the remaining-time cue and returning lights feel fair. Check that the regular path lanterns still orient the player.
- Complete a station, back away while watching it, then look away and return. Ask whether the changed paperwork/tracks are noticed and feel connected to the action. They must not visibly pop in during observation.
- Repeat with a remapped interaction key and Reduced Motion. Record readability and decision value separately from fright; no human results have been collected yet.

## Exit readiness observation (November 8)

After Release Review, ask players to locate the shed and drain without coaching. Ask what each exit still needs, then compare checks-only, access-only and ready states. Observe whether they understand Use then stay still, and that moving cancels filing without losing checks. Confirm READY is understood as usable, not safe from Joe. Full fixture/state notes: [exit-cues-2026-11-08.md](exit-cues-2026-11-08.md). Prepared only; no human results recorded.

## Station identity observation (November 8)

Ask players to distinguish the required Audit Bell, optional supply lockers and shot-only practice gong without coaching. Check whether COMPLETE/CLOSED/CLAIMED states prevent repeated attempts. Observe whether the ground ring and binding-aware chip instructions explain the practice task. Compare new and already-learned profiles. Prepared only; see [station-identity-2026-11-08.md](station-identity-2026-11-08.md).

## Ghost scheduling observation (November 8)

During a normal run, record gaps between visible ghosts and whether aiming, map use or background scares repeatedly prevent sightings. Check that real Joe chases and post-chase recovery stay clear. Note whether the 1.2-second warning feels readable before the ghost appears. Prepared only; see [ghost-scheduling-2026-11-08.md](ghost-scheduling-2026-11-08.md).

## Environmental navigation comparison (November 8)

Prepared, not conducted: use the current environmental-guidance build and follow [the discovery checklist](environment-guidance-2026-11-08.md#later-human-playtest-prepared-not-conducted). Start with Clear navigation off, record uncoached discovery and exit-readiness comprehension, then compare with the option enabled from Controls & comfort.
