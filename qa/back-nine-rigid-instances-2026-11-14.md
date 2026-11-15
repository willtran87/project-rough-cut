# Back Nine rigid-instance culling

The SwiftShader 60 ms gate remains **open**. This change removes offscreen draw work without removing simulated effects or changing visual settings.

Follow-up vertex batching, SIMD coverage, final performance and visual comparisons are recorded in `qa/back-nine-vertex-batches-2026-11-14.md`. The target remains unmet.

## Retained implementation

`web/rigid-instance-culling.js` compacts the main-camera matrix/color stream for explicitly marked rigid instanced effects. It preserves instance order, source geometry, materials, original matrices, colors and simulation counts. Bounding spheres retain a 1 cm rounding margin. Shadow passes use the complete original stream, because offscreen objects may cast visible shadows. Disposal restores the original geometry and callbacks.

Back Nine opts in debris, contact dust, irrigation drops/rings, mower clippings, destruction props, hurdles, experience particles, projected tree shadows, tire spray and impact sparks. These effects use immutable vertices and rigid/TRS transforms. Shader-displaced foliage and unmarked meshes are excluded. The helper is enabled only on the existing software-rendering path. Native rendering and the resolution budget are unchanged.

## Evidence

- `tools/verify-rigid-instance-culling.mjs`: passed opt-in behavior, stable matrix/color order, camera movement, zero-visible batches, complete shadow streams, unchanged simulation data, disabling/re-enabling and disposal.
- `tools/verify-back-nine-software-invariants.cjs`: extended the full-geometry comparison to disable instance culling too. All **16 production views had zero changed RGB pixels** on LLVM SwiftShader at 640×360, with no browser errors. Their SHA-256 pixel hashes also match all 16 earlier pre-change hashes. Evidence: `output/back-nine-swift-finish/instance-culling-production-invariants/report.json`.
- Frame-wake and software-budget unit checks still pass.
- An integrated, alternating on/off prototype measured **86.1 / 104.9 ms → 68.9 / 73.9 ms** median/p95 in the animated detailed foot view. The comparison frame had zero changed RGB pixels. This is a scoped result, not the full acceptance gate: `instance-culling-paired.json`.
- The tagged production code passed stock Chrome's functional stress suite, including charging, maximum debris, flooded cart/on-foot scenes, pause, restart, and three layouts. The **performance gate failed**: cart **97.4 / 145.2 ms**, foot **110.5 / 138.1 ms** at 640×360. Evidence is under `stock-workers-32/`; despite that directory name, the requested worker override did not apply, as explained below.

Earlier diagnostics are preserved under `output/back-nine-swift-finish/`: `draw-profile-readback.json`, `draw-profile-summary.json`, `expanded-instances.json`, `culled-instances.json`, and `instance-culling-invariants/`. The serialized draw profiler changes render-pass behavior and includes initial cold pipelines; only its later samples were used for attribution, not frame-budget acceptance. A fully expanded vertex/transform-stream prototype was not retained: it preserved pixels but added upload work in the integrated animated test.

## Driver-configuration correction

The checked-out official SwiftShader source reads `SwiftShader.ini` from its **working directory**, not necessarily its executable directory. A read-only query of the owned LLVM GPU process found the project root as its working directory; no configuration file was present there. Earlier experiments that only wrote an ini beside the private executable did not establish that their requested worker/affinity settings were applied. The default source setting is capped at 16 workers, so the original 16-worker interpretation remains consistent with the default, but other explicit worker/affinity claims require requalification.

The installed Chrome GPU process instead changed working directory to `C:/Program Files/Google/Chrome/Application/157.0.8103.40/`. The isolated launch-directory ini was therefore not read in `stock-workers-32/`. `cwd.json` records this; the run is a default stock-Chrome measurement. No installed-browser configuration was changed.

An attempt to create a private hard-linked full-Chrome runtime failed with Windows access denied before linking its executable. No installed files were modified. The empty `stock-browser/` experiment directory is not a usable browser. The next worker-count experiment should use an owned headless process and verify its actual working directory before interpreting timing.

Post-integration verification: the installed gameplay client completed its movement/look-back fixture on LLVM SwiftShader at the existing640x360 buffer; its2560x1600 screenshot was opened and inspected with no error artifact. Stock Chrome combined stress screenshots were also inspected at2560x1600,1280x720 and390x844. Evidence: `instance-culling-client/` and `stock-workers-32/`.

An owned stock headless process was subsequently launched from the isolated ini directory, and its actual GPU working directory was verified there. This experiment still failed the strict gate: cart103.9/117.3ms, foot101.9/114.3ms. Evidence: `headless-workers-32/`, including `cwd.json` and observed process thread count. It does not establish a playable-browser configuration or close the target.

The final live keyboard-input check on the private LLVM driver, launched from the verified32-worker ini directory, also failed the unchanged gate. Cart completed127frames/10s at47.1ms median,75.1ms completion p95 and67.0ms interval p95. Foot completed178frames/10s at52.3ms median,63.0ms completion p95 and61.8ms interval p95. Both held800x450. No browser errors were reported. Evidence: `llvm-live-workers-32/report.json` and saved states. This is an experimental-driver result, not a stock-browser or full-suite pass. Thread descriptions were unavailable; CWD/ini provenance is verified, but the observed total process-thread count is not a separate per-pool count.

All owned test sessions in this continuation have completed. The retained change is the opt-in rigid-instance culling, in addition to the previous HUD pacing fix. The strict60ms target, stock SwiftShader requirement, and visual-quality requirements remain unchanged and unresolved as a whole.
