# Clean Break quiet-hold presentation polish — 2026-08-09

## Finding

The complete Audit Bell success replay proved the Clean Break mechanics, reward, live badge, and next-objective handoff were intact. It also exposed a visual hierarchy problem at the mastery climax: the generic world marker rendered a large detached `||` during the hold and `OK` after completion, while the instruction sat in a separate small card. The state read as debug notation instead of one deliberate stealth interaction.

## Resolution

- Kept `SAFE BREAK // <cover>` as the spatial world marker until the exact authored sight blocker is reached.
- Replaced the reached-cover glyph with one dark, bordered, screen-stable tactical panel.
- Combined the current state, live 0.9-second progress bar, `JOE CHECK` countdown, named-cover instruction, and numeric or completed progress in that panel.
- Changed the completed state to mint `SIGNAL MASKED` / `MASK COMPLETE` without changing the existing quiet-hold, cover, signal, score, search, survival, or objective rules.
- Exposed the presentation through text diagnostics and added the `clean_break_hold_presentation` readiness contract plus static release guards.

## Verification

- `node --check web/game.js` — passed.
- `node --check tools/verify-release.mjs` — passed.
- `node tools/verify-release.mjs` — passed with 48 referenced runtime assets, no unreferenced images, no source masters shipped, 85 deterministic action scenarios, and no warnings or failures.
- Native-input browser replay reached Hedge Tunnel, showed partial hold progress, completed `SIGNAL MASKED`, awarded the existing Audit Bell Clean Break, and returned navigation to Field Log.
- The repository's official web-game client replayed the same live activation and breakaway route with no browser error artifact.
- Visual inspection passed at 1280×720, compact 800×600, and high-resolution 2560×1600. The panel remained contained below the hard-cover cue and clear of the map, attention panel, bottom controls, and pause action.

No ImageGen asset was needed. This pass deliberately preserves the existing generated station, hedge, lantern, and course art and improves the presentation layer that communicates their gameplay meaning.
