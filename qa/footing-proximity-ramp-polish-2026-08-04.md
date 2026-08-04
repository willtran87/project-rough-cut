# Footing proximity-ramp polish — 2026-08-04

## Intent

Turn the existing close-Joe footing warning from a binary color switch into a readable suspense curve without adding another HUD element or changing gameplay.

## Change

- The existing single footing plaque begins warming from amber when visible Joe enters 48 meters.
- Its established live-distance warning still activates at 36 meters.
- The treatment reaches full critical intensity at 24 meters.
- Close pressure adds one restrained outer-border cadence whose rate follows proximity; the plaque does not move, resize, or duplicate.
- Reduced Camera Motion keeps the proximity colors but presents the outer border statically.
- The ramp requires active footing guidance and Joe's honestly visible world label.
- Imminent noise warnings retain priority. Collision, movement drag, route choice, map state, detection, and Joe AI are unchanged.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 100/100 pass across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Dedicated 42-meter, 29-meter, and 23-meter captures confirmed `approaching`, `close`, and `critical` bands, monotonic normalized pressure, preserved plaque placement, visible Joe labeling, and reduced-motion-safe treatment.
- Visual inspection confirmed no overlap with Joe's grounded label, reticle, course map, Surroundings panel, or objective panels at every tested size.
- Official uninstrumented browser smoke reached `first_hole`, eleven meters of progress, and the `tactical_handoff` onboarding phase with no error artifact. Canvas work averaged 6.77ms and ended at 2.30ms across 105 rendered frames.

## Guardrails

- Never calculate or show pressure when physical cover hides Joe's world label.
- Preserve the single local plaque and the 36-meter live-distance boundary.
- Preserve imminent-noise priority and all existing hazard geometry and movement values.
- Keep Reduced Camera Motion static.
- If human testing needs tuning, adjust only the 48/24-meter visual ramp endpoints or bounded border amplitude before changing layout or information density.
