# Compound-cover visual truth polish — 2026-08-04

## Goal

Make the maintenance-shed cover socket reflect its real compound sightline geometry and communicate exposed versus concealed occupancy without adding another panel.

## Finding

The shed is rendered and described as one shelter, but its physical cover is authored as two invisible wall members: `shed-left-wall` and `shed-right-wall`. The local ground cue only accepted the synthetic `maintenance-shed` ID as a matching blocker. As a result, a side wall could correctly produce authoritative hard cover while the shared shed cue still reported `AT COVER`; its `CONCEALED` state was unreachable.

The occupied and concealed sockets also used nearly the same green treatment, requiring the player to read small text rather than understanding the state from the ground geometry.

## Change

- Added the two authored shed wall IDs to the shared maintenance-shed cover target.
- Kept authoritative concealment dependent on the existing `hardCover` result, but now accepts any blocker owned by the compound shelter.
- Added three restrained ring states to the existing projected socket:
  - solid mint for matching authoritative concealment;
  - segmented sage for occupied but exposed cover;
  - lightly dotted sage for approach.
- Kept the existing `CONCEALED`, `AT COVER`, and `COVER` labels synchronized with the same presentation result.
- Added ring role, ring pattern, authoritative blocker ID, and blocker-match truth to `render_game_to_text`.
- Preserved label deferral beneath collision, action, and blocked-result owners, plus offscreen screen-safety behavior.
- Changed no sightline intersection, hard-cover radius, collision footprint, interaction radius, route selection, movement, detection, Joe AI, scoring, audio, persistent map, or art asset.

## Validation

- `node --check web/game.js` passed.
- `node --check output/validate-route-pressure-visual.mjs` passed.
- Focused gameplay validation passed 18/18 with no browser errors.
- Responsive visual/state validation passed 312/312 across isolated layouts, including occupied-exposed and wall-concealed shed states at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Direct inspection confirmed the segmented occupied ring and solid concealed ring remain distinguishable against final-corridor soil, ground fog, and shed art at both high-resolution and compact scales.
- The official uninstrumented client preserved the opening, first-steps guidance, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas rendering averaged 6.25ms with a 2.50ms final sample across 102 rendered frames.

## Evidence

- High-resolution occupied-exposed state: `output/route-pressure-visual-validation/01-high-resolution-shed-cover-occupied.png`
- High-resolution wall-concealed state: `output/route-pressure-visual-validation/01-high-resolution-shed-cover-concealed.png`
- Compact occupied-exposed state: `output/route-pressure-visual-validation/03-compact-shed-cover-occupied.png`
- Compact wall-concealed state: `output/route-pressure-visual-validation/03-compact-shed-cover-concealed.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`
- Official regression: `output/compound-cover-truth-official-2026-08-04/shot-0.png`

## Next suggested refinement

Human-playtest the solid-to-segmented transition while Joe moves laterally behind the shed. If the visual shift feels too sharp or too quiet, tune only the ring contrast and dash cadence; preserve the authoritative hard-cover calculation and compound blocker ownership.
