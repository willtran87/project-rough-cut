# Back Nine district scenery — partial visual implementation

Scope: advance BV17/18/19/21/22 and retain the full 48-item objective. This pass does not establish whole-level parity with Level 1 or complete those requirements.

## Implemented

- Two 10×18 m propagation houses outside the nursery boundary, at (52,105) and (-53,140), with stone plinths, glazing frames, pitched roofs, ridge vents, gutters, downpipes, door handles and service tanks. Seven broken side panes have recessed dark backing, retained shards and some repair boards. Both houses use an opaque weathered-glass material; they are not transparent interiors.
- A 7.2 m range distance board at (-49,380), with supports, footings, braces, cap, repair plank and physical pixel lettering/numerals. The board identifies the range from the approach and side views.
- A 7×25 m pergola over the existing clubhouse terrace at (-45,735), with ten anchored posts, braces, slats, two damaged slats and a west-edge trellis. Existing tables/chairs remain visible beneath it.
- Six boundary trees relocated into nearby outer groves; total tree count preserved. Structures remain beyond the fence/playable boundary, away from reservoirs. No collision, pathfinding, checkpoint, AI or physics behavior changed.
- 690 pieces enter existing static material batches and per-piece culling. No new lights or animation loop. Panes use a dedicated 1254×1254 authored image; frames, wood, stone and metal reuse existing Level 1/course surfaces.
- Corrected a shared-material regression from the preceding lighting pass: relay indicators once again use the unlit `sheen` material, while tire spray uses its own lit `tireSpray` material. The earlier assumption that sheen was spray-only was incorrect: `back-nine-story-art.js` also uses it.

## Asset provenance

`web/assets/optimized/back-nine-glass-v1.webp` was generated with the built-in image-generation tool. The prompt requested a seamless, opaque, high-resolution pixel-art greenhouse glass albedo: restrained blue-green gray, fine condensation/mineral streaks, scratches and wipe marks; no frame, perspective, reflections of objects, or text. Original: `C:/Users/Will/.codex/generated_images/01a1ca31-dda6-7063-b302-317af976c1d6/exec-48956706-3a7e-4a7b-8307-b9fb362e87ac.png`. Converted losslessly to WebP without resizing or retouching; the project asset is self-contained. File size 1,481,270 bytes, approximately 8.4 MB RGBA GPU storage including mipmaps.

## Verification and evidence

Evidence root: `output/back-nine-visual-upgrade/districts`.

- `node tools/verify-back-nine-district-rules.mjs` passes. Checks finite geometry and unit normals, all vertices outside x=±40.8, nonnegative foundations, tree count/interior-tree preservation, structural clearance and reservoir exclusion. An initial degenerate gable triangle was removed before final verification.
- `node tools/verify-back-nine-districts.cjs .../native` passes. Native D3D11 first at 2560×1600 viewport (2560×1440 scene), then 1280×720 and 390×844. Seven normal gameplay camera views cover both houses, range board, terrace and three driving approaches. Also checks pause/resume, relay states, full restart to shed and stable program/texture counts.
- Same browser suite with `--software` passes. Seven views and smaller breakpoints repeat under SwiftShader. Both final reports contain empty console/page-error arrays.
- Matched pre-change screenshots use the actual saved pre-change scene via a browser route (`.../before/report.json` and `baseline-source/back-nine-scene.js`). Native draw increases across the seven views are +2,+7,+4,0,+2,+3,0. Added visible triangles vary from 900 to 2,568 in these views. These measurements include tree recomposition; they are not a universal performance budget.
- Native remains 29 programs; software is 36 (previous headlight pass 35). Both use 56 textures (previous 55), stable across the tested views, relay states, resolution changes and restart. This adds one texture and one software shader variant.
- Installed standard gameplay client executed through `verify-presented-client.mjs --back-nine --district-art --high-resolution`, with and without `--native-renderer`, using `tools/fixtures/back-nine-districts.json`, three bursts each. Native stayed 2560×1440; software stayed 960×540. Both end on foot at (29.1516,93.6307), viewYaw -0.29. All screenshot/state pairs exist and no error artifacts were produced. Native final completion average 11.76 ms/p95 16.0 ms on RTX3090; software 62.41 ms/p95 84.4 ms. These are short normal-movement samples, not full combined-load acceptance.
- `node tools/verify-back-nine-headlight-rules.mjs` passes 15 shadow ray comparisons and cone/caching/moving-door/foot/sloped-attachment/ground/disposal checks after integration.

Actual images inspected: native east/west houses, range, terrace, nursery driving, powered relay, 1280 and portrait; software house/range; native client pages 0 and 2 and software client page 2; matched pre-change nursery; earlier Level 1 native capture `output/back-nine-art/level-one-2560.png`. First house render was visibly flat; the dedicated glass surface was added and final rendered images re-inspected. The new silhouettes make the nursery and terrace more recognizable, but this is not proof that the entire level equals Level 1.

## Still open

- Broad district composition and meaningful prop stories throughout the course; these four structures do not finish middle-distance/landmark work. Pergola and range board are dark under current night lighting. Existing interior route areas still have large open stretches.
- Glazing is a weathered opaque approximation, with a repeated surface and blocked-out broken-pane recesses. Interior plant benches and more individualized house damage would improve close detail.
- Software fidelity/performance remains below the native target. Existing software foliage shading differences remain visible.
- Portrait HUD obscures much of the letterboxed scene at 390×844; BV47 remains pending.
- Remaining full-scope work includes terrain transitions/trails, deeper atmospheric layers, player/Joe/machinery motion, ghost art, destruction aftermath, camera readability, contact/foliage shadows, and combined-load quality.

All owned browser sessions reached exit code 0. Existing server 4187/PID29472 remains running. No agent delegation, commit or deployment.
