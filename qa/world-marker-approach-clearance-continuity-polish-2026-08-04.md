# World-marker approach-clearance continuity polish — 2026-08-04

## Goal

Remove the close-card vertical pop when an exit crosses from final approach into actionable range.

## Finding

The completed bottom-rail clearance correctly lifted the close exit card by roughly 58 logical pixels, but that lift began only after the player crossed the authoritative interaction radius. The same frame also introduced the bottom action rail and local `IN REACH` row, making a correct layout change read like a HUD jump during lateral corrections around the boundary.

## Change

- Reused the established interaction-readiness curve to pre-clear the card during the final `near` approach band.
- The lift begins only after 0.78 readiness, progresses from current world distance, and reaches its final y before the action rail appears.
- The compact label card remains compact during approach; crossing the real interaction radius expands the framed local-status row downward into the already reserved gap instead of moving the card again.
- Bottom action and rejection ownership still force the exact final clearance, protecting the layout if another presentation interrupts the approach.
- Reduced Camera Motion uses the same position-derived geometry with no time-driven movement.
- Rendering and text state share approach readiness, lift progress, raw y, target y, current y, lift distance, reserve reason, and rail clearance.
- No interaction radius, readiness threshold, target availability, prompt timing, route selection, map behavior, movement, collision, detection, Joe AI, scoring, audio, or art asset changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual and state validation passed 300/300 across isolated layouts, covering mid-approach, near-edge, ready/action, and blocked/rejection states for both exits at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed a progressive grounded lift at mid approach, near-final placement just outside the radius, and no y jump when the framed status row and bottom rail appear.
- The official uninstrumented client preserved the ordinary opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.03ms with a 1.60ms final sample across 120 rendered frames.

## Evidence

- High-resolution mid approach: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-approach-clearance-mid.png`
- High-resolution near edge: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-approach-clearance-near.png`
- High-resolution ready state: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-ready.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/world-marker-approach-clearance-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest short alternating lateral taps across the final interaction boundary. Tune only the 0.78 pre-clear threshold if the lift begins too early or too late; preserve the authoritative interaction radius, shared readiness curve, and final 18-pixel rail gap.
