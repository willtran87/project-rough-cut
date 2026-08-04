# Interactable marker morph polish QA

Date: 2026-08-04

## Intent

Remove the one-frame visual jump when a key or valve clears a protected HUD/map region and moves from an edge card into its centered world-prop presentation. Preserve one readable information owner, continuous route hierarchy, and authoritative interaction grounding throughout the handoff.

## Implementation contract

- `worldInteractablePresentation()` measures the projected prop against the existing left/right canvas, HUD, and course-map safety boundaries.
- A 48-pixel spatial span resolves three exclusive states: `edge`, `handoff`, and `centered`.
- `edge` renders the established protected 196-pixel card.
- `handoff` renders one morph panel; it does not stack edge and centered cards.
- `centered` renders the dedicated prop and established centered panel.
- During `handoff`, panel position, width, height, label size, frame weight, and the selected-route top rail interpolate from edge geometry to centered geometry.
- The edge glyph fades as the dedicated image-generated key/valve prop fades in. The ground interaction ring remains full-strength in all three states.
- Progress is derived from current projection rather than elapsed time, preventing visual lag behind player steering and preserving static Reduced Camera Motion parity.
- No target selection, objective availability, interaction radius, route planning, map state, collision, movement, camera translation, Joe AI, or input values changed.

## Automated validation

- `node --check web/game.js`: passed.
- Focused gameplay validation: 18/18 checks passed with no browser errors.
- Responsive visual validation: 172/172 checks passed at:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact viewport
  - 1280x720 Reduced Camera Motion
- Each configuration deterministically confirmed:
  - edge state: protected card owner, prop alpha 0
  - midpoint: `handoff`, morph-panel owner, blend/prop progress near 0.5, no edge or centered panel owner
  - centered state: centered-panel owner, prop alpha 1, selected-route hierarchy retained

## Visual inspection

- [High-resolution midpoint](../output/route-pressure-visual-validation/01-high-resolution-marker-transition-handoff.png)
- [Standard edge](../output/route-pressure-visual-validation/02-standard-marker-transition-edge.png)
- [Standard midpoint](../output/route-pressure-visual-validation/02-standard-marker-transition-handoff.png)
- [Standard centered](../output/route-pressure-visual-validation/02-standard-marker-transition-centered.png)
- [Compact midpoint](../output/route-pressure-visual-validation/03-compact-marker-transition-handoff.png)
- [Reduced-motion midpoint](../output/route-pressure-visual-validation/04-reduced-motion-marker-transition-handoff.png)

The final midpoint contains one readable `SHED KEY // 77m` label, one frame and selected-route rail, a partially revealed key prop, and the unchanged grounded route/interaction cues. It does not overlap the HUD, course map, reticle, or nearby scenery. The rejected double-card and overly quiet dissolve variants were not retained.

## Official-client smoke

- [Opening smoke frame](../output/interactable-marker-morph-official-2026-08-04/shot-0.png)
- Opening guidance remained on `DRAIN VALVE` with selection reason `current_is_nearest`.
- The valve remained in the truthful protected `edge` state with selected-route framing.
- No `errors-0.json` artifact was produced.
- Canvas rendering averaged 7.33ms with a 2.00ms final sample across 103 frames.

## Manual follow-up

Make repeated short lateral corrections while a selected key or valve sits directly on the handoff boundary. If the transition feels too fast or sticky, tune only the 48-pixel spatial span. Preserve the exclusive single-panel owner, continuous label, full-strength interaction ring, and projection-driven state.
