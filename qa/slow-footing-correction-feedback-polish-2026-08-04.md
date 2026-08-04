# Slow-footing correction-feedback polish — 2026-08-04

## Intent

Make short lateral corrections feel precise while the player is physically slowed, without changing movement or removing useful direction feedback.

## Change

- Marked slow footing now uses a 0.26-second directional release echo.
- Ordinary terrain retains the established 0.42-second echo.
- Held input remains immediate and full-strength.
- Collision escape guidance retains its separate 0.24-second authoritative override.
- Locomotion labels, camera translation, movement speed, route guidance, collision, and input mappings are unchanged.
- `render_game_to_text` now reports the active afterglow duration and whether feedback is in `quick_footing_correction` or `standard_direction_echo` mode.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 112/112 pass across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- A deterministic left tap in irrigation mud confirmed full afterglow while held, a partial direction-only echo 120ms after release, and complete retirement by 280ms.
- Visual inspection confirmed that the held, echo, and clear states remain centered, legible, and free of plaque, reticle, map, and panel overlap at every tested size.
- The official uninstrumented browser smoke confirmed ordinary fairway movement still reports `standard_direction_echo` at 0.42 seconds, reached `first_hole` at eleven meters with the `tactical_handoff` owner, and produced no error artifact. Canvas work averaged 8.91ms and ended at 3.40ms across 98 rendered frames.

## Guardrails

- Do not shorten live held-input feedback.
- Preserve the ordinary 0.42-second echo and collision override timing.
- Keep this presentation-only; do not compensate by changing movement speed or camera response.
- If human testing needs adjustment, tune only the 0.26-second footing release duration before changing arrow layout, opacity, or input behavior.
