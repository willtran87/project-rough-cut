# Collision-contact reticle-clearance polish — 2026-08-03

## Goal

Keep the authoritative impact card readable when the object that stops the player is directly ahead of the centered reticle.

## Observed issue

The natural grounds-cart route produced a clean off-center `BLOCKED BY` card, but the same geometry placed directly ahead caused the persistent `+`—which renders later—to enter the orange panel. That could damage either the obstacle name or the escape instruction at the exact moment collision feedback needs to be clearest.

## Resolution

- Centralized active collision-obstacle resolution instead of rebuilding the fallback object inside the draw function.
- Added a shared collision-contact presentation helper using the transformed physical footprint, panel bounds, and reticle bounds.
- Preserved the existing grounded default placement for off-center impacts.
- Raises only a panel that would intersect the centered reticle into a protected upper slot.
- Retains a continuous orange tether from the relocated panel to the actual collision footprint.
- Guarantees 34 canvas pixels between the protected panel and reticle in the centered reference case.
- Reports the presentation mode, avoidance decision, and measured clearance through `render_game_to_text`.

No collision physics, escape-direction calculation, obstacle footprint, map geometry, input, camera, audio, timing, or gameplay rule changed.

## Verification

`node --check web/game.js`

`node output/audit-collision-contact-layer.mjs`

- 7/7 focused assertions passed.
- Covered centered and off-center cart impacts, 2560x1600, 1280x720, 844x390, Reduced Camera Motion, text-state parity, and browser errors.

Required official client:

`node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/footprint_collision.json --iterations 1 --pause-ms 80 --screenshot-dir output/collision-contact-reticle-official-2026-08-03`

- Reproduced the natural off-center grounds-cart impact with the original grounded card placement and 38.1px reticle clearance.
- No client error artifact.
- Canvas work averaged 1.90ms, with a 1.70ms final sample across 233 rendered frames.

## Visual evidence

- `output/collision-contact-layer-audit/01-high-resolution-centered-cart.png`
- `output/collision-contact-layer-audit/02-standard-centered-cart.png`
- `output/collision-contact-layer-audit/03-compact-centered-cart.png`
- `output/collision-contact-layer-audit/04-standard-centered-cart-reduced-motion.png`
- `output/collision-contact-layer-audit/05-standard-off-center-cart.png`
- `output/collision-contact-reticle-official-2026-08-03/shot-0.png`
