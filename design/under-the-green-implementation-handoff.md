# Under the Green — copyable implementation prompt

Prepared November 12, 2026. This document assigns future work; it does not claim that features have shipped or that historical defects still exist. Use the expanded specification in `design/under-the-green-build-prompt-2026-11-11.md` for the complete 44-item ownership table and detailed acceptance scenarios.

**Design verdict:** the improvements are consistent with Rough Cut when they preserve familiar movement and make physical danger easier to understand. Make preferences, prompt accuracy, menu operation and save reliability campaign-wide requirements. Share movement and look behavior within the on-foot profile. Keep water timing, trimmer attacks, route balance and dramatic choreography specific to Under the Green. Treat proposed layouts, extra checkpoints and exact pacing as hypotheses to test, rather than additions that automatically improve the game.

## Copy this to start implementation

> Build out Under the Green as a tense, readable pursuit beneath a golf course, using this handoff and `design/under-the-green-build-prompt-2026-11-11.md`. Account for all 44 review items. First reconcile each item with the current source, implementation ledger and retained evidence; preserve delivered fixes and unrelated changes. Produce a short checklist of remaining work, ownership, affected chapters and acceptance evidence, then implement it in dependency order. Historical review findings must be reproduced before being treated as current defects.
>
> **Preserve the game:** retain Level 1's movement, immediate stopping, normalized diagonal input and normal vertical mouse look. Preserve saved comfort preferences and Back Nine's intentional steering/camera differences. The Level 1 drain leads here; the shed leads to Back Nine. Teach this chapter without assuming players completed the other branch. Preserve existing Final Cut work and transitions. Use the established pixel 3D art direction and physical golf-maintenance setting.
>
> **Make the core decision work:** the player observes water and Joe, chooses a timed crossing or dry route, commits with familiar movement, gains or loses position, then reassesses. Compose each decision so the safe bank, outlet signal, destination and alternative are understandable before commitment. A favorable opening should sometimes make crossing worthwhile; a poor opening should sometimes favor waiting or a detour. Compare the continuous sequence, including the next outlet, rather than optimizing each crossing in isolation. Preserve skilled players' earned leads.
>
> **Give water a clear consequence:** drive signals, sound, guidance and hazard contact from the same phase state. Crossing advice must include approach travel, actual stance, far-bank clearance and a reaction reserve. If standing or running would make a window viable, present that as an explicit optional action using the player's real bindings; do not label the current pace safe until it is. A late crossing should produce a short, visible, directionally credible displacement and a useful next action. Preserve lateral steering and retreat, avoid immediate repeated hits, and do not force recovery into an already committed attack. Water cannot be only a movement slowdown.
>
> **Make Joe frightening and fair:** he walks through connected physical space with observable perception and search behavior. Stage an entrance the player can notice, approaching footsteps, a credible trimmer grip, planted preparation, a committed blade sweep and visible recovery. Valid unobstructed blade contact causes this chapter's defeat; proximity alone does not. Match animation, collision and cover. Never teleport Joe, secretly accelerate him, read the unseen player's position or force the camera to maintain tension. Tune pressure through routes, sightlines, machinery and choices.
>
> **Build distinct dramatic beats:** deliver a protected water lesson; a noticed arrival and first pressured route choice; earned separation with Joe visible where his real position permits; a pump reversal whose before/after effect is obvious; alternating outlets that require reassessment; and a physically secured keeper gate followed by playable relief. Make the mandatory pump requirement clear before the player leaves its district. Persist irreversible mechanism progress immediately. Checkpoint retries should preserve solved facts and restart the relevant challenge coherently. Keep the groundskeeper record optional, acknowledge its acquisition and show its payoff in the result.
>
> **Finish the spaces and presentation:** repair roofs, portals, supports, banks and close-up control geometry. Inspect Joe, his tool and moving gates as well as static walls. Give root tunnels, bunker drainage, pump machinery, range screens and the keeper room recognizable silhouettes and restrained materials. Show the golf course above through purposeful roots, sand, sprinkler shafts and trapped balls. Keep flow and lighting spatially credible; effects and repeated signs must not hide destinations. Use distinct approach, attack, pump and gate sounds, with truthful captions and clear priority during danger. Keep the phone's crossing visible above the controls.
>
> **Share the appropriate foundations:** integrate campaign preferences, save reliability, binding/prompt resolution, accessible menus and input interruption handling through their applicable existing consumers. Share on-foot movement and Listening Focus semantics where the control profile matches. Reuse timing, interaction, spatial-audio and QA utilities where contracts actually match. Keep outlet schedules, current strength, trimmer tuning, route geometry, checkpoint placement, mechanism choreography and local sound/art chapter-owned. Global quality standards do not require identical hazards, capture rules or a redesign of other chapters. Name each affected consumer and intentional exception before changing a shared system.
>
> **Verify the playable result:** prove one complete pressured encounter before expanding decoration, then test continuous wet, dry and mixed routes with changing pace and legitimate Joe positions. Cover success, hesitation, late entry, recovery, missed mechanisms, wrong-side closure, occupied thresholds, pause, retry and reload. Exercise remaps and actual keyboard/controller/touch paths; inspect 2560×1600, 1280×720, 844×390 and 390×844 layouts. Measure performance before optimizing. Use unfamiliar-player observations to evaluate comprehension, route choices, tension and relief; scripted success cannot establish those qualities. Report implemented behavior, mechanical evidence and remaining human/device validation separately, and update the existing 44-item ledger.

