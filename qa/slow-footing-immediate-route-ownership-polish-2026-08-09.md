# Slow-footing immediate-route ownership polish — 2026-08-09

## Finding

The settled Water Hazard replay placed the player inside Irrigation Mud at 54% pace while the immediate footing plaque correctly advised `CLEAR LEFT`. At the same moment, the persistent course map and mint world route continued to point toward the distant Field Log on the right. Both instructions were individually valid at different horizons, but together they created one contradictory movement decision during a high-pressure slowdown.

## Resolution

- Footing entry now latches the selected collision-clear side for that patch. Joe's subsequent movement cannot flip the recommendation while the player is crossing.
- A temporary `footing_hazard_escape` owner controls the first-person bearing, next waypoint, course-map header, dashed amber local route, and exit diamond.
- The long-horizon objective remains the authoritative mission target, but its mint world ribbon, reflectors, route segments, and caption yield while the local escape owns navigation.
- Clearing the footing removes the override and replans the same objective from the player's actual exit position.
- `render_game_to_text()` reports the immediate owner, zone, instruction, direction, local target, clearance, preserved objective, handoff, and the rule `one_immediate_route_owner_short_horizon_before_long_horizon`.
- Readiness now includes `footing_escape_navigation_ownership`, and the static release verifier guards the same contract.

## Cause-to-outcome validation

The official deep-route fixture reached Irrigation Mud at player position `(22, 223)` with a `0.54` surface multiplier and the Field Log `215.17m` away. The active route state reported:

- owner: `footing_hazard_escape`
- instruction: `CLEAR LEFT`
- local target: `MUD EXIT`, `26.73m`
- minimum obstacle clearance: `6.69m`
- map header: `CLEAR LEFT // MUD EXIT 27m`
- preserved objective: `field-log`
- visible objective reflectors: `0`
- visible objective route segments: `0`
- route caption: deferred by `footing_hazard_escape`

A native 180-frame ArrowLeft move then reached fairway at `(-24, 223)` with full pace. The immediate override was null, the Field Log remained active at `204.08m`, and its replanned route restored 11 reflectors and ten visible route segments. No state injection was used for this handoff.

## Visual and responsive validation

Visual inspection passed at:

- 2560×1600: 2508×1403.75 centered canvas
- 1280×720: 1209.375×673.265625 centered canvas
- 800×600: 769.625×428.015625 centered canvas

Each document matched its viewport exactly. The active views kept `CLEAR LEFT`, `MUD EXIT 27m`, the orange local map route, and the bottom slow-footing instruction readable without overlap. The cleared desktop view removed the local exit and visibly restored the Field Log lantern route.

## Runtime and release evidence

- readiness: 28/28
- estimated FPS: 60
- active responsive run: 2.68ms average, 4.4ms p95, 31.8ms observed max render time
- cleared handoff: 3.38ms average, 4.1ms p95
- browser errors: none
- asset failures: none
- release verifier: 48 runtime assets, 80 deterministic action scenarios, zero source masters, zero unreferenced runtime images, zero warnings, zero failures

This pass changed navigation presentation ownership only. Footing geometry and costs, objective progress, player movement, and Joe's awareness or pathing remain unchanged.
