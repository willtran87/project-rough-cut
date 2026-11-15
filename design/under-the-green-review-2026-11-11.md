Under the Green — comprehensive review, November 11, 2026

The chapter has a workable movement and water foundation, but its most important remaining problem is sustained tension. Current geometry lets an informed player leave Joe behind even without sprinting. Several correctness defects also undermine the timing and checkpoint rules.

This review is based on the current source, targeted browser probes at 2560×1600 and 390×844, existing desktop/landscape captures, and three new deterministic route experiments. The experiments use ordinary simulation movement but a phase-aware path planner with complete map knowledge; they are stress tests, not human completion times. Audio observations below come from implementation inspection, not a headphone listening session. No runtime gameplay files were changed for this review.

P1 means fix or validate before expanding/polishing the chapter; P2 means the next quality pass; P3 means supporting maintenance. Evidence is labelled so reproduced defects are not confused with design proposals.

The measured full walking route took 71.35 seconds, never put active Joe closer than 17.21 metres, produced no attacks, and ended with 118.50 metres of separation. The sprint route took 46.68 seconds and ended 159.02 metres away. The walking route spent about 45.13 seconds beyond the 28-metre pursuit-caption range. These results argue for revisiting route structure and encounter geometry, while retaining the player’s ability to earn an escape.

Preserve Level 1 movement, non-inverted mouse look, ordinary movement-based crossings, the shared physical water rules, readable attack preparation, dry recovery routes, and the absence of hidden enemy catch-up. Those are good foundations.


1. **Rebuild the sustained pursuit — P1; Gameplay; Measured.**

   A scripted walking route completed in 71.35 s with a minimum active-Joe gap of 17.21 m, no attacks, and a 118.50 m final gap. Sprinting finished in 46.68 s with Joe 159.02 m away.

   Improvement: Compact and fold the route around the same physical pursuit space. Use visible connected maintenance shortcuts and water decisions to sustain contact. Preserve Level 1 speeds and allow genuinely earned escapes; do not add hidden catch-up.

   Acceptance: Compare threat exposure and choices across walk, sprint, cautious and first-time runs. The main encounters must still offer decisions after competent play.

2. **Require the player to be safely inside before victory — P1; Correctness; Reproduced.**

   Starting closure at y=216.1 then retreating produced complete at y=214.3248, outside the gate at y=215.

   Improvement: Validate the player side throughout closure and at completion. Cancel or otherwise resolve an abandoned closure honestly. Do not freeze Joe merely because the gate is half closed when both actors are outside.

   Acceptance: Test retreat, reversal, pause, reload, collision overlap and Joe crossing the threshold during closure. No victory with the player outside.

3. **Save the operated bypass immediately — P1; Persistence; Reproduced.**

   Operating the lever at checkpoint 1 sets bypass=true, but snapshot omits that flag. Reload reconstructs checkpoint 1 with bypass=false, despite the save note promising retention.

   Improvement: Persist irreversible mechanism progress explicitly and restore a coherent water state. Keep version migration safe for existing saves.

   Acceptance: Operate the lever, then die or reload before checkpoint 2; the bypass remains operated and the onward channel remains drained.

4. **Fix the bypass warning countdown — P1; Water UI; Reproduced.**

   The return channel displayed SURGE IN 99.0s when its real warning had 1.0 s remaining. waterState lacks safeFor for this branch and the HUD falls back to 99.

   Improvement: Give every water state a complete timing contract. Treat a permanently drained channel separately from a timed warning; never substitute an invented duration.

   Acceptance: All displayed countdowns agree with simulated danger transitions, including immediately after the lever is used.

5. **Base crossing advice on the player’s actual situation — P1; Water UI; Reproduced.**

   At y=48 the HUD said CROSS · 4.5s WINDOW for the spillway. Walking to its far clearance line takes about 5.29 s. Current advice only considers channel depth.

   Improvement: Account for approach distance, current stance/speed, remaining distance if already crossing and a reaction reserve. Use APPROACH, WAIT, CROSS and CLEAR THE CHANNEL distinctly.

   Acceptance: Sweep approach distances, walk/run/crouch speeds and all phases. A walking recommendation never requires an unannounced sprint.

