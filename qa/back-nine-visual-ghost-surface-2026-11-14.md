# Back Nine: coherent apparition surfaces

BV41: muted coherent ghost art, recognizable silhouettes, restrained dissolution.

## Production change

The two pooled groundskeepers now use Level 1's existing body-attached pixel-island dissolve. Back Nine retains its muted green palette, capped head brightness, actual Level 1 mesh/atlas, distance-driven walking, six routes and watching/guide behaviors. The old screen-coordinate checker discard is no longer used here. Bind-pose coordinates carry the dissolve through morph animation and wheel motion.

For the muted translucent combination only, the material renders front faces. The first close inspection showed rear triangles accumulating through the torso and machinery; front-face rendering reduces that unwanted internal brightness. Depth testing remains enabled, depth writes remain disabled, and each visible ghost retains one draw and 5,648 triangles. Level 1's unmuted material keeps its previous double-sided behavior. No new textures, lights, meshes or postprocessing passes.

Changed production files: `web/chase-ghosts.js`, `web/ghost-joe.js`, and the Back Nine import-map versions in `web/back-nine.html`. Ghost model state is exposed in the existing diagnostic output.

## Evidence

Artifacts are under `output/back-nine-visual-upgrade/ghosts/`.

- `before-native` / `after-native`: matched actual-game captures for all six sites; walking; near/far dissolution; reduced motion; 1280x720 and 390x844. Main viewport 2560x1600, native canvas 2560x1440.
- `after-software`: the same gameplay checks on SwiftShader.
- `before-hardware` / `after-hardware` / `after-software` spectral render report: actual model close inspection at four opacity levels, with 2560x1600, 1280x720 and 390x844 captures. The software directory also contains the gameplay report.
- `client-native`: installed skill client, two real input bursts, 30 forward frames plus 15 idle frames each. Player advances from y64.126 to y67.112 between recorded states; ghost travel advances from22.843 to23.668m. Its opacity falls from.68 to.194 as the player approaches. First image shows the groundskeeper; second is almost dissolved, as expected at4.43m.
- Level 1 visual reference inspected: `output/level-one-spectral-surface/after-hardware/moving-2560.png`. The same model remains recognizable in Back Nine while face and mower highlights are more subdued.

All six current native sighting images, near fade, compact view, installed-client images and close model renders were visually inspected. The ghost remains recognizable from front, rear and side views. It no longer has the visible screen checker pattern. The lower figure/mower dissolves earlier than the head, without adding a white head glow.

## Verification

- `node tools/verify-back-nine-spectral-render.cjs` and `--software`: exact one-pixel model translation preserves every sampled surface pixel (780,300 channel comparisons, maximum error0); repeated pose deterministic; monotonic fade energy; opaque foreground fully hides ghost; texture/geometry counts stable during24 animated samples. Native legacy-dither comparison hash unchanged.
- `node tools/verify-back-nine-ghost-surface.cjs`, `--before`, and `--software`: six sightings,1.1m travel in one second, pause equality, guide watch/vanish/disappear lifecycle, stationary reduced motion, material/depth settings, restart, responsive captures and no console/page errors. Native program/texture counts remain31/53, equal to baseline.
- `node tools/verify-back-nine-detail.mjs`: six clear38.25m loops, continuous turning, gait, existing foliage and particle contracts pass.
- Installed client: `node tools/verify-presented-client.mjs --url http://127.0.0.1:4187/back-nine.html?test --actions-file tools/fixtures/back-nine-ghost-surface.json --click-selector '#primary' --iterations 2 --pause-ms 250 --back-nine --ghost-surface --high-resolution --native-renderer --screenshot-dir output/back-nine-visual-upgrade/ghosts/client-native`. No error artifacts.

Two initial browser fixture failures were corrected: batched render requests did not advance all intended frames, and nested GLTF/root groups shared a name and were counted twice. The final tests update authoritative scene time frame by frame and inspect top-level ghost roots. A later fixture correction keeps reduced-motion settings active for its screenshot.

BV41 is accepted at its stated scope. Whole-level surface repetition, environmental composition, actor craft and combined-load performance remain separate unfinished requirements. This pass makes no general frame-rate claim.
