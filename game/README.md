# Rough Cut — Godot opening prototype

This Godot 4 project implements the beginning of **Rough Cut**:

1. Fade into a dense wall of animated golf-course rough.
2. A procedural weed-whacker sound starts and a ragged opening is cut through the grass.
3. Sparks, grass clippings, camera vibration, and wind sell the cut.
4. Joe leans toward the camera and the subtitle **“HERE'S JOEY!”** appears.
5. A dramatic stinger resolves into a functional main menu.
6. **Begin the Round** transitions into the first-hole atmospheric handoff.

## Run

1. Install Godot 4.3 or newer.
2. Import `project.godot` from this directory.
3. Run the project with **F6/F5**.

The intro can be skipped with Space, Enter, Escape, or a mouse click.

## Implemented menu actions

- **Begin the Round** — loads the first-hole handoff scene.
- **Acceptance Criteria** — opens volume, subtitle, and reduced-motion settings.
- **Submit Change Request** — displays Joe's in-world scope-rejection response.
- **Replay Incident** — restarts the cutscene.
- **Clock Out** — exits the game.

## Audio note

The mower, cutting, silence, and dramatic stinger are synthesized at runtime so the scene works without external sound files. Joe's line is represented by a timed subtitle; no synthetic dialogue voice is used.

## Feature layout

- `cinematics/opening/` — opening timeline, procedural grass, and key art.
- `ui/main_menu/` — functional title menu and settings panel.
- `levels/first_hole/` — atmospheric transition target for the future vertical slice.
- `common/` — reserved for shared runtime systems.
