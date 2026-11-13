# Under the Green visual upgrade - pass 22

V47 (dark walking ghosts and organic dissolution) is locally implemented. All 53 requirements and seven whole-level release gates remain the objective. Current ledger: 16 implemented, 30 in progress, 7 pending. Full Level 1 art parity and whole-level performance remain unverified.

## Appearance and lifecycle

The apparition no longer has emissive glow or one uniform pale surface. A single merged mesh now carries distinct dark cloth, collar, skin, hair, leather and steel values. The bake samples the existing character/scythe pixel masters once to retain local tonal variation, without a new runtime texture atlas. Joe's adapter preserves source material names for this classification; his own rendered materials are otherwise unchanged.

A soft, uneven opacity field uses rest-pose surface coordinates, quantized to a physical pixel scale. It follows the morphing figure through the existing walking cycle. The field has no frame clock, camera coordinate, hard alpha discard or animated screen noise. Patches fade at different rates under the existing continuous sighting envelope. Skin and cloth stay matte; only the scythe's metal has a specular response to real lights. No added glow, particles, sighting announcement or new light.

Existing scheduling, cleared walking lanes, suppression when real danger approaches, pause/retry handling and the 16-pose continuous walk are retained. The renderer remains depth tested with depth writes disabled for the apparition. Solid scenery occludes it normally. The ghost uses one draw and zero material textures.

## Verification

Authoritative final visual evidence: `output/under-green/visual-upgrade/pass22-all-sites/{hardware,software}/report.json`.

- `node tools/verify-under-green-shadow-finish.cjs --output=output/under-green/visual-upgrade/pass22-all-sites/hardware`: PASS, 33 views. Actual 2560x1600 plus 1280x720, 390x844 and 844x390. Eleven baseline and eleven revised lifecycle frames, reduced motion, looking away, a closer sighting, all five authored sighting locations and responsive peak views. Zero console/page errors.
- Same verifier with `--software` and `pass22-all-sites/software`: PASS, 30 views, actual 960x600 at a 2560x1600 viewport. All five sites and lifecycle/interaction checks included; zero console/page errors. Software images do not prove native sharpness.
- Pixel comparison at the matched gallery peak: old apparition brightened 15,021 pixels, mean absolute luminance difference 8.98/255. New apparition affected 14,266 pixels: 14,073 darkened and 193 brightened, mean absolute difference 5.96/255. This is a specific view measurement, not a universal contrast guarantee. Software: 1,974 darkened / 19 brightened pixels.
- Actual opaque-wall occlusion: staged ghost centered in the camera behind a side wall (NDC x=0, y=-0.075), then rendered visible/hidden at the same frozen state. Zero changed pixels in both renderers. The final test rotates the game camera and updates world culling before checking, so the result is not explained by an off-screen ghost.
- Pause holds ghost state exactly; reduced motion retains continuous locomotion/fading; looking away preserves position/gait/alpha; retry clears the sighting serial. Real scheduled sightings were found from valid floor viewpoints for all five sites, rather than forcing visible actors through walls.
- `node tools/verify-under-green-haunting-flood.mjs`: PASS, walking fade, interrupted fade, retry and existing flood contracts.
- `node tools/verify-under-green-unseen.mjs`: PASS, 540 continuous ghost samples travel 2.261 m with maximum envelope-alpha step 0.00523, plus preserved Joe observed/unobserved pursuit behavior.
- Installed develop-web-game client: terminal exit0, five screenshot/state pairs in `pass22-client`. Initial five-second click timed out while the button was still disabled; later scripted Enter bursts completed the intro. Final shot/state4 visually inspected: playing at (0,12.68), actual960x540, revised ghost ready with no error; no error artifact. This smoke run is not sighting acceptance; the dedicated visual tests above cover the ghost itself.

Visual inspection covered the closer/gallery fade, late fade, mobile peak, bunker, pump, dark spillway and software range views. The darkest spillway sighting remains deliberately subtle; broader district lighting requirements stay open. Intermediate `pass22-ghost` and `pass22-final` outputs lack the full final site coverage and are superseded by `pass22-all-sites` for acceptance.

## Resource costs and remaining scope

Matched native gallery peak retains352 scene draws,283473triangles,69residenttextures and131programs. Ghost geometry count is unchanged. Additional color/metal attributes use247616bytes (about0.236MiB). No new runtime image maps. These are resource counters, not an isolated frame-time or startup measurement; the Phong lighting/fade shader still requires full-level performance acceptance.

Production changes: `web/under-green-shadow-material.js`, `web/under-green-shadow.js`, and material-name preservation in `web/under-green-actor.js`. Final sources plus the verifier are snapshotted and SHA-256 recorded in `output/under-green/visual-upgrade/pass22-source/final-hashes.json`.

V42/V43 (Joe's material craft and local contact grime/wetness), V45/V46 (attack weight and physical miss response), and all unfinished environment requirements remain open. For the next actor pass, use the real shared flood clock and channel/puddle heights for immersion evidence; do not create unrelated cosmetic water states. No completion claim for the whole level or goal.
