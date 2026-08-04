# World-marker bottom-rail clearance polish — 2026-08-04

## Goal

Keep close exit status spatially grounded and fully legible while the bottom rail owns the exact action or blocked consequence.

## Finding

At the exit's maximum projected scale, the world card began around logical y=586 and its fixed 51-pixel frame ended near y=637. The local `IN REACH`, `LOCKED`, or `SEALED` baseline landed around y=640, outside that frame, while the bottom signal rail began at y=608. The local state was therefore painted into the bottom rail instead of remaining inside its own grounded card.

## Change

- Added one shared scale-aware world-marker panel measurement for ordinary action and rejection states.
- The frame height now includes the complete local status row at every supported projected scale.
- Cards whose binding owner is `bottom_action_rail` or `bottom_rejection_rail` lift only enough to preserve the existing 18-pixel gutter above that rail.
- The target ring, world anchor, glyph, label, and generated or authored exit art remain grounded at their original projection.
- Distant markers and the local-binding fallback retain their prior placement because no bottom rail competes with them.
- Rendering and `render_game_to_text` share the final y position, raw y, projected scale, panel top and bottom, lift distance, rail owner, safe bottom, local-text containment, and clearance result.
- No interaction radius, exit availability, prompt ordering, retreat behavior, route selection, map behavior, movement, collision, detection, Joe AI, scoring, audio, or art asset changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual and state validation passed 292/292 across isolated layouts, covering both ready/action and blocked/rejection ownership for the maintenance shed and drain exit at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the local status is fully enclosed by its grounded card, the bottom rail remains a distinct information owner, and the measured 18-pixel gap survives high-resolution and compact scaling.
- The official uninstrumented client preserved the ordinary opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.27ms with a 2.00ms final sample across 100 rendered frames.

## Evidence

- High-resolution ready action: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-ready.png`
- High-resolution blocked consequence: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-blocked.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/world-marker-bottom-rail-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest the final exit approach while alternating between ordinary movement and Listening Focus. Tune only the 18-pixel vertical gutter if the grounded card feels too separated from its rail; preserve complete local-text containment and exclusive information ownership.
