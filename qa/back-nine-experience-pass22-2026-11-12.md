# Back Nine experience — pass 22: exact surface preparation and warm retries

The preceding goal turn restated the roadmap without implementation progress. This pass resumed the pending startup candidate, verified it, replaced the slower multi-request approach and retained an exact-pixel single-archive implementation. The full experience goal remains active. This does not close the remaining software frame-spike or whole-course acceptance work.

## Retained change

Ten existing native 128×128 procedural maps are baked from the actual `createCourseSurfaces` painter, without resizing, changing palettes or filtering. One content-addressed 312,498-byte archive contains the original PNG bytes. The existing serial bitmap worker fetches it once, decodes its images sequentially and transfers them to the main thread while larger art loads. Existing texture/buffer GPU pacing, limits and fences remain unchanged.

`tools/bake-course-surfaces.cjs` regenerates both the archive and manifest. The manifest records the canonical painter SHA256; `verify-baked-course-surfaces.cjs` rejects stale bakes. The canonical shared painter itself is unchanged. If the worker, request or archive is unavailable, the level uses that original painter. Texture disposal closes transferred bitmaps. The shared decoder still supports all existing single-image callers, waits while hidden and closes all transferred batch images on cancellation. Invalid ranges reject cleanly without poisoning the worker queue.

Runtime changes: `web/baked-course-surfaces.js`, the generated `web/assets/baked/course-surfaces.js` and archive, Back Nine scene preparation/import-map version, and backward-compatible batch support in `web/bitmap-decoder.js` / `web/bitmap-decode-worker.js`. No simulation, collision, audio, movement, pursuit, lighting or geometry changes.

## Evidence

- `verify-baked-course-surfaces.cjs`: ten textures / 655,360 channels exactly match the original painter. Texture sampling/color/mipmap settings match. Normal decoding, missing worker,404 archive and corrupt archive cases pass; disposed bitmap dimensions become zero.
- `verify-baked-course-render.cjs`, hardware and software: twelve views each, four locations at2560×1600,1280×720,844×390. Swaps baked/canonical maps in the same scene and pose, including shadows and mipmapping. Zero differing framebuffer channels across all24 comparisons. Wet-lane, foliage/mower and foot-garage screenshots inspected. Test-only scene poses do not synchronize HUD objectives; these captures prove surface rendering, not objective UI.
- `verify-bitmap-batches.cjs`: exact orientation/RGBA for mixed single/batch work; hidden-tab deferral; cancellation after submission closes both transferred images; invalid second slice rejects; subsequent single decode succeeds. No pending promises or browser errors.
- Existing `verify-bitmap-decoder.cjs`: original single-image orientation, cancellation, hidden-tab behavior, worker failure and native textured Joe fallback still pass.
- `verify-back-nine-warm-retries.cjs`, hardware and software: both checkpoints × R / Enter / button =12 retries. Death-to-retry retains checkpoint, optional records and variation seed; restores100HP cart; clears held movement/look-back; fresh movement responds. Same scene object, one audio context,12voices,1,114 buffer uploads,40textures,20hardware/25software programs. No new image decodes or asset requests during retries. Reported action/250ms-simulation/presentation wall time17–55ms hardware and71–152ms software; these are fixture timings, not generalized latency guarantees.

## Cold startup measurement

`compare-back-nine-loading.cjs` runs eight separate cold browser/GPU processes in alternating ABBA order, with HTTP cache disabled, shader disk cache disabled, CPU profiling and the same viewport. Four samples per variant. The scene baseline is saved under `output/back-nine-experience/loading/baseline-source/`.

| Metric | Original painter | Retained archive |
|---|---:|---:|
| Median page-to-ready |5544.85ms|5409.55ms|
| Median source-art-ready to static construction complete |438.40ms|284.15ms|
| Median sampled `pixelSurface` main-thread self time |43.425ms|0ms|
| Largest observed long task |132ms|86ms|

The measured page-to-ready improvement is135.3ms (~2.4%), not a dramatic startup fix. Most loading still consists of paced GPU preparation, and the long-task maximum is noisy. Main-thread painting work is conclusively removed on the baked path. Do not claim that all stalls, startup contention or runtime frame spikes are resolved.

An earlier ten-file candidate removed the painting CPU but measured5594.95→5678.05ms median page-to-ready. It is superseded; its reports remain in `loading/multi-file/`. Combining the original bytes into one request avoids those serial fetch round trips. No removal of GPU fairness waits was used to obtain the improvement.

Preparation remains19 geometry batches, maximum1,810,704bytes;24 texture batches, maximum4textures. Maximum texture-batch bytes remains8,391,211 because an existing large illustrated texture is admitted alone. Resource counts remain unchanged. This pass does not change runtime frame rendering cost.

Installed standard client: `verify-presented-client.mjs --back-nine --beacon-cover`, two one-second ArrowUp bursts. Final screenshots and text states inspected: cart progressesy425→429.723→440.655, Joe continues moving behind physical cover, ordinary banner stays empty,960×540software canvas,25programs,40textures,12voices,10baked/0fallback surfaces. The initial fixture used unsupported `w` instead of the client's documented `up`; it did not move and was corrected and rerun. A strict floating-point retry-time assertion was also corrected to a1e-9 tolerance; neither fixture correction changed gameplay.

Artifacts: `output/back-nine-experience/loading/`. All owned test handles terminal; local server retained. Human feel/listening tests remain prepared for later, not conducted. Next work remains measured moving-frame stability and whole-course route/cover/landmark/darkness, encounter/omen/audio/dialogue acceptance across the complete38-item scope.
