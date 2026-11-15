# Pass 68 — preserve contact shade while culling off-screen pieces

Local performance work within the full 53 requirements and 48 refinements. No requirement status or whole-level gate is promoted. The previous review turn produced current high-resolution scene evidence and refreshed the art priorities; this turn implements a renderer change.

## Implementation

`web/under-green-contact-shade.js` retains its original two transparent batches, all vertex attributes, full index sources, sorting centers, materials and triangle order. On the software renderer only, a private `createCourseBatchCulling` instance compacts indices for whole authored pieces proven outside the camera frustum. It does not use opaque-wall occlusion, distance limits or material changes. The scene updates it after final camera placement. The native renderer retains its original immutable buffers.

There are 909 nonempty pieces: 335 floor contacts and 574 root strips. Their 160,128 indices describe the original 53,376 triangles. Software keeps a source-index copy and conservative padded bounds. Re-enabling restores complete indices and invalidates cached camera visibility; repeated enabled requests preserve the current packed state. A stationary camera uploads no changed indices. Disposal releases the private culler and both meshes/materials.

No art, lighting, world enclosure, collision, pursuit, water timing, controls or retry rules change. No textures, shader programs or draw batches are added. This does not replace the remaining environmental art work.

## Verification

Evidence: `output/under-green/visual-pass68/`. Production source before/after and verifier snapshots are in `source/`.

- `tools/verify-under-green-contact-culling.cjs`: 43 baseline/current comparisons on each renderer, all framebuffer SHA-256 values identical. Includes six districts, close root, flood, Joe, 16 camera headings, FOV 45/85/58, crouch, actual Q input, reduced motion, pause/resume, entrance restart, camera return and disable/move/re-enable/repeated-enable transitions.
- Organic ghost samples cover ages with alpha 0, .449286, .46 and .034074; the ghost is actually visible during the latter three. Its transparent pixels remain identical around the retained contact shade.
- Every software comparison checks all 160,128 original indices: contiguous complete piece coverage, every vertex inside its padded bounds, an independent Three.js frustum oracle, and exact retained index order. Geometry attribute hashes, full index counts, material properties and sorting bounds match the baseline. Full restored index hashes also match.
- Native actual scene sizes: 2560x1600, 1280x720, 390x844 and 844x390. Software: 960x600, 960x540, 390x844 and 844x390 respectively. Lights, textures, programs, resolution and player state match for every paired view. Screenshots inspected include native Joe/ghost and software gallery/portrait.
- Disposal events fire exactly once for each of two geometries and two materials, including repeated disposal. No owned contact meshes remain. No console/page errors.
- `node tools/verify-visible-indices.mjs`: 512 visibility transitions, deferred GPU uploads, unchanged/tail-only cases and 16/32-bit index limits pass.
- Installed web-game client: seven input bursts. Initial Preparing-button click timed out; later start input recovered. Final `state-6.json` is ready/playing at (0, 8.072), elapsed 1s, checkpoint 0, actual 960x540. Final screenshot and state inspected; no error artifact. Startup delay remains an existing concern, not a successful initial click.

Geometry and simulation are unchanged; this pass does not claim a new full-route collision or gameplay qualification from the narrower renderer checks.

## Rendering work removed

| Software view | Original contact triangles | Active contact triangles |
|---|---:|---:|
| Gallery entrance | 53,376 | 47,254 |
| Crossing | 53,376 | 34,880 |
| Bunker | 53,376 | 23,214 |
| Pump | 53,376 | 31,770 |
| Range | 53,376 | 11,550 |
| Keeper | 53,376 | 2,352 |
| Close root | 53,376 | 2,700 |
| Flood | 53,376 | 43,310 |
| Joe encounter | 53,376 | 11,700 |

## Local timing, not production acceptance

`tools/verify-under-green-contact-culling-budget.cjs` alternates two prepared baseline/current scenes for 24 GPU-fenced samples after six warm pairs. All owned render/client jobs are terminal before each timing run; native and software measurements run sequentially. Other chapter verification jobs are recorded in process inventories, so results are shared-host diagnostics.

| View | Native median ms before → after | Software median ms before → after |
|---|---:|---:|
| Crossing | 15.0 → 15.5 | 161.3 → 161.0 |
| Pump | 13.8 → 13.7 | 160.6 → 158.4 |
| Range | 14.5 → 13.8 | 172.3 → 167.9 |
| Bunker | 12.1 → 11.1 | 133.7 → 128.3 |

Native is 2560x1600; software is 960x600. The native path is unchanged, and its timing variation is not an optimization claim. Software medians show modest local reductions, but range/bunker P95 values worsen in this run (177.9→183.1ms and 207.1→226.2ms). Preserve those results rather than claiming a universal speedup. Absolute software performance remains poor; all seven acceptance gates remain pending.

Moving-camera timing is complete (`budget-moving-software/report.json`). Each paired frame follows the same sinusoidal yaw sweep, exercising frustum traversal and changing-index uploads. All four medians decrease in this sample. Other live Level1/FinalCut jobs were recorded before/during the run; higher absolute times than the stationary run reinforce that these are shared-host diagnostics, not a stable production frame-rate claim.

| View | Moving median ms before → after | Moving P95 ms before → after |
|---|---:|---:|
| Crossing | 275.0 → 269.9 | 296.1 → 307.5 |
| Pump | 235.2 → 231.4 | 274.3 → 272.2 |
| Range | 250.7 → 243.2 | 548.0 → 320.0 |
| Bunker | 179.0 → 164.0 | 198.9 → 214.7 |

