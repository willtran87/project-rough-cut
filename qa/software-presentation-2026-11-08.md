# Software presentation performance — 2026-11-08

## Accepted changes

Software pixel-art gameplay presents at the existing scene target's pixel dimensions. CSS enlarges that image with nearest sampling; the DOM HUD stays at its normal display size. This avoids shading another full 1280×720 image merely to enlarge a 640×360/800×450/960×540 scene. It does not lower the world resolution, remove foliage, simplify models or change materials/effects. Canvas menus, maps and briefings restore their original 1280×720 output. Hardware and copy presentation keep their original output path.

GPU completion polling now yields for eight milliseconds between zero-timeout fence checks rather than waiting for each display refresh. The one-frame queue limit, latest-camera replacement, multiple waiters and simulation cadence are retained. Hidden documents return to RAF suspension before checking or submitting work. Completion diagnostics explicitly include timer-polling delay.

The wet mask/sheen, floodlight response, spray/ripples, mist, ghosts, dark art, movement and Joe's pathfinding are unchanged.

## Investigation

At the wet-pond view, isolated software world rendering measured about 45 ms; hiding foliage reduced it to about 22 ms. The ground itself was a small part of the cost. Increasing needle batch chunks from 10 to 30 reduced draws from 199 to 172, but measured about 46–47 ms instead of 45 ms. That experiment was rejected; no foliage batching/geometry changes are shipped.

## Measurements

`tools/profile-software-presentation.cjs` alternates reference / optimized / optimized / reference in one warmed SwiftShader process. Both use the same 640×360 scene target, stationary camera, wet effects, geometry and materials. Each block records 20 submission-to-completion samples after four warmup samples; browser scheduling is included.

| View | Reference medians, ms | Optimized medians, ms | Reference p95, ms | Optimized p95, ms |
| --- | --- | --- | --- | --- |
| Wet pond | 66.75 / 66.70 | 57.85 / 58.35 | 83.5 / 82.8 | 66.3 / 66.3 |
| Pond | 67.50 / 66.80 | 58.45 / 59.10 | 83.9 / 84.1 | 66.8 / 90.4 |
| Opening | 51.05 / 66.15 | 47.05 / 48.20 | 67.3 / 67.0 | 50.4 / 55.2 |
| Border | 66.65 / 66.85 | 55.35 / 54.85 | 68.0 / 68.1 | 66.9 / 65.6 |

Median cost improves in these samples. The ordinary pond's second optimized block still spiked: this is not elimination of all frame spikes or smooth 60 FPS software rendering.

## Verification

Evidence: `output/software-wet-performance-20261108/`. Exact source snapshots for the changed scene code and unchanged rendering modules are in `before/`; diagnostic scripts keep experiments outside production. Final verification results and remaining limitations are recorded in progress.md.

- Four scene framebuffer comparisons (wet pond, pond, opening, border) match exactly after accounting for the unchanged 2× pixel enlargement: zero changed channels. Final visual checks cover 2560×1600, 1280×720 and 844×390, with full-size Pause/Map screens and correctly anchored DOM HUD.
- Output dimensions follow all existing adaptive steps and a custom resolution; CSS dimensions remain unchanged. Repeated changes do not grow texture counts after the existing custom-resolution target initializes. Programs stay stable.
- Queue checks pass: hidden document suspension, one in-flight scene, latest camera during Pause, multiple waiters, frozen Pause, resume and honest GPU-completion readiness reporting. The queue test deliberately holds the GPU and hides the document, so its synthetic delay is not a throughput benchmark.
- Wet lifecycle and screen-fracture checks pass on SwiftShader with 61 programs / 96 textures, no first-event growth, steady Reduced Motion, Pause, density zero, water expiry and drain unlock retained. Fracture remains confined to its intended region and clears without residue.
- Gameplay intelligence passes nine groups, including 29 mower-clearance approaches, evidence-led pursuit/search and animation continuity. Release verification passes 90 scenarios; image downloads remain 56 / 20.8 MB. Frame-budget controller checks pass.
- Source snapshots confirm no changes to foliage, tree generation, terrain materials, wet-ground or sprinkler modules. Runtime edits are confined to scene presentation plus the HTML cache revision.
- Installed standard software client passes two iterations: ready first-hole state, 14 units moved, no error artifacts and inspected full-page screenshot. Last 120 completion samples average 59.43 ms with 67.9 ms p95 at 800×450 scene/output. This unpaired smoke test supports functional operation; the alternating measurements above are the performance comparison. Test browsers are closed and the local server remains on 4187. Human playtests remain deferred.
