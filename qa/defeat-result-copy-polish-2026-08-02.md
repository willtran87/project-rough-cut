# Defeat result-copy polish — 2026-08-02

## Scope

This pass refines the existing Sprint Terminated presentation and validates its action flow. It adds no capture rule, dialogue content, art family, course geometry, Joe behavior, difficulty modifier, score rule, or progression reward.

## Implemented

- Added bounded `fittedTextSize` use to both Joe dialogue lines, capture evidence, next-run counterplay, and the selected result-action description.
- Preserved normal authored font sizes whenever copy already fits.
- Set conservative minimum sizes so longer variants remain readable instead of overflowing their panels.
- Added deterministic ordinary-input capture, retry, and action-selection choreographies for the current course scale.

## Validation

The official web-game client ran three complete routes against `http://127.0.0.1:4173/`:

1. `web/test-actions/capture-audit-route.json` traveled outward through the course, caused a real Joe search, and backtracked into his path. Capture occurred in Audit Row at an 8-meter Joe distance with `held_sightline`; the screen displayed the matching evidence, counterplay, clinical Joe line, Retry selection, and all three result actions.
2. `web/test-actions/capture-audit-retry.json` confirmed Retry File end to end. The game returned to `first_hole`, reset progress to 0, set Joe to patrol at 188 meters, skipped the briefing, and loaded `counter_held_sightline` as the visible Incident Counterplan.
3. `web/test-actions/capture-audit-next-order.json` used Right to select Next Order. The visible orange selection, `ORDER 02 // EAST SHIFT` detail, and Next Action description matched `render_game_to_text`, which reported all three options: `rematch`, `next_order`, and `clubhouse`.

The capture still, dialogue card, incident review, action description, and buttons remained inside the 1280Ã—720 canvas with no clipping. Every route produced no console or page-error artifact. Result frames averaged 0.26â€“0.33ms of canvas render work, and the resumed retry frame averaged 1.01ms.
