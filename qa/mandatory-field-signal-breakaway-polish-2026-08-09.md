# Mandatory field-signal breakaway polish — 2026-08-09

## Finding

The three mandatory Night Order stations are deliberately loud and correctly redirect Joe to their world position. Immediately after completion, however, every navigation channel selected the next distant objective. At the Audit Bell this meant the UI encouraged a first-time player to leave toward Field Log while Joe approached the same station from up-course. The consequence was fair in simulation but poorly taught: the player was expected to invent a cover break that the route actively contradicted.

## Resolution

- Added an authored breakaway point to each mandatory station:
  - Audit Bell → hedge tunnel cover (`audit-arch-right`), 67.54 m from the station.
  - Field Log → service cart cover (`maze-cart`), 56.24 m from the station.
  - Release Review → range cart cover (`range-cart-east`), 49.68 m from the station.
- Every point is outside collision, reachable by the existing obstacle-aware planner, and has its named solid object as the authoritative blocker on the station-to-player sightline.
- While the field signal is active, breakaway guidance owns the world ribbon, reflectors, map bearing, rear bearing, and field-bearing target. Collision recovery retains higher priority if the player touches a blocker.
- The completion rail now leads with the station consequence and a specific cover instruction. Arrival changes the route and rail to `HOLD QUIET`, and the message confirms that the named cover blocks the station sightline.
- When the existing signal timer expires, ownership ends automatically and the normal objective planner resumes. Joe speed, hearing, distraction duration, search duration, collision, scoring, and objective order are unchanged.
- The route remains a decision rather than immunity: sprinting reaches cover quickly but generates audible movement and a turf trail that Joe can investigate.

## End-to-end evidence

A clean Standard Review run used ordinary keyboard input to file the Audit Bell and follow the generated breakaway route:

- Breakaway route activated as `field_signal_breakaway_override` with two waypoints.
- The player reached the safe point 5.09 m from its center while the signal remained active.
- Environment state reported `hardCover: true` and `lineBlockedBy: audit-arch-right`.
- Joe remained in the live investigation sequence rather than being frozen or reset.
- After holding quietly until signal expiry, the game remained in `first_hole` and navigation resumed `field-log / current_is_nearest` with seven obstacle-aware waypoints.
- The sprint created a fresh turf-evidence response, so Joe's established trail system continued to apply.
- Browser/page errors: none.

## Automated acceptance

- Added live readiness check `field_signal_breakaway_routes`; all three routes must be present, collision-clear, routeable, within 90 m, and sightline-blocked by their declared cover.
- Added `web/test-actions/release-hardening-field-signal-breakaway.json` for the staged-load-aware active-signal state.
- Added static release-verifier coverage for breakaway ownership, readiness, action fixture, and route state.
- `node --check web/game.js` passes.
- `node tools/verify-release.mjs` passes with 48 referenced runtime images, 60.75 MB, 79 action scenarios, and zero warnings or failures.
- Official replay: 20/20 live readiness, estimated 60 FPS, 6.3 ms render p95, and no error artifact.

## Visual acceptance

- 2560x1600: the complete 2508x1404 stage remained centered; the breakaway card, Joe Attention, map, station signal, and completion rail did not overlap.
- 1280x720: the 1209x673 stage retained identical hierarchy and readable fitted copy.
- Coarse-pointer 390x844: the complete 375x209 stage remained contained and the rotate-device prompt stayed visible above it.
- At the safe point, the generated hedge-tunnel art visibly obscured the station lane while `SAFE BREAK REACHED` and `HOLD QUIET` confirmed the mechanical state.

Physical controller, touch-device, and sustained representative-hardware feel sessions remain release gates.
