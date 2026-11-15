# Back Nine SwiftShader follow-up — 2026-11-14

The requested **under-60 ms median and p95 remains unmet**. No additional production renderer changes were retained in this follow-up. The last strict production acceptance run remains cart 76.7/82.0 ms and foot 98.3/100.8 ms at the unchanged 640×360 software floor; functional checks passed. See `qa/back-nine-vertex-batches-2026-11-14.md` for that complete suite and inspected layouts.

## Flood-mask investigation before the pause

A routed opaque-grass mask-removal experiment improved the alternating comparison from 78.0/88.4 to 72.0/78.1 ms cart and from 101.0/112.0 to 98.0/109.9 ms foot. The first 22 frozen image comparisons matched exactly. The wider check covered 72 views around all three flooded areas and proved that the apparent shortcut was not equivalent: six views differed, with 48 changed pixels in total and a maximum RGB-channel delta of 9. The clone shader compiled twice and was bound 360 times, so this was an exercised change, not a no-op comparison. It was rejected.

Splitting dry triangles away from masked triangles also failed fidelity: four of 22 reference image hashes differed. Its timing run overlapped another software benchmark, so timing cannot establish its isolated effect. Neither candidate was added to the game. Ground-only depth prepass and transparent zero-alpha substitutions were also slower and rejected.

## Resumed experiments

Each paired probe measured four alternating passes, with 20 retained samples per scene/condition after per-pass warmup. They used stock Subzero SwiftShader and the existing 640×360 floor. The table lists median milliseconds; full p95 values, samples, renderer identity, resolutions and errors are retained in the reports.

| Routed prototype | Cart baseline → candidate | Foot baseline → candidate | Disposition |
| --- | --- | --- | --- |
| Explicit flood-mask loop expansion | 83.0 → 90.5 | 119.6 → 121.3 | No measured benefit; timing affected by shared work |
| Cache-aware vertex numbering | 88.9 → 108.7 | 112.6 → 116.2 | No measured benefit |
| Empty headlight shadow caching/lookup bypass | 86.9 → 86.0 | 105.0 → 105.9 | No consistent overall improvement |
| Conservative rigid triangle-cluster back-face bounds | 78.0 → 78.9 | 107.1 → 108.0 | No measured benefit |
| Static turf identity-matrix specialization | 76.4 → 77.0 | 100.9 → 100.1 | Difference too small/inconsistent to retain |
| Cyclic triangle-pair index rotation | 125.9 → 124.7 | 170.0 → 174.9 | Contended timing; no qualified gain |

These prototypes were not integrated or declared visually qualified. Prepared invariant scripts for rejected timing candidates were not run merely to generate more evidence for changes that would not be adopted.

Read-only cache modeling used captured submitted index streams and the checked-out SwiftShader source's 64-entry direct-mapped, four-vertex processing behavior. Capped numbering predicted a 5.6% reduction in modeled shader batches; triangle-pair rotation predicted 7.7%. Those are model results, not real frame-time improvements. The measurements above did not justify adoption. The model is not a claim that the installed stock binary has been independently instrumented.

## Competing work and synchronization check

Another chat's software-rendering tests repeatedly overlapped the measurements. The user explicitly requested that those tests remain running; none was stopped or modified. A two-second read-only thread sample found that the competing GPU process's 16 busiest threads were all in processor group 0. This machine has two processor groups on two Intel Xeon Gold 6148 packages.

A wait-only probe was cancelled, then the synchronization comparison used **only the owned test process tree** on processor group 1. Before each measured pass, the helper verified thread ownership and recorded successful `SetThreadGroupAffinity` results. Other test processes remained active. This reduces contention from their main worker pool, but does not make the whole machine idle. The affinity changes expired with the owned test processes; no launcher, installed browser, system setting or production code was changed.

The one-page alternating comparison tested ordinary asynchronous fence completion against an explicit `gl.finish()` after each submitted frame. Timing included the blocking call; it did not move work outside the measured interval.

| Stock SwiftShader, processor group 1 | Cart median / p95 | Foot median / p95 |
| --- | --- | --- |
| Current production path | 77.1 / 107.2 ms | 100.0 / 116.1 ms |
| Explicit GPU completion | 76.9 / 101.0 ms | 101.0 / 127.9 ms |

The test reported no browser errors. Both conditions failed the 60 ms target. Blocking the main thread adds no useful improvement and was not adopted. Polling delay therefore does not explain the remaining gap in this measured workload.

## Evidence and retained state

- Compact results and 13 verified prior runtime/build/test hashes: `output/back-nine-swift-finish/followup-diagnostics.json`.
- Individual reports: directories named after each `paired-*` probe in `output/back-nine-swift-finish/`.
- Flood fidelity: `opaque-flood-invariants/report.json`; partition fidelity: `mask-partition-invariants/report.json`.
- Submitted streams and models: `vertex-cache-streams.json`, `cache-color-capped-model.json`, `triangle-pairs-model.json`.
- Owned-thread affinity records and synchronization samples: `paired-frame-finish-group1/report.json`.

All owned test sessions have terminated. The existing local server and other chats' tests remain running. Artwork, effects, resolution floor, native renderer and performance acceptance thresholds were not reduced. The SwiftShader limitation remains open.

During storage pressure, completed task-owned diagnostic directories were preserved on `H:/Codex-BackNine-SwiftShader-20261114/completed-probes/` with junctions at their original paths; no diagnostic assets were deleted. The additional directories moved after the earlier report include `chrome157`, `mist-slab`, `mist-unroll` and `cpu-compositor`.