6. **Show the player’s actual bindings — P1; Controls; Reproduced.**

   With Use remapped to T, the prompt still said E; E failed and T worked. Rear-glance and movement hints are also hardcoded.

   Improvement: Generate prompts, guidance and gamepad glyphs from the binding resolver used by input.

   Acceptance: Every remappable action is correctly named in prompts, briefing, pause and contextual coaching.

7. **Prevent an unexplained trip to an unusable exit — P1; Progression; Reproduced.**

   A scripted route skipped the lever, used the dry pump route, reached y=218.97, and found no gate action. The mandatory requirement is discovered far beyond the pump.

   Improvement: Make the pump change visibly necessary to onward progression, or establish the unmet requirement before leaving the pump room. Retain an obvious recovery route.

   Acceptance: An unfamiliar player can explain the pump’s purpose before entering the final range. Missing it never produces a surprise return trip of roughly 80+ m.

8. **Anchor the sluice action to its visible control — P1; Interactions; Reproduced / source.**

   Use appears at x=-3.5,y=219 although the visible console is about 6.15 m away. The interaction uses a radius around EXIT, not the console.

   Improvement: Use the actual control position, a reasonable reach, facing and obstruction checks. Keep the interaction responsive when approached from valid angles.

   Acceptance: The prompt belongs to the visible control and cannot be activated across the room or through cover.

9. **Give each major space a different decision — P1; Encounter design; Observed / proposal.**

   Most pressured channels repeat the same straight crossing, signal and optional rectangular loop. Changing the sign does little to change the player’s task.

   Improvement: Keep five clear beats: protected lesson; first water-versus-detour decision; an earned barrier with Joe visible across it; pump reversal; alternating crossings and closure. Merge any room that adds no new decision.

   Acceptance: Playtesters can describe what was different about each encounter without referring to its sign.

10. **Make wet and dry routes genuine alternatives — P1; Route balance; Measured / proposal.**

   The tested walking completion required only about 0.15 s without a movement target and no water hits; the route used phase-aware pathfinding and the dry range perimeter. This is not proof of human route preference, but it exposes an easy low-pressure solution.

   Improvement: Compare actual travel time, information and exposure for each branch across arrival phases. Preserve dry routes as recoveries while giving timely wet crossings a clear advantage.

   Acceptance: Neither branch dominates across all plausible arrival phases and Joe distances. Record real player choices before further tuning.

11. **Stage Joe’s arrival where the player can notice it — P1; Staging; Observed.**

   The entrance triggers after player y>36 while Joe descends at x=-5,y=35, behind the default forward view. A current capture shows him floating beside the ladder with the trimmer intersecting it.

   Improvement: Trigger a visible hatch movement and directional sound before the player passes the reveal. Use an authored descent/landing or a simpler physically credible doorway entrance. Keep camera control with the player.

   Acceptance: A first-time player notices his arrival without being told to turn around; his body, hands and tool clear the entrance geometry.

12. **Make the pump reversal an observable payoff — P1; Set piece; Source / proposal.**

   The bypass boolean drains the onward channel immediately and activates return flow after a warning. The lever and pipe layout do not yet stage a strong before/after moment with Joe.

   Improvement: Animate a short readable mechanical transition and compose the forward drain and rear return in the player’s sightlines. Let the earned barrier visibly inconvenience Joe where his actual position permits.

   Acceptance: The player can explain what changed and sees or hears the benefit without a text explanation or enemy relocation.

13. **Build a climax that combines learned skills — P1; Climax; Observed / proposal.**

   The long dry perimeter can bypass both alternating range channels, and the earlier lead often removes Joe from the final decision.

   Improvement: Rework the range around a legible central island and visible next outlet. Keep a recovery route, but make its time/position tradeoff meaningful within the physically sustained pursuit.

   Acceptance: Both ordinary and cautious arrivals produce a readable final decision, while skilled players can still earn a clean escape.

14. **Let the player experience the escape before the result panel — P1; Ending; Observed.**

   Completion immediately replaces the scene with a modal. Applause and Joe at the barrier are described in text rather than delivered as a playable aftermath.

   Improvement: After secure closure, allow a short safe walk and a voluntary final glance at Joe. Add the actual machinery tail-off and distant applause cue before presenting results.

   Acceptance: The player sees the secured boundary and experiences relief; success remains permanent and no surprise post-victory attack occurs.

