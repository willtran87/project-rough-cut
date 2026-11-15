# Back Nine — persistent soft-foliage mowing

Progress toward BV07/BV42, with performance evidence for BV48. This does not accept the complete 48-item visual upgrade or full Level 1 parity.

## Change

- Joe's active cutting deck now folds authored soft course plants down in the direction of travel. Plants retain that state until restart, including after Joe leaves and old ground-scar segments recycle. This supplements the existing ruts, soil and clippings.
- 4,844 eligible plants share one 128×64 RGBA8 data texture (32,768 bytes; capacity 8,191 plants). Spatial bins query deck contacts; settled cuts stop uploading. The eligible population is fixed, so history cannot grow with play time.
- Only the actual mower-mouth cutting condition marks plants. Raised planter and woody hedge foliage use an unchanged sentinel. Pause freezes collapse; reduced motion settles directly; fresh runs and time rewinds clear the record. Sweeps reject teleport bridges.
- Vertex attributes supply plant ID, height and local terrain height/gradient. Flattening retains illustrated Level 1 leaf art and existing local lighting. Contact push fades as plants settle. Static attributes add 2,016,960 bytes for the 12,606 cards; there are no new draw batches.
- Course-detail update, preparation, disposal and import-map versions are connected. Visibility bounds expand by 1.25m, including the outer mesh sphere, to cover the maximum 1.03m lay-down offset plus live motion.

## Verification

Commands run successfully:

```text
node tools/verify-back-nine-foliage-mowing.mjs
node tools/verify-back-nine-mower-scars.mjs
node tools/verify-back-nine-foliage-mowing.cjs <evidence>/native
node tools/verify-back-nine-foliage-mowing.cjs <evidence>/software --software
node tools/profile-back-nine-foliage-mowing.cjs <evidence>/budget
```

The mowing rules cover deck edges, excluded woody/raised plants, partial collapse, pause, retained settled state, idle uploads, rewind/fresh-run reset, inactive cutting, reduced motion, teleport rejection, disposal, and full-course retention. All 4,844 plants can retain their cut state in the same 32KB texture. The 30/120Hz curved sweeps select identical plants. Existing ground-scar terrain/rate/wet/pool tests pass, including 120 terrain routes.

Native and software browser suites pass at 2560×1600, 1280×720 and 390×844. A matched planted pocket changes from upright to 44 settled plants, persists another 90 simulated seconds, preserves surrounding upright foliage, survives pause/reduced motion, and resets on retry. Screenshots were opened and inspected. The first native comparison placed Joe inside the camera; the accepted rerun moves him away before both comparison views. Resource counts stay at 29 native/35 software programs and 53 textures (+1 texture).

The installed standard gameplay client ran two movement/turn/rear-glance bursts through the planting pocket in both renderers, using the new `--foliage-mowing` fixture and existing mower-scars action file. It exercises normal simulation and input: four plants begin collapsing in burst one; 48 are settled in burst two, alongside 20 ground scars and 110 emitted clippings. States and actual screenshots were inspected; no recorded console/page errors.

Native final burst: 2560×1440 scene, 11.24ms average / 12.5ms p95. Software final burst: 640×360, 126.57ms average / 156.8ms p95. These different scenes are not comparisons against the prior scar-soil client.

The isolated software ABBA comparison fixes the camera, untouched plants and 960×540 output. A test-only constant-zero shader removes mowing lookup/deformation; production uses the live record. Both render 116 draws / 172,061 triangles. Forty measured frames per variant: baseline median 93.9ms / p95 99.9ms; current 90.8ms / 100.7ms. This gives no measurable added idle shader cost in that scene; it does not prove whole-course or combined-load performance.

## Evidence and remaining scope

Evidence: `output/back-nine-visual-upgrade/foliage-mowing`, a junction to `D:/CodexArtifacts/project-rough-cut/visual-upgrade/foliage-mowing-20261113`. `native`, `software`, `client-native`, `client-software`, and `budget` contain accepted captures/state/reports. The folder date reflects when this pass began. `manifest.json` identifies current sources and report hashes.

BV07 remains in progress pending broader slope/lighting visual acceptance of the folded plant cards alongside the complete scar treatment. Their height uses a local terrain-gradient approximation; this pass does not claim an exhaustive triangle/ground-clearance audit of every folded card. Old ground scars remain bounded to about 248–282m while plant cuts persist for the run.

Whole-scene software fidelity/performance remains below target. Portrait HUD overlays still obscure the small scene. Natural surface transitions, broader scenery/material/actor/ghost/lighting/motion work, camera/UI, and combined-load acceptance remain on the complete ledger. No simulation, navigation, bell, checkpoint or difficulty changes were made in this pass.
