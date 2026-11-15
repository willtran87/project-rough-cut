# Trees, vegetation and ground refinement

The original illustration's irregular, visibly branching pine is the reference for this pass. Repeated solid cone tiers were removed. The default course now uses tapered bent trunks, roots and branches, with small curved needle planes arranged as asymmetric spatial crowns. Young firs are shorter/narrower with lower foliage, spreading pines are fuller, and weathered pines expose more branch structure. Each tree is deterministically varied by its world position.

## Art and landscape

- Built-in ImageGen created four transparent high-resolution pixel-art needle sprays using the original obstacle atlas as a reference. Source: `assets/environment/woodland/needle-sprays-v1.png` (1254x1254 RGBA). Runtime: `web/assets/optimized/rough-cut-needle-sprays-v1.webp` (872,608 bytes, lossless). Exact prompt and usage notes are beside the source. No CLI fallback was used. All four cropped boundaries have zero visible alpha pixels at their edges, avoiding rectangular clipping.
- The initial test with rounded solid foliage masses and cropped old branches was rejected after visual inspection. The final crowns use the purpose-made needle components, actual woody geometry and open gaps. Branch components remain fixed in world space; they never face the camera as whole-tree illustrations.
- Six original vegetation sprites now form irregular growth patches. Damp areas favor reeds, woodland favors ferns and young conifers, and later dry areas use brown grasses. Height, width, bending, tint, density and orientation vary. Static batching preserves vertex colors. Low grass tufts blend course rough into the border, with explicit path clearance and no new colliders or footing changes.
- Hedge rims have irregular clusters while retaining their solid cover volumes. Ground samples the original turf at two orientations/scales, with broad stable growth variation. The forest floor also varies across larger patches. Surface colors still distinguish paths, sand and hazardous footing.
- Deeper tree placement and undergrowth fill the side borders. A planted bank now wraps behind the starting position as well as behind the exit. Shared terrain heights keep plants and trees grounded. Buildings retain clearings, and new border solids remain beyond the course bounds.

## Evidence

`tools/verify-woodland.cjs` checks texture readiness/errors, three tree forms, fixed tree and landscape transforms during movement, off-course scenery bounds, rear-border placement, real terrain elevation, movement against/along the existing course boundary, and ordinary shed filing through door opening and victory.

Before/after evidence is in `output/woodland-refinement/`. High-resolution captures use 2560x1600 and include both side borders, the end, start, rear, opening path, and building approaches. The shed also has 1280x720, 800x600 and 844x390 captures. Syntax and release validation pass: 90 action fixtures, 55 runtime images totaling 17.94 MiB, no source masters shipped and no warnings/failures.

Final woodland views at 1280x720, 800x600 and 844x390 (with touch controls) were inspected. Pixel-world acceptance passes all ten groups, including fixed props, Joe orientations, normal bell Use, scene replacement, resolution changes, parallax strafing/full turns, reduced motion and Pause; no browser errors. The installed web-game client completes two normal input bursts; the final screenshot/state show the first hole, 14 m travel, ready course assets, no failed assets and no console-error artifact. Reports/captures: `pixel-world.json`, `after/woodland-*.png`, and `client/`.

There are 137 trees (63 spreading pines, 51 weathered pines and 23 young firs), 32 side terrain chunks, banks at both ends, 84 side vegetation patches and two end patches. These counts are scene records; their fixed geometry is merged by material and spatial chunk.

Final isolated RTX3090/D3D11 samples at 1280x720: all four five-second views have median 16.7 ms, maximum 16.8 ms and zero intervals above 50 ms. Service/clubhouse/shed/border submit 746,384/786,612/539,186/557,464 triangles and 981/868/594/537 draw calls, including shadow work. The pre-turn comparison had the same frame intervals; submitted triangles increased about 9-14% in these views. Reports: `performance.json` and `performance-comparison.json`. These are held-simulation desktop samples, not sustained play or mobile qualification.

Rendering preparation passes held simulation, first active render, pause/resume, failed-model fallback and cancellation/rebuild. Detailed tree construction now yields between short work batches under the existing ready gate. Final first active submission is 17.3 ms; preparation takes 5.65 s and the largest loading interval is 1000 ms. Before batching, the denser trees produced a 1616.5 ms loading interval and 20.5 ms first active submission, with 3.89 s total preparation. This trades total load time for shorter blocking work. Initial loading is still not stutter-free. Reports: `preparation.json` and `preparation-before-slicing.json`.

The original movement, collision, AI, interaction, scoring and parallax implementations remain in place. This is an art/presentation change, not new explorable terrain. Human playtesting remains deferred as requested; exact artistic reproduction and physical-mobile performance are not claimed.
