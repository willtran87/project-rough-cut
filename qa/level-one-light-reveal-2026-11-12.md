# Level 1 lighting on camera turns — November 12, 2026

Two software-rendering defects are fixed. Static scenery now keeps the correct
point-light material when it returns to view, and the shed's warm lamp is included
in the course light inventory. This improves lighting consistency and preserves
the authored illumination. It is not a frame-rate improvement claim.

## Cause and change

- `local-light-culling.js` previously assigned the unlit variant to every hidden
  batch when a lamp changed. Its cache only watched light changes, so a subsequent
  camera turn could reveal that batch with the wrong material. Material selection
  now depends on light reach even while the batch is hidden.
- `scene-3d.js` previously supplied only the nearest path lantern to the culler.
  `pixel-buildings.js` also creates a warm point light at the shed. The course now
  inventories all point lights after construction, passes that inventory to the
  culler, and replaces/clears it with the scene lifecycle.
- Existing geometry, textures, shader variants, point-light range, beacon,
  shadows, resolution policy and gameplay remain. The shared culling helper also
  keeps its existing visible-piece and multiple-light behavior.

## Verification

- `node tools/verify-local-light-culling.mjs`: the new hidden-to-visible regression
  fails before the fix and passes afterward. Existing range boundaries, multiple
  lights, transformed parents, inactive/unlimited lights, cached updates, visible
  pieces, preparation and disposal checks pass.
- `node tools/verify-course-light-reveal.cjs`: 33 comparisons have zero changed
  framebuffer channels against the same scene with full point-light shaders.
  Six course locations include repeated camera turns near lanterns, the pond and
  shed; additional views cover 1280x720 and 390x844. Geometry, camera, time and
  production draw sorting remain the same in each pair. A real scene rebuild
  replaces both lights, inventories every point light and preserves exact output.
- Before fixes, 8 of 32 views differed. The shed forward view had 30,673 changed
  channels. After the first fix, 3 shed comparisons still differed; shader uniform
  inspection revealed the omitted second point light. The final inventory fix
  resolves these differences. An opaque-sort hypothesis was tested and rejected.
- Final browser session 70503 exits 0 with no page/console errors. Screenshots at
  2560x1600, 1280x720 and 390x844 were inspected, including the high-resolution
  shed and ordinary arrival. These are software-renderer tests.
- Installed presented client session 45866 exits 0 after two ordinary arrival
  input iterations. Latest screenshot and state inspected; no error artifacts.
  Readiness remains 56/57, with `gameplay_frame_budget` failing. This run is not a
  controlled performance comparison.
- Syntax checks pass for the changed renderer/helper and diagnostic scripts.

Evidence: `output/course-light-reveal/before/report.json`, `final/report.json`,
`sort-diagnostic.json`, and `standard-client-final/`. The `--before` browser mode
uses the preserved helper snapshot and the original nearest-lantern-only call.

## Rendering-cost investigation

The pending full-frame-readback job 7993 completed successfully. Unlike the
earlier `gl.finish()`-only probe, this method waits for complete RGBA readback;
readback overhead is included. It measures fixed scene rendering at 640x360,
not complete gameplay FPS. No other verification/profile Node jobs were listed
when the controlled probe began.

| Fixed view | Full median, bracketed blocks | Foliage omitted, diagnostic only |
| --- | --- | --- |
| Opening | 42.6 / 41.1 ms | 26.7 ms |
| Pond | 47.1 / 47.0 ms | 30.2 ms |

Visible foliage remains a substantial cost. No foliage was removed from runtime.
The old 6–7 ms finish-only readings are invalid as completed rasterization timing
and are retained separately as `finish-only-diagnostic.json`.

An additional full/no-spot/no-spot/full diagnostic completed in session 51564.
Opening medians were 42.2/44.8/42.5/43.5 ms; pond medians were
47.9/42.4/43.9/46.1 ms. This did not establish a consistent benefit across views,
so no spotlight-elimination runtime change was adopted. Evidence is in
`output/course-render-cost/report.json` and `spot-probe/report.json`.

## Remaining scope

Stable frame times, whole-route pacing and composition, broader player/model
polish, remaining responsive screens, physical-device checks and human
fun/fear/listening acceptance remain open in the full Level 1 ledger. The full
implementation goal remains active.
