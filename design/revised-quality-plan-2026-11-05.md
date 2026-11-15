# Rough Cut — revised quality plan after rejected rebuild

Superseded for next-work sequencing by `quality-reset-plan-2026-11-06.md` after the user rejected the perspective candidate. This document preserves the earlier plan.

Status: implementation candidate available; see `qa/perspective-rebuild-2026-11-06.md` for item-by-item engineering evidence and unresolved acceptance. The original acceptance targets below remain in force. This plan responds to the user's renewed report that visuals, navigation, movement and gameplay still feel bad after the foundation pass. It supersedes the earlier backlog's implied acceptance of those areas. Prior functional fixes remain useful; their existence does not close the experience problem.

## Assessment and evidence

Reviewed the current source, world/presentation contract, implementation report and latest captured build (`output/rebuild/final-verified-client/shot-0.png`). This is not a new human playtest, audio audition or fresh performance benchmark. Human study sessions remain prepared for later, as requested.

- The capture still combines detailed, cutout-like carts and vegetation with simple faceted hedge geometry and a low-detail ground plane. The art does not yet read as one consistent physical space.
- The source uses physical lateral units of 0.72 and a projected lateral factor of 0.12. Combining `relativePoint` and `project` gives a horizontal projection gain of 0.12/0.72 = 1/6 on physical lateral displacement, while depth uses the physical forward basis directly. Sprite dimensions and cover heights use additional conventions. This is a concrete calibration concern; it is not proof that changing one constant will fix feel. A correction requires reblocking space, object scale, speed and camera together.
- The ground is generated at 480×148 and enlarged; cover uses depth-sorted Canvas faces, while other objects remain sprites. Consistent inverse math does not provide depth-buffered occlusion, cohesive materials or convincing near views.
- The prior real-rAF samples measured gameplay medians around 33–67 ms on a shared headless host. They do not qualify target hardware, and the rebuilt tail intervals did not establish an FPS improvement. Render-only timing excluded presentation costs.
- Fewer overlays and additional choices addressed symptoms. The latest user feedback rejects the overall result. Movement quality, visual quality, navigation clarity and gameplay engagement must be reopened rather than described as awaiting a ceremonial sign-off.

## Recommended direction

Keep the golf-course stealth premise, Joe, ball lures, route risk, readable pursuit and fast retry. Build a small genuine 3D first-person prototype with simple coherent meshes, one perspective camera and depth-tested rendering. Use stylized pixel/painted materials deliberately. Compare it against the current slice using the same route and input sequence before committing to a full migration. This is an architecture recommendation, not a selection of an engine or a claim that 3D automatically makes a game fun.

If the current renderer is retained, it must pass the same close-range/orbit/occlusion/response checks. An intentionally fixed or constrained camera is another coherent option, but would materially change the first-person experience and should be evaluated as such. Do not preserve unrestricted free look while treating view-dependent scenery as a finished environment.

Primary design target for this plan: desktop keyboard/mouse. Controller must work in the same slice. Touch receives its own ergonomic pass; shrinking the desktop interface is not acceptance.

## 40 concrete work items

P0 blocks the next course-wide art/content pass. P1 develops the proven slice. P2 follows evidence that its core loop is enjoyable. Acceptance targets below are proposed tests, not results.