The sections below are the detailed requirements for that prompt. The expanded specification is the per-item reference; this handoff is the execution guide.

## Task

Finish Under the Green as a tense, readable, physically convincing pursuit beneath the golf course. Address all 44 items in `design/under-the-green-review-2026-11-11.md`, reconciling them against `design/under-green-implementation-ledger.json` and current code before changing anything. Preserve working fixes and unrelated workspace changes. Implement the remaining features and their applicable cross-chapter integrations, then verify the resulting player experience.

First produce a brief delta checklist: review ID, verified current behavior, remaining work, owner, affected chapters and acceptance evidence. Distinguish confirmed defects from proposed design solutions. Do not rebuild delivered features merely because the historical review lists them.

The core experience is: **read the water and Joe's approach → choose a timed crossing or dry detour → commit using familiar movement → gain or lose position → reassess.** Water must create decisions. Joe's slow, legitimate approach must make those decisions matter. A successful player must be allowed to earn relief.

Read the current action-response and world-presentation contracts. Preserve the campaign branches: the Level 1 drain leads here; the shed leads to Back Nine. This chapter must teach its own rules without requiring Back Nine first. Final Cut implementation files now exist: inspect and preserve existing transitions and relevant shared-system consumers. Rebuilding the finale is outside this task.

## Ownership and consistency

Use three layers. Share player expectations and proven utilities; author the encounter locally.

| Layer | Features to own here | Boundary |
| --- | --- | --- |
| Campaign | Preference validation/persistence; audio and caption preferences; reduced motion; accessible menu navigation; input interruption handling; action/prompt infrastructure; save versioning; QA reporting | Integrate with actual consumers in every applicable existing chapter, including Final Cut where relevant. Keep independent chapter progress and mode-specific settings. |
| Control profile | First-person movement/look, stance, Listening Focus semantics, binding labels and touch ergonomics | Match Level 1 and Under the Green. Check the existing finale profile before integration. Back Nine keeps its steering, following camera and independent brake/rear-view defaults. |
| Chapter | Water phases, Joe's walking/trimmer behavior, route graph, wet/dry balance, pump, checkpoint placement, local art/sound and ending | Reuse compatible helpers without imposing these mechanics or defeat rules on other chapters. |

The current `final-cut.js` already consumes the `onFoot` binding profile, campaign settings UI and spatial preference store. Include those existing consumers in shared-feature regression checks. That establishes integration scope, not proof that all of its movement or camera behavior already matches Level 1.

### Concrete shared-system starting points

Source inspection on November 12 identifies the following implementation boundaries. Recheck consumers before editing; an import establishes a dependency, not a passing experience test.

| Feature | Existing starting point | Build instruction |
| --- | --- | --- |
| Campaign preferences and safe storage | `web/preference-store.js`, consumed by Level 1, Under the Green, Back Nine and Final Cut | Extend the existing validated store. Preserve unrelated fields and chapter progress. Verify the actual effect of each applicable preference after a transition and reload; do not merge chapter saves into one progress record. |
| Optional movement-start response | `web/movement-response.js`, consumed by Level 1, Under the Green and Final Cut | Preserve immediate movement by default and immediate release stopping. The saved optional 80 ms start/reversal response has actual-consumer evidence in `qa/on-foot-start-response-2026-11-12.md`; keep chapter units and collision substeps local. |
| Action identities, remaps and labels | `web/control-profiles.js`, `web/keyboard-binding-settings.js`; direct action-resolver consumers include Level 1, Under the Green and Final Cut | Use the same resolved binding for input and displayed instructions. Retain separate `onFoot` and `chase` defaults. Sharing an action identity does not imply sharing camera or movement physics. |
| Controller menus | `web/dom-gamepad-menu.js`, imported by all four chapter entry points | Finish navigation through each chapter's real panels, including focus restoration, cancel, retry and disconnect. Keep layout and available actions appropriate to that chapter. |
| Message presentation | `web/message-presentation.js`; Level 1, Under the Green and Back Nine use different exports | Share the policy that urgent danger and direct action responses remain intelligible. Let chapters provide truthful candidates and local arbitration. Verify attack versus interaction versus optional coaching conflicts; do not replace every chapter's messages with the water HUD. |
| Hazard and interaction calculations | `web/hazard-timing.js` and `web/interaction-rules.js`, currently imported by Under the Green's course and interactions | Keep these reusable, but do not describe them as campaign-wide integration already delivered. Add another consumer only when it needs the same contract; retain hazard-specific consequences and target-specific reach. |
| Spatial sound and local reports | `web/audio-spatial.js`, `web/local-telemetry.js`, currently used by Under the Green modules | Reuse compatible math and bounded report structures. Keep source placement, occluders, encounter events and mix tuning local. Reporting remains opt-in and does not infer enjoyment or fear from movement. |

Before extracting any additional shared code, write a one-sentence contract and identify at least two concrete consumers that need it. If only Under the Green needs an implementation, keep it local while meeting the campaign quality standard. Do not make cross-chapter migration a prerequisite for fixing a local defect.

For example, an Under the Green gate refusal must explain the failed action without being buried by a routine pursuit caption. The campaign-wide requirement is reliable feedback priority; the occupied-threshold test, recovery wording and closure commitment belong to this gate. Likewise, a shared hazard clock can describe a warning accurately without making a Level 1 pond behave like a pressurized outlet.

