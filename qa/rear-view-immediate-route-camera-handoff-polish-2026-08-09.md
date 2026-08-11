# Rear-view immediate-route camera handoff — 2026-08-09

## Finding

- Holding Rear during the opening grounds-cart recovery rotated the course correctly but reprojected the body-relative forward clearance lane onto the ground behind the player.
- The reversed lane appeared to point right while the authoritative course map still said `CLEAR LEFT`, creating a dangerous contradiction during the exact moment Rear View is meant to support a tense decision.
- The same projection path was shared by active slow-footing escape geometry.

## Refinement

- Added a bounded camera handoff for collision-clearance and slow-footing routes. Forward world geometry fades between the opening and midpoint of the rear turn and is fully retired before the camera faces backward.
- Rear View now reuses its established center panel for one compact handoff: it preserves Joe or anomaly information on the first line, then names the input-aware release action, body-relative direction, local target, and exact distance.
- The course map retains the same local route throughout. Releasing Rear restores the original world corridor and marker from the current camera state without changing the route owner.
- Movement, collision, footing cost, target selection, map geometry, Joe AI, detection, scoring, timing, and the rear camera itself are unchanged.

## Verification

- Added `rear_view_immediate_route_handoff`, bringing readiness to 37/37. It verifies forward and rear camera alpha endpoints, collision and footing copy, body-relative movement, map retention, world-route deferral, and the forward-return rule.
- The official web-game client completed the established collision-route handoff regression at 60 estimated FPS, 2.43 ms average render work, 4.2 ms p95, 29.4 ms observed max, and no browser errors.
- In the collision replay, forward view retained the player-origin `GROUNDS CART CLEAR` corridor at alpha 1. Full Rear View exported route alpha 0 and `deferredBy: rear_view`, retained `CLEAR LEFT` on the map, and displayed `RELEASE R // BODY LEFT // GROUNDS CART CLEAR 7m`. Returning forward restored the same route at alpha 1. All three states passed readiness 37/37.
- The complete Audit Bell-to-Irrigation Mud replay repeated the chain for slow footing. Full Rear View removed the amber world corridor, retained `CLEAR LEFT // MUD EXIT 27m` on the map, and displayed `RELEASE R // BODY LEFT // MUD EXIT 27m`; returning forward restored the player-origin escape corridor and ended at readiness 37/37.
- Collision visual inspection passed at 2560x1600, 1280x720, and 800x600. Canvas, shell, and document stayed within every viewport, the two-line handoff panel remained centered and readable, and no HUD, gate art, course map, or control rail clipped or overlapped.
- No ImageGen asset was needed. This refinement prevents existing generated gate, grounds-cart, and footing art from being undermined by a camera-space navigation contradiction.

## Evidence

- `output/rear-immediate-route-forward-regression-2026-08-09/shot-0.png`
- `output/rear-immediate-route-forward-regression-2026-08-09/state-0.json`
- `output/rear-immediate-route-handoff-after-2026-08-09/forward-collision-route.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/rear-collision-route.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/forward-return-route.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/forward-state.json`
- `output/rear-immediate-route-handoff-after-2026-08-09/rear-state.json`
- `output/rear-immediate-route-handoff-after-2026-08-09/forward-return-state.json`
- `output/rear-immediate-route-handoff-after-2026-08-09/rear-2560x1600.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/rear-1280x720.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/rear-800x600.png`
- `output/rear-immediate-route-handoff-after-2026-08-09/layout.json`
- `output/rear-footing-route-handoff-after-2026-08-09/forward-footing-route.png`
- `output/rear-footing-route-handoff-after-2026-08-09/rear-footing-route.png`
- `output/rear-footing-route-handoff-after-2026-08-09/forward-return-route.png`
- `output/rear-footing-route-handoff-after-2026-08-09/forward-return-state.json`

## Cleanup

- Temporary collision and footing browser harnesses were removed after verification.
- The isolated local server on port 4199 was stopped after verification.
