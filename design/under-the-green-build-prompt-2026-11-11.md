Implementation prompt: finish Under the Green and consolidate the appropriate Rough Cut systems

For a focused copyable task, start with `design/under-the-green-implementation-handoff.md`. This expanded document retains the detailed acceptance cases and all 44 ownership mappings.

The handoff also supplies the design disposition (required foundations versus solutions to prototype), complete first-crossing and continuous range-sequence acceptance scenarios, and the verified scope of Final Cut's existing shared preference/binding consumers. Use those boundaries with the detailed requirements here; they do not replace the 44-item coverage.

Refined November 12, 2026. This is an implementation brief, not a completion report. The original review is historical evidence; verify current behavior before replacing work already delivered.

Copyable task instruction: **Use this document as the build specification for all 44 review items. First reconcile the review with the current implementation ledger. Then finish the remaining work in the delivery order below, including the applicable cross-chapter integrations. Preserve Level 1's movement and normal vertical mouse look, Back Nine's intentional steering/camera differences, and the existing campaign branches. Deliver a playable, verified result with an honest record of remaining human/device validation.**

**Implementation handoff: decisions to establish before changing the build**

Produce a concise delta plan against the current build, rather than treating the historical review as 44 newly discovered defects. For each ticket below, identify what already works, the remaining player-visible problem, its owner (campaign service, control profile or chapter), and the evidence needed to close it. Preserve working fixes and existing saves. Documentation-only preparation is not evidence that a runtime feature has shipped.

Treat the campaign as a branch: the Level 1 drain leads to Under the Green, while the shed leads to Back Nine. Under the Green must teach its own water and trimmer rules without assuming the player completed Back Nine. Final Cut implementation files now exist. Preserve its current work and transitions, and include its applicable shared-system consumers in integration checks. Rebuilding that chapter is outside this brief.

Resolve three experience questions in the playable prototype before expanding its decoration:

- **Does water create a decision?** Compare an early opening, a closing window and a full discharge with Joe at several legitimate approach distances. Record what the wet crossing gains, what the dry route costs and what remains possible after a mistake. A permanent slowdown alone does not meet the requirement.
- **Does Joe create understandable pressure?** Observe the normal approach, a missed window and a successful escape from sight. Players must have evidence of his approach and recognize his attack preparation. Never use a minimum enemy-distance target that punishes a well-earned lead.
- **Does each encounter change the task?** Walk through the protected lesson, pressured route choice, bunker separation, pump reversal, alternating crossings and secured escape. Name the new decision and the relief earned in each. Merge repetition instead of adding length to meet a duration target.

For these questions, separate simulation evidence, visual/audio inspection and unfamiliar-player observations. Mechanical correctness can close a defect; it cannot by itself close an acceptance claim that the experience is fun or frightening.

You are working in the existing Rough Cut repository. Implement the improvements in the Under the Green review as a sequence of concrete, tested changes. Deliver a complete local playable chapter and the shared improvements specified below. Do not stop at a plan, an abstraction layer, or isolated screenshots. Preserve unrelated workspace changes and inspect current repository instructions before editing.

Read design/under-the-green-review-2026-11-11.md, its 44-item backlog at output/under-green/review/improvement-backlog.json, the encounter design, and the current source before starting. Reproduce findings against the current build; the November 11 measurements are baselines, not assumptions that every defect still exists. Maintain a short implementation ledger linking all 44 review items to changes, evidence, or a justified disposition. Experimental design proposals require evaluation, not blind implementation.

Read design/under-green-implementation-ledger.json before making that ledger anew. Some fixes and shared helpers already exist, including preference-store.js, control-profiles.js, interaction-rules.js, hazard-timing.js, audio-spatial.js and local-telemetry.js. Inspect their actual consumers and evidence, extend working implementations, and close integration gaps. An existing module or an old passing report is not proof that every chapter meets the requirement. Reproduce the remaining pursuit problem against the current layout before choosing new geometry; retain historical route measurements for comparison.

**Design consistency decisions**

These improvements fit Rough Cut when they strengthen its existing action-and-response contract: readable danger, responsive movement, physical mechanisms, evidence-led pursuit and persistent consequences. Follow design/action-response-contract.md and the current pixel 3D direction identified in design/world-and-presentation-contract.md. Under the Green should be recognizable as the same game while providing a different kind of pressure.

- Share player expectations: normal look direction, truthful prompts, predictable interaction reach, danger-message priority, accessible settings, immediate retry and reliable saves. A player should not have to relearn these when entering the drain.
- Preserve intentional mode differences: Level 1 and Under the Green share the first-person movement profile; Back Nine's cart and runner retain steering and a following camera. Share action identities and preference infrastructure without forcing identical key assignments or camera behavior across those profiles.
- Keep the chapter's identity local: walking Joe with a hedge trimmer, irrigation cycles, wet/dry route decisions, the pump reversal, checkpoint locations and the keeper gate. Other chapters can use the same timing or interaction helpers without acquiring these mechanics.
- Revise proposals that would weaken the game: no water that merely makes movement tedious, no compulsory long waits, no fixed target duration filled with corridor travel, no punishment for earning distance from Joe, and no extra HUD meters that reveal information the player has not observed. Use layout and readable consequences to make decisions matter. Local diagnostic telemetry stays opt-in and outside the player-facing experience.
- Keep drama physical and playable: stronger staging, sound, silhouette, attack commitment and visible environmental change should carry the escalation. Avoid mandatory camera turns, added combat/stamina systems, arbitrary enemy acceleration or spectacle that obscures the next decision. Preserve the finale as a separate chapter.

Success means players can understand the choice, act with familiar controls, see why the outcome occurred, and recover or retry without ambiguity. Tests can establish mechanical correctness; claims that the chapter is frightening, fair or enjoyable also need observed unfamiliar-player sessions.

**Scope verdict for the build**

The review is consistent with the existing game as a set of player-experience goals. It is not a requirement to copy every proposed implementation into every chapter. Use three ownership levels: campaign services, movement/control profiles, and authored chapter content. Share the rule that a warning is truthful; keep what triggers that warning specific to the hazard. Share the player's preference for reduced motion; keep the pump animation and mower presentation distinct. Share reliable persistence; keep each chapter's saved facts independent.

Treat control, save and accessibility consistency as campaign work from the outset. Apply the same quality standard to clipping, sound intelligibility and readable scenery throughout the game, but scope this delivery's geometry and art rebuild to Under the Green plus concrete regressions caused by shared changes. A quality standard is not authorization to redesign every existing level. Level 1's golf-ball interactions and Back Nine's vehicle actions remain their own verbs; Under the Green does not need to reproduce them to belong to Rough Cut.

Before broadening any feature, answer: which other current chapter needs it, what existing behavior must it preserve, and what player-visible check proves the integration? If only this chapter needs it, keep it local. Do not globalize trimmer capture rules, water penalties, forced enemy proximity, checkpoint placement or encounter duration.

**Build tickets and acceptance evidence**

Use the tickets below as implementation units within the delivery gates. Their review IDs cover all 44 items; overlap is intentional where a feature needs both a local implementation and a shared integration. Reconcile each ticket with the current ledger before editing. These are requirements for future work, not claims about today's implementation.

