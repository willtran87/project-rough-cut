# Cover-ring transition continuity polish — 2026-08-04

## Goal

Remove the visual snap when compound cover changes between occupied-exposed and genuinely concealed states without delaying gameplay truth.

## Finding

The compound shed correctly switched between a segmented sage `AT COVER` ring and a solid mint `CONCEALED` ring. When Joe crossed a wall edge, however, replacing the complete pattern on one rendered frame could resemble flicker even though the authoritative sightline result was stable and correct.

## Change

- Added a bounded 160-millisecond presentation handoff for the currently owned cover socket.
- The newly authoritative ring appears immediately at 72% or greater emphasis and reaches full emphasis through the handoff.
- The previous ring persists only as a faint 38%-maximum afterimage and fully retires at the end of the interval.
- The text label and underlying cover state change immediately; the handoff affects only ring rendering and never grants detection grace.
- Changing to a different shelter resets the transition rather than carrying old geometry between owners.
- Reduced Camera Motion uses an instantaneous pattern change with no afterimage.
- Added previous ring role, eased transition progress, duration, and presentation mode to `render_game_to_text`.
- Changed no sightline intersection, hard-cover calculation, blocker ownership, collision footprint, interaction radius, route selection, movement, detection, Joe AI, scoring, audio, persistent map, label timing, or art asset.

## Validation

- `node --check web/game.js` passed.
- `node --check output/validate-route-pressure-visual.mjs` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual/state validation passed 316/316 across isolated layouts, covering the first authoritative frame, 80-millisecond midpoint, settled state, and Reduced Camera Motion bypass at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the new mint state is readable immediately, the retiring segmented ring remains subordinate, and the midpoint neither obscures the exit panel nor becomes heavy at compact scale.
- The official uninstrumented client preserved the opening, first-steps guidance, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.14ms with a 1.50ms final sample across 104 rendered frames.

## Evidence

- High-resolution handoff start: `output/route-pressure-visual-validation/01-high-resolution-shed-cover-concealment-handoff-start.png`
- High-resolution handoff midpoint: `output/route-pressure-visual-validation/01-high-resolution-shed-cover-concealment-handoff-mid.png`
- High-resolution settled state: `output/route-pressure-visual-validation/01-high-resolution-shed-cover-concealed.png`
- Compact midpoint: `output/route-pressure-visual-validation/03-compact-shed-cover-concealment-handoff-mid.png`
- Reduced Motion immediate state: `output/route-pressure-visual-validation/04-reduced-motion-shed-cover-concealment-handoff-start.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/cover-ring-handoff-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest repeated lateral Joe passes around the shed walls. If the afterimage feels too brief or too visible, tune only the 160-millisecond duration or retiring alpha; preserve immediate authoritative truth, per-shelter ownership, and the Reduced Camera Motion bypass.
