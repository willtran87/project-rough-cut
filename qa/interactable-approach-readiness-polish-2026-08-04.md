# Interactable approach-readiness polish — 2026-08-04

## Goal

Make the final approach to a key, valve, exit control, or other usable world prop readable from the first-person view without adding another instruction card or changing the actual interaction distance.

## Finding

The projected interaction footprint previously had two visual states: a quiet dashed ring while unavailable and a bright solid ring plus input prompt once usable. The snap was truthful, but it did not help the player judge whether the next stride would enter interaction range.

## Change

- Added one shared zero-to-one `interactionApproachReadiness` value based on the existing `worldDistance` metric and each prop's authoritative radius.
- The presentation begins at 2.25 times that radius and reaches full readiness exactly at the interaction edge.
- While approaching, the existing dashed ring gradually gains opacity and line weight, its dash spacing tightens, and four small cardinal ticks emerge outside the same projected ellipse.
- Crossing the real radius preserves the established solid gold ring and input-aware `IN REACH` prompt; approach ticks retire rather than competing with the actionable state.
- Reduced Camera Motion keeps the complete distance signal but removes its ambient pulse.
- `render_game_to_text` now reports `approachReadiness` and the `far`, `approaching`, `near`, or `ready` band for every interactable.
- No radius, interaction availability, target selection, route geometry, map state, collision, movement, camera behavior, Joe AI, scoring, audio, or input logic changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18.
- Responsive visual validation passed 208/208 at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Deterministic captures cover far, approaching, near, and ready key states in all four configurations.
- Direct inspection confirmed the ticks remain grounded to the real projected footprint, do not create another text owner, remain beneath world/context cards, and hand off cleanly to the solid ready ring and input prompt.
- The official uninstrumented client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas rendering averaged 8.05ms with a 1.70ms final sample across 92 rendered frames.

## Evidence

- High-resolution near state: `output/route-pressure-visual-validation/01-high-resolution-interactable-approach-near.png`
- Standard approach state: `output/route-pressure-visual-validation/02-standard-interactable-approach-approaching.png`
- Standard ready state: `output/route-pressure-visual-validation/02-standard-interactable-approach-ready.png`
- Official regression: `output/interactable-approach-readiness-official-2026-08-04/shot-0.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`

## Next suggested refinement

Human-playtest approaching the valve and both exits at sprint speed. If the signal begins too early or late, tune only the 2.25-radius outer threshold while preserving the authoritative inner radius, single ready prompt, and projected-footprint geometry.
