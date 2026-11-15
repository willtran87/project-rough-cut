# Back Nine: finer short-cut pixel turf

Partial BV05/BV01/BV02 progress. The former source contained long curled grass blades, which formed conspicuous repeating bands at normal chase distance. A new 1254x1254 illustration uses fine clipped tips, small clover groups, sparse straw and soil pinholes. The native fairway comparison shows quieter, more natural ground while preserving close pixel detail and existing mowing/terrain shading.

Generated using the built-in image tool. Source and exact prompt are `assets/environment/back-nine/back-nine-short-turf-v2.png` and `back-nine-short-turf-v2-prompt.txt`. The original generated output remains in the Codex generated-images directory. The runtime `web/assets/optimized/back-nine-short-turf-v2.webp` is lossless, 2,386,988bytes, verified byte-for-byte equivalent to the source's RGB pixels. No resampling or image repainting was performed after generation. The previous source is preserved.

Production changes are the two source-asset identifiers in `web/back-nine-scene.js` and its HTML import-map version. Sampling, UV scale, shader, terrain geometry, collision, lighting and movement code are unchanged. The same map also supplies grass margins and the base of mower scars. Main turf remains approximately285texels/metre, with the existing finer green mapping.

## Verification and evidence

`output/back-nine-visual-upgrade/turf/` contains matched `before-native` and `after-native` views plus `after-software`. `tools/capture-back-nine-turf.cjs` enters through the normal menu, seeds fixed gameplay views, fences presentation, checks artwork loading/errors and captures fairway, green, bunker, maintenance, beacon, rough and flood. Viewports:2560x1600,1280x720,390x844. Actual native main buffer:2560x1440. Source and rendered images were inspected, including before/current fairway, green, bunker, beacon, rough, flood, phone and software views.

`resource-comparison.json` records identical shader/texture/draw/triangle counts for all seven matched native views:31programs,53textures;136-208draws depending on view. Player state is identical in each comparison. A source comparison confirms the scene differs from the captured baseline only by the asset name. This does not establish a whole-level performance budget.

The installed skill client ran actual forward movement, turning and rear glance using `tools/fixtures/back-nine-mower-scars.json`, via `tools/verify-presented-client.mjs --back-nine --mower-scars --high-resolution`, one iteration. `client-native` uses `--native-renderer`; `client-software` uses SwiftShader. Both reach the same player position(20.997,83.944), remain in gameplay, and show four retained mower scars. Actual final images/state were inspected; no error files. Native retains2560x1440.

Software drops to640x360. A matched installed-client run with `--turf-baseline` substitutes the old texture at the network boundary; it reaches the exact same player state and also drops to640x360 with two budget changes. This confirms the low software presentation is present with both assets in this scenario; it does not resolve the existing combined-load quality/performance requirement.

## Remaining work

This replaces the distracting base pattern; it does not complete terrain variety or Level 1 parity. Larger authored dead/thin/soil areas and distinct rough remain open. The captured flood edge and some green/bunker transitions are still conspicuously geometric, and wider scenery composition remains sparse. BV48 software quality/performance remains open. All48requirements stay in scope.
