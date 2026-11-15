# Level 1 approach wear — 2026-11-14

The63 small scuff polygons around seven work stations previously used an unlit material. They appeared as pale floating shapes beside the source-lit paperwork, particularly at Release Review. Pixel-volume Level1 now paints those existing approach marks into the terrain atlas as restrained compacted centres, interrupted scrapes and broken edge grains. The wear modulates the underlying ground colour and therefore retains the path, sand and mud identity. It receives the same source lighting, ground detail and shadows as the terrain.

## Implementation

- `web/course-approach-wear.js` shares the original seven station anchors and nine positions per approach, using integer atlas pixels and bounded colour modulation. No frame-time work or new rendering pass.
- `web/terrain-finish.js` exports the painter; `web/scene-3d.js` calls it only for pixel-volume terrain after existing path art.
- `web/environment-guidance.js` skips the old63 scuff polygons only in pixel-volume mode. Other marker geometry, state-driven colours/bolts and the seven printed forms remain.
- `web/baked-terrain.js` versions the new bake and includes shed/drain positions in the key. Illustrated mode retains the previous key, bakes and geometry. Unknown layouts use the same procedural painter.
- Three lossless1536×4096 bakes are registered in the existing manifest. Old entries remain for legacy mode. No new map/material/mesh/light/collider is introduced; the existing ground texture is replaced. The old guidance batch loses441triangles.

## Evidence

Artifacts: `output/level-one-approach-wear/`.

- Actual painter bakes: standard_review `terrain-d2f644888296c677.webp`, eastern_exception `terrain-ea0ee50a860016ed.webp`, closing_shift `terrain-7bbc34c07a56a55f.webp`. The bake tool confirms lossless pixel equality before writing each WebP.
- `tools/verify-course-approach-atlas.cjs` compares each new bake to the old bake plus the actual wear painter. Zero mismatched channels. Exactly3205/3212/3207 pixels change, all inside the63 small approach bounds; every other terrain pixel is identical. Moving either exit invalidates the new key; the legacy key remains stable.
- The same verifier compares original/current guidance through five practice/exit states for each of three variants and both art paths:30state comparisons. Legacy buffers are identical; pixel-volume buffers differ only by removal of the1323 leading scuff vertices. Remaining position/colour arrays, including moving bolts, match exactly. Printed-paper position/normal/UV buffers match.
- `tools/verify-course-approach-wear.cjs`:16matched views per renderer before and after, covering allseven approaches, farther views,1280×720,390×844 and walking. Native high-resolution viewport2560×1600 renders2492×1402; ordinary1193×671; portrait379×833. Software fixture landscape800×450; portrait405×890. All32paired inventories, anchors and camera poses match; every matched view retains draw count and removes441triangles. All current and baseline software full-geometry/reference-restoration comparisons are exact.
- Two additional current views per renderer cover the lit Release Review approach at1280×720 and390×844. This supplements the very dark Audit Row phone view; the latter is not used as proof of visible surface detail. Extra software reference/restoration checks are exact.
- Movement, pause/resume, bounded warm resources and world rebuilding pass. Existing paper geometry/material/map still dispose exactly once. No browser errors. Texture/program counts match baseline; renderer geometry residency differs by one under different camera-search/prewarming histories and is not used as an allocation comparison.
- Installed skill client via `tools/verify-presented-client.mjs --level-one --approach-wear --high-resolution`, with/without `--native-renderer`: two input bursts each complete normally. Player x100/progress595 → x102/progress597, clearance16.13 →17.87. Final screenshots and text state inspected. Native2492×1402; adaptive software960×540 →800×450. No error artifact.

The initial station-view search aimed at an arbitrary approach midpoint obstructed by the valve assembly. The final fixture selects a clear, legal standing view toward an actual existing wear mark; it changes no production placement. Saved cameras are shared with baseline/software runs. File names `paper-*` in the view folders are inherited from the earlier fixture; these captures now target the station approaches.

## Visual assessment and remaining work

Release Review is the clearest before/after: the conspicuous beige polygon trail disappears into worn ground under the existing warm/cool light. The marks remain subtle and often invisible in very dark locations, as intended for optional surface detail. No ambient or source power is increased, and all28symmetric path lanterns remain unchanged.

This is local V01/V05/V09/V10/V18 progress. It does not establish broader terrain shape, work-area storytelling, route composition, shadow quality or software performance acceptance. The drain's separate bright reflection slivers remain an observed material issue. The next review should return to full opening/landmark/transition composition (V04/V20), alongside remaining ground/material integration, rather than treating these close-up passes as completion of the full35-item/V01–V21 goal.

## Timing

All owned bake, verification, client and timing processes finished normally. Median of three blocks, milliseconds:

| Renderer/method | Release before → after | Service before → after | Opening before → after |
|---|---|---|---|
| Native, separate loads | 6.8 →4.8 | 6.1 →4.2 | 11.5 →7.4 |
| Software, separate loads | 50.5 →56.5 | 49.5 →64.9 | 82.9 →90.8 |
| Native, same-world alternation | 13.1 →12.4 | 12.4 →12.0 | 15.7 →16.4 |
| Software, same-world alternation | 39.8 →41.2 | 45.4 →47.2 | 90.4 →86.3 |

`tools/profile-course-approach-wear.cjs` switches the saved original guidance and original ground map against the new guidance/map within one loaded scene. It preserves the existing lit paper mesh and every other source/object/camera. Each block renders24frames, discards12warmups and includes full RGBA readback after gl.finish, in before/after/after/before/before/after order. This is isolated rendering cost, not gameplay FPS; the separate-load presentation timings use a different measurement boundary.

The controlled comparison reduces the apparent software regression, but the station views still have a small measured cost and the native opening also rises slightly. Retain the visual improvement without claiming speed or cost neutrality. Software fidelity/performance and whole-route acceptance remain open. All16pass-related source, asset and tool snapshots under `verified-source/` match their SHA256 manifest and current files.