15. **Turn surge displacement into readable motion — P1; Recovery; Source / proposal.**

   hurtWater sweeps to the recovery landing within one simulation step. That prevents passing through walls, but the camera can jump several metres instantly. Visible jets travel across the corridor while displacement is along it.

   Improvement: Animate a short bounded shove along a visibly supported flow into a clear catch landing. Preserve steering and ensure recovery cannot place the player inside an already active strike.

   Acceptance: Review first-mistake recoveries from both banks, near cover and near Joe at normal speed and reduced motion. The displacement direction is understandable.

16. **Redistribute checkpoints and breathing spaces — P2; Pacing; Source / proposal.**

   Checkpoint 1 is at y=47, checkpoint 2 at y=157 and checkpoint 3 at y=171: a long middle replay followed by two checkpoints only 14 m apart.

   Improvement: Align checkpoints with learned encounters and irreversible progress. Add a brief readable refuge after the pump instead of clustering save triggers in a short connector.

   Acceptance: A failure retries the relevant challenge without replaying a solved long section or restoring an unfair phase/threat combination.

17. **Give the groundskeeper record a stronger location and reward — P2; Optional reward; Observed / proposal.**

   The optional record is a small stand beside the bunker and exposes text in Pause. Its discovery and contribution to the future finale are easy to miss.

   Improvement: Place it in a recognizable maintenance recess, show a concise acquisition cue and surface recovered evidence in the chapter result. Keep reading safe and optional.

   Acceptance: Players who notice it can choose the detour knowingly, read later, and recognize its relevance to the saturated turf finale setup.

18. **Attach the hedge trimmer to credible hand poses — P2; Animation; Observed / source.**

   The tool is a separate child of Joe’s root, while a reused PushWalk clip drives his body. Windup/sweep moves the tool independently of the hands.

   Improvement: Author carry, idle, prepare, sweep and recovery poses; attach the tool to the hand rig or a shared grip constraint.

   Acceptance: Hands remain on the grips through locomotion and attack; the visible blade and simulated strike describe the same action.

19. **Ground Joe’s locomotion and turns — P2; Animation; Source / proposal.**

   Movement follows the path-segment angle immediately while visible yaw turns at a limited rate. The animation is advanced from distance, without dedicated turn or stop poses.

   Improvement: Blend planted turns, deliberate steps and stops; tune stride length against distance travelled. Give waiting and searching distinct posture.

   Acceptance: No obvious skating, sideways sliding, abrupt pose changes or foot penetration at corners and water banks.

20. **Validate the entire attack presentation against the hit region — P2; Combat; Source / validation gap.**

   Existing tests prove selected hits, dodges and cover cases. They do not establish full hand/blade alignment or fair perception on every device and geometry edge.

   Improvement: Visualize the collision sweep during QA and compare it to the animated blade plus player-body clearance. Preserve committed aim and visible recovery.

   Acceptance: Mouse, controller and touch players can recognize preparation and dodge; no hidden reach, retargeted sweep or hits through cover.

21. **Make perception and search behavior understandable — P2; AI; Source / proposal.**

   Sight currently uses distance and line of sight without a facing cone. After inspecting the last point, Joe searches toward x=0,y+8. That can read as robotic or oddly omnidirectional.

   Improvement: Define his perception rules explicitly and use connected inspection points with visible head/body reactions. Tune hearing and obscured searches rather than reading the hidden player.

   Acceptance: The player can understand why Joe found or lost them, and hiding changes the situation predictably.

22. **Make pursuit captions state what is actually happening — P2; Threat feedback; Source.**

   GETTING CLOSER is selected by distance alone; FOLLOWING can appear while Joe is searching. water-wait also represents an empty route, not exclusively a water obstruction.

   Improvement: Use movement trend, perception and an explicit wait reason. Prioritize imminent attacks over tutorial or checkpoint text.

   Acceptance: Captions distinguish approaching, searching, stopped by water and attacking without revealing information unavailable through the scene or sound.

