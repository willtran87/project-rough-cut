# Maximum-size caption-preview layout polish — 2026-08-04

## Outcome

The Settings caption preview now contains the full 140% accessibility size without crowding its header or lower border. A semantic `MOWER // AMBER` tag identifies the demonstrated warning category, and the preview panel remains separated from fullscreen and button controls.

When threat captions are disabled, the header tag becomes `DISABLED` and the existing off-state message remains centered in the same panel.

## Geometry contract at 140%

- Preview panel: y 480–540
- Header baseline: y 494
- Estimated header text bottom: y 496
- Caption card: y 498–535
- Header clearance: 2 canvas pixels
- Bottom padding: 5 canvas pixels
- Footer baseline: y 548
- Panel-to-footer clearance: 8 canvas pixels

## Preserved systems

- Caption size range, steps, persistence, and live adjustment
- Caption backdrop and threat-caption toggles
- Shared mower-amber semantic theme
- Keyboard, controller, touch, and pointer settings interaction
- Settings return targets, key bindings, audio controls, and modal bounds
- Gameplay captions, Joe behavior, movement, detection, scoring, map, and art

## Validation

- `node --check web/game.js` — pass
- `node --check output/validate-route-pressure-visual.mjs` — pass
- Responsive visual/state matrix — 360/360 checks passed:
  - 2560x1600 high resolution
  - 1280x720 standard desktop
  - 844x390 compact landscape
  - 1280x720 Reduced Camera Motion
- Focused movement and pursuit validation — 18/18 checks passed
- Official keyboard Settings flow — `settings` / `mix` / `subtitle_size` at 1.4; 81 rendered frames, 2.82ms average canvas render, 1.20ms final sample, no browser-error artifact.

## Evidence

- High-resolution maximum size: `output/route-pressure-visual-validation/01-high-resolution-caption-preview-max-size.png`
- Compact maximum size: `output/route-pressure-visual-validation/03-compact-caption-preview-max-size.png`
- Reduced-motion maximum size: `output/route-pressure-visual-validation/04-reduced-motion-caption-preview-max-size.png`
- Official keyboard flow: `output/caption-preview-max-size-official-2026-08-04/shot-0.png`
- Official state: `output/caption-preview-max-size-official-2026-08-04/state-0.json`
