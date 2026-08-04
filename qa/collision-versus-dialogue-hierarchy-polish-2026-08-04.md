# Collision-versus-dialogue hierarchy polish — 2026-08-04

## Goal

Keep collision recovery immediately actionable without losing the larger suspense consequence or unnecessarily discarding Joe's personality.

## Finding

The deterministic vertical-pass scenario produces a genuine water-pine collision while Joe begins creeping toward the player's wake. The frame could contain three truthful text owners at once:

- the tethered `BLOCKED BY // PINE` card and viable escape direction;
- the bottom wake warning and counterplay;
- an optional Joe bark.

The joke added no new tactical information during the 1.15-second physical correction and diluted the urgency of the other two messages.

## Change

- Added one collision-contact dialogue owner while `blockedTimer` is active.
- Optional Joe subtitles yield during that bounded contact window.
- The grounded collision card, orange contact footprint, viable escape chevron, and larger wake or pursuit warning remain visible.
- The bark text, context, and countdown are preserved rather than cleared, rerolled, or restarted.
- Joe dialogue no longer claims the general HUD signal lane while collision owns its local correction lane.
- Added `collision_contact` as the explicit `joeBarkDeferredBy` diagnostic in `render_game_to_text`.
- Changed no collision duration, obstacle geometry, escape-side selection, vertical-pass pressure, message timing, dialogue pool selection, Joe AI, movement, detection, scoring, audio, persistent map, subtitle setting, or art asset.

## Validation

- `node --check web/game.js` passed.
- `node --check output/validate-route-pressure-visual.mjs` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual/state validation passed 328/328 across isolated layouts, covering the combined water-pine collision and vertical-pass wake at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the updated frame retains one grounded escape correction and one larger suspense consequence without the optional subtitle, at both high-resolution and compact scale.
- The official uninstrumented client preserved the opening, first-steps guidance, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.50ms with a 2.10ms final sample across 105 rendered frames.

## Evidence

- High-resolution collision plus wake: `output/route-pressure-visual-validation/01-high-resolution-wake.png`
- Compact collision plus wake: `output/route-pressure-visual-validation/03-compact-wake.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/collision-dialogue-hierarchy-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest repeated glancing impacts during a natural chase. Confirm that a preserved bark returns only when it still has meaningful display time; if not, tune only the existing bark timer policy while preserving collision and threat-message priority.
