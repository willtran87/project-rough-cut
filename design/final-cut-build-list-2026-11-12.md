# The Final Cut — comprehensive build list

November 12, 2026. Design scope and prioritized backlog. Implementation has progressed since this proposal was written; consult [the implementation ledger](../qa/final-cut-implementation-2026-11-12.md) for current evidence and remaining work. This checklist describes the intended experience, not a claim that every item is finished or human-playtested. Builds on `drain-and-finale-experience-proposal-2026-11-11.md`, the current chapter handoffs, the pixel-3D art direction, and recent campaign-settings and Under the Green outcome work. Earlier proposal statements that Under the Green is unbuilt are historical; the current README identifies it as playable locally.

## Creative promise

The last hole becomes a machine for erasing you. Joe methodically removes the places you can hide; you learn his cutting pattern, cross behind his committed passes, flood the service swale, and make his perfect course destroy his perfect machine.

Emotional arc: uneasy relief -> spectacle -> vulnerability -> terror -> understanding -> deliberate risk -> catastrophic release -> quiet safety.

Target an initial 8–12 minute first clear, excluding retries, as a playtest hypothesis. Start with a much shorter prototype. Duration is subordinate to distinct decisions and earned relief.

P0 = required to prove and complete the chapter. P1 = high-impact authored content and finishing work for the intended final experience. P2 = optional expansion after the core succeeds. Priorities describe build dependency, not a recommendation to ship an unfinished P0-only chapter.

## 1. Arrival, premise and emotional setup

- [ ] **FC01 · P0 · Two physical entrances, one finale.** Connect the Back Nine garage and Under the Green keeper's room to the same protected championship overlook. Preserve each completed escape and acknowledge the route through distinct arrival sounds and scenery.
- [ ] **FC02 · P0 · A real breather.** Provide a protected arrival checkpoint with optional inspection time. Let the player choose when to leave; do not start a hidden encounter countdown while they learn the space.
- [ ] **FC03 · P1 · The empty championship.** Build vacant grandstands, pristine striped turf, abandoned hospitality tables, sponsor banners and recorded applause. Tournament ceremony continues with no audience.
- [ ] **FC04 · P0 · Establish the whole problem visually.** From the overlook show the road exit, next shelter, pump house and low swale. Frame the objective as reaching the road, then reveal how the rig prevents it.
- [ ] **FC05 · P1 · A personalized final-round announcement.** Use the protagonist's in-fiction identity and actual recorded station events on the scoreboard. Do not invent surveillance of hidden actions or use personal account information.
- [ ] **FC06 · P1 · Two lights become one machine.** Stage the rig across the fairway so widely separated lamps initially suggest separate vehicles. Wing deployment reveals its full width from real safety, without forcing the camera.
- [ ] **FC07 · P0 · A playable demonstration.** The rig cuts one band of rough and crushes lightweight furniture while a stone wall holds. The player can see the traversable space behind the pass before the first required crossing.
- [ ] **FC08 · P1 · Establish Joe's relocation.** Use a visible equipment bay, access route and startup interval to account for his arrival in the cab. One physical Joe; no occupied vehicle left simultaneously pursuing in another location.

Arrival acceptance: an unfamiliar player can identify the destination, a genuinely safe refuge and the opening crossing opportunity. Both branch entrants receive every essential lesson.

## 2. Championship grounds and encounter variety

