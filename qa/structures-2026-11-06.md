# Course structures and maintenance exit

Replaced the remaining whole-building illustration cards in the default pixel-3D course with fixed geometry. The illustration/parallax art remains the style reference and distant scenery; the alternate illustrated renderer remains available.

## Models

- Clubhouse: connected main hall and cross-gabled wings, slate courses, timber framing, stone foundations, warm mullioned windows, porch braces, steps and chimney stacks. Its 6.59 m rendered depth is visible from oblique and side views. Set back to x=20 so the expanded building stays outside the playable boundary (nearest rendered edge x=13.88).
- Service building: weathered timber boards, pitched corrugated roof with fasteners, fascia, gutter/downpipe, stone base, braced door and lantern. Set back to x=-18; nearest rendered edge x=-14.47 is outside the playable boundary.
- Maintenance exit: complete facade at the existing (-18,710) gameplay anchor, existing wall widths/depths and central barrier footprint, recessed entrance, frame, hinges/straps, latch, filing box, roof ridge/ribs, gutter/downpipe and warm interior workbench, cans, hose and lamp. It replaces two blocks with open gaps, a roof slab and an unframed door.
- New world-sized weatherboard, roof-metal, slate, plaster and dirty warm-glass pixel surfaces use nearest magnification and the existing quantized lighting. Architecture is merged by material and spatial chunk. Signs and lamps retain their presentation materials; the exit door remains articulated.
- Moon-shadow atlas increased to 2048 with matching shadow-camera snapping to reduce coarse sawtooth shadows across the larger walls and windows.

Implementation: `web/pixel-buildings.js`, integrated through `web/pixel-world-props.js` and `web/scene-3d.js`. No new raster downloads, generated illustrations, GLB dependencies, collision edits or navigation changes. Buildings are authored runtime meshes rather than imported Blender assets.

## Exit animation correction

The course elapsed clock freezes during sealing. The former damped door animation used that clock and could remain closed throughout the exit. The renderer now receives authoritative seal progress and opens the door inward over the beginning of sealing; repeated draws cannot advance it. Drain exits do not open the shed door. Scoring, prerequisites, filing duration and victory timing remain unchanged.

## Validation

- Dedicated structure checks: three building kinds have real depth and no whole-building cards; camera movement does not rotate/reshape them; side landmarks remain outside the course boundary. Normal Use begins filing, progresses to sealing, opens the physical door inward, and reaches victory. Repeated rendering does not advance the door.
- Before/after screenshots: `output/structures/before` and `after`, captured at 2560x1600. Front, oblique, side and rear shed views, clubhouse, service building and open interior inspected. Ordinary desktop/touch views: 1280x720, 800x600 and 844x390.
- Pixel-world suite: all ten groups passed, including textures, fixed props, Joe, bell interaction, responsive views, scene replacement, parallax strafing/full turns, reduced motion and Pause. No browser errors.
- Exit clearance suite: 36 successful approach/variant cases, plus prerequisite rejection, cancellation/retry and route geometry checks. The old pre-perspective fixture was updated to wait for asynchronous scene preparation and use mouse-look toward the exit before Use; the game retains deliberate-facing interaction rules.
- Release validator: 90 action scenarios passed, no warnings/failures; image inventory remains 14.49 MB (GLB accounted separately).

- Installed web-game client: two onboarding input bursts completed; final screenshot/state show active course, 14 m travel, assets ready, no failures and no console-error artifact.
- Rendering preparation: all five lifecycle checks passed (held simulation, pause/resume, first active render, failed-model fallback, cancellation/rebuild). Final first active model submission 16.1 ms; preparation 3.22 s, warm submission 142.2 ms, largest preparation-frame interval 983.2 ms. This lifecycle run overlapped the software-rendered input client, so its timings are observations rather than an isolated comparison. Initial loading can still stall; active gameplay remains gated until preparation finishes. Report: `output/structures/preparation.json`.

- Isolated final rendering profile (RTX3090/D3D11, 1280x720): all three building views median16.7ms, maximum16.8ms, zero intervals above50ms. Initial before/after samples had the same frame intervals. Small-edge topology simplification reduced the clubhouse view from1,018,776 to652,152 submitted triangles (about36%, including shadows), service628,180 to572,116, shed450,986 to410,090. Final draw calls687/567/383 for service/clubhouse/shed. These are five-second held-simulation samples, not sustained gameplay or mobile qualification. Reports: `output/structures/performance.json` and `performance-before-optimization.json`.
- Final JavaScript syntax and whitespace checks passed. Optimized geometry was rechecked with the structure suite, rendering-preparation lifecycle and installed input client; final screenshots/state inspected.

Human artistic approval and physical-mobile performance remain unqualified. Clubhouse/service buildings are exterior landmarks, not new enterable locations. Human playtests remain prepared for later as requested.
