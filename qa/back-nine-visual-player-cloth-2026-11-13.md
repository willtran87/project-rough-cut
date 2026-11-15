# Back Nine player clothing — partial visual upgrade

Advances BV26 within the full 48-item goal. Face, hair, skin, boots, silhouette refinement and whole-model Level 1 parity remain open.

## Implementation

- Built-in image_gen produced the new work-cloth albedo (requested 2048 square, actual 1254 square). Source: `assets/characters/player/back-nine-work-cloth-v1.png`; runtime: `web/assets/optimized/back-nine-work-cloth-v1.png`; exact prompt: `assets/characters/player/back-nine-work-cloth-v1.prompt.txt`. Source/runtime files are identical SHA256 E862FD2EA2E091BD5BED36DC46F3C5DDA5716922344032ACBEA04663D824C565, 3,203,745 bytes each.
- The cloth texture replaces the old procedural 128-square weave, retaining nearest magnification and mipmapped minification. Independent decoding begins with other scene assets and completes before the runner is constructed. Shirt and trousers share the one texture; there is no new material batch or shader variant. Estimated additional RGBA+mipmap allocation is about 8.3 MB compared with the former 128-square map.
- Added curved back yoke, double seam, centre pleat, side seams, rear collar, cuff stitching and rear trouser pockets. Details merge into their existing articulated parts and the baked seated model. Runner remains 24 meshes; triangles increase from 10,594 to 12,758.
- Rejected the initial coarse panel after actual screenshots exposed intersection with the torso. Subdivision projects it onto the garment; analytic smooth normals remove the resulting visible triangular facets. Final source is the version used by `native-final` / `software-final` captures.
- Face/hair procedural maps and their deterministic appearance remain unchanged. Their former RNG state was preserved when removing the unused cloth generator.

## Verification

- `verify-back-nine-player-art.cjs`: saved baseline sources, matched native before/after views, standing front/back, moonlight, red-light diagnostic, seated driver and normal chase. Final native and software passes each cover 2560x1600 viewport, 1280x720 and 390x844, plus running-joint checks. No browser errors. Mesh/program/texture counts unchanged; new cloth confirmed at1254 square. Native before/after back, final front/back/red/driver, software front, and responsive normal gameplay views inspected.
- The first camera fixture left the wrecked cart on the player's position and obscured the close-up; corrected the fixture and reran. The final views move the wreck away. Close-up cameras are diagnostic actor views; their background culling is not a whole-world visual acceptance.
- `verify-runner-terrain.cjs --out=output/back-nine-visual-upgrade/player/terrain`: all14routes / 9,917samples pass actual boot-ground/leg reach/planted-slide checks. Minimum clearance .01134m, maximum planted clearance .03180m. Poses and slope views add no GPU uploads/programs/textures:2278/27/46 before and after.
- `verify-runner-terrain-rules.mjs`:2940samples pass; `verify-runner-footprint.mjs`:12960heading invariants,8000unchanged vehicle cases,12fast sweeps pass.
- Installed gameplay client `--runner-terrain`, normal forward/turn/stop controls: player travels from(-12,371) to(-15.55,387.45), remains on foot under live pursuit, no error artifacts. Final screenshot/state inspected. Current model run dropped to640x360 in both bursts (averages70.6/63.3ms,p95166.7/83.7ms). Matching baseline-source run retained960x540 (averages62.6/56.5ms,p9587.4/64.2ms). These runs expose an unresolved fidelity problem; fixed-resolution paired rendering is recorded separately in `player/budget/report.json` to investigate attribution.
- `verify-back-nine-player-budget.cjs`: fixed960x540 software range view,48measured GPU-fenced draws after8warm draws. Old actor absent/present medians64.0/64.9ms; new actor absent/present61.0/64.2ms. Actor-present p9574.0/69.9ms. World draws identical110without actor/134with actor; background geometry identical137347triangles. New actor adds2164triangles. Variable background cost prevents attributing the earlier adaptive-resolution difference solely to the garment change; both complete scenes remain too slow. No full performance acceptance.

## Remaining scope

The cloth and construction detail are improved; this is not a complete character redesign. Face/hair128-square maps, broad feature geometry, hands/skin, boot surfaces and material readability still fall below the full requested standard. Native normal-play resolution and software performance require broader acceptance. Prior environment, destruction, weather, camera/UI and combined-load requirements remain in the ledger.

All owned jobs are terminal. Server4187 retained. No agents, commits, deployment or goal completion.