- [ ] **FC09 · P0 · A readable dogleg hole.** Build a compact, authored route with the scoreboard, flag, grandstand and road as distinct landmarks. Avoid an undifferentiated circular boss arena.
- [ ] **FC10 · P0 · Three permanent refuge islands.** Use the stone bunker wall, concrete pump shelter and masonry starter's pavilion. Their interiors, collision and sight blocking must agree with the artwork.
- [ ] **FC11 · P0 · Short exposed route versus longer protected route.** Make both paths visible and reconnect at recognizable shelters. Balance by mower phase and exposure; neither should dominate every situation.
- [ ] **FC12 · P0 · Crossing one: learn the wake.** Offer a generous opportunity to move behind the opening pass and reach real shelter. Teach with the machine and environment rather than a long modal explanation.
- [ ] **FC13 · P0 · Crossing two: the hiding place disappears.** A clearly announced strip removes familiar soft cover. The player must shift to masonry or deliberately take the newly opened route; an escape remains reachable.
- [ ] **FC14 · P1 · Crossing three: choose his next strip.** Place a distraction opportunity near a route fork. Attract Joe toward one feasible lane, then use the other during the committed pass.
- [ ] **FC15 · P0 · A fully cut course remains solvable.** Permanent shelter and connecting paths work after every destructible sector is gone. Waiting cannot silently consume all future chances to win.
- [ ] **FC16 · P1 · Environmental story along useful routes.** Place a bent maintenance sign, saturated wheel ruts and a legible load-limit diagram where players naturally inspect shelter and the pump. These foreshadow the solution without mandatory reading.

Layout acceptance: every encounter changes the player's decision, not only its decoration. A cautious player can recover after missing a crossing. Every visible opening is physically traversable or clearly blocked.

## 3. Joe and the tournament cutting rig

- [ ] **FC17 · P0 · Prove the rig's dimensions in greybox.** Test deployed width, crossing time, turn radius and refuge clearance before final modeling. The earlier 2.5–3-times-Back-Nine width is only a starting hypothesis.
- [ ] **FC18 · P1 · An institutional monster.** Create a clean central power unit, illuminated cab, long reel banks, articulated wings, rollers and hydraulic linkages. Preserve the game's pixel materials on real 3D forms.
- [ ] **FC19 · P0 · One authoritative attack sequence.** Implement select strip -> announce/alignment -> deploy -> committed pass -> disengage -> turn, plus bogged and disabled states. Simulation owns animation, sound and contact together.
- [ ] **FC20 · P0 · Honest perception and strip selection.** Choose feasible lanes from the mowing schedule or actual sight/sound evidence. A hidden player does not continuously redirect the rig.
- [ ] **FC21 · P0 · Readable commitment.** Make lamps, cab alignment, wing posture and mechanical pitch show the intended strip. Lock a committed pass; an abort must announce again before a new dangerous approach.
- [ ] **FC22 · P0 · A trustworthy recovery window.** Use physically credible headland turns and raised reels to open a real crossing opportunity. No surprise speed boost that cancels a properly read opening.
- [ ] **FC23 · P0 · Contact matches the machine.** Use swept contact checks for the actual wheels, chassis and active cutting assemblies. Solid shelter stops them; damaging parts must not clip through walls or reach beyond their visible shape.
- [ ] **FC24 · P1 · Joe stays visibly human.** Animate steering, checking a missed strip, setting the pass and reacting to traction loss. His composure fractures when the course stops obeying him.

Rig acceptance: record the same successful lateral escape across supported frame rates and input methods. No mid-pass retargeting, invisible reach, shelter penetration or lethal turning silhouette that was presented as safe.

## 4. Terror, suspense and dramatic rhythm

- [ ] **FC25 · P1 · Distinct tension phases.** Author calm observation, approaching machinery, committed danger, narrow escape and release. Do not hold maximum intensity continuously.
- [ ] **FC26 · P1 · Moving light across shelter.** Let the real rig's lamps travel across walls, grass and openings before the machine enters view. Lighting suggests its actual position without silently changing detection rules.
- [ ] **FC27 · P1 · The close pass.** Stage a survivable pass just outside the first permanent refuge. Reels, wall contact sounds and grass clippings communicate scale while the wall demonstrably protects the player.
- [ ] **FC28 · P1 · The rough falls in front of you.** Synchronize cutting, concealment loss and newly exposed sightlines. Give enough advance notice and room to relocate; the reveal should produce a decision rather than an unavoidable death.
- [ ] **FC29 · P1 · Silence that exposes the engine.** Stop or duck the tournament loop once at an authored moment, making Joe's true position suddenly obvious. Preserve useful hazard sounds throughout.
- [ ] **FC30 · P1 · A restrained Joe script.** Write a handful of state-specific lines, including opening authority, a frustrated missed pass and loss of control. Draft examples: “One final pass.” / “That wasn't in the plan.” Keep danger cues above dialogue.
- [ ] **FC31 · P1 · Optional peripheral unease.** Use a briefly human-shaped arrangement of empty seats, a banner moving after the wind drops or an existing apparition vocabulary in downtime. It must not imply a false lethal enemy, obscure the route or fire during a teaching beat.
- [ ] **FC32 · P0 · A factual, fast defeat.** Create a brief chapter-specific impact/cutaway and immediate retry. Explain the actual failure and one available response; vary presentation by contact without imposing repeated cinematic delay.

