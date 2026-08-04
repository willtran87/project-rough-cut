# Centered-interactable route-hierarchy polish QA

Date: 2026-08-04

## Intent

Keep the selected/alternate route hierarchy consistent when an interactable key or valve moves from an off-axis edge marker into the centered first-person scene. The information panel may communicate recommendation, but dedicated prop art and the grounded interaction footprint must remain fully visible and usable.

## Implementation contract

- `drawWorldInteractable()` resolves the shared `worldMarkerGuidancePresentation()` state for its stable target ID before choosing centered or edge presentation.
- A selected or in-reach centered panel receives the shared static two-pixel top rail and frame-width boost.
- An alternate centered panel uses the established 0.72 panel-emphasis multiplier until the player enters its interaction radius.
- The alpha multiplier wraps only the floating panel. Dedicated key/valve art, ground ring, world anchor, and reach geometry remain full-strength.
- No objective selection, route, interaction, collision, movement, detection, Joe AI, camera, map, or Reduced Camera Motion rules changed.

## Automated validation

- `node --check web/game.js`: passed.
- Focused gameplay validator: 18/18 checks passed with no browser errors.
- Responsive visual validation passed 160/160 and confirmed the centered `SHED KEY` in all four configurations:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- Each centered scenario reported:
  - navigation target `shed-key`
  - interactable visible
  - `usesEdgeMarker: false`
  - `guidancePresentation.role: selected_route`
  - `alphaMultiplier: 1`
  - `frameWidthBoost: 1`
  - `topRail: true`
  - zero browser errors

## Visual inspection

- [High-resolution centered key](../output/route-pressure-visual-validation/01-high-resolution-centered-selected-interactable.png)
- [Standard centered key](../output/route-pressure-visual-validation/02-standard-centered-selected-interactable.png)
- [Compact centered key](../output/route-pressure-visual-validation/03-compact-centered-selected-interactable.png)
- [Reduced-motion centered key](../output/route-pressure-visual-validation/04-reduced-motion-centered-selected-interactable.png)

The key prop and ground anchor remain visually present while the selected panel gains the stronger amber rail/frame. The compact presentation remains readable, and no capture adds a map, reticle, prop, or neighboring-object overlap.

## Official-client smoke

- [Opening smoke frame](../output/centered-interactable-route-hierarchy-official-2026-08-04/shot-0.png)
- Opening guidance remained on `DRAIN VALVE` with selection reason `current_is_nearest`.
- The valve exported `selected_route`, full opacity, a one-pixel frame boost, and the static top rail.
- No `errors-0.json` artifact was produced.
- Canvas rendering averaged 9.35ms with a 4.00ms final sample across 94 frames.

## Manual follow-up

Walk laterally past a key and valve so each marker moves repeatedly between edge-card and centered-panel presentation. Confirm the hierarchy feels continuous without making the alternate object look unavailable. If tuning is needed, change only the panel emphasis; preserve full-strength prop art, interaction truth, and Reduced Motion parity.