Clipping, readable threats, truthful UI and responsive actions are campaign quality standards. The geometry, cues and collision shapes that satisfy them remain scene-specific. A shared module counts as delivered only when its actual consumers work; do not create a speculative universal framework.

Preserve Level 1's established movement, immediate stopping, normalized diagonals and normal vertical mouse look. The current baseline is 3.84 m/s walking, 6.08 m/s sprinting and 2.4 m/s crouching/listening, with standing/crouched eye heights of 1.65/1.12 m. Check coordinate conversion explicitly. Do not add stamina, forced camera turns, precision jumping or swimming to manufacture difficulty.

## Design decisions and limits

Treat the 44 items as problems and acceptance goals, not 44 independent mechanics to add. Use this disposition when choosing an implementation:

| Recommendation | Decision | Reason and constraint |
| --- | --- | --- |
| Familiar movement, truthful warnings, responsive interactions, durable progress | Required foundation | These determine whether the player can trust the game. Fix demonstrated failures before increasing pressure. |
| Water windows, physical recovery, walking Joe and a committed trimmer attack | Required chapter identity | Water changes when and where the player can move; Joe makes waiting consequential. Avoid a permanent slowdown as the entire challenge. |
| Folded routes and visible service connections | Prototype and measure | They may sustain pursuit without cheating. A specific layout is not mandatory, and a skilled player earning a lead is not a defect. |
| More checkpoints or safe rooms | Place from observed replay cost | Add recovery where a new challenge begins. Do not remove every consequence or interrupt each tense crossing with a save announcement. |
| Listening Focus | Shared on-foot meaning, local sound mix | Improve access to sound the player could actually hear. It must not become radar through walls or reveal hidden AI state. |
| Optional evidence and finale setup | Preserve the optional reward | The record adds understanding and payoff; missing it must not secretly block the chapter or its normal continuation. |
| Spectacle, signs, captions and environmental detail | Use selectively | Every addition should clarify a decision or deliver a dramatic beat. Remove competing messages and repeated props before adding more. |
| Local playtest reporting | Shared bounded reporting utility, chapter-specific events | Reports support design review. Keep them opt-in and outside ordinary play; observations of movement do not establish fear, intent or enjoyment. |

Preserve each chapter's role: Level 1 establishes the course's interaction and pursuit rules; Back Nine delivers steering-based mower pursuit; Under the Green delivers deliberate foot pursuit and irrigation timing; Final Cut retains its own existing finale mechanics. Under the Green escalates through intimacy, constrained sightlines and visible machinery changes. It does not need a larger mower or the finale's scale to be dramatic.

For every proposed global change, name the current consumers, the shared player expectation, and each intentional exception. Share preferences and reliable behavior first. Extract implementation only where existing consumers need the same contract; do not migrate unrelated AI, renderer or checkpoint systems just to make their code look alike.

### Consistency decisions to carry into implementation

The review fits Rough Cut's established physical mechanisms, evidence-led pursuit and pixel-art surfaces on real 3D forms. These boundaries prevent a well-intended improvement from changing the game's identity:

| Proposed improvement | What should carry across the game | What must remain authored for this chapter |
| --- | --- | --- |
| Stronger pressure | Threats provide observable preparation, meaningful counterplay and honest consequences. | Joe's deliberate walking pace, trimmer reach, committed sweep and water-bank decisions. Do not replace mower collision rules with blade-contact rules. |
| Better water challenge | Warnings agree with the actual hazard; movement stays responsive; a mistake has an understandable cause. | Outlet cycles, crossing windows, directional current and recovery landings. Do not turn all wet terrain in Level 1 into a timed discharge hazard. |
| Fewer clipping problems | Visible boundaries, camera clearance and physical collision agree; moving actors receive inspection too. | Repair Under the Green's roofs, banks, controls, tool poses and gate geometry. Shared standards do not require a campaign-wide scenery rebuild. |
| More dramatic moments | Preserve player agency, comfort preferences and audible danger during spectacle. | Hatch entrance, pump reversal, alternating outlets and safe gate aftermath. Do not force a camera turn or relocate Joe to make a scene happen. |
| Clearer navigation and HUD | Consistent symbols, binding labels, message priority and accessible sizing. | Exact signs, silhouettes, route markings and hazard messages. Avoid copying this chapter's water card into unrelated encounters. |
| Better retries | Reliable saves, immediate response, preserved preferences and understandable failure coaching. | Checkpoint placement, restored phases, enemy starting state and durable pump facts. Match the challenge rather than copying checkpoint spacing between levels. |

Use three completion labels on each work card: **implemented**, **mechanically verified**, and **experience validated**. They are separate claims. A deterministic route can establish that a crossing is possible; it cannot establish that a new player understood the warning or enjoyed the choice. Historical review measurements must not be presented as current defects without reproduction.

## Required cross-chapter checks for shared work

For each shared change, name the affected consumers before editing and execute the applicable scenario below through ordinary player controls. A passing helper test alone does not establish integration. Record intentional exceptions rather than silently making every chapter behave alike.

