# Back Nine pass 30 — audio scheduling and rejected render candidates

Previous goal turn: no progress (roadmap restatement). This pass changes runtime audio scheduling, verifies the actual audio output and gameplay client, and rules out two unhelpful rendering candidates. Full experience scope remains active. No human playtest or whole-game frame-time improvement is claimed.

## Retained runtime change

`back-nine-audio.js` now remembers the last target and time constant for the four category buses and the master gain. These five AudioParams have exclusive ownership and no independent envelopes or cancellations. Identical requests continue the existing exponential approach instead of rescheduling it on every simulation tick. Changed volume, mute/pause, opening/death time constants and the continuously changing ending fade still schedule normally. The cache is keyed by actual AudioParam, so reopening the audio graph cannot inherit stale settings. Category entries are also constructed once instead of allocating the entries array on every update.

Music phrasing, moving machine parameters, impact/landing/damage envelopes and all twelve voices remain on their original update paths. Scene, art, geometry, pursuit, collisions and controls are unchanged. HTML audio module version: `20261112-mixer-targets-1`.

## Direct evidence

`node tools/verify-chase-mixer-targets.cjs` renders the previous and current audio modules through real OfflineAudioContexts, updating at 60 Hz with suspended render quanta. Three nine-second stereo timelines cover steady pursuit, opening/settings/mute/pause/ejection/run-over, and garage/ending fade. Settings change and restore during the same graph. Two additional real AudioContexts verify stop/reopen ownership.

| Timeline | Previous five mixer events | Current events | Maximum float sample difference |
|---|---:|---:|---:|
| Steady pursuit | 2,695 | 5 | 0.000001744 |
| Transitions and death | 2,415 | 18 | 0.000001308 |
| Transitions and ending fade | 2,415 | 137 | 0.000001308 |

The steady case removes 2,690 redundant scheduling calls over 539 updates (approximately 300 calls/second). This is a scheduling-count reduction, not a measured FPS or audio-thread-duration claim. Browser interpolation restarts cause small floating-point differences: RMS error stays below 0.000000028; a few samples cross an adjacent 16-bit quantization bin, with no difference larger than one bin. The output is not claimed bit-identical. Score and run-over state histories are identical. Allocations remain unchanged; reopened contexts each receive one initial request for all five parameters.

Other passing checks:

- `verify-chase-audio-mix.cjs`: 44 category/intro/cart/runner/defeat/settings/pause/mute/stereo cases.
- `verify-chase-score-stages.cjs`: all seven arrangements, smooth tempo transitions, warning ducking and complete-ending silence; three music voices.
- `verify-runover-audio.cjs`: one impact and one landing, pause/mute/retry behavior, no update-time audio allocations.
- `verify-chase-machine-audio.cjs`: 32 actual audio renders, direction/range/cover/windup and no update/retry allocations.
- `verify-cart-mechanics-audio.cjs`: nine speed/rate cases at 60/30/15 Hz, stopped/muted/resumed/repaired rattle behavior.
- Installed standard gameplay client via `verify-presented-client.mjs --back-nine --runner --sound-captions`: two input bursts, terminal exit 0. Full-page 1280×720 screenshot opened and inspected. Player progresses from (-22.2658,756.6087) to (-19.6410,760.4146); on-foot instructions and optional directional sound caption stay readable. 25 software programs, 40 textures, 12 voices; no error artifacts.
- Changed JS syntax checks and targeted whitespace checks pass. Runtime files are untracked in this worktree, so an explicit baseline/current comparison was also inspected rather than relying on empty git diff output.

Artifacts and original audio/HTML source: `output/back-nine-experience/audio-targets/`.

## Rendering experiments — neither deployed

Both experiments ran only through browser source routing. Current `back-nine-scene.js`, `course-pines.js` and `solid-occlusion.js` remain byte-identical to the pass-start snapshot. They are not accepted runtime optimizations.

**Solid opaque cover:** Reused conservative convex projection proof for large real closed boxes, bounded to eight occluders; optionally rejected completely hidden static pieces and whole pine bounds. Six moving views, 48 alternating pairs each, 36 framebuffer comparisons, zero differing channels. Shadow geometry remained independent. Results did not justify the extra CPU visibility work:

| View | Median ms before → candidate | p95 ms before → candidate |
|---|---|---|
| Open | 38.0 → 39.0 | 56.1 → 53.9 |
| Foliage | 52.8 → 53.8 | 70.4 → 64.9 |
| Windbreak | 50.0 → 52.8 | 58.9 → 59.4 |
| Range | 47.9 → 46.6 | 59.0 → 54.0 |
| Clubhouse | 49.0 → 48.9 | 59.8 → 58.0 |
| Garage | 35.9 → 36.0 | 39.9 → 40.8 |

`probe-chase-solid-cover.cjs` records artifacts in `solid-cover/`. Its initial route pattern accidentally intercepted `course-pines.json` as JS; corrected to an exact `.js` pathname. The failed first handle timed out; the diagnostic second handle was explicitly terminated after that confirmed error; the corrected run completed exit 0. This was a test harness defect, not a game loading regression. The final comparison invalidates the visibility cache without restoring/uploading every index; disabled baseline skips occluder projection work.

**Turf draw ordering:** Submitted opaque foreground meshes before the existing grass batches to reduce overdraw. Six moving views, 64 alternating pairs each, 48 framebuffer comparisons. Changes were tiny (6–15 channels over each view's eight comparisons), but no consistent timing gain: medians 33.1→33.3,46.5→46.1,34.2→34.9,31.4→32.0,37.9→37.6,32.4→32.6 ms; foliage p95 55.1→71.0 and garage 39.0→45.2 ms. Rejected. `probe-chase-ground-order.cjs` deliberately exits 1 on the unmet exact-image assertion; artifacts are under `ground-order/`.

These are same-view alternating completed-draw samples, not end-to-end ordinary play. Other chapter work was active on the shared machine, so absolute timings from separate runs should not be compared as a before/after. No renderer, quality, scene content or resolution change was retained.

## Remaining scope / next work

Software frame spikes and cold-start stalls remain open. Do not repeat these two candidates without new evidence. Continue the full ledger: broad route/cover/lighting/attack recognition, natural audio/dialogue/omen frequency and all-district on-foot balance. Latest roadmap item 13 also explicitly requests a mutually exclusive utility choice (such as gate power versus a diversion); existing single-use bells and partial repair do not by themselves fulfill that new refinement. It remains tracked under original ledger item 13 and must be implemented and verified rather than silently treated as already complete.

Human playtests stay prepared for later. All owned test handles are terminal; local server retained. No commit/deploy and no subagents.