| ID | Priority | Work | Acceptance |
| --- | --- | --- | --- |
| S01 | P0 | Prototype one true-perspective room/outdoor pocket with ground, a hedge, cart, doorway and Joe placeholder. Use actual depth testing. | Orbit, approach, pass through, turn back and view overlapping objects without depth swaps, card-like prop rotations or clipping through cover. |
| S02 | P0 | Calibrate world scale, eye height, player width, object dimensions, near plane and field of view together. Replace unrelated visual/physical conversion conventions in the candidate. | A measured square and repeated doorway have consistent proportions across heading; movement and distance are readable from scenery. Do not patch only the .12 factor. |
| S03 | P0 | Choose one art treatment for terrain, cover, props and characters; build a small in-scene material/prop kit. | Near, medium and far captures look like the same game. Detailed cutouts beside crude repeating walls fail the review. |
| S04 | P0 | Replace arbitrary faceted hedge cylinders with authored silhouettes, foliage edges, grounded bases and appropriate collision shapes. Give carts/door frames real side and rear volume. | A player can predict contact from what they see on every approach; volume remains convincing when looking back. |
| S05 | P0 | Build a representative real-time benchmark: turn, strafe past cover, chase, interact, retry; measure displayed frames and input response. | A named target device reaches the agreed frame target during a sustained run; report median, p95/p99 and recurring stalls. A short render-only average is insufficient. |
| M01 | P0 | Tune raw look response, field of view and translation speed in the calibrated space. Provide independent mouse and controller look settings. | Small corrections and 180-degree turns are predictable; no delayed view response, unintended acceleration or constant overcorrection in later trials. |
| M02 | P0 | Compare immediate motion with a short acceleration ramp using identical stop distance. Select a baseline from the comparison. | Starting feels responsive, releasing stops promptly, reversing does not drift, and sprint-to-walk transitions remain controllable. |
| M03 | P0 | Fit collision to the chosen player body; use stable sliding/sweep or equivalent contacts, including multi-surface corners. | Front, oblique, reverse and diagonal approaches neither snag nor penetrate; narrow gaps communicate whether the body fits. |
| M04 | P0 | Simplify speed rules: posture plus one explicit terrain cost; show friction/noise through the material and footstep response. | Players can explain a slowdown before a tooltip; removed hidden/stacked bonuses do not silently change movement under identical input. |
| M05 | P1 | Add restrained body presence: grounded footfalls, crouch posture, sprint transition, club wind-up and optional motion. | Every motion follows actual displacement/action; wall pushing produces no false walking; target visibility and comfort remain intact. |
| N01 | P0 | Reblock the opening into a legible sequence of spaces with visible entrances, broad paths and a clear destination silhouette. | With routine guidance hidden, a newcomer can choose a plausible next direction at every junction. |
| N02 | P0 | Rework objective placement and sightlines so the next destination is visible, framed, lit or clearly signposted from a useful vantage point. | The player can point to the goal in the environment; a floating name above unrelated scenery is insufficient. |
| N03 | P0 | Give each encounter two reconverging approaches: a readable exposed shortcut and longer covered route. Remove accidental dead ends and corrective zigzags. | Both routes are viable through normal input; their risk is visible before committing and the player can recover from a wrong turn. |
| N04 | P1 | Make map, compass, signs and environment use the same landmarks/route names. Show heading, confirmed entrances, locked exits and selected destination. | Players can translate a map glance into the next turn without interpreting implementation coordinates or contradictory cues. |
| N05 | P0 | Audit navigation and targeting ownership: one objective, one intentional interactable, one temporary warning. Use a clear reticle/range rule and stable target commitment. | Adjacent objects do not swap prompts unexpectedly; surface hazards do not hijack the goal; the input activates exactly what was shown. |
| G01 | P0 | Author one short encounter that begins with observation, supports a deliberate lure, makes the objective risky, and ends in a clear recovery space. | A player can describe their plan, Joe's reaction and why the escape worked. Duration is tuned from observation rather than forced to a timer. |
| G02 | P0 | Make Joe's visible intent central: patrol route, facing, noticing a sound, leaving work, inspection, search and pursuit. | The player can infer a useful opportunity from Joe's behavior without a paragraph of explanation or an omniscient HUD. |
| G03 | P1 | Make the three objectives structurally different: bell timing, quiet/noisy log interaction, and a release commitment that changes the escape route or pressure. | Each encounter requires a different decision. Repeating Use → run behind cover with different labels does not pass. |
| G04 | P1 | Make route and tool tradeoffs situational: time, exposure, noise, inventory and Joe's current position. Remove redundant choices and tune dominated options. | Both options have concrete useful situations; the obvious safe option is not always best, and risk produces an observable benefit. |
| G05 | P1 | Make ball lures a precise, expressive mechanic: targetable landing, readable throw/flight, predictable surface sound, Joe response and recovery. | The player can deliberately redirect Joe to a useful location, recognize a miss, and understand what one ball purchased. |
| F01 | P0 | Specify a short response sequence for each action: accepted, underway, consequence, completed or interrupted. | Input receives an immediate visible/audible response; cancellation and success cannot be confused; no input silently vanishes. |
| F02 | P1 | Give props a physical state change: bell/clapper motion, actual stamp/page response, valve movement, gate/door opening. | The changed world state remains understandable with HUD hidden. Wobbling an entire static picture is not sufficient final animation. |
| F03 | P0 | Make detection causal: distinguish sight, sound and last-known-position search; show Joe turning/committing before full pursuit where rules permit. | After capture, the player can name the cause and a viable correction; no unseen source makes a seemingly arbitrary acquisition. |
| F04 | P1 | Build readable escape relief: Joe checks the wrong place, sound recedes, breathing settles and an onward route becomes available. | The player notices successful stealth before a reward popup; genuine new sight can still restart pressure. |
| F05 | P1 | Enforce a strict feedback hierarchy and short lifetimes across text, sound, VFX and camera. | Immediate danger overrides optional discoveries; old lure advice expires; only one primary instruction demands attention. |
| A01 | P1 | Recompose major zones around distinct spatial silhouettes: wet pump crossing, porch/service area, enclosed maintenance yard, open light-controlled range and escape threshold. | In later testing, players recognize at least two visited spaces with labels hidden. Pennants and recolored ground do not substitute for composition. |
| A02 | P0 | Make walkable ground, noisy/slow materials, cover and light exposure visually distinct. Add local lighting and contact shadows consistently. | Grayscale and ordinary captures retain the path/object hierarchy; a player can spot an opening and hazardous material before entering. |
| A03 | P1 | Replace texture shimmer, smeared repeated ground and mismatched pixel/detail scales with a deliberate texture/filtering policy. | Slow movement and turns remain stable, not just still images. Important objects remain readable on compact displays. |
| A04 | P1 | Use purposeful effects for ball impacts, wet steps, mower clippings, station response and capture. Limit ambient effects to support the scene. | Every strong effect communicates an action/material/threat; no fog, particles or flashes conceal required information. |
| A05 | P1 | Build an audio scene with dependable direction/distance, cover filtering, material footsteps and distinct action cues; measure output separately from audition. | Speaker/headphone tests identify threats comfortably; mono/captions preserve necessary information; critical cues are not masked by ambience. |
| U01 | P0 | Redesign the moment-to-moment HUD around one objective, relevant resources and one contextual action; place prompts beside their object where practical. | The environment remains the main focus; no giant interaction cards or tiny essential text at the supported viewports. |
| U02 | P1 | Teach movement, observation and one lure through a short playable opening; introduce later systems only when needed. | The player starts moving quickly and demonstrates the distinctive mechanic without reading a long briefing. |
| U03 | P1 | Shorten failure-to-control with one-action retry and optional focused practice; explain one concrete capture cause. | The player can immediately attempt the intended correction and does not repeat onboarding or navigate several menus. |
| U04 | P1 | Test keyboard, controller and touch as distinct interfaces: focus, simultaneous actions, aim cancel/release, remapping, dead zones and reach. | Synthetic transitions pass, then actual-device sessions confirm slow corrections, fast turns and comfortable combinations. |
| U05 | P1 | Make accessibility complete: independent comfort options, captions, adjustable text, color-independent cues, hold/toggle, sound buses and usable menus. | Settings work in gameplay, preserve tactical rules and never hide necessary information. Device comfort still requires observation. |
| P01 | P1 | Build a tension timeline with observation, commitment, danger, escape and recovery; measure travel/wait segments. | Quiet stretches create anticipation; repeated announcements, empty travel and passive holds are trimmed when they add no decision. |
| P02 | P1 | Make the finale a visible escalation and commitment with a known route, cover opportunity and payoff. | Players understand the exit requirement and why filing succeeds/fails; victory has a satisfying world response. |
| P03 | P2 | Add replay variety through readable patrol/lighting/route differences and limited meaningful resource choices after the core slice passes. | Players retry to test a strategy; random punishment and raw enemy-speed increases are not the main source of variety. |
| P04 | P1 | Turn verification into representative scenes plus real-time recordings and later observer studies. Record confusion, correction, capture explanations and spontaneous retry separately. | Tests catch regressions; human evidence determines whether visual/movement/fun complaints are actually resolved. No automatic grade inflation. |
| P05 | P0 | Replace “implemented/retained” closure with separate functional, visual, performance and player-evaluation statuses. Keep the old build available for comparison. | A backlog item stays open when its intended experience is still rejected. No broad “all resolved” claim based on existing mechanics or test counts. |