| Change | Player-visible integration scenario | Preserve |
| --- | --- | --- |
| On-foot movement and look | Compare Level 1, Under the Green and Final Cut's existing on-foot consumers while walking, running, strafing diagonally, reversing, releasing movement, crouching and glancing back. Move the mouse upward and verify normal vertical look under the applicable settings. Check analog input near the saved deadzone, not only at full deflection. | Level 1's physical movement baseline, immediate stopping and the player's saved comfort choices; document any intentional finale differences. Back Nine retains steering and its following camera. |
| Bindings and device prompts | Remap Use to an unused key in the on-foot settings. Operate a real mechanism in each applicable chapter, then pause, retry and reload. Switch to controller/touch and check that the displayed action matches the input that works. | Separate chase bindings; unsupported actions should not appear merely because a shared profile contains them. |
| Preferences and menus | Change audio, captions, reduced motion and the active device's sensitivity. Enter another applicable chapter, reload, and verify both the setting and its actual effect. Navigate start, settings, journal, pause and retry with a controller; interrupt a held touch or button and resume. | Essential visual danger information when muted; no inherited held action after a menu, focus loss or device reconnect. |
| Saves and irreversible progress | Operate the pump, fail before the next checkpoint, then reload. Restart Under the Green and inspect sibling chapter progress and campaign preferences. Exercise unavailable storage and supported legacy saves separately. | Chapter-owned facts, independent progress, truthful save feedback and usable session controls if storage fails. |
| Interaction and threat presentation | In each touched consumer, approach a visible control from valid and blocked positions. Confirm that prompt eligibility matches accepted Use. Trigger urgent danger during optional coaching and check the priority and readable view. | Chapter-specific reach/tuning, attack cues and defeat rules; no campaign-wide conversion to trimmer contact or irrigation hazards. |
| Shared rendering/audio utilities | Exercise a representative scene in every changed consumer, including pause/resume and a busy encounter. Check cue position, visibility, resource growth and measured frame times using the available renderer/device. | Existing art direction, local sound character and per-mode budgets; simulated phone dimensions do not establish physical-phone performance or comfort. |

If another chapter does not consume the changed system, record that boundary instead of migrating it solely for uniformity. If integration reveals a concrete regression, fix and verify that regression within this delivery. Keep unrelated chapter redesign outside the brief.

## First playable proof

Before expanding the remaining layout or buying its polish with more effects, verify one complete encounter using ordinary controls:

1. From the approach, the player can see a safe waiting bank, outlet signal, far landing and dry alternative.
2. An early arrival permits a normal walking crossing with a declared reaction reserve. A late arrival makes waiting or detouring sensible. The advice changes with position and stance.
3. Joe approaches along real connected geometry. His footsteps and preparation communicate pressure without a forced camera turn or an omniscient distance display.
4. A timely crossing earns separation. A late crossing produces a visible directional shove, costs position and leaves a usable recovery action. The shove itself must not guarantee an unavoidable blade hit.
5. If Joe reaches the player, a readable committed attack can be evaded by movement or solid cover. A real hit explains the defeat and a retry restores the relevant challenge with durable progress intact.

Compare early, late and closed-water arrivals while walking, sprinting and moving cautiously, with Joe legitimately near and far. Capture the player's decision view and actual outcomes. Do not require equal wet/dry usage, a death quota or a fixed threat-distance quota. Once the rule is understood, tension should come from choosing under pressure rather than deciphering controls or hidden conditions.

## Build packages

### Player-experience storyboard for the build

Use this sequence to judge the packages together. It describes the intended experience, not a claim that the current build already delivers it. Exact durations, outlet phases and distances remain tuning parameters. Keep the player in control throughout.

| Beat | What the player notices and decides | Consequence and dramatic purpose | Acceptance question |
| --- | --- | --- | --- |
| Protected lesson | A visible outlet changes state; the far bank and recovery landing are readable. The player chooses when to cross before Joe can threaten this lesson. | A successful crossing confirms the rule. A late attempt demonstrates a bounded current and a usable return, without requiring a death to learn. | Can a new player explain the warning and point to the safe destination before receiving more instructions? |
| First pressured choice | Joe's entrance and trimmer sound establish a real pursuer. The same water rule now competes with his audible approach; both the crossing and dry alternative are visible. | Waiting spends separation, a well-timed crossing saves travel, and the dry route exchanges time for timing certainty. No branch is advertised as universally safe. | Does the player choose for a reason they can explain, and can they recognize when that reason changes? |
| Earned separation | A folded view allows the player to observe Joe navigating the same connected space. The optional groundskeeper recess is recognizable before committing to its detour. | A successful decision creates a perceptible breathing space. Evidence is an optional use of that time, not a hidden requirement or a guaranteed trap. | Can the player notice that their action bought room, and choose whether to spend it? |
| Pump reversal | The blocked onward route, visible control and connected pipes establish cause and effect. Operating the pump changes the forward and return flows with appropriate warning. | The player actively changes the pursuit space. Sound, machinery and water deliver the surprise; Joe's response depends on his actual location. | Can the player identify what changed and where to go next without reading an explanation? |
| Alternating range | From the middle landing, the next outlet and connected recovery route are visible. The player reassesses the opening and the separation carried from the previous decision. | Earlier choices affect the next choice. A late crossing costs position but preserves an actionable recovery; an earned lead remains valuable. | Do different plausible arrivals favor different decisions across the whole sequence, rather than only at one isolated crossing? |
| Secured escape | The release belongs to a visible gate mechanism. Its protected side and closure state are understandable while the player operates it. | Success requires genuine separation by the barrier. After closure, the player can move and look back in safety while machinery settles, before results appear. | Does the player understand why they are safe and experience the payoff even when Joe is legitimately far behind? |

