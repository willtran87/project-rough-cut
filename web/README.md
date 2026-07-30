# Rough Cut browser prototype

This is the immediately playable browser build for the opening cutscene, main menu, settings, and complete Hole 1 vertical slice.

Hole 1 is now a 360-unit authored course divided into four suspense zones: The Tee, Audit Row, Water Hazard, and The Dead Green. Its layered first-person renderer composites a true alpha-cut golf-course foreground over a moonless star field. The moon is an independent celestial layer; six isolated generated cloud sprites drive eight independently wrapping, bobbing, and parallaxing cloud instances; and a far wooded ridge, distant villas, clubhouse, tree line, two horizon-fog depths, and five low ground-fog depths occupy separate scales. Perspective mowing lines and ground flow, depth-sorted world obstacles, Joe and the mower, fog/motes, zone-specific grading, and an opening near-camera grass fringe complete the sense of travel; the fringe moves down and clears as the player leaves the tee.

The procedural fairway-edge stakes have been replaced by four image-generated path-lantern variants projected through the shared course camera. Weathered brass, copper, and iron fixtures cast restrained amber pools onto the turf, attract tiny reduced-motion-aware insects, and flicker with the Water Hazard power sag. The key, sprinkler valve, optional Change Request, and recoverable golf ball now use a second generated world-prop atlas instead of floating icons or canvas stand-ins. A third six-cell atlas distributes mossy yardage stones, abandoned bags, hose, spilled range balls, mower tools, and clipping piles along the margins; those low-profile details can be stepped over and never imply a hidden collision volume.

Generated hedge tunnels, overturned carts, water boundaries, bunker walls, audit boards, floodlights, trees, rope boundaries, and maintenance debris are physical landmarks rather than decoration. Stepped player collision prevents sprint tunneling. Every solid prop uses an authored ellipse matched to its visible ground contact: broad objects block laterally without creating invisible depth, trees collide at the trunk instead of the canopy, and narrow posts no longer behave like boulders. The first-person contact rings, persistent map, player collision, Joe routing, and proximity callouts all consume that same geometry. Alpha-cropped dedicated sprites land their visible base directly on the footprint, tunnel and shed openings preserve readable passages, and hard cover only conceals the player when it actually breaks Joe's line of sight. Deep rough softens the player's outline but still rustles when crossed carelessly and bends into a temporary trail; sprinting leaves stronger evidence than crouching. Joe's mower paints persistent cut strips through the world. Following one is quieter than crossing rough, but the short grass removes concealment. Golf impacts leave persistent divots. The amber floodlight raises visibility.

The current vertical slice includes two complete escape routes: recover the bunker-side key and reach the maintenance shed, or activate the sprinkler pressure system and escape through the drainage culvert. Activating the system now soaks four projected course zones for 24 seconds. Wet turf muffles careful movement and slows Joe's mower to 68% speed, but it also creates brighter, stronger footprints that remain discoverable longer. Joe follows an authored course patrol, investigates sounds, pursues visible or audible movement, remembers the last detected position, routes around course obstacles, and searches after contact is broken. Four golf-ball distractions support the longer traversal and become progressively less effective. Every landed ball persists in the world and can be reclaimed with Enter or A, turning Joe's active investigation point into a renewable but dangerous resource.

Three permanent bunkers add a second terrain gamble. Sand reduces the player's movement speed to 72%, makes every crossing conspicuously loud, and leaves stronger tracks that linger. Joe's mower also churns down to 76% speed in a bunker, so a well-timed lure can convert the hazard into breathing room and earn a capped Bunker Bait score bonus. A dedicated generated three-cell bunker atlas is projected onto the authoritative terrain zones, while persistent rake lines, granular footsteps, mower-churn effects, course-map regions, and Listening Focus callouts keep the tradeoff readable without flattening the course. Generated wooden and brass course signs are likewise grounded at zone transitions with runtime labels.

Clearing all three rotating Night Orders unlocks the optional Overtime Audit. It starts the player with two golf balls, makes Joe 16% faster and 22% quicker to confirm sight or sound, strengthens and extends player evidence, shortens golf-ball distraction windows, and awards a 1.30× score premium. Overtime escapes and captures are tracked separately, and the best Overtime result never replaces a normal route record.

Successful personal records now preserve a bounded Course Echo of the run. When the matching Night Order and contract type returns, the best compatible route replays as spectral footsteps and a moving world marker, while the course map shows its traveled line and live position. Pace is compared by distance traveled instead of raw forward progress, so detours, backtracking, and optional-objective routes still produce an honest ahead/behind read. Legacy saves remain valid and begin recording an Echo the next time a new record is filed.

Every Night Order also places one Unfiled Change Request in a deliberately exposed side lane. Securing it makes a small noise and marks the document as banked for the current attempt, but its +650 score bonus and persistent filing credit are awarded only after a successful escape. The briefing, compact HUD, world view, Listening Focus, and course map all communicate the optional risk without turning it into a required checklist.

