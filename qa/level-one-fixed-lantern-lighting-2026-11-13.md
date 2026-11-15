# Fixed lantern lighting — Level 1

Partial progress toward the full V01–V21 visual upgrade. This pass addresses camera-dependent practical lighting; it does not accept the entire lighting, shadows, composition or performance categories.

## Problem and final implementation

The original scene assigned one point light to the nearest glow anchor and multiplied its output by the viewer's distance. A two-source candidate removed that distance multiplier but still left one side of a matched lantern pair unlit when a station lamp occupied the other slot. That candidate was rejected and archived under `output/level-one-practical-lighting/superseded-pool*`.

`web/course-lantern-light-field.js` now supplies every existing lantern anchor as a fixed physical source. The current course has 40 anchors, including the unchanged 28 path lanterns. A conservative 2m world-space grid contains every source whose 3.25m sphere can reach each cell. Current grid: 18×61 cells, at most 3 candidates per cell, 18,208 bytes of grid/source data. There is no camera selection, fading handover or maximum-source truncation.

Lambert and Phong materials receive the same inverse-square attenuation, finite cutoff and diffuse/specular evaluation as ordinary point lights. Each source follows its own existing glass/glow flicker. Unlit signs, glass and sky materials remain unmodified. One small static lookup texture plus shared source uniforms replaces the camera-selected point light. Existing floodlights and building sources remain in the normal light inventory.

`scene-3d.js` installs the field after construction, prepares its shaders under the loading gate, updates source powers with the existing flame animation and disposes its texture during rebuild. Shader hooks are restored before shared course materials are reused; their old renderer programs are released to avoid retaining uniforms from the previous scene.

The requested ambient .005, hemisphere .035, moon .14 and 14 symmetric path pairs remain. No navigation, collisions, Joe beacon, defeat layout or other chapter files were changed by this pass.

## Evidence

- `tools/verify-course-lantern-light-field.mjs`: 28,644 sampled positions retain every source within physical range; no duplicate IDs; fixed grid is not re-uploaded for flicker; only lit materials are wrapped; shader hooks restore and texture disposal occurs exactly once; empty scenes work.
- `tools/verify-course-lantern-field-render.cjs`: four transformed views of ground, a wall and a glossy prop compared against ordinary THREE.PointLights on hardware and software. Maximum channel difference 1/255, including a grid-boundary view. No WebGL or JavaScript errors. Reports: `field-reference-native` and `field-reference-software`.
- Browser fixtures in `tools/verify-course-practical-lighting.cjs` cover seven legal course views, turning, keyboard walking, pause/repeated draws, per-source flicker, unchanged lantern symmetry and ambient, warmed resources, and rebuild. Final runs are recorded below after completion.
- `tools/verify-course-light-reveal.cjs` compares software-culling shaders with the corresponding unculled materials, including camera turns and scene reconstruction. The tool now permits the old camera-selected lamp to be absent.

## Investigation correction

Earlier notes suspected missing luminous surfaces in saved native captures. Reopening the same baseline audit image showed the moon, signs and lantern glass present. A headed hardware run also rendered them, and twenty direct framebuffer samples had an identical bright-pixel count of 16,292 with no GL errors. The suspected fault was not reproduced and no speculative renderer/vendor change was made. Do not treat the earlier observation as a confirmed production defect.

## Performance limits and rejected alternatives

Timings use 24 warmed submit-through-GPU-fence samples per fixture, with 2ms polling. These are bounded fixtures, not a full-playthrough frame-rate claim.

Original software baseline at 960×540: opening 94.3ms, audit 90.1ms, pond 116.2ms median. A field candidate fetching source data from a second texture cost 185.1/153.1/135.4ms. Moving source data into shared uniforms reduced that to 115.0/106.3/142.5ms in the recorded run. This remains a material software-rendering cost; V21 performance acceptance is open. The existing adaptive resolution remains enabled in ordinary play.

The field adds one texture, no scenery geometry or extra draw calls. Source-light shadows and occlusion through nearby structures remain separate V10/V11 work. The full-level palette, vegetation silhouette separation, material parity, atmospheric motion and remaining checklist items still require implementation and review.

## Final recorded results

- `accepted/after-native/report.json` and `accepted/after-software/report.json`: all four browser checks pass; seven legal course views; no errors. Rebuild disposes the lookup texture once, creates a fresh field and retains bounded texture/program counts. Native current scene 2492×1402 within the 2560×1600 page; software fixture 960×540. Both final responsive reports cover 1280×720 and 390×844. Inspected native/software dead-green views and final native ordinary/phone captures.
- `accepted-light-reveal/report.json`: 33 comparisons, zero pixel mismatches, seven normal point sources both before and after reconstruction; complete fresh inventory. The 40 field sources are additional shader inputs, not omitted normal lights.
- `uniform-budget/after-native/budget.json`: opening median13.5ms/p9516.3ms; audit11.6/15.6ms; pond11.5/13.1ms. Original corresponding baseline medians9.9/10.7/9.1ms. Current draws474/464/131 and triangles494788/486900/158158 match baseline; texture count104 versus103. Hardware cost also remains measurable.
- `accepted-client/shot-7.png` and `state-7.json`: installed development client completed8iterations and reached actual first_hole, playerx13/progress24/travel34, with no error artifact. Inspected screenshot and state. Adaptive640×360, average completed scene78.49ms/p9582.5ms, estimated12.7FPS. The gameplay-frame-budget readiness check fails. This pass does **not** establish acceptable overall performance.
- An encoding error while appending the reference board was repaired immediately from the full pre-edit text read in this turn; all prior reference sections and links were restored before adding the lighting comparison.

All owned verification jobs are terminal. Source hashes are recorded in `output/level-one-practical-lighting/source-hashes.json`. The complete visual-upgrade goal remains active.