For each beat, implement the ordinary success, a plausible mistake and its next action before adding decorative variation. A recoverable mistake means a player has a readable opportunity to respond; it does not guarantee survival after further delay. If a route is described as safe, distinguish a dry route that avoids water from a protected space Joe cannot enter.

Keep three design tensions explicit during tuning:

- **Pressure versus earned mastery:** compact routes and visible service connections can sustain contact, but skilled movement may legitimately end the pursuit early. Do not enforce a minimum Joe distance.
- **Clarity versus surprise:** surprise the player with a visible mechanical reversal, a changed sightline or sound staging. Keep attack preparation, hazard warnings and the resulting counterplay understandable.
- **Consistency versus variety:** preserve the player's controls and the reliability of feedback across chapters. Preserve different threat mechanics, physical settings and encounter rhythms within those expectations.

The prompt's delivery target is a coherent sequence of decisions and payoffs. More rooms, more signs, more particles, a larger enemy or a longer completion time are not independent success criteria.

### 1. Reliable progression and interactions — review 2, 3, 6, 7, 8, 16, 44

Bind prompts and activation to the same visible target, reach, facing, obstruction and enabled-state checks. Explain an unavailable action briefly. Generate instructions from the active bindings. Make the pump requirement understandable before the player leaves its district.

Persist the operated bypass immediately, along with collected evidence. Restore coherent encounter states on death/reload and retain solved durable facts. Place checkpoints at meaningful challenge boundaries. The final release requires the player to be safely inside; validate the side and threshold throughout closure and at completion. Resolve retreat or an obstructed closure honestly.

**Accept when:** remapped Use works and is labelled correctly; use through a wall or across a room fails; pump progress survives death before the next checkpoint; retreat cannot award victory; pause/reload cannot bypass closure; restarting this chapter preserves sibling progress and preferences.

### 2. Water as timing and position — review 4, 5, 10, 15, 27

Drive physical signals, sound, guidance and hazard eligibility from one phase state. Distinguish low flow, warning, surge and residual danger; represent permanently drained/event-controlled states without fabricated countdowns. Calculate crossing advice from approach distance, current stance, remaining crossing distance, far-bank clearance and a declared reaction reserve.

Make a timely wet crossing offer a measurable positional advantage. Make the dry alternative visible and useful at unfavorable arrival phases. Late entry should cause a short, readable current toward a reachable recovery bank, with a clear next action. Align the visible flow with displacement. Avoid permanent slow movement, repeated immediate hits and forced landings inside an already committed strike.

**Accept when:** advertised walking crossings are achievable without an unannounced sprint; early/late/closed arrivals change the decision; neither branch wins every tested situation; reversing, pausing and changing stance cannot leave stale advice. Validate both banks and recovery near Joe and solid cover.

### 3. Distinct encounters and sustained pressure — review 1, 9, 11, 12, 13, 21

Build and prove one pressured crossing before expanding decoration. Compact/fold connected routes so Joe can remain relevant through legitimate movement. Establish understandable sight, hearing, last-known-position and search rules. No teleportation, hidden-player tracking, secret catch-up or mandatory minimum enemy distance.

| Beat | Required decision/payoff |
| --- | --- |
| Root gallery | Learn one crossing safely; a mistake teaches current direction and recovery. Retire the lesson after demonstrated crossing. |
| Joe's arrival / spillway | Notice a credible entrance through staging and sound while keeping camera control; choose a wet opening or visible dry detour. |
| Bunker | Read Joe across a folded space; earn visible separation; optionally spend time reaching the evidence recess. |
| Pump | Recognize the blocked onward route; operate the lever; see/hear the forward drain and warned return flow exchange. Joe reacts only if his real position warrants it. |
| Alternating range | Cross, reassess on the central landing, then choose the next opening or recovery route. Combine learned skills without introducing an unexplained rule. |
| Keeper room | Reach the visible release, seal the boundary, then experience safety before results. |

**Accept when:** each beat changes a decision, every enemy shortcut is connected, and both cautious and competent routes remain understandable. Record when Joe becomes irrelevant and why; distinguish an earned escape from weak encounter structure. Do not extend corridors or waiting to hit a fixed chapter duration.

### 4. Joe, collision and threat feedback — review 18, 19, 20, 22, 23

Keep hands attached to the trimmer grips through carry, turn, preparation, sweep and recovery. Match footfalls/stride to distance and plant turns/stops. Align the visible blade and swept hit region. Attacks commit to their readable aim and expose recovery; ordinary proximity alone is not trimmer defeat. Preserve other chapters' existing capture rules.

Captions must describe observable evidence. Distinguish visible approach, search, water obstruction and attacks; do not reveal hidden intent or exact unseen position. Essential attack advice takes priority over optional lessons, rewards and banter.

**Accept when:** a committed dodge works; cover blocks the blade; no mid-sweep retargeting; entrance, gates, controls, corners and maximum supported pitch/FOV pass dynamic clearance inspection. Review normal-speed presentation as well as collision overlays. State sampled coverage honestly.

### 5. Architecture, golf identity and sound — review 24, 25, 26, 28, 29, 30, 31, 32, 33, 34