| Ticket / review IDs | Concrete work | Required evidence before closing |
| --- | --- | --- |
| A. Progression and persistence — 2, 3, 7, 8, 16 | Define the gate's protected region, barrier occupancy and cancellation rules. Bind Use to the visible release. Persist the pump immediately as a durable fact. Make the pump requirement apparent before leaving its district. Restore checkpoints at coherent encounter entries, retaining solved mechanisms and collected evidence. | Start closure then retreat; have Joe enter the threshold; interrupt and reload during closure. None produces false victory. Operate the pump then fail before the next checkpoint: it stays operated. A new player identifies why the pump matters before reaching the keeper room. Restarting this chapter preserves sibling saves and preferences. |
| B. Shared controls and settings — 6, 36, 37, 38, 44 | Connect settings to a validated authoritative store and connect prompts to the active action resolver. Finish per-device sensitivity and comfort UI. Preserve normal vertical look in Under the Green. Support keyboard, controller and touch menu operation, cancellation and reconnect. Preserve Level 1 movement and Back Nine's separate steering profile. | Change a preference through ordinary UI, transition and reload: each applicable consumer honors it. Remap Use to T: input and all visible hints agree. Interleaved settings writes preserve unrelated fields. Corrupt/unavailable storage permits play and session changes. Resume never inherits a stuck movement or confirmation input. |
| C. Water decisions and recovery — 4, 5, 10, 15, 27 | Derive outlet signals, sound, advice and damage eligibility from the same phase state. Include approach distance, stance and far-bank clearance in crossing advice. Make timely wet travel useful and dry travel a credible alternative. Animate a bounded current into a reachable catch landing, with visible direction and restored steering. | Sweep arrival phases and walk/sprint/crouch approaches from both banks. Every advertised walking crossing is achievable with the declared reserve. Late entry has an understandable positional cost and a usable next action. No invented countdown, instant unexplained relocation, repeated pulse hit or forced landing inside an already committed strike. Compare both branches across varied arrivals; neither should dominate every scenario. |
| D. Pursuit and encounter sequence — 1, 9, 11, 12, 13, 21 | Build the protected lesson, visible arrival, spillway choice, folded bunker, pump reversal and alternating range as distinct beats. Sustain pressure through connected geometry and evidence-led decisions. Stage the machinery payoff from Joe's actual position. Keep a clear next destination after each success or mistake. | Complete ordinary wet, dry, cautious and sprint routes. Record where Joe becomes irrelevant and whether the lead was earned. Inspect the entrance from the normal approach. Verify loss of sight changes search behavior and every service route is physically connected. Test each range outlet independently and in sequence; never require an impossible mandatory wait while Joe closes. |
| E. Joe's body and attack — 18, 19, 20, 23 | Author grip-consistent carry, idle, turn, prepare, sweep and recovery poses. Match stride to traveled distance. Align visible blade motion, swept collision and cover obstruction. Review entrance, corner, water-wait and threshold poses against scenery and the player's camera volume. | Capture preparation, active sweep and recovery with collision overlay, then review at normal speed without it. A committed dodge succeeds; the blade cannot retarget or hit through solid cover. Ordinary proximity is not trimmer defeat. Test extreme supported FOV/pitch, crouch and both actors near moving geometry. Record sample coverage and remaining animation issues. |
| F. Architecture and golf identity — 24, 25, 26, 28, 29, 30 | Finish roofs, portals, shafts and fixture supports. Give roots, bunker drainage, pump plant, range screens and keeper room distinct shapes and restrained materials. Place one primary sign per decision and connect routes through architecture. Keep stable lighting and show the course above through purposeful golf details. | Walk forward, backward and sideways; inspect upward and close views. No exposed construction voids or misleading collision edges. At desktop and compact sizes, players can distinguish destinations without district labels. Lamp transitions do not visibly pop; surface detail and props do not obscure the bank, control or escape route. |
| G. Threat feedback and sound — 22, 31, 32, 33, 34 | Base captions on observable movement, perception and wait reasons. Give trimmer idle, steps, windup and recovery distinct cues. Add entrance, pump and gate events plus safe aftermath. Position water by actual source distance and use restrained occlusion. Give Listening Focus an audible benefit consistent with Level 1. | Imminent attack wins over optional coaching. Searching is not labelled following; stationary Joe is not labelled getting closer. Listen on headphones and speakers during overlapping water/attack events. Confirm mute, focus, pause/resume and chapter transitions. Signals remain usable without sound; sound-quality acceptance remains open until listening occurs. |
| H. Learning, reward and relief — 14, 17, 35, 39 | Teach through one safe crossing, retire learned coaching and keep the phone's decision point visible. Make the optional record recognizable, quick to acquire and safe to read later. Explain failure from recorded events. After secure closure, retain player control for a short safe aftermath before results and evidence recap. | A first-time player explains the water rule after the lesson. Skipping evidence never blocks completion. Failure advice names an action supported by the actual attempt. Inspect the crossing at 390×844 and 844×390 with touch controls. Secured success cannot be revoked; a large earned lead still receives a satisfying ending without relocating Joe. |
| I. Performance and maintainability — 40, 44 | Keep authoritative rules separate from rendering/input adapters, improve touched modules' readability and reuse existing helpers. Measure startup, normal play and the busiest encounter. Optimize demonstrated costs, with renderer-specific resolution limits and bounded effects. | Record device, renderer, resolution, duration, frame-time distribution and resource growth. Verify HUD readability at reduced scene resolution and after pause/retry. Run sustained sessions on available hardware; clearly distinguish hardware, software rendering and simulated mobile viewports. Do not call a short desktop trace a phone-performance pass. |
| J. Regression and experience validation — 41, 42, 43 | Maintain failure-boundary regressions and opt-in local encounter reports. Observe unfamiliar players across available input methods. Use their actual hesitation, route choice, mistakes and explanations to revise the experience. | Each original correctness defect has a current reproduction or passing regression. Mandatory crossings have phase × approach-speed × Joe-distance coverage within a documented recoverable envelope. Record first-time sessions separately from scripted paths. A feature may be mechanically verified while fun, intimidation, device ergonomics or sound quality remains pending. |

For each ticket, produce a short work card: current behavior; chosen change; dependencies; affected chapters; success, mistake, interruption and reload checks; evidence paths; unresolved acceptance. Do not set difficulty from completion time alone. The useful questions are whether a choice changes the outcome, whether the player can perceive that choice, and whether a mistake teaches a recoverable lesson.

**What must be global now, and what should only be reusable**

Campaign preferences, applicable action labels, menu/input lifecycle and safe storage operations need real integration across their existing consumers. On-foot movement, camera response and ergonomic sprint/crouch options belong to the Level 1 / Under the Green profile. Back Nine retains its separate control semantics even for its runner.

Timing helpers, reach/visibility calculations, spatial audio math, clearance tools and diagnostic report formats should be reusable where they fit. Their existence does not require migrating every unrelated system in this delivery. Adopt them in another chapter only to close an applicable consistency requirement or a demonstrated defect, and verify the behavior there. Across all chapters, uphold truthful feedback, accessible information and physical collision even where the internal implementations differ.

Keep water recovery, trimmer attacks, enemy perception tuning, checkpoint placement, scene lighting and dramatic choreography local. In particular, do not replace Level 1's mower capture rule with the trimmer's blade-contact rule. Consistency means each danger explains its own counterplay; identical loss conditions would erase the chapters' distinct identities.

**Cross-chapter acceptance checks for shared features**

Treat the following as required integration scenarios, not a claim that the current build already passes them. Test changes through the player's settings and ordinary chapter transitions as well as isolated helpers.