Filing all three Change Requests now authorizes the Night Order Portfolio Override. The clubhouse opens a three-dossier master ledger showing order-clearance, filing, best-score, route, time, and Course Echo status. Keyboard, gamepad, or touch players can then select any authored Night Order for the next attempt; that choice persists across reloads and remains independent from Overtime. The reward changes replay control rather than player power, making targeted route-record and Echo rematches possible without weakening Joe.

Each dossier also carries four persistent Performance Stamps earned only on successful escapes: Clean File for avoiding pursuit, Field Recovery for reclaiming a thrown ball, Bunker Clause for baiting Joe into two sand traps, and Echo Breaker for beating a compatible personal-best replay. The seals can be earned across separate normal or Overtime runs, do not affect score or player power, and never award on capture. Four seals perfect one dossier; all twelve authorize the gold Master Product Owner ledger and Master Echo trail.

Holding the Listening Focus binding (Q by default) slows movement, drops the ambience, makes the mower direction readable, and surfaces nearby cover, landmarks, and light exposure. Joe's mower now drives a capped world-space debris simulation instead of relying on a flat screen spray. Chopped grass has height, velocity, gravity, drag, spin, landing, two-tone blade shading, camera parallax, and persistent ground contact over its short lifetime. Emission rate scales with Joe's patrol, search, and pursuit state; soaked turf produces heavy wet clumps, bunker crossings throw granular shards, close obstacle routing can strike sparks, and a restrained dust layer trails the deck. Mower motion also shears the ground fog and stretches Joe's moon-cast shadow, the floodlight attracts independently orbiting moths that scatter during a power sag, and close pursuit brings a controlled layer of grass fragments and haze toward the camera. Reduced Motion lowers emission density to 58%, steadies the atmospheric orbits, and limits burst sizes while preserving every threat cue.

The presentation also includes state-specific animated Joe-and-mower performances, a reactive night soundscape, terrain-sensitive footsteps, spatial mower panning, steering-load audio, danger heartbeat, action-specific cues, corporate Joe-state callouts, chase grading, directional threat feedback, and route-aware animated victory/capture transitions. Joe is explicitly a software Product Owner at an insurance company, not an adjuster: his dialogue turns backlog ownership, refinement, sprint goals, acceptance criteria, dependencies, stakeholders, releases, and scope pressure into horror. His dedicated library now contains 1,490 capture outcomes, 176 state barks, and 140 situation-specific reactions for trails, wet turf, bunkers, distractions, close pursuit, lost contact, overtime, keys, sprinklers, and final filing. That is 1,806 total variants, with rolling 18-capture and 12-bark repeat windows. The Sprint Terminated screen pairs capture dialogue with six expression portraits and no synthetic voice playback. Joe is hidden from the course map until he is close or actively pursuing; a decaying last-signal marker replaces permanent omniscient tracking.

The course now carries a restrained procedural horror score with one authored harmonic identity per zone. Detection opens the filter and introduces dissonant layers, search adds a blade-like pulse, and pursuit reaches a sparse 109-BPM maximum ostinato. The Water Hazard power sag acoustically hollows the score before it recovers, while Listening Focus ducks the entire music layer to 38% so spatial mower information remains dominant. Continuous voices and short motif notes are routed only through Course Ambience; setting that channel to zero stops new motif allocation while all visual attention, contact-break, and threat-caption information remains available.

The two-column audio/accessibility panel provides persistent, independent control over the master mix, course ambience, Joe's spatial mower, gameplay effects, and the danger pulse used by heartbeat, threat stingers, and the chase drone. It also provides scalable dialogue subtitles, adjustable caption-backdrop opacity, directional threat captions, and reduced camera motion. Threat captions identify important mower, impact, terrain, and course sounds with bounded left/right/ahead/behind direction, so lowering or muting a sound category does not hide useful chase information.

The same panel opens a dedicated keyboard-binding ledger for movement, sprint, crouch, Listening Focus, interaction, chip shots, and the control recall. Selecting an action and pressing a key updates every briefing, HUD, aiming, and contextual prompt immediately. Assigning an occupied key swaps the conflicting action onto the displaced key instead of creating an ambiguous duplicate; Escape, fullscreen, browser keys, and the fixed arrow-key movement fallback remain reserved. Bindings persist with the existing preferences, reject corrupt or duplicate saved maps, and can be restored to defaults in one action.

Joe's attention is now telegraphed before pursuit locks: sight and sound build the attention meter, stopping or crouching can clear a warning, and an active chase shows whether visual contact, audible movement, or neither is keeping the pursuit alive. When both are broken, a contact-break meter communicates exactly how long the player must remain undetected. The Water Hazard's first-entry power sag temporarily reduces actual floodlight exposure, and zone events only deliver their full stinger once instead of replaying during tactical backtracking.