Horror acceptance: test whether players anticipate danger and make choices, not merely whether a loud cue startled them. Permanent refuge remains dependable. Optional atmosphere yields to interactions and survival cues.

## 5. Player agency, tactics and satisfying execution

- [ ] **FC33 · P0 · Familiar movement and interactions.** Retain existing on-foot controls, look, crouch, listening and Use semantics. Teach the new threat rather than a new control scheme.
- [ ] **FC34 · P0 · Practical warning margins.** Derive encounter warnings from actual distance to safety, supported movement speed and reaction allowance. Advice must not say a walkable crossing is safe when it secretly requires sprinting.
- [ ] **FC35 · P0 · A reliable distraction.** Provide a fixed groundskeeping bell whose audible location Joe can investigate through a feasible route. It remains available for the final lure and cannot be consumed permanently.
- [ ] **FC36 · P1 · Optional golf-ball mastery.** Let a well-placed ball redirect the next eligible pass. Supply or recover balls locally; precision shots and finite inventory never gate the ending.
- [ ] **FC37 · P1 · Useful listening.** Distinguish approach, locked pass, receding machine and slow turn using actual location and state. Offer equivalent optional directional captions.
- [ ] **FC38 · P1 · Reward a good crossing in the world.** Give the player visible distance gained, access to the next shelter and a brief acoustic release. Avoid a score popup over the next hazard.
- [ ] **FC39 · P0 · Recoverable mistakes.** Missing a lure, taking the longer route or arriving after an opening should lead to another legible attempt. Never reset Joe arbitrarily on top of a successful player.
- [ ] **FC40 · P2 · A restrained mastery replay.** Add personal challenges such as no captures, successful optional distraction or efficient crossings after first completion. Keep scoring and challenge prompts out of the initial climax.

Agency acceptance: players can explain what they did to earn an opening. Both the direct and cautious route complete without scarce resources. Repeated failed lures do not softlock progression.

## 6. Irrigation trap and catastrophic payoff

- [ ] **FC41 · P0 · Show why the trap should work.** Use seepage, sagging turf, old ruts and a clear bypass diagram to establish that the service swale cannot support the rig when saturated. Teach it in this chapter regardless of entry branch.
- [ ] **FC42 · P0 · One meaningful preparation action.** Operate the pump bypass from reachable, protected controls. Show the mechanism moving and water traveling toward the swale; avoid prerequisite key collection.
- [ ] **FC43 · P1 · Flooding changes the arena.** Animate rising water, softening turf and redirected sprinklers. Make the practical lure approach and elevated escape path readable throughout the spectacle.
- [ ] **FC44 · P0 · An unambiguous ready state.** Persist the flooded swale and checkpoint after preparation. Surface state, gauge and available guidance agree; there is no hidden trap expiration timer.
- [ ] **FC45 · P0 · Player-controlled final commitment.** Expose yourself or ring the bell from a valid position beyond the swale. Joe aligns a real traversable pass; the player moves laterally to the stone path and pavilion.
- [ ] **FC46 · P0 · A physical trap trigger.** Register success only when the live rig reaches sufficiently saturated terrain in the correct state. An arbitrary player coordinate must not trigger a disconnected ending animation.
- [ ] **FC47 · P1 · A staged mechanical collapse.** Show wheelspin, turf tearing, a dropping chassis, wing strain, manifold rupture, water across empty seats and the reels grinding down. Escalate in readable stages with authored, bounded effects.
- [ ] **FC48 · P0 · Save the earned victory immediately.** Once the rig is disabled, persist that outcome and disable incidental lethal effects. Keep the player able to look and move safely while the machine fails.