| Feature | Required integration check | Boundary to preserve |
| --- | --- | --- |
| Audio, captions and comfort | Change an applicable preference in one chapter, enter each other chapter, reload, and confirm it remains effective and editable. Verify mute and reduced motion during an actual hazard and dramatic event. | Dialogue captions, sound captions and essential hazard information retain their distinct policies. Local effects cannot override a global comfort restriction. |
| Bindings and action prompts | Remap Use in the first-person profile; verify the actual input and every visible prompt in Level 1, Under the Green and Final Cut's existing on-foot consumers, including pause, retry and interactions. Switch input devices and check the labels. | Back Nine retains its own brake/use and rear-view defaults. An action name is shared only where its meaning matches. |
| Movement and camera | Compare walking, sprinting, crouching, diagonal movement, stopping, vertical look and rear glance across applicable Level 1, Under the Green and Final Cut on-foot consumers under the same preferences. Include small cardinal/diagonal stick deflections at multiple saved deadzones, sensitivity changes, transition and reload; compare physical distance after unit conversion. | Preserve documented, intentional finale differences. Do not apply first-person strafing or free look to Back Nine's cart or steering-based runner. Keep camera collision and world-unit conversion scene-specific. |
| Menu and input lifecycle | Complete start, settings, journal, pause, retry and chapter navigation with each supported input method; interrupt with blur, cancellation or controller disconnect and resume safely. | Adapt existing screens; avoid replacing unrelated UI solely to share its implementation. |
| Saves and irreversible progress | Change settings, operate the pump, retry, reload and restart a chapter; confirm each action preserves the intended durable facts and unrelated chapter saves. Test corrupt and unavailable storage. | Shared storage code must not share checkpoint IDs, enemy positions or mechanism facts between chapters. |
| Resolution and performance | Change the shared scene-resolution preference, transition between chapters and verify each renderer honors it while text and controls remain readable. Measure normal play and a demanding encounter separately. | Share the preference and measurement tools; use renderer-specific resolution caps and measured quality budgets. Automatic adaptation must preserve the user's chosen maximum. |
| Danger feedback and interactions | In each affected chapter, verify urgent danger wins over optional coaching and that Use succeeds only at the visible, reachable, unobstructed target. | Preserve each chapter's deliberate hold, brake, sealing and attack rules; do not replace them with a universal action or capture radius. |

For every shared change, name the actual consumers and record their integration result. If a consumer remains unfinished, report the feature as partially integrated. For local art, AI and encounter work, apply the campaign's quality standards without expanding this task into a redesign of the other chapters.

**Player experience to build**

The repeatable decision is: read the outlet and Joe's observable approach, choose a crossing or detour, commit with familiar movement, then use the resulting position. Every major encounter should change one part of that decision rather than simply increase a timer or repeat a corridor.

| Moment | Required player experience | Implementation / acceptance boundary |
| --- | --- | --- |
| Approach | See the safe bank, destination and alternative before entering danger. | Assess advice from the player's current position and stance. Do not advertise an opening that requires a sprint when the player is walking. |
| Pressure warning | Understand that the outlet is about to become impassable and hear Joe continue approaching. | Physical signal, sound, caption and simulation agree. Supply a symbol or text cue as well as color; essential information survives mute and comfort settings. |
| Successful crossing | Gain a useful positional advantage and understand how it was earned. | Joe obeys the same authored obstruction rules. Show his delay when visible; do not manufacture a reaction when he is elsewhere. |
| Late crossing | Lose position through a brief readable current and have a clear next action. | Water is a timing and positioning hazard, not a persistent movement tax. Protect the bounded recovery from an already committed strike and repeated immediate water hits. |
| Joe reaches attack range | Recognize his planted preparation, leave the blade's committed path or use solid cover. | A valid, unobstructed blade contact causes defeat; proximity alone does not. Animation, sweep and collision agree. Do not add an unexplained health system or unavoidable capture radius. |
| Failure | Understand the actual cause and retry the relevant encounter quickly. | Coaching comes from recorded events. Restore a coherent checkpoint and retain durable mechanism progress and player preferences. |
| Escape | Get inside, operate the visible control, establish a secure boundary and experience relief. | Completion requires the correct side and safe closure. Abandoned closure resolves honestly. Once success is secured, the aftermath cannot revoke it with a surprise attack. |

**Priorities and limits**

Treat reliable progression, truthful hazard advice, consistent controls, dynamic clearance and a meaningful wet/dry decision as required outcomes. Art, sound and animation then reinforce those proven rules. Treat exact route shapes, checkpoint coordinates, particular animation techniques and touch-sprint gestures as implementation choices to evaluate, not mandatory features to accumulate.

Global means an applicable preference or rule behaves consistently wherever the player encounters it; it does not mean every chapter must expose the same mechanics or every option must be copied into every screen. A shared audio setting must reach each active mixer. A shared caption policy must preserve essential hazard information. A shared save helper must preserve independent chapter progress. Reuse is accepted through these visible results, not by counting shared modules.

For each item, record: review ID, current verified behavior, intended player benefit, global/profile/local owner, affected consumers, implementation tasks, acceptance scenarios and remaining evidence. Keep implementation status separate from automated verification and human playtest status. Use the 44-item ownership table below to ensure that no review item disappears during prioritization.

**Execution order and delivery gates**

Use this prompt as the implementation brief. Establish current status first; do not rebuild completed features because they appeared in the original review. For each remaining item, record the player-visible problem, its owner, the smallest coherent change, and the evidence needed to accept it.

| Delivery | Required result before moving on |
| --- | --- |
| 1. Reliable rules | Gate completion, durable pump progress, truthful water timing, valid interaction reach and binding labels work at their failure boundaries. No known progression blocker remains. |
| 2. Consistent foundations | Applicable existing chapters consume the shared preference, input/prompt, interaction and lifecycle changes. Verify each consumer; keep intentional control-profile differences. |
| 3. Convincing encounter | One pressured crossing proves that arrival timing changes the wet/dry decision, mistakes have readable recoveries, and success genuinely delays Joe. Use this evidence to tune the remaining route. |
| 4. Complete playable sequence | Lesson, arrival, spillway, bunker, pump, range and keeper escape work together through ordinary input. Check every checkpoint and optional evidence route. Record where pursuit becomes irrelevant and whether that separation was earned. |
| 5. Presentation and devices | Dynamic geometry, animation, water, sound and UI communicate the established rules. Validate supported viewports and input lifecycle, then measure performance on available hardware. |
| 6. Experience validation | Observe unfamiliar players, address repeated confusion and unfair failures, and report remaining human/device validation honestly. Automated completion alone does not close this gate. |

These are dependency gates, not permission checkpoints. Continue authorized implementation without requesting approval for each stage. Integrate a shared helper when its first real use requires it; avoid delaying a playable encounter for a speculative infrastructure rewrite. Keep a stage open when its evidence is incomplete and continue independent work that can still be verified.

In each delivery report, separate implemented changes, verified outcomes and remaining work. Link the relevant review-item IDs and evidence. Do not treat the existence of this prompt, a shared module, or a test script as delivery of the player experience.

Treat the review as three kinds of work. Confirmed correctness problems must be fixed or demonstrated already resolved. Experience goals such as sustained tension, clear water decisions and a satisfying escape need implementation plus evaluation. Proposed solutions such as a particular route shape, touch sprint gesture or lighting technique are candidates: select the simplest solution that meets the goal and record why. Completing the list does not mean adding every proposed mechanic indiscriminately.

