# Back Nine experience — pass 7, 2026-11-12

The full 38-item goal remains active. This pass improves runner footing and automatic-camera framing, and rejects an unproven foliage optimization. Human playtests remain prepared for later; none were conducted.

## Runtime changes

- `runner-gait.js` generates a distance-driven stance/swing cycle. Planted targets stay in course space while the body moves and turns; pelvis height absorbs a longer restart step. Stops settle toward the idle pose, turns in place use smaller steps, and reversing retains the steering heading.
- `chase-runner.js` solves the existing thigh/shin chain toward those targets. The original boot meshes now have an ankle pivot so soles can stay level during contact and lift during swing. Arm swing follows the opposite leg action. The original pixel maps, material batches and vertex counts remain.
- The same-time pose is stable, including torso roll. Model updates do not mutate the simulation. Existing ejection bracing blends through the new ankle/leg pose; death and seated poses retain their original joint arrangement.
- The automatic on-foot camera aims through chest height at a distance appropriate to its proximity to the actor. The stale fixed mouse-look pitch could crop the legs near the wreck. Eye height eases from 2.7m near the wreck to 3.3m on open ground, preserving a visible horizon and the existing sweep, shelter ceiling and look-back behavior. No mouse-look control was introduced.
- Import versions refreshed for the runner and scene. Shared chapter files and game physics/pathing were not changed.

## Evidence

`tools/verify-runner-gait.cjs`, hardware and SwiftShader:

- 1,890 poses per version across 60/30/15 updates per second: forward, reverse, arcs, turn in place, stop/restart and reduced motion.
- New model: 477 consecutive planted-foot samples; maximum sole-center movement 0.004m (a small turn around the planted ankle), target error below 0.000001m, minimum sampled rendered sole height 0.0135m. Duplicate same-time renders have zero position difference.
- Mean near-floor horizontal travel in the matched straight-run samples: 0.157m/frame before, 0.0517m/frame after (about 67% lower). This metric includes landing/lift transitions and is not a claim that all foot motion has disappeared.
- Five actual simulation scenarios, 180 steps each: fence sliding, a foot gap, reverse turning, stop/restart and look-back. All targets remain reachable, soles stay above the floor, model heading stays within 15 degrees of the steering/travel heading, and serialized simulation state is unchanged by the renderer.
- Both versions have 24 animated meshes and 26,754 vertices. No additional draw is needed for the ankle pivots.
- Whole-character projection checks and screenshots near the wreck and on the open course, plus front/side/gameplay views at 2560x1600, 1280x720 and 844x390. Screenshots inspected; final follow-camera framing checked on hardware and in the software gameplay client.

Passed regression checks:

- `verify-cart-ejection.cjs --software`: both release sides, rotated seat, continuous joint/ground checks, actual fatal impact, landing cue, protected control return, pause, reduced motion, enlarged captions and three viewports. 23 programs, 36 textures, 12 audio voices; no runtime buffer allocation. Repeated after the final camera height change.
- `verify-runner-steering-browser.cjs`: automatic camera, no mouse/touch/right-stick capture, forward/reverse/turning, look-back, guide and on-foot garage victory.
- `verify-back-nine.mjs`, `verify-cart-health.mjs`, `verify-back-nine-choices.mjs`, `verify-runner-controls.mjs`, `verify-chase-drama.mjs`, `verify-chase-camera.mjs`: full routes/checkpoints, all three foot starts, late actual destruction through a foot gap to victory, intact driving options, collision/escape contracts and shelter camera limits.
- Installed gameplay client through `verify-presented-client.mjs`, with actual `up`/`left` input bursts: the runner moves from the wreck toward the service approach. Latest `client-final/page-1.png` and state inspected, no errors; 23 programs/36 textures. An initial exploratory client invocation used unsupported `w` input and only turned; it was corrected and is not counted as movement verification.
- Syntax and scoped whitespace checks pass.

## Fixed-view rendering cost of the runner/camera change

`verify-runner-gait-performance.cjs`: SwiftShader960x540, GPU fences,48 samples/version/view in ABBA order, matched frozen clouds/reduced motion. This measures fixed views, not a moving chase soak.

| View | Median before / after | p95 before / after | Draws before / after |
|---|---:|---:|---:|
| Driving control |48.0 /46.0ms|70.1 /56.0ms|124 /124|
| Runner /foliage |54.0 /46.0ms|71.9 /63.9ms|75 /75|
| Runner near wreck |33.1 /43.1ms|49.9 /59.0ms|82 /93|
| Runner open course |42.9 /47.1ms|50.2 /53.0ms|100 /99|

Driving pixels are exactly identical; no first-use geometry upload occurs in any view. Camera framing intentionally changes on-foot pixels. The better full-body view near the wreck exposes more scenery and was costlier in this run. This is an outstanding performance concern, not a claimed optimization; repeat moving measurements and address the visible-terrain cost while retaining the corrected framing. CPU update p95 stayed at0.5–0.7ms in this short test. The full performance requirement remains open.

## Rejected foliage experiment

Software-only precomputed texture tone attempted to replace a per-fragment power calculation. The first comparison was mixed; a fresh ABBA repeat at 960x540 was still inconsistent:

| Fixed view | Median baseline / candidate | p95 baseline / candidate |
|---|---:|---:|
| Wet ground / mower | 50.0 / 59.1ms | 64.3 / 77.0ms |
| Runner / foliage | 44.0 / 39.9ms | 68.0 / 53.0ms |
| Clubhouse | 53.1 / 49.8ms | 76.0 / 66.5ms |

The candidate also required startup canvas pixel processing and introduced small texture-rounding differences. It was removed. `web/course-pines.js` is byte-identical to the pass baseline. The discarded source and measured repeat remain under `output/back-nine-experience/pine-tone/`. No performance improvement is claimed from this experiment.

## Remaining work

The software rasterizer's worst moving foliage/wet/mower spikes remain open. Full-course motion/pacing, broad barrier and wreck-placement audits, vehicle damage/impact/wobble, course composition/landmarks/darkness/lighting, directional sound and restrained variation/dialogue remain in the full ledger. The old footstep oscillator still uses time multiplied by speed; tie its timing to actual contacts in the survival-audio pass, without adding voices or compromising warning clarity. Human feel/listening/balance feedback remains deferred.

Artifacts: `output/back-nine-experience/runner-gait/`, `output/back-nine-chase-drama/ejection/`, `output/runner-steering/`. Baselines were preserved before editing.
