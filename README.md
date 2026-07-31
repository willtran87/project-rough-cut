# Rough Cut

Working directory for a first-person 2.5D pixel-horror game about Joe, a software Product Owner employed by an insurance company—not an adjuster—whose obsession with grass, golf, prioritized backlogs, and measurable outcomes turns one final after-hours action item into a lethal course-optimization exercise.

**Play the current vertical slice:** [willtran87.github.io/project-rough-cut](https://willtran87.github.io/project-rough-cut/)

> The course closes at dusk. Joe does not.

## Premise: One Last Action Item

At **5:47 PM on release night**, the player—an associate product analyst on Joe's insurance-software team—receives a final assignment. Joe wants a signed **Night Order** carried through the insurer's executive golf course to the maintenance office on the far side. He calls it a quick handoff before the morning release.

The south service gate locks as soon as the player enters. Their phone shows the action item already marked **DONE**, and Joe's live project board has reclassified them as an **unplanned dependency**. Returning the way they came is impossible. The only exits are the maintenance shed and an old drainage culvert, both beyond the length of the course.

The course is not merely Joe's hobby. The insurer uses it to test turf sensors, automated irrigation, lighting, access controls, and terrain-risk telemetry. As the pilot's Product Owner, Joe controls the Night Orders governing those systems. His idea of final acceptance is to prove the course can identify, track, and contain a moving risk—and the player is his last test scenario.

To escape, the player must cross the course, recover a shed key or release the drainage system, and survive Joe's pursuit. Optional Unfiled Change Requests reveal that Joe knew the pilot was unsafe. Carrying them out turns survival into evidence: escape gets the player home, while filing all three dossiers can expose what Joe built and why the incident was planned.

## Current playable slice

The browser build includes:

- An original grass-and-weed-whacker horror-comedy opening.
- Keyboard, pointer, standard gamepad, and complete multi-touch support with automatic prompt switching, plus persistent conflict-safe keyboard remapping.
- A 720-unit, eight-zone course with distinct suspense pacing across The Tee, Audit Row, Water Hazard, Clubhouse Crossing, Service Maze, The Dead Green, Night Range, and Release Corridor.
- A true second act beyond the former finish: The Dead Green is now a false finish, Night Range forces a choice between floodlit crossfire and abandoned-cart cover, and Release Corridor compresses the final escape into alternating hedge, stone, and service-lane chicanes.
- Three optional Sprint Review gates create a longer risk/reward arc, while 59 grounded collision obstacles, 24 non-blocking clutter placements, eight wet-turf regions, and an extended Joe patrol keep the added distance authored rather than empty.
- Three curated, rotating Night Orders that relocate both objectives and change Joe's opening patrol without sacrificing authored route readability.
- One authored Unfiled Change Request per Night Order: secure the risky optional document, escape alive, and bank a +650 score bonus with persistent 3-order filing progress.
- Two complete escape routes through the maintenance shed or drainage culvert, each ending in a vulnerable Final Filing commitment, a route-colored release seal, and a clean handoff into the scorecard.
- Two optional Sprint Review gates in the extended back nine: crossing their exposed amber rings restores a golf ball when space is available and shortens Final Filing, but the review bell redirects Joe toward the gate.
- Precise stepped collision with object-specific authored ellipse footprints, contact callouts, guaranteed escape movement, hard cover, partial rough concealment, floodlight exposure, and recoverable pursuit.
- Image-generated key, sprinkler, Change Request, and recoverable-ball props grounded directly into the world with distance labels, projected use-range rings, explicit in-reach states, and matching mini-map symbols.
- First-person route communication through an obstacle-aware ground ribbon, four variants of image-generated fairway lanterns with projected amber light pools, physical zone signs, proximity blocker labels, and a compact left/ahead/right field bearing integrated into the course map.
- Input-responsive lateral camera movement that translates the entire world viewport opposite a left/right strafe, adds a restrained counter-lean and near-ground speed accents, and drives the sky, horizon, course, obstacles, and foreground at distinct parallax strengths while the HUD stays fixed.
- Momentum-driven panic locomotion: ordinary running builds into a weighted stride with shoulder sway, footfall impact, exertion heartbeat, forward surge, tunnel pressure, and peripheral grass rush; sprinting and Joe's threat pressure continuously intensify the same response instead of switching to a disconnected effect. Reduced Camera Motion preserves pace and audio while suppressing bob, roll, surge, and streaks.
- Surface-reactive locomotion grounds every step in the course: fairway turf compresses and sheds dew, rough blades bend outward, soaked ground ripples and scatters cold highlights, and bunker sand scuffs with granular displacement. The bounded world-space responses inherit course perspective, fade behind the player, scale down with the effects tier, and become static fading imprints under Reduced Camera Motion. Nearby generated verge plants also bend away from the player or Joe's mower pressure.
- A frame-budgeted renderer capped at 60 Hz on high-refresh displays, with presentation-tolerant scheduling, cached screen treatment and atlas cells, pooled depth-sorted entities, compact offscreen map rendering, and adaptive fog/particle/clutter density that reacts to real presented-frame stalls while preserving collision landmarks and interactables. Automatic quality recovery is capped at the stable balanced tier, and Joe's persistent mower scars use reusable freshness/variation stamps instead of rebuilding dozens of canvas paths per mark.
- Layered pursuit atmosphere including mower shockwaves, cold breath, spectral course silhouettes, independently failing Night Range floodlights, a diegetic Release beacon, and directional threat refraction.
- A persistent course mini-map with the same player-inflated ellipse footprints used by world collision—including hidden tunnel and shed-wall sides—plus interaction ranges, maintained-course limits, and active-contact highlighting.
- Dedicated image-generated maintenance shed, hedge hide, stone cover, and grounds-cart landmarks, alpha-cropped and projected so their visible ground contact matches the footprints used for collision and line-of-sight cover.
- A fully decomposed ten-plane living horizon: an alpha-cut golf-course foreground sits over a moonless star field, with the independent moon, eleven clouds at staggered depths, a far ridge, a dedicated image-generated estate perimeter, distant villas, clubhouse, tree line, near-canopy framing, and multiple fog bands. Lateral response rises from 0.02× on the moon to 0.58× on the course surface, while forward travel independently changes scale and vertical placement. Persistent ground fog uses distinct course-zone palettes, grows subtly denser under Joe's threat pressure, and freezes rather than disappearing under Reduced Camera Motion.
- Dedicated image-generated signage and a five-variant bunker atlas grounded into the same projected positions, interaction routes, and sand zones used by gameplay, with irregular sod lips, footprints, rake stories, wet pooling, edge vegetation, and drifting sand detail.
- A dedicated six-cell course-clutter atlas adds mossy yardage stones, abandoned golf bags, coiled irrigation hose, spilled range balls, rusted mower tools, and damp clipping piles along the course margins without creating dishonest collision.
- A dedicated six-variant ornamental-verge atlas adds dew-heavy fescue, pond reeds, ferns, pale wildflowers, sculpted juniper, and withered rough across 28 depth-sorted course placements. Contact shadows, restrained dew glints, zone-specific planting, and base-anchored micro-sway make the course feel cultivated and haunted without inventing hidden collision; Reduced Camera Motion freezes the ambient sway and the adaptive low tier safely thins only this decorative layer.
- Listening Focus for mower direction, cover proximity, landmarks, environmental awareness, and recent mower-cut forensics. Cuts within 120 meters remain readable for 28 seconds as fresh, warm, or fading clues with age and Joe’s historical travel heading. Holding Focus on an unlogged cut for 0.55 seconds commits a Cut Trace, preserving its heading in the world and mini-map for six seconds after release. Moving 12 meters against that heading before it fades earns a capped Counter-Route Delivery beat and 3.2 seconds of quieter footing; each cut can be logged only once and active pursuit disables the payoff.
- A pressure-driven golf chip: hold to charge, steer the landing point, misdirect Joe on impact, then risk reclaiming the persistent ball while he investigates.
- Persistent mower-cut strips that trade rough concealment for quieter footing, decaying bent-grass player trails, and lasting golf-ball divots. Joe's wake is rendered as layered, bruised course scars with crushed dark turf, broken mower grooves, wet edge clippings, and a restrained moonlit sheen that decays with freshness instead of bright arcade streaks. Observant players can reconstruct his recent route, while Joe reads the player’s trail one physical print at a time and builds a paced Trail Chain. Breaking a ×3-or-deeper chain outside pursuit triggers an Evidence Denied recovery beat, cools Joe’s attention, and rewards the route change; fairway and cut turf are the readable counterplay.
- A capped world-space mower-effects system: Joe throws spinning grass shavings with gravity, drag, landing, and camera parallax; soaked turf produces heavy wet clumps, bunkers produce grit, close cover can throw sparks, and pursuit pushes debris toward the camera.
- Gameplay-linked horror atmosphere including Joe's moving moon shadow, mower-driven fog shear, reactive floodlight moths, grass dust, near-camera debris, and reduced-motion-aware effect density.
- Six temporary sprinkler soak zones that create quieter routes, stronger wet footprints, and mower-bog opportunities against Joe.
- Five permanent bunker-sand hazards that slow both the player and Joe's mower, preserve loud tracks, and reward successful mower baiting.
- A sight-and-sound attention meter, explicit contact-break progress, and a capped Risk Premium that makes closer pursuit escapes worth more without increasing the existing maximum recovery score. Breaking a chase after a Close or Razor Cut now grants a brief Second Wind pace burst, turning a dangerous recovery into an immediate movement payoff.
- Priority-based field presentation keeps high-event moments readable: active pursuit consolidates Joe's direction, contact source, escape instruction, break progress, and live Risk preview into one chase card; Risk Premium then owns the recovery beat, Delivery waits in sequence, ambient Joe banners and bark yield, and cover instructions return after the rewards clear.
- Blindside Transfers turn quiet observation into active stealth play: leave hard cover or crouched rough while Joe is moving away, cross at least 14 meters, and reach different shelter inside a 5.5-second window. Success earns a capped Delivery beat; facing Joe, pursuit, timeout, or returning to the same shelter cannot score.
- A 14-second Delivery Chain that rewards linking smart plays—course progress, risky ball recoveries, bunker baits, optional paperwork, contact breaks, and capped Evidence Denied recoveries—without changing survival difficulty.
- A live letter-only File Projection that reacts to time, attention, resources, optional filings, and recovery plays without exposing exact score optimization during the chase.
- Obstacle-aware Joe navigation with patrol, investigate, search, and chase animation.
- Joe-specific character writing throughout the pursuit, with 2,354 capture outcomes, 240 state barks, and 324 situation-specific reactions (2,918 total dialogue variants) paired with six expression portraits on the Sprint Terminated screen. Sixteen capture themes now range from Agile delivery and product discovery to insurance-software risk, release governance, telemetry, golf, and obsessive turf operations. Joe also reacts directly to Change Requests, Sprint Reviews, recovered balls, Cut Traces, Counter-Routes, and Blindside Transfers. Rolling repeat protection keeps recent captures and barks out of rotation; all dialogue remains subtitle-only.
- A movement-aware adaptive HUD: the full field briefing remains visible long enough to establish the route, then collapses shortly after the player demonstrates 18 meters of movement. The compact view preserves the objective, threat state, map, route ribbon, and controls reminder; the full briefing can still be recalled with the configured keyboard key (H by default), Y on gamepad, or Listening Focus.
- A true pause layer with resume, how-to/settings, restart, and clubhouse actions.
- A persistent five-channel audio mix plus scalable dialogue subtitles, adjustable caption backdrops, directional threat captions, and reduced-camera-motion preferences.
- A post-run course scorecard with S–D risk grades, banked Risk Premium and Razor Cut recognition, route-specific personal records, an instant targeted rematch, direct next-order play, and a Clubhouse return.
- A persistent Course Echo that replays the best compatible route as spectral world tracks and a live mini-map rival, with ahead/behind pacing on repeat attempts.
- A persistent player file tracking rounds started, escapes, captures, and the best shed or drain performance.
- Persistent Night Order completion tracking that turns the three-layout rotation into a compact mastery loop.
- A post-mastery Night Order Portfolio: file all three optional Change Requests to permanently select any authored order for deliberate record and Course Echo rematches.
- Twelve persistent Performance Stamps across the three dossiers—Clean File, Field Recovery, Bunker Clause, and Echo Breaker—reward distinct escape styles and culminate in a gold Master Product Owner presentation.
- An unlockable Overtime Audit contract after all three Night Orders: fewer balls, faster pursuit, stronger evidence, a 1.30× score premium, and a separate persistent record.
- A four-zone reactive horror score that moves from low sub-dread through dissonant search pulses to a pursuit ostinato while preserving spatial mower readability.
- Reactive mower audio, footsteps, heartbeat, environmental effects, and animated victory/capture presentation.

Run it locally from the project root:

```powershell
python -m http.server 4187 --directory web
```

Then open `http://127.0.0.1:4187/`.

During Hole 1, press Escape or Start—or click the pause control—to suspend the pursuit without losing progress.

## Project documentation

Open `docs/Rough_Cut_Game_Blueprint.docx`. It contains the game vision, Joe's canonical backstory, design pillars, core loop, behavior model, nine-hole progression, vertical-slice scope, art and audio direction, production plan, and title alternatives.

The playable Godot opening prototype is in `game/`. See `game/README.md` for run instructions, the cutscene timeline, menu controls, and the first-hole handoff.

The immediately playable browser version is in `web/`. It reproduces the animated opening, synthesized mower audio, on-screen “Here's Joey!” beat, functional menus, accessibility settings, and first-hole handoff without requiring Godot.

## Directory map

- `assets/characters/joe/` - Joe's current source art, animation sheets, frames, previews, and metadata.
- `assets/environment/` - Course textures, foliage, generated landmark kits, props, terrain, structures, and environmental effects.
- `assets/audio/` - Mower states, course ambience, PA announcements, UI, and scare cues.
- `design/` - Future mechanics specifications, level plans, narrative notes, and tuning data.
- `docs/` - Project-facing documents.
- `game/` - Engine project and runtime source.
- `builds/` - Local packaged builds.
- `qa/` - Review output, test notes, and document render checks.
- `tools/` - Project-local content and pipeline utilities.
- `web/` - Static production slice deployed to GitHub Pages.
- `gh-pages` branch - Published static snapshot of the `web/` build.

## Recommended first milestone

Build a single 10-15 minute course hole with one fairway, one rough area, a bunker, a pond, a maintenance shed, throwable golf balls, one sprinkler control, persistent mowing, and Joe's mowing, listening, investigating, and charging states.

## Working title

**Rough Cut: A Joe Horror Game**

Tagline: **The course closes at dusk. Joe does not.**