The chapter should contribute a distinct escalation to the campaign: Level 1 establishes observation, evasion and physical mechanisms; Back Nine emphasizes steering and vehicle pursuit; Under the Green makes a slow pursuer dangerous through timing, constrained space and irrigation decisions. Keep Joe recognizable across these roles. Do not copy the mower chase into the tunnels or make the finale necessary to enjoy this chapter's own resolved escape.

1. **Outcome and non-negotiable game identity**

Under the Green is a deliberate on-foot pursuit beneath the golf course. The player moves faster than Joe, reads water pressure, chooses between a timely crossing and a longer dry route, redirects irrigation, and physically seals Joe out. The tension comes from these spatial decisions and Joe's visible, legitimate approach.

Keep Level 1's established on-foot movement feel and non-inverted vertical mouse look. Retain camera-relative movement, normalized diagonals, immediate stopping, existing mouse filtering, separate device sensitivities, supported hold/toggle preferences, and rear glance that does not alter the travel heading. Preserve free camera control during dramatic moments. Do not slow the player, add a stamina tax, force camera turns, or add jumping/swimming precision to compensate for weak layout.

Joe always walks in this chapter. Do not teleport him, read the hidden player position, or secretly increase his speed when the player earns a lead. Improve baseline geometry, connected routes, information and timing. Experienced players may still earn clean escapes. This chapter's pursuit rules must not replace the established mower or vehicle pursuit rules in other chapters.

Preserve the golf setting, existing stylized materials and Joe's recognizable appearance. Use existing assets where appropriate. Add district-specific detail and authored animation where it improves clarity or drama. Do not introduce unrelated monsters, random jump scares, a new combat system or unrelated collectibles.

Preserve the campaign branches: the Level 1 drain continues to Under the Green; the shed continues to The Back Nine. Final Cut now has implementation files and a chapter entry point. Preserve that work; verify the bounded transition and shared-system compatibility needed here without expanding this brief into a finale rebuild or claiming its acceptance.

2. **Architecture: decide what is shared, profiled and local**

Share stable player-facing rules and reusable low-level helpers. Keep different game modes different. Prefer small functions and adapters over a new universal game framework. A shared helper should be used by the applicable current consumers and covered by integration checks; an unused shared folder is not a completed improvement.

| Area | Required scope | Rules |
| --- | --- | --- |
| Settings validation, master audio, captions and comfort | Campaign-wide service | Normalize values, preserve unrelated fields and legacy storage, and apply intentional user preferences across chapters. Keep chapter-specific effect intensity as an override beneath global accessibility constraints. |
| Action identities, remapping and prompt generation | Campaign-wide service with control profiles | Input handling and displayed labels resolve through the same action mapping. Profiles retain their existing defaults and contextual actions. A shared action identity does not require one physical key in every mode. |
| On-foot movement/look | Shared Level 1 + Under the Green profile | Reuse existing foundation/math, mouse filtering and stance behavior. Preserve each chapter's collision geometry and explicit coordinate conversion. |
| Cart/chase runner movement | Existing Back Nine profile | Preserve steering, throttle/brake and the camera following heading. The current Back Nine runner also uses steering; it deliberately ignores mouse/right-stick free-look. Do not apply the FPS profile merely because the character is on foot. |
| Menu focus, controller navigation, touch cancellation, pause/blur lifecycle | Shared utilities and behavior contract | Integrate with existing canvas/DOM menus through adapters. Do not rewrite all screens into one UI technology. |
| Interaction eligibility and prompt ownership | Shared calculation/policy, chapter-authored targets | Reach, facing, obstruction and enabled-state checks agree with the visible target. Preserve mode-specific hold/brake/closure actions. |
| Save validation/versioning and storage operations | Shared service, separate chapter payloads | Share mechanics of persistence. Keep checkpoint IDs, chapter facts and transient state owned by each chapter. Do not reset a sibling chapter as a side effect of a settings or save migration. |
| Hazard presentation | Small shared timing/presentation contract where applicable | Share truthful countdown semantics, warning priorities and accessibility conventions. Do not impose Under the Green's water cycles, blocking rules or art on other hazards. |
| Audio infrastructure | Shared mix/preferences/position helpers | Reuse master settings, source-position conventions, cue priorities and lifecycle. Joe's trimmer vocabulary and this chapter's sound sequence remain local. |
| Art and rendering utilities | Reuse compatible existing helpers | Preserve a consistent visual language. Lighting placement, material variants, water shaders and district composition remain authored per scene. |
| QA and performance measurement | Shared harness/report shape | Reuse deterministic hooks and device checks, but set evidence-based budgets and scenario coverage for each mode. |
| Enemy AI, encounter layout, checkpoints, water cycles and set pieces | Under the Green-specific | Do not globalize walking speed, perception tuning, trimmer hit rules, route graphs or water penalties. |

Inspect web/foundation.js, web/quality-core.js, web/mouse-look.js, web/spatial-preferences.js, web/spatial-controls.js, existing game.js binding labels/settings, and the Back Nine control/audio/presentation helpers before creating replacements. A data-only spatial-preferences.js now exists alongside the Level 1 study-setup UI adapter. Verify its actual integration rather than creating another store or loading the Level 1 UI into other chapters. The Under the Green slider/handler units mismatch was corrected in the November 12 spatial-settings pass: the UI stores a 0.25–2 multiplier and the runtime derives Level 1's mouse gain. Preserve that distinction; use qa/under-green-spatial-settings-2026-11-12.md and current tests as evidence, not this source map alone.

Level 1 foundation speed values are in legacy course units; the 3D presentation currently uses RCQuality.scale.meters = .16. Under the Green uses metres. Preserve the measured baseline of 3.84 m/s walk, 6.08 m/s sprint, 2.4 m/s crouch/listen, 1.65 m standing eye and 1.12 m crouched eye unless an explicitly justified, approved design change supersedes it. Do not accidentally use foundation.units.visual as the physical conversion.

Existing controls have deliberate conflicts across modes: Q is Listening Focus in Level 1/Under the Green and rear view in Back Nine; E is Use in the former and a brake/finish-related control in the latter. Preserve existing defaults and user remaps through named profiles. Do not silently change Back Nine to R-rear or pointer-lock camera control. Newly shared preferences must not reactivate inverted mouse look against the user's requested normal behavior.

Use these concrete integration checks to decide whether a shared feature is actually finished:

| Shared feature | Required player-visible proof |
| --- | --- |
| On-foot controls and prompts | Remap Use to T in the on-foot profile, enter the drain, and verify both activation and every visible hint use T. Move and look in both chapters with equivalent settings; normal vertical look and stance speeds agree. Enter Back Nine and verify its steering, rear view and camera still behave as designed. |
| Campaign comfort and audio | Change master volume, captions and reduced motion, visit each playable chapter, then reload. Each applicable choice persists and takes effect. A local intensity slider cannot re-enable an effect disabled globally. Muting dialogue captions does not remove necessary hazard signals. |
| Interaction rules | Approach a visible control from a valid position, an obstructed position and beyond reach. Prompt availability and activation agree in each case. A shared eligibility helper does not replace Back Nine's specific braking or finishing conditions. |
| Save infrastructure | Operate the pump, fail before the next checkpoint and reload: the durable change survives. Restart Under the Green: unrelated chapter progress and preferences survive. Test legacy, invalid and unavailable storage without losing unrelated fields or preventing play. |
| Menus and input lifecycle | Start, change settings, pause, retry and leave using a controller alone. Interrupt a held movement input with blur, disconnect or touch cancellation; resume without unwanted movement or an accidental confirmation. |
| Hazard and message conventions | An imminent strike takes priority over a checkpoint notice. A timer agrees with the real transition; event-controlled states do not invent a countdown. Other chapters use the same clarity and priority rules while retaining their own hazard mechanics. |

