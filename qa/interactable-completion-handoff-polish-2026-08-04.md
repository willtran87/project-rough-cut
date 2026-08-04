# Interactable completion-handoff polish — 2026-08-04

## Goal

Make a completed world interaction retire cleanly and hand the player's attention directly to its result and next objective.

## Finding

The key, drain valve, Change Request, and recoverable golf ball updated their gameplay state immediately, but their previous contextual prompt was cleared only by the next simulation update. Route-changing actions also waited for that update before selecting the new navigation target. Under ordinary frame pacing this interval was short, but it allowed a rendered intermediate state to reference a prop that had already disappeared.

## Change

- Added one shared completion handoff used by the key, drain valve, optional Change Request, and golf-ball recovery.
- Successful actions clear their prior field prompt in the same state transition that completes or removes the interactable.
- Key and valve completion immediately refresh the objective guide and invalidate the cached minimap presentation.
- Taking the key now changes the objective ledger to `RETURN TO SHED AND FILE RELEASE`, replaces the action rail with `KEY ACQUIRED`, removes the key marker, and points both the grounded route and map at `SHED EXIT` in one renderable state.
- The following simulation tick retains the same confirmation and route instead of recreating the old prompt.
- No interaction radius, action ordering, input mapping, movement, collision, detection, Joe AI, scoring, hazard priority, or art asset changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18.
- Responsive visual and state validation passed 228/228 at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Deterministic captures cover the live key-ready frame, the exact post-interaction frame before another update, and the settled following tick.
- Direct inspection confirmed the ready prompt and key art retire together, the confirmation remains legible, the objective ledger updates, and the shed route appears without overlap or a stale marker in high-resolution and compact layouts.
- The official uninstrumented client smoke preserved the ordinary opening, selected drain-valve route, first-steps guidance, map, and generated course art with no browser-error artifact. Canvas rendering averaged 5.86ms with a 1.80ms final sample across 107 rendered frames.

## Evidence

- High-resolution completion: `output/route-pressure-visual-validation/01-high-resolution-key-completion-immediate.png`
- Standard completion: `output/route-pressure-visual-validation/02-standard-key-completion-immediate.png`
- Compact completion: `output/route-pressure-visual-validation/03-compact-key-completion-immediate.png`
- Reduced Motion completion: `output/route-pressure-visual-validation/04-reduced-motion-key-completion-immediate.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/interactable-completion-handoff-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest rapid repeated interaction attempts at the locked shed and sealed drain. If their rejection feedback competes with the still-valid retry prompt, refine only that rejection-message ownership while preserving the immediate successful-action handoff and authoritative interaction state.
