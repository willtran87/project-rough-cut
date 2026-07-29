# Rough Cut

Working directory for a first-person 2.5D pixel-horror game about Joe, a product owner at an insurance company whose obsession with grass, golf, and measurable outcomes turns an after-hours company outing into a lethal course-optimization exercise.

**Play the current vertical slice:** [willtran87.github.io/project-rough-cut](https://willtran87.github.io/project-rough-cut/)

> The course closes at dusk. Joe does not.

## Current playable slice

The browser build includes:

- An original grass-and-weed-whacker horror-comedy opening.
- Keyboard, pointer, and standard gamepad support with automatic prompt switching.
- Two complete escape routes through the maintenance shed or drainage culvert.
- Noise, concealment, line-of-sight breaks, golf-ball distractions, and recoverable pursuit.
- Obstacle-aware Joe navigation with patrol, investigate, search, and chase animation.
- Reactive mower audio, footsteps, heartbeat, environmental effects, and animated victory/capture presentation.

Run it locally from the project root:

```powershell
python -m http.server 4187 --directory web
```

Then open `http://127.0.0.1:4187/`.

## Project documentation

Open `docs/Rough_Cut_Game_Blueprint.docx`. It contains the game vision, Joe's canonical backstory, design pillars, core loop, behavior model, nine-hole progression, vertical-slice scope, art and audio direction, production plan, and title alternatives.

The playable Godot opening prototype is in `game/`. See `game/README.md` for run instructions, the cutscene timeline, menu controls, and the first-hole handoff.

The immediately playable browser version is in `web/`. It reproduces the animated opening, synthesized mower audio, on-screen “Here's Joey!” beat, functional menus, accessibility settings, and first-hole handoff without requiring Godot.

## Directory map

- `assets/characters/joe/` - Joe's current source art, animation sheets, frames, previews, and metadata.
- `assets/environment/` - Course textures, foliage, props, terrain, structures, and environmental effects.
- `assets/audio/` - Mower states, course ambience, PA announcements, UI, and scare cues.
- `design/` - Future mechanics specifications, level plans, narrative notes, and tuning data.
- `docs/` - Project-facing documents.
- `game/` - Engine project and runtime source.
- `builds/` - Local packaged builds.
- `qa/` - Review output, test notes, and document render checks.
- `tools/` - Project-local content and pipeline utilities.
- `web/` - Static production slice deployed to GitHub Pages.
- `.github/workflows/pages.yml` - Automated GitHub Pages deployment.

## Recommended first milestone

Build a single 10-15 minute course hole with one fairway, one rough area, a bunker, a pond, a maintenance shed, throwable golf balls, one sprinkler control, persistent mowing, and Joe's mowing, listening, investigating, and charging states.

## Working title

**Rough Cut: A Joe Mower Horror Game**

Tagline: **The course closes at dusk. Joe does not.**
