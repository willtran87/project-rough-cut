# Rough Cut: fundamentals and experience rebuild

The user has since rejected the foundation pass’s visual/movement/navigation quality. Those experience outcomes are reopened. See the [revised quality plan](revised-quality-plan-2026-11-05.md) for the current priorities.

Date: November 5, 2026. Status: implementation pass delivered; human/device acceptance remains deferred. See [the per-item implementation record](../qa/fundamentals-rebuild-2026-11-05.md) and [the shared world/presentation contract](world-and-presentation-contract.md).

The user's latest assessment is that visuals, navigation, movement, and gameplay still feel bad. That is evidence that the previous feature work did not resolve the experience. Passing functional checks and completing a route do not establish enjoyable movement, convincing space, readable navigation, or good pacing. The earlier B/A-range grades were too confident about those qualities.

The intended experience: **read a dangerous space, form a plan, execute it with precise controls, see Joe react, and escape with a satisfying story to tell.** Walking, looking, and moving around one hedge must feel good before another mechanic earns its place.

## What is supported by the current evidence

| Finding | Evidence | Interpretation |
| --- | --- | --- |
| Near cover can look like a flat wall of stretched texture. | Latest high-resolution release-station capture; `drawOrientedHedgeArch`, `courseObstacleVisualMetrics` in `web/game.js`. | A fundamental geometry/presentation concern. More markers or texture detail will not supply convincing thickness. |
| Traversable ground, foliage, and props compete in a narrow dark value range. | Opening and release captures. | Route readability needs material, composition, and silhouette changes. Darkness alone is not an effective hierarchy. |
| The world is frequently explained with panels, labels, rings, dashed routes, and arrows at the same time. | Opening/release captures and HUD rendering. | The player has to divide attention among several guidance systems. Some overlays are compensating for unclear spaces. |
| Background and foreground can move at different refresh rates. | `drawCourseBackdrop` caches at 30 Hz, or 20 Hz in low tier; other scene drawing follows presentation frames. | A plausible source of visual judder or perceived sliding. Its contribution must be measured during ordinary real-time turns. |
| Movement uses several speed modifiers and direct per-frame displacement. | Base speeds 24 walk / 38 sprint / 15 crouch / 11 focus, plus sand/footing, roadmap, and second-wind modifiers. | Correct displacement does not establish a coherent sense of weight or predictable terrain transitions. Tune response and communicate changes. |
| Collision resolves blocked movement along world X and then Y. | `movePlayerBy`. | Test corner sticking and angle-dependent sliding. The source is a reason to investigate, not proof that every corner is broken. |
| Several input and coordinate conventions coexist. | Course X physical factor 0.72, projection world-unit factor 0.12, screen-space camera offset, and 22% default stick dead zone. | Calibrate them in a simple test scene; do not arbitrarily remove constants or lower dead zones without measuring effects. |
| Mandatory encounters still share much of the activation-and-retreat rhythm. | Station rules and current completion routes. | Existing quiet filing, light control, and retreat choices are useful starting points; encounter structure needs stronger differentiation. |

This assessment uses the source, existing captured gameplay, and the user's direct feedback. It does not pretend to be a new human playtest or audio audition. Controlled screenshots establish visible layout issues, not typical enemy proximity or full-run pacing.

## Priority and scope

- **P0 — foundation:** correct space, camera, movement, collision, rendering, and basic route legibility. These block further polish.
- **P1 — experience:** make decisions and consequences clear; improve the core encounter, tension, and rewards.
- **P2 — expansion and finish:** add breadth only after the rebuilt slice is enjoyable and readable.

The 48 items below are an ordered backlog. They are not 48 features to add simultaneously. Acceptance criteria are proposed targets, not reported results. Human study tasks remain prepared for later, per the user's instruction.

