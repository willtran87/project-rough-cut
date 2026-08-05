# Shed Approach Clearance Polish — 2026-08-05

## Problem

The maintenance-shed exit appeared blocked by surrounding obstacles. Static inspection found no single impossible collider, but the last release cart and stone cover forced a narrow central handoff immediately before a second squeeze formed by the hedge-gate wings, shed walls, and solid door. The stacked chokes made the filing apron difficult to approach under pursuit.

## Resolution

- Moved `release-cart` from `x = -44` to `x = -56`.
- Moved `release-stone` from `(42, 680)` to `(58, 678)`.
- Reduced both invisible `release-arch` wing radii from `radiusX = 15` to `12.5`, keeping their positions and visible tunnel art unchanged.
- Moved the shed wall blockers outward from `x = -42 / 6` to `x = -44 / 8` and reduced each `radiusX` from `8.5` to `7`.
- Reduced the solid shed-door ellipse from `radiusX = 15, radiusY = 4.5` to `radiusX = 13, radiusY = 4`.

The visible chicane, cover choices, sight blocking, map language, and solid shed remain. The adjustment opens one deliberate, legible approach instead of removing the late-game decision space.

## Regression Contract

`shedApproachReadabilityState()` samples this authored route at intervals of no more than two meters:

1. `(24, 640)`
2. `(18, 654)`
3. `(6, 670)`
4. `(-8, 684)`
5. `(-18, 699)`

Each sample uses `obstacleAtPosition()` with the authoritative `PLAYER_COLLISION_RADIUS = 2.4`. The audit also measures edge clearance against every blocking ellipse and confirms that the final sample lies inside `SHED_EXIT.radius`.

## Verification

- `node --check web/game.js`: passed.
- `git diff --check -- web/game.js web/README.md progress.md qa/shed-approach-clearance-polish-2026-08-05.md`: passed.
- Official web-game Playwright client: reached live Hole 1 with no browser-error artifact.
- Live `render_game_to_text()` result:
  - `clear: true`
  - `blockingIds: []`
  - `minimumClearanceMeters: 4.6`
  - `sampledPoints: 37`
  - `interactionReachable: true`
  - `interactionDistanceMeters: 11`
  - `interactionRadiusMeters: 16`
- Direct screenshot inspection confirmed the existing opening presentation, first-person route language, and persistent map still render correctly.

## Human Check

Approach the shed through Release Corridor during an active pursuit. The cart and stone should still force a visible choice, but the aligned center lane should carry the player through the hedge gate and into filing range without an unexplained collision. Preserve the solid, opaque shed response when contacting its walls or door.