Describe scope in the settings UI where it matters: campaign preferences affect all applicable chapters; on-foot bindings affect their current consumers in Level 1, Under the Green and Final Cut; chase bindings retain their separate scope; and chapter difficulty or presentation options affect only their named chapter. Recheck these consumers before changing the UI. Shared infrastructure must not silently broaden the effect of an existing local setting.

**Resolve these consistency questions explicitly**

| Proposal | Decision and implementation boundary |
| --- | --- |
| Stronger water punishment | Keep it local and positional: a readable shove costs a crossing opportunity and lets Joe gain ground. Do not add a campaign-wide slowdown, damage meter or swimming system. First establish that the recovery landing is safe from an already committed strike. |
| More persistent pursuit | Improve the physical route and Joe's evidence-led choices. Do not make permanent proximity a global difficulty rule. A successful diversion or well-timed crossing must still buy real relief. |
| Shared danger feedback | Share priority and accessibility conventions; provide threat data through chapter adapters. A trimmer windup, mower approach and cart collision need different cues. Do not show a hidden enemy's exact distance or intent. |
| More cinematic drama | Author local entrances, machinery changes, sound and aftermath while preserving camera control. Keep the golf setting and pixel 3D materials. Do not turn this route into another vehicle chase or spend the finale's entire spectacle here. |
| Better checkpointing | Share reliable storage, restart behavior and validation. Keep checkpoint positions, restored water phases and Joe's legitimate starting approaches local. A save service cannot decide what makes an encounter fair. |
| More useful Listening Focus | Match the on-foot action and preference behavior from Level 1, then tune the tunnel mix. Do not turn it into wall vision or add it to Back Nine merely because the underlying audio helper is shared. |
| Touch sprint assistance | Share an optional ergonomic input method across applicable on-foot scenes. Preserve speed, collision and hazard timing. Keep driving throttle/brake behavior separate. |
| Improved art and clearance | Apply the same standards of readable silhouette, physical support and visible collision throughout the game. Author the actual roots, water, pump and keeper architecture in this chapter; avoid a campaign-wide asset replacement. |

For each shared change, identify the existing consumers, the authoritative source, the small adapter each chapter needs, and the regression that protects each mode. If a new helper serves only Under the Green today, keep its interface reusable without declaring campaign integration complete. Prefer integrating an existing helper over introducing a second source of truth.

**Current implementation entry points and integration boundaries**

The following source map was checked on November 12. It identifies places to inspect and extend, not proof that their behavior is finished. Recheck consumers before making changes; a helper imported by one chapter is not automatically a campaign service.

| Work package | Existing entry points | Required integration boundary |
| --- | --- | --- |
| Preferences and settings | `web/preference-store.js`, `web/campaign-settings-ui.js`, `web/spatial-preferences.js`, `web/spatial-controls.js` | The previously audited entry points (`game.js`, `under-green.js`, `back-nine.js`) import the campaign preference service. Also inspect `final-cut.js` and its actual consumers now that this chapter has implementation files. The spatial data service and chapter UI integration need separate verification. Verify actual mixer, camera, caption and comfort consumers, including slider units, live updates and persistence; script inclusion alone is not integration. Keep Level 1's DOM adapter local. |
| Action labels and profiles | `web/control-profiles.js`, `web/game.js`, `web/under-green.js`, `web/back-nine-controls.js` | Level 1 and Under the Green import the binding resolver. Back Nine now consumes its chase profile through keyboard-binding-settings.js, with independent chaseKeyboardBindings and binding-aware input/guidance. Its default Q rear view, E/Space brake/use and steering camera remain; see qa/chase-bindings-2026-11-12.md. Verify actual input, captions and profile isolation rather than treating the profile definition as integration. |
| Controller menus and interruption | `web/gamepad-session.js`, `web/dom-gamepad-menu.js` and each chapter's UI integration | Both later chapters use the DOM adapter; Level 1 also imports the session guard and adapter. Verify canvas settings and DOM dialogs separately, including opening, focus scrolling, closing, retry and exit. Held buttons across a menu transition or reconnect must not activate the next screen. |
| Physical interactions | `web/interaction-rules.js`, `web/under-green-sim.js` | The current helper is consumed by Under the Green. Compare other chapters' existing eligibility rules before adopting it. Adapt coordinate units and target surfaces explicitly; preserve hold, brake and completion semantics. Share eligibility where it fits, not every interaction's state machine. |
| Water timing and readable advice | `web/hazard-timing.js`, `web/under-green-course.js`, `web/under-green-guidance.js` | The water course currently consumes the timing helper. Keep outlet phases and travel-distance advice local. Adopt the same timed/event-controlled distinction elsewhere only when an existing hazard actually needs it. |
| Audio position and mixing | `web/audio-spatial.js`, `web/under-green-audio.js` and the existing chapter mixers | Under the Green currently imports the position helper. Verify each chapter's orientation and units before sharing calculations. Share master preferences and pause/resume behavior; preserve distinct mower, vehicle and trimmer cues. |
| Local diagnostic recording | `web/local-telemetry.js`, `web/under-green-observation.js`, `web/under-green-sim.js` | Current imports are Under the Green-specific. Keep recording optional and local. Reuse the event/report shape when another chapter needs it; do not add a campaign analytics rollout to satisfy this review. |
| Authored chapter content | `web/under-green-layout.js`, `web/under-green-encounters.js`, `web/under-green-scene.js`, `web/under-green-actor.js` | Own the route, encounter beats, scenery and trimmer staging here. Changes to a common Joe asset must be checked in the mower chapters; chapter-specific poses must not replace his other roles. |

Do not couple unrelated chapters to finish a local feature. For example, fixing the irrigation countdown does not require giving the mower a timer, and improving trimmer strikes does not require changing Level 1's established capture condition. The campaign-wide requirements are understandable warning, honest collision, consistent preferences and useful failure feedback; each chapter supplies its own implementation.

**Turn each work package into an acceptance-ready task**

Before editing a package, record its review IDs, current reproduction, player benefit, owning layer, affected consumers and dependencies. Specify observable outcomes for success, mistake, interruption and reload. Use implementation notes for candidate techniques; use acceptance checks for player-facing requirements. Finish the smallest complete encounter or shared integration before starting a second competing implementation.

Example task — **Make the spillway a readable timing decision** (items 1, 4, 5, 9, 10, 15, 22, 27, 35, 41):

- Goal: the player can judge a wet shortcut against a visible dry detour while Joe approaches, and understand the positional result of either choice.
- Scope: local route, outlet and recovery geometry; shared timing semantics, on-foot controls, message priority and comfort settings. Keep current movement speeds and non-inverted look.
- Build: expose both route entrances and the far bank before commitment; derive advice from actual position, stance and remaining safe time; align flow direction with a bounded recovery landing; show the physical consequence for Joe when he reaches the water.
- Success checks: an early walking arrival can complete a recommended crossing without sprinting; a timely crossing buys genuine separation; a dry-route arrival can reach the next decision without a compulsory water hit.
- Mistake checks: late entry produces visible motion toward a reachable bank, leaves a clear next action and cannot chain into an already committed unavoidable strike. Signals and advice change with the real phase rather than an independent display timer.
- Boundary checks: approach from both banks; stop or reverse inside the channel; arrive in each water phase; crouch or sprint; pause during warning/recovery; retry the preceding checkpoint; test Joe approaching, waiting and already across. A stale CROSS instruction must not survive a changed stance or phase.
- Presentation checks: inspect the destination, signal, hazard row and Joe's available cues together at all four supported test sizes. Repeat muted and with reduced motion. Preserve essential timing information without demanding a forced camera turn.
- Evidence: report branch time, waiting, water hits, attack outcomes and separation at the next landing. Keep scripted route results separate from unfamiliar-player comprehension and preference. If one route dominates, revise geometry or cadence before adding decorative complexity.

