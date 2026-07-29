# Rough Cut: Golf-Course Horror and Joe Pursuit Game Quality Checklist

> **Document status — July 29, 2026:** This is the living production checklist for **Rough Cut**. The project has moved beyond concepting into a browser-playable vertical slice. The status section below records what exists now; the comprehensive checklist that follows remains the target for the full game.
>
> **Current milestone:** A polished first-pass of Hole 1, “The Pilot,” with the “Here’s Joey!” opening, two complete escape routes, three curated Night Orders, an aimed golf-chip system, recoverable stealth pursuit, Joe’s patrol/investigate/search/chase AI, generated pixel-art assets, route-aware win states, a generated capture state, adaptive HUD, true pause flow, persistent settings, course grading, personal records, and automated browser verification.

## Status Legend and Use

- `[x]` means the feature is implemented and browser-verified in the current vertical slice.
- `[ ]` means the item is planned, incomplete, or still needs production-level validation.
- “Prototype constraint” identifies a deliberate simplification that should not silently become the final design.
- The detailed quality checklist below is primarily a **full-game acceptance checklist**. An unchecked item does not necessarily mean the vertical slice is broken.
- Every new mechanic should be evaluated against the design hierarchy: **horror and readable pursuit first; grass and golf second; insurance-product satire third**.

## Confirmed Creative Direction

- [x] Use **high-resolution, high-detail cinematic pixel art** as the defining visual language.
- [x] Frame the experience as first-person or first-person-adjacent golf-course horror, with strong depth layers, dramatic lighting, and readable 2D gameplay space.
- [x] Make Joe an insurance-company **product owner** whose obsession with immaculate grass and golf has become predatory.
- [x] Keep the horror credible. Comedy should come from Joe applying calm corporate and insurance logic to absurdly threatening situations.
- [x] Use a beautiful, uncanny golf course as the primary contrast: inviting moonlit scenery in tension with noise, machinery, empty facilities, and pursuit.
- [x] Make grass and golf mechanically important rather than decorative. Terrain affects concealment and noise; golf balls create tactical distractions.
- [x] Avoid turning the player into an action hero. Survival depends on route choice, timing, attention management, and environmental knowledge.
- [x] Use “**Here’s Joey!**” as the opening punchline and threat, delivered through subtitles and visual performance rather than a synthetic character voice.

## Current Playable Vertical Slice

### Opening and Menu

- [x] Present a high-detail pixel-art opening in which a weed whacker cuts through tall grass.
- [x] Animate Joe’s head and body with irregular, unsettling movement as he appears through the cut opening.
- [x] Time the subtitle “HERE’S JOEY!” to the visual reveal.
- [x] Use non-dialogue procedural sound for the weed whacker, impacts, ambience, stingers, and menu feedback.
- [x] Exclude the previous robot/speech-synthesis voice.
- [x] Transition dramatically from the opening into the title menu.
- [x] Provide Start, How to Play, Settings, and Fullscreen access.
- [x] Allow the opening to be skipped without preventing the player from reaching the game.

### Hole 1: “The Pilot”

- [x] Show a survival briefing before Joe begins moving.
- [x] Give the player an explicit immediate choice: locate the shed key and unlock the maintenance shed, or release sprinkler pressure and escape through the drainage culvert.
- [x] Support WASD and arrow-key movement.
- [x] Support Shift to sprint, C to crouch, Enter to interact, hold Space plus A/D to aim and chip a golf-ball distraction, H to recall controls, and Escape to cancel a shot or pause.
- [x] Show visible movement chevrons and movement/sprint status so locomotion is discoverable.
- [x] Place the shed key at a readable, authored landmark selected by the current Night Order.
- [x] Provide a locked shed as the escape target.
- [x] Provide a sprinkler valve that creates a major distraction and opens the alternate drainage route.
- [x] Give the player a limited supply of four golf balls for aimed chip-shot distractions.
- [x] Make fairway travel quieter but more exposed.
- [x] Make rough travel noisier but more concealed.
- [x] Give Joe patrol, investigate, search, and chase states.
- [x] Let authored hedges, trees, and course structures block Joe’s line of sight.
- [x] Let the player break contact, crouch in deep rough, become concealed, survive Joe’s last-known-position search, and recover to patrol.
- [x] Make repeated golf-ball distractions progressively shorter so one tactic cannot be repeated without consequence.
- [x] Show Joe with the generated front-facing lawn-mower sprite during pursuit.
- [x] Provide a mower-proximity meter and contextual interaction prompts.
- [x] Provide a live mini-map and readable objective display for prototype orientation.
- [x] Trigger victory when the player reaches and unlocks the shed with the key.
- [x] Trigger a distinct alternate victory when the player releases pressure and reaches the drainage culvert.
- [x] Trigger defeat as a darkly comic “claim denied” outcome when Joe catches the player.
- [x] Support retry, reset, and return-to-menu flows.
- [x] Pause the single-player simulation during pursuits and provide resume, how-to/settings, restart, and return-to-menu actions.
- [x] Collapse the onboarding-heavy HUD into a compact field display, with a player-invoked expanded view.
- [x] Grade completed runs without exposing a constant live score during the horror sequence.
- [x] Reward a balanced mix of speed, stealth, saved golf balls, careful movement, and successful pursuit recovery.
- [x] Persist separate shed- and drain-route personal records plus rounds, escapes, and captures.
- [x] Rotate three curated objective-and-patrol layouts, identify the upcoming Night Order in the menu, and persist which orders the player has cleared.
- [x] Present completion results as an in-fiction after-action performance review.

### Settings, Accessibility, and Verification

- [x] Provide volume control.
- [x] Provide subtitle control.
- [x] Provide a reduced-camera-motion setting.
- [x] Persist volume, subtitle, and reduced-camera-motion preferences across reloads.
- [x] Make all settings navigable by pointer, keyboard, and standard gamepad.
- [x] Support analog stick and D-pad movement, controller sprint, crouch, interaction, distraction, menu navigation, and retry.
- [x] Switch tutorials, HUD labels, contextual prompts, menu help, settings help, and result-screen actions to the most recently active input method.
- [x] Keep gameplay understandable without a voiced tutorial.
- [x] Expose deterministic time advancement and text-state output for automated inspection.
- [x] Browser-test the opening, exact subtitle reveal, menus, settings, briefing, keyboard and controller movement, controller prompt switching, controller settings navigation, map, locked-shed redirect, key pickup, distraction fatigue, sprinkler activation, drain opening, line-of-sight break, rough concealment, search recovery, pursuit, capture, both victories, retry, controller disconnect fallback, and reset.
- [x] Complete the current automated pass with zero console errors.
- [x] Validate responsive presentation at 800×600, 1440×900, and 2560×1600 without document overflow.

## Current Player Experience

The intended first-session flow is:

1. The grass-cutting cold open introduces Joe as both joke and threat.
2. The menu establishes the title, mood, and clear access to instructions and settings.
3. A short briefing explains movement, sprinting, crouch concealment, noise, distraction, and both escape routes.
4. The player enters the moonlit course, reads the mini-map and terrain, and begins moving before Joe closes in.
5. The player reads the current Night Order, then chooses between its relocated shed key or sprinkler controls.
6. Golf balls redirect Joe with diminishing effectiveness; sight blockers and deep rough let the player break pursuit and survive a search.
7. Unlocking the shed or entering the opened drain ends the slice with route-specific success; being caught ends it with a claim-denied screen.

This loop is the foundation for the larger game: **enter a course, read its grass and hazards, discover an escape requirement, manipulate Joe’s attention, and survive a final route to safety**.

## Joe: Character and Performance Direction

- Joe is an insurance-company product owner, not a supernatural monster with arbitrary powers.
- His professional composure should make him more disturbing: he treats pursuit as prioritization, risk control, scope enforcement, and claim resolution.
- His fixation on grass, mowing patterns, course standards, and golf etiquette should shape his routes and reactions.
- His lawn mower is simultaneously a threat, an audio beacon, a source of dark comedy, and a moving terrain modifier.
- His erratic arm and head movements should occur in short, irregular bursts, especially during investigation and close pursuit.
- Joe must remain readable enough that animation never hides a state change, strike, detection cue, or escape opportunity.
- Future dialogue should be sparse, subtitle-supported, and performable by a human actor. Do not reintroduce a robot voice.

## Image Generation for Asset Creation and Polish

Image generation is an approved and central part of the Rough Cut art pipeline. It should be used to accelerate concepting, establish the high-detail pixel-art look, create production candidates, and add visual richness. Generated images are **first drafts**, not automatically final assets.

### Assets Already Created with Image Generation

- [x] Joe reference and opening-scene artwork.
- [x] Tall-grass curtain used in the cold open.
- [x] Moonlit Hole 1 environment.
- [x] Front-facing Joe pushing a red lawn mower.
- [x] Field-kit icons for the shed key, golf ball, and sprinkler valve.
- [x] Transparent in-game derivatives produced through local chroma-key/alpha cleanup where needed.
- [x] Layered course obstacle, foreground-fringe, and clean-background assets used to create measurable motion and authored boundaries.
- [x] Drainage culvert prop used as a complete alternate escape route.
- [x] Dedicated Joe capture tableau used by the defeat transition.
- [x] Versioned canonical generated assets stored under the project’s character and environment asset folders.

### Required Image-Generation Workflow

- [ ] Begin with a written asset brief covering purpose, camera angle, pose, silhouette, palette, lighting, intended screen size, and required transparency.
- [ ] Use the established Joe reference and existing game frames to preserve character identity and costume continuity.
- [ ] Generate at high resolution while preserving deliberate pixel clusters, hard-edged forms, and limited-palette cohesion.
- [ ] Inspect every candidate at native size and at actual in-game display size.
- [ ] Reject unintended text, logos, malformed anatomy, duplicated tools, inconsistent mower geometry, muddy silhouettes, and faux-pixel blur.
- [ ] Remove chroma backgrounds or create clean alpha only after selecting the strongest source.
- [ ] Crop, scale, and anchor assets consistently so animation does not jitter.
- [ ] Store original generation, cleaned master, and optimized runtime derivative separately.
- [ ] Use clear versioned names and record the prompt or visual brief beside the canonical asset.
- [ ] Integrate the asset into the actual game before approval; a good standalone image can still fail in motion, lighting, contrast, or gameplay readability.
- [ ] Capture an in-game screenshot and compare it against the visual target before marking the asset complete.
- [ ] Verify that image assets remain legible with subtitles, HUD elements, reduced motion, and common browser scaling.

### Priority Image-Generation Targets

- [x] A state-readable runtime Joe set for patrol, investigate, search, chase, mower vibration, erratic arms/head movement, and capture presentation. The canonical source package still needs its final manual paint-clean before production lock.
- [ ] Layered tall-grass states: untouched, bending, recently cut, flattened, wet, moonlit, backlit, and blood- or rust-stained variants where appropriate.
- [ ] Maintenance-shed exterior and interior, including several readable entry routes and hiding opportunities.
- [ ] Course props: tee markers, flags, carts, sprinklers, signs, insurance notices, mower debris, and abandoned personal items.
- [ ] Golf-course vistas for additional holes, weather states, and time-of-night transitions.
- [ ] Defeat stills, chapter cards, loading art, and restrained menu flourishes.
- [ ] UI icon families that match the world art without sacrificing immediate readability.
- [ ] Marketing key art only after the playable game’s final Joe design and environment palette are locked.

### Image-Generation Guardrails

- Generated art must not replace collision design, AI state logic, accessibility, or gameplay communication.
- Avoid direct reconstruction of copyrighted movie frames. The opening should remain an original grass-and-weed-whacker horror-comedy homage built around Rough Cut’s own staging and Joe’s identity.
- Do not bake important instructions or dialogue into generated images; render text in the interface for accessibility and localization.
- Keep Joe recognizable across assets without making the portrait photorealistic beside pixel-art environments.
- Favor a coherent authored set over a large collection of visually incompatible generations.

## Prototype Constraints to Resolve

- **Mini-map knowledge:** Joe is now shown live only at close range or during active pursuit; lost contact decays to a temporary last-signal marker. A full game should extend this with sound direction, disturbed grass, camera coverage, or a valid tracking source. Exact live tracking may remain as an accessibility option.
- **Objective markers:** The key, sprinkler, and shed are currently easy to locate for vertical-slice clarity. Production levels should support configurable marker strength and more diegetic navigation through yardage books, course signs, landmarks, or recovered maintenance maps.
- **Spatial model:** The slice now has authored collision, projected boundaries, line-of-sight occlusion, hiding terrain, multiple traversable routes, and obstacle-aware Joe navigation on a simplified 2D coordinate layer. Production work still needs larger cover volumes, richer authored path choices, and multi-area navigation.
- **Golf depth:** The current golf mechanic now supports pressure-based charge, lateral aim, readable trajectory, delayed impact, and Joe redirection. It still stops short of the planned club choice, lie, spin, bounce, roll, wind, and deeper ball-physics system.
- **Grass depth:** Fairway, concealment-bearing rough, persistent mower-cut strips, temporary player trails, and golf divots now form a readable information system. The larger turf taxonomy, samples, player-operated cutting, recovery, and environmental reactions remain future work.
- **Audio:** Current sound is procedural and functional. It still needs authored ambience, spatial layering, stronger mower-state transitions, human-performed Joe material if dialogue is added, and a proper mix.
- **Input:** Keyboard, pointer, and standard gamepad play are implemented with automatic prompt switching and controller-navigable settings. Touch controls, rebinding, non-standard controller glyph sets, and remapping accessibility remain future work.
- **Campaign systems:** Saves, checkpoints, multiple holes, progression, advanced difficulty modes, and the broader narrative arc are not yet implemented.

