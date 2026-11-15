# Back Nine — character and vehicle contact shadows

Partial BV38 implementation. Vegetation, props and foundations still need their contact treatment; the full48-item objective remains active.

## Implemented

- Added one dynamic ground-only mesh for up to13 contact patches: player torso/two boots, cart chassis/four tires, mower chassis/four tires. Boots follow actual animated joint matrices, tires follow their actual world centres, and chassis follow vehicle position/yaw.
- Feathered radial alpha uses32 tonal steps. Boot/tire opacity decreases with ground separation; airborne boots disappear. The torso patch softens/spreads during ejection. Existing directional beacon/headlight shadows remain separate.
- Geometry uses the course's exact world-grid diagonals and height samples, offset .064m above terrain so it remains above existing paving/pavers/soil and .055m shallow flood sheets. Triangle interiors also follow the height field, avoiding flat decals intersecting hills.
- One draw, no texture/map/light allocation. Fixed4096-vertex position/UV/RGBA buffers total147456bytes; only populated prefixes upload. Identical transforms do not rebuild/upload; hidden/distant vehicles are skipped. Restart clears runner patches when returning to cart mode. Dispose removes mesh/material/geometry.
- Runner exposes its existing boot/torso anchors without changing animation, movement or collision. Scene invokes contact update after actor transforms and mower visibility are set. Import/cache entries updated.

## Verification

Artifacts: `output/back-nine-visual-upgrade/contacts`.

- `before-final`: saved pre-change scene/runner source, ten matched views. `baseline-source` retains originals.
- `native-accepted`, `software-accepted`: eleven views each, including standing, hill, actual running input, nearby mower/beacon, both vehicles, ejection, fallen pose, active flooding, reduced motion, ordinary desktop and portrait.2560x1600 primary viewport,1280x720 and390x844 responsive checks. Zero page/console errors. Programs stable31native/38software; textures53 unchanged.
- Actual running advances through24 individual simulation/presentation frames. Captured boot lifts .115/.060m produce opacity .451/.541 instead of the grounded .56. At ejection .4s, both boot patches disappear and the body patch fades to .086. Fallen pose uses current joint positions rather than retaining the standing footprint.
- Browser checks verify material/geometry allocation, current patch ownership, pause stability, reduced motion and restart without stale runner patches. Images inspected: standing/baseline, hill running, vehicle, ejection, fallen pose, beacon and software flooding.
- `node tools/verify-back-nine-contact-shadows.mjs`: passes456maximum populated vertices across angular sweep,4556checked triangle interiors, upward winding,13contacts, lifted-foot removal, unchanged-pose upload stability, hidden/distant ownership and disposal. Geometry capacity remains bounded.
- Installed standard gameplay client: `client-native`, existing minor-route movement fixture, high-resolution native mode. Two60-frame forward bursts move from y342 through348.857 to356.057, with three current runner patches and63/123 cumulative geometry uploads.2560x1440 buffer; final average11.72ms/p9512.6ms. Actual gameplay screenshot and both text states inspected; no error artifacts. This short movement sample is not whole-level performance acceptance.

The initial running fixture advanced time without movement, and the next advanced .4s in one presentation step, which intentionally resets the distance-driven gait. Both were rejected as movement evidence. Final fixtures advance real input one frame at a time. `native`, `native-final`, and `before` are intermediate artifacts; use the accepted directories above.

## Cost and limits

Fixed960x540 vehicle view, GPU-fenced alternating on/off pairs,4warm and24measured samples per state. Native off median7.1ms/p958.3ms; on8.0/12.0ms. Software off72.1/105.5ms; on72.0/83.0ms. Visible contact mesh104triangles. This isolates the added draw in one frozen view, not whole-level/frame-rate acceptance; timing variation means the software difference is not evidence of an optimization.

These are compact contact approximations, not full silhouette or physically accurate ambient occlusion. They do not establish full actor animation/model parity, whole-level lighting quality, static-object contact shadows, or acceptable software performance. The level's repetitive ground artwork, district composition and other pending visual requirements remain in the ledger.
