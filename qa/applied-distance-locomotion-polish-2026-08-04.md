# Applied-distance locomotion polish QA — 2026-08-04

## Goal

Make walking and sprinting feel more grounded and truthful by coupling first-person motion effects to world distance the player actually covers. A held key against a solid boundary must not continue to imply forward travel, while authored slow terrain should naturally reduce visual cadence without changing gameplay values.

## Implementation

- Every movement step records requested distance, applied distance, and the simulation interval.
- The locomotion phase accumulates only from applied world distance.
- Camera bob, shoulder roll, stride impact, zoom surge, speed streaks, peripheral rush, and near-field turf bands require real translation.
- Existing speed streaks now advance from accumulated course travel instead of elapsed wall-clock time.
- Three-to-five restrained perspective turf bands strengthen lower-field parallax during real traversal and scale with sprint/panic presentation.
- Directional movement feedback remains input-driven, so blocked attempts still communicate intent while collision feedback explains the correction.
- Reduced Camera Motion preserves translation truth and suppresses animated locomotion effects.

No movement speed, terrain slowdown multiplier, obstacle footprint, collision slide, route selection, Joe behavior, detection, scoring, audio, map, or asset changed.

## Automated verification

- `node --check web/game.js`: passed.
- `node --check output/validate-route-pressure-visual.mjs`: passed.
- `node output/validate-route-pressure.mjs`: 18/18 passed with no browser errors.
- High-resolution-only visual/state run at 2560x1600: 92/92 passed.
- Full responsive/state matrix: 368/368 passed.
  - 2560x1600 desktop
  - 1280x720 desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Required uninstrumented web-game client: 465 rendered frames, 2.57ms average canvas render, 2.30ms final render, no browser-error artifact.

## Visual evidence inspected

- `output/route-pressure-visual-validation/01-high-resolution-footing-material.png`
- `output/route-pressure-visual-validation/01-high-resolution-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/03-compact-footing-material.png`
- `output/route-pressure-visual-validation/03-compact-boundary-contact-locomotion.png`
- `output/route-pressure-visual-validation/04-reduced-motion-footing-material.png`
- `output/route-pressure-visual-validation/04-reduced-motion-boundary-contact-locomotion.png`
- `output/distance-coupled-locomotion-official-2026-08-04/shot-0.png`
- `output/distance-coupled-locomotion-official-2026-08-04/state-0.json`

## Verified behavior

- Real footing travel reports `phaseSource: applied_world_distance`, positive requested/applied frame distances, active translation, and grounded turf rush in standard motion.
- A held input at the east course boundary reports moving intent but zero applied distance, zero translation ratio, zero bob, zero speed lines, zero peripheral rush, and zero turf bands.
- The collision card, escape direction, persistent map, course environment, objective state, and HUD remain readable in the blocked frame.
- Compact landscape retains the same distinction without crowding the field.
- Reduced Camera Motion removes animated locomotion effects while retaining requested-versus-applied state and collision guidance.

## Follow-up

Human-playtest long diagonal wall slides and rapid sprint transitions across footing edges. If adjustment is needed, tune only the turf-band opacity or count; preserve the applied-distance phase contract.
