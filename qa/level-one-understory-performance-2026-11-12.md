# Level 1 low vegetation rendering cost — 2026-11-12

Advances P9/current item 50. The complete frame-time gate remains unmet.

## Change

The six low-vegetation batches submitted 1,610 plant planes across the course.
Their broad batch bounds kept out-of-view instances in GPU submissions. A new
static-instance compactor uses conservative transformed per-instance boxes,
including a 2 mm margin, to omit only instances outside the camera frustum.
It preserves original instance order, matrices and colors and uploads changed
matrix spans only. Repeated camera poses do no new culling/upload work. A full
restore path supports controlled comparisons and geometry inspection.

This applies to software-rendered low vegetation. Textures, plant placement,
visible density, materials, shaders and collision rules are unchanged. There
is no new distance cutoff or lower resolution. These plants do not cast shadows
or participate in a separate reflection camera. The bounded source arrays and
boxes are recreated with each scene; GPU geometry is reused.

## Evidence

- `node tools/verify-static-instance-culling.mjs`: passes edge retention when
  the plant center is outside the view, original transform/color ordering,
  pending uploads, unchanged camera, turning/re-entry and exact restoration.
- `node tools/verify-course-understory-culling.cjs`: final session 22195 exit 0,
  zero browser errors. Pixel comparison runs inside the browser on complete
  scene-target RGBA buffers, not on a proxy/manifest. All five views have zero
  changed components: opening, near verge, pond, border and refuge.
- The respective submitted counts are 372, 326, 398, 8 and 332 of 1,610.
- Actual W input, pause, camera rotation, repeated rotation and real scene
  rebuild pass. Six unique batches return after rebuilding.
- Inspected 2560x1600 opening/near-verge plus 1280x720 and 390x844 opening
  captures. The test also captures 844x390. Existing portrait letterboxing remains.
- One existing geometry uploads on the first full rotation: GPU geometry count
  1312 to 1313, with unchanged scene geometry identities. A second complete
  rotation remains at 1313 geometries/106 textures. The initial test (15951)
  wrongly treated that first upload as an allocation leak; the final check
  verifies unchanged source identities and stable warmed resource counts.

Matched headless SwiftShader measurements use a 2560x1600 browser viewport,
fixed scene resolution and completed presentation fences. Each condition uses
24 renders, discards four warmups, and runs full/culled/culled/full. The moving
condition repeats the same camera trajectory and scene times. Values below
average the two block medians, not the individual samples.

| Condition | Full instances | Culled instances | Median reduction |
| --- | ---: | ---: | ---: |
| Stationary, 960x540 | 60.95 ms | 58.50 ms | 4.0% |
| Moving, 960x540 | 63.30 ms | 59.40 ms | 6.2% |
| Stationary, 640x360 | 50.00 ms | 41.95 ms | 16.1% |
| Moving, 640x360 | 51.55 ms | 43.95 ms | 14.7% |

Tail times vary and are not consistently improved. One culled stationary block
has a 97.1 ms p95; these results do not establish 60 FPS or hardware/device
acceptance. No performance threshold was loosened.

The earlier diagnostic isolates in `output/course-frame-cost/` temporarily hide
groups only in the test renderer. They identify the low vegetation cost; those
removals are not shipped. Front-to-back material sorting did not help and was
not adopted. Absolute times vary significantly between shared-host runs, so the
matched final blocks are the basis for the bounded improvement claim.

Installed gameplay client session 69303 exits 0 after two arrival iterations.
Final page-1/state-1 inspected: first_hole, no browser-error artifacts, automatic
800x450 scene output. The current completed-scene p95 is 76.4 ms; the remaining
readiness failure is gameplay_frame_budget. This is a separate short run, not
a matched before/after benchmark.

Artifacts: `output/course-understory-culling/report.json`, matched screenshots,
and its `standard-client/` directory.

Remaining: whole-route sustained frame times, turn/reveal/escape tails, target
hardware testing, and every other unfinished requirement in the Level 1 ledger.