## Movement and camera — first dependency

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| M01 / P0 | Build a small calibration course: open lane, 90-degree corner, angled wall, narrow gap, ramp-like terrain transition if supported, and one interactable. Use neutral materials and no threat overlays. | Walking, strafing, turning, reversing, and circling an object can be assessed independently of art, threats, and pathfinding. Record the current baseline before tuning. |
| M02 / P0 | Establish one world scale and camera contract. Document how authored units, physical distance, projection, collision, footstep spacing, and speed relate. Tune horizon, perspective, and near-plane behavior together. | An object stays planted while the player circles it. Approaching it produces smooth scale change; stopping does not leave residual scenery drift. Calibrated equal distances have consistent travel times. |
| M03 / P0 | Separate authoritative player movement from camera decoration. Disable default roll, lateral camera lag, and pronounced bob while tuning; restore only subtle distance-driven motion that improves the feel. | Aim and movement direction remain reliable at stops, turns, and collisions. Optional bob/roll can be individually disabled without changing movement or sight rules. |
| M04 / P0 | Tune input independently for mouse, controller, and touch: predictable mouse sensitivity, deliberate stick response/dead zones, separate look sensitivity where appropriate, and stable touch look while another finger moves. | Slow corrections, fast 180-degree turns, diagonal movement, and aim release work without dead stretches or unexpected jumps. Test actual devices later; synthetic input only verifies behavior. |
| M05 / P0 | Replace or revise axis-ordered collision resolution with smooth contact sliding and robust corner handling. Make visible boundaries match collision. Add a small, intentional clearance margin where needed. | Repeatable approach tests at several angles do not snag, oscillate, or push through walls. Clearly visible gaps either fit the player or visibly do not. No dependence on a corrective navigation overlay for routine movement. |
| M06 / P0 | Tune start/stop, sprint, crouch, focus, and terrain transitions as one movement system. Compare instant response with a very short acceleration ramp; keep release braking crisp. Remove unnecessary overlapping slowdowns. | A player can predict their speed from posture and ground material. Mud does not feel like an unexplained input failure. Footsteps and body motion stop when displacement stops, including against walls. |

## Spatial rendering and art direction — depends on the calibration course

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| V01 / P0 | Prototype the same small encounter with coherent perspective and solid cover. Compare improving the current renderer against a simple depth-correct 3D environment retaining stylized sprites/art. Choose from the prototype, not a blanket engine rewrite. | Circling cover, walking through an opening, and looking back produce convincing depth and stable occlusion. Select the approach before remaking the entire course. |
| V02 / P0 | Give hedges, walls, carts, and doorways believable thickness and readable openings. Stop enlarging a flat texture to stand in for an entire nearby obstacle. | Front, side, rear, and close views all communicate the same physical footprint. No huge stretched hedge face obscures an opening that collision considers passable. |
| V03 / P0 | Rework ground presentation so paths, grass, rough, mud, sand, and wet ground are separate material families with consistent scale. Keep ground motion anchored to the world. | Players can distinguish firm ground from slow/noisy terrain before stepping onto it; turning does not make the ground appear to swim beneath props. |
| V04 / P0 | Establish a value and color hierarchy: readable paths, quiet background detail, visible Joe silhouette, and selectively emphasized interactables. Reduce competing high-frequency texture and atmospheric overlays near decisions. | In a desaturated screenshot, the path and relevant object remain legible. Fog, rain, moonlight, and shadows do not obscure a required gap or immediate threat. |
| V05 / P1 | Create a cohesive art specification: pixel/detail density, palette, light direction, object scale, edge treatment, and shadow softness. Review existing assets in the scene rather than in isolation. | Joe, carts, lamps, signage, hedges, and ground look like one game at close, medium, and far distances. Flat pennants alone do not count as a landmark redesign. |
| V06 / P1 | Compose each zone around a major silhouette and a distinct spatial arrangement: pond/pump tower, clubhouse porch, maintenance enclosure, dark range, lit exit threshold. Use smaller props as supporting detail. | Players can name and recognize at least two previously visited areas from the scenery during later tests, with UI labels hidden. Adjacent zones do not look like recolored copies. |

