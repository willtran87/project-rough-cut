# Rough Cut

Working directory for a first-person 2.5D pixel-horror game about Joe, a product owner at an insurance company whose obsession with grass, golf, and measurable outcomes turns an after-hours company outing into a lethal course-optimization exercise.

**Play the current vertical slice:** [willtran87.github.io/project-rough-cut](https://willtran87.github.io/project-rough-cut/)

> The course closes at dusk. Joe does not.

## Current playable slice

The browser build includes:

- An original grass-and-weed-whacker horror-comedy opening.
- Keyboard, pointer, standard gamepad, and complete multi-touch support with automatic prompt switching.
- A 360-unit, four-zone course with distinct suspense pacing and readable landmarks.
- Three curated, rotating Night Orders that relocate both objectives and change Joe's opening patrol without sacrificing authored route readability.
- One authored Unfiled Change Request per Night Order: secure the risky optional document, escape alive, and bank a +650 score bonus with persistent 3-order filing progress.
- Two complete escape routes through the maintenance shed or drainage culvert.
- Precise swept collision, authored hard cover, partial rough concealment, floodlight exposure, and recoverable pursuit.
- Listening Focus for mower direction, cover proximity, landmarks, and environmental awareness.
- A pressure-driven golf chip: hold to charge, steer the landing point, misdirect Joe on impact, then risk reclaiming the persistent ball while he investigates.
- Persistent mower-cut strips that trade rough concealment for quieter footing, decaying bent-grass player trails Joe can discover, and lasting golf-ball divots.
- Temporary sprinkler soak zones that create quieter routes, stronger wet footprints, and mower-bog opportunities against Joe.
- Three permanent bunker-sand hazards that slow both the player and Joe's mower, preserve loud tracks, and reward successful mower baiting.
- A sight-and-sound attention meter, explicit contact-break progress, and one-time zone suspense events.
- Obstacle-aware Joe navigation with patrol, investigate, search, and chase animation.
- An adaptive HUD that recedes after onboarding and can be recalled with H or Y.
- A true pause layer with resume, how-to/settings, restart, and clubhouse actions.
- A persistent five-channel audio mix plus subtitle and reduced-camera-motion preferences.
- A post-run course scorecard with S–D risk grades, close-call recognition, and route-specific personal records.
- A persistent player file tracking rounds started, escapes, captures, and the best shed or drain performance.
- Persistent Night Order completion tracking that turns the three-layout rotation into a compact mastery loop.
- An unlockable Overtime Audit contract after all three Night Orders: fewer balls, faster pursuit, stronger evidence, a 1.30× score premium, and a separate persistent record.
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

**Rough Cut: A Joe Mower Horror Game**

Tagline: **The course closes at dusk. Joe does not.**
