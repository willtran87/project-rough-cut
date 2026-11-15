# Back Nine SwiftShader vertex batching and SIMD culling

The strict **60 ms median and p95 target remains open**. No resolution floor, visual effect, simulation population, or acceptance threshold was reduced. WARP results are not SwiftShader acceptance.

## Retained changes

- `web/rigid-vertex-batches.js` packs visible small rigid effects into one indexed vertex stream per existing material. CPU transforms retain original triangle order, UVs, colors and normals. An identity instance retains the original shader and live material uniforms. Original instance matrices and simulation counts remain owned by the effects. Shadow casters retain the prior matrix culler and full shadow stream; enabling shadows later restores the complete source geometry. Source bounds are retained for existing bounds calculations. Only Back Nine's actual SwiftShader path selects this helper; WARP keeps the previous helper.
- `tools/raster-visibility.c` has an optional two-lane, double-precision SIMD projection. Arithmetic order, division precision, coverage margins and triangle decisions are unchanged. The build emits both scalar and SIMD WASM modules. The loader tries SIMD, then scalar, then the existing JavaScript reference implementation.
- The scene entry version was updated. Tests cover vertex/color ordering, nonuniform-scale normals, shadow fallback, simulation ownership, empty batches, disposal, module fallback and pixel comparisons.

## Verified fidelity and behavior

- `verify-rigid-vertex-batches.mjs` and the existing matrix-culler test passed.
- Scalar and SIMD raster tests each passed 150,000 coverage cases and 100 compiled/reference camera comparisons. The loader test passed SIMD selection, scalar fallback, JavaScript fallback and shared preparation promises.
- Production LLVM SwiftShader: **22 views, zero changed RGB pixels** against full original geometry. The first 16 hashes also match the pre-change captures. Evidence: `output/back-nine-swift-finish/vertex-batches-motion-invariants/report.json`.
- Production stock Subzero SwiftShader: **22 views, zero changed RGB pixels**, including six debris ages/camera orientations. Evidence: `vertex-batches-stock-invariants/report.json`.
- Stock tire spray: **three views at 960x540, zero changed RGB pixels**. These exercise the effect that recomputes its instance bounds during animation. Evidence: `vertex-batches-tire-spray/report.json`.
- The installed standard gameplay client passed movement/look-back testing on stock SwiftShader. Its actual 2560x1600 screenshot was opened and inspected; it finished ready/driving, on foot, at the existing640x360 buffer, with no error artifact. Evidence: `vertex-batches-client/`.

## Performance evidence and limits

The isolated SIMD projection comparison processed 65,536 triangles across 100 moving-camera frames with identical indices. Median time was1.8253ms scalar and1.2618ms SIMD, approximately31% faster for this calculation. This is not a full-frame performance result. Evidence: `raster-simd-micro.json`.

A same-browser, alternating comparison before SIMD, with a fixed camera and animated debris, measured stock SwiftShader:

| Scene | Matrix culling median / p95 | Vertex batching median / p95 |
| --- | --- | --- |
| Cart |70.0 /73.1ms |68.1 /71.0ms |
| Foot |93.0 /101.9ms |89.8 /97.4ms |

Evidence: `paired-vertex-batches/report.json`. This excludes moving-camera culling cost and is not the acceptance suite. Separate runs varied substantially; early unpaired results overstated the likely gain. A pre-SIMD production stress run still failed at115.3/122.5ms cart and100.3/149.2ms foot. The strict gate is unchanged.

Phase profiling of the old path found roughly11–13ms in scene updates, including8–9ms in batch culling, and4–5ms in draw submission. Most remaining completion latency was after submission. The measurements include fence polling and are not pure GPU timer-query measurements.

## Rejected diagnostic changes

The postTask wake-up experiment, 32 raster clusters, empty-cluster scheduling, plain non-instanced expanded geometry and forced physical-core affinity did not meet the strict gate. None is retained in the application or launcher. Source patches and reports remain under `output/back-nine-swift-finish/`.

Worker-count labels in earlier experiments denote requested configurations unless separately verified. A correct GPU working directory alone does not establish the running pool's worker count or affinity. This continuation verified16 individually pinned workers in a compiled diagnostic **after the scene was ready**; that diagnostic also failed (54.9/67.9ms cart,66.1/81.2ms foot). Its source changes were reverted and the private active DLL restored to the original compatibility build, SHA256`1f397b56d090c1103ed7de47ea37c87da5691dbaed2e13b19ce5e577536c5543`. The build-output DLL is still a rejected diagnostic and must not be copied into the runtime blindly.

Completed probe directories were preserved on H: with junctions at their original paths to relieve C: disk pressure. No installed-browser binaries or unrelated project files were changed.

## Final production verification

The alternating moving-camera comparison also favored batching, but modestly: cart median/p95 changed from77.0/80.9ms to76.9/79.9ms; foot changed from107.0/115.9ms to103.1/109.0ms. Both sides used SIMD, the same stock browser, matching poses and alternating measurement order. Evidence: `paired-moving-vertex-batches/report.json`. The cart median benefit is within normal timing variation; this is chiefly an on-foot/debris improvement.

