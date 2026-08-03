# Opening signal-lane polish — 2026-08-01

## Scope

This pass refines only the presentation hierarchy during the opening locked-gate message. It does not change course geometry, objectives, movement, Joe AI, detection, sound propagation, items, progression, or difficulty.

## Implemented

- Removed the redundant initial Tee arrival timer. The expanded Hole 1 dossier already identifies the starting zone and assignment.
- Added `openingBriefingOwnsSignalLane()` and the `opening_briefing` HUD focus state.
- While the bottom locked-gate objective is active, the South Gate state banner and ambient threat captions yield. The gate set piece still triggers, including its world effect, audio, dread/composure contribution, and internal state.
- Kept higher-priority gameplay states ahead of the opening focus so pursuit and critical actions remain authoritative.
- Synchronized `hudPresentation.focus`, `zoneBannerVisible`, `joeStateVisible`, and `maximumThreatCaptionCards` with the rendered result.

## Validation

The official web-game client ran three focused captures against `http://127.0.0.1:4173/`:

1. `web/test-actions/first_hole.json` reached 19 meters of travel while the opening message was active. It reported `focus: opening_briefing`, no zone card, no Joe/state banner, zero permitted threat cards, and preserved the objective, controls, route bearing, map, and physical course view.
2. `web/test-actions/opening-signal-handoff.json` allowed the opening presentation to clear. The expanded dossier collapsed to the compact field HUD without a stale Tee or South Gate card appearing afterward.
3. `web/test-actions/presentation-handoff.json` reached Audit Row at 94 meters. It reported `focus: zone_arrival` and displayed the normal Audit Row name, subtitle, bottom course cue, and route bearing with no overlapping ambient threat card.

All scenarios remained in `first_hole` and produced no console or page-error artifact. Sampled average canvas render work was 4.24ms for the cold opening, 2.07ms after the handoff, and 1.59ms in Audit Row.
