# Short collision-recovery first-person route polish

Date: 2026-08-09

Scope: preserve immediate first-person navigation from physical contact through the existing bounded collision-clearance follow-through. No level expansion, balance change, collision change, or new art family.

## Finding

The official `navigation_shed_escape.json` replay ended beside the opening grounds cart after its visible contact card had completed. Navigation still correctly owned a leftward collision-recovery waypoint 6.77 meters away, but the ordinary objective ribbon begins sampling at nine meters. The course map said `BEAR LEFT`; the first-person scene had zero reflectors and zero route-thread segments. This made a short physical correction depend on the map precisely when the authored cart filled much of the view.

## Resolution

- Added `collisionRecoveryWorldRoutePresentation()` as a compact projection of the existing authoritative recovery waypoint, not a second navigation planner.
- Added a player-origin dashed amber lane, ordered chevrons, an elliptical ground ring, diamond, and obstacle-specific clearance label.
- Kept the route beneath depth-sorted physical objects so the generated grounds-cart art retains solid visual ownership.
- Gave recovery priority over the local slow-footing corridor, preserving one immediate route owner.
- Mirrored the same recovery instruction, target, distance, player-to-target segment, and diamond in the persistent map.
- Retired the temporary route as soon as recovery completes; the existing objective planner then resumes from the player's real position.
- Added inspectable `worldRoute` diagnostics and the `collision_recovery_world_route_continuity` readiness contract.

## Verification

- `node --check web/game.js` passed.
- `node --check tools/verify-release.mjs` passed.
- `node tools/verify-release.mjs` passed with 48 referenced runtime assets, zero source masters, zero unreferenced runtime images, 80 deterministic action scenarios, and no warnings or failures.
- Official input replay reached the real grounds-cart recovery at player `(11, 36)`: `CLEAR LEFT`, `GROUNDS CART CLEAR`, one visible player-origin segment, a visible grounded marker, matching course-map copy, and no browser errors.
- The official recovery frame passed 31/31 readiness at an estimated 60 FPS with 4.7ms render p95 and 30.7ms observed max.
- A real additional 48-frame left move reached `(-8, 36)`, made recovery inactive, restored Audit Bell selection with `current_is_nearest`, and returned 11 reflectors plus ten ordinary route-thread segments. That handoff held an estimated 60 FPS with 4.5ms render p95 and no browser errors.
- Full-page visual inspection passed at 2560x1600, 1280x720, and 800x600. Each document matched its viewport, the cart remained opaque and grounded, both world and map directions were readable, and no UI panel overlapped the new route.

## Asset decision

No new ImageGen asset was necessary. The improvement is deliberately a gameplay projection layer beneath the existing dedicated ImageGen grounds cart, course surface, lantern, map, and environmental art; adding another prop would have weakened rather than clarified the contact-to-route relationship.
