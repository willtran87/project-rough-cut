# Shed solidity and field-objective route — 2026-08-04

## Outcome

- The maintenance shed now remains fully opaque during approach and collision contact.
- A new center `shed-door` collision ellipse overlaps the existing left and right shed-wall bodies, preventing the player from crossing the visible doorway and forcing the landmark to cull behind the camera.
- The normal interaction radius remains reachable in front of the new solid footprint, so filing is not blocked by the collision fix.
- Three mandatory Night Order field checks now form an east-west-east route across the existing Hole 1 course:
  1. `CHECK 1 // AUDIT BELL` at `(86, 148)`.
  2. `CHECK 2 // FIELD LOG` at `(-98, 420)`.
  3. `CHECK 3 // RELEASE REVIEW` at `(97, 624)`.
- Each station retains a grounded interaction ring, appears on the course map, updates the objective ledger and navigation ribbon, and creates a loud signal that sends Joe to investigate. A later art-completion pass moved these stations from reused course-mechanic cells to the dedicated `rough-cut-night-order-objectives-v1.png` atlas; see `qa/dedicated-night-order-objective-art-polish-2026-08-04.md`.
- Shed and drain Final Filing both require all three checks plus their existing access condition. An early filing attempt produces one explicit `CHECKS OPEN` rejection instead of silently failing.

## Validation

- `node --check web/game.js` passed.
- Focused shed/objective validation passed 9/9 with no browser errors. It exercised all three action prompts, sequential completion, Joe investigation, exit gating, center-door collision, player non-penetration, full shed opacity, and generated-art assignment.
- Focused movement/pursuit validation passed 18/18.
- Existing shed and drain objective-access validation passed 5/5, including complete escape handoffs after the required checks.
- High-resolution visual/state validation passed 101/101 at 2560×1600.
- Standard, compact, and Reduced Camera Motion validation each passed 101/101; total responsive matrix coverage is 404/404.
- The official uninstrumented web-game client reached `first_hole` without a browser-error artifact. Its state reported `FIELD CHECKS 0/3`, Audit Bell navigation, all three generated-art stations, and a fully opaque solid shed doorway.

## Visual inspection

- All three stations retain crisp pixel-art silhouettes, planted bases, projected range rings, input-aware prompts, and distinct objective colors.
- Completed-check markers remain visible on the map while the selected route advances to the next station.
- Direct shed contact shows the intact landmark, the exact `SHED DOOR` blocker, and `MOVE BACK TO CLEAR`; the image does not fade or disappear.

## Scope

No new level zone or art-generation request was needed. The new objectives deliberately reuse the existing generated course-mechanics atlas, preserving the established high-detail pixel-art direction while adding meaningful route pressure inside the current course.