## Production Roadmap

### Phase 1 — Playable Vertical Slice

- [x] Establish the title, premise, Joe, art direction, cold open, menu, clear controls, core pursuit, distractions, one objective chain, and complete win/fail loop.
- [x] Use image generation to create and polish the first coherent character, environment, prop, and opening assets.
- [x] Validate the main branches through automated browser play and screenshot inspection.

### Phase 2 — Turn the Slice into a Strong Game Level

- [x] Add collision geometry, occlusion, authored hiding spaces, and stable route boundaries.
- [x] Create multiple viable paths and a second complete extraction route.
- [ ] Randomize from curated key, resource, and Joe-start locations without producing unfair states.
- [ ] Add a shed interior or connected second route so reaching the door creates a new tension beat rather than an immediate hard stop.
- [x] Improve Joe’s line of sight, hearing, search memory, and detection recovery.
- [x] Add obstacle-aware Joe route selection with stuck recovery and state-specific patrol, investigate, search, and chase mower animation.
- [x] Replace permanent live tracking with close-range/live-pursuit tracking and a decaying last-signal state.
- [x] Add the first aimed golf shot with readable setup, consequence, and recovery.
- [x] Expand grass beyond the fairway/rough binary with at least one cut state and one evidence-bearing state.
- [ ] Commission or create authored sound layers and remove any remaining placeholder feel.
- [ ] Generate and integrate a consistent production animation set for Joe and the mower.

### Phase 3 — Expand the Course and Narrative

- [ ] Build additional holes with distinct terrain, hazards, escape requirements, and Joe behaviors.
- [ ] Add clubhouse, maintenance, insurance, and turf-research spaces that reveal Joe’s history through play.
- [ ] Introduce campaign progression, saves/checkpoints, replay variation, difficulty options, and richer accessibility.
- [ ] Escalate the insurance-product-owner satire through mechanics rather than relying on exposition.
- [ ] Add human-performed, sparse Joe dialogue only where it improves anticipation or character.

### Phase 4 — Production Polish

- [ ] Lock the palette, sprite proportions, animation timing, UI language, and post-processing rules.
- [ ] Complete performance, browser, resolution, controller, accessibility, and long-session testing.
- [ ] Replace all temporary procedural or generated material that fails the final consistency bar.
- [ ] Complete final audio mix, credits, legal review, content warnings, store media, and release packaging.

## Definition of Done for New Features

- [ ] The player-facing behavior is understandable without developer explanation.
- [ ] Controls and consequences are communicated before punishment.
- [ ] Joe’s relevant state and counterplay are readable through at least two channels where practical.
- [ ] The feature preserves the horror-first design hierarchy.
- [ ] Any comedy reinforces character or tension instead of canceling it.
- [ ] Generated assets pass identity, silhouette, alpha, scale, palette, animation, and in-game contrast review.
- [ ] The text-state/debug representation exposes enough state to diagnose the feature.
- [ ] The critical path and failure path are covered by a deterministic browser scenario.
- [ ] Screenshots are reviewed at opening, active play, high-pressure, victory, and defeat states as applicable.
- [ ] No new console errors are introduced.
- [ ] Keyboard behavior remains intact, and future controller/touch implications are documented.
- [ ] The comprehensive quality checklist below is updated when the feature changes the intended final design.

> **Working premise:** The player is trapped across uncanny golf courses, turf facilities, clubhouses, and insurance-controlled properties. To escape, they must complete golf- and grass-related objectives while **Joe—an insurance-company product owner—systematically hunts them**. Joe turns backlog priorities, status requests, risk registers, scope controls, coverage rules, acceptance criteria, and stakeholder escalation into instruments of pursuit.
>
> **Design hierarchy:** Horror and pursuit come first. Golf and grass shape the objectives, terrain, stealth, tools, and scares. Insurance and project-management satire should deepen the unease rather than reduce Joe to comic relief.

## Creative North Star

- [ ] Make the game unmistakably a horror experience rather than a conventional golf game with an enemy added to it.
- [ ] Make Joe the central persistent threat around which exploration, objectives, golf, and grass systems are designed.
- [ ] Make the player feel hunted, exposed, and vulnerable while still retaining meaningful agency.
- [ ] Make beautiful golf-course environments feel unnervingly open, artificial, controlled, and unsafe.
- [ ] Make grass mechanically important to movement, concealment, tracking, objectives, and environmental storytelling.
- [ ] Make golf mechanically important to traversal, distraction, puzzle solving, risk, and progression.
- [ ] Make insurance and project-management satire function as horror systems rather than flavor text alone.
- [ ] Make Joe frightening because he is calm, organized, persistent, and procedurally certain—not because he constantly shouts or behaves like a generic monster.
- [ ] Let humor come from Joe's corporate logic and the world's absurd bureaucracy without dissolving tension at critical moments.
- [ ] Make every major mechanic reinforce observation, planning, commitment, risk, and escape.
- [ ] Preserve long enough periods of quiet for anticipation, route planning, grass inspection, and golf-shot preparation.
- [ ] Make moments of safety feel earned, temporary, and emotionally relieving.
- [ ] Make the player learn Joe's rules, the course, and the turf rather than overpowering the threat through raw statistics.
- [ ] Keep the premise coherent as the campaign escalates from strange workplace pressure to full systemic horror.
- [ ] Avoid unrelated crafting, combat, collection, or management systems that dilute the central experience.
- [ ] Focus production effort on the core game rather than unnecessary tooling, infrastructure, or speculative features.

## Core Horror Experience

- [ ] Build the core experience around anticipation, observation, concealment, commitment, pursuit, escape, and recovery.
- [ ] Make fear come from uncertainty about Joe's location while keeping his behavior governed by understandable rules.
- [ ] Let the player hear, infer, or discover Joe before clearly seeing him.
- [ ] Use open fairways, blind hills, tree lines, bunkers, clubhouses, and maintenance spaces to create different kinds of vulnerability.
- [ ] Make quiet exploration tense without requiring constant scripted scares.
- [ ] Make Joe's absence capable of creating as much tension as his visible presence.
- [ ] Avoid keeping Joe in uninterrupted pursuit for most of the game.
- [ ] Alternate slow dread, investigation, near discovery, active search, pursuit, and decompression.
- [ ] Make scares emerge from systems and player decisions as often as from authored sequences.
- [ ] Use scripted scares sparingly so they remain surprising and do not undermine trust in the game's rules.
- [ ] Ensure the player usually understands why Joe found them after the danger has passed.
- [ ] Allow mistakes to escalate danger without making every small error immediately fatal.
- [ ] Give the player opportunities to recover from partial detection, lost resources, or a poor route choice.
- [ ] Avoid long stretches of routine traversal with no new information, decisions, or tension.
- [ ] Make each course or chapter introduce a new form of fear, uncertainty, or pursuit pressure.
- [ ] Keep the horror legible enough that tension does not become confusion.
- [ ] Make success feel like survival through knowledge and nerve rather than domination.
- [ ] Make the final experience cohesive, memorable, replayable, and emotionally exhausting in intentional doses rather than constantly.

## Core Gameplay Loop

- [ ] Give every playable area a clear loop of entering, reading the terrain, locating an objective, managing Joe's attention, completing the task, and reaching extraction or temporary safety.
- [ ] Make golf shots, grass interactions, course machinery, and route choices feed directly into Joe's awareness state.
- [ ] Require the player to balance progress against noise, visibility, time, and evidence left behind.
- [ ] Make objectives create vulnerable commitments rather than instant button presses.
- [ ] Let the player prepare an objective area before beginning a noisy or time-consuming action.
- [ ] Allow multiple valid plans for most major objectives.
- [ ] Make plans capable of failing in interesting, recoverable ways.
- [ ] Ensure each loop contains at least one meaningful decision beyond simply moving to the next marker.
- [ ] Make the player decide when to move quickly, wait, hide, create a distraction, take a shot, or abandon an attempt.
- [ ] Give the player useful information before high-risk commitments.
- [ ] Make progress visible through opened routes, completed holes, recovered grass, altered course systems, or revealed project records.
- [ ] Avoid objectives that are disconnected fetch quests with no relationship to Joe, grass, golf, or insurance.
- [ ] Avoid requiring the player to repeat a solved low-risk process many times.
- [ ] Make failure teach something about Joe, the terrain, the objective, or the available tools.
- [ ] Keep recovery and re-entry quick enough that tension is preserved after failure.
- [ ] Make the loop deepen over time without replacing its original appeal with unrelated systems.

## Player Vulnerability and Agency

- [ ] Make the player physically vulnerable enough that encountering Joe at close range is frightening.
- [ ] Avoid turning the player into an action hero who can routinely defeat Joe through direct combat.
- [ ] Give the player reliable options for avoidance, concealment, distraction, misdirection, escape, and temporary resistance.
- [ ] Make defensive actions create time or distance rather than permanently eliminating the central threat.
- [ ] Allow direct resistance only when it creates a clear cost, risk, or limited opportunity.
- [ ] Prevent the player from stun-locking or repeatedly exploiting Joe with one item or animation.
- [ ] Prevent Joe from chain-grabbing, chain-stunning, or removing control without reasonable counterplay.
- [ ] Give the player enough durability or escape opportunity to learn from an initial mistake.
- [ ] Clearly communicate injury, impaired movement, panic, or other harmful states.
- [ ] Avoid visual effects that make injury harder to understand than the threat itself.
- [ ] Make the player's knowledge, preparation, and composure more important than permanent stat increases.
- [ ] Let skilled players take calculated risks for faster routes, rare grass, optional evidence, or better outcomes.
- [ ] Allow cautious players to succeed through patience and route planning.
- [ ] Avoid making one style of play universally correct across every course.
- [ ] Make the player feel clever when they exploit terrain, golf physics, turf conditions, or corporate rules.
- [ ] Preserve player control during most scares rather than relying on frequent cutscenes or forced camera movement.

## Player Movement and Course Traversal

- [ ] Make walking, crouching, sprinting, turning, leaning, and interacting responsive and predictable.
- [ ] Make movement feel grounded enough to support horror while remaining responsive during pursuit.
- [ ] Make fairway, rough, fringe, green, bunker, mud, gravel, water, cart path, and indoor flooring affect movement and sound consistently.
- [ ] Clearly communicate when terrain will slow, expose, conceal, or amplify the player.
- [ ] Make tall grass useful for concealment without making it an automatic safe zone.
- [ ] Make short manicured grass increase visibility and footprint readability where appropriate.
- [ ] Prevent the player from snagging on tee markers, roots, rocks, signs, furniture, or decorative geometry.
- [ ] Make slopes, drainage ditches, bridges, sand traps, retaining walls, and maintenance paths easy to read under pressure.
- [ ] Give the player several ways to cross or route around major open spaces.
- [ ] Use vaulting, climbing, crawling, sliding, fence gaps, ladders, carts, or maintenance access only where they fit the grounded movement model.
- [ ] Avoid movement actions that trap the player in lengthy animations during danger.
- [ ] Allow contextual actions to be canceled when reasonable.
- [ ] Make sprint stamina, if included, create tension without forcing tedious stop-and-go movement.
- [ ] Provide clear feedback before the player becomes completely exhausted.
- [ ] Let the player move carefully while carrying grass samples, balls, clubs, documents, or objective items.
- [ ] Make carrying bulky or fragile items create understandable tradeoffs rather than arbitrary inconvenience.
- [ ] Make golf-cart traversal fast, noisy, risky, and mechanically distinct from movement on foot where included.
- [ ] Prevent carts or vehicles from becoming universal escape solutions.
- [ ] Preserve movement, collision, and camera responsiveness at all supported frame rates.
- [ ] Include field-of-view, camera sensitivity, camera motion, head-bob, and motion-reduction options.

## Stealth, Visibility, and Sound

