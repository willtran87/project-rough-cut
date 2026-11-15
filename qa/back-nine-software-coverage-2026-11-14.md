# Back Nine: software sample-coverage continuation

Status: **partial improvement; the software slowdown is not fully fixed**. The real application still misses its existing 60 ms software frame budget. This report does not accept software rendering as meeting Level 1's high-resolution visual bar.

## Retained change

The software path conservatively skips static ground/contact triangles whose projected facing or sample coverage cannot contribute to the image. Surviving indices retain their original order. Positions, normals, UVs, colors, textures, shaders, animation, lights, effects, resolution steps, and draw distances are unchanged. Wind-deformed plants, skinned characters, and native rendering do not use sample culling.

Coverage includes a subpixel margin and fails open near the camera or at large projected coordinates. The camera cache also includes framebuffer dimensions; the first loading draw and a resize cannot reuse coverage calculated at a smaller size. Full geometry can still be restored for inspection. Vertex attributes used by changing contact opacity/UVs are never compacted.

An optional 8,968-byte, import-free WebAssembly module accelerates the same JavaScript algorithm. JavaScript remains the fallback when compilation or allocation is unavailable. Source is `tools/raster-visibility.c`; `tools/build-raster-visibility.mjs` rebuilds the binary. The final scalar build was byte reproducible using Zig 0.13.0, with fast math disabled and floating-point contraction disabled. The compiler is a development tool only; it is not shipped in `web/`.

## Validation

- 150,000 independent triangle/sample checks, including reversed winding and sample-centre boundaries.
- 100 compiled-versus-JavaScript camera comparisons, including near-plane views and 32/640/960/2560 targets. Indices match exactly.
- Resolution-cache invalidation, full restoration, unknown-size fallback, and unchanged vertex attributes pass.
- Existing batch-culling test: 720,000 triangle checks across 100 cameras; exact restoration and distance limits pass.
- Existing index-compaction and scenery-contact tests pass.
- **32 GPU image comparisons: zero changed RGB pixels**, 16 course views at each of 960×540 and 640×360. Reference is full uncropped geometry in the same loaded scene, holding camera, pose and shaders fixed. This is a visual safety comparison, not a timing baseline.
- Both software and native gameplay suites pass charging/exhaustion, simultaneous destruction, moving cart/foot stress, bounded/stable resources, pause/resume, restart, and responsive-layout checks. Browser errors: zero.
- Installed gameplay client run for both renderers at a 2560×1600 viewport. Presented images were opened and inspected, along with 1280×720 and 390×844 suite captures. Software still renders at its existing 640×360 minimum in this workload; native retains 2560×1440. Programs/textures remain 52/58 software and 41/58 native.

## Timing evidence

Same loaded scene, fixed 960×540, alternating moving-camera blocks, including CPU update and GPU completion. Baseline retains the previous fine bounds/hedge culling but disables the new sample-coverage stage. Triangle counts are the frozen comparison poses; timing blocks continue moving.

| Stress view | Previous median / p95 | Coverage median / p95 | Median reduction | Submitted triangles |
| --- | --- | --- | --- | --- |
| On foot, facing Joe | 222.0 / 285.9 ms | 216.0 / 249.1 ms | 2.7% | 250,608 → 197,241 |
| Cart | 205.3 / 238.3 ms | 191.0 / 292.3 ms | 7.0% | 198,762 → 157,652 |

The cart p95 worsened in this sample; this is not a tail-latency fix. Host load varied substantially, with one CPU package observed at 100% while the other was at 10%. Do not compare absolute times from separate runs as an optimization claim. CPU update cost increased because coverage adds work; the compiled microbenchmark reduced that calculation from about 10.2 to 4.9 ms for 129,024 test triangles. Whole-frame improvements remain modest.

Final real-application stress result:

| Renderer | Resolution | Cart median / p95 | Foot median / p95 |
| --- | --- | --- | --- |
| SwiftShader | 640×360 | 100.4 / 129.8 ms | 111.2 / 166.7 ms |
| Native | 2560×1440 | 17.3 / 18.9 ms | 18.5 / 19.9 ms |

The functional suite's `passed` flag is not software frame-budget acceptance. `output/back-nine-renderer-finish/software-budget.json` explicitly records the failed 60 ms budget.

## Rejected experiments and remaining work

The initial JavaScript-only coverage implementation consumed much of its GPU saving. Compiled execution reduced that overhead. SIMD compilation did not improve the isolated coverage benchmark, so the final module uses the scalar target. Meshoptimizer index reordering and opaque-terrain draw-order experiments had no measured benefit and are not in production. Converting turf sampling to floating-point linear texture storage was slower and changed some pixel values; it was discarded.

Shader-removal diagnostics identified substantial lighting/mist costs, but removing those effects would violate the visual requirement. All diagnostic shader changes were confined to browser routes. The original mist, fixture lighting, surface shaders, pixel-art module, local-light culling, and application renderer are byte-identical to this turn's baseline; see `final-source.json`.

Further work must reduce the remaining vertex/fragment shading cost while preserving the image. The present change does not establish that the complete scene can meet the software budget. Keep `software-renderer-fidelity` open.

## Reproduction

From the project root, with the static server on port 4187, run GPU timing jobs sequentially:

```powershell
node tools/verify-raster-visibility.mjs
node tools/verify-course-batch-culling.mjs
node tools/verify-visible-indices.mjs
node tools/verify-scenery-contact.mjs
node tools/verify-back-nine-software-invariants.cjs output/back-nine-renderer-finish/recheck-960
node tools/verify-back-nine-software-invariants.cjs output/back-nine-renderer-finish/recheck-640 640 360
node tools/verify-back-nine-raster-performance.cjs output/back-nine-renderer-finish/recheck-paired
node tools/verify-back-nine-final-polish.cjs output/back-nine-renderer-finish/recheck-software --software
node tools/verify-back-nine-final-polish.cjs output/back-nine-renderer-finish/recheck-native
```

Evidence is under `output/back-nine-renderer-finish/`: `wasm-paired/`, `wasm-invariants-960/`, `wasm-invariants-640/`, `software-final/`, `native-final/`, `client-software-final/`, `client-native-final/`, and `final-source.json`. No commit or deployment was made.
