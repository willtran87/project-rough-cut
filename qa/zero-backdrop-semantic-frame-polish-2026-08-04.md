# Zero-backdrop semantic-frame polish — 2026-08-04

## Outcome

Threat captions retain a restrained category-colored outline when `CAPTION BACKDROP` is set to 0%. Their interior remains fully transparent, allowing the environment to stay visible while danger-orange, mower-amber, and ambient-sage categories preserve their identity.

This behavior is opt-in. Joe dialogue and opening subtitles retain the original frameless zero-backdrop presentation.

## Presentation contract

- Backdrop fill alpha at 0%: 0
- Semantic threat-frame multiplier at 0%: 0.42
- Semantic frame at normal backdrop levels: unchanged full strength
- Text treatment: existing category color and heavy dark readability stroke
- Caption size support: 80–140%

## Preserved systems

- Caption text, direction, queue, priority, duration, and expiry
- Caption backdrop persistence and live Settings adjustment
- Maximum-size preview containment and semantic category tag
- Joe dialogue, opening subtitle styling, AI, awareness, and detection
- Collision release, route guidance, cover, map, movement, scoring, audio, and art

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 360/360 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct gameplay inspection covered zero-backdrop danger warnings over the full course composition at high resolution, compact landscape, and Reduced Camera Motion.
- Official keyboard Settings flow — `caption_background` at 0 and `subtitle_size` at 1.4; 104 rendered frames, 2.04ms average canvas render, 0.90ms final sample, no browser-error artifact.

## Evidence

- High-resolution gameplay: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-zero-backdrop.png`
- Compact gameplay: `output/route-pressure-visual-validation/03-compact-collision-bark-zero-backdrop.png`
- Reduced-motion gameplay: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-zero-backdrop.png`
- High-resolution Settings: `output/route-pressure-visual-validation/01-high-resolution-caption-preview-max-size.png`
- Official keyboard flow: `output/zero-backdrop-semantic-frame-official-2026-08-04/shot-0.png`
- Official state: `output/zero-backdrop-semantic-frame-official-2026-08-04/state-0.json`