- [ ] Base stealth on readable combinations of sight, sound, terrain, light, movement, and evidence.
- [ ] Make Joe's line of sight consistent with visible obstacles and elevation.
- [ ] Avoid invisible detection zones that contradict the environment.
- [ ] Make grass height, density, moisture, movement, and disturbance affect concealment in understandable ways.
- [ ] Make crouching, moving slowly, and choosing soft terrain meaningfully reduce detection risk.
- [ ] Make sprinting, swinging, striking a ball, opening metal doors, starting machinery, and driving carts produce distinct noise profiles.
- [ ] Allow wind, rain, sprinklers, machinery, announcements, and distant maintenance work to mask player noise.
- [ ] Let the player deliberately create noise to redirect Joe.
- [ ] Make thrown, rolled, chipped, or driven golf balls function as materially different distractions.
- [ ] Make Joe investigate a sound's source rather than instantly knowing the player's location.
- [ ] Allow Joe to notice repeated or suspicious distraction patterns over time.
- [ ] Make hiding places useful but limited by line of sight, sound, duration, or Joe's search behavior.
- [ ] Prevent one locker, bush, room, or bunker from being a permanent universal safe spot.
- [ ] Make the player capable of observing Joe from concealment without requiring pixel-perfect positioning.
- [ ] Communicate partial detection, suspicion, confirmation, and pursuit through diegetic cues, audio, animation, or restrained UI.
- [ ] Avoid an omniscient detection meter unless it matches the intended presentation.
- [ ] Make darkness helpful but never the sole stealth system.
- [ ] Avoid forcing the player to remain nearly blind in order to stay hidden.
- [ ] Make flashlights, course lights, cart lamps, and phone screens meaningful visibility risks.
- [ ] Ensure sound propagation remains consistent across indoor and outdoor spaces.
- [ ] Provide visual sound indicators or captions as accessibility options without automatically revealing perfect enemy information.

## Joe: Identity and Horror Presence

- [ ] Make Joe immediately recognizable by silhouette, posture, clothing, movement, tools, and sound.
- [ ] Make Joe visibly read as an insurance product owner rather than a generic groundskeeper, golfer, or slasher.
- [ ] Give Joe recurring objects such as a clipboard, tablet, headset, lanyard, risk register, folder, or project bag that reinforce his role.
- [ ] Make Joe's calm professional behavior more disturbing as the situation becomes more dangerous.
- [ ] Give Joe a controlled vocal style that can shift from courteous status requests to procedural certainty and open threat.
- [ ] Avoid making Joe constantly joke, shout, or narrate his every action.
- [ ] Let silence, distant observation, and incomplete glimpses establish Joe before active pursuit.
- [ ] Use reflections, windows, hill crests, security feeds, distant greens, and cart paths to reveal Joe at unsettling distances.
- [ ] Make Joe appear to belong to the environment while still feeling wrong within it.
- [ ] Give Joe recognizable habits that observant players can learn.
- [ ] Give Joe enough variation that learning him does not remove all uncertainty.
- [ ] Make Joe interact physically with doors, gates, carts, course equipment, documents, and terrain.
- [ ] Avoid obvious teleportation unless a specific supernatural rule clearly supports and communicates it.
- [ ] Make any impossible behavior deliberate, rare, and consistently foreshadowed.
- [ ] Make Joe leave traces that the player can read, such as cart tracks, clipped notices, moved flags, radio chatter, footprints, or updated task boards.
- [ ] Keep Joe threatening throughout the game without relying only on increasing movement speed or damage.
- [ ] Make Joe's presence alter the atmosphere even when he is not visible.
- [ ] Ensure Joe remains the emotional and mechanical center of the horror experience.

## Joe's Behavioral States

- [ ] Give Joe a clear set of internal states with distinct goals, movement patterns, and information access.
- [ ] Include calm states such as Off-Site, Monitoring, Reviewing, Patrolling, or Conducting a Walkthrough where appropriate.
- [ ] Include suspicion states such as Auditing, Investigating, Verifying, or Following Up.
- [ ] Include active threat states such as Searching, Escalating, Pursuing, Containing, or Closing the Action Item.
- [ ] Make transitions between states respond to specific evidence, sounds, sightings, delays, and player actions.
- [ ] Communicate state changes without exposing the complete AI model.
- [ ] Give Joe a believable last-known-position system.
- [ ] Make Joe search outward from evidence instead of walking directly to the hidden player.
- [ ] Let Joe inspect likely hiding places, escape routes, objectives, and previously disturbed turf.
- [ ] Make Joe remember recent player habits within an encounter.
- [ ] Reset or decay Joe's knowledge in consistent, learnable ways.
- [ ] Let Joe become more thorough after repeated deception without becoming omniscient.
- [ ] Make Joe capable of abandoning a weak lead and returning to scheduled behavior.
- [ ] Prevent Joe from remaining permanently locked into a failed search.
- [ ] Make Joe's search duration scale with the strength of available evidence.
- [ ] Give the player opportunities to observe when Joe is distracted, occupied, or committed to another task.
- [ ] Allow authored sequences to adjust Joe's state while preserving the same readable rules.
- [ ] Test every state transition for soft locks, infinite searches, and impossible objective conditions.

## Joe's Detection and Information Sources

- [ ] Make Joe acquire information through observable systems rather than arbitrary knowledge.
- [ ] Let Joe react to direct sight, sound, security cameras, staff reports, alarms, moved equipment, and opened access points.
- [ ] Let Joe notice footprints, dew trails, broken grass, fresh divots, removed samples, displaced flags, disturbed sand, and ball marks.
- [ ] Make ball flight and impact capable of revealing the player's approximate position or intended route.
- [ ] Let Joe inspect unfinished objectives, changed scorecards, altered project boards, missing documents, and unauthorized approvals.
- [ ] Make project dashboards or surveillance systems improve Joe's coverage only while they are powered, connected, or supplied with valid data.
- [ ] Let the player disable, obstruct, corrupt, delay, or misdirect individual information sources.
- [ ] Clearly communicate which systems are currently feeding Joe information.
- [ ] Avoid requiring the player to infer invisible global alerts with no environmental cause.
- [ ] Make cameras, sensors, radios, and staff reports spatially and mechanically distinct.
- [ ] Allow the player to create false evidence, false routes, misleading ball strikes, or incorrect status updates.
- [ ] Make false information delay or redirect Joe rather than erase him from the game.
- [ ] Let Joe validate suspicious information when the player overuses the same deception.
- [ ] Make information persist only as long as the fiction and mechanics support it.
- [ ] Prevent Joe from seeing through terrain, closed opaque doors, or solid architecture without a specific explained tool.
- [ ] Give accessibility options that clarify evidence and detection rules without trivializing stealth.

## Joe's Pursuit and Capture

- [ ] Make active pursuit intense, readable, and shorter than the broader periods of stalking and uncertainty.
- [ ] Give Joe a chase movement style that is frightening but compatible with the player's available escape options.
- [ ] Make Joe gain ground through route knowledge, anticipation, doors, carts, and course control rather than impossible raw speed alone.
- [ ] Give the player several ways to break line of sight and transition back into a search state.
- [ ] Make hills, rough, bunkers, buildings, tree lines, irrigation channels, carts, and machinery create chase decisions.
- [ ] Avoid chase routes that contain only one correct sequence of scripted actions.
- [ ] Prevent Joe from instantly recapturing the player after a successful escape interaction.
- [ ] Telegraph grabs, tackles, blocked exits, thrown objects, or other capture attempts clearly enough to react.
- [ ] Avoid instant-kill attacks without strong setup and obvious counterplay.
- [ ] Make close calls produce strong visual, audio, animation, and environmental feedback.
- [ ] Let Joe cut off predictable routes when he has enough information, but preserve alternative escape options.
- [ ] Avoid silently spawning Joe directly in front of or behind the player.
- [ ] Make Joe's re-entry routes physically plausible or distinctly signaled.
- [ ] Ensure doors, ladders, crawlspaces, carts, and transitions behave reliably during chase conditions.
- [ ] Make capture sequences concise, frightening, and consistent with Joe's corporate identity.
- [ ] Avoid overusing the same capture animation or dialogue.
- [ ] Make failure and restart fast enough that the player remains willing to experiment.
- [ ] Preserve meaningful consequences for capture without requiring excessive replay of solved content.

## Joe's Insurance and Project-Management Tactics

- [ ] Turn project-management and insurance concepts into spatial, systemic, and threatening mechanics.
- [ ] Use **scope lock** to close, redefine, or constrain routes in ways the player can anticipate and counter.
- [ ] Use **action items** to mark objectives, locations, or player obligations that increase danger when ignored.
- [ ] Use **status requests** to create timed responses, audible devices, forced choices, or escalating searches.
- [ ] Use **risk registers** to reveal, distort, prioritize, or weaponize hazards across the course.
- [ ] Use **change requests** to alter objectives, access rules, or route requirements after the player has committed.
- [ ] Use **stakeholder escalation** to activate cameras, staff, gates, lights, announcements, or additional surveillance.
- [ ] Use **coverage boundaries** as physical or procedural zones with clear rules and consequences.
- [ ] Use **policy exclusions** to temporarily disable expected protections or safe routes, with fair warning.
- [ ] Use **deductibles** as explicit costs paid in resources, time, exposure, or objective progress.
- [ ] Use **claim denial** to revoke an apparent solution and force a dangerous appeal or alternate route.
- [ ] Use **appeals** as high-risk opportunities to reverse Joe's control or recover a lost option.
- [ ] Use **incident reports** to preserve evidence of the player's mistakes and change later searches.
- [ ] Use **dependency blockers** to connect course machinery, keys, permissions, and objectives in understandable ways.
- [ ] Use **rebaselining** to change timing or route conditions without arbitrarily deleting completed progress.
- [ ] Use **performance improvement plans** or corrective actions as escalating pursuit conditions rather than long text jokes.
- [ ] Let the player exploit loopholes, misfile records, reroute approvals, transfer risk, falsify completion, or create blockers.
- [ ] Make every corporate tactic have a concrete effect, readable warning, and at least one viable response.
- [ ] Keep mechanical descriptions clear even when the surrounding language is satirical.
- [ ] Avoid forcing the player to operate a realistic project-management or insurance simulator.
- [ ] Avoid turning every interaction into a menu, form, or dialogue box.
- [ ] Make Joe's bureaucracy feel like an expanding net around the player.

## Golf as a Survival System

- [ ] Make golf serve horror, navigation, distraction, access, and survival rather than existing as a separate sports minigame.
- [ ] Make taking a shot a deliberate commitment that can create noise, visibility, time pressure, and evidence.
- [ ] Let shots open gates, strike switches, move keys, trigger machinery, break lights, disable sensors, or reach inaccessible objectives.
- [x] Let shots create distractions at controllable distances and elevations.
- [ ] Make the player choose between a quiet short shot and a powerful shot that may draw Joe from farther away.
- [ ] Make the ball's landing location matter after the shot rather than treating the ball as a disposable visual effect.
- [ ] Allow the player to use ball position to plan future distractions, routes, or puzzle solutions.
- [ ] Make some objectives require completing a hole, reaching a target, reproducing a recorded shot, or manipulating the course through golf.
- [ ] Avoid requiring formal stroke play on every level.
- [ ] Let score, par, or stroke count create optional pressure, narrative meaning, or alternate outcomes rather than overriding survival.
- [ ] Make golf terminology and course etiquette feel uncanny when repurposed by Joe and the insurance organization.
- [ ] Make golf mechanics understandable to players who do not already know the sport.
- [ ] Avoid requiring knowledge of real club specifications or tournament rules for basic completion.
- [ ] Preserve enough authenticity that lies, clubs, slopes, wind, and ball behavior feel coherent.
- [ ] Make golf-shot solutions support multiple clubs, angles, or levels of execution where possible.
- [ ] Avoid precision requirements that become frustrating during active pursuit.
- [ ] Let skilled players use advanced shots to create safer, faster, or more rewarding routes.
- [ ] Make the best golf moments heighten vulnerability instead of pausing the horror completely.

## Shot Setup and Execution Under Threat

- [ ] Make aiming, selecting power, choosing a club, applying spin, and committing a shot responsive and readable.
- [ ] Provide a fast shot mode for urgent distractions and a more deliberate mode for precision where appropriate.
- [ ] Make power, aim, timing, lie, slope, wind, turf, and club choice interact consistently.
- [ ] Avoid hidden random dispersion that makes good decisions produce inexplicable failures.
- [ ] Show uncertainty honestly through a landing area, stability indicator, or comparable preview.
- [ ] Make the preview less exact under injury, panic, poor lighting, unstable terrain, or active pressure only when clearly communicated.
- [ ] Let the player cancel shot setup before commitment.
- [ ] Avoid locking the player into a long address or backswing animation while Joe approaches without warning.
- [ ] Give Joe's nearby movement, voice, radio, or equipment enough presence to remain perceivable during shot preparation.
- [ ] Allow the player to glance away from the ball or monitor surroundings without discarding all setup progress where appropriate.
- [ ] Make contact, launch, flight, impact, bounce, roll, and target activation satisfying and easy to read.
- [ ] Allow ball-follow cameras to be shortened, skipped, interrupted, or replaced with a picture-in-picture view.
- [ ] Avoid removing awareness of the player's body and surroundings for long periods after a shot.
- [ ] Make rushed shots less precise without making them automatically useless.
- [ ] Make near misses reveal what went wrong and where the ball finished.
- [ ] Make long shots, bank shots, ricochets, hole-outs, and last-second distractions feel exceptional.
- [ ] Preserve shot responsiveness and physics across all supported frame rates.
- [ ] Include timing, aiming, trajectory, and input assists for players who need them.

