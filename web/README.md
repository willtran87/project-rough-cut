# Rough Cut browser prototype

This is the immediately playable browser build for the opening cutscene, main menu, settings, and complete Hole 1 vertical slice.

Hole 1 is now a 360-unit authored course divided into four suspense zones: The Tee, Audit Row, Water Hazard, and The Dead Green. Its layered first-person renderer combines a clean distant generated vista, perspective mowing lines and ground flow, depth-sorted world obstacles, Joe and the mower, fog/motes, zone-specific grading, and an opening near-camera grass fringe that moves down and clears as the player leaves the tee.

Generated hedge tunnels, overturned carts, water boundaries, bunker walls, audit boards, floodlights, trees, rope boundaries, and maintenance debris are physical landmarks rather than decoration. Swept player collision prevents sprint tunneling, collision volumes preserve readable passages, and hard cover only conceals the player when it actually breaks Joe's line of sight. Deep rough softens the player's outline but still rustles when crossed carelessly. The amber floodlight raises visibility.

The current vertical slice includes two complete escape routes: recover the bunker-side key and reach the maintenance shed, or activate the sprinkler pressure system and escape through the drainage culvert. Joe follows an authored course patrol, investigates sounds, pursues visible or audible movement, remembers the last detected position, routes around course obstacles, and searches after contact is broken. Four golf-ball distractions support the longer traversal and become progressively less effective.

Holding Q enters Listening Focus: movement slows, ambience falls away, the mower direction becomes readable, and nearby cover, landmarks, and light exposure are surfaced. The presentation also includes state-specific animated Joe-and-mower performances, a reactive night soundscape, terrain-sensitive footsteps, grass debris, spatial mower panning, steering-load audio, danger heartbeat, action-specific cues, corporate Joe-state callouts, chase grading, directional threat feedback, and route-aware animated victory/capture transitions. Joe is hidden from the course map until he is close or actively pursuing; a decaying last-signal marker replaces permanent omniscient tracking.

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
- Hold C — crouch; hard cover conceals when it breaks Joe's sightline, while rough provides partial concealment.
- Hold Q — Listening Focus; slow down and read mower direction, nearby cover, landmarks, and exposure.
- Enter — interact with the key, sprinkler, shed, and drainage culvert.
- Space — throw a golf-ball distraction.
- F — toggle fullscreen.
- Escape — return from settings or Hole 1.

Standard gamepads are also supported:

- Left stick or D-pad — move and navigate menus.
- RT — sprint.
- LB — crouch and use hard cover or rough.
- LT — Listening Focus.
- A — confirm and interact.
- X — throw a golf-ball distraction.
- B — return from menus or result screens.
- Start — return to the menu during Hole 1.

The interface switches between keyboard and controller prompts based on the most recent active input. Volume, subtitles, and reduced-camera-motion settings are navigable with pointer, keyboard, or controller.

Browser audio requires the initial click or key press. Joe's line is presented as an on-screen subtitle; no synthetic dialogue voice is used.
