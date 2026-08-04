# Interactable action-owner polish — 2026-08-04

## Goal

Give each usable world prop one exact input owner while preserving a grounded readiness cue and a reliable fallback when the global action rail is unavailable.

## Finding

During a live update inside the key radius, the centered prop panel displayed `ENTER USE // IN REACH` while the bottom rail simultaneously displayed `ACTION // ENTER — TAKE SHED KEY`. The second line was more precise, making the local binding redundant. Replacing it with centered `IN REACH` then exposed a separate layout issue: the reticle covered the middle of that shortened status.

## Change

- Added one shared `worldMarkerReachPresentation` contract for centered props, morph panels, and ordinary edge/world markers.
- When the bottom action rail is visible, it exclusively owns the current binding and exact action verb.
- The local panel remains attached to the prop but becomes a spatial `IN REACH` status rather than repeating generic input copy.
- The local status uses a measured 12-pixel left inset so a centered target and reticle cannot cover its letters.
- If the action rail yields to another presentation, the local panel restores its keyboard, gamepad, or touch binding as a fallback.
- `render_game_to_text` reports the local text, role, alignment, inset, binding owner, and exact action text for every in-reach interactable.
- No interaction radius, availability, action ordering, input mapping, route state, movement, collision, detection, Joe AI, scoring, audio, or hazard priority changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18.
- Responsive visual validation passed 216/216 at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Deterministic live-ready states confirm the bottom rail owns `TAKE SHED KEY`, the local panel reports only `IN REACH`, and its left inset remains clear of the reticle.
- A forced no-rail state confirms the local world marker restores `USE` as its input-aware fallback.
- Direct inspection confirmed the two panels now have distinct jobs, the crosshair stays unobstructed, the compact view remains readable, and Reduced Motion retains identical static hierarchy.
- The official uninstrumented client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas rendering averaged 7.14ms with a 1.90ms final sample across 106 rendered frames.

## Evidence

- High-resolution live action: `output/route-pressure-visual-validation/01-high-resolution-interactable-approach-ready.png`
- Standard live action: `output/route-pressure-visual-validation/02-standard-interactable-approach-ready.png`
- Compact live action: `output/route-pressure-visual-validation/03-compact-interactable-approach-ready.png`
- Reduced Motion live action: `output/route-pressure-visual-validation/04-reduced-motion-interactable-approach-ready.png`
- Official regression: `output/interactable-action-owner-official-2026-08-04/shot-0.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`

## Next suggested refinement

Human-playtest taking the key and immediately moving away. If the transition feels abrupt, refine only the retirement timing of the local readiness panel; preserve the single exact-action owner and immediate gameplay result.