## Clubs and Survival Tools

- [ ] Give each carried club a clear golf role and a clear survival role.
- [ ] Make the driver powerful, long-range, conspicuous, and useful for distant distractions or major mechanisms.
- [ ] Make irons reliable for controlled target strikes and intermediate trajectories.
- [ ] Make wedges useful for clearing obstacles, reaching elevation, escaping bunkers, or placing precise distractions.
- [ ] Make the putter quiet, precise, and useful for close-range lures, switches, and confined spaces.
- [ ] Make specialty clubs or improvised corporate tools sidegrades with distinct risks rather than direct power upgrades.
- [ ] Consider unsettling thematic tools such as an Adjuster, Red-Tape Putter, Risk Wedge, or Claims Driver only when their mechanics remain clear.
- [ ] Give every club a recognizable silhouette, handling feel, strike sound, flight profile, and environmental use.
- [ ] Keep the carried selection limited enough that changing tools remains fast under pressure.
- [ ] Let players organize quick slots, favorites, and controller shortcuts.
- [ ] Make club switching responsive without encouraging constant inventory friction.
- [ ] Clearly communicate when a club is ineffective because of lie, range, space, damage, or environmental conditions.
- [ ] Keep early clubs useful throughout the campaign.
- [ ] Make upgrades improve options, reliability, concealment, or specialized utility rather than only distance.
- [ ] Avoid clubs that turn Joe into a routine combat target.
- [ ] Allow a desperate club strike or block only as risky temporary resistance where appropriate.
- [ ] Make Joe adapt to repeated direct resistance.
- [ ] Prevent tool durability from becoming constant maintenance unless deterioration is a deliberate horror pressure.
- [ ] Make repair, replacement, or recovery rules clear and forgiving enough to avoid soft locks.
- [ ] Ensure no required objective depends on a club the player could permanently lose without warning.

## Ball Physics, Recovery, and Noise

- [ ] Make ball launch, flight, spin, bounce, roll, drag, and collision consistent enough to learn and exploit.
- [ ] Make fairway, green, rough, sand, mud, water, roots, pavement, walls, glass, and metal surfaces affect the ball predictably.
- [ ] Clearly communicate the current lie and its practical effect.
- [ ] Make ricochets and bank shots deliberate possibilities rather than physics accidents.
- [ ] Give impact materials distinctive sound signatures and noise ranges.
- [ ] Make Joe react to the approximate origin, path, or impact of a shot based on what he could realistically perceive.
- [ ] Avoid making every ball strike reveal the player's exact location.
- [ ] Make a ball rolling through grass capable of leaving a subtle trail or disturbance.
- [ ] Let balls trigger pressure plates, motion sensors, bells, sprinklers, cameras, glass, or other course systems consistently.
- [ ] Make the number of available balls meaningful without producing constant ammunition anxiety.
- [ ] Provide recoverable balls, found balls, practice balls, marked balls, and special balls only where each has a clear role.
- [ ] Make ball markings or types readable in low light and under pressure.
- [ ] Prevent balls from becoming permanently trapped in tiny gaps or invalid geometry.
- [ ] Provide fair relief, retrieval, or replacement rules when physics fails.
- [ ] Make water hazards, out-of-bounds areas, and lost-ball consequences explicit before commitment.
- [ ] Avoid requiring the player to search large dark areas for one essential ball.
- [ ] Ensure critical puzzles have recovery paths if a ball lands incorrectly.
- [ ] Test seeded or replayed shots for consistency where deterministic behavior is promised.

## Grass as a Core Horror System

- [ ] Make grass a central mechanical layer rather than decorative scenery or a generic collectible category.
- [ ] Give turf types distinct visual, acoustic, movement, concealment, tracking, and objective properties.
- [ ] Make manicured greens feel exposed, quiet, controlled, and unnaturally perfect.
- [ ] Make rough and tall grass feel concealing but uncertain, noisy, and capable of hiding Joe as well as the player.
- [ ] Make wet grass preserve footprints, dew trails, drag marks, and evidence.
- [ ] Make dry grass rustle loudly, ignite, break, or reveal movement where appropriate.
- [ ] Make bent, cut, diseased, dead, artificial, invasive, or altered grass communicate environmental history.
- [ ] Use mowing patterns, discoloration, growth direction, clippings, and divots as navigational or narrative clues.
- [ ] Let grass indicate where Joe recently walked, waited, dragged equipment, or changed the course.
- [ ] Let Joe read the player's disturbed turf and follow recent evidence.
- [ ] Give the player limited ways to brush out, water, cut, replace, disguise, or redirect a trail.
- [ ] Avoid requiring tedious cleanup after every movement.
- [ ] Make wind move grass in ways that reveal hidden bodies, routes, or approaching danger.
- [ ] Make grass movement readable without producing constant false alarms.
- [ ] Use isolated movement in still grass as a powerful scare sparingly.
- [ ] Make unusual grass varieties relevant to objectives, tools, access, Joe's behavior, or the story.
- [ ] Avoid reducing grass to passive percentage bonuses.
- [ ] Let certain turf dampen sound, catch balls, conceal items, reveal heat, hold scent, or react to course systems where fiction supports it.
- [ ] Keep supernatural or impossible turf behavior governed by learnable rules if included.
- [ ] Make the grass visually beautiful enough that its corruption, disturbance, or silence becomes emotionally effective.
- [ ] Preserve the absurd importance of grass while treating it seriously enough to sustain horror.

## Grass Collection and Field Guide

- [ ] Make collecting grass a vulnerable action with a readable duration, sound, posture, and field of view.
- [ ] Let the player inspect a sample before deciding whether the risk of collecting it is worthwhile.
- [ ] Give every important grass variety a recognizable appearance, location logic, condition, and mechanical meaning.
- [ ] Use environmental clues to lead players toward rare samples without relying entirely on markers.
- [ ] Avoid requiring the player to examine every visually identical patch.
- [ ] Make collection leave evidence such as a clipped square, exposed soil, divot, scent, missing tag, or disturbed equipment.
- [ ] Let Joe notice or investigate recent sample removal.
- [ ] Allow the player to postpone a sample, prepare the area, create a distraction, or return through a safer route.
- [ ] Make sample tools, containers, tags, and storage readable and quick to use.
- [ ] Limit sample capacity only when choosing what to carry creates meaningful tension.
- [ ] Avoid inventory chores that repeatedly interrupt stalking and exploration.
- [ ] Make fragile, contaminated, living, wet, or time-sensitive samples behave differently only when the distinction affects play.
- [ ] Give the field guide useful information about habitat, concealment, sound, tracking, course history, and known interactions.
- [ ] Let field-guide language become increasingly unsettling or reveal institutional manipulation.
- [ ] Distinguish observed, sampled, verified, contaminated, missing, and completed entries clearly.
- [ ] Make grass discoveries unlock knowledge, routes, endings, tactics, or narrative context rather than only completion points.
- [ ] Keep optional samples optional for ordinary campaign completion unless clearly designated otherwise.
- [ ] Make full collection reward mastery and curiosity without requiring repetitive farming.
- [ ] Prevent rare samples from being permanently missed without clear warning or chapter replay.
- [ ] Make the act of finding exceptional turf emotionally memorable rather than another checklist notification.

## Turf Tracks and Environmental Evidence

- [ ] Make footprints, bent blades, dew loss, sand displacement, ball trails, divots, clippings, mud, and broken stems readable at useful distances.
- [ ] Distinguish fresh evidence from old environmental wear.
- [ ] Make evidence persistence respond consistently to rain, sprinklers, wind, mowing, traffic, and time.
- [ ] Let the player use Joe's footprints, cart tracks, paperwork, cigar ash, coffee, tools, or compressed turf to infer his route.
- [ ] Let Joe use the player's evidence without following it with impossible precision.
- [ ] Make crossing hard surfaces, water, maintenance mats, or existing traffic useful for breaking a trail.
- [ ] Allow the player to intentionally create a false trail or duplicate disturbance.
- [ ] Avoid turning trail management into constant mandatory busywork.
- [ ] Make important evidence visually distinct from general ground detail.
- [ ] Provide accessibility options that improve evidence contrast without revealing every hidden clue automatically.
- [ ] Make ball marks and divots persist long enough to affect later navigation or searches where appropriate.
- [ ] Let repaired or replaced turf look subtly wrong rather than becoming perfectly invisible.
- [ ] Use repeated mowing lines, footprints, and course damage to tell stories without text.
- [ ] Ensure evidence does not accumulate until the course becomes visually unreadable or technically unstable.
- [ ] Test evidence on every lighting, weather, quality, and color-vision setting.
- [ ] Make evidence systems support deduction in both directions: the player can track Joe, and Joe can track the player.

## Course Design and Open-Space Horror

- [ ] Design each course as a stalking environment first and a believable golf property second.
- [ ] Use exposed fairways to create fear of crossing long distances with little cover.
- [ ] Use rough, tree lines, bunkers, drainage channels, cart tunnels, bridges, sheds, and elevation to create alternate routes.
- [ ] Make greens and tee boxes feel like vulnerable stages where important actions are visible from afar.
- [ ] Use blind crests and doglegs to conceal both opportunities and danger.
- [ ] Give each hole a memorable silhouette, landmark, risk pattern, and pursuit identity.
- [ ] Avoid courses made from interchangeable fairways and repeated props.
- [ ] Create route loops that allow escape, misdirection, and return without making navigation trivial.
- [ ] Avoid long dead ends unless the player can identify the commitment before entering.
- [ ] Give major objectives at least two plausible approach or escape routes where possible.
- [ ] Use elevation to reveal distant Joe sightings and to hide his approach.
- [ ] Make open space readable enough that spotting Joe feels like observation rather than luck.
- [ ] Use tree walls and landscaping carefully so boundaries feel physical rather than arbitrary.
- [ ] Avoid invisible walls where fences, water, terrain, darkness, or policy barriers could communicate limits.
- [ ] Make decorative golf architecture consistent with collision and traversal rules.
- [ ] Place grass objectives, golf mechanisms, resources, and hiding options in ways that create meaningful route tradeoffs.
- [ ] Avoid placing all useful resources in obvious safe corners.
- [ ] Give the player occasional high-ground observation points that remain risky to occupy.
- [ ] Let Joe use shortcuts, service routes, or carts without invalidating the player's map knowledge.
- [ ] Make changes caused by Joe, weather, or objectives physically alter route planning.
- [ ] Ensure course exits, shelters, and transitions become understandable once their conditions are met.
- [ ] Give every course a strong entrance, escalation, signature pursuit, climax, and departure.

## Clubhouses, Offices, and Maintenance Spaces

- [ ] Use interiors to provide claustrophobic contrast to the exposed outdoor courses.
- [ ] Give clubhouses, locker rooms, pro shops, claims offices, conference rooms, cart barns, pump stations, kitchens, archives, and maintenance tunnels distinct identities.
- [ ] Make indoor layouts plausible enough to learn under stress.
- [ ] Avoid generic mazes of identical corridors and doors.
- [ ] Use windows and glass to expose the player to distant or approaching Joe sightings.
- [ ] Make doors, partitions, blinds, shutters, furniture, and service passages part of stealth and pursuit.
- [ ] Make Joe's footsteps, voice, radio, and door interactions acoustically different indoors.
- [ ] Use elevators, dumbwaiters, vents, ceiling access, crawlspaces, and utility passages sparingly and consistently.
- [ ] Avoid making small hiding spaces guaranteed protection from a thorough search.
- [ ] Give the player ways to observe adjacent spaces before committing.
- [ ] Make office technology, project boards, insurance files, calendars, scorecards, and meeting rooms deliver story and mechanical information.
- [ ] Use the clubhouse as more than a safe hub; let its meaning and safety change over the campaign.
- [ ] Make maintenance spaces explain irrigation, mowing, lighting, gates, cameras, and other course systems.
- [ ] Avoid excessive key hunting that turns indoor horror into inventory bureaucracy.
- [ ] Make locked access points communicate their specific requirement or alternate route.
- [ ] Ensure Joe and the player navigate stairs, doorways, furniture, and narrow spaces reliably.
- [ ] Test every interior chase for camera clipping, collision traps, door exploits, and unreadable lighting.
- [ ] Make each major interior contain at least one memorable horror image, reveal, or systemic encounter.

## Course Machinery and Environmental Systems