Finish roof transitions, portals, shaft walls and physical supports. Distinguish root brickwork, sand-stained bunker walls, painted pump machinery, range-ball screens and the keeper room through silhouette/material composition. Reduce surface noise and repeated signs. Preserve clear banks, landings and controls. Use stable lighting with visible destinations and no nearest-lamp popping.

Make the course overhead tangible through selected roots, sprinkler shafts, washed sand, trapped range balls and distant machinery. Keep the current pixel 3D style. Build forceful water from actual outlets into impact and runoff rather than opaque effect walls.

Give Joe recognizable starter, idle, footstep, preparation and recovery cues. Stage the entrance, pump and gate with space around their sounds. Position sources by actual distance and camera orientation, with restrained occlusion. Listening Focus should improve useful listening while retaining its shared on-foot semantics. Preserve hazard intelligibility during music, water and dramatic effects.

**Accept when:** destinations remain readable with district labels hidden; controls and boundaries are clear in motion; audio distinguishes approach and preparation on headphones and speakers; mute and reduced motion retain essential information. Automated audio output checks do not establish human intelligibility.

### 6. Learning, evidence and ending — review 14, 17, 39

Use a protected demonstration followed by contextual coaching. Place the groundskeeper record in a recognizable optional recess; acknowledge acquisition and make later reading safe. Preserve its relevance to the finale without making it mandatory progression.

Derive failure coaching from recorded events, with one useful next action. After valid closure, preserve success, allow a short safe walk and voluntary glance back, then deliver machinery tail-off, distant applause and a concise result/evidence recap. Do not immediately replace the payoff with a modal or revoke victory through a surprise attack.

**Accept when:** an unfamiliar player can explain the water rule, understands a failed attempt, and recognizes both the secured boundary and optional evidence reward.

### 7. Device usability and shared integration — review 35, 36, 37, 38

Use one prioritized danger message and compact contextual hazard guidance. Retire learned instructions. Keep the bank, outlet signal, landing and touch controls visible together. Support comfortable two-thumb movement/look/sprint through an appropriate optional on-foot input method; preserve movement physics.

Complete controller navigation through start, settings, journal, pause, retry and chapter navigation. Handle blur, cancelled touches, disconnect/reconnect and held buttons across screens without stuck input or accidental confirmation. Expose per-device sensitivity and caption readability; pair color with symbols/text.

**Accept when:** ordinary UI preference changes survive reload and transitions; each applicable consumer honors them; keyboard remaps and device glyphs agree with real input; Back Nine's distinct controls still work. Check 2560×1600, 1280×720, 844×390 and 390×844 plus real touch/controller use where available.

### 8. Verification and maintainability — review 40, 41, 42, 43, 44

Maintain a single authoritative encounter state feeding presentation, audio and coaching. Separate authored data, input adapters, simulation and rendering incrementally. Add regressions for reproduced defects, plus arrival-phase × movement-speed × legitimate Joe-position coverage. Test failure, interruption and reload as carefully as successful completion.

Use optional local diagnostics for branch choice, waiting, water hits, proximity, attack outcomes and checkpoint loss. Profile representative loading, demanding encounters, sustained frame times and memory before optimizing measured bottlenecks. Preserve readable low-quality presentation and user resolution preferences.

Run unfamiliar-player sessions early enough to change layout. Observe rule comprehension, route decisions, noticed warnings, reasons for failure and moments of relief. Keep automated reachability, visual inspection, human experience and actual-device qualification separate. Record unavailable evidence as remaining work; never invent sessions or claim fun/fear from scripted completion.

## Required proof for global features

Implement shared behavior through the existing consumers below. Recheck these entry points before editing because the chapters are being developed concurrently. A shared helper passing a unit test does not prove that the player's experience is consistent.

| Feature | Current integration scope | Concrete acceptance scenario |
| --- | --- | --- |
| Audio, captions and comfort preferences | Level 1, Under the Green, Back Nine and Final Cut; existing preference store and settings adapters | Change a setting through ordinary UI, enter another applicable chapter and reload. The setting stays effective and editable. Global mute silences local events; reduced motion overrides local camera decoration; essential hazard information remains available under the applicable caption policy. |
| Bindings and displayed instructions | Existing `onFoot` consumers in Level 1, Under the Green and Final Cut; separate chase bindings in Back Nine | Remap Use to T, approach a valid control, inspect its prompt and use it. Switch to controller and touch and inspect the new labels. Check briefing, pause, retry and journal as well as gameplay. Preserve intentional chase defaults. |
| Movement and look | Level 1 / Under the Green first-person profile; verify Final Cut's applicable consumers without assuming equivalent movement | Compare equal-duration movement in physical metres, stopping, diagonal travel, crouch, rear glance and normal vertical look. Repeat after changing sensitivity. Keep Back Nine's steering and following camera intact. |
| Save reliability | Shared storage operations, independent chapter serializers | Operate the pump, fail before the next checkpoint, then reload: the pump stays operated. Restart Under the Green and confirm sibling chapter progress survives. Corrupt or unavailable storage permits session play. A later successful write retains earlier unsaved settings without overwriting unrelated newer fields. |
| Menus and input lifecycle | All applicable chapter screens through their existing UI adapters | Start, change settings, inspect the journal where available, pause, retry and continue using controller alone. Release/cancel touch, disconnect the controller or lose focus during movement and a held action; resume without stuck movement or accidental activation. |
| Interaction and message policy | Shared eligibility/priority helpers where compatible; chapter-owned targets and verbs | A visible control and its prompt use the same reach, facing and obstruction checks. An imminent attack takes priority over optional coaching. Preserve distinct hold, brake and closure requirements. |
| Audio positioning and hazard timing | Reusable calculations with locally authored sources and hazard state | Move sideways and turn away from a source: sound direction/distance remains coherent. Pause at a warning boundary: signals, captions, sound and physical danger resume from the same state. Do not impose water phases on mower encounters. |
| Quality and verification | Shared reporting conventions with chapter-specific fixtures and budgets | Inspect the affected chapter with real inputs and relevant viewport sizes. Record device, renderer, frame-time distribution and resource growth. Recheck only affected consumers; a shared standard does not require rebuilding every chapter's scenery. |

