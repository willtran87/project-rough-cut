# Chase software-rendering follow-up — 2026-11-09

The retained changes remove invisible rider submissions and avoid unnecessary HUD/layout work. Pixel art, course details, panic/ram effects, audio, resolution policy and simulation behavior remain intact.

## Changes

- The mower has a conservative whole-model frustum bound: radius 6 m centered 2 m above its root. This includes the seated, skinned Joe, folding decks and recoil. Twelve measured poses have maximum vertex radius 3.576 m. Animation and AI still update while hidden, and the mower headlights/audio remain active. Forward and rear-view transitions are checked.
- Unchanged HUD text nodes, visibility and classes are preserved. Caption priorities resolve before one DOM write. ResizeObserver supplies the actual canvas aspect without forced layout reads in the frame loop; projection updates only on aspect changes.
- Entry-point cache version is `20261109-chase-throughput`.

## Evidence

Sequential SwiftShader tests, fixed 960×540 render target, same renderer for the paired scene comparison. Each static view uses ABBA order with 24 measured frames per block. Timings include frame completion, not only JavaScript submission.

| View | Baseline median pair (ms) | Current median pair (ms) | Draws before → after |
| --- | --- | --- | --- |
| Wet lane | 47.6 / 47.3 | 44.0 / 45.4 | 75 → 66 |
| Range | 40.8 / 41.0 | 38.4 / 37.8 | 92 → 83 |
| Foliage/rear | 49.1 / 49.7 | 48.9 / 49.0 | 112 → 112 |
| Visible mower | 35.9 / 37.1 | 37.8 / 35.7 | 87 → 87 |

The rejected offscreen rider accounts for 18,970 submitted triangles per affected frame. All 17 image comparisons are pixel-identical, including turns, course edges, rear view, wet effects and the finale. They use a frozen cloud clock to avoid unrelated drift. No new GPU buffers are allocated by changing views. The UI in these isolated scene screenshots remains the setup UI; actual HUD behavior is separately tested below.

A 120-frame moving replay (three fixed simulation steps per presentation) produced identical complete simulation state before/after, with HUD mutations 1,126 → 85, canvas layout reads 240 → 0 and browser layout count 120 → 72. Five repeated unchanged frames produce zero HUD mutations. Moving median was 33.3 → 32.1 ms and p95 43.8 → 42.3 ms. Maximum 110.7 → 47.7 ms is a single observed pair, not a worst-case guarantee. CPU timing tests were rerun without overlapping simulation tests.

Still 16 shader programs, 34 textures, two local lights, nine audio voices and 16 paced preparation batches; maximum batch 2,094,984 bytes. No new startup or stable-60-FPS claim. Visible foliage/full-mower software rasterization spikes remain.

## Verification

- `node tools/verify-chase-throughput.cjs` — paired images/resources/timings; `--skip-timing` reruns pixel comparisons and records per-scene stats immediately after each draw.
- `node tools/verify-chase-presentation.cjs` — actual driving/HUD mutations/layout metrics and exact complete simulation-state equality.
- `node tools/verify-mower-visibility.cjs` — animated rendered-vertex bounds and forward/rear visibility.
- `node tools/verify-chase-panic-browser.cjs --software` — actual-drive panic activation, pause, recovery, finale, wet spray, Reduced Motion and resource caps.
- `node tools/verify-back-nine-browser.cjs` — hardware keyboard/controller/touch, save/reload, retry, garage finish, fullscreen and resource stability.
- `node tools/verify-chase-panic.mjs`, `verify-course-navigation.mjs`, `verify-mower-ram.mjs`, `verify-back-nine.mjs`, `verify-back-nine-decoys.mjs` — panic protections, 68 exact routes/4,069 identical chase frames, five escape windows, six victories and all three alarms.
- `node tools/verify-vehicle-contact-browser.cjs` — six solid-contact scenarios, rendered hull containment, impact HUD/captions/sparks and Reduced Motion; passes without errors.
- Installed standard web-game client: two input bursts; latest screenshot and state inspected, no error files. Visual inspection at 2560×1600, 1280×720 and 844×390. Human feel testing remains deferred per user preference.

Evidence is under `output/chase-throughput/`, with panic/browser regression artifacts under their existing output directories. Comparison scripts use the session baseline files in `output/chase-throughput/baseline-source/`; preserve these when rerunning comparisons. `visual-comparison.json` contains per-scene triangle counts; the earlier `comparison.json` shares renderer counters at final read and should be used for timings/cached draw counts only.

## Discarded experiment

Stencil masking the background after the opaque course preserved every compared pixel, but its extra stencil work did not reliably improve software timings. The production renderer retains its original background drawing order and context attributes. Results remain in `discarded-stencil.json` for reference; do not reintroduce it as a proven optimization.