- [ ] Make sprinklers, irrigation valves, pumps, mowers, carts, gates, lights, cameras, public-address systems, scoreboards, and maintenance equipment meaningful systems.
- [ ] Let the player use machinery to create noise, obscure sight, erase tracks, change turf, open routes, move objects, or delay Joe.
- [ ] Let Joe disable, commandeer, lock, or schedule machinery in response to the player's actions.
- [ ] Give every machine a readable state, control location, effect area, and risk.
- [ ] Clearly communicate what changed after a switch, valve, breaker, terminal, or approval is used.
- [ ] Avoid distant switch effects with no visual, audio, map, or environmental feedback.
- [ ] Make sprinklers create both concealment and noise while also revealing silhouettes and footprints.
- [ ] Make mowers dangerous, loud, route-changing, and thematically appropriate without becoming repetitive instant-kill traps.
- [ ] Make golf carts useful for speed, transport, impact, light, and distraction while remaining conspicuous.
- [ ] Make course lighting capable of helping, exposing, misleading, or briefly blinding both player and Joe.
- [ ] Use public-address announcements and status updates to alter tension or communicate system changes.
- [ ] Let security cameras and sensors be disabled or redirected locally rather than through one universal solution.
- [ ] Make course systems interact in understandable combinations.
- [ ] Prevent automation loops or physics interactions from producing soft locks.
- [ ] Avoid requiring repeated operation of already-solved machinery.
- [ ] Make machinery failure, maintenance, and corporate neglect part of environmental storytelling.
- [ ] Ensure moving equipment cannot permanently block critical routes without recovery.
- [ ] Test all systems while Joe is searching, pursuing, stunned, rerouting, or interacting with the same device.

## Environmental Hazards and Secondary Threats

- [ ] Use water, deep bunkers, unstable bridges, electrical faults, chemicals, pesticides, sharp equipment, machinery, storms, sinkholes, and damaged structures clearly.
- [ ] Make hazards visible or inferable before they cause severe harm.
- [ ] Avoid instant-death hazards without strong warning and fast recovery.
- [ ] Let hazards affect Joe where appropriate without making them effortless permanent solutions.
- [ ] Allow the player to use hazards to delay, redirect, expose, or temporarily injure Joe.
- [ ] Make hazardous chemicals and groundskeeping materials mechanically readable rather than realistic simulation burdens.
- [ ] Use animals, groundskeepers, security staff, cameras, drones, or other secondary threats only when they strengthen Joe's hunt.
- [ ] Avoid adding a large bestiary that competes with Joe for attention.
- [ ] Give every secondary threat a clear detection rule, purpose, and counter.
- [ ] Make supporting personnel capable of reporting the player rather than behaving like conventional combat enemies.
- [ ] Let the player misdirect, avoid, bribe, deceive, or temporarily disable supporting systems where appropriate.
- [ ] Prevent secondary threats from chain-alerting the entire course without understandable propagation.
- [ ] Make storms, fog, wind, heat, frost, and darkness alter both danger and opportunity.
- [ ] Avoid hazards whose main function is to slow traversal without creating decisions.
- [ ] Make falling, drowning, electrocution, crushing, and machinery failures concise and readable if included.
- [ ] Ensure hazard resets do not require lengthy replay of unrelated stalking sections.
- [ ] Keep all hazards visually, acoustically, and mechanically consistent with the course and narrative.
- [ ] Make Joe remain the primary source of intentional predatory pressure.

## Safe Spaces and False Safety

- [ ] Give the player occasional spaces where they can breathe, inspect items, review clues, and plan.
- [ ] Make true safe-space rules consistent and narratively understandable.
- [ ] Avoid invisible arbitrary boundaries that make Joe stop at a doorway for no reason.
- [ ] Use locks, physical barriers, active policies, staffed areas, environmental conditions, or limited timing to justify safety.
- [ ] Let some safe spaces become compromised only after clear foreshadowing and a meaningful narrative change.
- [ ] Avoid breaking every safe room simply to surprise the player.
- [ ] Make false safety emerge from incomplete information, changed rules, or player assumptions rather than unavoidable scripted betrayal.
- [ ] Give the player a fair opportunity to notice when a familiar refuge is no longer secure.
- [ ] Prevent indefinite safe-space camping from solving time-sensitive objectives or Joe's wider control.
- [x] Avoid punishing players for pausing to read, configure settings, or manage accessibility needs.
- [ ] Place save opportunities and major planning interfaces in spaces that support their use.
- [ ] Use visual warmth, course ambience, music reduction, and physical enclosure to create genuine relief.
- [ ] Make leaving safety feel like a deliberate return to danger.
- [ ] Avoid placing unavoidable immediate pursuit directly outside every refuge.
- [ ] Make late-game safety scarcer or more conditional without removing all recovery rhythm.
- [ ] Use safe spaces to reveal character, story, course history, and changes in Joe's control.

## Objectives and Mission Design

- [ ] Make every primary objective directly reinforce horror, grass, golf, Joe, insurance, or the course's history.
- [ ] Give objectives clear immediate goals without revealing every future complication.
- [ ] Let players understand what an action will broadly accomplish before they commit.
- [ ] Use objectives such as retrieving a turf sample, completing a compromised hole, restoring irrigation, reaching a flagged green, appealing a denial, recovering evidence, or escaping a containment zone.
- [ ] Make objective interactions take enough time to create vulnerability without becoming repetitive progress bars.
- [ ] Allow the player to interrupt and resume long actions where the fiction supports it.
- [ ] Let players prepare escape routes, distractions, lighting, machinery, and hiding options before beginning major objectives.
- [ ] Give most major tasks multiple approach routes or solution combinations.
- [ ] Make optional objectives increase knowledge, resources, grass access, narrative context, or ending possibilities.
- [ ] Avoid optional objectives that are only arbitrary collectible counts.
- [ ] Make failed optional objectives alter the run in understandable ways rather than silently invalidating completion.
- [ ] Avoid objectives that depend on Joe being in one exact unsignaled location.
- [ ] Make dynamic objective changes readable when Joe issues a change request or redefines scope.
- [ ] Preserve completed work unless a reversal is a deliberate, foreshadowed horror event.
- [ ] Avoid repeatedly sending the player across the entire course without changed conditions.
- [ ] Make backtracking introduce new information, altered routes, changed weather, evidence, or Joe behavior.
- [ ] Give the player a useful objective summary after loading or returning from a break.
- [ ] Make the final step of an objective satisfying through sound, animation, environmental change, and consequence.
- [ ] Ensure objective markers support navigation without replacing observation.
- [ ] Test objectives in unexpected orders and under every Joe state.

## Systemic Encounters and Authored Set Pieces

- [ ] Build most tension from systemic interaction between Joe, terrain, sound, evidence, and objectives.
- [ ] Use authored set pieces to create memorable escalations that the systemic game cannot produce alone.
- [ ] Preserve player control during set pieces whenever possible.
- [ ] Avoid set pieces that fail the player for deviating slightly from one intended route.
- [ ] Give Joe's arrival a readable cause, cue, or narrative reason.
- [ ] Use distant cart lights, a status chime, a clipped radio transmission, a moving flag, or a changed project board to foreshadow danger.
- [ ] Make surprise appearances frightening without silently placing Joe inside the player's immediate escape path.
- [ ] Include encounters built around exposed shots, interrupted sampling, course shutdown, clubhouse lockdown, machinery activation, or forced rerouting.
- [ ] Vary encounters between stealth, observation, movement, golf execution, environmental manipulation, and pursuit.
- [ ] Avoid turning every climax into a chase sequence.
- [ ] Avoid repeating the same hide-wait-run structure without new decisions.
- [ ] Let player preparation materially improve authored encounters.
- [ ] Make set-piece rules consistent with the broader simulation.
- [ ] Avoid temporary cinematic rules that make learned tools stop working without explanation.
- [ ] Give the player enough space to recognize new threats before demanding perfect execution.
- [ ] Provide rapid restart near difficult authored sequences.
- [ ] Make encounter completion alter the environment or Joe's control in a memorable way.
- [ ] Ensure every major set piece serves the story, horror escalation, or mechanical progression.

## Pacing and Tension Curve

- [ ] Structure tension as a cycle of anticipation, evidence, proximity, suspicion, search, pursuit, escape, and relief.
- [ ] Avoid treating maximum intensity as the default state.
- [ ] Give the player quiet intervals long enough to think but short enough to preserve unease.
- [ ] Let environmental details and incomplete information carry tension during low-action periods.
- [ ] Make Joe's routines predictable enough to plan around but variable enough to prevent rote waiting.
- [ ] Avoid long mandatory waits for Joe to leave an area.
- [ ] Give patient players active observation, preparation, or alternate-route decisions while waiting.
- [ ] Escalate pressure when the player remains in one area too long only through readable systems.
- [ ] Avoid invisible anti-camping timers that force irrational movement.
- [ ] Use objective progress, course time, weather, project deadlines, and Joe's information to shape escalation.
- [ ] Make major chases followed by enough recovery that the next scare can land.
- [ ] Vary chapter length, objective density, interior exposure, and outdoor crossing demands.
- [ ] Avoid front-loading every frightening idea before the campaign has room to build.
- [ ] Introduce new Joe tactics one at a time before combining them.
- [ ] Use repeated locations only when their changed state creates new emotional meaning.
- [ ] Make the midpoint substantially reframe Joe, the project, the course, or the player's objective.
- [ ] Make the final act increase consequence and complexity without becoming constant noise.
- [ ] End scenes and chapters at emotionally clear points rather than immediately after arbitrary task completion.
- [ ] Test pacing with first-time players, cautious players, aggressive players, and players who become lost.
- [ ] Make the game frightening without demanding uninterrupted stress for its full runtime.

## Resources and Inventory

- [ ] Keep the resource set small enough that each item remains recognizable and strategically meaningful.
- [ ] Use resources such as golf balls, batteries, medical supplies, sample containers, keys, access cards, forms, tools, and limited defensive items only where needed.
- [ ] Make essential resources visible, identifiable, and reasonably recoverable.
- [ ] Avoid hiding critical resources in visually indistinguishable clutter.
- [ ] Balance scarcity so the player must plan without frequently entering hopeless states.
- [ ] Give low-resource players alternate routes, recovery opportunities, or less efficient solutions.
- [ ] Avoid making golf balls so scarce that the central mechanic becomes unusable.
- [ ] Avoid providing so many balls that shot placement and retrieval become meaningless.
- [ ] Make carrying capacity create decisions without turning inventory management into the main game.
- [ ] Let players quickly compare, equip, drop, combine, or use items.
- [ ] Avoid excessive item inspection animations during active danger.
- [ ] Clearly distinguish permanent tools, consumables, objective items, samples, and documents.
- [ ] Prevent the player from accidentally discarding or consuming progression-critical items.
- [ ] Make resource caches tell a story about golfers, staff, claimants, prior victims, or course operations.
- [ ] Avoid respawning resources in ways that make Joe farming or repetitive waiting optimal.
- [ ] Make difficulty settings adjust resource pressure without removing the need to engage with core systems.
- [ ] Preserve inventory and objective state reliably across saves and checkpoints.
- [ ] Give the player enough information to understand why an item cannot currently be used.

## Injury, Panic, and Recovery

- [ ] Make health or injury states understandable without requiring constant numerical attention.
- [ ] Give Joe's attacks, environmental hazards, falls, exhaustion, and panic distinct consequences where included.
- [ ] Avoid stacking so many impairments that the player cannot diagnose what is wrong.
- [ ] Make injury affect movement, aim, sound, perception, or interaction only in clearly communicated ways.
- [ ] Avoid excessive blur, chromatic aberration, camera shake, or muffling that makes survival inaccessible.
- [ ] Give the player meaningful recovery decisions involving time, location, noise, and limited supplies.
- [ ] Allow basic recovery before the player becomes trapped in an unwinnable pursuit state.
- [ ] Make severe injuries frightening without forcing long periods of frustratingly slow movement.
- [ ] Use panic or fear effects carefully so they communicate pressure without stealing control.
- [ ] Avoid random input errors, forced camera turns, or false commands as routine panic effects.
- [ ] Let safe spaces, familiar turf, recovered evidence, or completed objectives provide psychological relief where appropriate.
- [ ] Make recovery animations interruptible when reasonable.
- [ ] Ensure checkpoints never restore the player into immediate unavoidable capture while badly injured.
- [ ] Provide accessibility settings for injury visuals, breathing, heartbeat, camera instability, and panic effects.
- [ ] Test low-health completion paths for every required objective and chase.
- [ ] Make survival after injury feel tense and earned rather than merely inconvenient.

## Insurance and Corporate Satire as Horror

