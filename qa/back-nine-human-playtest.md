# Back Nine: later human playtest kit

Prepared, not conducted. The user explicitly deferred human testing. No participants have been contacted and no human results are claimed.

Use this protocol with the latest completed candidate, and record its version/commit. Current implementation scope and unfinished work are in `design/back-nine-experience-implementation.md`; do not describe open items as available features.

## Setup

Use a separate browser profile so the participant's normal progress is preserved. Open `http://127.0.0.1:4187/back-nine.html?playtest`. Record an anonymous participant code, browser/device, input method, viewport, headphones/speakers/mono, comfort settings and whether the renderer reports software mode. Keep audio comfortable. Do not disclose the cart-to-foot transition before the first attempt.

The optional **Run feedback** button appears only with `?playtest`, in the pause/result menu. It keeps the game paused, captures a local snapshot and opens a separate feedback page. Reports stay local. Save after each attempt and download before clearing the browser. A manual [feedback page](../web/back-nine-playtest.html) also works without a snapshot. Distinguish automated QA fixtures from participant data.

Start with five unfamiliar players and two returning players. Allow approximately 20–30 minutes each; these are scheduling suggestions, not a sample-size claim. Physical controller/touch ergonomics require the actual devices. Stop or change comfort settings whenever requested.

## A. Uncoached first attempt

Say only: “Try to escape the course. Use the instructions the game gives you.” Let the player read or skip the opening. Record help if requested; do not silently coach.

Record timestamps for first movement, first understood objective, first intentional route choice, first perceived approach, first ram, first repair decision, first deliberate dodge/concealment, each relay, cart failure, return of movement, first foot-cover choice, garage arrival, closure, death and voluntary retry. Also record pauses, wrong turns longer than 10 seconds, repeated collisions, missed prompts, visible stalls, discomfort and the player's spontaneous remarks. Use `back-nine-playtest-observations.csv` as the blank observation sheet.

After the attempt ask:

1. Where were you going, and how did you know?
2. What told you Joe was about to attack? What could you do about it?
3. Describe one route choice and whether its advantage matched your expectation.
4. What happened after you successfully escaped his view or dodged a charge?
5. If the cart failed, when did you understand the new controls and where to run?
6. Which moment do you remember most clearly? What felt unfair, unclear or tedious?
7. Would you choose to retry? Record the answer before offering another scenario.

Use the feedback page for six ratings and the participant's own words. Do not treat high completion rate alone as proof that the level is fun or frightening.

## B. Focused comparisons, after the blind attempt

Counterbalance order: half try A first, half B. Rehearsals are separate from first-attempt results.

| Decision | A | B | Observe |
|---|---|---|---|
| Route | Exposed main lane | Covered maintenance connection | Can players predict speed/cover tradeoffs? Does either dominate? |
| Repair | Leave after partial charge | Hold for the full supply | Can they read the meter, hear/see Joe, and leave promptly? |
| Evasion | Continue exposed | Commit a dodge and relocate into cover | Does earned relief feel usable and causally connected? |
| Barrier reading | Loose timber across a cut-through | Permanent iron posts, masonry and narrow gaps | Before touching them, which does the player expect to break or stop Joe? Does pushing timber for a moment feel understandable rather than like snagging? |
| Final approach | Arrive with a working cart | Arrive after a genuine destruction | Are both finishes possible, readable and satisfying? |
| Comfort | Normal settings | Reduced motion/steady beacon | Are the same hazards and routes readable? |
| Sound | Headphones/stereo | Speakers/mono or muted with captions | Can players locate/anticipate Joe without missing necessary information? |

Do not force damage in the blind run. A facilitator may use a separate clearly labelled QA mid-course scenario for rare transitions, then record that it was staged. Keep Joе's live pursuit enabled; staged invulnerability does not establish balance.

After an actual missed charge near timber, ask what changed in the world and whether it helped the next decision. Record whether the player noticed the splintering sound, fallen rails and cut turf without a banner explaining the destruction. Distinguish noticing the physical result from merely seeing a charge-missed instruction. Check the same passage with reduced motion and optional sound captions; do not disclose its behavior during the blind attempt.

## C. Technical and retry observations

