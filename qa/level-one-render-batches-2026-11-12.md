# Level 1 rendering batches — November 12, 2026

This pass reduces software-renderer draw submissions and geometry-object
overhead while preserving the scenery. It does not qualify the frame budget.

## Evidence and changes

- Resumed the existing moving-frame profile, session 75239, to terminal success.
  SwiftShader completed-frame intervals had medians of 50.1 ms at the opening,
  66.6 ms at the border, and 50.1 ms by the pond. CPU submission p95 was
  6.7–9.9 ms. A responsive RAF alone is not evidence of responsive rendering.
  The renderer reached its existing 640x360 minimum on this run. No thresholds
  or resolution policy were changed.
- A current foliage-isolation diagnostic (24767, terminal success) confirmed
  a measurable canopy draw cost. Omitting scenery was diagnostic only.
- Software static geometry now uses 20 m spatial batches instead of 10 m.
  Every original piece retains its bounds and index-range visibility checks.
  Hardware batches remain 12 m; visible art, texture resolution and gameplay
  geometry are retained. Cache versions were advanced.
- The larger batches also pass their existing visible-piece records to the
  local-light culler. Empty space inside their combined bounds cannot force
  point-light calculations on pieces proven outside every finite light.
  The independent 33-view full-shader check passes after this integration
  (96336, terminal success), including stationary-light camera turns/rebuild.
- Initial fixed-camera ABBA comparison (13310, terminal success) produced
  exactly the same scene-target pixels at the opening, shore and woodland.
  Draws fell from 204 to 154, 201 to 157 and 134 to 85 respectively. Reported
  geometry objects fell from approximately 1,270–1,291 to 685–687 after warmup.
  This counts geometry objects, not total GPU bytes. Render-time improvements
  were small/mixed; no general frame-rate improvement is claimed.
- Initial broader comparison (14175, terminal success) covered six locations
  at 2560x1600, 1280x720 and 390x844. All 18 pairs had identical pixels,
  including nearby Joe, path lights and the shed.

## Lighting regression discovered and fixed

The independent full-light-shader comparison found three differing color
channels at one pixel near the shed after widening the batches. Diagnostic
sessions 90883 and 69526 ended with the expected failing assertion. Bounds
inspection confirmed the affected batches were outside point-light reach.
Assigning a shader clone changed Three's material sorting key and therefore
the draw order of surfaces sharing a depth value.

The zero-point-light variant now records the original material's sort ID.
The software course renderer preserves that identity in opaque sorting,
retaining Three's group, render-order, material-variant, depth and object-ID
priorities. Hardware rendering and transparent sorting are unchanged.

- Diagnostic stable sorting (45841) resolves all 33 comparisons.
- Production implementation (25457) passes all 33 comparisons, including
  hidden-to-visible camera turns, both point lights and an actual scene rebuild.
- `node tools/verify-local-light-culling.mjs` passes range boundaries,
  transformed/multiple lights, inactive/unlimited lights, visibility caches,
  visible pieces, preparation/disposal and original-material sort ordering.
- No page or console errors were reported by these successful checks.

Evidence lives under `output/course-budget-review/`: `after-software-moving.json`,
`foliage/`, `batches/`, `batch-visuals/`, `light-diagnostic/` and `light-final/`.
The profile uses completed GPU fences; fixed-view runs exclude simulation.
All timing is from a shared host and is not full-route FPS qualification.

## Remaining acceptance

The 16.7 ms completed-frame target remains unresolved. Broader composition,
route pacing, novice comprehension, fun/fear, listening and physical input
device acceptance remain in the full scope ledger. Rebuild profiling also
observed an additional texture allocation per reset before this change; its
ownership and disposal need a separate lifecycle investigation.

Follow-up: that texture growth is now diagnosed and fixed in
`qa/level-one-resource-release-2026-11-12.md`; the frame-budget limitation remains.

## Final verification

- Final legal-position visual/input run 40326 exits 0. All 18 pairs have zero
  changed framebuffer channels; all positions pass the actual collision query.
  Actual W advances the player; pause freezes the pose and resumes normally.
  Final 2560x1600 hedge/Joe, 1280x720 shed, and 390x844 shore screenshots were
  inspected. Evidence: `batch-visuals-final/`.
- Final moving ABBA run 36024 exits 0 with no errors and identical static-view
  reference pixels. Each motion block uses 48 completed presentations, discards
  the first 12, and moves/turns the camera through the production render path.
  Resolution stays 640x360. Values below average the two block medians per mode;
  they are not pooled-sample medians or full-route FPS. Both modes use stable
  shader sorting; the 10 m reference retains the original aggregate light bounds.

| View | Completed presentation, before → after | CPU submission, before → after |
|---|---|---|
| Opening | 45.10 → 44.85 ms | 3.80 → 3.00 ms |
| Shore | 53.80 → 52.15 ms | 3.90 → 3.05 ms |
| Woodland | 51.80 → 50.50 ms | 3.00 → 2.30 ms |

CPU submission drops about 21–23% in these controlled blocks. Completed-frame
gains are small, and the frame budget still fails. Evidence: `batch-moving-final/`.

- Installed presented client 60612 exits 0 after two arrival input bursts.
  Latest screenshot and selected state inspected: first_hole, tee, player
  movement recorded, readable arrival/goal feedback. No error artifacts.
  Readiness remains 56/57; only `gameplay_frame_budget` fails. Evidence:
  `standard-client/`. This is a smoke test, not whole-route acceptance.
- Syntax checks pass for the changed runtime and profiling scripts. All owned
  process handles are terminal; the existing server on port 4187 is retained.
  No commits, deployment, or changes to other chapters were made in this pass.

The first moving ABBA run (59953, before the final per-piece light integration)
reduced CPU submission medians in all three views, but completed-frame timings
were mixed and materially drifted between blocks. Seventeen Node processes
and eighty Chrome processes were present on this shared host during that run;
this agent ran its own browser jobs serially. No isolated-host or FPS claim.

Inspection of the first close-hedge fixture showed the camera within the hedge's
collision footprint. That remains useful only as a rasterization stress case.
The final visual fixture moves to y102 and asserts all six camera positions
against the actual player collision query; no gameplay collision was changed.
