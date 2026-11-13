# Cooperative startup — November 7, 2026

Implemented resource pacing and reduced redundant startup preparation while retaining the original pixel-art resolution, world layout, effects, Joe model geometry, movement and navigation. Local revision: `20261107-cooperative-startup`.

## Changes

- Serialize preparation jobs per renderer, including static-buffer warming. Upload batches wait for GPU completion before another batch can be submitted. Texture batches target 16 MiB; a single indivisible texture can exceed that limit (the terrain is approximately 32 MiB including mips). Static batches target 2 MiB / at most 24 meshes, with the same single-resource exception. Compile in groups of 64 renderables, await completion and leave scheduling gaps. No synchronous `gl.finish` was added.
- Pause preparation and tree work when the document is hidden; cancellation remains observable, fences are deleted, and renderer state is restored before yielding. A visible game beside another application still loads, but with bounded outstanding preparation work. This is not a system-wide GPU priority control.
- The 3D path loads its own art instead of eagerly decoding the legacy course manifest. HUD field-kit art, horror flashes, screen tears, opening and results remain prepared. Explicit legacy rendering or fallback still loads its scenery. Joe's 27 sprite cells are created only for sprite mode or actual model failure.
- Prebake the 1536×4096 ground painting as lossless WebP, keyed by the actual authored layout and paint inputs. Decode/orient its bitmap before WebGL submission. Preserve original texture size, mipmaps, nearest magnification and hardware anisotropy. Unknown/edited layouts or unavailable bakes use the existing procedural painter.
- Prebake all 137 course trees into a compressed typed-array archive (13,377,704 bytes raw / 4,106,000 bytes compressed). Validate the tree-source hash in the worker before using it. Missing/stale archives, unknown tree placements, worker failure and unavailable workers retain procedural generation. Material maps, static merging, culling, collision and navigation remain unchanged. Archive memory is released when the preparation worker terminates.
- Losslessly repack Joe's embedded textures: GLB **14,590,884 → 11,419,892 bytes (21.7% smaller)**. Every decoded RGBA texture is checked for equality. Geometry, skin and animation data are preserved. Decode the model's texture images sequentially with scheduling gaps. Both geometry LODs still prepare before readiness, avoiding a new first-encounter stall or downgrade in Joe's face/body.
- Update release validation to follow the content-addressed terrain manifest. Rebuild tools: `bake-startup-terrain.cjs`, `bake-startup-trees.cjs`, `pack-joe-runtime.cjs`.

## Measurements and tradeoffs

Fresh browser processes, local server, 2560×1600 viewport; same course, scripted input and first-completed-scene measurement. Baseline routes the task-start source and original Joe GLB. OS/driver caches and host load are not controlled. One paired run per renderer; these are not population-wide performance guarantees.

| Metric | Before | After |
| --- | ---: | ---: |
| Hardware first completed scene | 5.99 s | 6.74 s |
| Hardware largest loading RAF gap | 283.3 ms | 150.1 ms |
| Hardware construction phase | 4.48 s | 3.73 s |
| Software first completed scene | 8.79 s | 9.78 s |
| Software largest loading RAF gap | 183.4 ms | 183.3 ms |
| Software construction phase | 4.78 s | 4.04 s |

Pacing deliberately exchanges some total loading time for smaller bursts and bounded outstanding work. The software sample did not show an improvement in its largest frame gap. A later instrumented hardware audit measured a 200 ms worst gap and 7.31 s readiness, illustrating timing variability; do not treat 150 ms as a fixed maximum.

Compared with the original audit, image load events fell **69 → 24**, distinct image URLs **54 → 23**, PixelArt crop canvases **57 → 30**, and their base RGBA pixel footprint **50.68 → 39.15 MiB**. Distinct loaded image dimensions represent roughly **316.34 → 156.02 MiB** at RGBA8. These are pixel-footprint estimates, not measured physical RAM/VRAM; browser sharing, decoder retention, bitmaps and driver allocations affect residency. The terrain and tree bakes add approximately 6.78 MiB of compressed files but eliminate procedural work; skipped legacy image requests and Joe compression offset download work. No claim of a universal network-startup improvement is made.

The final audit recorded 54 compiled programs, 52 GPU completion-gated preparation batches, a 5.5 ms maximum static-buffer batch, and a 46.1 ms longest texture submission versus 105.4 ms in the original instrumented audit. These are CPU-side submission timings. The remaining final GPU drain and monolithic texture uploads have not disappeared.

Evidence: `output/startup-cooperative-20261107/` contains paired loading reports, original source/model snapshots, lossless image checks, contract results and `final-audit/hardware.json` / CPU profile.

## Verification

- Loading contracts: hidden jobs submit no textures, outstanding upload bytes stop at the budget until the GPU fence completes, hidden cancellation returns, all fences are deleted, and baked tree vertex/index buffers exactly match procedural results. Object bounds agree within 1e-9 (Node/browser floating-point transforms differ by approximately 1e-11).
- Existing worker/fallback geometry oracle passes all three forms, worker failure and disposal.
- Loading gate checks pass simulation hold, Pause/resume, failed-model directional fallback, first active submission and cancellation/replacement. Movement in paired runs travels approximately 48 units over two seconds; object placement/form and original Joe triangle counts match.
- Nine gameplay-intelligence checks pass, including 29 obstacle approaches, interception, search, patrol/recovery, exits, aim coaching and near/distant animation continuity.
- All 17 atmosphere checks pass on hardware and software: mist, ghost movement/poses, depth occlusion, horror effects, Pause, Reduced Motion, settings and no additional first-event shader programs.
- High-resolution visuals checked at 2560×1600, with 1280×720, 800×600 and 844×390 touch coverage. Border and shed hardware captures match the baseline exactly. The opening differs in 0.218% of color channels, maximum 7/255, consistent with the ground painter moving from GPU-backed canvas to its CPU-backed bake; no resolution/detail was removed. Opening capture visually inspected.
- Release validation passes with no failures/warnings. The additional terrain image is tracked in the runtime manifest.
- Installed normal-play client completed three iterations and 28 units of movement with no error artifacts; final gameplay screenshot/state inspected. Its first attempt ended while preparation was still pending; the completed run uses an adequate real-time loading pause. Seven floodlight synchronization checks also pass on hardware, including on/dim/off/recovery and independent lamp power.

## Limits

The affected third-party graphics application was not instrumented, so this does not certify that its reported freeze is eliminated. Hidden-tab suspension and bounded submission are verified; system-wide responsiveness still needs a check alongside the user's actual app. Software foliage/pond throughput, remaining cold tasks and the final warmup cost remain open. Full scene geometry is still resident once ready; no risky late scenery or actor streaming was introduced. No deployment or commit was performed.