- [ ] Make the corporate satire intensify the horror by treating human danger as schedule, scope, cost, and exposure.
- [ ] Make Joe's professional language remain calm and internally logical while its consequences become increasingly threatening.
- [ ] Use action items, dashboards, scorecards, approvals, denials, audit trails, and performance metrics as physical parts of the world.
- [ ] Let benign project language acquire frightening meaning through repeated mechanical consequence.
- [ ] Make status meetings function as containment, surveillance, forced presence, or time pressure rather than ordinary dialogue scenes.
- [ ] Make risk ratings influence gates, cameras, staff behavior, lighting, course access, or Joe's search priority.
- [ ] Make coverage rules shape safe zones, available assistance, recovery, and route permissions.
- [ ] Let the player manipulate policy wording and project artifacts without requiring real-world legal expertise.
- [ ] Use plain-language mechanical explanations alongside satirical terminology.
- [ ] Avoid jokes that make the player unsure what a choice will actually do.
- [ ] Make executive decisions visible through abandoned facilities, dangerous maintenance, unrealistic deadlines, and altered turf.
- [ ] Show how metrics reward Joe for behavior that is disastrous for the player and the course.
- [ ] Let environmental signs, training videos, meeting notes, scorecards, and announcements contradict visible reality.
- [ ] Make the project's cheerful branding become more menacing without relying only on blood or visual corruption.
- [ ] Avoid treating harmed workers, claimants, or vulnerable people as the punchline.
- [ ] Direct satire toward institutional incentives, managerial abstraction, surveillance, denial, and dehumanization.
- [ ] Give recurring corporate phrases specific mechanical meaning so players learn to fear them.
- [ ] Avoid overloading every room with long joke documents.
- [ ] Keep optional writing concise, characterful, and connected to visible events.
- [ ] Make the insurance and project-management premise remain important through the ending rather than disappearing behind generic horror lore.

## Environmental Storytelling

- [ ] Tell the history of the course, project, and prior incidents through spaces, turf, machinery, records, and repeated routines.
- [ ] Use altered mowing patterns, repaired divots, abandoned carts, blocked paths, dead greens, and overwatered rough as narrative evidence.
- [ ] Use meeting rooms, claims files, calendars, risk boards, photographs, scorecards, and maintenance logs to reveal conflicting accounts.
- [ ] Make environmental evidence support deduction rather than existing only as decoration.
- [ ] Let the player compare official project language with the physical consequences it conceals.
- [ ] Use recurring locations to show Joe's expanding control or the project's deterioration.
- [ ] Make important story objects visually distinct without glowing unrealistically unless that is the chosen style.
- [ ] Avoid placing critical narrative information in easily missed tiny text alone.
- [ ] Provide transcripts, summaries, captions, or inspectable versions of important environmental content.
- [ ] Let sound, weather, plant condition, and course activity reveal changes before written explanation.
- [ ] Use distant figures, silhouettes, moved equipment, and altered flags to imply events without always showing them directly.
- [ ] Avoid environmental storytelling that requires external guides to understand the main plot.
- [ ] Make optional evidence deepen interpretation, character, and alternate outcomes.
- [ ] Ensure important evidence persists or can be reviewed after discovery.
- [ ] Let the player's own actions leave environmental history that can affect later areas.
- [ ] Use environmental continuity to make the world feel observed, managed, and remembered.

## Story and Worldbuilding

- [ ] Give the player a clear immediate reason to escape, hide, or resist Joe.
- [ ] Establish why the player is on the course and why grass and golf matter to their objective.
- [ ] Establish why Joe has authority, resources, access, and motivation to pursue the player.
- [ ] Decide whether Joe is human, altered, supernatural, institutional, or deliberately ambiguous, and keep his rules coherent.
- [ ] Preserve mystery without withholding every piece of actionable context.
- [ ] Give Joe a history, worldview, and relationship to the project beyond being a pursuer.
- [ ] Avoid explaining Joe so completely that he loses all menace.
- [ ] Make the course, insurance organization, project, and turf program feel like parts of one world.
- [ ] Give supporting characters clear relationships to Joe, the player, the course, and the institution.
- [ ] Keep mandatory story delivery compatible with tension and player control.
- [ ] Avoid lengthy unskippable exposition during active stalking or pursuit.
- [ ] Use brief calls, announcements, meetings, field notes, records, and environmental scenes to deliver essential context.
- [ ] Allow players to skip or accelerate previously viewed story scenes.
- [ ] Give the player meaningful choices about evidence, compliance, escape, exposure, and who benefits from the outcome.
- [ ] Make major choices alter later routes, Joe's behavior, available help, or the ending.
- [ ] Avoid false choices presented as large moral branches when they produce no meaningful difference.
- [ ] Make the player's relationship to grass evolve from curiosity or utility into deeper narrative significance.
- [ ] Make the ending resolve the central conflict with Joe and the project rather than only ending the final chase.
- [ ] Support ambiguity in the final interpretation while providing emotional closure.
- [ ] Keep tone consistent across horror, golf absurdity, grass obsession, and corporate satire.

## Campaign Structure

- [ ] Establish movement, observation, one grass interaction, one golf interaction, and Joe's basic threat early in the campaign.
- [ ] Avoid an opening so slow that players cannot understand the game's central promise.
- [ ] Introduce Joe first under controlled circumstances that allow the player to learn detection and escape rules.
- [ ] Give each chapter a distinct course, turf identity, weather pattern, architectural contrast, and Joe tactic.
- [ ] Escalate from local pursuit to broader course control, institutional containment, and personal confrontation.
- [ ] Introduce new mechanics gradually while continuing to reuse earlier mechanics in deeper combinations.
- [ ] Avoid abandoning the golf and grass systems after the opening chapters.
- [ ] Avoid padding the campaign with repeated courses, objectives, or chase sequences.
- [ ] Revisit locations only when Joe, the project, the weather, or the player's actions have meaningfully changed them.
- [ ] Give the campaign memorable openings, transitions, midpoint reversals, climaxes, and quiet aftermaths.
- [ ] Let optional evidence and grass discoveries influence interpretation or later opportunities without blocking ordinary progress.
- [ ] Make chapter endings provide short-term resolution while escalating the larger problem.
- [ ] Include at least one sequence where the player uses learned turf and golf systems against a major Joe operation.
- [ ] Make the penultimate chapter test planning, stealth, grass knowledge, golf execution, and insurance-rule manipulation together.
- [ ] Make the final chapter resolve both the physical pursuit and the institutional project.
- [ ] Avoid ending immediately after a quick-time event or conventional boss-health depletion.
- [ ] Allow completed chapters or courses to be replayed.
- [ ] Preserve discovered records, grass entries, accessibility settings, and completion data across chapter replay.
- [ ] Make the campaign length appropriate to the variety of systems and authored content.
- [ ] End before the core pursuit becomes mechanically exhausted.

## Progression and Unlocks

- [ ] Make progression expand knowledge, options, routes, and expressive play rather than primarily increasing numerical power.
- [ ] Unlock new clubs, shot techniques, grass uses, evidence tools, course access, and corporate loopholes at a readable pace.
- [ ] Give every major unlock an immediate situation that demonstrates its value.
- [ ] Keep early tools relevant through reliability, stealth, efficiency, or unique interactions.
- [ ] Avoid upgrades that make Joe unable to threaten the player.
- [ ] Avoid mandatory grinding for resources, samples, experience, or currency.
- [ ] Make optional mastery rewards useful without being required to balance the campaign.
- [ ] Let the player choose among distinct utility, stealth, golf, grass, observation, and recovery improvements where appropriate.
- [ ] Avoid upgrade trees filled with negligible percentage increases.
- [ ] Make major improvements visible in handling, animation, equipment, or available decisions.
- [ ] Allow respecialization or loadout changes when build choices could otherwise trap the player.
- [ ] Make Joe adapt to the player's expanded options through new procedures and combinations rather than simple immunity.
- [ ] Avoid making newly unlocked tools universal solutions to every previous problem.
- [ ] Give players reasons to revisit earlier techniques in later, more dangerous contexts.
- [ ] Clearly distinguish campaign-persistent unlocks from temporary chapter items.
- [ ] Prevent lost or missed optional unlocks from making later required sections unfair.
- [ ] Make knowledge of Joe and the courses the most important form of progression.
- [ ] Ensure progression supports horror rather than converting the late game into a power fantasy.

## Major Joe Confrontations

- [ ] Treat major Joe encounters as tests of observation, route planning, grass knowledge, golf tools, and corporate-rule manipulation.
- [ ] Avoid presenting Joe as a conventional boss with a large visible health bar unless the entire game supports that language.
- [ ] Give each major confrontation a distinct objective beyond merely surviving for a fixed duration.
- [ ] Make confrontation spaces readable enough to plan while remaining frightening.
- [ ] Let the player prepare resources, routes, machinery, balls, samples, and policy exploits beforehand.
- [ ] Make Joe introduce new combinations of learned tactics rather than unrelated one-off powers.
- [ ] Clearly communicate phase or rule changes through Joe, the environment, project systems, and audio.
- [ ] Avoid long periods where the player can only wait for a scripted vulnerability.
- [ ] Avoid instant failure for misunderstanding an entirely new rule once.
- [ ] Make temporary resistance, trapping, exposing, delaying, or escaping Joe require deliberate execution.
- [ ] Let alternate preparations or discoveries create different confrontation solutions.
- [ ] Preserve Joe's identity and menace even during large cinematic sequences.
- [ ] Avoid jokes, spectacle, or excessive action that make the confrontation emotionally weightless.
- [ ] Provide rapid retries near the start of difficult confrontation phases.
- [ ] Make the final confrontation resolve the project's rules and Joe's pursuit, not only his physical location.
- [ ] Make victory feel like escaping, exposing, redefining, or ending the system rather than simply dealing enough damage.

## Difficulty Design

- [ ] Make difficulty change Joe's perception, search persistence, route use, procedural tactics, objective pressure, and resource margins in understandable ways.
- [ ] Avoid making higher difficulty rely mainly on faster Joe movement or unavoidable damage.
- [ ] Preserve the same core detection and information rules on every difficulty.
- [ ] Keep Joe's impossible knowledge, teleportation, and perfect tracking out of higher difficulties.
- [ ] Make harder modes demand better observation, deception, routing, and shot commitment.
- [ ] Adjust grass evidence persistence, noise tolerance, camera coverage, policy pressure, and resource availability carefully.
- [ ] Preserve multiple viable approaches on every standard difficulty.
- [ ] Avoid making stealth, golf, grass collection, or corporate-rule play nonviable at high difficulty.
- [ ] Clearly describe what each difficulty changes.
- [ ] Allow difficulty changes during the campaign where appropriate.
- [ ] Provide granular custom options for Joe speed, perception, search duration, damage, resources, golf timing, objective timers, and clue visibility.
- [ ] Present assists as valid ways to tailor horror rather than lesser modes.
- [ ] Include optional challenge modes with limited saves, harsher evidence, altered routes, or smarter Joe behavior only when clearly labeled.
- [ ] Avoid random difficulty spikes caused by uncontrolled procedural placement.
- [ ] Test every objective, chase, confrontation, and checkpoint on every official difficulty.
- [ ] Make the highest difficulty demanding but consistently learnable.
- [ ] Ensure horror remains effective on easier modes through atmosphere and presence rather than punishment alone.
- [ ] Make difficulty selections reversible enough that players are not forced to abandon a campaign.

## Failure, Capture, Checkpoints, and Saving

- [ ] Place checkpoints before major irreversible commitments, long pursuits, and complex confrontations.
- [ ] Avoid checkpoints that restore the player inside Joe's confirmed line of sight or an unwinnable search state.
- [ ] Preserve enough resources after restart for the intended solution to remain possible.
- [ ] Avoid requiring the player to repeat long solved exploration sections after a difficult chase.
- [ ] Make restart and reload transitions fast.
- [ ] Clearly communicate when progress is saved.
- [ ] Save objectives, Joe-related world state, grass discoveries, inventory, machinery, routes, documents, and settings reliably.
- [ ] Decide which parts of Joe's current search state persist through manual saves and communicate the rule.
- [ ] Prevent saving from creating broken AI, duplicate items, missing objectives, or impossible doors.
- [ ] Avoid allowing save abuse to trivialize every moment unless unrestricted saving is an intentional accessibility choice.
- [ ] Provide manual saves, safe-room saves, checkpoint saves, or suspend saves appropriate to the intended structure.
- [ ] Make capture consequences clear before using permanent loss, changed routes, or narrative state.
- [ ] Avoid destroying large amounts of campaign progress as routine punishment.
- [ ] Give capture scenes enough variation and context to remain frightening.
- [ ] Allow capture and death sequences to be skipped after they have been seen.
- [ ] Protect save files from crashes, interrupted writes, updates, and cloud conflicts.
- [ ] Maintain backups or recovery paths where practical.
- [ ] Test save and load during every Joe state, objective state, interior transition, weather condition, and machinery interaction.
- [ ] Ensure chapter replay cannot corrupt the primary campaign state.
- [ ] Make failure encourage another plan rather than resignation.