## Navigation and interaction — depends on trustworthy space

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| N01 / P0 | Rebuild the main route as an understandable connected space. Make the next area visible or inferable through paths, openings, signs, and lights. Remove confusing dead ends unless they contain an intentional payoff. | A newcomer can identify a plausible next direction at each major junction. They can explain why a detour or shortcut exists. |
| N02 / P0 | Make primary paths and usable gaps wider and visually unambiguous. Review prop placement from the moving player's camera, not only from map coordinates. | Routine passage does not require hugging collision boundaries, repeated corrective strafes, or reading a “clear left” message. |
| N03 / P0 | Use one primary navigation aid: a restrained current-objective bearing. Make detailed routes an on-demand recovery aid. Keep immediate collision danger and optional locations from replacing the objective unexpectedly. | Players can distinguish “next required destination,” “optional nearby object,” and “temporary danger.” No contradictory arrows or abrupt destination switching. |
| N04 / P1 | Redesign the map with recognizable landmarks, player heading, confirmed passages, and explicit route selection. Clearly distinguish unknown, blocked, optional, and completed areas. | After a brief map glance, a player can choose the next turn and reconcile the map with the visible scene. A displayed path never implies passage through solid cover. |
| N05 / P0 | Stabilize interaction targeting. Prefer the object the player deliberately approaches/looks toward, use gentle target persistence, and show one prompt with the exact action. | Two nearby objects do not cause prompt flicker or unintended activation. Mouse, controller, and touch commit the same displayed target. |
| N06 / P1 | Make tactical choices explicit at the object. Prototype direct, consistently mapped quiet/loud and cart/hedge choices rather than relying solely on posture plus Use. Keep fast expert input after players learn the choice. | Players can discover both options and predict their consequence without guessing a crouch modifier. The choice interface does not interrupt escape movement or require a long modal menu. |

## Gameplay feedback and enemy readability — depends on movement and interaction

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| F01 / P0 | Define feedback for every core action as a complete sequence: input accepted, action underway, world consequence, finished/cancelled. Prioritize interactions, chips, getting spotted, hiding, and escape filing. | No successful input feels ignored; no cancellation looks like success. A player can tell whether a chip was launched, an object activated, or a hold interrupted without reading a paragraph. |
| F02 / P1 | Give each station a distinctive physical response: bell swing, paper/stamp motion, release mechanism opening or repositioning. Synchronize sound with the visible event. | The response is visible at the player's normal interaction position, begins promptly, and communicates what changed even with the main HUD hidden. |
| F03 / P1 | Extend Joe's behavior animation: orient toward a sound, interrupt mowing, approach, inspect, become suspicious, search, acquire the player, and accelerate into pursuit. Keep perception authoritative. | A visible change in behavior explains a threat-state change. Text captions reinforce it. Close sight overrides distractions, and hidden Joe is not revealed through cover. |
| F04 / P1 | Make detection causes understandable at the moment they happen: Joe's facing, line of sight, loud surfaces, footprints, and last known position. Preview rules through safe examples. | After a capture, players can identify what gave them away and one response they could try. Avoid omniscient-looking turns or changes of target with no perceptible cause. |
| F05 / P1 | Make a successful evasion feel like a release: Joe overshoots or checks the wrong place, mower audio recedes, pressure sound relaxes, and the player's next opportunity becomes clear. | Successful stealth has an observable payoff. A new genuine threat can interrupt relief; do not grant unexplained invulnerability. |
| F06 / P1 | Give warnings a strict priority and lifetime. A close threat can interrupt a discovery; an expired lure cannot continue advising the player to cross. Use one concise primary feedback channel at a time. | No competing messages direct incompatible actions. Low-priority information stays in the journal/map and does not occupy the immediate threat area. |

## Core encounters and meaningful choices — depends on P0 foundations

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| G01 / P0 | Build one excellent 60–90 second playable encounter containing approach, observation, a deliberate lure, a required interaction, cover, and escape. Reuse existing mechanics first. | Walking and looking feel good in isolation; the complete encounter produces a clear plan → action → reaction → recovery sequence. Do not expand the course before this is satisfying. |
| G02 / P1 | Give the three required encounters different structures: the bell tests timing/retreat, the log tests patience/stealth or a deliberate noisy shortcut, and the release changes the escape situation. | Players describe the encounters using different decisions, not merely “press Use and run” three times. The existing alternatives must be discoverable and situationally useful. |
| G03 / P1 | Create visible route tradeoffs: a short exposed crossing, a longer concealed route, and a noisy tool-assisted shortcut where appropriate. Make routes reconnect so mistakes do not always require backtracking. | At least two approaches are viable without developer map knowledge. The better choice varies with Joe, inventory, and the player's goal. |
| G04 / P1 | Refine the golf-ball interaction: readable wind-up, reliable aim, understandable landing/sound location, surface response, and clear ball recovery. Keep aiming from hijacking movement unexpectedly. | Players can deliberately lure Joe to a chosen useful area and recognize a miss. Actual ball location, sound source, and Joe's response agree. |
| G05 / P1 | Prototype only one or two additional environmental tools if the rebuilt encounter needs them: a remotely started mower, a gate that changes pursuit routing, or a breaker controlling a specific crossing. | Each selected tool changes space or enemy behavior in a way players can predict. Reject tools that only add another cooldown, collectible, or popup. |
| G06 / P1 | Make optional rewards alter the next decision. Evaluate ball reserves, blackout timing, and filing reductions; adjust or remove rewards that players understand but still ignore. | Players can name a situation in which each reward is worth its risk. No always-best option; no opaque bonus required for basic survival. |