23. **Extend clipping review to dynamic actors and close-up interactions — P2; Collision; Observed / validation gap.**

   The earlier 1,230-position test checks six short rays against batched static meshes at two eye heights. It excludes Joe, tool motion, ladder interaction and much of the dynamic scene; the entrance still shows intersection.

   Improvement: Add dynamic clearance sweeps and close-up walkthroughs for entrances, attacks, controls, gates and maximum camera pitch/FOV.

   Acceptance: No visible actor/tool intersections at authored moments; document sampled coverage instead of treating static samples as proof of all-space clearance.

24. **Finish roof transitions and structural connections — P2; Architecture; Observed.**

   Current entrance views expose large blue voids and abrupt ceiling/wall cutouts. Pipe ends, hanging roots and some fixtures lack convincing connections.

   Improvement: Build complete portal frames, roof reveals, visible shaft walls and purposeful openings to the course. Connect pipes, brackets and roots to believable surfaces.

   Acceptance: Looking up, sideways and backward reads as a continuous built space rather than intersecting corridor pieces.

25. **Give the five districts distinct silhouettes and materials — P2; Art direction; Observed / proposal.**

   The same dark stone, rectangular floor and repeated props dominate the route. Roots, bunker drainage, pump plant and range infrastructure have limited visual separation.

   Improvement: Use a small authored kit per district: root-dense brick, pale sand-stained retaining walls, painted pump machinery, range screens, and a solid keeper room landmark.

   Acceptance: Players recognize their location from a view with the district label hidden.

26. **Reduce repetitive high-contrast surface noise — P2; Materials; Observed.**

   Large walls and floors repeat a busy stone texture, competing with props and route boundaries. Long plain machine boxes contrast sharply with that density.

   Improvement: Separate broad material values and scales, add restrained wear/decal variation, and concentrate detail around useful landmarks and interactions.

   Acceptance: Path edges, cover and controls remain clear in motion at desktop and phone resolutions.

27. **Make the flow feel forceful and physically situated — P2; Water art; Observed / proposal.**

   Spray currently reads as layered rectangular noise sheets and repeated particles. This shows danger but can obscure the landing and resemble an effect wall.

   Improvement: Shape flow from actual nozzle positions into arcs, impact foam and runoff. Differentiate low, warning and residual unsafe flow without hiding the far bank.

   Acceptance: Players identify danger and the destination from shape/motion as well as color and HUD text.

28. **Give lighting a stable spatial structure — P2; Lighting; Source / observed.**

   One point light jumps to whichever lamp is nearest. Broad ambient lighting and repeated surfaces flatten depth, while abrupt nearest-lamp changes can shift illumination.

   Improvement: Blend light influence or use a small fixed/cullable local-light set. Compose warm decision points against cool water and stronger distant landmarks.

   Acceptance: Walking through lamp midpoints produces no visible lighting jump, and each destination is readable without raising the whole scene’s brightness.

29. **Reduce sign clutter and improve physical guidance — P2; Wayfinding; Observed / proposal.**

   Large repeated overhead boards and signal boxes stack along straight sightlines. Several signs dominate close views while the underlying spaces look similar.

   Improvement: Use one primary sign per decision, a clear bank signal, continuous route markings and distinctive exit architecture. Keep symbols and wording consistent.

   Acceptance: Players navigate after learning the rule without repeatedly reading identical signs or losing the landing behind them.

30. **Make the golf course above feel present — P2; Theme; Observed / proposal.**

   Flags, scattered balls and labels communicate golf, but much of the chapter reads as a generic repeating tunnel.

   Improvement: Add selective sprinkler shafts, washed sand strata, trapped range-ball screens, roots and distant course machinery; vary placement into meaningful clusters.

   Acceptance: The setting remains identifiable as beneath a golf course when labels are hidden, without adding collision clutter.

31. **Give Joe an identifiable acoustic presence — P2; Audio; Source.**

   The audio has a synthesized engine, water noise, pressure knocks and player footsteps. It lacks dedicated Joe footsteps, a starter sequence, distinct blade rattle and authored gate/pump events.

   Improvement: Add a small purposeful trimmer/footstep vocabulary and mechanism sounds. Use the slow approaching footfall cadence as a main threat cue.

   Acceptance: A headphone and speaker playtest can distinguish Joe approaching, preparing a strike and being separated by water.

