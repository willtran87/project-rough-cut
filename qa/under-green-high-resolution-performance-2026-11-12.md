# Under the Green — high-resolution sustained performance

This pass addresses review 40 and the performance portion of 41. It measures the current signal fixtures and 16-voice audio graph through the production frame loop. It does not change gameplay or establish human/device acceptance.

Follow-up: the later piece-culling and adaptive-resolution pass now meets the defined warmed software budget. See `qa/under-green-piece-culling-2026-11-12.md`. The failures below remain historical evidence and are not overwritten by that result.

## Workload and acceptance

Both runs request a 2560×1600 viewport, 85° vertical field of view and resolution preference 1. The existing renderer caps remain in effect: hardware renders at 1600×1000; software can adapt beneath a 960×600 ceiling. This is not native 2560×1600 scene rendering.

The profiler now accepts explicit viewport/FOV/resolution arguments and records actual values in every sample. The analyzer checks viewport, preferences, camera FOV, renderer scale and scene resolution. A successful result cannot silently come from the default smaller view.

Five-minute runs execute sequentially, using verified dry, wet, sprint and checkpoint-3 input tapes through the ordinary real-time simulation, renderer, audio and HUD. Joe remains live. These map-aware tapes are engineering fixtures, not first-time player sessions. First-use uploads remain in the report; resource comparisons begin after a complete traversal. Post-GC heap samples exclude collection gaps from RAF statistics.

Thresholds were specified before measurement in `design/under-green-performance-budget.md`: every warmed hardware window ≥55 render submissions/s and RAF p95 ≤17.5 ms; software ≥24 submissions/s and RAF p95 ≤33.4 ms, with at most one outstanding GPU frame. Resources must stabilize, audio remain at 16 voices, heap growth stay below 5 MiB, and all four scenarios finish with unchanged outcomes.

## Results

Hardware completed 300.06 seconds, all four scenarios, with 59.98 warmed render submissions/s and 16.7 ms RAF p95. Every window passed. Actual scene dimensions were 1600×1000. Geometry/texture/program counts stabilized at 280/55/21; audio remained at 16 voices. Retained heap changed by −489,040 bytes. No context loss, runtime errors or route divergence occurred. The final full-page gameplay screenshot was inspected: the keeper crossing, physical signal, destination and HUD are present.

The initial software measurement completed all four routes and passed stability checks, but **failed the frame-rate budget**. Its warmed average was 24.39 submissions/s; the two slowest windows were 15.88 and 15.75 submissions/s. RAF p95 remained 16.7 ms because responsive browser callbacks do not imply completed scene frames. The scene adapted to 640×400. Resources remained 280/55/21 and 16 voices; retained heap changed by −294,668 bytes. The full-page software screenshot was inspected. It preserves the crossing, signal and native HUD, but the world text is coarser than hardware.

The initial failed samples and analyzer failure remain in this directory. The shader candidate measured separately at `output/under-green/finite-lights/soak` also **failed**: 23.42 warmed submissions/s overall, with a minimum window of 18.02. All four routes and all stability checks passed; retained heap changed by −303,116 bytes. The candidate has been removed from the playable scene.

## Diagnosis and candidate

Fixed-view probes at 640×400 show median CPU submission around 2.5–4.5 ms and GPU completion around 52–57 ms. Diagnostic removal of the background or water does not materially improve the three sampled views. Removing point lights reduces completion to 29–35 ms, identifying local-light shading as a substantial cost; the light-removal variant is not a playable candidate.

The experimental candidate preserves every light, range, material and scene pixel. For software rendering, the Lambert shader returns zero before evaluating general falloff when a fragment is already at or beyond a finite light's cutoff. Unlimited lights and illuminated fragments retain the original expression. The helper is idempotent per material and handles cloned materials without copied ownership flags. It is retained only at `tools/fixtures/under-green-finite-light-candidate.js` and served by the diagnostic tools; runtime code does not import it.

Candidate fixed-view medians are 45 ms roots, 42 ms bunker and 34 ms range, versus 52.1/57/55 ms stock. These short probes support the next sustained experiment; they do not replace its budget gate. See `output/under-green/high-resolution-diagnosis/`.

Pixel equality passes 48 distance/cutoff/decay cases on each renderer, plus three actual chapter views at 2560×1600. Hardware scene comparisons are 1600×1000; software comparisons use 960×600. All final comparisons report zero changed bytes. The initial chapter comparator replaced material objects and changed sorting at overlapping surfaces; the corrected comparator switches shader hooks on the same material identities. That fixture correction is not a runtime visual fix. See `tools/verify-under-green-finite-lights.cjs` and `output/under-green/finite-lights/`.

A stronger same-context ABBA comparison (stock/candidate/candidate/stock, 16 samples per block after four warmups) did **not** confirm the earlier apparent gain. At 960×600, median stock versus candidate ranges were 57–58.9 versus 57–59 ms in roots, 50.9–52 versus 52.1–52.9 ms in bunker, and 43.1–45.2 versus 45–48.9 ms in range. The separate-process short probes were insufficient evidence to ship this optimization. Both failed long runs and the contradictory short results remain available; no threshold or visual-quality floor was lowered.

The profiling tool's stale scene instrumentation marker was repaired with explicit assertions. It now accepts viewport/FOV/output options and named diagnostic variants. The next performance change should be based on matched measurements of the remaining lighting/scene cost and then meet the unchanged real-time route budget. Do not repeat the rejected finite-cutoff candidate based only on its earlier short result.

After restoring the original runtime shader, the installed standard web-game client completed two ordinary forward-movement bursts. Final state: ready/playing at 7.03 seconds, lesson crossed, zero water hits. The final gameplay screenshot was inspected. The diagnostic fixture still passes hardware pixel-equality checks after moving out of `web/`. No experimental shader remains imported by the playable scene.

## Reproduction and evidence

Run sequentially against the local server at port 4187:

```powershell
node tools/profile-under-green-soak.cjs --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/high-resolution-soak
node tools/analyze-under-green-soak.cjs --output=output/under-green/high-resolution-soak
node tools/profile-under-green-soak.cjs --software --seconds=300 --viewport=2560x1600 --fov=85 --resolution=1 --output=output/under-green/high-resolution-soak
node tools/analyze-under-green-soak.cjs --software --output=output/under-green/high-resolution-soak
```

Raw samples, analysis and full-page images are retained under `output/under-green/high-resolution-soak/`.

## Limits and remaining requirements

Local RTX 3090 and SwiftShader evidence cannot qualify physical integrated GPUs or phones. RAF and render submission rates do not measure display latency; renderer counts and JS heap do not measure VRAM. Five minutes cannot establish hour-long stability or thermal behavior. Cold loading, other display/aspect combinations, real controller/touch ergonomics, unfamiliar-player comprehension and listening remain separate acceptance work.

Review 41 also still needs broader mandatory-crossing phase × approach-speed × legitimate Joe-distance coverage. Existing first-spillway route comparisons and range phase checks do not prove that matrix for every required crossing. This performance pass does not close that gameplay requirement.
