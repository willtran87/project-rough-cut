# Level 1 drain collision and visible ownership

The closed drain previously allowed actual forward movement through its grate
and both stone shoulders. This pass gives the existing drain five shared player
and mower obstacles: two masonry shoulders, two hoist feet and the grate.
The nearby eastern passage stays open. This is a focused part of S7/N6, not
acceptance of the complete Level 1 experience.

## Implementation

- `web/drain-collision.js` shares authored physical dimensions with masonry and
  hoist construction. The carriage shoes set the grate's full width to 2.38 m.
  These are body obstacles, not full-height sight blockers.
- `web/collision-art-bounds.js` reads actual mesh vertices and world transforms,
  material/draw visibility, scene attachment and ownership. Readiness compares
  those bounds with the five collision footprints, within 0.025 m.
- Tagged vertex ranges keep both hoist feet in their existing merged mesh. Two
  masonry meshes retain identity for inspection instead of entering the static
  merge. This costs two separate mesh submissions; no performance win is claimed.
- Generic obstacle construction and decorative perimeter planting skip these
  separately owned drain parts. A screenshot exposed duplicate generic stone
  cover from the initial implementation; the corrected view is verified with
  screenshots and a central camera ray (nearest hit 3.7566 m, formerly 0.2484 m).
- A ready drain follows the shed's contact-feedback rule: solid contact remains,
  while the filing action takes priority over retreat advice. Facing still
  matters; the test looks down 0.35 radians at the release when very close.
- Collision remains static during accepted release, when normal course movement
  is stopped before victory. This does not introduce a traversable post-release
  gameplay area. Cache tag: `20261112-drain-collision`.

## Evidence

- Baseline `output/drain-collision/baseline/report.json`: forward movement from
  y=680 reached y=713.6 through the grate and both shoulders.
- Final `node tools/verify-drain-collision.cjs`, process 58163, exit 0: forward
  approaches stop at y=696.7871; eastern bypass still reaches y=713.6. Separate
  side approaches at y=705 stop at x=-95.91755 and x=-60.08276, proving masonry
  collision independently of the feet. Actual C crouch is asserted while moving.
- Five actual-art ownership checks pass. Ten negative mutations (three each for
  translating/hiding/detaching the gate, masonry and foot mesh, plus changed
  masonry vertices) fail, then restoration passes. Maximum original footprint
  error is below 0.000001 m. `ownership.json` stores the measured results.
- Locked actual E is rejected. After supplying the production prerequisites,
  continued W contact clears retreat feedback; actual E begins filing and reaches
  victory from the same reachable position. `ready-contact-2560.png` visibly
  shows `E — FILE DRAIN RELEASE`.
- Software collision process 49333 exited 0, including C crouch, side approaches,
  ownership mutations, actual filing and four viewport captures. It preceded only
  the final ready-contact feedback change, covered by final hardware-requested
  collision and final software exit-release checks.
- `node tools/verify-course-mower-motion.cjs`, process 90435, exit 0: 74 whole-course
  clear approaches, including three drain-region paths; acceleration, reversal,
  pause, grip, wet ground and sand also pass. Not every proposed obstacle approach
  is navigable; the verifier filters invalid starting/ending points.
- `node tools/verify-course-exit-release.mjs` passes prerequisite/route isolation,
  101 release poses, cable attachment, persistent completion and disposal.
- Exit mechanisms browser: hardware-requested 44869 and final software 21931
  exit 0. Actual locked Use, cancellation, both victories, stopped course clock,
  pause/resume, reduced motion, resource stability and scene rebuild pass.
- Final installed-client wrapper, process 81940, exit 0, two normal arrival input
  bursts. Latest page and state inspected. No browser error artifacts. Readiness
  only fails `gameplay_frame_budget`; software completion p95 is 77.9 ms over
  120 samples, so 60 FPS is not achieved.

Inspected 2560x1600 approach, close view and ready contact; 1280x720 close view,
844x390 software close view, and 390x844 portrait. The corrected grate, arch and
hoist are visible without duplicate stone cover. Portrait remains letterboxed
and cramped; this is an outstanding broader layout issue.

The direct late-course fixture also reports `footing_entry_signal_role_separation`
and `runtime_assets_settled`; the normal installed-client arrival does not. The
fixture's elapsed time/progression is deliberately staged, so its complete
readiness set is not evidence of a natural full run. Human route comprehension,
fear/fun/listening acceptance and comprehensive performance remain open.