Apply this task structure to the other encounter briefs and shared packages. Keep the implementation ledger's status, automated evidence, visual/audio review and human acceptance separate so that a passing save test cannot be mistaken for a finished dramatic scene.

**Specify encounters before decorating them**

Maintain one short specification per major encounter with: the player's readable objective; the sightline that reveals it; wet and dry route endpoints; arrival-phase behavior; Joe's legitimate approach; the consequence of a late decision; recovery space; checkpoint behavior; and the observable success payoff. Derive coordinates and distances from the current authored layout rather than copying historical values from this review.

For example, the first spillway is successful when the player can see the landing and alternate route before committing, judge an opening using their current movement speed, and watch an earned discharge delay Joe. A late crossing should show where the current carried them and leave a usable next action. A closed-window arrival with Joe nearby should offer the visible detour. Test these situations separately; one successful sprint does not establish all three.

Use the following encounter briefs to turn the sequence into buildable work. These describe intended behavior; verify what is already implemented before changing it. Tune times and distances from the preserved movement speeds and actual route geometry.

| Encounter | Player's decision and required staging | Failure/recovery and acceptance evidence |
| --- | --- | --- |
| Root gallery lesson | Read one physical pressure signal and cross to an obvious bank before pursuit becomes urgent. Place the outlet, landing and next destination in a useful sightline. | A mistimed attempt demonstrates current direction and a reachable recovery bank. Verify that a new player can explain when to cross without reading a separate manual. |
| First pressured spillway | Compare an available wet shortcut with a visible dry detour while hearing or seeing Joe's legitimate approach. | Early, late and closed-window arrivals must produce distinguishable choices. Test walking and sprinting separately; record crossing time, wait, recovery and Joe's next connected approach. |
| Bunker and evidence recess | Read Joe across the folded space, choose a route and optionally spend time reaching the groundskeeper record. Use golf-specific maintenance details to establish place. | Skipping the record must preserve progression. Reading it must not trap the player in a modal screen while simulation silently continues. Verify both routes and interruption/resume behavior. |
| Pump reversal | Understand the blocked onward route, identify the lever, operate it and observe the new route opening. Use connected pipes, moving parts and changing pressure to explain the exchange. | Rear flow receives its warning before becoming dangerous. Test every arrival phase, Joe on either side, reload after operation and approaching the control from invalid positions. No repeated operation or save restoration may replay an irreversible reward. |
| Alternating range | Commit to the first crossing, reassess from the central landing, then choose the second opening or recovery route. Show enough of both outlets to understand that they alternate. | The landing provides a readable next decision without guaranteeing indefinite safety from Joe. Test simultaneous water/attack pressure and ensure an already committed strike cannot turn forced water recovery into an unavoidable defeat. |
| Keeper escape | Reach the protected side, operate the visible release and hold a defensible position while the gate physically closes. Frame Joe's approach when he is actually present. | Test retreat, Joe crossing, interrupted closure and both actors near the moving barrier. A legitimate large lead still earns an escape. After secured completion, give the player a controllable beat of relief before results. |

For each encounter, keep a short work card containing the relevant review IDs, current observed problem, owner, proposed change, dependencies, success/failure/reload checks and evidence still needed. Separate a measured tuning value from a fixed requirement. If a room adds neither a new decision nor a useful recovery beat, simplify or merge it before adding decoration.

The pump encounter should have a clear before/input/after sequence: the onward outlet visibly blocks progress; the reachable lever moves a connected mechanism; forward pressure falls; the rear outlet warns and activates; the player can use the new route immediately. Joe responds from his actual position. If he is too far away for a visible reaction, the machinery payoff must still communicate success without moving him for the scene.

3. **First delivery: correct the rules players rely on**

Fix these defects before evaluating the level's difficulty:

- Gate safety: reproduce starting closure and retreating to the unprotected side using the current authored gate position and orientation. The review's y=216.1 / y<215 coordinates describe the historical straight layout; do not transplant them into the folded course. Completion must require the player inside the protected side with the barrier secured. Define cancellation/reversal behavior, and continue legitimate Joe behavior while player and Joe remain on the same side. Test leaving, re-entering, repeated Use, pause, reload and actor/tool overlap. Collision should correspond to visible gate geometry, including partial closure; no arbitrary halfway immunity.
- Bypass persistence: saving immediately after operating the lever must retain that irreversible fact even before checkpoint 2. Restore a coherent mechanism/water state after death and reload. Preserve collected evidence and existing completion. Clearly distinguish permanent chapter facts from transient positions, attack timers and recovery states.
- Timing truth: remove the 99-second fallback. Every outlet must expose a complete authoritative state. Represent timed transitions, safe-until-event states and blocked-until-event states distinctly. A missing timer is not a large invented number. Test the bypass's actual two-second warning and all cyclic phase boundaries.
- Crossing advice: use the relevant channel, approach distance, remaining distance to the far bank, stance/speed and a reaction allowance. Separate 'approach', 'wait', 'cross' and 'clear the channel'. Never instruct a walking player to begin a crossing that requires an unannounced sprint. An already-crossing player should not receive advice calculated from the full original crossing distance.
- Binding truth: all prompts and coaching must use the active profile's actual key/button labels. Reproduce remapping Use to T while the old HUD still says E, then prove it fixed.
- Pump progression: establish its necessity before the player leaves the pump district. Either make its physical change necessary to the onward route or provide an equally clear authored requirement and recovery. Do not allow a surprise unusable exit after a long trip with no prior warning.
- Physical interactions: anchor the keeper action to the visible release console, with sensible reach/facing/obstruction. Do not use a broad radius around the room's exit point as a proxy. Apply the same eligibility contract to other chapter controls while preserving their existing action semantics.

Promote the targeted review probes into focused regression tests. Inspect existing tests rather than changing expectations to conceal broken behavior. Keep the visual state, simulation, audio and HUD derived from the same authoritative transition.

4. **Second delivery: consolidate shared foundations without flattening the chapters**

Introduce only the shared pieces needed by actual consumers. Establish validated preference access and action/prompt resolution first, then interaction eligibility, save helpers, and device/menu lifecycle where these reduce demonstrated duplication or defects.

Document preference precedence: defaults, valid existing campaign preferences, intentional profile/chapter overrides, then explicit current user changes. Migrations must be idempotent, handle corrupt or unavailable storage, preserve unknown/unrelated fields, and avoid duplicate conflicting copies of the same setting. Read legacy keys such as rough-cut.settings.v1, rough-cut.spatial.v1, rough-cut.feel.v1 and existing chapter keys safely. Do not overwrite entire stored preference objects from stale snapshots.

Keep separate chapter save namespaces and versions. Chapter serializers own their durable facts; the shared service owns safe reading/writing and migration dispatch. Do not accidentally make vehicle damage, a dead character's position or attack state permanent merely because bypass progress is permanent in another chapter. Preserve existing drain/shed handoff and restart semantics, verified by transition tests.

