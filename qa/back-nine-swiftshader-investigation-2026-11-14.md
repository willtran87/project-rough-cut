# Back Nine: SwiftShader qualification still open

The requested **under-60 ms median and p95** result has not been achieved. Later work fixed repeated HUD/compositor updates, added opt-in rigid-instance culling, packed small rigid vertices and accelerated coverage with double-precision SIMD. The latest evidence is in `qa/back-nine-vertex-batches-2026-11-14.md`; earlier culling and worker-configuration corrections are in `qa/back-nine-rigid-instances-2026-11-14.md`. Artwork, resolution floor and acceptance thresholds remain unchanged. WARP's earlier pass does not qualify SwiftShader.

All figures below come from the same strict `verify-back-nine-final-polish.cjs --software --settle-budget --require-budget` suite. It exercises charging/exhaustion, maximum destruction pools, cart and rear-facing on-foot stress scenes, pause/restart, and 2560×1600, 1280×720 and 390×844 layouts. Timing includes scene update, submission and GPU fence completion. Every listed run passed functional checks without browser errors, but **failed** the performance gate at the existing 640×360 software floor.

| SwiftShader configuration | Cart median / p95 ms | Foot median / p95 ms |
| --- | --- | --- |
| Installed Chrome 157, stock Subzero | 98.3 / 123.4 | 138.0 / 170.1 |
| Isolated LLVM 10, original scheduling | 60.7 / 69.6 | 73.1 / 82.6 |
| LLVM, 20 physically pinned workers | 65.2 / 73.0 | 82.5 / 93.3 |
| LLVM, extra optimization passes | 79.7 / 88.7 | 97.1 / 108.9 |
| LLVM, 512-triangle batches | 60.6 / 62.7 | 74.3 / 97.8 |
| LLVM, 32 clusters / workers | 80.1 / 96.0 | 89.6 / 96.3 |
| LLVM, 8 clusters / workers | 71.1 / 78.4 | 90.9 / 95.4 |
| LLVM, 256-entry vertex cache | 81.9 / 100.9 | 99.6 / 134.9 |
| LLVM, distinct uncached vertex gathering | 60.4 / 62.6 | 75.1 / 99.6 |
| LLVM, AVX-512 disabled | 69.1 / 72.3 | 81.3 / 85.4 |
| LLVM, GPU in browser process (diagnostic only) | 71.9 / 85.9 | 81.8 / 103.9 |
| LLVM, CPU unique-vertex batch / full record copies | 93.3 / 98.4 | 107.4 / 117.6 |
| LLVM, unique vertices / copy only declared outputs | 82.3 / 91.3 | 98.1 / 105.6 |
| LLVM, EarlyCSE/LICM with original code-generation level 2 | 62.2 / 71.2 | 81.9 / 102.6 |

These are sequential runs on a shared machine, not an isolated attribution of small timing differences. None warrants a passing claim or replacement of the user's normal browser.

## Other rejected experiments

