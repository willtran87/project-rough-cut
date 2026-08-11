# Clean Break map-state continuity polish — 2026-08-09

## Finding

The reached-cover world panel correctly transitioned from `MASK YOUR ROUTE` to `SIGNAL MASKED`, but the persistent map continued to identify the same reached cover as `HOLD QUIET 8m`. The player had already arrived and completed the hold, so the map contradicted both the world and the mechanic it was meant to support.

The first implementation aligned the map's state data, but screenshot inspection exposed a 120–160ms visual lag from the existing minimap render cache. At the exact completion frame, the center panel could say `SIGNAL MASKED` while the cached map still showed `HOLD STILL 0.8/0.9s`.

## Resolution

- Preserved cover name and distance during the pre-arrival breakaway route.
- Replaced destination copy with amber `HOLD STILL` and live 0.9-second progress after the exact authored sight blocker is reached.
- Replaced hold progress with mint `MASKED // STAY HIDDEN` when the hold completes.
- Kept the cover target available to route and map geometry while suppressing stale destination distance after arrival.
- Added a critical minimap cache key for route, hold, masked, and signal-ended phases. Those discrete state changes now redraw immediately while ordinary minimap rendering retains its bounded 120–160ms cadence.
- Restored Field Log guidance immediately when the Audit Bell signal ended.
- Exposed the map presentation through text diagnostics and added the `clean_break_map_hold_continuity` readiness contract plus static release guards.

## Verification

- `node --check web/game.js` — passed.
- `node --check tools/verify-release.mjs` — passed.
- `node tools/verify-release.mjs` — passed with 48 referenced runtime assets, no unreferenced images, no source masters shipped, 85 deterministic action scenarios, and no warnings or failures.
- A native-input replay reached Hedge Tunnel, captured partial `HOLD STILL 0.2/0.9s`, completed `MASKED // STAY HIDDEN`, retained the existing Clean Break reward, and returned the persistent map to Field Log after signal expiry.
- The final live state passed 41/41 readiness checks with no console or page errors.
- The repository's official web-game client reached the Audit Bell commitment state through unmodified gameplay, passed 41/41, and produced no browser-error artifact.
- Visual inspection passed at 1280×720, compact 800×600, and high-resolution 2560×1600. The map, world hold panel, Joe Attention timer, course art, and bottom controls remained contained and readable.

No ImageGen asset was needed. This pass aligns existing gameplay channels over the already-generated station, hedge, lantern, and course art.