Use a shared priority policy for imminent danger, interaction prompts, lessons and optional text, with chapter-authored content. Dialogue subtitles, hazard text and objective visibility are distinct settings/policies: muting dialogue captions must not accidentally erase all timing information.

Make menu operations possible with keyboard, gamepad and touch. Handle disconnect, focus loss, pointer cancellation, fullscreen and resume without stuck input. Preserve Back Nine's no-pointer-lock behavior. Use thin integration adapters for its DOM screens and Level 1's existing UI rather than a wholesale rewrite.

5. **Third delivery: prove the encounter loop in a focused playable section**

Rebuild the first pressured crossing before expanding art. It must include actual Joe movement and attacks, a readable wet shortcut, a visible longer dry route, and a clear recovery landing. Place the decision before the bank, with time to understand the options. A near mistake must cause a legible loss of position, not an instantaneous unexplained camera relocation or repeated stun lock.

Measure both routes across water phases and plausible Joe approach distances. Neither route should dominate in speed, safety and simplicity across the full range. Waiting should create a decision, while an earned early crossing buys real separation. Joe can use connected paths based on observed evidence; every shortcut must exist in the level and be available according to consistent authored rules.

Compact/fold the overall geometry so a normal walk does not automatically remove Joe from the chapter. Do not solve this by increasing his speed to match the sprinting player, extending idle waits, or manufacturing unavoidable near misses. The measured baseline was approximately 71.35 seconds walking with no attacks and a 118.50 m final gap, and 46.68 seconds sprinting with a 159.02 m final gap. These are regression/comparison scenarios, not targets or human playtest durations.

Instrument local test runs with route choice, arrival phase, time waiting, minimum separation, attacks, water hits and separation at the next landing. Assess perception and line of sight as well as distance. Do not require Joe to remain close continuously or penalize genuinely skilled play.

6. **Fourth delivery: author the complete chapter's distinct beats**

- Root gallery: protected, short lesson with a visible safe bank and enough information to explain green/amber/red without reading a long briefing. Let observant players take an available safe opening; do not force a ceremonial full-cycle wait.
- Arrival: announce and stage Joe before the player passes the reveal. Use directional sound and readable hatch/door motion. Author a credible descent and landing, or choose a simpler entrance that can be animated well. No hovering actor, tool-through-ladder pose, or forced camera turn.
- First spillway: wet shortcut versus dry route while Joe visibly approaches. Demonstrate the reward of leaving him behind an earned discharge.
- Bunker: change the spatial relationship—such as a folded approach with Joe visible across a channel—rather than repeating the same corridor under another sign. Give the optional record a recognizable recess and a safe reading opportunity. Remove or merge a room that adds no new choice or useful breather.
- Pump house: make the input, mechanical motion, forward drainage and warned rear flow readable. Compose the mechanism and its consequences into useful sightlines. Persist the change immediately. Do not relocate Joe to manufacture a payoff.
- Recovery: create a brief breathing space with a clear next destination. Reposition checkpoints around meaningful solved encounters; avoid a long replay followed by two nearly adjacent checkpoints.
- Range: make the two alternating outlets and central landing legible from the approach. The second crossing requires reassessment. A dry recovery route remains possible but has a real spatial/time tradeoff. Test cautious, ordinary and well-timed arrivals.
- Keeper room: visible reachable release, physically valid closure and a readable last decision. Verify both actors at the threshold and any abandoned closure. After safety is secured, allow a short player-controlled aftermath and voluntary glance back. Deliver fading machinery and distant applause before the result panel. Foreshadow the championship grounds and preserve the existing Final Cut continuation; inspect that chapter's current implementation rather than treating it as unbuilt. Its complete redesign remains outside this brief.

Keep the duration earned by decisions and staging. Do not stretch corridors or add waiting to reach the old provisional 6–9-minute estimate. If a shorter chapter is stronger, document that finding.

7. **Fifth delivery: Joe, architecture, art and sound**

Author carry/idle, walk/turn, prepare, committed sweep and recovery poses. Bind the hedge trimmer to credible hand grips, and align the visible blade and hit region including player-body clearance. Preserve a readable warning, a dodgeable committed strike and recovery. Tune local perception/search using actual connected inspection points and evidence. Make captions report observed approach, search, water obstruction and attack states truthfully; distance alone must not produce 'getting closer'.

Review dynamic geometry as well as static collision. Include actor/tool movement, ladders, consoles, opening/closing gates, corners, crouching, extreme pitch and supported FOV. The prior 1,230-position static-ray sample does not certify all-space or dynamic clearance.

Finish roof edges, portal frames, shafts and structural connections. Avoid blue voids, hanging props without supports and disconnected pipes. Give each district a recognizable silhouette and material hierarchy. Reduce repetitive high-frequency stone noise, keep important surfaces readable, and cluster golf details purposefully. Water should emerge from physical nozzles, hit surfaces and drain somewhere plausible; its flow must explain the recovery direction and retain visibility of the far bank.

Compose stable warm decision points against cool water. Avoid hard lighting jumps when the nearest lamp changes. Reduce stacked repeated signs; use a primary decision sign, clear bank signals and continuous route markings. Use symbols/text in addition to color. Keep architectural and enemy silhouettes readable at compact resolutions.

Share audio preferences and source-position conventions, but author local trimmer idle/rattle/rev, Joe footsteps, starter/entrance, pump reversal, gate impact and safe aftermath. Water audio must account for lateral distance and reasonable occlusion. Critical attacks and pressure warnings need intelligibility when discharge is loud. Give Q/LT Listening Focus a real restrained listening benefit consistent with Level 1; do not silently transplant that action into Back Nine. Confirm the mix by listening when an audio-capable review surface is available; source inspection alone is insufficient evidence of sound quality.

8. **Sixth delivery: device usability, accessibility and performance**

Make the phone view retain the bank, physical signal and far landing while contextual UI is present. Collapse learned/nonurgent messages and prioritize immediate danger. Keep readable captions and interaction controls reachable at 390×844 and 844×390, plus any smaller supported size. Test actual multi-touch cancellation and ergonomics; provide an optional two-thumb-compatible run control without changing the shared movement model.

Support complete controller operation through briefing, settings, journal, pause, retry and chapter navigation. Preserve explicit focus. Test hot-plug and disconnect recovery. Keep glyphs and action labels truthful across input switching.

Apply global comfort/mute/caption choices consistently. A global no-flash or reduced-motion setting must not be undermined by a local effect slider. Preserve useful static/aural timing information when motion is reduced. Verify muted play and signal recognition without relying on color alone. Label any setting whose changes affect other chapters clearly.

Establish measured loading, frame-time and memory budgets on available representative hardware and software rendering. Reuse existing software-frame-budget and render-lifecycle helpers where compatible. Review screenshot-only buffer preservation, particle visibility/update cost and scene preparation based on measurements. Keep HUD clarity independent of scene-resolution scaling. Do not claim a 60-fps guarantee or mobile validation from one desktop headless run.

9. **Verification and completion criteria**

Use existing render_game_to_text and deterministic advanceTime hooks, meaningful simulation tests, real browser input, screenshots, and console/error inspection. Follow relevant repository skills and required verification workflows. Add tests for new failure boundaries rather than tests that simply mirror implementation.

Run the relevant current suites, including under-green simulation/design/controls/layout/browser and transition checks. Existing entry points include tools/verify-under-green.mjs, verify-under-green-design.mjs, verify-under-green-controls.cjs, verify-under-green-layout.cjs, verify-under-green-browser.cjs, and verify-under-green-transition.cjs. Revalidate affected Level 1 interaction/controls and Back Nine runner/steering/menu behaviors; discover the current test files rather than assuming old names remain authoritative. Verify both chapter handoffs and sibling-save preservation.

