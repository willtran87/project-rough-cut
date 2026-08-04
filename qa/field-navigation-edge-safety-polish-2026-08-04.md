# Field-navigation edge-safety polish — 2026-08-04

## Intent

Keep first-person navigation labels visually complete at extreme lateral angles without turning world guidance into detached HUD.

## Change

- Off-axis interactable markers now use their actual 196-pixel card width plus an 18-pixel canvas gutter.
- Ordinary world markers use their actual 148-pixel width with the same gutter.
- Marker rendering and `render_game_to_text` share x/y placement, width, safe gutter, edge direction, and inside-canvas validation.
- Ground-reflector captions remain anchored to their first visible world sample but clamp between the left canvas gutter and the persistent map.
- Route geometry, target selection, interaction radii, map behavior, collision, and movement are unchanged.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 132/132 pass across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- The lateral Water Hazard scenario confirmed the `SHED KEY` marker uses a left-edge card with an 18-pixel gutter and remains fully inside the canvas.
- The same scenario confirmed the `SHED KEY // FOLLOW LANTERNS` caption remains fully inside the field region between the canvas edge and course map.
- Visual inspection confirmed complete borders, direction arrows, labels, and distances without map overlap or responsive drift.
- The official uninstrumented browser smoke showed a complete `DRAIN VALVE // 81m` card at the left edge, reached `first_hole` at eleven meters with the `tactical_handoff` owner, and produced no error artifact. Canvas work averaged 6.71ms and ended at 1.80ms across 104 rendered frames.

## Guardrails

- Preserve world-space source anchors and edge-direction truth.
- Keep the persistent map as the right-side safe boundary for route captions.
- Derive marker padding from the rendered card width; do not restore magic padding values.
- If human testing needs adjustment, tune only the shared 18-pixel gutter before changing card width, font size, or navigation logic.
