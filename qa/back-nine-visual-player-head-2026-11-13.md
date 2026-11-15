# Back Nine player head — partial visual upgrade

Continues the full 48-item objective and advances BV26. This is not acceptance of the whole player or level.

## Changes

- Replaced the 128px procedural face with the authored 1254px face started in the prior unfinished pass. Built-in image_gen source and exact edit prompt are preserved at `assets/characters/player/back-nine-face-v1.png` and its `.prompt.txt` sidecar. Runtime PNG is an identical copy.
- Initial captures revealed visible rectangular face edges and disconnected jaw geometry. Replaced the overlay, separate nose pieces and overlapping head/jaw primitives with one continuous shaped head in `web/runner-head-craft.js`. UV registration retains the eyes and mouth; the nose has actual profile depth. Side skin, ears, neck and hands use the feature-free texture border.
- Replaced the large rounded hair pieces with a continuous scalp, uneven hairline, short temples and longer nape. Built-in image_gen generated a fine directional brown hair texture, requested1024px, actual1254px. Source/runtime PNG and exact prompt are stored under the player asset directories. No generated asset is referenced outside the repository.
- Nearest magnification and mipmapped minification remain. Face, hair and cloth decode concurrently during preparation. Existing articulated and seated material batches are retained, as is explicit texture/geometry disposal. Cache version is `visual-player-face-2`.
- Actor remains24meshes; triangles12758→16274 (+3516). Native27programs/46textures remain unchanged. Two larger textures add approximately16.6MB of RGBA+mip allocation versus their former128px maps. File sizes: face1,652,818bytes; hair1,963,033bytes.

## Evidence

- Canonical evidence: `output/back-nine-visual-upgrade/player-face/native/report.json` and `software-final/report.json`. Native before/after captures compare the saved pre-face sources against current sources. Native-final contains intermediate and later face-only iterations; use `native` for the final paired comparison.
- Native2560x1600 viewport / actual2560x1440 buffer, plus1280x720 and390x844. Inspected front, oblique, profile, back, red lighting, seated driver, normal chase and smaller views. Jaw edges are removed. Hair detail is finer and silhouette less bulbous. The red-light diagnostic illuminates the rear/edge of the head, not the entire face. Close-up cameras do not refresh world culling and are actor diagnostics only.
- Software pass confirms current face/hair assets, running poses, pause/resume/restart and no browser errors. Actual software target is960x540 in the close-up fixture, not native2560. Inspected its oblique face view.
- Both browser suites check60 running joint poses, finite vertex positions, texture sizes, pause freeze, resume and shed restart. Native paired checks confirm unchanged mesh/program/texture counts. No browser errors.
- `verify-runner-head.mjs` checks finite positions/normals/UVs, outward-facing head/scalp via actual ray intersections, and the nose's depth and UV registration. Pass. Existing terrain-rules2940samples and footprint12960heading/8000vehicle/12sweep checks also pass.
- Installed standard gameplay client ran through `verify-presented-client.mjs --back-nine --runner-terrain`, two normal forward/turn/stop bursts. Player ends at(-15.55,387.45), on foot under live Joe pursuit. Screenshots and state inspected; no error artifact. Both bursts use640x360. First completion average71.6ms /p95 99.4ms; finalp95 70.8ms. Fidelity during load remains unresolved.
- Fixed960x540 software comparison (`budget/report.json`):48 GPU-fenced measured draws after8 warm draws. Baseline actor absent/present medians50/52ms; new49/54ms. Actor-presentp95 66.2→72ms. Same110/134draws and137347background triangles. The head adds a modest measured cost in this sample; the scene was already substantially over budget. No performance acceptance claim.
- `source-manifest.json` preserves14 current source/asset/tool hashes. Face SHA25658CBCAC082C468F5B67C70FAC116BCDC79443BF3C22DC6865F575DEB07033D9D; hair2E11992190D1D11E4C0D2996452432EEF1445E90092066A033BACCCA4C0D7D21.
- Current `verify-back-nine-experience-browser.cjs` passes keyboard valve/rolling-cart/garage escape, ghosts, silence, reduced motion, pause and both restart paths, including runover defeat. No browser errors;27programs/46textures retained. Report copied to `player-face/experience-browser.json`. Its final13.4ms completionp95 sample at1280x720 is not sustained combined-load performance evidence.

## Remaining scope

Player hands, ears, boots, body silhouette and full material/readability parity remain open. The portrait HUD still covers too much of the390px stage. Wider environment composition, machinery, destruction, weather, lighting and performance work remain in the complete48-item ledger. BV26 remains in_progress; no full requirement is promoted from this scoped evidence.
