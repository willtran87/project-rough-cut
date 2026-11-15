# Level 1 stone weathering — 2026-11-14

Local V01/V09 material progress against the comprehensive 35-item/V01–V21 scope. This does not accept the full visual upgrade.

## Change and visual review

All six constructed stone covers now have a shared 1024×512 pixel atlas with eight variants for each of five courses. Damp patches rise unevenly from ground contact; isolated remnants reach the second course. Short stepped runoff marks descend from upper joints. Sparse chips follow exposed edges, while the original clustered mineral texture remains underneath. A first version with independently random narrow damp columns looked stripy; the final version uses wider connected patches with changing heights.

The atlas is source-lit albedo, with nearest magnification and mipmapped minification. The regular stone backing and all other stone props retain their previous material. No new light, emissive highlight, collider, mesh triangle or decorative overlay was added. Face UVs are baked into the existing geometry and retained through batching. The shared surface-texture owner disposes of the atlas during reset.

Reviewed final close wall, normal route, software wall, phone and actual-client movement screenshots. The improvement is visible around the lit lower courses and along joints; the unlit service area remains dark. This pass does not resolve whole-route dark-scene separation, all masonry wear, or motion/filtering acceptance.

## Evidence

- `node tools/verify-course-stone-finish.mjs`: 15 wall/seed configurations; 36,972 vertices and 68,256 triangles compared against the saved baseline. Positions, normals, indices and palette assignment are exact. All UVs stay within their 40 atlas faces and gutters; physical bases map to damp texture bottoms.
- `node tools/verify-course-stone-courses.mjs`: five wall sizes and 1,600 exterior rays pass. `node tools/test-course-cover-flight.mjs`: gameplay checks and 5,025 clearance samples pass.
- `node tools/verify-course-stone-weathering.cjs`, with baseline/software options: 15 views per run at 2560×1600, 1280×720 and 390×844. Both baseline and final software views match full geometry exactly, and restoring packed geometry also reproduces the original frame exactly. Actual walking, pause/resume, 12 warm-resource turns and a scene rebuild pass. No browser errors.
- The 30 baseline/current view pairs preserve every recorded object, hull, obstacle, software occluder, light, lantern, camera pose and resolution. All 28 path lanterns remain symmetric. Existing low ambient lighting, Joe presentation and mower scale are unchanged.
- Installed develop-web-game client, via `tools/verify-presented-client.mjs --level-one --stone-courses`: two actual forward/lateral bursts on both renderers, from x−2/progress233 to x−5/progress237. Native output2492×1402 and software800×450; page captures and state files inspected. No error files.
- Exported atlas base-band mean RGB70.63 versus upper-band92.83 confirms the lower course darkening. The atlas was opened and visually inspected, not accepted from that numeric test alone.

## Rendering cost and limitations

The finish adds one texture and a separate material batch: 1–4 draws in native checked views, 0–2 in software. Warm geometry resources increase from1011 to1016 native and747 to752 software; textures113 to114; programs107 to108 native and117 to119 software. They remain constant over the checked warm turns. Geometry itself is unchanged; some native submissions decrease because the separated batch can be culled more tightly.

Sequential timing runs used three locations, 12 warm-up frames and three groups of12 measured frames per location, including presentation and a one-pixel GPU readback. No other owned browser test was running. Median-of-group-medians, milliseconds:

| Renderer | Location | Baseline | Finish |
|---|---|---:|---:|
| Native | Water | 8.7 | 9.1 |
| Native | Opening | 6.7 | 7.4 |
| Native | Oblique | 7.8 | 9.0 |
| Software | Water | 84.6 | 82.6 |
| Software | Opening | 86.9 | 86.3 |
| Software | Oblique | 81.4 | 78.8 |

These fixtures show a modest native cost and no observed software increase in this run. They do not establish a general speedup, live gameplay frame rate or full performance acceptance. Software remains far below the desired performance/high-resolution bar.

## Reproduction and artifacts

Artifacts: `output/level-one-stone-weathering/`, including baseline sources, both renderer reports, comparison.json, timing-comparison.json, atlas exports, installed-client states and ten SHA-256 source snapshots. `--timing` selects the isolated cost fixture without overwriting visual reports.

Terminal process IDs: baseline45377/37594; initial candidate22016; final75036/33901; installed clients42509/53722; sequential cost81905. All exit0. Earlier candidate images were superseded after the damp-edge revision; current reports/images contain the final finish.

Next work remains whole-route composition and colour hierarchy, broader material/architecture/actor craft, artistic motion, and the software performance gap. Keep the full ledger active.
