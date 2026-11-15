# Level 1 habitat reflectance — 2026-11-14

Partial V03/V06 progress. Eight existing districts now have anchored soil, leaf, conifer and verge palettes, baked into vertex/instance colours once during construction. Wetland/range tones are cooler; dead turf and occupied spaces are warmer. Smooth spatial transitions span 40 game units. Normalizing palette multipliers preserves neutral-reflector luminance, not every coloured surface's brightness. Lighting, exposure, fog and water remain unchanged.

`node tools/verify-course-habitat-palette.mjs` passes 62,420 samples: finite/deterministic palette, smooth boundaries, neutral-reflector normalization, unchanged position/normal/UV/index data, black preservation and fallback ground bounds. Re-run after continuation passes too.

Saved browser evidence in `output/level-one-habitat-palette`: 18 views each before/after on native/software, 36 matched pairs with exact inventories, camera/resolution, draw counts and submitted triangles. Software reference/restored frames match exactly, including instance colours. Walking, pause/resume, 12 warm-resource turns and rebuild pass, without browser errors. Viewports 2560×1600, 1280×720 and 390×844. Installed client runs 20604/41564 exited0; native2492×1402/software800×450 captures inspected; two input bursts remain in first_hole, x−2/progress233 to x−5/progress237.

No additional textures/draw calls in checked views. One additional shader program per renderer; warm resources stable. Twelve sources are captured with SHA256 in verified-source. A suspected water change was disproved: all five isolated-water JPEGs are byte-identical and shader/GPU uniform comparisons match. No water fix was made.

Sequential timing process50294 exited0. Median of three group medians (ms), including presentation and GPU readback:

| Renderer | View | Before | After |
|---|---|---:|---:|
| Native | water | 11.8 | 9.7 |
| Native | opening | 9.4 | 7.5 |
| Native | oblique | 9.7 | 9.2 |
| Software | water | 100.9 | 136.4 |
| Software | opening | 116.0 | 149.8 |
| Software | oblique | 144.3 | 128.9 |

Mixed timing results do not prove a speedup; software is poor and shows added cost in two views. Further performance investigation remains required. Palette identity is restrained under the existing darkness. This does not accept whole-route composition, accent hierarchy, material craft or the complete V03/V06/V21 gates.
