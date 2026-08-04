# Interaction rejection-handoff polish — 2026-08-04

## Goal

Make a valid but blocked exit attempt explain why it failed, preserve spatial context, and return cleanly to the exact retry action.

## Finding

The locked maintenance shed and sealed drain correctly rejected premature use, but the still-valid interaction prompt immediately reclaimed the bottom rail. The authored rejection message therefore existed in state without receiving a readable presentation window, leaving repeated input as the clearest way to discover what was missing.

## Change

- Added one bounded rejection handoff shared by the locked shed and sealed drain.
- A rejected attempt owns the bottom rail for 2.35 seconds with a high-contrast `BLOCKED` explanation.
- The grounded in-reach marker changes from the ordinary action state to `LOCKED` or `SEALED`, keeping the failure attached to the attempted exit.
- The exact input-aware retry prompt remains preserved as deferred state and restores automatically when the explanation retires.
- Successful interactions clear any rejection state atomically, preventing stale blocked feedback from following a later valid action.
- The text-state contract reports the rejected target, local status, remaining duration, feedback owner, deferred prompt source, and automatic retry behavior.
- No interaction radius, availability, route logic, map behavior, movement, collision, detection, Joe AI, scoring, audio, generated art, or hazard priority changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual and state validation passed 252/252, covering the ready, rejected, and restored-retry phases for both exits at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the orange explanation remains legible without replacing the course, target art, objective HUD, or persistent map; compact layouts retain the same hierarchy.
- The official uninstrumented client preserved the ordinary opening, selected drain-valve route, first-steps guidance, persistent map, and generated course art with no browser-error artifact. Canvas rendering averaged 8.23ms with a 4.80ms final sample across 95 rendered frames.

## Evidence

- High-resolution shed rejection: `output/route-pressure-visual-validation/01-high-resolution-maintenance-shed-rejection-blocked.png`
- High-resolution drain rejection: `output/route-pressure-visual-validation/01-high-resolution-drain-exit-rejection-blocked.png`
- Compact shed rejection: `output/route-pressure-visual-validation/03-compact-maintenance-shed-rejection-blocked.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/interaction-rejection-handoff-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest repeated exit attempts during a natural close pursuit. Tune only the 2.35-second feedback duration if it interrupts chase decision-making; preserve the local blocked state, deferred exact-action source, and automatic retry restoration.