## Pacing, failure, and the finale — depends on a proven encounter

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| P01 / P1 | Rebuild the opening as a short playable introduction: learn looking and walking, safely observe Joe, cause a small reaction, then face a real decision. Introduce later systems when they become relevant. | Players move quickly and understand the immediate goal without reading a large briefing. The first minute demonstrates the game's distinctive hook. |
| P02 / P1 | Author a tension curve with observation, threat, escape, and recovery. Reduce repetitive ambient interruptions and interruptions during learning. | Players can name rising tension and relief moments. A successful stealth run is still tense without requiring a forced chase. |
| P03 / P1 | Review travel and waiting segment by segment. Cut empty walking and passive holding; use a few deliberate quiet stretches with anticipation or discovery. | Long waits have a visible reason and an available decision. Players are not waiting merely for a meter or repeated announcement to finish. |
| P04 / P1 | Build the finale around a readable escalation and a meaningful commitment. Show the chosen exit, next cover, filing cost, and escape consequence in the world. | A first attempt can be understood even if it fails. Success feels like an escape sequence rather than an unexplained interaction-radius check. |
| P05 / P1 | Make retry fast and informative: brief cause, useful counterplay, one-action restart, and optional encounter practice. Preserve acquired knowledge; avoid replaying a long introduction. | Failure-to-control is short and consistent. Players can try their intended correction on the next attempt without menu friction. |
| P06 / P2 | Adjust difficulty through distinct pressures and decision windows, not only faster Joe. Make later variants rearrange encounters and tradeoffs after the base route works. | Players understand what a difficulty/variant changes. No unavoidable capture, hidden mandatory reward, or endurance grind is introduced. |

## Sound, interface, and comfort — runs alongside encounter refinement

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| U01 / P0 | Redesign the default HUD around a small objective, restrained inventory/progress, and contextual action. Move persistent technical/status language out of the main view; retain an expanded guidance option. | The player sees the course and Joe first. Routine traversal does not show multiple large advice panels. Required information remains legible at the smallest supported viewport. |
| U02 / P1 | Establish sound priority: actionable threats and interactions stay intelligible over ambience. Duck competing layers gently; control repeated announcements and abrupt loud peaks. | Human speaker/headphone sessions distinguish critical cues at comfortable volume. Measure levels and clipping separately from perceived quality. |
| U03 / P1 | Make mower distance/direction and cover filtering dependable. Give walking, sprinting, mud, sand, a ball landing, and a completed interaction distinct concise audio signatures. | Eyes-closed direction tests work on intended stereo devices; mono/caption alternatives retain the information. Actual chase audio is auditioned, not just reference tones. |
| U04 / P1 | Match camera motion, footsteps, breathing, hand/club motion, and speed to actual displacement. Add restrained first-person presence only where it supports aim and movement. | No footstep/bob continues against a wall. Hands and effects do not obscure a target or amplify motion discomfort. |
| U05 / P1 | Audit HUD typography, wrapping, contrast, safe areas, scaling, and touch reach. Use short natural language; preserve the corporate voice in discoveries and Joe's dialogue. | No clipped prompts, tiny essential text, or finger-obscured actions at 2560×1600, 1280×720, 800×600, and 844×390. Validate reach on real devices later. |
| U06 / P1 | Provide effective defaults plus independent comfort controls: bob, roll, shake, flashes, sensitivity, hold/toggle actions, volume buses, captions, and rebinds. | The default is comfortable for the intended audience; presets are helpful alternatives. Comfort settings preserve the same tactical rules and never hide necessary warning information. |

## Replay value and production quality — expand after the foundation passes