The cross-chapter matrix must cover:

- Level 1 and Under the Green on-foot speed, look direction, sensitivity, crouch, rear glance and remapping.
- Back Nine cart and runner steering, throttle/brake, rear view and intentionally ignored free-look input.
- Shared setting changes, legacy/corrupt save migrations, chapter-specific durable facts and independent restarts.
- Menu/controller/touch lifecycle, pause/blur, sound settings, captions and reduced motion.
- Under the Green phase boundaries, movement speeds, safe and late crossings, recoveries near Joe/cover, water effects on both actors, irreversibility of the pump, and gate interruption/occupancy.
- Successful wet routes, dry routes, optional evidence and recovery from each checkpoint using real movement rather than teleported completion.

Inspect 2560×1600, 1280×720, 844×390 and 390×844 views, including dynamic attacks/entrance, interactions and backward/upward views. Separate structural-clearance evidence from cinematic/animation review. Record runtime errors, meaningful timings and unresolved limits.

Plan a small unfamiliar-player cohort across input devices. Ask players to explain the rule before helping; observe decisions, waiting, mistakes, perceived fairness, whether they notice Joe, and when tension disappears. If human/device sessions are unavailable, complete the independently verifiable work and explicitly record those validations as pending. Do not fabricate playtest results or equate a successful pathfinding run with a fun first playthrough.

10. **Deliverables and working discipline**

Ship the implemented local changes, focused regression tests, updated review-item ledger, shared/local ownership notes, save-migration notes, and concise evidence artifacts. Keep changes reviewable in the order above. Do not turn prerequisite cleanup into an unrelated rewrite, overhaul all legacy chapters' art/AI, or implement a general-purpose engine before fixing the demonstrated bugs.

For every review item, state whether it is implemented, validated, integrated into another item, or intentionally revised with a concrete reason. A proposed feature may be revised if the implemented experience meets its underlying goal more clearly. Do not call deferred manual validation complete. Summarize the resulting player experience, compatibility checks, tests run and material remaining limitations. Do not publish or deploy as part of this local implementation task.

Review-item ownership and traceability follow. These scopes are implementation constraints, not instructions to make every local mechanic universal.

| Review item | Improvement | Ownership | Workstreams |
| --- | --- | --- | --- |
| 1 | Rebuild the sustained pursuit | Local encounter design | 3, 5, 6 |
| 2 | Require the player to be safely inside before victory | Local gate invariant; shared completion-test convention | 3, 9 |
| 3 | Save the operated bypass immediately | Shared persistence service + local durable fact | 3, 4 |
| 4 | Fix the bypass warning countdown | Shared timing contract + local outlet fix | 3, 4 |
| 5 | Base crossing advice on the player’s actual situation | Shared advice semantics + local geometry/speed adapter | 3, 4 |
| 6 | Show the player’s actual bindings | Global action/prompt resolution with profiles | 3, 4 |
| 7 | Prevent an unexplained trip to an unusable exit | Local progression/layout | 3, 6 |
| 8 | Anchor the sluice action to its visible control | Shared interaction eligibility + local target | 3, 4 |
| 9 | Give each major space a different decision | Local encounter sequence | 5, 6 |
| 10 | Make wet and dry routes genuine alternatives | Local branch balance | 5, 6 |
| 11 | Stage Joe’s arrival where the player can notice it | Local staging/animation | 6, 7 |
| 12 | Make the pump reversal an observable payoff | Local mechanism set piece | 6, 7 |
| 13 | Build a climax that combines learned skills | Local climax | 6 |
| 14 | Let the player experience the escape before the result panel | Local aftermath; reuse shared presentation lifecycle | 6, 7 |
| 15 | Turn surge displacement into readable motion | Local recovery; honor global motion comfort | 3, 6 |
| 16 | Redistribute checkpoints and breathing spaces | Local checkpoint design; shared persistence checks | 4, 6 |
| 17 | Give the groundskeeper record a stronger location and reward | Local optional evidence; compatible journal/results policy | 6, 8 |
| 18 | Attach the hedge trimmer to credible hand poses | Local trimmer rig/poses; preserve shared Joe identity | 7 |
| 19 | Ground Joe’s locomotion and turns | Local locomotion and animation | 7 |
| 20 | Validate the entire attack presentation against the hit region | Local strike geometry; shared QA conventions | 7, 9 |
| 21 | Make perception and search behavior understandable | Local perception and search | 7 |
| 22 | Make pursuit captions state what is actually happening | Shared message priority + local truthful threat data | 4, 7 |
| 23 | Extend clipping review to dynamic actors and close-up interactions | Shared clearance harness + chapter fixtures | 7, 9 |
| 24 | Finish roof transitions and structural connections | Local architectural construction | 7 |
| 25 | Give the five districts distinct silhouettes and materials | Local district art within shared style | 7 |
| 26 | Reduce repetitive high-contrast surface noise | Local material pass; reusable art helpers | 7 |
| 27 | Make the flow feel forceful and physically situated | Local water rendering | 7 |
| 28 | Give lighting a stable spatial structure | Local lighting; reuse compatible utilities | 7 |
| 29 | Reduce sign clutter and improve physical guidance | Shared visual conventions + local placement | 7 |
| 30 | Make the golf course above feel present | Local environmental storytelling | 6, 7 |
| 31 | Give Joe an identifiable acoustic presence | Local Joe cues + shared audio mixer | 7 |
| 32 | Give Listening Focus a useful effect | Shared on-foot Focus semantics + local audio response | 4, 7 |
| 33 | Author sound around the major dramatic moments | Local event score + shared lifecycle/mix | 7 |
| 34 | Attenuate and position water by actual location | Shared spatial helpers + local sources/occluders | 4, 7 |
| 35 | Keep the world’s decision point visible on phones | Shared HUD priority/accessibility + local composition | 4, 8 |
| 36 | Reduce the finger load of moving, running and looking | Shared device ergonomics with movement profiles | 4, 8 |
| 37 | Complete the controller experience outside gameplay | Global menu navigation through UI adapters | 4, 8 |
| 38 | Make inherited settings visible and consistent | Global preferences/accessibility with profile overrides | 4, 8 |
| 39 | Teach through one safe crossing and report useful outcomes | Shared presentation/coaching policy + local lesson/result | 6, 8 |
| 40 | Set and measure device budgets | Shared measurement/utilities + per-mode budgets | 8, 9 |
| 41 | Test failure boundaries as rigorously as successful routes | Shared verification approach + local regressions | 3, 9 |
| 42 | Run unfamiliar-player tests before expanding the level | Campaign playtest method + chapter scenarios | 5, 9 |
| 43 | Record the decisions that matter during local tests | Shared optional local telemetry shape + chapter events | 5, 9 |
| 44 | Separate encounter data, presentation and input contracts | Incremental shared contracts and readable local modules | 4, 10 |

Reference documents and evidence:

- [Original 44-item review](C:/Users/Will/Projects/project-rough-cut/design/under-the-green-review-2026-11-11.md)
- [Encounter design](C:/Users/Will/Projects/project-rough-cut/design/under-the-green-encounter-design-2026-11-11.md)
- [Baseline simulation findings](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/simulation-findings.json)
- [Browser findings](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/browser-findings.json)
- [Structured backlog](C:/Users/Will/Projects/project-rough-cut/output/under-green/review/improvement-backlog.json)
