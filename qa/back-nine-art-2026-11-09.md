# Back Nine: shared pixel art direction

Level 2 now uses Level 1's actual sky renderer and source illustrations: painted moon, remapped sky dome, nine moving cloud cards, distant ridge and tree rings. The long course scales horizon translation to stay inside those layers. The normal driving camera includes the moon; turning still changes which part of the sky is visible. Level 1 defaults and its distant estate cards remain unchanged. Level 2 uses its physical clubhouse instead of duplicate estate cards.

Both chapters now call the same pixel palette/grain generator. Level 2 uses world-scale textures rather than stretching one texture over an entire fairway, vehicle or wall. Updated elements include neutral cart enamel, aged mower paint and rust, wood, iron, rubber, stone, slate roofs, rounded hedges, uneven rocks, verge plants, detailed caged lanterns and path shoulders. The route, collision footprints, cart handling, Joe's navigation, checkpoint logic and tension director are unchanged.

Four templates baked from the original branching pine builder replace rounded solid crowns. One original painted needle spray per branch gives the open course bounded foliage detail. Four crops share a padded atlas, reducing foliage from 20 to eight instanced draw groups. The 140 placements reuse these templates and are culled by camera/distance. `node tools/bake-course-pines.mjs` rebuilds the 156,850-byte compressed geometry; the shared-art test checks its source fingerprint.

Texture uploads are prepared serially with a GPU fence and a short yield for each texture. Shader compilation occurs before driving. This fixed a first-rear-view texture allocation found during testing. There are still only two local lights, no shadows or postprocessing, and the single-frame submission limit/adaptive software resolution remain active.

## Verification

- `verify-back-nine-art.cjs`: shared original sky maps, unchanged Level 1 parallax defaults, visible moon and contained horizon at start/checkpoints/garage, paused/reduced-motion clouds, actual Level 1 cart palette, bounded reused foliage pools, and actual Level 1 menu-to-gameplay rendering. Zero browser errors.
- `verify-back-nine-browser.cjs`, hardware and software: keyboard steering/acceleration/brake/reverse, touch, gamepad, pause/resume, fullscreen, checkpoint saves and reload, retry/replay, completed reload and finish. No shader/texture growth in repeated wet/rear views. Stable 16 programs / 34 textures.
- `verify-back-nine.mjs`: six routes finish with live Joe, including alternate paths and both checkpoint starts. `verify-back-nine-tension.mjs`: warning, surge, cooldown, lost-sight cancellation and safety rules pass.
- Installed standard gameplay client via `verify-presented-client.mjs`: two action bursts pass, cart travels from y14 to y30.7, Joe pursues, no error artifacts. Presented screenshots inspected.
- Release check: 90 scenarios pass; its Level 1 manifest remains 56 images / 20.8 MB. This manifest count is not a total Level 2 transfer measurement. Whitespace check passes.
- Actual screenshots inspected at 2560x1600, 1280x720 and 844x390, covering sky, foliage, road, wet ground, rear mower view, garage and Level 1 regression. Evidence: `output/back-nine/`, `output/back-nine-art/`.

## Performance limits

Short local mixed wet/rear diagnostic samples, run sequentially:

| Renderer | Internal resolution | Ready time | Average completion | p95 completion |
| --- | --- | --- | --- | --- |
| RTX 3090 / D3D11 | 1280x720 | 2.41 s | 11.03 ms | 12.70 ms |
| SwiftShader | 960x540 | 3.70 s | 47.17 ms | 84.90 ms |
| Standard client / SwiftShader opening drive | 960x540 | Not sampled | 29.12 ms | 37.50 ms |

The earlier suspense pass recorded software 45.89 / 56.20 ms in its mixed-view test. The new pass restores substantially more original art; these separate short runs do not prove performance parity. Software frame spikes remain, despite atlas batching and stable resource counts. No claim of universal 60 FPS or eliminated cold-start cost.

Human testing stays deferred. Later compare the two chapters' visual identity, path readability during turns and power dips, texture shimmer in motion, and whether the open course remains threatening without making obstacles hard to judge.