For every implementation card, include: **review IDs; player problem; verified baseline; proposed behavior; global/profile/local owner; actual consumers; dependencies; successful action; mistake/recovery; interruption/reload; evidence; remaining human validation.** Record design tuning as a hypothesis until tested. Keep gameplay acceptance distinct from code completion.

For shared input acceptance, change controller deadzone and sensitivity through the existing settings, then test small cardinal and diagonal deflections, full deflection and release in each applicable on-foot chapter after transition and reload. Compare physical displacement rather than raw coordinate values because chapter units can differ. Verify the actual response and displayed setting agree. The November 12 analog pass reproduced and repaired Final Cut's fixed `.22` axial threshold and inconsistent look curve; see `qa/on-foot-analog-consistency-2026-11-12.md` for the saved-setting integration checks and retained baseline. Preserve that fix while completing the broader input and device acceptance work.

For example, a water-crossing card is complete mechanically only when an early walking arrival can clear the far bank, a closing window changes the advice, an unfavorable arrival has a usable wait/detour, and a failed crossing has a visible recoverable cost. Its experience acceptance additionally requires an unfamiliar player to explain the choice and why the outcome happened. A successful scripted route alone does not establish those observations.

### Detailed reference work card: first pressured crossing

**Review IDs:** 1, 4, 5, 9, 10, 15, 22, 27, 35, 41–43. **Player problem:** water currently risks reading as an inconvenience unless arrival timing changes a visible choice and Joe makes the time cost relevant. Verify the current build before treating that risk as a reproduced defect.

**Ownership:** chapter-owned encounter and tuning; reusable timing calculations and interaction/message policies; shared on-foot controls and comfort preferences. Inspect the existing course, guidance, simulation, water, observation and scene modules before introducing new state.

**Build the decision view:** place a safe approach bank, identifiable outlet, unobstructed destination and visibly connected dry alternative in one understandable composition. Give the player room to look, turn and reverse without catching on decoration. Show the alternative's destination or connection; a sign naming an invisible route is insufficient.

**Implement the decision:** derive the physical signal, optional countdown, audio phase and hazard eligibility from the same authoritative state. For a crossing recommendation, include approach travel, remaining channel travel, far-bank clearance and the declared reaction reserve at the player's current movement speed. A drained state has no countdown. Joe uses his real route and perception state throughout.

**Implement the mistake:** make the current's visible direction agree with a bounded displacement toward a valid landing. Preserve a useful steering response, prevent immediate repeated water hits, and ensure the recovery itself does not force contact with an already committed blade. A recovery can cost enough position that the player must react afterward; it need not guarantee eventual survival. Check both banks, edges, nearby cover and an occupied landing.

**Verify the alternatives:** test early, closing and dangerous arrivals; walk, sprint and crouch; both crossing directions; and legitimately reachable near/far Joe positions. Record initial state, advice, chosen route, travel time, water hits, displacement, attack opportunity and final outcome. Use ordinary movement to complete representative examples. If a scripted pilot fails, investigate its inputs before concluding the situation is unwinnable. Include the approach from the previous crossing so isolated fixtures do not hide an impossible sequence.

**Verify interruption:** pause at warning onset, change stance during approach, turn away, retreat, lose input focus, die and retry. Signals and danger must resume together; no stale CROSS recommendation, stuck movement, bypassed warning or lost durable progress. Inspect the decision view at all four supported review sizes, with actual touch controls visible where applicable.

**Observe the experience:** let an unfamiliar player try without advance route coaching. Ask what made them cross or detour, what the warning meant and what they would change after a mistake. Record confusion and perceived unfairness separately from mechanical failures. Tune geometry, cue timing and route cost from those observations; do not increase enemy speed simply to make every attempt tense.

### Detailed reference work card: range sequence and final escape

**Review IDs:** 1, 9, 10, 13, 14, 15, 20, 41, 42. **Player problem:** an individually useful wet crossing may lose its entire advantage at the next outlet, leaving the dry perimeter as the obvious choice. More crossings do not create more interesting decisions if the best answer remains unchanged.

**Ownership:** local outlet cadence, route connections, safe landings, Joe's navigation and keeper closure. Preserve shared movement, look, comfort, interaction and save contracts. Reuse current implementations before adding another timing or pursuit system.

**Required experience:** the player reads the first outlet, commits, reaches a landing where the next outlet is visible, and reassesses using the time and separation they actually earned. An early wet crossing should sometimes create a useful opportunity downstream. An unfavorable opening should sometimes make the dry route preferable. Both choices must reconnect clearly. The keeper approach combines these learned decisions with reaching and operating a physical release; it introduces no unexplained final rule.