Measure a separate uncaptured 10-minute run for frame timings; recording video can affect performance. Include wet lanes, foliage with mower visible, impacts, repair, ejection, on-foot charges and garage closure. Record median/p95/p99 displayed intervals, >50 ms and >100 ms stalls, resolution changes and input responsiveness. Completed-GPU timings and displayed intervals are different measures; label them correctly.

After a death, time the retry: it must start the whole level from the shed, with a fresh cart, both relays offline and fresh repair reserves. Record objective/world reset, player/Joe separation and whether the first attack is readable. This whole-level restart is the user-confirmed policy; relay progress must not persist through death. Check pause/focus loss, remapped controls, controller reconnect and touch release on their supported devices. No tester should need to replay a completed preparation or introduction unintentionally.

## Triage and exit questions

Immediately investigate unavoidable capture, blocked progression, false collision boundaries, camera obstruction, missing essential cues, save loss and severe discomfort. Investigate repeated confusion at the same junction even when all players eventually finish. Review underused routes and repairs against what players believed their costs were.

Before calling the full experience finished: all required routes and both arrival modes must pass automated completion checks; each known software hot spot must have paired evidence; essential warnings must remain readable with comfort options; human concerns should be documented with an owner and next experiment. Human testing remains a later activity until the user chooses to conduct it.

## Landmark and lighting follow-up (pass 11)

After a blind run, ask which places the player remembers and which structures helped them choose a route. Record whether the pump tower, range canopy and clubhouse clock orient them without prompting their names beforehand. Ask whether flickering service fixtures felt like atmosphere or a command to interact. Compare steady/reduced-flash mode: essential openings, relays and the garage should remain equally discoverable. These are prepared questions, not completed human findings.

## Beacon and moving-shadow follow-up (pass 12)

In a blind run, record whether the red light helps the player locate Joe before seeing his mower and whether shelter behind a windbreak feels visually consistent. Ask whether the exposed-side reveal is alarming without hiding the route. Compare steady/reduced-flash settings. Include the night-range foliage and garage approaches in the separate uncaptured performance run; current automated evidence still shows added software cost. These questions are prepared, not answered by human testers.


## Pass15 observer additions — staff records and optional sightings

Keep the first run unprompted: do not tell the player about the disappearing figure or describe the staff-card sequence beforehand. Afterward, ask what they noticed at the shelters and garage, whether any background detail changed their interpretation of the course, and whether they ever mistook background activity for an immediate attack. Record the player's words before asking about specific locations.

Observer checks for a later targeted run: compare the three/one/zero card racks and optional logs; use Q near either closed maintenance bay when Joe is distant, look forward, then glance back; record whether the figure was noticed, whether its disappearance was unsettling, and whether checking it distracted from a real attack. Observe normal and reduced-motion settings and a lower-resolution software run. A missed optional sighting is not a failed run. No human recognition, fear or frequency results have been collected yet.


## Pass16 observer additions — variation and readable failure

After the blind run, compare a from-shed retry with an explicit fresh round. Record whether the retry remains learnable and whether different opportunities on a new round feel fair. Do not tell the participant which variables changed. Geometry, damage, speed and warning duration do not randomize. A district encounter remains conditional, not guaranteed on every route/seed.

For an actual fatal mower contact, record whether the player understands the direction/cause and can follow the fall and aftermath. Compare front, rear and side contacts and reduced motion. Current frontal fall visibility is still a known limitation; a nonzero rendered-pixel count is not proof that a person can read the animation. These are prepared questions, not conducted tests.


## Pass17 follow-up — contact direction and cover

The previously known frontal fall occlusion is corrected in automated rendered checks. Observe whether front, rear and side impacts now feel distinct and physically understandable, whether arms settling after landing improve the aftermath, and whether the camera side chosen near a windbreak is comfortable. At a closed garage, distinguish the visible fall from subsequent real mower/body occlusion when the machine cannot pass the gate. These remain unconducted human observations.


## Pass20 observer additions — listening and sound descriptions

