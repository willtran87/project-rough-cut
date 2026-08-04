# Navigation target commitment-margin polish — 2026-08-04

## Outcome

Multi-objective guidance no longer flickers between nearby routes during small lateral corrections. The current target remains stable until an alternative is at least 8 meters closer, at which point every guidance surface switches together.

## Confirmed issue

The selector previously sorted all valid objectives by distance every update and returned the first entry. Near the Release Corridor midpoint, minor movement could repeatedly change the mathematically nearest exit and therefore flip:

- field bearing direction and color;
- world reflector path and caption;
- course-map target header;
- rear-bearing cue and objective text state.

That visual churn implied a route decision the player had not actually made.

## Implementation contract

- Select the genuinely nearest target when no incumbent remains available.
- Keep the incumbent while a different nearest candidate is less than 8 meters closer.
- Switch when the challenger's advantage reaches 8 meters.
- Measure all distances with the course's authored `worldDistance` function, including 72% lateral weighting.
- Preserve direct interaction with every available target regardless of guidance selection.
- Export selection reason, nearest candidate, incumbent, distances, advantage, and threshold through the first-person guidance state.
- Do not alter navigation geometry, world anchors, objectives, collision, movement, AI, detection, or exit availability.

## Deterministic scenario

- x=-25, y=650: shed is genuinely nearest and becomes the initial target.
- x=-33, y=650: drain is 2.22m closer, but gold shed guidance remains committed.
- x=-45, y=650: drain is 8.61m closer, so map, ribbon, caption, and target color switch together to teal.

## Validation

- `node --check web/game.js`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed.
- `node output/validate-route-pressure-visual.mjs` — 152/152 checks passed at:
  - 2560×1600
  - 1280×720
  - 844×390
  - 1280×720 with Reduced Camera Motion
- Inspected high-resolution, standard, compact, and Reduced Motion captures across initial, held, and committed states.
- The official uninstrumented opening smoke preserved `DRAIN VALVE` as the current nearest objective, produced no `errors-0.json`, averaged 7.21ms canvas work, and ended at 2.40ms across 91 rendered frames.

## Evidence

- Responsive captures: `output/route-pressure-visual-validation/*-dual-exit-*.png`
- Responsive state ledger: `output/route-pressure-visual-validation/latest-state.json`
- Official smoke: `output/navigation-commitment-margin-official-2026-08-04/`

## Suggested human check

Sprint laterally through the final midpoint with both exits available. Tune only the 8-meter margin if the switch feels too sticky or too eager; preserve synchronized guidance and immediate physical access to either exit.
