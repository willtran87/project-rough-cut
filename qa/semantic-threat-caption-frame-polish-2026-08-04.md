# Semantic threat-caption frame polish — 2026-08-04

## Outcome

Threat-caption borders now reinforce the same semantic category as their text. Danger uses orange, mower state uses amber, and ambient world information retains sage. The Settings caption preview consumes the live mower-amber theme so players see the real treatment before returning to the course.

The shared subtitle-card primitive retains its original sage default. Opening subtitles and Joe dialogue therefore remain unchanged unless a caller explicitly provides a semantic frame.

## Preserved systems

- Caption text, direction, category, queue order, timing, and expiry
- Severity-first collision-release selection and recency tie-breaking
- Collision-release geometry and the measured 12-pixel gutter
- Caption background opacity and subtitle-size accessibility settings
- Joe awareness, dialogue, movement, detection, AI, and pursuit
- Route thread, cover state, map, scoring, audio, controls, and generated art

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 356/356 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Direct inspection confirmed the danger-orange frame in high-resolution, compact, and Reduced Camera Motion release captures.
- Official Settings preview — correct `settings` mode and `mix` page; 71 rendered frames, 4.46ms average canvas render, 1.30ms final sample, no browser-error artifact.
- Official gameplay traversal — 473 rendered frames, 2.58ms average canvas render, 2.20ms final sample, no browser-error artifact.

## Evidence

- High-resolution danger frame: `output/route-pressure-visual-validation/01-high-resolution-collision-bark-repeated-settle.png`
- Compact danger frame: `output/route-pressure-visual-validation/03-compact-collision-bark-repeated-settle.png`
- Reduced-motion danger frame: `output/route-pressure-visual-validation/04-reduced-motion-collision-bark-repeated-settle.png`
- Settings preview: `output/semantic-caption-frame-settings-official-2026-08-04/shot-0.png`
- Settings state: `output/semantic-caption-frame-settings-official-2026-08-04/state-0.json`
- Gameplay traversal: `output/semantic-caption-frame-gameplay-official-2026-08-04/shot-0.png`
- Gameplay state: `output/semantic-caption-frame-gameplay-official-2026-08-04/state-0.json`