Pursuit escapes now bank a visible Risk Premium. The live contact-break panel previews the award and raises it smoothly as Joe's closest mower distance falls: a routine break is worth at least 150, a Razor Cut can reach 400, and only the first three breaks score. This preserves the previous 1,200-point recovery ceiling while making the risk/reward legible during play. A reduced-motion-aware bank animation, attention-panel ledger, distinct audio flourish, scorecard breakdown, close-cut count, and Razor Cut recognition carry the result through the full feedback loop.

Smart actions now feed a 14-second Delivery Chain. Reaching a new course zone, recovering a committed ball, securing the optional Change Request, baiting Joe into bunker sand, or breaking pursuit adds a scored delivery beat; linking beats raises the multiplier from ×1.0 to a capped ×2.2. Every event family has a run cap aligned to its authored opportunities, preventing repetitive ball or bunker farming. The chain is an optional mastery and replay system only: it never slows Joe, improves stealth, or changes the escape requirements. Grade thresholds were rebalanced so a clean opening projection begins around B rather than granting an automatic S; A and S now require meaningful route execution, optional risk, or Overtime survival. The HUD timer, event popup, exact File Projection, text-state contract, and scorecard peak make the system readable from action through result.

The attention panel now carries a restrained File Projection using the exact S–D calculation that will be filed on escape. Only the letter class is shown during play; exact points remain in the after-action review so the horror sequence does not become a constant score chase. When the class changes, a short reduced-motion-aware line identifies the dominant cause—time, attention, a committed or recovered ball, an optional Change Request, banked Risk Premium, or Bunker Bait. The projection never alters scoring and synchronizes to the authoritative final result before victory is recorded.

The capture sequence uses the generated `rough-cut-joe-capture-v1.png` tableau and a separate generated six-expression Joe atlas. All defeat copy stays in the renderer so line rotation, timing, accessibility, and visual grading remain editable.

## Start locally

From this directory:

```powershell
python -m http.server 4187
```

Then open `http://127.0.0.1:4187/`.

## Controls

Default keyboard controls:

- Click, Enter, or Space — begin the incident.
- Click, Enter, Space, or Escape — skip the opening.
- Arrow keys and Enter — navigate the main menu.
- After filing all three Change Requests, Left/Right — select a Night Order dossier.
- R — toggle Overtime Audit after clearing all three Night Orders.
- Pointer — select menu and settings controls.
- Press B from How to Survive / Settings to open persistent keyboard remapping; Enter rebinds, conflicts swap, R restores defaults, and Escape returns.
- WASD or arrow keys — move through Hole 1.
- Shift — sprint, with more noise.
- Hold C — crouch; hard cover conceals when it breaks Joe's sightline, while rough provides partial concealment.
- Hold Q — Listening Focus; slow down and read mower direction, nearby cover, landmarks, and exposure.
- Bunker sand — slows both you and Joe's mower, but your louder footprints linger; bait Joe into sand for a capped score bonus.
- Enter — interact with the key, sprinkler, shed, drainage culvert, secure an Unfiled Change Request, or reclaim a landed golf ball; sprinkler water creates temporary quiet routes but lasting tracks.
- Hold Space, steer with A/D, then release — aim and chip a golf-ball distraction.
- F — toggle fullscreen.
- Escape — cancel an aimed shot, return from settings, or pause Hole 1.

Standard gamepads are also supported:

- Left stick or D-pad — move and navigate menus.
- After filing all three Change Requests, D-pad Left/Right — select a Night Order dossier.
- RT — sprint.
- LB — crouch and use hard cover or rough.
- LT — Listening Focus.
- A — confirm and interact.
- RB — toggle Overtime Audit from the menu after mastery.
- Hold X, steer with the left stick, then release — aim and chip a golf-ball distraction.
- B — return from menus or result screens.
- Start — pause Hole 1.

Touch devices receive a dedicated in-game control layer:

- Drag the left pad to move; hold Run with a second touch to sprint.
- Hold Crouch or Listen while moving to use stealth and Listening Focus.
- Tap Use to interact, unlock exits, secure a change request, or reclaim a landed ball.
- Hold Chip, slide left or right to aim, and release to shoot.
- Tap Pause to suspend the round; menus, unlocked Night Order dossiers, and settings use direct touch targets.
- Landscape orientation is recommended. Portrait touch devices receive an explicit rotation prompt.

The interface switches between keyboard, controller, and touch prompts based on the most recent active input. Every audio, presentation, and keyboard-binding setting is navigable with pointer, keyboard, controller, or touch and persists across sessions. Older saved preferences automatically receive readable caption and binding defaults.

Browser audio requires the initial click or key press. Joe's line is presented as an on-screen subtitle; no synthetic dialogue voice is used.
