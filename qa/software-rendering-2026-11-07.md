# Software rendering and preparation — November 7

This pass reduces redundant geometry work and prevents old images from accumulating in the software GPU queue. It preserves the existing textures, environmental geometry, course collision, player movement rules, Joe's smarter navigation and original close-up model. Software rendering is still below the gameplay frame-rate target; this is not a performance certification.

## Runtime changes

- Static batches retain geometry indices instead of expanding every triangle into separate vertices. Vertex colors, normals, UVs and authored surface coordinates survive batching.
- Software batches use spatial bounds around their actual geometry and box/frustum visibility checks. Hardware retains shadow casters outside the view.
- Surface shaders share compatible programs, use a uniform texture scale, and avoid redundant normal normalization. Needle alpha rejection happens before color grading.
- Lantern billboards and ground glows use two instance batches. World positions, plane dimensions, texture, color, opacity and camera facing are retained.
- Course construction yields between preparation stages; pipeline warm-up is bounded by 32 objects / 64,000 vertices per batch. One representative per shader/input layout is warmed, then the final protected scene draw uploads visible buffers together. GPU fences are polled asynchronously; gameplay stays held until preparation completes.
- Loading chunks yield through short timer tasks rather than waiting on a potentially delayed compositor RAF. Actual gameplay presentation remains synchronized to display frames.
- Ordinary loading frames leave the DOM loader responsive without repeatedly clearing and compositing an unfinished scene. Pause remains available.
- Software rendering permits one outstanding presentation, coalesces repeated requests, and paints the latest state after completion. Simulation/input continue independently. Pause caches only an actually submitted image. `advanceTime` remains synchronous for simulation and returns a promise for presentation completion.
- Completion timing is bounded to 120 samples. Readiness and estimated FPS include software GPU completion, so cheap CPU submission cannot masquerade as 60 FPS.
- Removed the redundant six-megapixel terrain copy/restore. Tree tapering evaluates each spline center once per ring instead of seven times; positions and topology remain identical.
- Software terrain painting uses CPU-backed Canvas2D storage to avoid competing with software WebGL. Anisotropy is one on software and remains up to four on hardware; the original atlas, nearest magnification and mipmaps are retained.
- Generated surface textures/materials are disposed during scene replacement.

## Verification

Passed during this pass: gameplay intelligence (9 groups including 29 mower-clearance approaches), quality/movement (16), Joe animation (5), pixel world/parallax (10), rendering preparation lifecycle (5), release validation (90 action fixtures; no warnings/failures).

`verify-render-queue.cjs` adds six checks: bounded submissions under a deliberately held GPU fence; latest paused camera repaint; multiple waiters; stable repeated Pause; Resume/manual advancement; and honest GPU-aware readiness/FPS reporting. The fence hold is injected only by the test.

Visual inspections include 2560×1600 opening, border and shed comparisons, 1280×720, 800×600, and 844×390 touch. The actual scene geometry/object anchors and Joe's original triangle count match the saved baseline. High-resolution comparison images and measured output are in `output/software-rendering/`; multi-viewport/parallax evidence is in `output/pixel-3d/acceptance/`.

The installed skill client completed three final iterations with 12-second pauses. Its last capture has a ready scene, 586 scene submissions, 28 course units travelled, no console-error artifact, and 56/57 readiness checks. The remaining failure is correctly `gameplay_frame_budget`: software completion averaged 87.95 ms with p95 113 ms. Screenshots were inspected; the Canvas-only client image omits the DOM HUD, which is separately visible in the full-page multi-viewport captures.

The final pixel comparisons differ by an average of 0.216/255 per channel at the opening, 0.452/255 at the border and 0.0001/255 at the shed. These averages support the visual inspection but are not a substitute for inspecting local details.

## Measurement limits and remaining work

The profiler now distinguishes scene submissions from RAF callbacks. Sixty samples per view on the RTX 3090/D3D11 path retained approximately 16.7 ms frame intervals, full 1280×720 scene rendering and shadows. Final software/SwiftShader medians were 83.3 ms at the opening and 133.3 ms at the border (about 12 and 7.5 FPS), despite approximately 16.7 ms input-loop intervals; p95 was 100.1/150.1 ms. CPU submission p95 was 1.6/1.5 ms. No additional resolution reduction or vegetation removal was used.

Startup comparisons record both the ready flag and completion of the first actual scene, using a GPU fence. The old ready flag could precede actual completion by several seconds. A shorter ready-flag time alone is not evidence of a usable frame. The final comparison uses separate browser/GPU processes for each variant: earlier same-browser comparisons allowed queued baseline movement frames to interfere with the following variant's startup, so their timing deltas are not accepted as before/after evidence. Other local browser workloads were also observed; no unrelated processes were stopped. These are short local engineering samples, not isolated hardware qualification.

Final separate-browser software comparison:

| Measurement | Baseline | Current |
| --- | ---: | ---: |
| Ready flag | 6.39 s | 12.22 s |
| First GPU-completed scene | 10.65 s | 12.52 s |
| Largest loading RAF interval | 1.03 s | 3.27 s |
| Distance during approximately 2 seconds of ordinary W input | 20.40 units | 48.40 units |

The intended speed is 24 course units/second. Input/simulation now maintain it while software rendering is busy. Startup is **not** improved in this final sample: the new driver warm-up is protected and observable, but total entry time and the loading-frame gap remain open regressions/limitations. Preparation telemetry attributes 4.38 s to pipeline warm-up across the queued jobs; it overlaps scene construction and must not be added to total startup time. The loading RAF gap has no equally long JavaScript task in the observer, so a specific driver/host cause has not been proven. Earlier short loading-gap measurements must not be advertised as the final result.

Open work: software GPU throughput, remaining driver/texture upload stalls, total first-scene startup time, and sustained lower-end device measurements. Human feedback remains prepared for later, as requested. No commit or deployment was performed.