The final unmodified production stress suite on stock Subzero SwiftShader passed charging, exhaustion, maximum destruction/flood/chase scenes, pause/resume, restart and responsive layout checks, with no browser errors. It **failed** the unchanged performance gate:

| Scene | Median | p95 | Buffer |
| --- | --- | --- | --- |
| Cart |76.7ms |82.0ms |640x360 |
| Foot |98.3ms |100.8ms |640x360 |

Evidence: `output/back-nine-swift-finish/vertex-simd-final-stock/report.json`. Actual screenshots at2560x1600,1280x720 and390x844 were opened and inspected. All owned test sessions have completed; the existing server remains running. The SwiftShader limitation and overall goal remain open.

## Further diagnostics and live-input verification

Four alternating stock-browser diagnostics were run after integration. None changed the application. Their summaries are in `output/back-nine-swift-finish/post-integration-diagnostics.json`.

- Omitting the complete fixture-light shader changed cart median from78.0 to72.2ms and foot from105.0 to91.8ms. Omitting mist changed cart from78.1 to70.0ms and foot from155.2 to135.1ms. These are intentionally incomplete images used to isolate cost, not acceptable optimizations. Both effects remain intact. Large variation between runs also limits comparisons across experiments.
- CPU skeletal deformation regressed cart from77.0 to83.9ms and foot from101.0 to112.6ms. This prototype was not visually qualified; a bind-position UV correction was added after the measured page loaded. It was never adopted.
- Conservative pixel-coverage culling of rigid hero geometry reduced submitted triangles by about18,000–20,000 but did not reliably improve the combined result: cart80.0→83.1ms, foot108.9→105.2ms, with substantial variation. It remains a routed prototype. Its prepared invariant script was not run because the timing result did not justify adoption.

The final live keyboard-input test used the unchanged retained production code and actual stock Subzero SwiftShader at2560×1600, with a640×360 rendering buffer. It ran3seconds of settling and10seconds of real movement per scene:

| Scene | Frames /10s | Completion median / p95 | Interval p95 | Distance |
| --- | --- | --- | --- | --- |
| Cart |158 |53.1 /109.5ms |105.0ms |108.44m |
| Foot |94 |99.1 /179.9ms |179.8ms |69.56m |

Both scenes remained in driving mode with no browser errors. Both actual gameplay screenshots were opened and inspected. The live performance gate **failed**; a sub60ms cart median does not satisfy the p95 requirement. Evidence: `output/back-nine-swift-finish/vertex-simd-final-live-stock/report.json`. All13 runtime/build/test hashes still match `vertex-simd-runtime.json`, and the private diagnostic DLL still matches the restored original hash. All owned test processes are terminal.

## Ground, cache and browser trace follow-up

The next continuation retained no additional runtime changes. A fresh stock-driver readback diagnostic identified grass, turf-margin and soil-margin shading as the largest individual draws. After discarding each draw's cold first readback sample, their serialized costs were approximately11.55,9.60 and6.15ms. Readback alters render passes and scheduling; these values cannot be added into an ordinary frame budget. The inventory confirms these are the opaque grass and two transparent margin layers. Evidence: `vertex-simd-stock-draw-costs.json` and `ground-inventory.json`.

Alternating moving-camera probes then rejected three approaches:

| Probe | Cart median baseline→probe | Foot median baseline→probe | Result |
| --- | --- | --- | --- |
| Integer texel fetch for fixture-light data |75.1→73.0ms |99.8→100.0ms |No reliable overall gain; p95 regressed |
| Lossless first-use vertex numbering |76.9→79.1ms |105.1→107.1ms |Regressed |
| Spatial hierarchy over authored groups |77.7→76.0ms |98.1→99.0ms |No reliable overall gain; cart p95 included429.7ms stalls |

A separate CPU comparison checked the hierarchy against the original culler over420 measured moving-camera updates, periodically asserting identical visibility, retained index streams and part flags. It reduced culling median only5.4→5.3ms cart and6.8→6.6ms foot. That is too small to justify the added path after the full-frame result. The hierarchy was not added to the shared production culler.

A50-frame stock-browser trace recorded251.4ms total instrumented command-buffer flush CPU time (about5.0ms/frame),14.0ms compositor draw/swap CPU time (about0.28ms/frame), and14.7ms renderer raster-worker CPU time. These nested CPU events **exclude SwiftShader's uninstrumented worker execution** and must not be summed or mistaken for GPU completion time. Tracing also perturbed timing, including a cold684ms first frame; it is diagnostic evidence, not acceptance. No browser errors were reported.

Compact evidence: `output/back-nine-swift-finish/ground-cache-diagnostics.json`. The raw trace is `stock-frame-trace.json`. The unchanged strict and live acceptance failures above remain authoritative; neither quality nor the target was reduced.

## Subsequent shader/cache investigation

See `qa/back-nine-swiftshader-followup-2026-11-14.md` for the expanded flood-mask fidelity failure, rejected shader/cache/triangle probes, competing-work observations and verified owned-process processor-group test. No further production renderer change was retained. On stock SwiftShader in processor group 1, the production path still measured 77.1/107.2 ms cart and 100.0/116.1 ms foot (median/p95). Explicit GPU completion did not improve it. The under-60 ms gate remains open.
