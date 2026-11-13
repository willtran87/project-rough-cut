# Back Nine experience pass 10 — consequential misses and barrier rules

Full implementation goal remains active. This pass implements bounded physical consequences for missed charges (#20) and advances barrier consistency (#21). It does not finish the course, lighting, audio, variation or software-frame-spike audits. Human testing remains prepared for later, not conducted.

## Changes

- All twelve loose timber barriers now use the same player rule: drive through at speed, or keep pushing for 0.7 seconds on foot/in a slow cart. Moving away remains possible. Only the three established shortcuts retain their 0.72 speed multiplier; portable hurdles do not add a new chase-wide slowdown.
- Joe breaks rails through actual body/deck overlap, including clipping their ends. Nearby movement alone cannot shatter them. Immutable barrier footprints and broad-phase bounds are prepared once; permanent iron posts, masonry, route geometry and navigation remain authoritative.
- Six pieces per barrier share one existing material/geometry batch (72 total). Thin sagging split rails distinguish loose timber from permanent posts. Shortcut pieces no longer duplicate the solid posts. Break motion follows impact direction, settles flat above the floor and stops matrix uploads when settled. Reduced motion shows the settled result immediately.
- The existing 24-segment track pool now stamps uneven cut swaths only on suitable turf. Center/corner tests reject paths, bunkers, relay aprons, the garage floor and boundaries. Wet turf can be cut; wet paths cannot grow grass strips. A low moonlit material floor prevents black trench-like trails, without an extra shader or texture.
- Committed charges and their immediate recovery scatter a few clippings on rough ground using the existing 32-instance spray pool. Reduced motion suppresses this movement. There is no new debris physics or accumulating allocation pool.
- Timber sounds remain spatial and optional descriptive captions remain separate from the ordinary banner. Cache aliases updated to `20261112-barriers-2`.

## Verification

- `node tools/verify-chase-barriers.mjs`: 48 actual slow-push passages (12 barriers × cart/foot × both directions), bounded 0.7-second resistance, one event per passage, deck-end contact versus near miss, reverse direction, caption separation, pause and retry reset.
- The same test runs a real windup and 35.529 m locked charge. Joe breaks hurdle 6 at frame 257, misses at frame 283, and the runner increases separation from 17.852 to 26.903 m during earned relief without taking a hit. Track count stays at or below 24 and resets with the run; duplicate and paused updates do not upload matrices.
- `node tools/verify-chase-barriers-browser.cjs --software` and without `--software`: 24 pose combinations across all 72 pieces. Every vertex stays at least 0.025 m above ground; settled pieces remain below 0.091 m. Same-state updates produce zero hurdle uploads.
- Browser input holds W/D/Q to dodge, then A to resume the escape heading. No broken/missed state is injected. Joe breaks hurdle 6 during the charge and later clips shortcut 9 while pursuing. Exactly one spatial timber sound plays for each physical break; the ram-launch cue plays once. The runner survives the ten-second sequence. Screenshots cover approach, intact/breaking/settled rails and actual charge/recovery at 2560×1600, 1280×720 and 844×390. Latest screenshots were opened and inspected.
- Hardware/software respectively retain 18/23 programs, 36 textures and 12 audio voices. Buffer allocation count stays 1083 before/after both browser scenarios. No page or console errors.
- Installed gameplay client via `tools/verify-presented-client.mjs --back-nine --timber-gate`, `tools/fixtures/back-nine-timber.json`, final output `output/back-nine-experience/barriers/client-final`: ordinary movement breaks the gate once and reaches (-0.501, 92.968), with 100 health, one timber sound and a quiet banner. Screenshot/state inspected; no error artifact.
- Regressions pass: `verify-back-nine.mjs` (12 full start/checkpoint/branch routes), `verify-chase-districts.mjs` (4 live district/service comparisons), `verify-back-nine-choices.mjs` (5 cart gaps, 3 foot gaps, branches, late ejection/foot victory/retry), `verify-cart-health.mjs` (all 3 full on-foot starts complete), `verify-chase-encounter.mjs`, `verify-chase-decisions.mjs`, `verify-quiet-messages.mjs`.

## Performance evidence

`verify-chase-barriers-performance.cjs` compares the preserved pre-pass scene/track baseline with current rendering in the same software WebGL context, 960×540, ABBA order, 96 completed-GPU samples per version. These are update/render/fence-completion timings, not displayed-frame intervals or a whole-game FPS guarantee.

| Moving view | Baseline median / p95 | Current median / p95 |
|---|---|---|
| Foliage | 38.0 / 42.8 ms | 37.9 / 41.9 ms |
| Wet lane | 31.9 / 36.0 ms | 32.0 / 35.9 ms |
| Mower | 26.9 / 30.9 ms | 26.2 / 30.0 ms |
| Turf charge, valid settled wreck (`--focus=miss`) | 29.9 / 33.9 ms | 29.9 / 33.9 ms |

No runtime buffer allocations in any comparison. The turf-charge case adds one shared clipping draw (67→68), with 66,222–66,302 current triangles versus 66,120–66,146 baseline. Other views drop the inappropriate path-track draw. These results support keeping this pass; they do not resolve the remaining software spikes. An earlier full-run `miss` row used a contradictory cart/foot fixture; use `moving-miss.json` for the corrected on-foot performance evidence.

## Corrections made during verification

- Rejected applying the shortcut speed penalty to every portable hurdle: it disturbed existing full-route/district timing. The established shortcut cost remains; ordinary lightweight hurdles retain their previous fast-contact speed behavior.
- Visual review caught angled, partly floating settled rails and near-black cut turf. Final poses use local tumble followed by world yaw, settle flat and receive the same low moonlit readability as nearby turf.
- The input-driven audio test initially expected only one barrier break. Inspection proved Joe physically clips a second gate later; the final test checks exactly one sound per actual break at each sampled stage rather than assuming a total of one.
- The staged on-foot fixture initially omitted the destroyed cart's failure timestamp, making the audio system correctly treat it as a new collapse and suppress a ram cue. The fixture now represents an already-settled wreck (`failedAt: 0`). No audio safety/priority rule was weakened.

## Remaining work

Keep the full ledger active. #20 has direct simulation/browser/resource evidence; #21 still needs the broader course-wide visual category/readability audit alongside #22–27. Next useful work: composed landmarks/course districts, selective darkness and physically grounded beacon/flicker/shadow cues, with moving software measurements. Broader spatial audio, sparse dialogue/story/supernatural variation, runner/wreck/run-over audits, retry startup and complete pacing verification remain. The human kit now includes uncoached barrier expectations and whether physical misses help a player's next decision.
