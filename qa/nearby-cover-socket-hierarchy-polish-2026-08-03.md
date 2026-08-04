# Nearby-Cover Socket Hierarchy Polish — 2026-08-03

## Problem

A natural late-route frame presented two nearby shelters—the start hedge and grounds cart—with full-strength ground ellipses and separate `COVER` labels. Both shelters were mechanically valid, but equal visual emphasis made the playfield look annotated rather than physical while shot correction, Joe dialogue, distraction state, and route guidance were also active.

## Resolution

- Visible cover sockets within the existing 11-meter presentation margin are ranked by occupied state, footprint clearance, and distance.
- One primary shelter owns the full mint/olive ring and `COVER` or `IN COVER` label.
- Secondary shelters retain their art, contact shadow, soil grounding, collision, concealment, and line-of-sight function with a subdued unlabeled stroke.
- The maintenance shed participates in the same ranking without changing its terminal or escape behavior.
- A matching orange collision contact still defers the selected mint cover cue under the established single-boundary rule.
- Text state reports the owner, nearby candidate list, suppressed count, visibility, and presentation contract.

## Verification

- `node output/validate-cover-socket-hierarchy.mjs` — 12/12 checks passed.
- `node output/audit-collision-contact-layer.mjs` — 19/19 checks passed.
- Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Camera Motion.
- The official late-route replay reported `obstacleId: start-hedge`, nearby IDs `start-hedge` and `service-cart`, and `suppressedNearby: 1` with no browser errors.
- The official replay averaged 2.02ms canvas rendering with a 1.90ms final sample across 461 frames.

## Visual evidence

- `output/polish-late-course-baseline-2026-08-03/shot-0.png`
- `output/cover-socket-hierarchy-official-2026-08-03/shot-0.png`
- `output/cover-socket-hierarchy-validation/01-high-resolution.png`
- `output/cover-socket-hierarchy-validation/03-compact.png`
- `output/cover-socket-hierarchy-validation/04-standard-reduced-motion.png`

## Follow-up boundary

Human-playtest a shelter transition inside Service Maze. If the primary label changes before the intended destination feels visually dominant, tune only the 11-meter presentation margin or ranking tie-break; do not remove secondary cover collision or concealment.
