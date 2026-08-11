# Slow-footing threat/route role-separation polish — 2026-08-10

## Finding

The live deep-route replay reached `IRRIGATION MUD` with an internally correct but visually contradictory decision: the immediate bottom rail, map header, and grounded orange corridor correctly said `CLEAR LEFT`, while the field caption said `FOOTING DRAG // JOE KEEPS MOVING — AHEAD`. That suffix was not a real threat bearing. The caption had been anchored to the player's own entry coordinates, so the generic direction helper always resolved the coincident source as `AHEAD`.

## Resolution

- Kept the existing footing-navigation override as the single safe-route owner: `CLEAR LEFT`, `BEAR LEFT`, and `MUD EXIT` remain unchanged in the rail, map, and first-person route.
- Replaced the redundant footing caption with the compact mower-amber `JOE KEEPS MOVING` cue, anchored to Joe's current position.
- Added a shared caption specification and a text-state `entrySignal` payload that explicitly names the threat as `joe_bearing` and the bypass as `safe_route`.
- Added `footing_entry_signal_role_separation` to readiness and the release verifier.

No slowdown, noise, route geometry, player movement, Joe AI, detection, audio, objective, score, or timing value changed.

## Verification

- `node --check web/game.js`
- `node --check tools/verify-release.mjs`
- `node tools/verify-release.mjs` — 48 runtime assets, 87 action scenarios, zero warnings/failures.
- Official ordinary-input deep route: `output/footing-threat-route-separation-official-2026-08-09`.
- Fresh parallel ordinary-input responsive replays: `output/footing-threat-route-separation-responsive-2026-08-09`.

The official snapshot reports 55/55 readiness, an active mower caption `JOE KEEPS MOVING — RIGHT`, a safe route `CLEAR LEFT // MUD EXIT`, 60 estimated FPS, 2.69 ms average render work, 3.8 ms p95, 29.3 ms observed maximum, one long frame, and no asset failures. Fresh responsive states report the same right/left role split with no browser errors at 2560x1600 and 800x600. Canvas geometry is contained in both documents: 2508x1404 within 2560x1600 and 770x428 within 800x600.

## Art decision

No ImageGen asset was added. The generated mud, floodlight, foreground grass, Joe sprite, fog, moon, map, and route corridor already create a strong scene; the needed improvement was the meaning and direction of the existing tactical signal.