## Visual Direction

- [ ] Create a coherent visual identity that combines lush golf beauty, unnatural turf control, insurance bureaucracy, and stalking horror.
- [ ] Make the course attractive enough that its emptiness and corruption feel disturbing.
- [ ] Use clean landscaping, cheerful signage, branded materials, and corporate order as sources of unease.
- [ ] Give Joe a strong silhouette readable across fairways, through fog, behind glass, and in dim interiors.
- [ ] Distinguish Joe from ordinary staff, mannequins, statues, course signs, and environmental figures without removing ambiguity at long range.
- [ ] Make grass types, footprints, divots, samples, hazards, balls, tools, cameras, and interactive machinery readable under pressure.
- [ ] Avoid relying on darkness alone to create horror.
- [ ] Preserve enough visibility for navigation, evidence reading, and fair detection rules.
- [ ] Use long sightlines to create distant uncertainty and short sightlines to create claustrophobic threat.
- [ ] Make player-relevant motion stand out from wind, rain, sprinklers, flags, trees, and ambient course activity.
- [ ] Avoid excessive particles, fog, bloom, chromatic aberration, or film effects that conceal Joe or critical evidence.
- [ ] Use color and contrast to separate safe, uncertain, controlled, contaminated, and actively threatened spaces without making the coding artificial.
- [ ] Make corporate branding evolve from reassuring to coercive through context rather than arbitrary visual corruption alone.
- [ ] Use scoreboards, project boards, flags, hole markers, claim signs, and tee information consistently.
- [ ] Make Joe's procedural control visible through changed signage, taped boundaries, updated maps, closed paths, and reassigned course equipment.
- [ ] Use gore, injury, or body horror only where it fits the intended tone and does not replace psychological and systemic horror.
- [ ] Provide reduced-gore and no-gore options if graphic content is included.
- [ ] Ensure important information never depends on blood, gore, or distressing imagery alone.
- [ ] Keep gameplay, menus, title presentation, cutscenes, documents, and promotional art stylistically coherent.
- [ ] Remove placeholder, mismatched, low-resolution, or visually contradictory assets before release.

## Lighting, Weather, and Time of Day

- [ ] Use dawn, midday glare, sunset, night, floodlights, moonlight, storm light, and interior fluorescents to create distinct horror conditions.
- [ ] Make every lighting condition preserve enough contrast for required navigation and stealth decisions.
- [ ] Let the player understand whether Joe can see them under the same lighting rules they experience.
- [ ] Use moving cart lights, maintenance lamps, phone screens, office windows, and security lights to reveal Joe before his body is visible.
- [ ] Make shadows useful but imperfect concealment.
- [ ] Avoid dynamic lighting changes that expose or hide the player without a readable cause.
- [ ] Let weather alter sound masking, footprints, ball behavior, grass movement, visibility, and route safety.
- [ ] Make rain erase some evidence while creating new mud, reflection, noise, and traction problems.
- [ ] Make fog reduce long-range certainty for both player and Joe rather than only handicapping the player.
- [ ] Make wind affect grass, flags, trees, sound, and ball flight consistently.
- [ ] Use lightning, power failures, and flickering lights sparingly and with photosensitivity safeguards.
- [ ] Avoid frequent darkness-to-flash transitions that make the game physically uncomfortable.
- [ ] Let players manipulate selected lights, breakers, blinds, or floodlights as tactical systems.
- [ ] Make Joe capable of restoring, disabling, or exploiting lighting in understandable ways.
- [ ] Clearly communicate time-of-day or weather changes that alter objectives and Joe's behavior.
- [ ] Test every required clue, path, shot, and threat under every supported weather and lighting configuration.
- [ ] Provide brightness, gamma, contrast, HDR, dark-area, and high-visibility calibration options.
- [ ] Make environmental beauty and horror reinforce one another rather than alternate as disconnected modes.

## Animation

- [ ] Make player movement, crouching, sprinting, hiding, sampling, swinging, carrying, interacting, and injury states responsive.
- [ ] Avoid animation locks that prevent the player from reacting to a reasonably perceived threat.
- [ ] Make golf setup and swing animation match the actual input and ball-contact timing.
- [ ] Make grass bend, part, recover, flatten, and reveal movement consistently enough to read.
- [ ] Give Joe distinct animations for monitoring, writing, checking devices, inspecting turf, listening, searching, pursuing, blocking, and capturing.
- [ ] Make Joe's calm work animations unsettling without becoming exaggerated comedy.
- [ ] Make Joe's transition from professional composure to active pursuit physically readable.
- [ ] Ensure Joe's footsteps, turns, reaches, grabs, door use, cart entry, and obstacle navigation match collision and timing.
- [ ] Avoid impossible turning or sliding that makes Joe's movement look unfair.
- [ ] Make capture attempts align with their actual range and counter window.
- [ ] Give Joe varied but recognizable search animations that reveal what information he is processing.
- [ ] Use distant animation silhouettes to communicate Joe's state without UI.
- [ ] Avoid overly long takedown, injury, item-use, or recovery sequences.
- [ ] Make machinery, gates, sprinklers, carts, doors, flags, and project systems animate their state changes clearly.
- [ ] Prevent animation blending from moving characters through walls, floors, furniture, or closed doors.
- [ ] Preserve animation timing and gameplay behavior at different frame rates.
- [ ] Provide reduced-motion alternatives for camera-heavy, capture, fall, or panic animations.
- [ ] Make major story and horror animations polished enough that they do not break tension.

## Sound Design

- [ ] Make spatial sound a primary way to locate, anticipate, and understand Joe.
- [ ] Give Joe a recognizable audio signature before he becomes visible.
- [ ] Use elements such as shoes or golf cleats, cart motors, keys, a clipboard, paper, a headset, a radio, notification tones, breath, and calm speech consistently.
- [ ] Give each Joe state a distinct but not overly explicit sound profile.
- [ ] Let the player distinguish Joe walking, waiting, inspecting, searching, pursuing, using a cart, and interacting with a nearby door.
- [ ] Avoid making Joe completely silent during unavoidable close approaches unless silence is a clearly established special behavior.
- [ ] Use occlusion, reverb, distance, elevation, indoor materials, outdoor openness, and weather to make sound spatially believable.
- [ ] Ensure walls, hills, doors, windows, tunnels, and vegetation affect sound consistently.
- [ ] Make grass rustle, footsteps, breath, clothing, club handling, sampling, doors, balls, and machinery communicate player noise.
- [ ] Give fairway, rough, green, sand, mud, gravel, water, wood, tile, metal, and carpet distinct movement sounds.
- [ ] Make golf-ball contact, flight, bounce, roll, cup entry, target strike, glass impact, and lost-ball states readable by sound.
- [ ] Let the player judge the approximate danger of a sound they create.
- [ ] Use sprinklers, wind, rain, mowers, public announcements, wildlife, pumps, and HVAC as masking layers and atmosphere.
- [ ] Avoid constant ambient noise that makes Joe impossible to hear.
- [ ] Make status chimes, calendar alerts, meeting calls, radio messages, and PA announcements increasingly threatening through context.
- [ ] Avoid overusing loud stingers for every sighting or surprise.
- [ ] Use silence deliberately before, during, and after important Joe encounters.
- [ ] Make close calls, lost line of sight, successful hiding, and pursuit escape clearly audible without celebratory game-show feedback.
- [ ] Allow independent control of music, Joe, dialogue, ambience, golf sounds, effects, interface, and dynamic range.
- [ ] Include sound-effect captions, directional indicators, speaker labels, and important environmental audio descriptions.
- [ ] Ensure critical detection information is available without audio alone.
- [ ] Test the mix on headphones, stereo speakers, television speakers, handheld devices, and reduced dynamic range.

## Music

- [ ] Use music sparingly enough that ambient sound and uncertainty can carry horror.
- [ ] Give Joe a recurring musical identity that can appear subtly before overt pursuit.
- [ ] Let the score respond to suspicion, search intensity, proximity, pursuit, escape, and false relief without revealing Joe's exact state automatically.
- [ ] Avoid starting full chase music before the player has any chance to perceive the danger.
- [ ] Avoid leaving chase music active after Joe has clearly lost the player.
- [ ] Use quiet golf-course, clubhouse, elevator, hold, training-video, and corporate music as unsettling thematic material.
- [ ] Let familiar pleasant motifs become distorted through arrangement, context, or instrumentation rather than simple volume escalation.
- [ ] Give major courses, turf programs, project phases, and confrontations distinct musical identities.
- [ ] Avoid tracks that become repetitive during prolonged exploration or repeated failures.
- [ ] Make transitions smooth enough that music does not expose technical state changes.
- [ ] Use silence after intense sequences to restore vulnerability and attention.
- [ ] Allow music to be reduced or disabled without losing essential gameplay information.
- [ ] Provide streamer-safe handling for licensed music if any is used.
- [ ] Make the final musical arc resolve the horror and corporate themes together.

## Interface and HUD

- [ ] Keep the HUD minimal enough to preserve immersion while showing essential health, items, objectives, and golf information.
- [ ] Avoid displaying Joe's exact position at all times.
- [ ] Show Joe's last known position, suspicion, or system alerts only when the player has an in-world source for that information.
- [ ] Make current objective, required item, ball count, selected club, injury, and sample status readable at a glance.
- [x] Show the currently implemented shot power, aim, trajectory, landing distance, and target information only while aiming or while the ball is airborne.
- [ ] Avoid keeping large sports-game overlays on screen during stalking and exploration.
- [ ] Use scorecards, project boards, phones, field guides, policy folders, maps, and course signs as diegetic interface where practical.
- [ ] Make diegetic interfaces readable and accessible without requiring tiny in-world text.
- [ ] Provide optional conventional overlays for players who need them.
- [ ] Make corporate terminology visually secondary to plain mechanical meaning.
- [ ] Clearly communicate action progress, interruption risk, blocked reasons, costs, and consequences.
- [ ] Avoid opening complex menus automatically while Joe is nearby.
- [ ] Allow inventory, map, field guide, objectives, and records to pause single-player play where appropriate.
- [ ] Make menus responsive to mouse, keyboard, controller, and touch where supported.
- [ ] Include HUD scale, opacity, subtitle, reticle, interaction-highlight, and visibility options.
- [ ] Avoid excessive screen-edge blood, static, vignette, blur, or chromatic effects.
- [ ] Make low-health, active pursuit, coverage loss, and objective failure noticeable without obscuring the course.
- [ ] Ensure every interface value and preview matches authoritative game state.
- [ ] Prevent accidental deletion, use, denial, reset, or commitment of important items and choices.
- [x] Make restart, settings, and return-to-menu actions quick to reach from the pause layer. Checkpoint loading remains future work.

## Map, Course Reading, and Navigation

- [ ] Make the course learnable through landmarks, hole numbers, flags, terrain, buildings, cart paths, signs, and elevation.
- [ ] Provide a scorecard, yardage book, project map, course plan, or comparable navigation tool that fits the fiction.
- [ ] Clearly distinguish explored, unknown, blocked, hazardous, compromised, and completed areas.
- [ ] Avoid showing live Joe tracking unless the player has temporarily obtained a valid source.
- [ ] Let the player mark sightings, samples, hiding places, machinery, locked routes, hazards, and planned shots.
- [ ] Make indoor and outdoor maps connect clearly.
- [ ] Distinguish vertical levels, tunnels, rooftops, basements, and service routes.
- [ ] Avoid map overlap and icon density that obscure useful information.
- [ ] Make policy boundaries, scope changes, closed routes, and objective updates appear on the map when the player learns them.
- [ ] Let Joe corrupt, confiscate, update, or invalidate parts of the map only with clear narrative and mechanical support.
- [ ] Avoid requiring constant map use to traverse basic routes.
- [ ] Use lighting, sound, flags, course architecture, turf condition, and distant landmarks for natural guidance.
- [ ] Give objective markers adjustable detail, distance, and visibility.
- [ ] Avoid markers that reveal every puzzle solution, grass sample, or safe route by default.
- [ ] Allow the player to review the map while paused for accessibility.
- [ ] Preserve custom markers and discovered information across saves.
- [ ] Make getting briefly disoriented tense; avoid making prolonged confusion a recurring challenge.
- [ ] Test navigation without objective markers and with reduced visual detail.

## Tutorials and Onboarding

