# Under the Green: current pursuit-build performance

November 12, 2026. This pass measures the current approach-strike, service-grate and gallery-placement build. No runtime change was made. The previous goal turn completed documented dynamic-clearance coverage; this turn refreshes the sustained performance evidence that those later changes required.

## Workload and results

Hardware and software runs were sequential, each lasting five minutes, at a 2560×1600 viewport, FOV 85 and requested resolution 1. The production renderer uses `preserveDrawingBuffer:false`. Independently verified ordinary-input tapes run through the real update/render/audio/HUD loop: walking dry, walking wet, sprint and checkpoint 3. No actor positions are replayed over live AI. All four completed attempts in each run matched expected mode, position, time and water-hit count.

| Measurement | RTX / ANGLE D3D11 | SwiftShader fallback |
| --- | --- | --- |
| Warmed rendered submissions/s | 59.98 | 28.51 |
| Slowest warmed approximately 30-second window | 59.93 | 24.33 |
| Existing minimum window requirement | 55 | 24 |
| RAF p95 | 16.7 ms | 16.7 ms |
| Warmed budget | Pass | Pass |
| Slowest initial window | 59.62 | 19.32 |
| Ready time in this fresh browser | 1.425 s | 1.270 s |
| Post-GC heap range after traversal | 15.60–16.27 MiB | 17.39–18.21 MiB |
| Final minus first warmed heap | -537,236 bytes | -449,276 bytes |

Both retain 290 geometries, 56 textures, 21 programs and 16 audio voices after the first complete traversal. Event bounds pass, no context loss or console/page errors occur, and the software queue remains within one outstanding frame. The hardware scene renders at 1600×1000; software settles at 480×300 beneath its 960×600 ceiling. Native HUD resolution remains independent of scene resolution.

Software's initial 30-second windows average 23.00, 19.32 and 34.78 submissions/s. The first-traversal concern therefore remains open even though the defined warmed acceptance passes. No threshold or warmup definition was changed to obtain this result. RAF frequency is not rendering throughput: the lower software submission rate is recorded separately.

Both ending captures were opened and inspected. The keeper control and relief messages remain visible; the software world is visibly coarser while the HUD remains sharp. These ending views do not qualify every world-space sign or mobile control at the lower resolution.

## Reproducibility and source integrity

Artifacts: `output/under-green/current-build-soak/`, including both raw reports, analyses and ending PNGs. Commands:

```powershell
node tools/profile-under-green-soak.cjs --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/current-build-soak
node tools/analyze-under-green-soak.cjs --output=output/under-green/current-build-soak
node tools/profile-under-green-soak.cjs --software --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/current-build-soak
node tools/analyze-under-green-soak.cjs --software --output=output/under-green/current-build-soak
```

Hardware execution session 67196 and software session 97166 exited 0. Both analyzers exited 0. No owned test process remains running; the existing server is preserved.

`source-before.json` hashes 808 existing web/harness files. The final comparison records nine concurrently changed files belonging to other chapter entry points/presentation. None belongs to the 76-file local relative-import/script/stylesheet graph in `dependencies.json`; none of the measured harness files changed. The graph excludes navigation links and bare import-map specifiers; the wider hash snapshot also covers vendored files. No Under the Green dependency change was found during either run. This is source identity evidence, not a repository-wide clean-worktree claim.

`host-before.json` records the local 80-logical-processor environment, 79 Chrome processes and the sole identified `tools/` Node job at that instant. User applications were left intact. This snapshot does not establish an idle machine throughout the test or isolate the cause of timing variability. Chromium version is 148.0.7778.96.

## Remaining work and next action

The current build now has fresh local warmed acceptance; do not rerun the same unchanged soak merely to replace these numbers. Keep the initial slowdown visible. Prior first-use investigation already showed slow repeated windows without new uploads, so do not assume shader caching alone explains it or revive the rejected startup candidate without new evidence.

Return to the remaining pursuit/encounter and course-identity requirements, alongside a focused diagnosis of first-traversal cost when there is a testable optimization hypothesis. Physical integrated-GPU/mobile, cold storage/network, longer thermal sessions and human control responsiveness remain unqualified. These engineering results do not establish fear, fun, unfamiliar-player comprehension or listening quality. The full 44-item goal remains active.
