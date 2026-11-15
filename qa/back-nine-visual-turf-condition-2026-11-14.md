# Back Nine: authored turf condition

This pass adds dry straw, exposed root mat and thin soil to 17 authored areas across the nursery, range and clubhouse. The material follows rises, verges and former work areas. Maintained greens and their irregular fringes remain healthy. This is partial progress toward BV01/BV05/BV07/BV09/BV12, not acceptance of the full 48-item visual objective.

## Implementation

- `web/back-nine-turf-condition.js` defines the authored regions and a fixed 168 × 1676 two-channel condition texture. It stores dry/thin weights at two samples per metre, takes 563,136 bytes before driver overhead, and uploads once per scene.
- Turf, feathered turf shoulders, intact grass beneath mower scars, and the irrigation surface all use that same world-space field. Different mesh triangulations cannot shift the blend boundary. Fully torn mower soil retains its own material.
- One new 1254 × 1254 dry-turf artwork supplements the existing healthy grass and sediment artwork. Detail texture samples are conditional on nonzero dry/thin weights. The condition mask uses linear filtering; the artwork retains its existing crisp pixel filtering.
- The owned field is disposed once by the scene. The dry artwork uses the existing shared Art cache. Both custom shader inputs now enter the bounded texture preparation queue before buffer warming; they are not left for an incidental draw upload.
- Import-map versions are `20261114-turf-condition-2`. The map has unique keys and the four relevant served modules were checked against local bytes. The mower-scar module's text is unchanged from the saved baseline (line-ending bytes differ).

## Artwork provenance

Generated with the built-in image_gen tool; no external API or key. The source was inspected. Runtime WebP is a lossless format conversion preserving dimensions and RGB pixels, with no resizing or repainting.

- Source: `assets/environment/back-nine/back-nine-weathered-turf-v1.png`
- Exact prompt and original generation path: `assets/environment/back-nine/back-nine-weathered-turf-v1-prompt.txt`
- Runtime: `web/assets/optimized/back-nine-weathered-turf-v1.webp`

## Verification

Evidence root: `output/back-nine-visual-upgrade/turf-condition`.

- Field unit: 42,700 samples; maximum interpolation error 0.02203; 6,720 maintained-green samples remain zero. All 17 regions appear; exterior clamp, deterministic rebuild, shader composition, unchanged course/navigation and disposal pass.
- Real GPU field oracle: 27 translated world positions on native and software renderers; maximum channel error approximately 0.001961. Covers region centres, green centres and points beyond the field.
- Browser views: 12 fixed gameplay cameras plus the flooded basin returning to dry, at 2560 × 1600, then 1280 × 720 and 390 × 844. Includes nursery, range, clubhouse, fairway, maintained green, bunker, maintenance area, red beacon and flooding. Pause/resume and full restart pass; no browser or asset errors.
- Final upload verification in `prepared-native` / `prepared-software` records both custom textures in the preparation queue and field version 1 after view changes and pause/resume. Earlier `final-*` images precede only the preparation-queue fix; `after-native` is the rejected vertex-interpolation prototype.
- The installed standard game client runs through `tools/verify-presented-client.mjs`, using actual forward/turn/rear-look input from `tools/fixtures/back-nine-mower-scars.json`. Native and software end at the identical player position `(20.99670594253312, 83.94355811194566)` with the same Joe/cart/checkpoint state. Actual screenshots and state were opened and inspected; no error artifacts.
- The final native client was rerun after the preparation-queue fix (`client-prepared-native`): identical player state, 2560 × 1440, average 12.48 / P95 15.40 ms, 35 texture-preparation batches instead of 33, no errors. Final prepared screenshots were inspected, including the clubhouse, ordinary desktop, portrait and flooded software view. Fourteen of fifteen images per renderer are pixel-identical to the preceding final suite; the portrait/native and beacon/software captures have localized differences, so whole-suite pixel identity is not claimed.
- Existing flood-shore and mower-scar units pass: 101,101 opacity samples, 5,198 flood vertices and 120 terrain routes / 26,404 scar triangles, plus rate/reset/buffer checks. No physical wet boundary, movement, navigation, AI or checkpoint rules changed.

## Resource and timing evidence

Thirteen matched baseline/current native states preserve player, cart, Joe, time, progression and navigation. Visible draw calls and triangles are unchanged; textures increase from 53 to 55 and shader programs from 32 to 33. This is a rendering/material change, not added geometry.

Two prepared worlds on one renderer, alternating blocks with GPU completion fences, 36 measured samples per world/view at 960 × 540:

| Renderer / view | Baseline median / P95 ms | Current median / P95 ms |
| --- | --- | --- |
| Native, worn rise | 10.5 / 13.4 | 9.9 / 13.1 |
| Native, unaffected road | 8.2 / 13.0 | 8.2 / 11.0 |
| Software, worn rise | 93.9 / 100.0 | 102.3 / 108.3 |
| Software, unaffected road | 95.3 / 125.9 | 92.7 / 109.2 |

The software worn-rise result exposes added fragment cost. Other browser tasks were active on this shared host, so the figures do not establish a general speed change. The actual chase client rendered natively at 2560 × 1440 (average 13.81 / P95 16.30 ms); software fell to 640 × 360 (135.68 / 202.00 ms). Those are scoped observations, not whole-level performance acceptance. The upload-queue correction followed these measurements and does not alter steady-state shader work.

## Remaining scope

The whole level still needs stronger middle-distance composition, layered distant scenery, more varied vegetation silhouettes and placement, broader material consistency, actor/machine motion and static grounding. Full quality parity with Level 1, stable pixel detail in motion, software fidelity and combined chase/flood/destruction performance remain unproven. The ledger retains all unfinished items rather than declaring this turf pass sufficient.
