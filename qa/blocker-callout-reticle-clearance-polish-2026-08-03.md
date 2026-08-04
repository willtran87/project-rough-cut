# Blocker-callout reticle-clearance polish — 2026-08-03

## Goal

Keep first-person collision guidance readable when a nearby solid object projects directly behind the centered reticle.

## Observed issue

The ordinary opening route placed `SOLID // GROUNDS CART 3m` across the screen center. The blocker card rendered after the cart art, but the persistent `+` reticle rendered later and landed inside `CART`, making the label look clipped even though its panel and tether were otherwise correct.

## Resolution

- Added a shared blocker-callout presentation helper.
- Preserved the existing 370px default label slot.
- Detects only panels whose horizontal and vertical bounds would intersect the reticle.
- Moves those centered panels into a protected 340px slot with at least 20px of vertical panel-to-reticle clearance.
- Leaves off-center panels at 370px and fully left of the course map.
- Preserves the existing world tether and physical obstacle anchor.
- Reports blocker presentation as `single_world_label_crosshair_safe` through `render_game_to_text`.

No collision, obstacle scale, map footprint, context priority, route, camera, or gameplay rule changed.

## Verification

`node --check web/game.js`

`node output/audit-blocker-callout-layer.mjs`

- 9/9 focused assertions passed.
- Covered centered and off-center cart approaches, 2560x1600, 1280x720, 844x390, Reduced Camera Motion, map clearance, and browser errors.

`node output/validate-score-handoff-context.mjs`

- 8/8 existing context-handoff assertions passed.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 300 --screenshot-dir output/blocker-callout-crosshair-official-2026-08-03-final`

- Reproduced the opening grounds-cart case with the complete label and visible reticle.
- No client error artifact.
- Canvas work averaged 2.25ms, with a 2.10ms final sample across 202 rendered frames.

## Visual evidence

- `output/blocker-callout-layer-audit/01-high-resolution-cart.png`
- `output/blocker-callout-layer-audit/02-standard-cart.png`
- `output/blocker-callout-layer-audit/03-compact-cart.png`
- `output/blocker-callout-layer-audit/04-standard-cart-reduced-motion.png`
- `output/blocker-callout-layer-audit/05-standard-cart-off-center.png`
- `output/blocker-callout-crosshair-official-2026-08-03-final/shot-0.png`
