# Back Nine practical light field — 2026-11-14

Back Nine's existing small lamps previously displayed glowing geometry without lighting their surroundings. The new fixed-source field gives 84 path lanterns, two relay shelters, the garage entrance and starting shed actual local illumination. It advances BV34/BV37 and makes the existing materials/structures more legible. The full 48-item upgrade remains open.

## Implementation

`web/back-nine-practical-lights.js` builds a conservative world-space grid containing every source whose eight-metre sphere intersects a cell. The actual course has 88 sources, a 47×409 grid and at most four sources per cell. A single 1,230,272-byte float texture uploads during staged preparation. Camera movement never chooses or relocates a source. Circuit sag uses two uniforms; it does not rewrite/upload the grid every frame.

Source origins follow the existing fixtures and their terrain height. Lantern power follows the same spatial circuit sag as the visible road-lamp batches. Shelter, garage and shed lamps stay steady. Hooded fixtures send most light downward, with restrained upward spill. The first candidate overlit the shelter ceiling; the final version reduces that spill to 10% above the fixture. The existing turf visibility floor is retained while allowing actual source contribution to remain visible.

The field hooks existing Lambert/Phong materials, including dynamic characters and vehicles and dormant software light variants. It introduces no meshes, geometry, physical obstacles, gameplay light detection or AI changes. Software's separate Basic-material foliage path is not covered; its pre-existing lighting discrepancy remains open. Existing Level 1 modules are untouched.

Production integration is six added/three replaced scene lines plus the new module and two import versions `20261114-practical-lights-2`. The light texture participates in warm-up and disposal.

## Verification

Evidence root: `output/back-nine-visual-upgrade/practical-lights`.

- `rules.json`: 31,360 spatial query points retain every in-range source in a representative layout, including cell boundaries. Terrain attachment, static texture version under 100 circuit updates, idempotent shader wrapping, diagnostic source switch and one-time disposal pass.
- `final-native`, `before-native`, `final-software`: 13 matched cases each, including lantern paths, both shelters, garage, nearby Joe/beacon, reduced motion and ordinary/phone layouts. Main viewport 2560×1600. Actual native shelter-on/off, garage, software shelter and subsequent gameplay captures inspected.
- Source-off controls use the same renderer, geometry, state and camera. Native changed-pixel counts above two channel levels: lantern 263,448; shelter 1,933,128 at 2560×1440. Software: 28,103 / 190,416 at 800×450. Both total color differences are positive. Actual paired shelter images show the light revealing clothing, timber, roof underside and paving without changing sky or distant terrain.
- All 13 matched gameplay states remain identical: player/cart/Joe/time/objective/relay progress/service/utility/navigation/destruction/failure. Draws, triangles and 36 programs are unchanged. Textures increase 56→57. Browser errors are empty; pausing freezes the full run.
- Installed standard client runs two movement/turn bursts per renderer through the maintenance shelter. Both end at player `(1.606224015981739,306.5428922631389)`, speed 7.2 m/s, with one relay online. Native canvas 2560×1440: final average 11.17 ms / P95 12.20 ms. Software 640×360: 84.24 ms / P95 111.80 ms. Actual final screenshots inspected. These are different quality levels, not comparable performance targets.
- Dedicated shelter layout checks use 1280×720 and 390×844 on both renderers. After powering the relay, the UI restart must return to the fresh-run cart at `(0,14)`, clear relay progress and remove the on-foot state. The legacy `checkpoint` field counts powered relays; it is not a respawn checkpoint. The first audit incorrectly expected zero during the successful traversal, and the first restart assertion used the course marker `(0,12)` rather than the actual cart spawn offset. The final test derives the fresh cart position from `createRun(0)`.
- `tools/audit-practical-lights.mjs` checks comparisons, source-off proof, both client states, restart/layout reports, served bytes and unique import keys, then archives accepted sources/tests with evidence hashes.

## Cost and limits

Two prepared worlds on the same renderer, alternating GPU-fenced blocks at 960×540, 36 samples per candidate:

| View | Native median before → after | Software median before → after |
|---|---:|---:|
| Shelter | 8.6 → 8.1 ms | 72.9 → 79.0 ms |
| Lanterns | 8.1 → 8.3 ms | 72.9 → 82.8 ms |
| Road | 7.0 → 7.1 ms | 63.0 → 71.0 ms |

Shared-host timings are noisy; this is not a speedup or whole-level performance claim. Software pays a measured 6–10 ms median cost for the added lighting and remains below the desired performance/fidelity bar.

This pass does not add source shadow maps or wall occlusion, light every emissive sign/fault fixture, solve software foliage lighting, or complete the course's architectural composition. Those gaps remain on the ledger. The newly readable shelter underside also exposes its shared exterior roof material; interior construction deserves a separate art pass. `first-native` predates the hood adjustment and is intermediate evidence.