32. **Give Listening Focus a useful effect — P2; Controls / audio; Source.**

   Q/LT reduces movement speed through input.focus. It does not change the audio mix or provide a focused listening function in this chapter.

   Improvement: Implement a restrained focus mix or useful directional read, consistent with Level 1, or clearly describe the action as slow movement.

   Acceptance: The control has a perceivable benefit and does not merely make an unaware player easier to catch.

33. **Author sound around the major dramatic moments — P2; Audio staging; Source / proposal.**

   The current audio does not deliver the failed starter, pump reversal, gate impact, silence after safety or applause described in the design.

   Improvement: Build a few event-driven cues with space around them. Preserve hazard and attack intelligibility during each cue.

   Acceptance: The entrance, reversal and escape are recognizable with eyes closed without drowning out timing information.

34. **Attenuate and position water by actual location — P2; Spatial audio; Source.**

   Water volume uses longitudinal y-distance and ignores lateral distance; standing on a dry loop beside a channel can sound like standing in the stream. Joe’s engine does not account for intervening walls.

   Improvement: Use actual distance, per-outlet positioning and restrained occlusion filtering. Duck competing ambience when critical cues occur.

   Acceptance: Dry routes, cover and open water sound spatially distinct while threat cues remain fair.

35. **Keep the world’s decision point visible on phones — P2; HUD; Observed.**

   The pressure card, objective, pursuit caption and coaching text occupy substantial screen space; on portrait phones the card overlaps the physical sign and view of the crossing.

   Improvement: Use a compact contextual hazard row and one prioritized danger message. Collapse learned controls and nonurgent text during crossings.

   Acceptance: At 390×844 and 844×390 the bank, signal, far landing and controls can be read together.

36. **Reduce the finger load of moving, running and looking — P2; Touch; Source / proposal.**

   Holding movement, Run and scene drag simultaneously requires three active touch contacts. Rear, crouch and Use add more reach demands.

   Improvement: Offer a consistent movement pad with optional run toggle or an outer sprint zone, while retaining Level 1’s movement semantics. Test hand placement on actual phones.

   Acceptance: A player can navigate, look and choose running speed comfortably with two thumbs; no sticky inputs after interrupted touches.

37. **Complete the controller experience outside gameplay — P2; Controller; Source / validation gap.**

   The gameplay polling supports movement and A/Start, but the custom panel does not implement general controller focus navigation for comfort, pressure, journal and chapter choices.

   Improvement: Add explicit menu navigation, focus indication, glyph selection and disconnect/reconnect behavior.

   Acceptance: A player can start, change relevant options, inspect the journal, pause, retry and leave the chapter without a mouse.

38. **Make inherited settings visible and consistent — P2; Accessibility / settings; Source / proposal.**

   Movement bindings and some preferences carry over, while audio, subtitles and presentation options use a mixture of separate and inherited settings. Physical signals rely heavily on color.

   Improvement: Share the appropriate master preferences, expose per-device sensitivity clearly, add symbols/text to signals and support readable caption sizing. Preserve the requested non-inverted vertical mouse behavior.

   Acceptance: Verify remapping, muted play, reduced motion, common color-vision differences and controller/touch sensitivity without losing timing information.

39. **Teach through one safe crossing and report useful outcomes — P2; Onboarding / results; Observed / proposal.**

   The briefing explains much of the level at once; result and retry use generic text. Evidence acquisition and the actual cause of a failed approach have limited payoff.

   Improvement: Use a short safe demonstration with contextual instruction, then retire it. Give failure coaching from actual events and a concise completion/evidence recap after the playable ending.

   Acceptance: A first-time player explains the water rule after the lesson and knows one actionable change after a death.

40. **Set and measure device budgets — P2; Performance; Unmeasured risk.**

   The renderer keeps preserveDrawingBuffer enabled, animates all water particles and uses fixed resolution caps. Current smoke checks do not establish sustained frame time on a phone or integrated GPU.

   Improvement: Profile loading, compilation, CPU/GPU frame times and memory on representative devices. Make screenshot preservation QA-only if feasible; optimize visible effects based on measured bottlenecks.

   Acceptance: Record repeatable frame-time and memory targets, long-session stability and a readable lower-quality fallback. Do not claim a performance defect from code alone.

