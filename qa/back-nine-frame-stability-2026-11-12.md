# Back Nine frame stability — 2026-11-12

Implemented two bounded performance fixes while retaining the chase-drama implementation. This pass improves adaptation and removes redundant UI work; it does **not** eliminate the software rasterizer's heavy-view cost.

## Changes

- Shared software resolution controller now estimates the next resolution's pixel cost before raising quality. Requires 60 qualifying frames with projected cost below 48 ms, leaving headroom below the existing 60 ms overload threshold. The existing 960×540, 800×450 and 640×360 levels, startup grace and resize cooldowns remain.
- Overload evidence decays by one on a faster frame instead of resetting completely. Sustained mixed load can trigger adaptation; isolated slow frames still cancel out. Hardware rendering is unaffected.
- Back Nine HUD writes its guide, defeat, reduced-motion and cart-condition attributes only when their values change.
- Versioned the changed imports/entry points for refreshes. Level 1 also uses the corrected shared budget and passed a standard-client smoke test.

## Evidence

`output/chase-render-followup/` contains the original source snapshot, comparisons, screenshots and logs.

**Controller regression, synthetic workload (not measured GPU FPS):** 900 completion samples with costs of 90 / 62.5 / 40 ms at the three resolutions. Old controller changed resolution 13 times and spent 396 samples over 60 ms. New controller changes twice, settles at the affordable level, and spends 46 samples over 60 ms. After load falls it returns to 960×540. Tests also cover mixed load, isolated stalls, cold samples, cooldowns, invalid samples and unchanged maximum quality for affordable scenes.

**Browser integration:** injected completion samples drive the actual canvas to 640×360 and back to 960×540 without modifying simulation state, compiling additional shaders or adding textures. This tests wiring, not GPU throughput.

**HUD comparison:** identical 180-step simulation and identical final HUD markup. Redundant data-attribute writes fall from 720 to 0. Genuine opacity updates remain. UI p95 was about 0.4–0.5 ms in these short runs; no substantial overall FPS gain is claimed from this small cleanup.

**Fixed-resolution SwiftShader comparison:** 960×540, GPU fences, 48 samples/version/view in ABBA order. Clouds frozen equally, reduced motion enabled. Final scene render sources are byte-identical to the starting snapshot.

| View | Median before / after | p95 before / after |
|---|---:|---:|
| Wet lanes and visible mower | 44.0 / 44.1 ms | 48.0 / 49.0 ms |
| Runner and foliage | 36.1 / 36.9 ms | 42.0 / 40.1 ms |
| Clubhouse | 33.1 / 33.9 ms | 38.1 / 37.9 ms |

All three pixel buffers are exactly identical, with no runtime `bufferData` allocations. These differences are timing variation, not an intrinsic rendering speedup. The isolated benchmark's HUD belongs to its setup run; its world is posed separately for comparison.

**Fresh startup:** ABBA browser runs: baseline 4287 / 4415 ms; current 4489 / 4467 ms. Mean 4351 → 4478 ms; no startup-speed improvement claimed. Same 23 standalone software programs, 36 textures, 17 geometry-preparation batches and 23 texture-preparation batches.

## Preservation checks

Passed:

- `verify-software-frame-budget.cjs`, `verify-chase-hud-pacing.cjs`, `verify-chase-render-followup.cjs --focus`, `verify-chase-render-startup.cjs`.
- `verify-chase-drama.mjs`, `verify-runner-controls.mjs`, `verify-chase-score.cjs`: longer warned charges/recovery, steering and collision sliding, protected ejection, comfort lighting, three persistent music voices and mute/pause behavior.
- `verify-cart-ejection.cjs --software`: seat alignment, side-dependent fall, landing/get-up, pause, early movement recovery, reduced motion, no first-use geometry allocation. Same 23 programs / 36 textures, zero browser errors.
- `verify-chase-drama-browser.cjs`: adaptive score with 12 total voices, saved music/reduced-motion settings, optional sound captions, hidden initial on-foot twist and revealed failure guidance.
- `verify-back-nine.mjs`: 12 route/checkpoint scenarios. `verify-cart-health.mjs`: all three on-foot starts complete with live Joe. `verify-back-nine-choices.mjs`: cart/foot gaps, real late fatal ram → protected ejection → foot gap → garage, intact route behavior and retry.
- Installed standard Playwright client: Back Nine on-foot input bursts and Level 1 start/movement smoke test. Screenshots inspected.

Inspected screenshots at 2560×1600, 1280×720 and 844×390; guide suite also checked 390×844. The dark sky, foliage, wet ground, beacon, vehicle detail and ejection pose remain. Gameplay rendering, audio, simulation, pathing and model source files were restored/retained byte-for-byte from this task's starting snapshot.

## Rejected experiments and remaining limits

Tree lighting splits, per-fragment light cutoffs, larger static batches, ground draw reordering, squared-distance lighting, per-light shader subsets and a terrain depth prepass did not show reliable gains. They were removed; diagnostic evidence remains in `discarded-*.json`. Do not repeat these experiments without a new reason.

Visible terrain, foliage and the detailed mower still consume substantial software rasterization time. This pass prevents one source of resolution pumping and wasted HUD writes; it does not promise 60 FPS or remove every frame spike. Human assessment of chase feel, darkness and music remains deferred for later playtesting.

Local play: http://127.0.0.1:4187/back-nine.html — refresh existing tabs.
