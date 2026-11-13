# Level 1 bench collision/art validation — 2026-11-12

The existing hidden-collision readiness check accepted only hedge tunnel wings
and shed wall IDs. Both Dead Green benches were rendered and had working body
collision, but their addition made that old check fail. No physical obstacle
was removed merely to clear the warning.

The bench builder now records each bench's bounds from its constructed vertex
positions. The audit applies the actual world transform and checks mesh/parent
visibility, attachment, material visibility and nonempty draw range. Readiness
compares these bounds to each bench's authoritative body footprint, with a
3.5 cm tolerance and grounded vertical extent. The current maximum discrepancy
is 9 mm at the front/back edge; width aligns exactly before Float32 rounding.
Missing or duplicate owner records fail. Existing hedge/shed ownership checks
are retained, so this is not a full rendered-geometry audit of those structures.

## Verification

- `node tools/verify-dead-green-refuge.cjs`: final session 26103 exit 0; earlier
  31591 passed. Zero browser errors. Negative checks shift, scale, hide the mesh,
  hide its parent, detach its parent, detach the mesh, hide its material and
  empty its draw range. Each fails both bench records, and each restoration passes.
- Actual W input stops at y520.70 ahead of each y525 bench. Lateral movement and
  W then pass the west/east benches to y546.87/y542.68; the center route passes
  y535. Pause, reduced effects and resource identity checks continue to pass.
- Existing test captures the refuge at 2560x1600, 1280x720, 844x390 and 390x844.
  Inspected the current 2560x1600 west-bench scene. No visual redesign in this pass.
- Installed gameplay client session 41313 exit 0: two actual arrival iterations.
  Final page-1/state-1 inspected, first_hole, no error artifacts. Readiness now
  fails only gameplay_frame_budget; the benchmark and full experience goal
  remain open.
- JavaScript syntax checks pass for the two refuge modules and game.js.

Artifacts: `output/dead-green-refuge/collision-art.json`, its traversal report
and screenshots, and `output/collision-art/standard-client/`.

This improves the accuracy of collision validation and confirms existing bench
navigation. It does not establish whole-course collision, frame-time, device,
route-fairness or human experience acceptance.
