# Right map-side handoff continuity polish — 2026-08-04

## Goal

Refine the selected key/valve transition beside the persistent course map so the player retains a clear rightward bearing while the protected edge card begins morphing into the centered world prop.

## Finding

The existing 48-pixel marker morph protected the complete card footprint and cleared the course map correctly, but the right-facing edge glyph disappeared as soon as the presentation entered `handoff`. During the first few pixels of lateral travel, the generated prop was still too faint to replace that directional information.

## Change

- Added a presentation-only `directionCue` to the shared key/valve handoff state.
- The cue is active only for a right-course-map handoff, follows the single morph panel, and fades smoothly through the first 55% of spatial progress.
- The early state therefore retains the right arrow while the prop is faint; the arrow is almost gone at the measured midpoint and fully retired before the centered prop owns the presentation.
- Exposed the cue direction and alpha through `render_game_to_text` so rendering and automated geometry checks consume the same state.
- Preserved the single label owner, 48-pixel spatial transition, projected world anchor, generated prop art, ground interaction ring, selected-route hierarchy, 484–988 safe panel region, and map clearance.
- No objective availability, interaction radius, target selection, route geometry, collision, movement, camera behavior, Joe AI, scoring, audio, or input behavior changed.

## Validation

- `node --check web/game.js` passed.
- Focused gameplay validation passed 18/18.
- Expanded-HUD responsive validation passed 192/192 at:
  - 2560×1600 high resolution
  - 1280×720 standard
  - 844×390 compact
  - 1280×720 Reduced Camera Motion
- Deterministic right-side captures cover protected edge, early handoff, midpoint handoff, and centered prop states in all four configurations.
- Automated checks confirm the edge card and live interpolated morph footprint remain fully left of x=988, early cue alpha remains above 0.6, midpoint cue alpha falls below 0.25, and the centered panel remains map-safe.
- Direct inspection confirmed one readable `SHED KEY` label, a visible early right arrow, a nearly retired midpoint arrow, legible generated prop art, and no HUD, course-map, reticle, or neighboring-marker overlap.
- The official uninstrumented client smoke reached the normal opening tactical handoff with no browser-error artifact. Canvas rendering averaged 7.04ms with a 2.00ms final sample across 104 rendered frames.

## Evidence

- Standard early handoff: `output/route-pressure-visual-validation/02-standard-right-marker-transition-early.png`
- Standard midpoint handoff: `output/route-pressure-visual-validation/02-standard-right-marker-transition-handoff.png`
- High-resolution early handoff: `output/route-pressure-visual-validation/01-high-resolution-right-marker-transition-early.png`
- Official regression: `output/right-map-handoff-continuity-official-2026-08-04/shot-0.png`
- Responsive state matrix: `output/route-pressure-visual-validation/latest-state.json`

## Next suggested refinement

Human-playtest small alternating lateral corrections beside the course map. If the bearing feels too persistent or too brief, tune only the 55% cue fade window while preserving the single-panel owner, complete footprint protection, and projection-driven transition.
