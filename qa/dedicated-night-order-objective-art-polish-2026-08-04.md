# Dedicated Night Order objective-art polish — 2026-08-04

## Outcome

The three newly mandatory field checks now use their own high-resolution ImageGen art family instead of repurposing cells from the older general course-mechanics atlas.

- Audit Bell: weathered brass bell, timber post, pull rope, and planted mossy base.
- Field Log: lit iron ledger kiosk, open field log, and mechanical stamp lever.
- Release Review: blackened-brass review gong, signature clipboard, acceptance lever, and amber task lamp.

The generated chroma source and transparent runtime atlas are preserved beside a full prompt and cell manifest in `web/assets/rough-cut-night-order-objectives-v1.md`.

## Integration truth

- Runtime source: `rough-cut-night-order-objectives-v1.png` (`1774 × 887`).
- The three source rectangles were measured from the final alpha silhouette, preventing adjacent-cell fragments.
- Each station keeps its authored turf base on the projected ground contact, with the existing dynamic interaction ring, proximity glow, navigation, map state, completion state, and sound response layered around it.
- The objective renderer reuses the established cached-atlas path, and idle-time priming now includes all three new cells.
- `customObjectArtAudit` now counts 13/13 generated object families and reports the new three-variant family independently.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for the changed source and documentation.
- The official `web_game_playwright_client.js` reached live Hole 1 without a browser-error artifact.
- Live text state reported all three objective cells ready, each action mapped to the new atlas, `customObjectArtAudit.status = complete`, 13/13 mapped families, and no missing custom-art IDs or families.
- The official live capture completed 144 rendered frames at 4.58 ms average canvas render and 1.90 ms final render.
- Direct alpha-art inspection confirmed clean transparent corners, distinct gutters, grounded full silhouettes, and no neighboring-cell contamination.

## Preservation contract

Do not replace these physical stations with procedural silhouettes or reuse unrelated atlas cells. Stateful guidance, labels, light, map symbols, and interaction feedback should remain runtime-owned because they must respond to distance, completion, accessibility preferences, and Joe's investigation state.
