# Startup decode and preparation follow-up — November 7, 2026

Local revision `20261107-worker-decode`. This pass removes main-thread image work and repeated preparation without changing assets, geometry, effects, movement or navigation. It retains the previous pass's GPU byte limits, fence backpressure, scheduling gaps, hidden-tab suspension and simulation loading gate.

## Implementation

- A single serial bitmap worker fetches/decodes/orients the ground bake, Joe's embedded texture blobs, and opening/results rasters, then transfers ImageBitmap ownership. Idle workers terminate. Pending jobs reject on failure/timeout, cancelled results close their bitmaps, and new jobs wait while hidden. Native image/bitmap decoding remains available when workers or transfers fail. Decoder counters are exposed in scene stats.
- Shader preparation chooses one representative per material and shader-input layout, retaining rigid/skinned, instancing, vertex attributes, morph counts, morph texture and shadow distinctions. Custom shader/node materials keep per-object preparation. The final hardware audit prepares 348 representatives and skips 1,400 duplicates; all 54 shader programs remain.
- Static geometry merging can use `scheduler.yield` within its existing bounded CPU slices, with a timed fallback. Image/model/driver readiness polling remains timer-based. GPU fence polling is explicitly timed to prevent spinning.
- Cached tree transfers yield after a bounded 4 ms CPU slice, rather than sleeping after each small tree. The same archive, typed arrays, hidden-worker handling and procedural fallback remain in place.

An initial experiment applying scheduler continuations to readiness polling starved ordinary callbacks. It was rejected and removed. Only the stalled profiling process and its owned child browser were stopped. No user application was closed.

## Measurements

Fresh Chromium processes, local server, RTX 3090/D3D11 hardware or SwiftShader, 2560×1600 viewport. Before uses the task-start source snapshot. Each row is one paired run; OS/driver cache state and host load are not controlled. Timings are not universal guarantees.

| Metric | Before | After |
| --- | ---: | ---: |
| Hardware first completed scene | 6.959 s | 6.668 s |
| Hardware largest loading RAF gap | 216.6 ms | 166.7 ms |
| Hardware construction phase | 3.869 s | 3.340 s |
| Hardware compile/upload preparation | 1.831 s | 1.470 s |
| Software first completed scene | 9.514 s | 9.379 s |
| Software largest loading RAF gap | 183.3 ms | 216.7 ms |
| Software compile/upload preparation | 3.309 s | 2.499 s |

The software sample has a worse maximum frame gap, despite slightly faster loading. It does not establish a software frame-pacing improvement. Movement remained approximately 48 units over two seconds; authored objects and original Joe triangle counts match.

After extending worker decoding to opening/results art, a full instrumented audit recorded 15 successful worker decodes, zero failures/pending, 6.344 s course readiness, a 166.7 ms maximum RAF gap and a **64 ms longest main-thread loading task**. The previous pass's audit recorded a 212 ms main-thread task. Main-thread `createImageBitmap` work no longer appears among the leading CPU samples. Static merging remains the largest named main-thread CPU contributor (~312 ms aggregate self time); this is not one uninterrupted task. GPU upload byte limits and 52 completion-gated batches remain unchanged. Largest texture submission in this audit: 42.6 ms.

### Separate graphics-client probe

`profile-startup-companion.cjs` runs a separate Chromium GPU client rendering eight full-screen draws per frame at 640×360 while the game loads in another browser process. It measures page navigation through course readiness, including boot artwork (unlike the course-only table).

| Metric | Before | After |
| --- | ---: | ---: |
| Game page through ready | 7.890 s | 7.179 s |
| Companion RAF p95 | 16.8 ms | 16.7 ms |
| Companion RAF maximum | 16.8 ms | 16.8 ms |
| Companion GPU completion p95 | 18.0 ms | 17.9 ms |
| Companion frames above 50 ms | 0 | 0 |

The small companion workload stayed responsive in both cases, so this is evidence of no regression under that workload, not proof of resolving the user's other-app freeze. The affected application has not been reproduced or instrumented.

## Verification

- Worker/native bitmap RGBA and orientation match; cancellation and hidden submission gating pass; failed-worker cleanup and native textured-Joe fallback are covered.
- Existing GPU budget/hidden cancellation/fence cleanup and baked-tree contracts pass.
- Loading readiness tests pass simulation hold, Pause/resume, first active submission, actual model-failure sprite fallback and scene replacement/cancellation.
- Nine gameplay-intelligence groups pass: interception, four-point search, 29 obstacle approaches, patrol/recovery, exit planning, aim coaching, near/distant Joe animation and optional-LOD failure.
- Seventeen atmosphere groups pass on hardware and software, including mist, ghost motion and poses, occlusion, horror flashes, comfort settings, Pause and no extra first-event shader programs.
- All six opening/border/shed comparisons are pixel-identical on hardware and software. High-resolution opening capture inspected. Responsive visuals pass at 2560×1600, 1280×720, 800×600 and 844×390 touch.
- Release validation passes without warnings/failures. JavaScript syntax and whitespace checks pass.
- Installed normal-play client completed three iterations and 28 units of movement with no error artifacts. Final gameplay screenshot and state inspected.

Evidence and source snapshots: `output/startup-decode-20261107/`. Companion results: `companion.json`; detailed CPU/GL audit: `audit/hardware.json` and `audit/startup.cpuprofile`; paired loading reports and `pixel-comparison.json` are alongside them.

Remaining limits: static-world assembly, some cold tasks/large uploads, the final warmup GPU drain and software foliage/pond throughput. No image resolution, effect population, model detail, movement or navigation quality was reduced. No deployment or commit was performed.
