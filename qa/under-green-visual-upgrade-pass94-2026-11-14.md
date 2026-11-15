# Under the Green pass 94: irregular channel contact

Scope: V18/V20/V22/V24 and review items 20–24. Full 53 requirements, 48 refinements and all seven whole-level gates remain active. This is local shoreline progress, not full water or Level 1 art acceptance.

## Change

The near and far edges of all eight channel sheets now recede by unequal 3.5–14.5 cm pockets from their former straight endpoints. The existing catch grates still mark the crossing. Water slopes down to the same 1.8 mm toe height, with reflection normals derived from the revised profile. The floor's existing sediment and wetness masks reach beneath that contour so the exposed strip belongs to the runoff rather than appearing as a clean gap.

A vertex distance drives contact shading along the actual edge instead of the old rectangular footprint. Foot, Joe, blade and drip contacts exclude the newly exposed fringe, while independent puddles and whole-level flood coverage retain priority. Interior contacts use a fast path; no contour calculation is needed far from the edge. Hazard footprint/timing, movement and collision are unchanged.

No added triangles, draw calls, textures, materials or lights. The eight meshes retain 5,016 vertices and 9,216 triangles in total. One extra float attribute adds 20,064 bytes of vertex data and one shader varying carries the edge distance. This costs shader bandwidth despite unchanged resource counts; timing is reviewed separately below.

## Verified evidence

- Geometry test: 36,864 interpolation samples across all eight channels; maximum profile-to-triangle height disagreement 1.414 mm excluding the existing wave motion. Maximum contour-to-segment error 0.661 mm, inside the 2 mm splash exclusion margin. Numerical slope derivatives agree within 4.9e-8. Upward winding, bounded mesh, zero edge weight, dry fringe exclusion and flood dominance pass.
- Existing contact suite passes player stride, actual Joe sole coordinates, blade crossing, dry/raised suppression, pause deduplication, bounded pools, retry reset and drip arrival.
- Native and software scene suites each pass 51 views: all eight crossings, low/warning/surge/recession, near/reverse, submerged-bed and flood views; plus compact layouts and a complete 12-second pressure cycle. Nonwater geometry fingerprints remain exact. Player, hazard and flood states match baseline. Triangle, draw, texture and shader program counts are unchanged in all paired views.
- Isolated water is exactly black with lights disabled and visibly lit in the positive control, on both renderers. The new bank treatment introduces no emission. Impact ripple heights, exact camera return, pause and reduced motion checks pass.
- Actual native scene target is 2560x1600; software is 960x600 in the large viewport. Also checked 1280x720, 390x844 and 844x390. Opened and inspected low-bed before/after, near surge, east-west bypass, bunker, sluice, whole-level flood, a pressure-cycle frame, portrait, software low-bed and short-landscape images.
- Real-input traversal passes 14 recorded states, including five player contacts, Q lookback, crouch, frozen paused contacts and E pump operation. The checked foot event is at (−0.14, 23.872), height 0.0282 m, exactly agreeing with the visible surface helper. Opened the final crossing image.

Tests: `tools/verify-under-green-recessed-shore.mjs`, `tools/verify-under-green-water-contacts.mjs`, `tools/verify-under-green-recessed-shore.cjs` (native/software), and `tools/verify-under-green-channel-shore-input.cjs --output=output/under-green/visual-pass94/input`. Evidence lives in `output/under-green/visual-pass94/`.

## Performance and remaining checks

The sequential paired benchmark uses six warm-up pairs and 24 alternating fenced wall-time samples per state. First native medians: near 15.2→17.9 ms, crossing 15.8→19.6 ms, flooded 13.9→15.9 ms. Corresponding p95 values: 17.5→19.7, 18.5→21.6, 15.5→18.3 ms. These are shared-machine local timings, not an absolute frame-rate qualification. The measured increase remains a performance concern; do not infer cost parity from equal draw/triangle counts.

Software medians are 128.9→126.0 ms near, 162.6→161.4 ms crossing, and 156.7→154.8 ms flooded. Software p95 values are 135.7→128.8, 166.2→169.0, and 168.0→213.9 ms; the flooded tail worsened. The small favorable software median change does not offset the native concern or qualify overall performance. Installed gameplay client completes all twelve bursts, ending ready/playing at (0, 13.192), elapsed 2.533 seconds, checkpoint 0, actual 960x540. Initial five-second Preparing click timeout recovered through subsequent menu input; no browser-error artifact. Final shot 11 opened and inspected. All owned processes are terminal with exit 0 and all five final source hashes were revalidated. Final source manifest records five files. Keep the broader surface-motion/composition and whole-route performance gates open.