- [ ] Teach movement, observation, sound, concealment, grass evidence, and golf interaction through immediate play.
- [ ] Introduce one major system at a time before combining it with active pursuit.
- [ ] Let the player safely observe an example of Joe's detection logic before severe consequences.
- [ ] Teach the difference between suspicion, investigation, search, and pursuit through controlled situations.
- [ ] Demonstrate how a golf ball can distract Joe before requiring it under pressure; the briefing currently explains and illustrates the shot, but does not stage a live Joe reaction.
- [ ] Demonstrate how grass conceals, records, or reveals movement before making it essential.
- [ ] Teach the player to read course landmarks, wind, lies, and environmental systems.
- [ ] Explain insurance and project-management mechanics using exact plain-language outcomes.
- [ ] Keep tutorials concise, interactive, and compatible with the horror tone.
- [ ] Avoid large text boxes during moments when the player should be listening for Joe.
- [ ] Pause or protect the player while reading unavoidable tutorial information.
- [ ] Allow tutorials to be skipped, revisited, or reset individually.
- [ ] Provide contextual reminders after repeated failures without repeatedly interrupting skilled players.
- [ ] Introduce advanced golf shots, trail manipulation, policy exploits, and machinery through optional practice or low-risk situations.
- [ ] Make the opening representative of the full game's horror, grass, golf, and Joe premise.
- [ ] Avoid withholding the central pursuit for so long that players misread the genre.
- [ ] Make the first successful escape from Joe teach the full tension-and-recovery loop.
- [ ] Test onboarding with players unfamiliar with golf, stealth games, insurance, and project-management terminology.

## Replayability and Optional Challenges

- [ ] Make replayability come from alternate routes, objective orders, grass discoveries, equipment choices, Joe responses, and narrative decisions.
- [ ] Preserve authored course identity while allowing selected variation in resources, evidence, weather, route access, and Joe routines.
- [ ] Avoid uncontrolled randomization that places Joe or objectives unfairly.
- [x] Use seeded or curated variants where reproducibility benefits challenge and learning; Hole 1 now rotates three deterministic Night Orders.
- [ ] Let experienced players skip or accelerate introductory sequences.
- [ ] Support chapter, course, confrontation, or challenge replay after completion.
- [ ] Include optional modes such as no-capture, limited-ball, no-map, perfect-sample, par escape, speedrun, or heightened-audit challenges where appropriate.
- [ ] Make challenge rules create new decisions rather than only removing resources.
- [ ] Avoid achievements that require excessive hiding, waiting, repetitive collection, or random Joe behavior.
- [ ] Reward alternate approaches, clean escapes, rare discoveries, clever distractions, minimal evidence, and successful policy exploits.
- [ ] Support multiple endings only when choices and discoveries meaningfully lead to them.
- [ ] Track personal bests, chapter completion, samples, evidence, captures, shots, and route outcomes without turning horror into constant score optimization.
- [ ] Allow completion data and statistics to be hidden for players who prefer immersion.
- [ ] Support speedrunning through consistent AI, physics, transitions, and skippable scenes.
- [ ] Avoid mandatory online connectivity for single-player progression or replay.
- [ ] Make replay reveal new systemic possibilities rather than relying only on collectible cleanup.

## Accessibility and Configuration

- [ ] Support full control remapping for keyboard, mouse, controller, and other intended devices.
- [ ] Provide toggle and hold options for crouch, sprint, aim, interact, hide, focus, and other sustained actions.
- [ ] Avoid requiring rapid repeated input for golf, escape, resistance, doors, or objective interactions.
- [ ] Provide alternatives to button mashing and precision timing.
- [ ] Include adjustable golf timing windows, trajectory assistance, aim stabilization, and shot-preview detail.
- [ ] Include adjustable Joe movement speed, perception, search duration, damage, capture tolerance, and pursuit intensity.
- [ ] Include stealth assists such as clearer evidence, stronger state cues, slower suspicion, or more forgiving line-of-sight breaks.
- [x] Allow players to pause during single-player stalking, pursuits, and timed objectives.
- [ ] Support subtitle size, background, color, speaker names, placement, and sound-effect captions.
- [ ] Provide directional visual indicators for important Joe, machinery, alarm, and ball sounds.
- [ ] Avoid communicating turf type, danger, policy state, evidence, or objectives through color alone.
- [ ] Include color-vision modes, high-contrast interactables, evidence highlighting, and adjustable outline strength.
- [ ] Include reduced flashing, reduced screen shake, reduced head bob, reduced blur, reduced sway, reduced camera tilt, and reduced motion options.
- [ ] Allow panic, injury, heartbeat, breathing, tunnel vision, static, and vignette effects to be adjusted independently.
- [ ] Include brightness, gamma, contrast, dark-area, fog, and flashlight accessibility controls without eliminating intended rules.
- [ ] Provide adjustable field of view, sensitivity, acceleration, smoothing, dead zones, and response curves.
- [ ] Support readable fonts, interface scaling, text-to-speech or narration where practical, and plain-language mechanic descriptions.
- [ ] Make documents, scorecards, policy text, project boards, and field-guide entries readable outside the 3D world.
- [ ] Include content settings for gore, body horror, intense capture scenes, loud stingers, and distressing audio where appropriate.
- [ ] Present accessibility and difficulty customization as valid player choices.
- [ ] Save all accessibility settings globally and apply them before the first intense sequence.
- [ ] Test accessibility features during real Joe encounters rather than only in menus.

## Performance and Technical Reliability

- [ ] Prioritize stable frame rate and low input latency during stalking, golf shots, machinery activity, and pursuit.
- [ ] Preserve Joe's AI, perception, pathfinding, animation, and collision behavior across supported frame rates.
- [ ] Preserve golf-ball physics and turf interactions across supported frame rates.
- [ ] Optimize large outdoor sightlines, dense grass, wind animation, shadows, fog, reflections, sprinklers, and weather.
- [ ] Keep grass visually responsive without simulating every blade unnecessarily.
- [ ] Prevent stutter when Joe enters an area, changes state, opens a route, starts a cart, or triggers a set piece.
- [ ] Avoid shader-compilation stutter during first encounters or major scares.
- [ ] Optimize interior-to-exterior transitions and large course streaming.
- [ ] Preserve critical evidence, Joe silhouettes, project markers, and interactive objects at lower settings.
- [ ] Support scalable grass density without changing mechanical concealment rules unpredictably.
- [ ] Support common resolutions, aspect ratios, ultrawide displays, high-refresh monitors, handhelds, and target consoles where intended.
- [ ] Keep loading, checkpoint restart, chapter transition, and suspend/resume times short.
- [ ] Prevent long sessions from degrading AI, audio, physics, memory, or save reliability.
- [ ] Ensure weather, footprints, divots, grass disturbance, and evidence persistence remain bounded.
- [ ] Prevent Joe from becoming stuck, inactive, duplicated, unloaded incorrectly, or permanently separated from the objective space.
- [ ] Prevent balls, samples, tools, doors, carts, and machinery from entering invalid states.
- [ ] Handle focus loss, controller disconnect, suspension, and device interruption safely.
- [ ] Test the most demanding chase and weather combinations rather than relying on empty-course benchmarks.

## Testing and Balance

- [ ] Test Joe's detection from every relevant terrain, light, weather, height, doorway, window, and concealment condition.
- [ ] Test that Joe never sees through solid geometry without an explicitly supported system.
- [ ] Test every sound source for radius, occlusion, investigation behavior, and false-positive risk.
- [ ] Test every Joe state transition, memory rule, search duration, cooldown, and return to routine.
- [x] Test repeated distractions to ensure Joe adapts without becoming omniscient.
- [ ] Test every hiding location for entry, exit, visibility, sound, search behavior, and exploit potential.
- [ ] Test every pursuit route for collision traps, impossible turns, chain captures, camera problems, and unfair re-entry.
- [ ] Test Joe's pathfinding across fairways, rough, bunkers, bridges, stairs, doors, interiors, carts, and moving machinery.
- [ ] Test golf shots with every club, lie, wind, surface, target, frame rate, and supported input method.
- [ ] Test ball recovery and puzzle reset behavior after every plausible bad landing.
- [ ] Test grass concealment, evidence, tracks, weather response, sample collection, and field-guide state on every quality setting.
- [ ] Test objectives in unexpected orders and while Joe is absent, investigating, searching, pursuing, or interacting with the same system.
- [ ] Test machinery combinations, power changes, doors, cameras, lights, sprinklers, gates, and carts for soft locks.
- [ ] Test low-resource, injured, ball-limited, and missed-upgrade states for every required sequence.
- [ ] Test checkpoints to ensure the player never reloads into unavoidable capture or an impossible objective state.
- [ ] Test all capture scenes, skips, retries, chapter transitions, saves, loads, and cloud conflicts.
- [ ] Test every insurance and project-management mechanic for clear warning, exact consequence, and valid counterplay.
- [ ] Test whether satirical terminology obscures decisions for players unfamiliar with the domain.
- [ ] Test pacing with players who hide extensively, move aggressively, explore everything, miss clues, and repeatedly fail.
- [ ] Test first-time players who do not understand golf terminology.
- [ ] Test horror readability with music off, low audio, mono audio, captions, color-vision modes, reduced motion, and high-contrast settings.
- [ ] Test Joe at every official difficulty and every exposed custom setting combination.
- [ ] Test navigation without objective markers and with incomplete map information.
- [ ] Test all optional grass, evidence, endings, challenges, achievements, and completion records.
- [ ] Test speedrunning and sequence breaks without automatically treating creative routes as bugs.
- [ ] Fix soft locks, invalid saves, out-of-bounds routes, unreachable objectives, stuck Joe states, broken balls, and contradictory previews before release.
- [ ] Validate the complete game on physical target devices, not only editor and desktop simulations.

## Production Readiness

- [ ] Make the complete campaign playable from opening through ending with no placeholder chapters, courses, objectives, or confrontations.
- [ ] Ensure Joe has complete models, materials, animations, voice, sound, AI states, interactions, captures, and narrative presentation.
- [ ] Ensure every course has final terrain, grass, lighting, weather, collision, landmarks, routes, machinery, objectives, audio, and optimization.
- [ ] Ensure every club, ball, sample tool, defensive item, and interactable has complete behavior, feedback, descriptions, and accessibility support.
- [ ] Remove placeholder art, temporary audio, debug text, test markers, unreachable rooms, and developer-only controls.
- [ ] Make title screen, settings, accessibility setup, chapter transitions, pause menus, saves, loading, credits, endings, and post-game presentation complete.
- [ ] Ensure all mandatory story, document, subtitle, field-guide, policy, and project text is edited and consistent.
- [ ] Make every critical choice and mechanical preview match actual game behavior.
- [ ] Ensure the game remains stable through long sessions, repeated deaths, rapid reloads, chapter replay, and unusual sequence orders.
- [ ] Verify all supported resolutions, inputs, graphics settings, audio settings, difficulty settings, and accessibility combinations.
- [ ] Make loading, saving, restarting, pausing, and resuming fast and reliable.
- [ ] Make all required horror cues available through more than one sensory channel where practical.
- [ ] Ensure the final build contains no progression blockers, corruptible required items, impossible ball states, or unrecoverable Joe AI failures.
- [ ] Complete physical-device performance, input-feel, readability, audio, and accessibility sign-off.
- [ ] Make the final game frightening, coherent, readable, fair, memorable, feature-complete, production-ready, and highly polished.

## Deliberate Non-Goals and Guardrails

- [ ] Do not design the game as a conventional golf simulation with occasional chase sequences.
- [ ] Do not design the game as a shooter, brawler, or power fantasy in which Joe becomes routine combat fodder.
- [ ] Do not make Joe a harmless meme, mascot, or constant source of comic relief.
- [ ] Do not make Joe omniscient, randomly teleporting, or unfair solely to preserve difficulty.
- [ ] Do not make active pursuit constant; stalking, uncertainty, planning, and silence are essential.
- [ ] Do not make every objective a full golf hole or require tournament-style scoring.
- [ ] Do not make golf a disconnected minigame that pauses the horror and ignores Joe.
- [ ] Do not make grass a cosmetic backdrop, generic currency, or checklist of nearly identical pickups.
- [ ] Do not require the player to examine every blade, repair every footprint, or collect every sample for ordinary completion.
- [ ] Do not turn turf management into an unrelated farming or economy simulator.
- [ ] Do not turn insurance and project management into dense realistic paperwork or professional training software.
- [ ] Do not let corporate jokes obscure rules, risks, objectives, or consequences.
- [ ] Do not use harmed workers, claimants, or vulnerable people as the target of the satire.
- [ ] Do not rely only on darkness, loud stingers, gore, or scripted jump scares to create fear.
- [ ] Do not use lengthy unskippable cutscenes or forced walking sections to deliver ordinary story information.
- [ ] Do not add crafting, loot rarity, skill trees, currencies, multiplayer, modding, or live-service systems unless they demonstrably strengthen the core horror loop.
- [ ] Do not require grinding, daily engagement, artificial wait timers, paid power, loot boxes, or fear-of-missing-out systems.
- [ ] Do not prioritize backend architecture, creator tooling, analytics, or speculative extensibility over the quality of the playable campaign.
- [ ] Do not claim an item is complete until its player-facing behavior has been tested in the actual game.
- [ ] Keep the final design centered on one promise: **the player must cross beautiful, uncanny grass and use golf intelligently while insurance product owner Joe hunts them.**
