# Footing locomotion-label truth polish — 2026-08-04

## Intent

Keep movement response immediate without showing a generic pace word that contradicts the active slow-terrain state.

## Change

- `courseMovementFeedback()` now consults the existing footing signal owner before showing its text label.
- During entry feedback, the label reports `footing_entry_feedback` as its deferral owner.
- During a sustained crossing, it reports `footing_hazard_guidance`.
- Live directional chevrons, input directions, afterglow, camera response, cadence, and collision escape overrides remain active.
- Joe bark retains higher presentation priority when both systems are active.
- Full-pace recovery restores the ordinary movement label immediately.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 88/88 pass.
- Entry, sustained crossing, imminent-noise overlap, and recovery captures inspected at 2560×1600, 1280×720, 844×390, and 1280×720 Reduced Camera Motion.
- Entry and sustained states retained forward direction feedback with `labelVisible: false` and the correct footing owner.
- Recovery restored `labelVisible: true`, cleared the deferral owner, and retained the authoritative 1.0 movement multiplier.
- Official web-game client completed the opening first-person smoke with no browser-error artifact; canvas work averaged 6.82ms and ended at 2.20ms across 102 frames.
- Local test page returned HTTP 200 at `http://127.0.0.1:4173/`.

## Guardrails retained

- No movement speed, terrain penalty, noise floor, cadence, camera intensity, input, collision, Joe behavior, route, map, or timing changed.
- Directional feedback remains live throughout the crossing.
- Reduced Camera Motion retains the same semantic hierarchy without added movement.
