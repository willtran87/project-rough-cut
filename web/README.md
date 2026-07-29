# Rough Cut browser prototype

This is the immediately playable browser build for the opening cutscene, main menu, settings, and complete Hole 1 vertical slice.

Hole 1 uses a layered first-person course renderer: a clean distant generated vista, perspective mowing lines and ground flow, depth-sorted world obstacles, Joe and the mower, fog/motes, and an opening near-camera grass fringe that moves down and clears as the player leaves the tee. Generated trees, hedges, rope boundaries, maintenance debris, signs, reeds, and bunker props form visible collision boundaries instead of functioning as decoration alone.

The current vertical slice includes two complete escape routes: recover the bunker-side key and reach the maintenance shed, or activate the sprinkler pressure system and escape through the drainage culvert. Joe follows an authored perimeter patrol, investigates sounds, pursues visible or audible movement, remembers the last detected position, routes around course obstacles, and searches after contact is broken. Crouching in deep rough reduces noise and visibility; repeated golf-ball distractions become progressively less effective.

The presentation includes state-specific animated Joe-and-mower performances, a reactive night soundscape, terrain-sensitive footsteps, grass debris, spatial mower panning, steering-load audio, danger heartbeat, action-specific cues, corporate Joe-state callouts, chase grading, directional threat feedback, and route-aware animated victory/capture transitions. Joe is hidden from the course map until he is close or actively pursuing; a decaying last-signal marker replaces permanent omniscient tracking.

The capture sequence uses the generated `rough-cut-joe-capture-v1.png` tableau and keeps all defeat copy in the renderer so timing, accessibility, and visual grading remain editable.

## Start locally

From this directory:

```powershell
python -m http.server 4187
```

Then open `http://127.0.0.1:4187/`.

## Controls

- Click, Enter, or Space — begin the incident.
- Click, Enter, Space, or Escape — skip the opening.
- Arrow keys and Enter — navigate the main menu.
- Pointer — select menu and settings controls.
- WASD or arrow keys — move through Hole 1.
- Shift — sprint, with more noise.
- Hold C — crouch; deep rough conceals quiet players.
- Enter — interact with the key, sprinkler, shed, and drainage culvert.
- Space — throw a golf-ball distraction.
- F — toggle fullscreen.
- Escape — return from settings or Hole 1.

Standard gamepads are also supported:

- Left stick or D-pad — move and navigate menus.
- RT — sprint.
- LB — crouch and conceal in deep rough.
- A — confirm and interact.
- X — throw a golf-ball distraction.
- B — return from menus or result screens.
- Start — return to the menu during Hole 1.

The interface switches between keyboard and controller prompts based on the most recent active input. Volume, subtitles, and reduced-camera-motion settings are navigable with pointer, keyboard, or controller.

Browser audio requires the initial click or key press. Joe's line is presented as an on-screen subtitle; no synthetic dialogue voice is used.
