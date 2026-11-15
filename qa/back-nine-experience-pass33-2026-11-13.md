# Back Nine experience — pass33, 2026-11-13

Full user goal remains all38 experience requirements. Previous goal turn was a status restatement, so **no progress**; this pass implements and verifies a construction scheduling change. Human playtests remain prepared/deferred. No goal completion, commit or deployment.

## Retained implementation

`web/course-render-preparation.js` exports a scene-local cooperative construction yield. It retains short scheduler continuations but gives ordinary browser tasks a turn at a32ms scheduling target, instead of allowing a complete chain of priority continuations to postpone them. The target cannot preempt an atomic builder. Hidden-tab pause, cancellation and scheduler fallback remain supported. Shared `render-preparation.js` and other chapters are unchanged by this pass.

`web/back-nine-scene.js` uses that per-scene helper, adds boundaries between authored route/ground/hedge/alarm/equipment sections and the major scenery/vehicle builders, and preserves construction order, all authored geometry, materials, lighting and gameplay. Module URLs in Back Nine's import map use `20261113-construction-1`.

## Evidence and limits

Evidence root: `output/back-nine-experience/construction-yield/`. Source snapshots are under `baseline-source/`.

Eight fresh-process alternating baseline/candidate/candidate/baseline runs, separately for hardware/software, measured ordinary16ms timer gaps through loading. For the controlled eight-run set (excluding the earlier pilot):

| Renderer | Median of maximum timer gaps, before→after | Median ready time, before→after |
|---|---|---|
| Hardware |610.75→240.60ms|3075.5→2857.5ms|
| Software |832.60→307.10ms|5493.5→5645.5ms|

A separate real mouse-input ABBA check dispatched movement every25ms after DOMContentLoaded. Metrics are medians of two run maxima per variant, not a percentile over all input events:

| Renderer | Peak input dispatch delay | Peak RAF gap | Peak timer gap | Ready time |
|---|---|---|---|---|
| Hardware |356.85→323.70ms|394.50→337.00ms|762.95→288.40ms|3107→2805ms|
| Software |284.25→189.35ms|322.05→200.15ms|662.45→290.40ms|5555.5→6020ms|

This is a loading-responsiveness improvement with mixed total startup duration. Software ready time was slower, particularly with the input probe. Some200–350ms stalls remain. There is no in-game FPS improvement claim, no strict32ms responsiveness guarantee, no OS/driver cold-cache claim and no proof that a particular graphics editor's freezing is resolved. Initial image/model work and atomic builders remain candidates for profiling.

A separate640×360 WebGL client in its own Chromium process ran8fullscreen draws per frame throughout four hardware loading runs. All four had16.7ms frame medians and zero>50ms intervals; GPU completion maxima18.1–18.3ms. Baseline was already smooth, so this demonstrates no observed regression in this small controlled peer, not an improvement to every other app.

## Correctness / presentation

- `node tools/verify-course-construction-yield.mjs`: ordinary-task deadline, independent scene deadlines, scheduler fallback, cancellation, hidden pause/resume.
- `node tools/verify-course-preparation.mjs`: existing texture count/byte budget, large atlas isolation, cancellation and fence cleanup.
- `node tools/verify-chase-construction-browser.cjs` and `--software`: exact geometry attribute/index/instance/transform hashes and nine exact framebuffer pairs per renderer; wet lanes, visible mower/foliage and on-foot garage approach at2560×1600,1280×720,844×390. Actual forward input/pause work, resource counts stable, zero console/page errors.
- Initial comparison fixture failed because it allowed an uncontrolled live interval after clicking Start, leaving different accumulated tracks/poses. Freezing before Start and seeding the same run makes all geometry and framebuffers exact; no render tolerance or runtime behavior was weakened.
- Repeated the18view comparisons after the concurrent course edit described below. Latest261mesh hashes match per renderer. Initial274mesh proof is retained as `*-browser-before-concurrent-route-edit.json`. Programs20hardware/25software, textures40, voices12;1095uploads in the later build (1130before the separate alarm removal).
- `CHASE_QA_OUT=output/back-nine-experience/construction-yield node tools/verify-back-nine-warm-retries.cjs --from-shed` plus `--hardware`: twelve actual keyboard/button retries following deaths at the two relay regions. Same world object, uploads/textures/programs/audio/decodes; no asset requests; stale held input cleared and fresh movement works. Six software retry observations44–115ms; hardware18–57ms. These verify the **current from-shed policy**, not relay checkpoint retention.
- Installed standard gameplay client through `verify-presented-client.mjs --back-nine`, two drive/turn/brake bursts. Final page/state inspected: ready, driving, cart at(2.06,30.92), quiet banners, actual chase active, no error artifact. Latest full-page screenshot inspected. High-resolution/ordinary/compact comparison screenshots also inspected; no intended visual change.

## Investigations not adopted

Prior shader pacing probe completed: batching19programs into small scheduling slices did not show a reliable startup benefit. The separate graphics client was already smooth in both versions. `course-program-preparation.js` remains an **unused experiment**, not imported by production; measurements under `shader-startup/`.

Buffer instrumentation found the old estimate counts shared buffers repeatedly and omits instance bytes. In the observed software baseline the actual largest batch was1,954,340bytes, below2MiB;19batches,14,356,194reported vs11,973,460actual buffer bytes. No buffer-budget change retained and no claim of a reproduced oversized upload. Evidence `buffer-budget/`.

Browser-only CPU-yield prototype (`cpu-yield/`) led to the scoped implementation; shared scheduler implementation was not changed.

## Concurrent worktree changes / scope reconciliation

During this pass separate edits changed `back-nine.js` to always retry at the shed with relays/crew logs reset, removed `COURSE.alarms`, and disabled shared repair-versus-alarm utility selection/art (`utilityPad` returns-1, update clears activity). These changes were not made or reversed by this pass. Our existing default warm-retry test correctly failed checkpoint1→0 on both renderers. Added explicit `--from-shed` to test the current resource-reuse contract without changing the default checkpoint expectation. Also added an output-directory override to preserve historical artifacts.

An asynchronous user question asks which final retry policy should apply. No answer at this report's writing. Preserve the separate edits while continuing independent work. Item35 remains open and its old checkpoint-retention acceptance cannot be applied to the current build. Item13 must be reopened: previous pass31 acceptance no longer proves a working player-choice mechanism now that the utility/alarms are disabled. Do not silently replace the full38scope with the reduced current implementation. Broader mechanism/retry requirements need reconciliation with the user's final direction.

Strict current ledger:20 implemented/technically verified,17 in progress,1 human test kit prepared. Performance1 and startup/retry35 are not complete. Other remaining course/pacing/foot/landmark/darkness/shadow/beacon/audio/omen/dialogue work stays active. No human testing conducted. All owned processes terminal after verification; local server4187 retained.