After the blind run, ask which sounds helped locate Joe and distinguish a windup from ordinary pursuit. In a separate targeted test, compare headphones, speakers and muted audio with Sound descriptions enabled; glance back while maintaining course and check whether the indicated side remains understandable. Do not reveal Joe's planned route or hidden search phase. Compare engine sound across cover and in the open, and after moving out of range. Observe whether a caption helps a decision without drawing attention away from an opening. Keep ordinary dialogue subtitles independently off for one comparison. These are prepared recognition/comfort questions, not completed human findings.


## Pass21 observer additions — maintenance footing

During a blind on-foot escape, record whether the continuous inset maintenance paths suggest the narrow fence passages without a hint. Afterward ask whether the runner's speed and footsteps match the visible ground, whether stepping off the paving feels predictable, and whether the small benefit motivates using the passage. Compare all three foot routes with normal/reduced motion and software rendering. Do not disclose the path speed before the blind attempt. These remain prepared tests, not completed human observations.

## Pass23 observer additions — first encounter and escape direction

Keep the first drive unprompted. Record when the player first notices Joe, whether the working-to-watching transition is understood without a banner, and whether the first actual attack feels earned rather than immediate. Compare slow exploration, a direct drive and a from-shed retry. Do not tell participants about cart ejection beforehand.

After a real cart failure, observe the first movement input and chosen escape direction: can the player recognize usable ground, clear the wreck and reach cover during the protection window? Do not treat an exposed head-on run toward Joe as proof of an unavoidable failure. Record catches and wrong turns, especially in the first district.

At the clubhouse, compare a moderate pace with a fast detour. Ask whether the passing approach, side, actual overtake or successful evasion is readable through sound, red light and Q glance. A missed optional encounter is valid; do not force it. The new automated route mix has more cart finishes than the previous opening, so later human sessions should assess whether the final stretch still feels desperate without requiring destruction. These are prepared questions, not conducted tests.

## Pass25 observer follow-up — opening staff bay

The fresh west bay now starts occupied before gameplay rather than waiting for an unseen staging opportunity during pursuit. Keep the first run blind. Afterward ask whether any parked-cart detail was noticed; do not name or explain the figure beforehand. For a later targeted comparison, approach the west bay with ordinary steering while Joe is still distant, brake before the boundary, glance away with Q and return. Compare normal/reduced motion and software rendering. Observe whether looking distracts from real mower warnings and whether the empty seat is unsettling. Do not confuse a pixel-difference test with evidence of human recognition. Record frame consistency during the occupied view separately; its software rendering cost is still open. These tests remain prepared for later.


## Pass26 follow-up — controller response and natural endings

Use a physical controller for the later ergonomics session. Check for neutral drift, adjust the controller stick deadzone in Back Nine's comfort menu, and compare small steering corrections, full turns, forward running and reversing. Observe whether entering/exiting the deadzone feels continuous and whether look-back remains usable while turning. Automated axis injection verifies response and persistence, not stick feel or hardware drift.

Keep cart failure undisclosed on the blind run. The latest normal-input route audit includes both intact-cart finishes and a genuine late destruction followed by on-foot escape. Ask whether the changed controls become understandable in time and whether reaching the garage feels earned. Do not present those automated outcomes as a predicted win rate or coach participants toward destruction. Side-route entrances still need unprompted recognition feedback.


## Pass27 follow-up — awkward crashes and camera recovery

After the blind run, use a separate clearly labelled garage-approach scenario to observe an angled cart destruction beside the wall and bollards. Can the player follow the fall, understand when control returns and choose the route around their wreck? Compare normal and reduced-motion settings. Record whether the brief body-focused camera transition feels comfortable, particularly when a nearby wall forces a tighter view. Keep Joe active and preserve the ordinary escape window. These are prepared observations, not completed human tests.

### Junction recognition follow-up (pass28)

On a first run with explicit route guidance off, observe whether players notice the maintenance alternative before reaching each fork. New flush stone edges mark only entrances/reconnections, with no added lights or arrows. Ask which lane they thought was faster, which offered protection, and whether they mistook the stone edge for an obstacle. Include reservoir, range service, dry-range perimeter and clubhouse forks on a smaller display. Technical path clearance and successful scripted runs are already checked; do not explain the route before observing the player's choice.

### Caption parity and readable dialogue (pass29)