Trap acceptance: premature lures remain recoverable; preparation survives retry/reload; both lure methods work; the rig reaches the trap through real movement. Victory cannot be undone by debris, a delayed contact tick or a reload.

## 7. Escape, emotional resolution and replay value

- [ ] **FC49 · P0 · A short playable walk to the road.** Move from roar and spray to footsteps, distant traffic and the player's breathing. The road is reachable and the final barrier visibly secures the player side.
- [ ] **FC50 · P1 · Joe behind the boundary.** Let him visibly climb out and approach the secured fence after the machinery fails. Keep the encounter nonlethal; silence and his remaining human presence carry the coda.
- [ ] **FC51 · P1 · The last institutional joke.** The ruined course's scoreboard reports “COURSE CONDITION: EXCELLENT.” A final applause fragment plays against the visible wreckage, then stops.
- [ ] **FC52 · P0 · Evidence-aware aftermath.** Make survival count in every ending. Existing collected evidence changes what can be established about the pilot and how the incident is reported, with no surprise requirement to replay the other branch.
- [ ] **FC53 · P1 · Close the personal story.** A short aftermath confirms the protagonist escaped the assignment and shows one concrete consequence for the pilot. Keep exposition brief and avoid undoing the escape with a new ambush.
- [ ] **FC54 · P1 · Dedicated ending artwork.** Commission a road-side aftermath image and a small number of evidence-dependent variants using the established visual language. Separate captions from the artwork and preserve legible UI.
- [ ] **FC55 · P1 · A satisfying result screen.** Show chapter/campaign completion, route taken, evidence status, replay and credits. Do not obscure the ending with a dense performance dashboard.
- [ ] **FC56 · P2 · Curated replay variation.** After the authored first clear works, test alternate initial strip schedules or one optional evidence stop. Revalidate all warnings, shelter access and trap opportunities; avoid arbitrary hazard randomization.

Ending acceptance: players understand that they are safe, what they caused and what their evidence changed. Reopening the game preserves completion. The coda does not feel like another required encounter.

## 8. Art, sound, controls and presentation

- [ ] **FC57 · P1 · A complete environment kit.** Build grandstand, scoreboard, pavilion, pump shelter, swale, gate, tournament props and distinct uncut/cut/saturated ground surfaces. Structural objects have real depth from every approach.
- [ ] **FC58 · P1 · A complete rig animation package.** Produce startup, deployment, steady cutting, turning, suspension response, bogging, shutdown and Joe's exit with hands, feet and machinery remaining physically coherent.
- [ ] **FC59 · P1 · State-driven spatial sound.** Create engine load, hydraulic deployment, reel bite, cut-grass hiss, wall-adjacent passes, pump flow, wheelspin and shutdown. Sound direction follows real emitters and solid boundaries.
- [ ] **FC60 · P1 · A restrained adaptive score.** Use sparse arrival tones, a low pulse during vulnerability, intensified rhythm for commitment and a decisive release at shutdown. Keep machinery cues intelligible in every mix state.
- [ ] **FC61 · P0 · An uncluttered objective hierarchy.** Show the immediate action, meaningful warning and next refuge. Optional banter, evidence text and scoreboard information yield when danger or an interaction needs attention.
- [ ] **FC62 · P0 · Shared controls and comfort.** Respect campaign preferences, remapped inputs, controller/touch hints, reduced motion, subtitles and caption settings. Provide non-color and non-audio equivalents for essential cues.
- [ ] **FC63 · P2 · Restrained physical feedback.** Consider surface-aware footstep response and supported controller vibration for close passes and machinery failure. Keep both adjustable and supplementary to readable visual/audio signals.
- [ ] **FC64 · P1 · Bounded spectacle and stable performance.** Prepare essential assets before play, cap debris/water voices and particles, and use efficient sector changes. Profile rig reveal, cutting and collapse separately on supported renderer tiers.

