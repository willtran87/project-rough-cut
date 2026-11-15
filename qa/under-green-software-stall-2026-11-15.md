# Under the Green: software-rendered Joe entrance

The remaining SwiftShader entrance stall is addressed with explicit, nonblocking GPU command boundaries before and after Joe's mesh draws. This is enabled only by the existing software-renderer detection. The native renderer follows its previous path.

`web/software-actor-submission.js` chains the existing mesh callbacks with the same receiver and arguments, inserts a fence/flush boundary, and immediately deletes each fence handle. It never waits or reads pixels. The existing whole-frame completion fence remains responsible for presentation. Disposal restores the callbacks. Joe's simulation, animation, navigation, attacks, visibility, assets, materials, lighting, geometry and resolution policy are unchanged.

## Investigation

Full-model warmups, framebuffer-size warmups and a compact lighting-loop experiment did not eliminate the stall and were not retained. Joe's warmup and live material program IDs matched. Readback and per-draw fence diagnostics showed that individual body draws were inexpensive, while breaking up the full queued render work avoided the large spike. A boundary only before actor draws left a later 673 ms spike; boundaries on both sides removed it. This is evidence for a queue/pass interaction in this software backend, not proof of a particular internal driver compiler defect.

Experimental scripts and measurements are preserved under `output/under-green/software-stall/`; experimental rendering overrides are not part of the retained entrance runner. Performance acceptance rejects reports that enable those overrides.

## Production-path performance

Ordinary real-time input replay, 2560x1600 viewport, FOV 85, existing software resolution policy, first entry plus retry:

| Measurement | Before | Retained fix |
| --- | ---: | ---: |
| Longest entrance submission gap (6–10 s) | 1,342 ms | 244 ms |
| Longest gap over both 20 s attempts | 1,342 ms | 453 ms |
| First new submitted frame | 203 ms | 210 ms |
| Maximum entrance RAF CPU | — | 16.9 ms |

The independent final candidate run measured 239 ms at the entrance and 394 ms over both attempts. The retained-code run rendered 594 frames, had no errors or cold allocation/reflection in the entrance window, and held geometry/program counts at 916/225 with 81 textures. The earlier half-boundary candidate is not the shipped implementation.

The existing 1 s overall software stall limit was retained, with an additional 500 ms entrance limit. Both pass. These are render-submission intervals, not measured display latency. The fallback still has ordinary expensive world frames (up to 453 ms in this run); this fix is not a claim that the entire level sustains 30 or 60 FPS on software rendering.

## Visual and lifecycle verification

- Forced-software comparison: all 15 baseline/optimized framebuffers are byte-identical (SHA-256). Views include districts, water, Joe's entrance/walk/windup/swing, offscreen Joe and a moving ghost, at 2560x1600, 1280x720 and 390x844. High-resolution Joe/ghost and narrow-layout screenshots were inspected.
- First masonry impact activates six chips without allocating another geometry (916 before/after).
- Hook lifecycle test passes: original callback receiver/arguments preserved, 2,000 fence handles released, and repeated disposal restores hooks correctly.
- Native D3D11 first/retry acceptance passes: 2,400 frames, 25.1 ms maximum submission gap (24.4 ms in the entrance window), 20.7 ms maximum entrance RAF CPU, no errors or cold entrance allocations. All 15 native framebuffer comparisons are also byte-identical; the high-resolution Joe capture was inspected. First debris activation remains at 582 geometries.
- Scene diff is limited to importing/enabling/disposing the software hook. Actor/animation, gameplay, practical lighting and render preparation files exactly match the pre-task snapshots.
- Installed gameplay client passes all 16 action bursts: final state ready/playing, player advances from y=5 to y=10.12, no browser errors. The final gameplay screenshot was inspected.
- Four complete dry/wet and walking/running replays pass: Joe's full state matches the preserved original planner at all 16,198 simulation steps; final run states also match exactly and all four routes complete.

Artifacts: `output/under-green/software-stall/` contains `software-release/acceptance.json`, `native-release/acceptance.json`, both `visuals-*/report.json` reports, `behavior.json`, `client/`, and the investigation subdirectories. All owned test processes completed; the existing development server was preserved. The broader visual-upgrade goal remains paused.
