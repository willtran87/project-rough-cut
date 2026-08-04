# First-person route-thread polish — 2026-08-03

## Goal

Make separate first-person route reflectors read as consecutive steps in one spatial path without turning navigation into a bright floating HUD line.

## Observed issue

The natural grounds-cart frame showed two teal left-pointing reflectors at different positions. They belonged to the same collision-aware objective route, but without a connecting treatment they could be mistaken for duplicated bearings or separate instructions.

## Resolution

- Centralized projected route entries for reflector and segment calculations.
- Joins only consecutive route samples whose projected segment intersects the playable viewport.
- Draws a dark turf underlay followed by a restrained target-colored dashed thread.
- Keeps the existing directional chevrons and `FOLLOW LANTERNS` label as the stronger route landmarks.
- Draws the thread before physical course entities, so hedge tunnels, carts, and cover occlude it naturally.
- Uses a slow bounded alpha pulse during ordinary play.
- Keeps a static thread under Reduced Camera Motion.
- Reports visible segment count, presentation mode, occlusion ownership, and Reduced Motion behavior through `render_game_to_text`.

No objective selection, path planning, route sampling distance, collision, player movement, Joe behavior, interaction, score, detection, map, or route-commitment rule changed.

## Verification

`node --check web/game.js`

`node output/audit-collision-contact-layer.mjs`

- 17/17 focused assertions passed.
- Covered clear-ground and honestly occluded routes, centered and off-center collision recovery, 2560x1600, 1280x720, 844x390, Reduced Camera Motion, text-state parity, and browser errors.

`node output/validate-route-commitment-handoff.mjs`

- Key collection still committed navigation to the Shed Exit.
- Drain-valve use still committed navigation to the Drain Exit.
- Reduced Motion retained the same valve handoff and route state.
- No browser errors.

`node output/validate-movement-feedback-release.mjs`

- 10/10 established movement-feedback assertions passed.

`node output/validate-navigation-performance.mjs`

- Corrected the ignored validator's obsolete `/web/` URL to the current local root.
- All eight authored zones produced a collision-clear obstructed route that reached its target.
- Sample planner work remained between 0ms and 5ms, with no browser errors.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/footprint_collision.json --iterations 1 --pause-ms 80 --screenshot-dir output/navigation-ground-thread-official-2026-08-03`

- Natural gameplay reported two visible reflectors and two visible thread segments.
- The grounds cart correctly occluded most of the route rather than allowing the line to float over it.
- No client error artifact.
- Canvas work averaged 1.87ms, with a 1.50ms final sample across 235 rendered frames.

## Visual evidence

- `output/collision-contact-layer-audit/08-high-resolution-clear-ground-route.png`
- `output/collision-contact-layer-audit/09-standard-clear-ground-route.png`
- `output/collision-contact-layer-audit/10-compact-clear-ground-route.png`
- `output/collision-contact-layer-audit/11-standard-clear-ground-route-reduced-motion.png`
- `output/navigation-ground-thread-official-2026-08-03/shot-0.png`
