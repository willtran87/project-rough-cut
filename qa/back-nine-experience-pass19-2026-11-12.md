# Back Nine experience pass19 — renderer cost isolation

Previous goal turn (pass18) was progress: the runner collision fix and route checks remain authoritative. This turn made diagnostic progress: isolated component costs and rejected two shader candidates based on measured results. **No rendering optimization from this pass remains enabled.** All38 requirements remain in scope and performance remains open.

## Component evidence

`node tools/profile-back-nine-components.cjs` completed on SwiftShader at fixed960x540. It temporarily hid components inside the diagnostic browser only, alternated forward/reverse test order, waited on GPU fences and recorded48 frames per component/view. Output: `output/back-nine-experience/render-isolation/components.json`. No runtime feature removal was shipped.

In the foliage view the full median was50.1ms; excluding the mower gave41.0ms, excluding just its rider46.9ms and excluding needle batches48.2ms. In the closer mower view these were34.0/27.9/31.9/34.0ms. Clubhouse measurements had appreciable spread and should not be treated as exact additive component costs. CPU update p95 was generally0.6–1.2ms. These results support investigating actor geometry/submission cost, not assuming foliage alone accounts for every spike.

The current GLB contains18,970 triangles across nine material primitives: sweater7,303; trousers4,697; face2,181; skin1,681; hair1,111; collar654; leather640; rubber534; seam169. Its rig has17 bones. This is source inspection, not permission to reduce visible face/hair detail or replace the authored art.

## Rejected uniform-bone candidate

Experiment: use exact17-bone matrices in vertex uniforms on software devices with sufficient capacity, retain original skinning weights/arithmetic, clone materials for independently posed staff sightings and keep the texture fallback. Production renderer/vendor code was untouched.

- Initial two-world screenshot comparisons differed in a few hundred channels; that harness includes independent animation histories and cannot isolate shader correctness. Its initial assertion failed. Do not treat that output as a successful visual comparison.
- Corrected same-world shader isolation switches only materials at an identical pose. Three fixed views and32 moving-frame captures had **zero changed framebuffer channels** and no browser errors.
- Moving paired96-frame timings, original→candidate: close34.0→34.8ms median,38.5→38.2ms p95; wet40.2→40.1ms median,45.0→46.2ms p95; foliage49.2→48.0ms median,66.0→71.8ms p95; clubhouse62.3→62.0ms median,71.1→71.0ms p95.
- Those mixed results do not justify extra runtime material/palette complexity. Rejected and restored the original scene/staff files. No startup improvement claimed; the prepared startup/independent-actor follow-ups were not run after the performance gate failed.
- Artifacts: `output/back-nine-experience/bone-palette/shader-isolation.json`, `moving-isolation.json`, baseline-source and rejected-source. The diagnostic tools route the saved candidate explicitly for reproduction; they do not require leaving it in the live game.

## Rejected per-fragment finite-light branch

Experiment: reject point-light fragments beyond their finite range before normalization/falloff. Keep original arithmetic inside the range. It added a branch to the software quadratic-light specialization.

The same moving fixed-resolution ABBA harness recorded96 frames/version/view: opening28.7→30.9ms median,34→41ms p95; wet35→36.9ms,38.9→40.9ms; foliage43.8→45ms,47.9→48ms; clubhouse36.1→37ms,38.9→39ms. Draw/triangle counts remained identical; no new buffers. **Rejected for consistent median regression.** The prepared pixel-equivalence tool was not run after that gate failed; no visual-equivalence claim is made for this candidate.

Artifacts: `output/back-nine-experience/light-rejection/moving-performance.json`, baseline-source and rejected-source. The active quadratic-light-material.js is restored byte-for-byte.

## Restored build verification

SHA256 equality to pre-experiment snapshots verified for back-nine-scene.js, chase-staff-art.js and quadratic-light-material.js. The unused experimental bone-palette module was removed from web/. No HTML/cache alias changes were made. Hashes: `output/back-nine-experience/render-isolation/restored-source-hashes.json`.

Installed standard client: `node tools/verify-presented-client.mjs --back-nine --damaged-cart --url http://127.0.0.1:4187/back-nine.html?test --click-selector '#primary' --actions-file tools/fixtures/back-nine-drive.json --iterations 1 --pause-ms 250 --screenshot-dir output/back-nine-experience/render-isolation/standard-client`. Inspected page0/state0: ready, driving the damaged cart;960x540 software canvas,25 programs,40 textures, no errors. Rendered pixel-art cart/course remain present. All owned profiling/client handles observed terminal; local server retained.

## Next investigation

Keep the full38-item ledger active. The evidence argues against repeating bone-texture/uniform swaps or per-fragment range branching as presumed wins. Investigate baked actor geometry/index optimization and, only if justified by projected size and comparison images, a bounded distant-detail representation with unchanged close-range artwork, silhouette, animations and warning cues. Do not call fewer submitted triangles a performance gain without moving GPU-completed measurements; do not add loading stalls for an unmeasured LOD. Existing topology/UV/skin seams and independent staff rigs require explicit preservation. Broader route/lighting/audio/retry/omen acceptance also remains open. Human playtests remain prepared for later.