| ID / priority | Concrete work | Acceptance criterion |
| --- | --- | --- |
| R01 / P0 | Measure real-time input-to-frame response and frame pacing, including cold turns, entering new areas, chase, pause/resume, and retries. Fix asynchronous scenery judder and first-use stalls. | Proposed desktop target: sustained 60 Hz on named target hardware, p95 frame time at or below 16.7 ms with no recurring >50 ms stalls after loading. Measure actual browser presentation; deterministic stepping is not performance evidence. |
| R02 / P0 | Separate movement, camera/projection, perception, interactions, rendering, HUD, audio, and telemetry into manageable components with shared contracts. Migrate incrementally around the rebuilt slice. | The same world and interaction state drives collision, visuals, labels, and tests. A camera or speed adjustment can be made without editing unrelated UI logic. Refactoring alone is not considered a player-facing improvement. |
| R03 / P1 | Add a small library of representative acceptance scenes and real-time capture routes: near-wall orbit, narrow opening, turning under load, cluttered interaction, successful lure, lost sight, and both exits. | Regressions are caught by images, input/collision traces, and outcome tests. Existing readiness checks remain useful but cannot certify fun. |
| R04 / P2 | Make discoveries rewarding through story, memorable environmental details, shortcuts, and optional objectives with clear stakes. Trim repetitive collectibles and redundant popup rewards. | Players remember a discovery or a story, not just a completion count. Required progression stays understandable without collecting everything. |
| R05 / P2 | Make repeat runs support mastery and experimentation: alternate routes, encounter variants, different tool opportunities, and useful post-run comparisons. Keep successful knowledge transferable. | Players voluntarily retry to test an idea or improve a run. Variant changes are readable and avoid purely random surprise punishment. |
| R06 / P1 | Run the already prepared novice/returning-player and physical-device study when the user is ready. Reassess grades from observed play and user feedback. | Repeated confusion, discomfort, unfair captures, and ignored choices have documented fixes and retests. Report spontaneous retry interest separately from asked-for test runs. |

## Implementation sequence

1. **Baseline and calibration:** M01–M06, V01, R01. Produce a movement/geometry prototype and real-time capture before expanding scope.
2. **One readable space:** V02–V04, N01–N03, N05, U01. Walking through this space should require minimal instructional UI.
3. **One strong encounter:** G01, F01–F06, G04, P01, P05. Make Joe's reaction and a successful escape the payoff.
4. **Rebuild the course around that quality:** remaining V/N items, G02–G06, P02–P04, U02–U06. Preserve good existing mechanics and discard weak additions.
5. **Qualify and broaden:** R03/R06, then P06/R04/R05. Broader replay content follows evidence that the base experience works.

R02 is incremental supporting work throughout; do not turn it into a separate full-game rewrite before the prototype has demonstrated a better result.

## Initial implementation batch

Start with these twelve deliverables: calibration scene; world/camera contract; undecorated camera baseline; device-specific input tuning; smooth collision; coherent speed/terrain transitions; solid nearby cover; world-anchored readable ground; a clear main path; stable interaction targeting; minimal default HUD; real-time frame-pacing capture.

Then build the single strong encounter. Defer extra collectibles, additional courses, more overlay effects, new progression currencies, and expanded menus until that slice is clearly better. These additions currently have less value than making the existing space pleasant to move through.

## Definition of a successful rebuild

- The user confirms that walking and looking feel materially better in the calibration scene and live encounter.
- New players can find the first objective, identify usable cover, and explain the result of their interaction with limited prompting. A starting target is 4 of 5 players reaching the first objective without a walkthrough; this is a small-study iteration signal, not population-level proof.
- Close-up cover, ground motion, lighting, and occlusion remain coherent while moving, not just in still screenshots.
- Players can describe why Joe noticed them, why a lure worked, and what they would change after failure.
- Both exits and meaningful alternate approaches remain possible through ordinary gameplay at the tested settings.
- The default HUD lets the environment carry most routine navigation. Assistance remains available and accessible.
- Real-time frame pacing and actual device/audio comfort are measured on named hardware.
- Retry interest and enjoyment are reported from actual people, and the user's original complaints are explicitly revisited.

The implementation and human-evaluation gates are separate. Engineering can proceed while sessions remain deferred; subjective feel and enjoyment must stay labelled unverified until those sessions or the user's own reassessment occur.
