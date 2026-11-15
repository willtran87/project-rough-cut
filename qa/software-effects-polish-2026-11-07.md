# Software frame budget and pixel effects — November 7

This pass preserves the task-start movement, collision, Joe navigation, models and source illustrations. It addresses redundant render work and first-visit buffer allocation, adds adaptive software resolution, and refines water/contact effects. It does **not** certify 60 FPS on software rendering or eliminate every startup stall.

## Runtime changes

- Completed GPU frames drive a software-only 960×540 / 800×450 / 640×360 scene budget. Six initial samples are ignored. Eight consecutive frames above 80 ms reduce resolution; a 24-frame cooldown prevents repeated changes. Recovery needs 60 consecutive frames below 42 ms and a longer cooldown. Single spikes do not lower quality. The user's lower resolution setting remains authoritative.
- All three targets are allocated before play. Switching happens after the outstanding GPU fence finishes. Original textures, geometry, pixel filtering and full-resolution DOM HUD remain; fewer scene pixels are an explicit software fidelity tradeoff. Hardware resolution/shadows are unchanged.
- Busy GPU frames now skip scene culling, model-pose and buffer updates earlier. Simulation/input and screen feedback still run; the latest scene is drawn once capacity becomes available. Existing Pause/resume, presentation-waiter and readiness behavior is retained.
- Loading prepares buffers for off-camera static meshes using zero-length draws in small batches. Shared draw ranges and render target/shadow state restore before yielding or cancellation. This removes large static allocations when entering new parts of the course. Small dynamic geometry allocations can still occur.
- Contact rings use a broken pixel mask, a compressed dry-impact shape and a faster fade. Ponds gain offset ripples and gradual response to authored wind. These use existing draws, with no additional lighting/refraction pass. Pause and Reduced Motion freeze water changes.

## Measured performance

Evidence: `output/software-polish-20261107/`. Source baseline is in its `before/` directory. GPU tests ran sequentially. Measurements are local short runs, not device qualification.

A same-browser A/B/B/A diagnostic renders the same scene at 960×540 / 640×360 / 640×360 / 960×540. Four warm frames precede each 16-frame measurement. A one-pixel readback forces actual GPU completion; this is diagnostic only, never used in gameplay. Averaging each pair of medians gives:

| View | 960×540 | 640×360 | Reduction |
| --- | ---: | ---: | ---: |
| Opening | 68.4 ms | 58.35 ms | 14.7% |
| Wooded border | 89.3 ms | 57.95 ms | 35.1% |
| Pond | 91.0 ms | 74.4 ms | 18.2% |

The separate moving profile uses the real presentation queue and adaptive resolution, 60 submitted scenes per view. It includes camera movement, simulation-driven effects and RAF polling delay:

| View | Before median / p95 | After median / p95 | Final resolution |
| --- | --- | --- | --- |
| Opening | 66.7 / 83.4 ms | 83.3 / 99.9 ms | 800×450 |
| Border | 100.0 / 116.7 ms | 66.7 / 100.1 ms | 640×360 |
| Pond | 83.4 / 116.6 ms | 66.7 / 83.4 ms | 640×360 |

Opening did not improve in the fresh-process moving comparison. Host variance and adaptation timing matter; the controlled same-process test isolates the resolution benefit more reliably. Worst moving frames remain approximately 100–133 ms. This is a bounded improvement, not universal spike elimination. Render-call CPU p95 fell from 1.7–2.0 ms to 0.6–0.9 ms; those statistics include coalesced calls that now return early.

The installed web-game client completed three input sequences and travelled 28 course units. Its final completed-scene average was 84.5 ms, p95 98.1 ms; the software 60-FPS readiness check remains open. Final screenshot/state inspected, no error artifact.

## Verification

- High-resolution hardware/software checks at 2560×1600, plus 1280×720, 800×600 and 844×390 touch; opening, mower/evidence, pond, border and shed captures inspected.
- Gameplay intelligence: 9 groups, including 29 obstruction approaches; no changes to navigation logic.
- Effects: 10 groups, including world occlusion, bounded pools, Pause/Reduced Motion, preference handling and unchanged simulation state.
- Presentation queue: 6 groups, including forced GPU backpressure, latest paused camera and accurate slow-GPU telemetry.
- Adaptive budget: cold samples, sustained overload, floor, cooldown, recovery, isolated spikes and invalid samples.
- Release: 90 action fixtures, no failures/warnings; 55 runtime images / 17.94 MiB unchanged.
- Pixel-world: 10 groups pass after updating its fixed software-resolution expectation to the adaptive contract; ordinary movement, model views, mechanism Use and parallax remain covered.
- Preparation lifecycle: 5 groups pass, including primary/fallback Joe, Pause while loading and cancelling scene replacement. First active submissions 15.4 / 22.2 ms; protected preparation 8.24 / 9.34 s. Maximum loading gaps 250 / 383 ms in those hardware lifecycle runs.
- RTX 3090/D3D11: all three moving views retain 1280×720, shadows, median16.7 ms, p9516.7–16.8 ms; zero of180 samples exceeded50 ms.
- Source hashes confirm `game.js`, `joe-navigation.js`, `joe-model.js`, `pixel-trees.js` and `pixel-world-props.js` are byte-identical to the task-start baseline.

## First-visit allocation and remaining startup cost

Instrumenting actual WebGL `bufferData` during first visits gives:

| View | Before buffer allocation | After buffer allocation |
| --- | ---: | ---: |
| Opening | 0 B | 0 B |
| Wooded border | 9,726,772 B / 648 calls | 140 B / 4 calls |
| Pond | 6,171,556 B / 675 calls | 32,664 B / 10 calls |

These are newly allocated buffers, not all subsequent buffer updates. Small dynamic/effect buffers remain; static-buffer spikes are moved into loading. The final software preparation uploads1134 static meshes in335 ms, with a maximum6.7 ms batch; hardware782 meshes take248 ms, maximum9.1 ms batch.

The final software cold run took12.85 s to ready and13.26 s to the first completed scene. Its worst loading-frame gap was466.7 ms, including a453 ms main-thread long task. Those remaining construction/decode/driver stalls are not solved by the new buffer upload batches. The2.02-second real input probe travelled45.6 course units without errors. Human playtests and broad device qualification remain prepared for later.

## Rejected experiments

Larger static batches, trimmed foliage hulls, coarse static geometry, vertex-lit needles and baked distant-tree views did not demonstrate a convincing speed/fidelity benefit. They were removed from runtime. Their diagnostic evidence stays under the output directory. No baked tree images are shipped.
