# Under the Green visual upgrade — pass 17

Scope: architectural material authorship and repeat length, advancing V02–V06 and dark-value composition. All 53 requirements and seven release gates remain intact. No whole-level parity or frame-time acceptance is claimed.

## Selected art and implementation

Generated `assets/environment/under-green/surfaces-masonry-v3.png` with the built-in image_gen tool, using the first v2 candidate as its edit reference. Both exact prompts are retained beside the assets. The first candidate was clearer but too clean/dry in gameplay; v3 restores selective crumbling joints, trapped sediment, narrow mineral drips and concrete/ceramic wear. It preserves broad quiet faces and deliberate pixel edges instead of the old near-uniform high-contrast surface grain.

The selected master is 1254 × 1254, not the requested 2048 size. Runtime sampling preserves its actual source resolution. Both 627px-wide brick variants share a single 1254 × 627 texture spanning four by two metres; concrete and ceramic remain 627 × 627 over two metres. Both axes therefore retain 313.5 source texels per metre on these architectural surfaces. Nearest magnification and mipmapped minification remain unchanged. The old masters still supply bark/mud/paving and industrial panel/sand, but their superseded masonry/concrete/tile quadrants are no longer extracted.

Only `under-green-crafted-surfaces.js` changes runtime behavior. Existing materials, lights, authored geometry, UV generation, root growth, flooding, contact shade and controls consume the new maps. The paired strip requires no additional fragment texture sample or material family. Existing independently authored wetness masks remain separate from the color art, and these crafted sets retain null bump maps rather than deriving relief from bright pigment.

The reference board and asset manifest now identify the active source quadrants, selected master and physical sampling spans. The runtime records per-material image sizes, world spans and texel densities. The v2 candidate remains as a reference artifact and is not loaded by production.

## Verification and observations

- Final `verify-under-green-material-art.cjs` native session 28349 passed 26 captures: ten matched before/after views plus gallery/keeper views at 1280 × 720, 390 × 844 and 844 × 390. Native desktop rendering is actually 2560 × 1600. Zero browser errors.
- Final software session 45843 passed twenty matched views, actually rendering at 960 × 600 within a 2560 × 1600 viewport. Software images are composition/fallback evidence, not native sharpness evidence.
- Native gallery before/after, close/oblique brick, concrete/pump, keeper, floor, mobile portrait gallery and mobile landscape keeper were inspected. Software gallery and oblique brick were inspected. The existing Level 1 hardware course reference was reviewed for art direction; this was not a new matched-settings Level 1 benchmark.
- In every matched view, submitted draw calls, triangle counts and uploaded texture counts are unchanged. Scene inventory remains 414 material objects and 74 referenced texture objects in the fixture. The paired masonry map increases estimated RGBA8 storage including mipmaps by 2,096,688 bytes (about 2 MiB). This estimate is not a measured GPU allocation.
- The new runtime asset adds 2,132,769 encoded bytes to loading. Local resource duration was recorded but is not an isolated startup benchmark. The two original masters are still needed for their remaining active quadrants.
- Mean neighboring-pixel luminance differences in source art fall from 16.07 to 3.15 for masonry, 17.23 to 1.90 for concrete, and 14.70 to 3.26 for ceramic. This confirms the intended reduction in fine contrast; it is not, by itself, a measure of art quality. Screenshot review determines the visual judgment.
- The verifier checks the paired map size/repeat, sharp magnification and independent wetness. On both paths it reads actual lit framebuffer pixels, rejects empty/constant readback, moves to another camera pose, then returns to the identical position/time and asserts an exact framebuffer fingerprint match. This proves repeatable sampling in that fixture; it does not replace full-route motion/shimmer acceptance.
- Final installed development-skill client session 17099 exited 0 with five screenshot/state pairs and no browser-error artifact. Its initial click exceeded the client's fixed five-second startup timeout while `Preparing…` was disabled; later action bursts entered and completed the opening, reaching `under_green_playing` at (0, 12.68), actual 960 × 540. Final screenshot and state inspected. The warning is retained; it was not treated as a successful first click or used to restart a live process.
- Syntax checks pass. No geometry, collision, actor, state-machine or input changes were made, so the previously established physical-clearance evidence is not being replaced by unrelated repeat tests.

## Remaining work

V02–V06 remain in progress. This pass improves the principal architectural surfaces but does not prove all tapered roots/small props have uniform density, all materials are identifiable in grayscale, all districts avoid recognizable repeats, all materials have purposeful separate relief, or all motion/resolution settings are accepted. Masonry repeats every four metres horizontally and two vertically; concrete still has a two-metre base repeat. Existing world stains and slab variation help, but the full-route repetition gate remains open. Industrial rust, organic materials, Joe's clothing/skin and global lighting still need cohesive review.

The implemented count remains 11 of 53; all seven release gates remain open. No isolated software frame-time test was performed. Future work must preserve the new pixel clarity while completing grime deposition, infrastructure, actor detail and the performance gate. Final source snapshot and SHA256 records are in `output/under-green/visual-upgrade/pass17-source`; v2 review artifacts are separate from `pass17-materials-final` evidence.

No commits, deployments, deletions, new checkpoints, controls changes, new banners or other chapter runtime edits.
