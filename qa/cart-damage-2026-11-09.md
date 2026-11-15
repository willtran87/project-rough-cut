# Progressive cart damage — 2026-11-09

The cart now uses health-driven deformation of its original pixel-textured meshes. The nose compresses, the right rear sill buckles, the roof sags asymmetrically, the suspension settles, and the rear battery cover loosens and rattles below 45 health. Impact recoil remains synchronized with the existing crash effect/audio. Repairs reduce deformation; checkpoint retry restores the intact model.

At zero health, five prebuilt assemblies animate: roof, supports/mirrors, hood/headlights, front bumper, and battery cover. The front right wheel folds outward and drops beside the chassis using the existing instanced wheel geometry. Loose pieces stop above the road; headlights sputter out. The sequence settles within 3.2 seconds and uses simulation time, so pause freezes it. Reduced motion immediately shows the settled wreck. The escape camera briefly widens without locking controls. The original solid wreck hull, safe ejection, five-second protection and Joe's pathing are retained; fragments are cosmetic.

## Validation

- Damage browser suite on hardware and SwiftShader: 100/75/45/15/0 health; seven collapse moments; stable settled pose; road clearance; reduced motion; pause; restored transforms/lights. Captured and inspected 2560x1600, 1280x720, and 844x390 views, plus close front/rear views.
- Health/foot simulation, vehicle contact simulation, rendered contact bounds, and six driving victory routes pass. Existing three on-foot routes pass with live Joe. Actual terminal ram, immediate running, keyboard/controller/touch controls, relays, garage win and retry verified through the health browser flow.
- Installed develop-web-game client via verify-presented-client passed two driving bursts. Screenshots/state inspected; no browser errors.
- No new first-use GPU buffer allocations during damage, collapse or escape. Same 34 textures, 22 software / 17 hardware programs; no new audio voices or lights. Cart/mower vertex counts remain 9,323 / 29,606 in the geometry bounds check.
- Software geometry preparation increases from 16 to 17 bounded batches; maximum batch remains 2,060,232 bytes. Five articulated groups add approximately ten visible draw calls (moving sample mean 92.85 -> 103.22). Geometry deformation/normal updates occur only when health changes; collapse uses transforms, not per-frame mesh rebuilding or physics bodies.
- Isolated 180-frame software replay: baseline median/p95/max 43.4/50.0/58.2 ms; current 43.1/50.4/58.7 ms. Maximum CPU update 2.2 -> 5.2 ms includes the newly visible damage deformation. These are one-run observations, not a claim of universal performance improvement. Prior software-rendering limitations remain.
- 17 intact static comparisons: 12 exact; five differ by only one RGB pixel at coplanar draw-order edges (maximum channel delta 55). Five intact moving captures are exact; the sixth has 73 health and intentionally changes visibly. Gameplay states match the baseline replay, including baked navigation signature 47348588 and zero static edge checks.

Evidence: `output/cart-damage/`. Repro: `node tools/verify-cart-damage-browser.cjs [--software]`, `node tools/verify-cart-damage-rendering.cjs --skip-timing`.

## Later player checks

1. Take successive rams and judge whether the low-health silhouette and rattling cover communicate failure clearly from the normal chase camera.
2. Run immediately after the final impact; confirm the brief wider view helps read the wreck without obscuring Joe or the escape route.
3. Repair at a relay/service stop, then retry a checkpoint; verify the vehicle's appearance matches its health.
4. Repeat with reduced motion and on the target low-end machine, especially with foliage and Joe visible. Cosmetic debris intentionally has no separate collisions.