## Delivery sequence and stop conditions

1. **Space/movement comparison:** S01–S05, M01–M04. Small prototype only. Same doorway, cart orbit, gap and chase route in both candidates. Deliver real-time recordings and measured response/frame pacing, not a screenshot-only comparison.
2. **Art and navigation slice:** S03/S04, N01–N05, A02/A03, U01. One complete small area. It must remain understandable without a permanent route overlay.
3. **Core encounter:** G01/G02/G05, F01/F03/F04, U02/U03. It must show plan → action → enemy response → recovery. Keep the initial tools limited.
4. **Course and feedback pass:** other P1 items. Rebuild three differentiated encounters and the finale around the approved movement/space quality.
5. **Qualification and replay:** P03/P04/P05 and actual-device/audio sessions. Preserve the user's deferred-testing instruction until they are ready; do not invent player results or make expanded content depend on unobserved enjoyment claims.

Engineering can proceed while human sessions are deferred. However, stop course-wide art/content migration if the prototype fails technical spatial/performance criteria. Keep presentation alternatives reversible until the user can compare the new movement and visual direction. Do not make another whole-course feature pass the default next step.

## First deliverable

A small playable, properly scaled space with real depth: one readable path, one hedge corner, one cart, one doorway, one Joe patrol, one ball lure and one bell objective. Include a quick restart and a clear exit. Walking and looking must carry the experience before more systems are added.

No additional currencies, daily rewards, collectibles, scare layers, dashboards or cosmetic options belong in this first deliverable. The immediate opportunity is stronger control, readable space and a satisfying interaction with Joe.