Presentation acceptance: inspect in motion at high-resolution desktop and compact layouts; test turning at close range, largest captions and every menu input. Measure frame times rather than inferring performance from screenshots. Set target-device budgets from current measured chapter baselines before final asset production.

## 9. Campaign integration, robustness and proof

- [ ] **FC65 · P0 · Real chapter handoffs.** Add finale continuation to both completed branches and chapter selection. Preserve existing saves and completed escape results; direct entry receives a valid default story/setup state.
- [ ] **FC66 · P0 · Coherent checkpoints.** Save arrival, pump-prepared state and machine defeat. Restore player position, surviving cover, water, Joe position and encounter phase as one viable scene; never restore behind vanished cover.
- [ ] **FC67 · P0 · Reliable lifecycle behavior.** Handle pause, focus loss, reload, restart, audio suspension, input changes and storage failure. Prevent simulated pursuit or stacked audio while paused or unfocused.
- [ ] **FC68 · P0 · Test the encounter's actual rules.** Verify sweep commitment, contact footprint, cover changes, fully cut solvability, trap conditions, victory protection and checkpoint round trips. Keep diagnostic scene placement behind explicit test entry.
- [ ] **FC69 · P0 · Complete ordinary-input runs.** Finish through both campaign branches and direct chapter entry, using actual interactions. Test missed windows, repeated lure failures, slow movement and depleted balls in addition to successful runs.
- [ ] **FC70 · P1 · Human horror and engagement playtests.** Ask unfamiliar players to identify the safe shelter, pass direction and trap goal, then observe decisions. Record confusion, boredom, unfair captures, favorite moments and whether they attribute the climax to their own action.
- [ ] **FC71 · P1 · Tune from encounter evidence.** Measure crossing attempts, time in refuge, unused routes, deaths and successful lures locally. Adjust sustained pressure and recovery based on observed behavior; scripted clears do not certify fun or terror.
- [ ] **FC72 · P2 · Optional post-credits sting.** Only if the ending benefits, add a skippable, brief administrative remnant such as an automated “next review scheduled” notice. Keep the protagonist's safety and completed campaign intact.

Release acceptance: completed ordinary-input runs, truthful saved progression, supported-device checks, stable asset/audio lifecycle and observed first-time player comprehension. Report which checks are automated, visually inspected or human-tested; do not substitute one for another.

## Build order and decision gates

1. **Prove the fun:** one rig, one committed strip, two shelters and two crossing paths. Pass only when an unfamiliar player recognizes commitment and enjoys using the opening. Do not commission the complete rig before this works.
2. **Prove the ending:** add the pump, persistent flood, repeatable lure, physical bogging and protected victory using temporary art. Complete this loop with normal inputs and without rare resources.
3. **Build the whole chapter:** join both entrances, all distinct crossings, fully cut recovery routes, checkpoint restoration and the road ending. Keep the initial prototype compact if more crossings add repetition.
4. **Create the signature moments:** finish the two-lamp reveal, close pass, cover-erasure beat, staged collapse and silent fence coda, including sound and chapter-specific assets.
5. **Finish and validate:** add evidence aftermath, result/credits, final menus, device/comfort coverage, performance work and first-time playtests. Add P2 content only when it improves the tested chapter.

## Scope boundaries

Avoid health-bar damage cycles, repeated pump-key hunts, mandatory precision golf, button-mashing escapes, hidden rubber-banding, procedural destruction of all scenery, unlimited fake refuges and a second lethal chase after the rig is defeated. These would dilute the proposed crossing-and-terrain loop or take away an earned outcome.

The six highest-impact moments are the empty championship, the rig's unfolding scale, the first protected close pass, cover disappearing ahead of a deliberate escape, the player-triggered irrigation catastrophe and the quiet road/fence aftermath. Build the systems to make those moments playable and trustworthy before adding more scares.