41. **Test failure boundaries as rigorously as successful routes — P1; Verification; Gap demonstrated.**

   Passing route and clearance checks missed wrong-side victory, lost bypass progress, false countdowns and stale remapped prompts.

   Improvement: Add targeted regression coverage plus an arrival-phase × Joe-distance × movement-speed matrix, interruption tests and dynamic collision checks.

   Acceptance: Each confirmed defect in items 2–8 gets a regression. Every mandatory crossing has tested recoverable approach envelopes.

42. **Run unfamiliar-player tests before expanding the level — P1; Playtesting; Not yet established.**

   Scripted completions prove reachability but use perfect map/phase knowledge. They do not establish tension, route clarity, fun or the proposed 6–9-minute first-clear duration.

   Improvement: Run a small mixed-device first-time cohort. Ask players to explain the rule before helping, observe route choices and recovery, and record where tension disappears.

   Acceptance: Use observations to revise layout and pacing. Do not stretch corridors or waits merely to reach a duration target.

43. **Record the decisions that matter during local tests — P2; Instrumentation; Proposal.**

   Existing diagnostics expose useful state but do not summarize route choices, time near Joe, idle periods or tension at each landing.

   Improvement: Add optional local review telemetry for crossing arrival phase, branch choice, wait, surge hit, closest Joe distance, attack outcome and checkpoint loss.

   Acceptance: A test session produces a compact encounter-by-encounter report that explains why an attempt felt easy, unfair or confusing.

44. **Separate encounter data, presentation and input contracts — P3; Maintainability; Source.**

   Several files compress entire systems into long lines, and shared movement/timing knowledge is repeated in HUD and simulation. The incomplete safeFor contract already caused a visible bug.

   Improvement: Use readable modules and typed/validated data contracts for water states, interactions, preferences and encounter definitions. Centralize shared values without changing the established controls.

   Acceptance: A new crossing or binding change cannot silently desynchronize simulation, signs, audio and coaching; the important rules are easy to review.

The order I recommend is: first fix items 2–8 and add their regressions; then prototype the first pressured crossing and sustained route structure (1, 9–15); then finish Joe’s presentation and architectural continuity (18–30); then complete audio, device usability and performance (31–40). Run first-time playtests during those passes, with the testing and telemetry work in 41–43. Avoid committing to a long duration or new asset package before the encounter decisions work.

The intended encounter sequence is: a safe lesson that teaches the rule; a visible arrival and first pressured route choice; a crossing where the player can see Joe stopped behind them; a pump reversal whose effect is obvious; alternating range outlets that require reassessment; a physically secured gate followed by playable relief. Each space should justify its presence with a different decision or emotional beat.

Evidence and implementation entry points:

- [Simulation probes and route metrics](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/simulation-findings.json)
- [Browser probes](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/browser-findings.json)
- [Reproducible browser probe script](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/browser-probes.cjs)
- [Incorrect bypass warning capture](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/bypass-warning-2560.png)
- [Forward view during Joe’s entrance](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/joe-entrance-forward-2560.png)
- [Entrance pose and ladder intersection](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/joe-entrance-left-2560.png)
- [Current completion presentation](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/completion-2560.png)
- [Phone crossing capture](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/phone-crossing-390.png)
- [Save and interaction rules](C:/Users/Will/Projects/project-rough-cut/web/under-green-sim.js:10)
- [Final closure rules](C:/Users/Will/Projects/project-rough-cut/web/under-green-sim.js:78)
- [Water timing contract](C:/Users/Will/Projects/project-rough-cut/web/under-green-course.js:38)
- [Crossing advice and pursuit captions](C:/Users/Will/Projects/project-rough-cut/web/under-green.js:71)
- [Actor and tool animation](C:/Users/Will/Projects/project-rough-cut/web/under-green-actor.js:12)
- [Scene, lighting and clearance inspection](C:/Users/Will/Projects/project-rough-cut/web/under-green-scene.js:83)
- [Audio implementation](C:/Users/Will/Projects/project-rough-cut/web/under-green-audio.js:9)

The browser probes recorded no page or console errors. That is a runtime-stability observation, not evidence that the gameplay defects are absent. The final numbers above are deliberately distinguished from an unassisted first-play experience.
