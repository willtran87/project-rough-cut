# HUD-footprint marker protection polish QA

Date: 2026-08-04

## Intent

Ensure world-marker safety uses the full rendered card footprint when the expanded `SURROUNDINGS` panel is visible. A projected anchor clearing the HUD is insufficient if the marker extends back underneath it.

## Implementation contract

- The secondary HUD occupies x=36..466 and y=269..351 in the authored 1280x720 canvas.
- The protected marker gutter remains 18 pixels.
- A 196-pixel interaction card therefore retains the lower left lane until its center reaches x=582.
- The 48-pixel morph begins only after that complete edge-card footprint clears.
- The right handoff boundary includes the maximum 184-pixel centered/in-reach panel width against the course-map safe edge.
- Ordinary context markers use their measured 148-pixel width when resolving the same lower lane.
- Left-lane interaction cards use y=414; right map-lane cards use y=454.
- The morph remains projection-driven and exclusive: only its single morph panel owns the label during handoff.
- No gameplay geometry, interaction, navigation, movement, detection, AI, input, map, or scoring rules changed.

## Automated validation

- `node --check web/game.js`: passed.
- Focused gameplay validation: 18/18 checks passed with no browser errors.
- Expanded-HUD responsive visual validation: 176/176 checks passed at:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact viewport
  - 1280x720 Reduced Camera Motion
- Every configuration forced manual HUD expansion and confirmed:
  - protected key edge card at y=414
  - `left_secondary_hud` lane ownership
  - morph progress near 0.5 with its calculated full left edge at or beyond x=484
  - centered 146-pixel panel fully beyond x=484
  - nearby visible `CR-017` context marker routed to y=414
  - zero browser errors

## Visual inspection

- [High-resolution expanded-HUD midpoint](../output/route-pressure-visual-validation/01-high-resolution-marker-transition-handoff.png)
- [Standard protected edge](../output/route-pressure-visual-validation/02-standard-marker-transition-edge.png)
- [Standard midpoint](../output/route-pressure-visual-validation/02-standard-marker-transition-handoff.png)
- [Standard centered and context marker](../output/route-pressure-visual-validation/02-standard-marker-transition-centered.png)
- [Compact midpoint](../output/route-pressure-visual-validation/03-compact-marker-transition-handoff.png)
- [Reduced-motion midpoint](../output/route-pressure-visual-validation/04-reduced-motion-marker-transition-handoff.png)

The key edge card clears the bottom of `SURROUNDINGS`; the midpoint and centered card clear its right edge with a visible gap. `CR-017` occupies the lower context lane rather than sitting under the panel. The route caption, map, reticle, and grounded prop cues remain unobstructed.

## Official-client smoke

- [Opening smoke frame](../output/hud-footprint-marker-protection-official-2026-08-04/shot-0.png)
- Opening guidance remained on `DRAIN VALVE` with `current_is_nearest` selection.
- The valve reported `edge`, `left_secondary_hud`, selected-route hierarchy, and safe panel region x=484..988.
- No `errors-0.json` artifact was produced.
- Canvas rendering averaged 7.09ms with a 2.00ms final sample across 105 frames.

## Manual follow-up

Toggle the manual HUD while a key or valve shares the left field edge with a Change Request. If the grouping feels too loose or cramped, tune only the shared 18-pixel gutter. Preserve measured card widths, the lower protected lane, the single-panel morph owner, and direct world-state truth.
