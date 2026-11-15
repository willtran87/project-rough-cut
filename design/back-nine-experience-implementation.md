# Back Nine experience implementation

User goal: implement all 38 items in the Back Nine improvement list. Started 2026-11-12. This ledger preserves the full scope across implementation turns. Existing features count only after current behavior is inspected and the requested refinement is demonstrated. No item is complete merely because its name appears in code.

Constraints: dark detailed pixel art; no arbitrary scenery clutter; responsive cart-style on-foot controls and Q look-back; physical collisions/pathing; damage only from impacts; intact-cart victory remains possible; no initial on-foot spoiler; reduced motion/flash and separate sound captions; quiet banners; bounded rendering/audio allocations. Prepare human playtests for later, as previously requested. User confirmed2026-11-13: Level2 death restarts the whole level from the shed; relay objectives are not retry checkpoints.

| # | Requirement | Completion evidence required | Status |
|---|---|---|---|
| 1 | Worst-case frame spikes | Moving wet/foliage/mower/impact/ejection profiles; measured improvement without reduced content | In progress; shelter replan storm fixed (381 to 25 plans/12s); beacon submission reduced with exact image equivalence, but final paired software timings are mixed/regressed in some views; GPU frame spikes remain open; pass26 removes three fully hidden staff-cart submissions with 192 exact image comparisons, small median gains and mixed p95 |
| 2 | Shared suspense decision-maker | Single encounter priority policy used by pursuit, effects, audio and dialogue; conflict tests | Implemented and technically verified:149 priority pairs/eight channel contracts, hunt/tension/panic/pressure consumer checks, live15/30/60Hz windows, hardware/software UI/audio and12 full routes. Explicit opening/gather owners fix a reproduced interrupted buildup; committed attacks and earned protection keep precedence. Broader pacing/balance remains in items3/4 |
| 3 | Emotional progression | Distinct departure/reveal/escalation/finale states, audible/visible transitions in play | In progress; musical stages and three conditional spatial priorities implemented; complete pacing/route audit remains |
| 4 | Earned relief | Dodging/concealment/diversion yield usable separation; no immediate conflicting attack | In progress; implemented for missed charges, lane evasion and sensory loss; broader balance audit pending |
| 5 | Meaningful forks | Each major fork has readable tradeoffs and reachable reconnection; route walkthroughs | In progress; five physical gaps, reconnections and optional contextual hints verified; world route tradeoff/readability audit remains |
| 6 | Distinct on-foot survival | Cover-to-cover encounters, committed long charges, reliable steering and recoveries | In progress; actual range cover/wait/relocation/reacquisition verified; runner rotation snag fixed; all three foot passages tested both ways at30/60Hz with live Joe (46 completions, two real close catches, zero snags); maintained footpath footing/art/audio now consistent with vehicle traction unchanged; all-district choice/balance audit remains; pass26 fixes ignored controller deadzone and abrupt steering onset, with natural late-destruction/on-foot garage completion |
| 7 | Playable cart destruction | Safe landing options, uninterrupted control recovery, contextual reveal; actual fatal impacts tested | Implemented and verified: 1,401 clearance placements plus 6,720 garage arrangements, exact centre/seat obstruction checks fix 178 bollard-crossing paths; actual fatal-impact/control scenarios, bracing, landing cue and protected recovery pass. Camera follows the airborne body around walls; later human feel assessment prepared |
| 8 | Garage payoff | Readable approach/closure and protected success for cart/foot arrivals | Implemented; physical approach lamps/parking/hold meter, deliberate activation, protected closure and both arrivals verified |
| 9 | District signature encounters | Three different spatial decisions with entry, consequence and recovery | Implemented conditional pump-yard lane, range interception and clubhouse pass; full route/browser checks pass; later human balance pending |
| 10 | Readable attacks | Distinct alignment/commitment/interception/recovery cues; audio/visual inspection | In progress; physical warning turn, full timing and music duck/captions verified; broader sound/visual recognition audit remains |
| 11 | Frightening loss of sight | Evidence-based finite searches, actual concealment works, physical reappearance | Implemented exact sight/coarse sound, fixed finite search and evidence-only ram preparation; physical cover and reacquisition verified |
| 12 | Understandable interceptions | Visible/foreshadowed connected detours; hidden steering cannot home the target | Implemented physical warning turns, connected routes and frozen predictions; actual interception/passing browser and route checks pass |
| 13 | Player manipulation | Course mechanisms create specific opportunities with readable costs | Implemented and technically verified in pass36: three existing shortcut gates can be unlatched at the cost of stopping for1.1s, then swing over0.8s while Joe continues pursuing. Both approaches/player forms, current-leaf collisions, obstruction waiting, audio priority, ejection clearance and whole-level reset pass. Real range windup/miss scenario demonstrates an escape opportunity; broader route balance and unprompted recognition remain under5/6/38. Bells remain absent. |
| 14 | Repair decisions | Interruptible/partial repair, approach remains observable, coherent HUD/model progress | Implemented and browser-verified; later human balance check prepared |
| 15 | Damage personality | Distinct accumulated damage, mechanical/audio progression, predictable handling | Implemented: shared travel-driven roof/panel/wheel wear, critical-engine audio without control penalties, seven existing visual stages, repair/collapse and audio resource checks; later human feel/listening remains prepared |
| 16 | Directional heavy impacts | Angle/force feedback, brief comfortable effects, safe shoves and escape windows | Implemented: centered-hit roll corrected, post-composition model bounds, 3780 hull poses, angle/force and obstacle-safe shove checks, actual ram/backoff/steering and reduced-motion browser checks; later human feel remains prepared |
| 17 | Mechanical cart wobble | Surface/speed/steering/wear response with steadier camera | Implemented: actual-travel suspension, terrain/wear response, separate stable camera/hull, shared panel contact sounds; 72000 signal samples and hardware/software 60/30/15Hz pose checks; later human feel remains prepared |
| 18 | Useful wreck | Real cover/obstruction, never blocks required route; pursuit navigates it | Implemented and technically verified: physical cover buys 2.38s, Joe detours without overlap and catches a stationary runner; 639 sampled course/critical wreck placements connect to remaining objectives, 18 actual movement replays reach the garage, and three fatal garage impacts escape on foot in browser checks. Human route choice/feel remains prepared |
| 19 | Runner animation | Facing/feet/turning/ejection continuity in motion at multiple angles | Implemented and technically verified: distance-driven planted stride, facing/turning, contralateral arms, bracing and automatic framing. Pass37 fixes new-terrain foot sinking with independent ground height/slope targets.34,693 current mesh poses across all14 authored routes at60/30/15Hz,2,940 flat-ground equivalence/pause/reset cases, actual input/controls and continuous ejection checks pass.24 meshes and GPU resources retained; human feel remains prepared under38. |
| 20 | Consequential misses | Bounded tracks/debris/designated fence damage without arbitrary destruction | Implemented: actual deck/rail contact, 72 settling pieces, 24 turf-only swaths and shared-pool clippings; real charge/dodge/break/recovery, 48 passages, hardware/software input and allocation checks pass; later human readability prepared |
| 21 | Consistent barrier rules | Clear visual categories; collisions and Joe behavior match them | In progress; five cart apertures and three foot-only routes have worn-surface cues and swept-hull checks; twelve loose rails now share push/impact rules, permanent iron posts stay solid, 48 passages and physical missed-charge consequences verified; broader course-wide visual category audit remains |
| 22 | Coherent golf course | Tees/greens/bunkers/drainage/service roads composed together; high-res review | Implemented course-surface composition pass: six shaped fairways and connected tees, four gravel courts, corrected green/tee placement and visible bunker lanes; ten-view hardware/software tour, unchanged navigation and twelve full wins verified; later human judgment remains prepared |
| 23 | Landmark navigation | Route readability from world detail, optional explicit guidance retained | In progress; inset paving, gate wear, opt-in junction guidance plus pump tower, range canopy and clubhouse clock verified from driving views; whole-course route/landmark composition remains |
| 24 | Selective darkness | Dark recesses with navigable edges/openings across display sizes | In progress; navigation lamp brightness floor and four district/planting views verified at three sizes; full-course edge/opening review remains |
| 25 | Purposeful flicker | Localized faults support spatial information; critical cues and comfort modes stable | Implemented: service fixtures/window faults, steady navigation floor, separate exit cues; hardware/software 12 comfort/dip combinations and high-resolution/compact views pass; later human recognition prepared |
| 26 | Believable moving shadows | Physical sources dominate, rare anomalies, no obstructed navigation | In progress; moon projection fixed; actual beacon/cover/shutter shadows implemented and rendered checks pass; software overhead, broader composition and restrained anomalies remain |
| 27 | Approaching beacon threat | Terrain/scenery illumination communicates real approach and cover | In progress; stronger40m beacon, physical cover/shutter occlusion and steady comfort warning verified in hardware/software driving/foot views; per-face shadow submission and depth-only warming verified pixel-identical; mixed software timing results and broader course acceptance remain open |
| 28 | Musical identity | Distinct arrangements/motif, smooth phase transitions, warnings remain audible | Implemented adaptive motif arrangements, smooth tempo/layer transitions, warning ducking and silence; offline/browser verification passes; listening feedback remains in the human kit |
| 29 | Survival audio | Direction/distance/occlusion and machine state readable; accessibility equivalents | Implemented and technically verified: contact-synchronized footsteps, camera-relative mower layers/captions, seven authored local machinery sources, actual stereo/cover/range/priority and live mixer checks.64rules,16local audio cases,four full-mix comparisons,32mower cases,44mix cases,24responsive browser views and two live-Joe full runs pass.14voices unchanged; human listening/recognition remains prepared under38. |
| 30 | Meaningful silence | Quiet after earned sight loss, residual world sounds, no dialogue/sting stacking | Implemented search priority suppresses optional stings/pressure/lines; music pulse falls while machine/world audio persist; offline/browser checks pass |
| 31 | Restrained supernatural moments | Rare attention rewards at safe locations, no false lethal cues or blocked routes | In progress; natural-route starvation found in16 runs and fresh-opening west-bay dressing restored without changing attack gates; hardware/software actual input, pixel visibility, look-away, pause/comfort/checkpoint checks pass. Existing later two-site beat retained. Additional variety/human recognition and visible figure software cost remain open |
| 32 | Environmental storytelling | Connected staff/work details across districts, coherent authored placement | Implemented connected Night Order041 staff racks at both shelters and garage, three/one/zero cards and linked optional crew logs; hardware/software high-resolution/ordinary/compact views and log/route/ending checks pass; human interpretation remains prepared |
| 33 | Exceptional Joe lines | Contextual sparse lines with cooldowns, themed persona, priority and repeat tests | In progress; lazy shared budget prevents unseen selections, 100-line deck/reload variety, witnessed-service reactions and browser priority/accessibility checks pass; older natural captures showed two contextual lines roughly49–51s apart; current faster pursuit exposed0.15s/0.05s taunt flashes. Pass35 adds velocity-based admission and current hunt/pressure guards, with hardware/software UI and paired full-route verification. Wider current-route/context frequency and tone audit remains |
| 34 | Readable run-over and informative failure | Collision-aligned impact/fall/rest/camera/audio, then cause separate from varied commentary, relevant concise hint and fast retry | Implemented and verified: contact-aligned backward/lateral/forward falls, exact mesh ground support and settling, clear-side death camera, current collision/audio/defeat/retry checks;36 headings and seven physical scenarios at60/30/15Hz; no new GPU resources. Human feel/comfort assessment remains prepared. |
| 35 | Fair retries | Reproducible whole-level restart from the shed; no repeat intro/first-use stall | In progress; user confirmed from-shed retries2026-11-13. Twelve keyboard/button retries verify fresh cart, offline relays, fresh repair reserves, fresh valid variation seed (current retry policy), cleared controls, no repeated intro or asset/scene/audio reinitialization. Construction responsiveness improved, but total cold loading is mixed and stalls remain open. |
| 36 | Controlled variation | Secondary choices vary while route/safety rules and retry learning remain stable | Implemented: seeded tactical preference, evidence-based search order, bounded district entry and cloud timing; 64 full runs, both checkpoint/death/retry/reload cycles, legacy migration and fresh-run changes verified; human recognition/balance remains prepared |
| 37 | Escape recognition | Intact/battered/on-foot success and optional evidence acknowledged without forced damage | Implemented and browser-verified; running/battered/on-foot arrivals, evidence, saved geometry/health and legacy fallback |
| 38 | Later human playtests | Ready-to-use test guide, observation sheet and feedback collection covering decisions/readability | Prepared and form/export browser-verified; no human testing conducted |

