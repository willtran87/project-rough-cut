# Back Nine experience pass16 — controlled variation and run-over readability

Full38-item objective remains active. Previous goal reply was no progress: it restated the roadmap. This pass resumed pending implementation, extended its evidence and corrected a further presentation defect. No human playtesting conducted; no agents, commits or deployment.

## Controlled variation (#36)

`chase-variation.js` provides a stateless run/checkpoint/channel lookup. New rounds receive a nonzero seed; retries and reloads keep it. Missing legacy seeds migrate once without discarding checkpoint/log data. Explicit restart changes it. No render/audio/dialogue random stream affects decisions.

The seed selects initial lane/pass preference and passing side, the order of finite remembered-evidence search probes, a0/10/20m district-entry delay and0/9/17s cloud delay. Actual route clearance, visible evidence, fixed announced targets, warning duration, speed, damage, geometry and escape windows remain authoritative. Checkpoints reset local choice count and cloud clock. District encounters are conditional and not guaranteed on every seed/route. Storage-disabled sessions cannot persist any save across reload, as before.

Evidence under `output/back-nine-experience/variation/`:

- `verify-chase-variation.mjs`:64 seeds×3 checkpoints,12 profiles; both passing sides through real candidate clearance; full1.8s warning; fixed targets; no hidden-player dependence; finite valid probes; pause and checkpoint-relative atmosphere agreement. Current run exit0.
- `verify-chase-variation-routes.mjs`:64 actual live-Joe complete runs across main/east/reservoir routes and optional repair choices. Seven encounter patterns;42 cart/22 on-foot finishes; surviving cart minimum4HP;75.45–86.733s. Physical separation and bounded Joe steps checked throughout. Final session43747 exit0. An earlier four-pattern result correctly failed; bounded district eligibility was added before the passing run, rather than weakening its assertion.
- `verify-chase-variation-browser.cjs`, final hardware96467/software43579 exit0: actual input crosses each relay, actual death/retry, reload, fresh restart and legacy migration. Both checkpoints retain seed and reset local counters. Passing warnings exercised with real steering/look-back, no ordinary banner. Warm retry adds no resources:1114 buffers,20 hardware/25 software programs,40 textures; no errors.
- Inspected2560×1600,1280×720,844×390 screenshots. Standard installed gameplay client51888 exit0/two iterations: actual driving, generated nonzero seed, ready, no errors; latest page/state inspected.
- Existing sensory and district suites exit0; search remains finite and evidence-based, full original routes still complete.

## Run-over camera (#34, partial)

Current browser and simulation audit reproduced the collision/fall/overrun/defeat chain, but the old death camera hid much of the fall behind the mower. It also interpolated per-render until age0.4 then switched directly to the target. Paired camera samples differed by up to0.396m between60/30/15Hz.

`back-nine-scene.js` now captures the camera entry position once per death and interpolates from absolute simulation age. `runover-presentation.js` starts from a higher side view, then settles behind the passing mower for the aftermath. Reduced motion retains a fixed eye; shake setting still scales authored motion. No new geometry, lights, targets, textures or audio voices. No collision, movement, damage, AI or death-duration change. Versioned scene and presentation imports.

- `verify-runover-readability.cjs`: actual rear/front/side fatal contacts and relay/garage approaches; identical camera position/quaternion/FOV at matched60/30/15Hz ages; duplicate renders remain stable. Both hardware and software pass. Baseline and current scenes share current gameplay but use the saved old camera sources for the comparison.
- Actual pixel subtraction at960×540 verifies visible player geometry, rather than a visibility flag. At0.4s: rear251→847pixels, front5→63, side49→488, shelter116→959(hardware), garage251→847. At1.8s the aftermath remains about2186pixels. This is visibility evidence, not proof of human readability. **The frontal fall is still partly obscured and wider obstacle composition remains open.** Initial63-pixel result is materially limited; do not call #34 fully complete.
- `verify-chase-runover-browser.cjs`: final hardware and software exit0; actual collision, unskippable death interval, pause/resume, no input revival, fall-to-road bounds, impact/landing cues, defeat, retry reset, reduced motion,1280/844 layouts and prepared resources. Grounded model extent0.00219–0.55417m.20 hardware/25 software programs,40 textures,12 voices unchanged; no browser errors. High-resolution and smaller views inspected.
- `verify-chase-runover.mjs` exit0: rear/front/side contact, physical wreck/scenery clearance, one death event, seven heavy rams before the tested cart fails, existing retreat intervals and five-second ejection protection.
- `verify-runover-audio.cjs` exit0: one impact and one landing at0.6667s, mute/pause/retry/stale-cue handling; rendered peak0.35023, zero paused tail, same17 gains/12 filters/12 sources and no runtime node allocations. This is PCM evidence, not human listening feedback.
- Installed standard client72255 exit0/two iterations with actual fatal collision fixture. Latest page/state inspected: dying at1.7667s, physically passed mower, visible fallen player, no error artifacts. Software canvas800×450 under existing budget. No frame-rate improvement claimed.

## Rejected performance experiment (#1 remains open)

Recovered authoritative terminal state of the pending tree-box benchmark: no matching process remained; complete four-view result existed. Candidate world-space boxes submitted extra trees. Paired moving software median/p95 baseline→candidate: opening33.9/38.9→33.9/37.9ms; wet41.9/45.1→41.9/45.9; foliage49/55.8→48/53.2; clubhouse55.1/62→59/63. No new buffers, but no reliable whole-course benefit. Restored `course-pines.js` byte-for-byte to its pre-candidate snapshot and archived the candidate as `tree-bounds/rejected-course-pines.js`. No visual-equivalence claim for the rejected candidate and no FPS/startup gain claimed.

## Next work

Keep all38 requirements in the ledger. Continue frontal/obstacle run-over composition, whole-course route/cover/lighting/audio/retry acceptance, controlled omen frequency and measured software frame spikes. Human kit now includes fresh-run/retry variation and readable-failure observations for later; no participants contacted.