- Offscreen rendering and copying back did not improve timing.
- Uniform bone palettes did not meaningfully outperform bone textures.
- Extending conservative sample culling to additional static meshes preserved pixels but cost more CPU time than it saved.
- Front-to-back opaque sorting was slower and changed one pixel in its diagnostic view. A depth prepass preserved every compared pixel but substantially increased cost.
- Disabling CPU coverage was slower on LLVM SwiftShader. Disabling drawing-buffer preservation and browser frame-rate limits did not help.
- Removing visual effects was used only to isolate costs; those diagnostic changes were never written to the game.
- A CPU profile of the fixed detailed view was dominated by idle/render-completion waits. No JavaScript update hotspot large enough to close the gap was found.
- A fixed-view scissor diagnostic retained the complete vertex stream: full view 86.0 / 101.0 ms, one shaded pixel 70.0 / 74.0 ms, quarter view 74.1 / 83.0 ms. It suggests vertex processing, setup and submission dominate this view; it is not a quality-preserving candidate or a frame-budget pass.
- [Meshoptimizer's index ordering](https://github.com/zeux/meshoptimizer/blob/v1.0/js/README.md) retained the original vertex attributes and every triangle. In a paired fixed-view experiment it preserved the compared pixels but regressed 84.8 / 90.0 to 91.9 / 130.4 ms. The encoder was downloaded only into the experiment directory, not added as a game dependency.
- The unique-vertex driver experiments reconstructed the original triangle sequence. Nine of ten deterministic JPEG captures matched the original LLVM captures byte-for-byte, but timing regressed. This is not a substitute for full raw-pixel qualification, and those changes were reverted.
- Earlier rejection of dry turf wholly inside the existing flood-discard circles removed 1,034 triangles and preserved the compared pixels, but regressed the fixed-view result from 85.0 / 92.1 to 86.7 / 105.9 ms. It remains a routed experiment; the game was not changed.

## Runtime and evidence isolation

The custom driver is an experiment built from official SwiftShader commit `708e9e77773860bbb2ad9bb2d61b451de4b84e31`, using its LLVM 10 backend, Zig 0.13, CMake 4.1.2 and Ninja 1.13.1. Windows/MinGW compatibility fixes were necessary. It is not a distributed or fully qualified replacement driver. The installed browser and game assets are untouched.

The private browser uses hard links for immutable browser files and an independently copied `vk_swiftshader.dll`; replacement checks reject a hard-linked driver. Its own `SwiftShader.ini` controls only that experiment. Reports assert that the real renderer identifies SwiftShader, so hardware or WARP cannot silently pass.

The private driver was restored to the original LLVM compatibility build with 16 workers. Its SHA-256 is `1f397b56d090c1103ed7de47ea37c87da5691dbaed2e13b19ce5e577536c5543`. The experimental source was restored to compatibility fixes only. The latest build-directory DLL is still the rejected EarlyCSE/LICM binary and must not be confused with the restored browser DLL. `restored-driver.json` and `driver-build/current.patch` record this distinction.

The installed web-game client, using the new explicit-browser test option, completed its on-foot movement/look-back sequence on LLVM SwiftShader at the existing 640×360 buffer within a 2560×1600 viewport. Its actual gameplay screenshot was opened and inspected; ready/driving state and renderer identity were confirmed, with no error artifact. This checks gameplay, not the 60 ms acceptance gate.

The restored LLVM driver also passed 16 raw-pixel comparisons at 640×360: retained culling versus restored full geometry produced **zero changed RGB pixels** in every view and no browser errors. Per-view SHA-256 pixel hashes are saved in `llvm-invariants-640/report.json` for subsequent comparisons. This validates the existing culling on that driver; it does not establish a cross-driver match or a performance pass.

Evidence is under `output/back-nine-swift-finish/`, with the configuration names above reflected in report directories. Stock Chrome and LLVM screenshots were inspected at all three layouts. The cross-driver JPEG comparison is a visual check, **not bit-identical proof**. A production change would still require raw-pixel invariants, the installed web-game client, and live keyboard-input testing.

Large build artifacts were preserved on other local drives as workspace space became scarce:

- Build/cache and saved original LLVM DLL: `F:/Codex-BackNine-SwiftShader-20261114/`.
- Unused LLVM 16 source: `F:/Codex-BackNine-SwiftShader-20261114/unused-llvm-16.0`.
- Download archives and LLVM 10 source: `H:/Codex-BackNine-SwiftShader-20261114/`. The original experiment's LLVM 10 source path is a junction to that preserved directory.

No unrelated files or processes were removed. The existing port-4187 server remains running. Further experiments must keep the 60 ms gate and visual quality intact.

## Live-frame HUD scheduling correction

The warmed manual-render suite did not expose a much larger live-loop issue. With real keyboard input and RAF simulation, the original LLVM runtime completed only 5 cart frames and 7 foot frames in the ten-second measurement windows. Completion medians were 1313.6 and 1335.7 ms. These measurements are preserved in `llvm-live-diagnostic/` and are failures, not acceptable gameplay.

`render()` previously called `paintUI()` on every animation tick before checking its pending GPU fence. That changed full-stage dread/impact styles and HUD content while the previous software frame was still rendering. The retained correction paints active-gameplay UI only when another world frame can be submitted, including submissions triggered by the completion timer. Input and fixed-step simulation continue independently. Initial UI, mode transitions, pause, settings, and menu actions still paint immediately.

| Live input configuration | Cart frames / 10 s | Cart median / p95 ms | Foot frames / 10 s | Foot median / p95 ms |
| --- | --- | --- | --- | --- |
| Original LLVM runtime | 5 | 1313.6 / 4407.8 | 7 | 1335.7 / 2893.2 |
| LLVM with HUD scheduling correction | 102 | 52.0 / 207.9 | 181 | 53.1 / 62.7 |
| Stock installed Chrome SwiftShader with correction | 122 | 52.8 / 157.1 | 105 | 95.5 / 120.8 |

The improvement is substantial, but **both corrected configurations still fail** the unchanged live completion/interval p95 gate. Cold/transition stalls remain included. The stock result is not interchangeable with the experimental LLVM result. `live-ui-gate/` and `live-ui-stock/` contain samples, complete before/after state, screenshots and renderer identity. The stock 2560×1600 gameplay screenshot was opened and inspected.

Additional routed-only experiments were rejected: explicit mist-loop expansion measured 87.3 / 91.6 ms cart and 106.6 / 111.3 ms foot; disabling GPU compositing measured 77.3 / 81.5 and 91.4 / 93.9 ms. Neither passed, and neither is a runtime or launcher change. Another chat's browser was present during part of the loop-expansion run, so it is not a controlled estimate of that change's isolated effect.

The previous `runtime-unchanged.json` snapshot describes the earlier investigation stage only. The current retained runtime changes are the UI scheduling fix in `web/back-nine.js` and its cache version in `web/back-nine.html`.

The dedicated UI pacing regression passed on actual LLVM SwiftShader. It deliberately stalls presentation while holding W, verifies no repeated HUD/world submissions and continued simulation, then checks immediate Escape pause, frozen pause, resume, restart and layout overflow at 2560x1600, 1280x720 and 390x844. All three screenshots were opened and inspected. The frame-wake and software-frame-budget unit checks also passed. Evidence: `ui-pacing/report.json` and `ui-pacing/playing-*.jpg`.

The installed gameplay client completed the movement/look-back fixture after the scheduling change, using actual LLVM SwiftShader at 640x360 within a 2560x1600 viewport. Its screenshot was opened and inspected; ready/driving state and renderer identity were confirmed, with no error artifact. Evidence: `ui-paced-client/`. `retained-runtime.json` confirms that the four sampled scene/culling/mist/practical-light files still match their original hashes; only the entry runtime and HTML cache version differ.

The preserved CMake distribution was moved from the experiment directory to `H:/Codex-BackNine-SwiftShader-20261114/cmake`, with a junction retaining its original path. This recovered workspace space without deleting the toolchain.

The final routed mist slab-rejection experiment also failed the strict gate: LLVM cart 79.5 / 86.2 ms and foot 98.9 / 109.1 ms, with functional checks passing and no browser errors. It was not applied to the game. Evidence: `mist-slab/report.json`. All tests launched in this continuation have completed. The final retained change is the verified HUD scheduling correction; SwiftShader qualification remains OPEN.
