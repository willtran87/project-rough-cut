# Cover-versus-interaction hierarchy polish — 2026-08-04

## Goal

Keep cover geometry readable at the exits without letting it compete with the action the player must execute.

## Finding

The maintenance shed and drain can place a cover socket beneath the same close perspective as their interaction footprint. Both ellipses were accurate, but rendering both at full strength weakened the command hierarchy around the target card and exact action or blocked-result rail.

## Change

- Added a shared numeric emphasis to the existing cover-ground presentation.
- When the bottom action or rejection rail owns the local command lane, the cover ring renders at 44% emphasis behind the unchanged gold interaction footprint.
- Leaving the actionable footprint restores full cover emphasis automatically.
- Collision contact continues to suppress the optional ring completely in favor of its immediate physical warning.
- Preserved the cover soil treatment and shelter art, so the object remains grounded even while its ring is subordinate.
- Added `ringEmphasis` and `ringHierarchy` to `render_game_to_text` from the same presentation function used by rendering.
- Changed no cover radius, interaction radius, sightline calculation, collision footprint, hard-cover result, rejection timing, route selection, movement, detection, Joe AI, scoring, audio, persistent map, ring transition duration, or art asset.

## Validation

- `node --check web/game.js` passed.
- `node --check output/validate-route-pressure-visual.mjs` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual/state validation passed 324/324 across isolated layouts, covering ready/action, blocked/rejection, and retreat hierarchy for both exits at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the gold interaction footprint and exact rail dominate at both high-resolution and compact scale, while the subdued cover socket remains grounded and full strength returns outside the actionable state.
- The official uninstrumented client preserved the opening, first-steps guidance, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas rendering averaged 5.79ms with a 2.00ms final sample across 101 rendered frames.

## Evidence

- High-resolution ready hierarchy: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-ready.png`
- High-resolution blocked hierarchy: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-blocked.png`
- Compact ready hierarchy: `output/route-pressure-visual-validation/03-compact-maintenance-shed-rejection-ready.png`
- Compact blocked hierarchy: `output/route-pressure-visual-validation/03-compact-maintenance-shed-rejection-blocked.png`
- High-resolution full-emphasis retreat: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-retreated.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/cover-interaction-hierarchy-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest entering and retreating from the shed and drain while Joe is in active pursuit. If the cover context becomes too quiet or still competes with the action, tune only the 44% subordinate emphasis; preserve the exact action owner, authoritative cover state, and full-strength recovery outside the footprint.
