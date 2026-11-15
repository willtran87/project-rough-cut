# Final Cut — grounded materials and boundary woodland

FC57/FC64 implementation progress; the full chapter remains incomplete.

## Runtime changes

- `web/final-cut-surfaces.js` projects the existing pixel materials at fixed physical scales: stone/paving 2 m, timber 1.25 m, turf 6 m. Instanced walls, floors, ramps and paths no longer stretch a single crop across their entire dimensions. Projection is calculated in the vertex shader and uses one map read. Instance-parent coordinates retain the material with moving parent objects. Uninstanced fragment geometry still uses its own local coordinates; this is not a complete material pass on every prop or the rig.
- `web/final-cut-landscape.js` replaces 126 rounded placeholder crown pieces with 42 rooted conifers, 1,008 tapered branches and fixed bent needle sprays using the existing needle atlas. Geometry stays outside the boundary: nearest vertex is at absolute x=33.679 m, beyond the fence at 25.7 m. No collision, visibility/perception, route or cover rules changed.
- Six spatial groups (two materials each) permit frustum culling. Hidden branch end caps are omitted. Final woodland: 20,664 triangles, 12 batches, two materials, one shared texture. Fixed moon/sky diffuse lighting is baked into vertex colors on this boundary woodland; the rig's worklights continue lighting the playable course, but no longer illuminate the woodland. No camera-facing or moving tree cards.
- Atlas loading is inside the existing readiness gate. New geometry/materials are disposed with the scene. The atlas remains owned by the shared Art cache.

## Visual and functional evidence

`tools/verify-final-cut-landscape.cjs final` passed with zero browser errors. Twenty views cover overlook, refuge opening, east stands, west woodland and road-facing boundary at 2560×1600, 1280×720, 844×390 and 390×844. Inspected final desktop/compact captures: consistent stone scale, physical shelter opening, detailed tree silhouettes, readable destination and clear route boundaries. Twenty-four additional camera headings retained stable geometry/texture counts. These positions are explicit visual fixtures, not a route-comprehension test; their objective text deliberately remains that of a fresh run.

`tools/verify-final-cut-opening.cjs` passed, ten views: deployment, actual partial cutting, crushed furniture, protected close pass, cleared wake, pause and saved retry. Inspected the protected-pass capture with the finished masonry.

`tools/verify-final-cut-arrival-browser.cjs --replay=0` passed a complete actual Gamepad API chapter run: every crossing, preparation, bell, physical trap and road exit; 134.861 simulated seconds, zero captures/throws/browser errors. Initial completed-result fixture unlocks the selector; no live gameplay placement after Replay. Nine captures, including the final lure, inspected. This is not a full campaign or a human playtest.

`tools/verify-final-cut.mjs` passed 13 groups and seven full simulated routes with existing timings. The new renderer did not change encounter rules.

Installed web-game client completed two input iterations and exited 0. Final `landscape/client/shot-1.png` and `state-1.json` inspected: playing at 6.53 seconds, physically moving off the overlook, original plan, waiting rig, 78 draws/68,040 submitted triangles, 34 geometries/17 textures in that software view. No error artifacts. Its reported `frameMs` measures submission and is not FPS evidence.

Artifacts: `output/final-cut/landscape/`, `output/final-cut/opening/`, `output/final-cut/replays/plan-0/`.

## Performance evidence and remaining cost

The first candidate regressed software rendering. Preserved reports show the investigation rather than only the final version. Moving material projection out of the fragment shader, removing branch caps, spatial batching and baking boundary lighting reduced the additional cost. The initial trees used 33,264 triangles; the final version uses 20,664.

`tools/profile-final-cut-landscape.cjs output/final-cut/landscape/profile-baked.json --brief` runs baseline/current/current/baseline sequentially in one browser. Baseline substitutes the former trees/material mapping only within that test page. It does not rewrite the worktree. Each view has four warmup and twelve measured direct draws with full-buffer RGBA readback at 960×540 SwiftShader.

| View | Baseline median range | Final median range |
| --- | ---: | ---: |
| Overlook | 76.7–88.3 ms | 79.5–79.7 ms |
| Shelter | 46.2–50.0 ms | 47.2–47.7 ms |
| East stands | 23.4–26.2 ms | 24.0–24.1 ms |
| West woodland | 19.6–20.5 ms | 23.6–24.0 ms |

These include readback overhead and host variability; they are not sustained gameplay FPS or release qualification. West woodland retains about 3–4 ms additional diagnostic cost. Existing software scene costs remain unacceptable for claiming a finished performance pass. Earlier `gl.finish`-only microbenchmarks reported submission rather than completed raster cost and must not be cited as GPU timing proof. The RAF-based visual harness timing is likewise only a diagnostic.

At the high-resolution overlook, submitted draws/triangles changed from 107/95,536 to 117/102,024. In the shelter they changed from 34/64,812 to 39/63,048. Culling can reduce submitted geometry while increasing draws. One extra shared texture is used. No broad performance-preservation claim is made.

Remaining: final prop/rig materials, ground transitions and wet terrain, grandstand/support detail, lighting/composition, sustained renderer/device qualification, human readability/fear/fun/listening acceptance. The current pass addresses the conspicuous crown placeholders and material stretching, not all of FC57 or FC64.