## Working sequence

1. Shared encounter priorities and earned relief; preserve collision/charge contracts and instrument decisions.
2. Course encounter/route pass, mechanisms/repairs and on-foot opportunities.
3. Transition/finale/failure/retry/ending coherence.
4. Environmental art, lighting, mechanical animation, sound/music, sparse supernatural/story beats.
5. Performance, broad playthroughs and requirement-by-requirement completion audit; prepare human test kit.

Stages can overlap where dependencies justify it. The goal stays active until every row has direct evidence. Baseline source: `output/back-nine-experience/baseline-source/`. Do not overwrite that snapshot on continuation. Preserve concurrent work in other chapters.

## Pass 1 evidence and next work

See `qa/back-nine-experience-pass1-2026-11-12.md`. Director, earned relief, partial service and shelter camera are implemented. Human kit is ready for later. All remaining rows retain their original scope. Next: route/district encounter pass (#3, #5, #6, #9, #12, #13), then garage payoff and outcome recognition (#8, #34, #35, #37). The shared director is the integration point for new optional beats. Keep committed physical attacks authoritative. Performance item #1 remains open; current allocation checks are not proof of reduced frame spikes.

## Pass 2 evidence and next work

See `qa/back-nine-experience-pass2-2026-11-12.md`. Added true escape records, contextual failure advice, responsive result controls, readable garage power/hold cues and seven adaptive score arrangements. Garage completion now requires the advertised brake/use hold. Same 23 software programs / 36 textures / 12 audio voices; garage adds one merged indicator draw and no runtime geometry allocations. No raw frame-time improvement claimed.

Full-route evidence revealed a pacing gap for the next pass: current automatic backoff-to-windup loops and short distance eligibility leave generic interceptions/close passes starved in the 12 automated route runs (most show zero). Read `mower-ram.js` automatic recovery transition and `back-nine-hunt.js` eligibility together before adding district encounters; do not simply add another overlapping timer. Keep the physical escape window and warning duration. District/route work (#5/#6/#9/#12/#13) remains open. Preserve concurrent Final Cut continuation integration in `back-nine.js` and HTML.


## Pass 3 evidence and next work

See `qa/back-nine-experience-pass3-2026-11-12.md`. Restored tactical alternatives after real ram retreats and added three conditional district priorities. A true close pass now overtakes without contact. Full normal-health repair routes preserve the cart; skipping service can lead organically to a completed on-foot escape. Shelter-post entry bug and per-frame collision replanning fixed: 381 to 25 plans in the same 12-second fixture, 1.53 to 87.34 m of actual progress. This is CPU work/behavior evidence, not a GPU frame-time improvement.

Three district warnings, full route outcomes, no hidden retargeting, protection, existing controls/ram/collision/service suites, audio arrangements and software browser resource checks pass. High-resolution/ordinary/compact screenshots and installed standard-client gameplay inspected. Full scope remains active. Next: finite sensory searches and meaningful on-foot cover decisions (#6/#11/#30), followed by fork/mechanism/visual/animation and sustained performance work. Existing exact hidden audio tracking is a candidate for refinement; do not weaken real visible pursuit or remove current escape windows.


## Pass 4 evidence and next work

See `qa/back-nine-experience-pass4-2026-11-12.md`. New sensory memory replaces exact hidden tracking and hidden ram steering. Searches use fixed evidence, at most two additional probes and a ten-second expiry, with physical movement and a listening pause. A real runner route breaks sight behind the windbreak, waits and relocates; fresh visual contact restores pursuit/windup. Search silence now excludes optional stings/pressure/omens/dialogue without muting actual machine/world audio. GPU/audio allocation counts remain bounded; no software FPS claim.

Full driving, foot, district, collision, ram, quiet-message and director regressions pass; new unit/browser/offline audio and installed-client evidence inspected. On-foot all-district design remains partial. Next: organically readable forks and mechanisms (#5/#6/#13/#21/#23), then outstanding visual/animation/performance work. Human tests remain prepared for later; they are not claimed as completed sessions.

## Pass 5 evidence and next work

See `qa/back-nine-experience-pass5-2026-11-12.md`. Five cart apertures and three foot paths now have opaque worn-surface clues. Opt-in route hints persist, preserve the initial running surprise and yield to essential messages. Bell treadles show physical charge progress and warn about visibility/hearing/range/committed attacks. Unaware patrol now uses a working pace; visible pursuit remains aggressive. All three bell stations work in cart and on foot, with finite investigation and fresh-evidence reacquisition. Sustained separation and extra route progress are verified, not permanent immunity.

Full route/foot/district/sensory/control/impact regressions, software browser UI and installed gameplay client passed. Art inspected at 2560x1600,1280x720,844x390. Resource counts unchanged; no software FPS improvement claimed. Remaining scope stays active: route readability/landmarks, barrier categories, ejection/runner/damage/wreck refinements, environment/audio/variation and measured frame stability. Human tests remain deferred/prepared.

## Pass 6 evidence and next work

See `qa/back-nine-experience-pass6-2026-11-12.md`. Cart ejection now has leading/trailing limbs, a bracing arm and restrained torso counter-rotation. A synchronized landing thud reuses the existing body voice; optional sound caption is separate, and breakdown text clears the character during the fall. Placement/controls/pathing remain unchanged after 1,401 valid-pose samples and four real fatal-impact tests confirmed usable escape space and control return. Wreck cover yields a measured physical detour, not permanent safety.

Continuous pose, hardware/software browser, actual fatal collision/audio/control, pause/mute/retry and full route regressions pass. No new geometry/programs/textures/audio nodes. Remaining work includes broad gait/foot planting, required-route wreck placements, mechanical damage/impact audit, world/lighting/sound/variation, and software-rendering frame spikes. Full goal remains active; human tests remain deferred/prepared.


## Pass 7 evidence and next work

See `qa/back-nine-experience-pass7-2026-11-12.md`. Added distance-driven runner supports, ankle articulation using existing material meshes, reachable restart poses, opposing arm swing and stable duplicate renders. Corrected the old mouse-look pitch left in the automatic follow camera so the full runner remains framed near the wreck and in open space. 24 animated meshes/26,754 vertices retained; no new GPU uploads, programs, textures or audio voices in ejection checks. Current movement/collision/route/garage and ejection regressions pass; final installed-client movement and high-resolution/ordinary/compact views inspected.

Repeated foliage-tone performance results were inconsistent; candidate removed and original pines restored byte-for-byte. No GPU speedup claimed. Remaining scope is unchanged. Next useful targets include actual contact-synchronized foot audio (current time-times-speed oscillator is a known mismatch), mechanical damage/impacts/wobble, world/barrier/landmark/lighting and sustained moving software performance. Item19 retains its broader full-course audit; human testing remains prepared for later.

Pass7 rendering follow-up: fixed-view ABBA GPU test retained identical driving pixels and zero first-use uploads, but corrected near-wreck framing exposes93 versus82draws and measured43.1ms versus33.1ms median in this run. Full-body visibility is retained; added visible-terrain cost is an explicit next performance target, not a speedup. Open-course47.1/42.9ms and foliage46/54ms are mixed; repeat moving measurements before broad performance conclusions.


## Pass 8 evidence and next work

See `qa/back-nine-experience-pass8-2026-11-12.md`. Foot audio now follows presented sole landings, varies by ground material and reuses the cart engine voice after failure. Hardware/software 60/30/15Hz, quiet turns/idle, mute/pause/retry and failure/run-over/music regressions pass, with unchanged12voices/23programs/36textures and no contact-time allocations. Full-body camera and gameplay controls/pathing remain.

Rigid runner draw batching and ground tone caching did not yield reliable completed-frame gains; both candidates removed from runtime and archived with measurements. Do not infer performance from fewer draws or a cheaper shader alone. Software spikes and broader motion/survival-audio audits remain open. Next: mechanical damage/impacts/wobble, environment/barrier/lighting/variation and sustained moving performance. Full38-item goal remains active; human tests prepared for later.


## Pass 9 evidence and next work

See `qa/back-nine-experience-pass9-2026-11-12.md`. Cart suspension and loose parts now share actual-travel phases; speed changes cannot jump the phase. Critical damage adds engine strain without changing acceleration/steering or forcing destruction. Panel sounds stop without travel and cannot replay after mute/repair. Center hits keep their true direction. A broader model audit found pre-existing combined steering/impact lean could exceed the hull; after-composition bounds and cover attachment clearance now pass3780full-model combinations without enlarging collisions or narrowing routes.

Mechanical audio/impact/ejection/damage and controls checks retain bounded resources; moving software medians remain similar, with variable wet-lane tails. No frame-spike fix claimed. Full38-item scope remains active. Next: consequential misses/barrier categories and course/landmark/world/lighting composition; enemy spatial audio, variation, storytelling/dialogue and sustained software performance remain open. Human tests stay deferred/prepared.


## Pass 10 evidence and next work

See `qa/back-nine-experience-pass10-2026-11-12.md`. Loose timber now has consistent push/impact rules, real deck contact, readable split rails and flat settling debris. Turf-only bounded tracks and rough-ground charge clippings make missed charges leave physical evidence. Full browser keyboard movement proves a charge, two actual barrier contacts, one sound per break and survival through recovery. 48 cart/foot/direction passages, all full driving/foot routes, hardware/software, high-resolution/compact views and installed-client checks pass.

72 timber pieces, 24 track slots, shared 32-particle pool and unchanged shader/texture/audio budgets. Final matched turf-charge software median/p95 is 29.9/33.9 ms both before and after; no whole-game frame-spike fix claimed. Full 38-item goal stays active. The repeated roadmap is additional acceptance detail, not a replacement for this ledger; its explicit run-over animation requirement remains tracked under #34 alongside the completed defeat interface.

Next: course-wide composition/landmarks/barrier readability and selective darkness, flicker, shadows and approaching beacon (#21–27), then enemy spatial audio, restrained story/supernatural/dialogue/variation and remaining animation/retry/performance audits. Human tests remain deferred and prepared. Previous goal turn only restated a list (no implementation progress); this turn made and verified authoritative runtime changes. All pass10 test handles were terminal when recorded.

## Pass 11 evidence and next work

See `qa/back-nine-experience-pass11-2026-11-12.md`. Added three district landmarks within existing physical footprints, localized service-fixture faults and a navigation brightness floor. Moon projections now follow the actual light, respond to cloud contrast, and no longer rotate independently of static trees; sideways comfort-mode relocation updates selection correctly. Final hardware/software browser checks cover four viewpoints at 2560x1600,1280x720,844x390, 12 lighting combinations, no new runtime buffer allocations/errors and unchanged shader/texture counts. Routes/choices/drama and installed gameplay client pass.

Final matched software timings are broadly similar, not a frame-spike fix. Purposeful flicker (#25) is implemented; landmarks/darkness/shadows remain partially accepted. Next: real moving-light shadows and approaching beacon cover/occlusion, broader course/route composition/readability, then remaining audio/story/variation/dialogue/animation/retry/performance acceptance. Do not count moon-shadow correction as completed moving-shadow behavior. Human tests remain deferred. Full38-item goal remains active.

## Pass 12 evidence and next work

See `qa/back-nine-experience-pass12-2026-11-12.md`. Added physical beacon shadows from bounded nearby cover plus the moving garage shutter, a stronger source, cached shadow updates, preparation of hidden-layer geometry and cleanup of temporary warm-up shadow resources. Pixel proof compares actual covered road, beacon-off reference, unoccluded light and Joe moving around cover; hardware/software, fourviews×threesizes, comfort modes,306rays and installed live-control client pass without runtime allocations/errors.

Performance is explicitly unfinished: final software median overhead is about5–6ms; the live client reached640x360 under its existing adaptive budget. Do not close#1,#26,#27 or claim performance preserved. Initial broad geometry and64px candidates were rejected;128px merged/nearby geometry remains. Next priority is reducing that cost while retaining physical occlusion, followed by the broader course/lighting acceptance and remaining full38scope. Human testing stays deferred/prepared. All pass12 tool handles terminal when recorded.


## Pass 13 evidence and next work

See `qa/back-nine-experience-pass13-2026-11-12.md`. Finished pending beacon work: six compacted face lists sharing positions, depth-only shader, actual warm-proxy materials, sixteen zero-difference full-frame reference comparisons and no late allocation/program/texture regressions. Final paired timings are mixed, with clubhouse/foliage median regressions; this does not close performance. Lighting strength, pixel art, controls and pursuit remain unchanged.

Fixed dialogue selection consuming unseen lines behind the shared cooldown, expired-event priority ordering and fixed-length reading time. Added eight service-repair responses gated by actual witnessed repair, offered after departure. Existing deck/reaction/quiet/encounter suites and new software/hardware UI checks pass. Installed standard client and high-resolution/ordinary/compact imagery inspected. Full scope remains active; next prioritize whole-course composition/route readability and remaining story/atmosphere work alongside measured performance, without declaring gains from fewer triangles alone. Human tests remain prepared for later.


## Pass 14 evidence and next work

See `qa/back-nine-experience-pass14-2026-11-12.md`. Six authored playing corridors, connected tee walks, coherent service courts and corrected bunker/path depth now express the existing physical routes. Navigation signature2693326411 and 68 exact routes remain unchanged; twelve live-Joe runs complete (four cart/eight foot). Final cache-tag installed client artifacts exist and no owned client/benchmark process remains live. Software timing is mixed; performance remains open. Continue connected environmental storytelling, restrained supernatural moments, controlled variation and the full outstanding route/audio/animation/retry/performance audit.


## Pass15 evidence and next work

See `qa/back-nine-experience-pass15-2026-11-12.md`. Connected staff records now support the crew logs, and a quiet occupied-cart sighting reuses the actual Joe art outside playable lanes. Actual rendered subtraction caught and corrected a figure hidden by its seat. The shared encounter gates it; ordinary subtitles yield, while real danger and essential messages retain their roles. No new simulation actor, collision, sound voice or light. Ghost preparation reuses existing buffers/materials with one bone-palette proxy; inactive figures detach.

Garage approach now avoids the oversized entrance-lamp view; progress lamps and real closing/arrival/retry/save flows remain verified. One small atlas plus one bone palette adds two textures; the rare visible figure costs about4ms median in the final paired software sample. Larger frame spikes remain open. Continue controlled variation, broader omen composition/full-route frequency, route/lighting/audio/animation and retry acceptance, and sustained performance work. All38 rows remain in scope; later human tests are prepared, not conducted.


## Pass16 evidence and next work

See `qa/back-nine-experience-pass16-2026-11-12.md`. Previous goal turn restated the roadmap without changing authoritative state; this turn resumed the pending implementation and made additional camera changes. All38 requirements remain active.

Fresh rounds now vary secondary encounter preferences, remembered-evidence search ordering, bounded district eligibility and ambient cloud timing. Checkpoint retries/reloads retain the seed and reset checkpoint-local choices/time. Both relay/death/retry/reload cycles pass on hardware/software; legacy saves migrate once, explicit restart chooses a new seed.64 live-Joe full routes yield seven encounter patterns,42 cart finishes and22 foot finishes. Existing collision, warning and sensory contracts remain.

Run-over audit found partial fall occlusion and a frame-dependent camera entry. The camera now uses captured entry position plus simulation-age interpolation; five actual fatal-contact scenarios produce identical camera poses at60/30/15Hz. Higher side framing exposes more of rear/side falls; frontal fall is still partly hidden and must not count as complete visual acceptance. Audio retains one impact/one landing and no additional nodes. No simulation/damage/movement changes in this correction.

Rejected the pending precise-tree-box candidate: clubhouse median55.1→59ms, no reliable whole-course improvement, and extra trees submitted. Restored course-pines.js byte-for-byte to its pre-candidate snapshot; saved diagnostic candidate/results. No GPU/frame-spike improvement claimed. Next: remaining run-over frontal/obstacle composition, broad route/cover/readability/audio/retry acceptance and sustained software performance. Human tests remain prepared for later.


## Pass17 evidence and next work

See `qa/back-nine-experience-pass17-2026-11-12.md`. Previous goal turn was progress. Fixed the frontal run-over defect at its source: the body now tips along impact while retaining its original facing, rather than rotating180degrees into the mower. Limbs relax after landing. Cached exact mesh supports keep36 impact directions grounded. The camera chooses a clear side once and constrains its transition against real cover; direction-independent diagnostics recognize backward/side deaths.

Actual rear/front/side, relay, garage and two windbreak contacts pass at60/30/15Hz. Frontal fall63→896 hardware pixels; software895. Full front death/pause/retry/comfort/audio/resource browser checks pass on both renderers. Same24runner meshes/26,754vertices,20/25programs,40textures,12voices. Added bounded CPU support work only during the fall (mean≈0.09ms/p95≈0.2ms); no GPU/startup gain claimed. Closed-garage aftermath can remain physically occluded beneath the stopped mower, while the fall/cause is shown; no fake pass through the gate.

#34 implementation/technical acceptance is complete; human feel remains deferred. Keep remaining rows active, especially measured software frame stability, whole-course route/cover/lighting/spatial-audio/retry and optional-omen acceptance. Next audit should move beyond repeated death-camera polishing unless new evidence identifies a defect.


## Pass18 evidence and next work

See `qa/back-nine-experience-pass18-2026-11-12.md`. Previous goal turn restated the list without implementation progress; this pass found and fixed a real foot-passage defect. The rotating square runner hull could intersect a fence during turning and permanently reject subsequent motion. A round .32m ground footprint now permits reliable sliding/turning, while cart/mower rectangles and sweeps remain exact.

Same48 passage cases:38 completions/eight snags/two catches before;46 completions/zero snags/the same two close reverse-approach catches after. Keyboard browser regression0→4.8838m progress.12,960 heading/contact tests,8,000 exact vehicle comparisons,1,401 ejection placements,64 full live-Joe wins and actual ejection/run-over/control/search/choice suites pass. Hardware/software at2560x1600,1280x720,844x390 and installed client inspected. Unchanged20/25programs,40textures,1,114buffer uploads,12voices; no errors or new rendering resources. No GPU/frame-time improvement claimed.

Full38scope remains active. Next: remaining measured software stability and broader route/lighting/spatial-audio/retry/omen acceptance. Foot-passage ground surfaces remain a potential art/movement/audio consistency issue (pavers classified as rough in places); evaluate the intended surface before changing speed balance. Human tests remain deferred/prepared. All owned test handles terminal; server retained.


## Pass19 evidence and next work

See `qa/back-nine-experience-pass19-2026-11-12.md`. Previous pass18 was progress. This pass isolated rendering components and tested two candidates; neither is enabled. Software component measurements implicate the mower/rider geometry as well as foliage. The rider contains18,970 triangles across nine materials, with17 bones.

Uniform bone palettes rendered identically in same-world comparisons but moving timings were mixed, including foliage p9566→71.8ms. Per-fragment finite-light rejection regressed all four measured medians. Both candidates were rejected and the three affected live files restored byte-identically; archived source/reports remain reproducible. Restored installed-client screenshot/state inspected,25programs40textures, no errors. All owned processes terminal, local server retained. No shader speedup or startup improvement claimed.

Next performance direction: inspect baked geometry/index efficiency and carefully bounded distant actor detail, with close-range art/poses/silhouettes preserved and actual moving-frame proof before retaining a change. Do not repeat rejected uniform-palette/range-branch experiments without new evidence. Full38scope and the broader route/lighting/audio/retry/omen acceptance remain active; human testing remains deferred/prepared.


## Pass20 evidence and next work

See `qa/back-nine-experience-pass20-2026-11-12.md`. Previous goal turn restated the list without implementation progress. Recovered terminal geometry experiments: cache-only still changes three pixels and gives small/mixed gains; the distant candidate changes more pixels and regresses some p95 timings. Neither is deployed; no GPU/startup improvement claimed. Avoid treating old candidate manifests as exact reproduction of later builds.

Implemented shared camera-relative mower sound/captions and fixed distant blade emphasis ignoring attenuation. Caption side follows actual stereo and Q rear glance, hidden search intentions are not exposed, and silence is not falsely described. Range70m now truly silences distant blade emphasis; close-range rendered output stays identical. Optional descriptions remain separate from ordinary banners and mute/subtitle settings. Same12voices,20/25programs,40textures,1114buffer uploads.

32caption rules,32offline audio renders,44mix cases/four directions, hardware/software at2560x1600,1280x720,844x390,390x844, actual search/reacquisition/close-pass and run-over/impact regressions pass. Installed standard client two bursts and screenshots/state inspected. Full38scope remains active; broader route/landmark/darkness, omen variety/frequency, environmental audio, startup/retry acceptance and measured rendering stability remain. Human listening/playtests are prepared, not conducted. All owned test handles terminal; server retained.


## Pass21 evidence and next work

See `qa/back-nine-experience-pass21-2026-11-12.md`. Previous goal turn made progress. Corrected the identified footpath mismatch: one precomputed rounded layout now drives .82m maintained beds, paved runner footing and actual sole-contact audio. Original141slabs, collision openings, vehicle traction and Joe navigation remain. No arrows/new lights; no new draw batches/programs/textures/audio nodes.

680route samples,269031old/new vehicle surface comparisons,48foot passages (46complete/two same real catches/zero snags),64full live-Joe wins and choice/ejection/wreck checks pass. Hardware/software9views each, actual W/contact/reduced/pause checks and installed standard-client two bursts inspected. Step off the strip and both movement/audio return to rough.

Sequential timing drift prevented reliable comparison; a same-scene64pair test isolates new ground triangles. Foot-view median overhead .4–.9ms, no broad GPU speedup; software spikes/startup remain open. Keep full38scope active: remaining course/landmark/darkness and natural route/encounter/omen/audio/dialogue acceptance, cold startup/retry and rendering work. Human tests prepared for later. All owned handles terminal; server retained.

## Pass22 evidence and next work

See `qa/back-nine-experience-pass22-2026-11-12.md`. Previous goal turn restated the roadmap without authoritative implementation progress. This pass finished the pending exact surface bake, replaced ten serial file requests with one312,498-byte content-addressed archive on the existing serial worker, and retained original painter fallback. Canonical source and all gameplay/art settings remain unchanged. Native RGBA proof plus24same-scene hardware/software framebuffer comparisons produce zero changed channels. Existing decoder and new batch hidden/cancel/failure contracts pass.

Eight alternating cold processes: median ready5544.85→5409.55ms, construction438.4→284.15ms, sampled main-thread painting43.425→0ms. This is a modest135ms startup improvement, not a general frame-spike fix. GPU fairness waits/batch limits and25software/20hardware programs,40textures,1,114uploads,12voices remain. Twelve checkpoint retries reuse the scene and audio with no assets/decodes/uploads, clear held keys, and accept fresh movement. Final installed client moves15.655m with actual Joe pursuit and quiet banners; screenshots/state inspected.

The latest38-point roadmap is a refinement of this full scope, not a narrower replacement. Its signature reveal remains part of#3/#9; control reliability#6/#19; all other pacing, tactical, atmospheric, mechanical, narrative and verification requirements stay represented. Next work remains measured moving-frame stability and whole-course route/cover/landmark/darkness, natural encounter/omen/audio/dialogue acceptance. Human tests remain prepared for later. All owned test handles terminal; local server retained.

## Pass23 evidence and next work

See `qa/back-nine-experience-pass23-2026-11-12.md`. Previous goal turn restated the roadmap without implementation progress. Finished the pending physical working-mower reveal (1.65s notice, normal pursuit afterward), brief-occlusion presentation continuity, non-reversing deliberate stop and safe forward-room ejection preference. Checkpoint spawns, physical warnings, damage rules and protection remain. Same-wreck forward movement improves1.369→10.337m without adding candidate positions or invulnerability.

Retained a fully checked outward passing exit. Investigation disproved simple pressure-timer starvation in the sampled clubhouse approach: post-hit invulnerability correctly excluded another attack, then the straight exit was obstructed. Preserve that protection. A moderate-pace natural route actually overtakes; fast drivers can evade the outward attempt. Hardware/software real-input warning/pass/escape checks, seven district runs, sixteen pace explorations,64seeded full finishes, three full foot starts,1,401 landing placements, panic/director and ejection checks pass.64runs now55cart/9foot,14patterns; changed downstream balance remains for later human assessment.

Opening/ejection/pass imagery inspected at2560x1600,1280x720,844x390; installed client uses real ArrowUp from fresh start with visible Joe and quiet banners. Same20/25programs,40textures,12voices; no measured moving-frame speedup claimed. Full#3/#6/#9/#10/#12 acceptance remains broader than these fixtures. Artificial instant opening wreck routes include five actual catches and one completed central-cut escape; do not claim every early route is safe.

Continue full38scope, especially measured software stability and whole-course routes, landmarks, darkness, natural audio/dialogue/omen pacing. Human tests remain prepared for later. Do not force every district encounter or weaken protection to satisfy a single-route assertion. All current retained behavior and test details are in pass23 QA.

## Pass 24 — rider visibility and natural opportunity evidence

See qa/back-nine-experience-pass24-2026-11-12.md. Independent padded bounds remove nine off-screen Joe mesh submissions while retaining all visible detail. Hardware/software each pass216 paired views, actual Q/pause/reduced-motion checks, unchanged resources, software warm retries and installed-client play. Three moving off-screen cases improve software median draw completion by1.3–3.6ms; fully visible workload remains unchanged/mixed. #1 remains partial. Pine light partitioning and single-sided rider candidates were rejected. No broad FPS/startup/human claim.

All38 requirements stay active. Sixteen natural route/pace/seed simulations reveal zero safe staff-sighting time at the current two sites; #31 needs a quiet, physically plausible opportunity rather than looser attack protections. Full route/darkness/landmark/audio/dialogue acceptance and human tests remain open/prepared.

## Pass25 — natural staff sighting

See qa/back-nine-experience-pass25-2026-11-12.md. Sixteen complete routes exposed zero staging eligibility at the original two sites. Allowing the working phase alone failed because the seat was already in view; shared encounter policy restored exactly. The first staff cart is now occupied before the first frame of a fresh undamaged run, silently disappearing only out of sight. No new actor placement during pursuit/checkpoint/foot play; original later staging protections unchanged.

Actual input/browser pixel checks pass at2560×1600,1280×720,844×390 on hardware/software; original two-site, pause, comfort and checkpoint checks pass;16 route simulations remain identical. Programs20/25,textures40,voices12/uploads1114 unchanged. Added visible figure costs~4ms software median in paired samples, zero measurable median difference after disappearing; keep this in#1 rather than claiming performance complete. #31 remains partial for further variety and human recognition. Full38 scope retained.


## Pass26 evidence and next work

See `qa/back-nine-experience-pass26-2026-11-12.md`. The previous goal turn restated the list and was no progress. Retained conservative one-time exclusion of three fully enclosed staff-cart meshes: 1,471 vertices/1,343 triangles,192 hardware/software image pairs exact,three saved submissions. Software medians improve0.5–1.3ms in visible views but p95 is mixed/worse; this does not close frame-spike work. Opening pause/comfort/checkpoint regression and six warm retries pass without extra resources.

Found and fixed a real controller defect: saved0.30 deadzone still allowed0.24 input to turn the cart0.09925rad in0.5s. Chase now respects the shared setting and rescales each axis continuously to full input; Back Nine exposes the setting.21 actual movement/UI cases,60,003 mathematical samples,existing binding/menu/mouse/garage/storage checks and three-chapter settings recovery pass. Visuals inspected2560x1600,1280x720,844x390; standard client final page/state inspected.

Recovered completed natural branch7 run from authoritative report after old handle was missing. Main/reservoir routes completed81.083/81.500s with2/28HP cart. Post-control reservoir run completed83.917s following genuine late cart destruction at73.650s, eight impacts, on-foot arrival and both crew logs. Different seeds, not a causal route/health comparison. Three captures each show only two Joe lines; no rev/ram/damage-number chatter. Broad route/readability/priority acceptance remains open, especially subtle side-route entrances.

Full38 scope remains active. Next: required-route wreck coverage and broader all-district foot/landmark/lighting/audio acceptance alongside measured software hot spots. Do not treat one natural foot finish or exact rendered pixels as human feel/navigation proof. Human tests remain prepared for later. All owned test handles terminal; local server retained.


## Pass27 evidence and next work

See `qa/back-nine-experience-pass27-2026-11-12.md`. Previous goal turn was progress. Required-route wreck audit covers639 legal course/critical configurations and18 actual runner-movement replays to remaining objectives/garage. A coarse-grid false failure beside the service trailer was resolved by exact longer start links after real movement proved it passable; no runtime rule was weakened.

The audit found178 centre-to-landing bollard crossings in6,720 garage configurations, including three reproduced actual fatal rams. New analytic clearance checks both cart centre and actual seat corridors against existing course geometry. All13,440 independently sampled segments now clear; all6,720 still find landings. Existing1,401 clearance cases/four fatal-control tests pass. Three angled fatal garage impacts lead to normal-input on-foot wins on hardware/software with unchanged recovery and liveJoe.

Visual review found the old landing-centred camera could hide the airborne body behind the garage wall. It now follows the rendered body, constrains the interpolated arm and temporarily centres the fall, blending into ordinary follow through recovery. An initial close-up candidate was refined before acceptance. Final high-resolution/ordinary/compact/reduced views and installed-client page/state inspected. Hardware20/software25programs,40textures,12voices unchanged. Landing CPU median0.770→0.837ms in500paired samples; no GPU/frame-spike improvement claimed.

#18 now has broad sampled technical acceptance; human decisions/comfort remain prepared. Full38scope remains active. Next priorities: actual software hot spots; whole-course route/landmark/lighting/spatial-audio and encounter-priority acceptance, with all-district foot balance. No human testing conducted. All owned test handles terminal; server retained.

## Pass28 evidence and next work

See qa/back-nine-experience-pass28-2026-11-12.md. Previous goal turn restated the roadmap without implementation progress. Added flush, textured stone edge courses at the mouths/reconnections of all ten existing alternative routes; no extra lamps/arrows/obstacles or gameplay changes. Dense8400point layout checks, all seven branch drives and actual fatal-impact foot escape pass. Hardware/software48 paired approach views at2560x1600,1280x720,844x390 demonstrate clearer lane entrances; no new shader/texture/runtime upload work. Full fresh dry-range branch8 with normal inputs completes88.05s, natural late ejection78.83s and live-Joe foot finish. Software paired medians similar, tails mixed (reservoirp95 worsened); no frame-spike improvement claimed.

Full38scope remains active. Junction/readability work advances#5/#23/#24 but does not close first-time recognition or whole-course acceptance. Next prioritize measured frame stability and attack/audio recognition/full-route priority, alongside remaining cover/darkness/retry/omen work. Human tests stay prepared for later.

## Pass29 evidence and next work

See qa/back-nine-experience-pass29-2026-11-12.md. Previous turn made progress. Fixed sound-description settings suppressing otherwise eligible Joe subtitles: steady engine/location captions now share the separate rail, while discrete urgent sounds interrupt optional dialogue regardless of caption settings. Removed repeated second-relay navigation prose appended to range taunts. A natural run exposed1.05s/0.05s taunt flashes; dialogue now requires0.8s stable cruise and stays silent during tactical-choice intervals. This changes only dialogue admission, never attack timing.

Eight subtitle/description/context combinations,18 priority cases, eight layouts per renderer (including390x844 and1.4x text),100-line deck/reload, quiet/defeat, actual partial-repair, physical encounter/district/charge and32 offline audio cases pass. Standard gameplay client with sound descriptions inspected. Same12voices20/25programs40textures; no performance gain claimed. Two full normal-input branch3 runs after the caption fix complete on foot. Final settled-policy pressure run has no optional lines, avoiding the observed flashes but leaving broad frequency/quiet-route recognition acceptance open. Full38scope remains active; human tests stay prepared. Next prioritize measured software stability/startup and remaining full-course attack/audio/lighting/readability acceptance; do not claim dialogue presence alone proves readability.


## Pass30 evidence and scope refinement

See `qa/back-nine-experience-pass30-2026-11-12.md`. Removed repeated unchanged category/master audio targets: 2,695->5 events over539steady updates, with real paired audio output checked across opening/settings/pause/mute/ejection/run-over/ending and context reopen. Music/state/cue/resource regressions and installed on-foot client pass. Float sample error<0.000001744; not a bit-identical PCM claim or an FPS claim.

Two browser-only render candidates rejected: solid-cover culling preserves pixels but has mixed/slower medians; turf draw ordering changes a few edge channels and has mixed/slower tails. Production scene/pines/occlusion remain byte-identical to pass-start. GPU spikes and cold startup remain open. Do not repeat these candidates without new evidence.

The latest roadmap preserves the full scope, including an explicit additional refinement under original#13: implement a readable mutually exclusive utility choice (gate/light/diversion/service tradeoff), not just independent one-use bells. This refinement is **not implemented** and needs physical route, both-outcome, retry, art and performance evidence. All other outstanding ledger items remain active. Human tests stay prepared for later.


## Pass31 — shared reserve acceptance

See `qa/back-nine-experience-pass31-2026-11-12.md`. Prior goal turn was a status restatement, not progress. Finished item13's two shelter repair-versus-alarm choices. A real approach disproved staged eligibility:12m rejection conflicted with11m checkpoint following.6m immediate-danger rejection plus a one-second objective notice exposes a usable deliberate choice without changing attacks, retreats, protection, collisions or navigation. Physical-bell range checked; no automatic spend on held approach brake.

Full normal-input runs demonstrate first-alarm victory at79.183s/100% cart and repair-then-second-alarm at80.133s/42% cart. Both shelters, cart/foot30/60Hz, human-input browser actions, comfort, remaps, pause, saved choice/retry and12 audio cases pass. Final full simulation suite has12 successful live-Joe drives; installed client page/state inspected.20/25programs40textures12voices unchanged,16 extra initial small buffer uploads; no runtime growth. Four-view software comparison is mixed, with first-pad median32.7→34.7ms andp9538.9→49.3ms: retain this cost under item1, not a performance win.

Current strict count:20 implemented/technically verified,17 in progress,1 human-test package prepared. Full38scope remains active. Deferred guide includes utility cost recognition, usefulness and retry understanding. Next: measured visible workload/frame stability and remaining full-course encounter/route/lighting/audio acceptance. All owned tests terminal; local server retained.


## Pass32 — director priority and dialogue admission

See `qa/back-nine-experience-pass32-2026-11-13.md`. Previous goal turn made progress. Fixed a reproduced new-ram interruption of a pressure gather; opening/gather now own their intervals while their own controller counts down. Matching music ducks0.32, verified in actual paired audio, and recovers normally.149 priority pairs/eight channels, independent consumers, six timing scenarios, hardware/software real controls/comfort/layouts, existing pursuit tests and12 full finishes pass. Item2 technically accepted; full pacing/balance remains separate.

A natural dry-range run caught a0.4s taunt admitted while Joe was already losing sight. Separate start eligibility prevents that known-short slot without cancelling an otherwise readable line on brief uncertainty or modifying attacks. Repeated full route has192 identical simulation samples, genuine cart destruction70.383s and on-foot victory96.050s; no optional taunts on that intense route. Clear-slot dialogue works in browser tests. Item33 still needs broader frequency/tone acceptance.

Rejected browser-only fully-fogged shading shortcut: six of seven moving medians slower, all21 cross-context image pairs differ. Production renderer unchanged. No FPS gain claimed; software/cold spikes remain open, including pass31 shelter cost. Current count21 implemented,16 in progress,1 human kit prepared; full38scope active. Next investigate measured shader/preparation workload and finish broad course/pacing/lighting/audio acceptance. All owned tests terminal; server retained.

## Pass33 — cooperative course construction

See `qa/back-nine-experience-pass33-2026-11-13.md`. Previous turn was a status restatement, no progress. Added per-scene ordinary-task fairness and section boundaries, preserving geometry/order/art. Controlled baseline/candidate comparisons reduce largest timer gaps; real-input runs also reduce median peak input delays, but software total loading is slower/mixed and some200–350ms stalls remain. No in-game frame-rate claim. Shader batching remains an unused experiment; buffer sizing investigation did not reproduce an oversized actual batch.

Hardware/software each9exact framebuffer pairs and all geometry hashes pass at2560×1600,1280×720,844×390, repeated against the latest shared build. Hidden/cancel/fallback/upload contracts, movement/pause, installed two-burst client and12scene-reusing from-shed retries pass. Separate controlled graphics peer stays smooth in both versions. Resource reduction1130→1095uploads belongs to concurrent alarm removal, not this optimization.

Concurrent edits removed bells/utility selection and changed death retries to the shed. Preserve them pending user policy clarification; the original checkpoint test fails correctly. Item13 reopened because a previously accepted mechanism is no longer present. Current strict count20implemented/17inprogress/1human kit prepared. All38requirements remain in scope; no completion claim. Next: remaining atomic startup work and measured visible rendering costs, whole-course acceptance, and reconcile mechanism/retry policy. Human testing remains deferred.

## Pass34 — localized course sound and confirmed retry policy

See `qa/back-nine-experience-pass34-2026-11-13.md`. Prior turn made progress. Seven existing cabinets/chargers/garage circuit now have localized quiet hums, reusing the drone with one persistent panner. Actual direction/distance/cover, attack priority and optional captions share world state. No new voices/buffers/geometry. Mixer regression found and fixed a volume-zero envelope restart; normal far/intro/death output remains numerically equivalent and mower warnings exact.

64rules,16audio cases,four full-mix comparisons,32mower cases,44mix cases,24responsive hardware/software views and standard-client movement pass. Main/reservoir full routes both win after organic late destruction/on-foot escape; local sounds remain brief. Item29 technically accepted; human recognition/listening prepared. User confirmed whole-level restart fromshed. Twelve real retries verify fresh progress/health/reserves and scene/audio reuse;35staysopen for cold stalls. Disabled alarm choice13staysopen.21implemented/16inprogress/1human kit prepared, all38scope active.


## Pass35 evidence and next work

See `qa/back-nine-experience-pass35-2026-11-13.md`. Previous turn was progress. A real0.15second Joe line was admitted immediately before the closing mower crossed the urgency cutoff. A read-only3.5second closest-approach check now gates new lines without consuming a shuffle/cooldown or reserving gameplay time. An intermediate paired route then exposed a0.05second stale-owner leak; current hunt/pressure commitments now suppress dialogue in the same physics step. Actual warnings/objectives still interrupt immediately. No pursuit, controls, collision, damage, audio or art changes.

New approach and existing dialogue/deck/priority tests pass, including149director pairs,15/30/60Hz timing, both browser renderers, four responsive sizes and installed standard client. Paired route physical state remains identical; no taunt is forced into a busy chase. Current-context availability/tone is still partial under33; no performance gain claimed.21implemented/technically verified,16in progress,1prepared. Next: meaningful non-bell manipulation under13, broad route/cover/light/pacing acceptance, and remaining measured rendering/startup work. Whole-level death restart remains the confirmed user policy. Human testing stays deferred/prepared.

## Pass36 — manual shortcut gates and verified shed retries

See `qa/back-nine-experience-pass36-2026-11-13.md`. Three existing gates now offer a non-bell course mechanism: stop/hold1.1s, then0.8s physical opening while Joe pursues. Actual leaf collision, obstructed-swing waiting, overlap escape, ejection placement and Joe-only destruction verified. One range approach hurdle moved onto the shoulder. Existing pieces/materials/audio voice reused; no new lights/textures or runtime resource growth.

24 crossings,126 poses,30 gate landings,6720 garage ejection arrangements,16 responsive hardware/software views, actual range miss-and-escape choices, full intact-cart route, installed client and12 fresh-shed retries pass. Gates reset on death; no intro/assets reinitialization. Human balance remains prepared; software frame spikes/cold stalls remain open. Item13 technically accepted:22 implemented,15 in progress,1 prepared. Preserve concurrent living-course/detail work; measured resource totals vary across those revisions and are not a gate-only performance comparison.

## Pass37 — runner grounded on the new course terrain

See `qa/back-nine-experience-pass37-2026-11-13.md`. Prior turn made progress. Current foot routes still pass46/48 escape approaches with two close catches and zero snags; subsequent model audit found flat foot targets beneath a terrain-following root. Independent local elevation/slope targets now use the existing ankle joints and pelvis solve. Paired actual mesh scans reduce maximum penetration7.16cm to none and planted movement4.01cm to under2mm. Controls/physics/pursuit unchanged.

34,693 current mesh samples across14 authored routes at15/30/60Hz,2,940 flat equivalence/pause/reset samples, actual steering/garage, continuous ejection, sensory-cover and installed-client checks pass.24 meshes, no GPU resource growth; gait CPU adds roughly0.004ms median in a warm microprofile. Software frame spikes remain unresolved; no FPS claim. Item19 technically accepted:23 implemented,14 in progress,1 human kit prepared. Next: measured scene rendering/startup costs and remaining whole-course pacing/route/readability acceptance. Preserve concurrent scene detail and all38 requirements.
## Pass38 — terrain cost, smaller construction steps and shed retries

See `qa/back-nine-experience-pass38-2026-11-13.md`. Prior turn made progress. Horizontal flat ground outside authored terrain fields now avoids redundant clipping; hills and raised borders retain their geometry. Estate/fairway/route builders expose smaller scheduling steps with identical construction output. All scenery, routes, lighting, audio and pursuit remain present.

147,380 surface samples, 77,545 exact height queries, unchanged navigation, and 1,743-piece builder equivalence pass. Four fresh software browsers measure ready time 12.9–13.8s before versus 11.0s after; maximum timer gaps 915–1080ms versus 360–441ms. Geometry uploads fall by 7.4MB. Moving frame comparisons remain mixed, including opening/clubhouse p95 regressions; final unpaired standard-client p95 is 101.5ms. No claim that software frame spikes or loading stalls are solved.

Twelve hardware/software R/Enter/button death retries verify a full shed reset and scene/audio reuse. Current concurrent retries now use a fresh variation seed; preserve this alongside the user's whole-level restart choice. Standard-client movement and 2560x1600/1280x720/390x844 views inspected. No new errors or warm resource growth. Counts remain 23 implemented/technically verified, 14 in progress, one human kit prepared. All 38 requirements remain in scope; all owned jobs terminal and server4187 retained.