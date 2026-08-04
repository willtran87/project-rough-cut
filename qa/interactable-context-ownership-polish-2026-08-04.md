# Interactable context-ownership polish — 2026-08-04

## Goal

Keep a usable world prop visually decisive during its final approach without hiding genuinely urgent environmental hazards.

## Finding

The new readiness ring made interaction distance clear, but the nearest ambient context system could still place a full noise-hazard plaque directly beneath the prop's near or `IN REACH` panel. The information was individually truthful, yet the two similarly weighted cards competed at the exact moment the player needed to act.

## Change

- Added one shared `interactableContextOwnerState` for the key, valve, Change Request, maintenance shed, and drain exit.
- An available prop becomes the local context owner at the established `near` threshold of 0.78 readiness; an in-reach prop receives action ownership.
- While owned, non-urgent noise, blocker, and practice plaques yield. Their world art, projected hazard footprint, and ordinary HUD awareness remain visible.
- The hierarchy is interruptible. Footing guidance, aiming, active distraction/horror handoffs, Joe dialogue, threat captions, and other established high-priority lanes remain ahead of interaction approach.
- A noise hazard within eight meters explicitly overrides both near and actionable interaction ownership and restores its tethered field plaque.
- `render_game_to_text` reports `interactable_approach` or `interactable_action`, plus owner ID, distance, and readiness, whenever ambient context yields.
- No hazard trigger, interaction radius, availability, movement, collision, detection, Joe AI, route selection, map state, scoring, audio, or input behavior changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18.
- Responsive visual validation passed 212/212 at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Deterministic states confirm ordinary ambient context remains during the early approach, yields at `near`, remains deferred during `ready`, and returns when a noise hazard is within eight meters.
- Direct inspection confirmed clean key hierarchy in near and ready states, unchanged physical hazard visibility, and a readable separated warning in the imminent override state.
- The official uninstrumented client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas rendering averaged 6.70ms with a 1.90ms final sample across 108 rendered frames.

## Evidence

- High-resolution ready state: `output/route-pressure-visual-validation/01-high-resolution-interactable-approach-ready.png`
- Standard near state: `output/route-pressure-visual-validation/02-standard-interactable-approach-near.png`
- Standard ready state: `output/route-pressure-visual-validation/02-standard-interactable-approach-ready.png`
- Standard imminent override: `output/route-pressure-visual-validation/02-standard-interactable-approach-imminent-override.png`
- Official regression: `output/interactable-context-ownership-official-2026-08-04/shot-0.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`

## Next suggested refinement

Human-playtest collecting the key with a naturally patrolling Joe nearby. If the interaction owner feels too quiet under threat, tune only the existing prop-panel threat treatment; preserve the eight-meter hazard override and the single local context owner.
