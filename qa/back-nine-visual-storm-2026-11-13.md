# Back Nine storm ceiling — BV39 verification

Full objective remains all 48 visual improvements. This pass satisfies BV39: **layered moving storm clouds with varied density and moon occlusion**. It does not finish the remaining atmosphere, landscape, camera/UI or performance requirements.

## Current implementation

- Back Nine opts into a hemispherical storm ceiling in `parallax-scene.js`. Other callers retain the original nine cloud cards and existing nightfall behavior.
- `back-nine-storm-sky.js` renders two differently oriented/scaled cloud layers from one authored density texture in one draw. Separate wind vectors create relative motion. Thin cloud edges, dark gaps, broad dense bodies and distinct upper/lower colors provide visible depth. Mirrored wrapping prevents mismatched source edges from forming a hard seam; overlapping layer orientations reduce repetition.
- The sky is behind distant ridges/trees, with a horizon fade. The moon renders behind the transparent cloud field, so actual cloud density occludes its disk. No lightning or abrupt flashes were added.
- Nine samples across the moon disk use the same density, texture orientation, wrap mode, layer transforms and opacity function as the shader. Coverage attenuates the existing directional moonlight by up to 32% and hemisphere fill by up to 6%. Ground emissive floors, headlights, fixtures and red beacon remain independent. Camera yaw does not control the weather.
- The clock freezes while paused or reduced motion is enabled; retry resets it. No new timer or animation loop. The density map joins the existing bounded texture preparation queue.
- Software startup now specializes all dormant local-light/pine material variants, including variants whose redundant preparation proxy was removed. This fixes a discovered extra shader compilation on driving-to-foot/camera transitions. No simulation, navigation or AI changes.

## Asset

`web/assets/optimized/back-nine-storm-density-v1.webp`: 1254×1254 scalar density, 1,577,522 bytes. Generated with the built-in image tool using a prompt for fine pixel-art storm-cloud density, broad turbulent billows and irregular dark gaps, no horizon/moon/stars or directional highlights. Original `C:/Users/Will/.codex/generated_images/01a1ca31-dda6-7063-b302-317af976c1d6/exec-a84ffa6f-19fc-4b92-a6b5-a17cbe5e1261.png`; converted losslessly without resizing/retouching. Texture uses NoColorSpace because values represent density. The project copy is self-contained.

## Requirement evidence

Evidence root `output/back-nine-visual-upgrade/storm` is a junction to `D:/CodexArtifacts/project-rough-cut/visual-upgrade/storm-20261113`. Only this pass's generated artifacts were moved, after verifying both absolute paths. Existing project paths continue to work.

| BV39 component | Authoritative evidence |
| --- | --- |
| Layered storm clouds | Two production shader samples with distinct transforms/colors/wind; native and software `start-2560.png` and `clouds-180-2560.png` show the broad ceiling replacing disconnected cards. |
| Movement | 180 simulated seconds of backdrop updates in `progression.json`; fixed gameplay camera captures show relocated gaps and cloud bodies. This is a controlled weather traversal, not a 180-second full gameplay run. |
| Varied density | Authored density spans irregular clear/thin/dense regions; native moon coverage ranges 0.262–0.868 and software 0.270–0.870 across the sampled traversal. |
| Moon occlusion | Moon behind canopy in actual scene draw order; native/software before/after disk appearance changes. Five GPU opacity readbacks per renderer at times 0,45,90,135,180 agree with the CPU calculation within 0.0236 (native) / 0.0197 (software) on a 0–1 scale. Differences include raster sampling, mip filtering and 8-bit readback. `gpu-probes.json` uses the production shader with only its final output changed to expose opacity. |
| Stable world lighting | Tests turn the actual on-foot camera, assert its quaternion changes, and confirm unchanged coverage/moon-light intensity at fixed time. Camera views cover forward/east/back/west. |
| Pause/reduced motion/retry | Browser assertions freeze cloud time during pause/reduced motion and reset it on restart to the shed. |
| Shared-level isolation | `legacy-defaults.json` verifies the original nine cards, scale 1.3395 and opacity .6546 for storm .97/night .92 without opt-in, including restoration after the Level 1 nightfall argument is removed. |

## Commands and results

- `node tools/verify-back-nine-storm.cjs output/back-nine-visual-upgrade/storm/native` — passes, no page/console errors. 2560×1600 viewport / 2560×1440 native scene first, then 1280×720 and 390×844. Actual four-direction camera views, driving/foot transitions, GPU probes, 180-second weather traversal, pause/reduced/retry, resource stability and shared defaults.
- Same command with `.../software --software` — final pass succeeds after the dormant-variant preparation fix; 34→34 programs, no added shader during the tested transitions. An earlier genuine 34→35 failure was traced to an un-specialized local-light variant. The harness now removes stale reports at start and writes a failed report on any assertion, so old success cannot mask failure.
- `.../before --baseline` — matched pre-change scene/parallax sources captured the prior sparse cloud cards. Native starting view draw calls changed 182→177. Both native/program tests and captures were inspected; the last source edit affects only the software preparation branch.
- Installed standard client through `verify-presented-client.mjs --back-nine --mower-mouth --high-resolution`, with and without `--native-renderer`, three action bursts using `tools/fixtures/back-nine-mower-mouth.json`. Both runs end at player (-3.5771,72.4633) with Joe pursuing; all screenshot/state pairs exist and no error artifacts. Native held 2560×1440; final average 11.65 ms/p95 16.0 ms on RTX3090. Software fell 800×450→640×360; final average 84.8 ms/p95 95.4 ms. These are short chase samples, not combined-load acceptance.
- `node tools/verify-course-nightfall.mjs` — existing weather/state/reset tests pass.
- `node tools/verify-course-sky-coverage.mjs` — 2,500 cameras and 8,400 rays pass background-culling checks.
- `node tools/verify-local-light-culling.mjs` — range, multiple/moving lights, visible-piece exclusion, hidden reveal, preparation/disposal tests pass.

Native uses 28 programs and 51 textures versus prior district pass 29/56. Software uses 34/51 versus prior 36/56. The new density map replaces six cropped cloud textures. The reduced counts do not establish that the whole game meets the software performance target.

Actual images inspected: pre-change starting sky; final native start/180-second and east/back/west views; native 1280/390 views; final software start/180-second; native gameplay client pages0/2 and software client page2. The course, Joe, headlights and red warning light remain readable against the denser ceiling. During testing, a cart-yaw fixture initially failed to turn the camera, then an on-foot fixture overlapped the cart; both were corrected before final evidence. These were test-fixture errors, not gameplay fixes.

## Remaining full-objective work

BV39 is complete within its stated scope. Other items remain open, including selective low mist/haze, contact/foliage shadows, terrain transitions/trails, environmental storytelling/density, ghost art, player/Joe/machinery motion, destruction aftermath, camera composition, portrait HUD, and combined-load fidelity/performance. The portrait HUD still obscures the letterboxed scene. Software remains below the high-resolution quality/performance target.

All owned browser jobs are terminal. No agent delegation, commit, deployment or full-goal completion claim.
