# Footing close-Joe pressure polish — 2026-08-04

## Intent

Make a slow-footing decision feel appropriately dangerous when Joe is visibly close, without adding another HUD element or exposing his position through cover.

## Change

- Added one shared footing-plaque threat-state helper.
- The existing sustained-guidance plaque remains amber under ordinary route pressure.
- When guidance is active, Joe's world label is honestly visible, and he is within 36 meters, the same plaque shifts to danger-orange and appends his live rounded distance to the escape line.
- Existing placement still clears Joe's grounded label, the aiming reticle, and competing central captions.
- Imminent noise warnings keep their established priority and may temporarily replace the plaque.
- No collision, slowdown, pathfinding, detection, map, route recommendation, or AI-knowledge values changed.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 92/92 pass across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Dedicated sustained-mud scenario confirmed `danger_orange`, visible close-Joe pressure, a live distance at or below 36 meters, and no overlap with Joe's label or reticle.
- Official uninstrumented browser smoke reached `first_hole`, eleven meters of progress, and the `tactical_handoff` onboarding phase with no error artifact. Canvas work averaged 6.94ms and ended at 1.60ms across 114 rendered frames.

## Guardrails

- Do not show close-Joe distance through physical cover or when his world label is hidden.
- Preserve a single local guidance plaque; do not add a parallel threat card.
- Preserve imminent-noise priority, truthful terrain geometry, and the existing 54–70% movement drag.
- If human testing finds the cue early or late, tune only the 36-meter threshold before changing layout or information density.
