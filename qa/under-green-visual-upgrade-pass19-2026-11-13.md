# Under the Green visual upgrade — pass 19

Progress on V02/V03/V05/V06/V35/V36/V52. Dedicated close-range machinery pixel artwork replaces the wall-panel material on pump and keeper controls. Full scope remains 53 requirements and seven release gates; accepted item count stays 12.

## Material change

Built-in image_gen produced `assets/environment/under-green/machinery-surfaces-v1.png`; identical production copy at `web/assets/under-green/machinery-surfaces-v1.png`. Exact prompt/tool record: `assets/environment/under-green/machinery-surfaces-v1-prompt.json`. Master is 1254×1254, 1,949,174 bytes, four native 627px quadrants: green enamel, bare metal, red enamel, layered rust. Asset manifest and visual reference board updated. Original generated output retained.

Previously all major machine metal shared a green wall-panel swatch, including its vertical sheet seams. New castings retain broad green paint faces with discrete corrosion; iron and steel share the neutral metal art with separate dark/rubbed responses; red actuators have their own chipped enamel; pipe corrosion and feet use rust. Existing physical seams, bolt heads and ribs remain actual geometry. No albedo-as-bump or added baked directional lighting.

New `under-green-machinery-surfaces.js` owns four color maps and one independently authored damp/oil response map. It disposes all five owned textures. Nearest magnification and mipmapped minification preserve source pixels. Each tile spans one metre, double the architectural source density; cylinder caps/circumference, delivery-pipe length, fixed control housing, dynamic handles/needles and release cabinet use physical UV scale. Dynamic parent meshes clone shared unit geometry before UV edits, keeping shared geometry unmodified. Scene diagnostics expose sampling and estimated storage.

No geometry positions, collisions, lights, simulation, timing, movement, checkpoints or input mappings changed. Pump needles still reflect actual return/onward pressure, lever remains latched after diversion, release reflects real gate travel.

## Verification and visual evidence

Authoritative verifier: `tools/verify-under-green-machinery-art.cjs`.

- Native session **37793**, terminal pass: 27 views at actual 2560×1600 plus 1280×720, 390×844 and 844×390.
- Software session **1742**, terminal pass: 18 views, actual 960×600 at the high-resolution viewport.
- Reports/images: `output/under-green/visual-upgrade/pass19-machinery-accepted/{hardware,software}/`.
- Each rendering path compares overview, front, casting, motor, rear, operator and actual keeper release before/after; validates independent wet maps, source size, physical scale, sharp magnification, no bump map and shared metal map distinct from the wall texture.
- Actual E pump operation, intermediate needle readings against water state, pause/frozen readings, and fully latched lever. Actual E keeper release, intermediate gate state and secured aftermath.
- Every paired comparison retains identical actual resolution, draws and triangles. Representative native front: 91 draws/120,354 triangles, textures62→67, programs131→131. Operator:387draws/300,070triangles, textures70→75, programs131→131.
- No browser/console errors. Startup completes on both paths.

Visually inspected native before/after front, operator and rear; native portrait operator; corrected native keeper close/landscape; software front and moving release; native latched readings. New paint/metal/rust separation is clearer under unchanged room lighting and source detail stays visible at operating distance.

Screenshot inspection invalidated the early keeper fixture: hardcoded y3.3 no longer matched the compacted range layout. The verifier now derives release position from authoritative SLUICE, asserts every fixture is on the real floor, and requires a reachable gate action. Final release images show the actual cabinet and state transition. Earlier `pass19-machinery` and `pass19-machinery-final` artifacts are retained but their release views are not acceptance evidence. Earlier terminal sessions4241,93445,15958 are superseded by the accepted runs above.

Installed develop-web-game client session **2144** exits0; five pairs in `pass19-client`. Final screenshot/text inspected: intro completed, playing at(0,16.52),960×540 software target, new machinery stats present, no error artifact. No timeout warning in this client run.

## Cost, limits and remaining work

Five additional GPU textures; estimated RGBA8 plus full mip storage **8,736,277 bytes (~8.33MiB)**, reported separately from the1.95MB compressed source. Material draw/program counts are stable in the matched fixtures, but these counters do not establish frame time. No isolated timing claim; the existing software frame-budget gate remains unmet.

This is controlled material/interaction evidence, not a complete natural-route or full Level1 parity review. Physical mesh/route audits were not rerun because this pass changes UVs/materials only, not positions or collision envelopes. Existing pass2 machinery clearance evidence remains historical, not newly claimed. More close-range control/prop finishing, authored seam/contact wear, complete intro/gameplay coherence and whole-level material consistency remain in scope; V35/V36/V52 remain in progress.

Six final production/test snapshots, source/runtime atlas hashes and prompt hash: `output/under-green/visual-upgrade/pass19-source/final-hashes.json`. Baseline files are retained alongside them. All owned jobs terminal. No other-chapter runtime edits, commits, deployment or deletion.