Repeat one quiet-route and one continuous-pursuit session with both Dialogue subtitles and Sound descriptions enabled. Check that occasional Joe lines can appear alongside steady machine descriptions, that attack/impact cues interrupt them, and that a line never flashes too briefly to read. Brief tactical-choice gaps now remain silent; an intense route may contain no optional taunts. Record whether that silence feels appropriate and whether quieter runs provide enough character. Test enlarged captions separately on a small portrait display: HUD overlap is checked technically, but the amount of playfield covered needs human comfort feedback.


### Historical shared shelter reserve (pass31; currently disabled)

Do not run this scenario on the current build: bells and utility choices were removed by a separate edit. Keep it as historical evidence until the player-choice mechanism is reconciled. Whole-level retries now reset the attempt.

After the blind attempt, compare the central repair bay with the left bell pad at each shelter. Both spend the same one-use reserve; partial repair commits it, while the alarm requires stopping, releasing Use and deliberately holding again. Do not explain this before the blind attempt. Record whether the player noticed the floor symbols and understood the cost before choosing, whether the one-second checkpoint notice left enough reading time, and whether the seven-second diversion provided a useful departure without feeling like immunity. Ask why they chose health or separation.

Try a second run with the opposite choice and a from-shed retry. Record whether the exhausted reserve remains understandable across retry. Observe a real on-foot arrival separately, without revealing that possibility in the first-run instructions. Test captions, controller remaps and reduced motion. Compare damage taken and opportunities used, not completion time alone. The automated examples (first alarm:100% cart finish; first repair/second alarm:42% cart finish) are fixtures, not player balance results. No human sessions have been conducted.


### Chase buildup and silence (pass32)

Observe whether the short engine buildup is recognizable before the next pressure wave and whether the lowered music helps. Confirm that an existing charge, post-impact retreat and earned escape window still feel distinct. Record any taunt too brief to read, and what interrupted it. Compare a quiet route with sustained pursuit; the latter may contain no optional lines. Do not infer ideal suspense or dialogue frequency from automated priority checks.


### Local course machinery and whole-level retries (pass34)

After the blind run, ask which sounds helped identify places or judge Joe's position. Then compare a nearby irrigation cabinet, shelter charger and powered garage circuit. Can the player tell those quiet world sounds from the mower? With ordinary sound descriptions off, can they locate the source from both forward and rear-glance views? Do not name the source before the first answer. Repeat with optional descriptions and mono/headphone/speaker setups; note missed danger cues or excessive repetition. Compare the garage's inner and outer wall sides, pause/mute, and the ambience slider without asking for a new download or restart. Automated stereo/attenuation checks do not establish human recognition.

After a death near each relay, retry through the real menu and record willingness to replay the level, time until fresh movement, reset clarity and whether losing relay progress feels fair. Verify no mandatory cutscene replay or asset-loading stall. The intended policy is a full restart from the shed, not a relay checkpoint. Preserve the chosen course seed on Retry; compare an explicit fresh round separately.

### Manual shortcut gates and retry reset (pass36)

During the blind run, observe whether players notice the three gates, understand the nearby hold instruction and judge when stopping is safe. Do not disclose the later on-foot transition. Afterward compare opening a gate after a missed charge with immediately taking its bypass. Record damage, usable separation, hesitation and whether the opening direction reads clearly. A gate is a situational choice, not a guaranteed faster route. Repeat from both sides and with reduced motion; confirm an obstructed gate waiting feels understandable. Test on foot only after the blind run has revealed cart failure.

After a death, confirm that Retry starts at the shed with fresh cart, offline relays, fresh service reserves and closed gates, without replaying the introduction. Ask whether that reset and retaining the same course seed support learning. Automated tests verify the reset; no human sessions have been conducted.
### Running on hills (pass37)

After the blind run, compare forward running, reversing, stopping and turning across the reservoir slope and range mound, then a level maintenance passage. Observe whether feet feel connected to the ground and the torso remains natural. Compare normal and reduced motion. Ask about perceived skating, foot clipping, knee snaps or awkward recovery after cart failure. Geometry checks cover the authored routes; these human motion/comfort observations remain unperformed.