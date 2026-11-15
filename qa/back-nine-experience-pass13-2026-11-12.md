# Back Nine experience pass 13 — bounded beacon submission and dialogue budget

The preceding goal response restated the improvement list without implementation progress. This pass revalidated the current files/processes, finished the pending beacon verification, and made new dialogue changes. Full 38-item scope remains active. No subagents, deployment or human testing.

## Beacon rendering

- Replaced the former nearby-cover batch submitted to every cube face with six independently compacted face index lists. They share one immutable position buffer; shadow copies no longer retain normals or UVs. Conservative finite-range and face-frustum tests preserve authored opaque cover. Only the matching list enters each face traversal.
- Uses a minimal depth-only custom point-shadow material. The vendored renderer samples native cube depth; its default radial-distance colour packing was unused. Projection multiplication order matches the original shader. The actual moving garage shutter uses the same depth material.
- Preparation proxies now forward custom depth/distance materials so the actual pipelines are prepared before control. Shadow size remains 128 pixels per face, source range 40 m, intensity 315–600 (315 steady for comfort). No visible geometry, textures, gameplay, controls, pathing or effects were removed.
- Original pass-12 implementation is retained in `output/back-nine-experience/beacon-cost/baseline-source/`. Whole-goal baseline is unchanged. Runtime cache tag is `20261112-beacon-3`.

### Evidence

- `verify-beacon-depth-equivalence.cjs`, hardware and SwiftShader: eight full-frame comparisons against full-source geometry using the original Three point-distance material, including covered/exposed views, foliage and partly/fully closing garage. **Zero differing channels** in all sixteen comparisons. Optimized submitted cover triangles range from 492 to 2,120 in these final fixtures, versus 83,064 in the deliberately unculled full-reference comparison. The latter is a correctness reference, not the previous optimized performance baseline.
- `verify-chase-beacon.mjs`: 306 independent visible-cover ray comparisons, open ends, distant relocations, moving shutter, time rewind and stationary-pulse caching pass. Each ray uses the selected cube face, not the union of all six lists.
- `verify-beacon-cost-browser.cjs`: hardware/software cover, emergence, garage and on-foot screenshots at 2560x1600,1280x720,844x390. Inspected representative high-resolution, ordinary and compact images. Covered road pixel RGB(5,16,16) equals beacon-off; disabling shadows gives (10,16,16); source emerging from cover gives (102,12,20). Rear glance restores the same result. Four flash/reduced-motion combinations pass.
- No late buffer allocations, textures or programs in those scenarios; 20 hardware / 25 software programs, 38 textures. `verify-course-preparation.mjs` passes bounded upload, cancellation, hidden-tab and GPU-fence cleanup checks.
- Installed standard client, beacon-cover fixture: real driving advances from the windbreak, Joe searches physically, 100 health, blank ordinary banner, no error artifact. Presented screenshot/state inspected. Actual buffer remained 960x540 in this run; this is not a matched proof that adaptive resolution always improves.

### Performance remains open

Final paired ABBA software test at fixed 960x540, 96 moving samples/version/section, GPU-fenced completion:

| Section | Previous median / p95 ms | Candidate median / p95 ms |
| --- | --- | --- |
| Pump | 56.5 / 65.0 | 53.0 / 64.0 |
| Range | 51.9 / 60.4 | 50.9 / 55.9 |
| Club | 58.9 / 86.6 | 63.0 / 73.0 |
| Foliage | 64.9 / 76.9 | 70.8 / 76.8 |

Submission decreases by approximately 3,000–10,000 scene triangles and up to two draw calls in these moving views, but CPU p95 is 0.1–0.3 ms higher. Earlier candidates had different mixed results. This is **not** a demonstrated general frame-time improvement; some final medians regressed. Keep requirement 1 and the beacon cost acceptance open. Do not compare these absolute timings with a different session's older baseline as a speedup claim. No overlapping owned browser benchmark was run.

## Sparse contextual dialogue

- The common dialogue gate now accepts lazy candidates. Reactions and shuffled story lines are selected only when the shared 35-second budget can actually show them. Previously a hidden selection started its own cooldown and consumed an unseen line.
- Active lazy lines stay stable through repaints, urgent messages cancel them, and they never resume after interruption. Back Nine gives longer lines proportional reading time bounded between 3.5 and 6 seconds. Initial quiet, per-context 55-second limits and eight-second event expiry remain.
- Expire old pending reactions before processing fresh evidence. An expired higher-priority event could otherwise discard a lower-priority event arriving on that frame.
- Added eight repair lines (100 unique lines in nine pools). Only real service transfers totaling at least five health, witnessed while Joe has current sight, qualify. A pending response is offered after leaving service. Relay gifts, concealed repairs and destroyed carts do not create fabricated repair knowledge. No added sound voices, geometry or simulation RNG/state mutation.
- Main entry and dialogue-related import aliases updated to `20261112-dialogue-budget`; concurrent campaign/settings and other chapters preserved.

### Dialogue verification

- `verify-chase-dialogue-budget.mjs`: shared/private cooldown interaction, no selection while blocked/disabled/paused, readable bounded duration, finite expiry, actual partial service transfers, hidden repair silence, checkpoint gift exclusion and all nine encounter exclusions pass. The first regression test exposed the expired-pending ordering bug above; corrected in runtime.
- Existing dialogue deck, reactions, quiet-message and encounter suites pass. Deck coverage includes three exhaustive cycles with reloads for every pool, unavailable/corrupt storage, stable repaint, no run mutation and no consecutive repeats. Defeat pool remains 38 distinct entries; existing 240 persisted selections pass.
- New browser integration on hardware and software verifies actual UI/deck storage, next-slot timing, objective priority, six matching contexts, nine silent encounter owners, partial-service interaction then departure line, pause cancellation, independent subtitle/sound-description settings and no ordinary ram/HP banner. All three layouts above clear the dashboard; final screenshots inspected. Program/texture counts remain unchanged and no errors were reported.
- Browser fixture initially advanced an ejection timestamp without expiring its grace; corrected the fixture. Initial repair screenshots retained a camera at the earlier staged position; reset the camera on staged relocation and recaptured. Neither fixture correction changes runtime controls or protection.
- Installed standard gameplay client after the final runtime changes: ordinary start and driving, 960x540 buffer, 25 programs/38 textures, no errors; screenshot and text state inspected.

## Remaining scope

Frame stability is unresolved. Dialogue now has concrete budget/repair improvements; full-route contextual frequency and tone still need an encounter audit, with human listening/feel assessment prepared for later. Course composition, route/landmark readability across the entire level, restrained supernatural events, connected environmental storytelling, controlled variation, broader animation/audio/retry checks and all other incomplete ledger rows retain their scope. Do not treat local screenshots or deterministic tests as human playtest results.