| Situation | Required behavior | Evidence |
| --- | --- | --- |
| Favorable arrival | A timely wet crossing creates an advantage that survives far enough to affect the next decision or escape. | Compare travel, waiting, threat exposure and outcome through the whole sequence, not just to the first landing. |
| Unfavorable arrival | A visible dry route or safe wait provides a sensible alternative with a readable cost. | Compare both policies from the same initial phase, player position and legitimate Joe state. |
| Late entry or hesitation | Water costs position through understandable motion; the recovery has a reachable continuation. | Run both-bank recoveries with nearby cover and Joe, then continue to the next decision using ordinary inputs. |
| Joe reaches a narrow connector | Joe respects body and blade clearance; the player can recognize preparation and attempt a valid evasion. | Check sustained behavior for repeated wall-blocked attacks, stuck turns, body obstruction and hidden reach. Verify the actual escape inputs before blaming either the route or a scripted pilot. |
| Skilled escape | Earned separation remains earned, and the physical gate closure still gives a clear payoff. | No relocation or speed change to put Joe into an ending shot. Present sound and aftermath appropriate to his actual position. |
| Retry or interruption | Restored progress produces a coherent sequence; pause cannot desynchronize outlets, advice and damage. | Retry applicable checkpoints, retain durable pump facts and repeat warning-boundary interruption checks. |

**Comparison procedure:** begin at the preceding playable checkpoint and carry continuous player, water and Joe state through both outlets and the keeper approach. Sample a complete outlet cycle, with additional samples around opening/closing boundaries, for walking, sprinting and cautious movement. Also test representative fresh chapter runs so checkpoint fixtures do not conceal the consequences of the preceding encounters. Do not reset Joe or select a favorable phase between crossings.

Record total travel time, waiting by outlet, water hits, recovery location, attack opportunities, completion and final separation. Evaluate tradeoffs together: a faster route can legitimately be more exposed. If the same route is both faster and safer throughout the sampled meaningful arrival states, revise cadence or geometry before adding spectacle. A balanced design does not require equal route usage or the same outcome from every arrival.

**Experience acceptance:** an unfamiliar player can describe why they chose each branch and what changed on reaching the middle landing. Observe whether they notice the next opening, can recover from one mistake, and experience the secured gate as relief. Keep these observations separate from automated completion. Do not add mandatory delay, reduce familiar movement speed or secretly accelerate Joe to manufacture a climax.

## Delivery order and completion report

Deliver reliable rules first, integrate the shared foundations needed by the next encounter, prove one pressured crossing, complete the sequence, then refine presentation and devices. Revisit layout using playtest evidence throughout. These are dependency gates, not separate approval requests.

| Milestone | Playable deliverable | Exit criteria |
| --- | --- | --- |
| 1. Trustworthy foundation | Familiar movement and look; correct bindings; reliable pump progress, interactions, retries and closure. | Reproduce or retire the original correctness findings against the current build. Verify successful use, rejection, interruption and reload. Applicable shared consumers retain their intended behavior. |
| 2. One complete pressured encounter | A legible wet/dry choice, Joe approaching physically, a recoverable water mistake and a committed, avoidable trimmer attack. | Complete early, late and dangerous arrivals with ordinary controls. Review what the player can see and hear before committing. Confirm that a water mistake changes position and the next decision rather than only reducing speed. |
| 3. A coherent chapter | Protected lesson, noticed arrival, bunker separation, observable pump reversal, alternating range and secure escape. | Each space adds a distinct decision or payoff. Test continuous wet, dry and mixed routes, including changing stance between crossings. Preserve earned leads and credible recovery options; do not tune around one perfect route pilot. |
| 4. Convincing presentation | Grounded Joe and tool poses, connected architecture, distinct golf infrastructure, clear flow and deliberate sound staging. | Inspect moving actors, close views, reverse approaches and occupied thresholds. Signals and destination remain readable during effects. Test the safe aftermath with Joe both nearby and legitimately far away. |
| 5. Campaign integration and experience review | Working settings and input lifecycle across applicable chapters, usable compact layouts, measured performance and actionable playtest findings. | Verify shared changes through ordinary UI and chapter transitions. Separate automated checks, visual inspection, actual-device results and unfamiliar-player observations. List unverified experience claims explicitly. |

Apply these milestones to remaining work after reconciling the ledger; they do not require redoing completed stages. Address a newly discovered correctness regression immediately rather than deferring it to its original package.

For scope decisions, prefer strengthening an existing action over adding another mechanic. Do not add health, combat upgrades, stamina, swimming or jumping to solve the water challenge. Do not require a narrow timing trick at every outlet: vary commitment, observation, route choice and recovery while keeping the underlying rules stable. Treat more signs, more effects, more checkpoints and a longer level as hypotheses that need a demonstrated benefit.

The final handoff must identify three things separately: **what changed in Under the Green; what now behaves consistently across existing chapters; and what still needs human or physical-device evaluation.** Provide evidence for the actual consumers, not only for newly extracted helpers. A gameplay feature can be implemented and mechanically verified while its emotional impact remains unvalidated.

For each completed package, report the review IDs, player-visible change, actual shared consumers, tests/inspection performed and remaining limitations. Update the existing ledger. Preserve working implementations and existing saves. Deliver a playable result with honest acceptance status, not just new abstractions or an expanded feature count.
