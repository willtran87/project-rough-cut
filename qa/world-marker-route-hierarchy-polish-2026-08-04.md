# World-marker route-hierarchy polish — 2026-08-04

## Outcome

World objective markers now communicate the same selected-versus-alternate hierarchy as the map and ground-reflector route. The recommended target leads visually without hiding or disabling alternatives.

## Confirmed issue

After target-selection hysteresis was added, both final exit cards still carried nearly equal opacity and frame weight. The route ribbon, map header, and caption could agree on one target while the other world marker competed for attention.

## Presentation contract

- `selected_route`: full opacity, static two-pixel top rail, and one-pixel frame boost.
- `alternate_route`: complete card and text at 72% opacity.
- Alternate target in reach: full opacity and top rail through an explicit interaction override.
- `context`: unchanged presentation for non-route markers.
- The contract applies to `shed-key`, `sprinkler`, `maintenance-shed`, and `drain-exit` only.
- The treatment is static and identical under Reduced Camera Motion.

No target selection, availability, interaction radius, card placement, label fitting, map clearance, route planning, collision, movement, detection, or Joe behavior changed.

## Validation

- `node --check web/game.js`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed.
- `node output/validate-route-pressure-visual.mjs` — 156/156 checks passed at:
  - 2560×1600
  - 1280×720
  - 844×390
  - 1280×720 with Reduced Camera Motion
- Inspected selected-shed and selected-drain captures at high-resolution, standard, compact, and Reduced Motion layouts. Marker positions do not move; only rail, frame weight, and bounded opacity change.
- The official uninstrumented opening smoke reported `DRAIN VALVE` as `selected_route` at full opacity with top rail and `SHED KEY` as a 72% `alternate_route`. No `errors-0.json` was produced; canvas work averaged 8.52ms and ended at 4.20ms across 94 frames.

## Evidence

- Responsive captures: `output/route-pressure-visual-validation/*-dual-exit-*.png`
- Responsive state ledger: `output/route-pressure-visual-validation/latest-state.json`
- Official smoke: `output/world-marker-route-hierarchy-official-2026-08-04/`

## Suggested human check

Ignore the reflector route and walk directly into the alternate exit. Tune only the 72% out-of-reach emphasis if the alternate feels too quiet; preserve full label visibility and the in-reach override.
