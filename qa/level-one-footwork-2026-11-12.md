# Level 1 planted movement and turning

Progress toward J1/J2/V6/X4 and latest brief item 13. Full Level 1 scope remains
active. This pass does not establish full model, animation or player acceptance.

## Change

`web/course-footwork.js` applies a reversible two-bone pose correction to Joe's
existing legs. A supporting foot holds its world position; swing remains driven
by the existing animation. Turning adds distance to the presentation gait and
uses shorter circular steps around the mower. Wheel rotation still follows real
travel. The overlay never changes navigation, collision, speed or arm grips.

The initial candidate could snap a foot back to its animated pose when a plant
became unreachable. The final version continuously projects the anchor into
reach. Startup blends capture the current foot until the walk blend settles;
stopping lowers a raised foot without moving its horizontal anchor. Rewinds and
large relocations discard obsolete anchors. Pause and duplicate presentation do
not consume animation time. Reduced motion retains the informative steps.

No geometry, textures, lights or draw calls were added. Joe and scene module
versions are `20261112-footwork`.

## Evidence

Artifacts: `output/course-footwork/`.

- `before/report.json`: real runtime skeleton driven through repeatable 3-second
  straight, stationary-turn, curved and stop trajectories at 60 Hz. The curved
  fixture accumulated 0.551 / 0.467 metres of left/right midstance foot movement.
  Stationary turning had essentially zero step lift: the flat feet rotated with
  the actor. Its old fixed phase means its reported zero midstance travel is not
  evidence of planted turning.
- `final/report.json`: ten trajectories, including both turn directions, curved
  movement, stopping from a turn, 30/60/120 Hz and reduced motion. The equivalent
  curved fixture records 0.0894 / 0.000000288 metres using the original metric,
  including startup. After the first half-second, measured horizontal travel
  across fully weighted support frames is below 0.002 metres in every case
  (observed maximum below 0.000001). Actual bone positions are measured,
  independently of the overlay's declared target. Turning lift is about 6.5 cm.
- The same probe bounds per-frame displacement, checks leg segment lengths,
  validates IK error below 0.003 m and handle error below 0.005 m, checks pause
  and repeated presentations, verifies stationary wheels stay still, and moves
  the actor to a distant location while rewinding time/distance to check reset.
  All checks pass. Reported model-update median is approximately 0.1 ms and p95
  0.2–0.3 ms on this shared host. These are CPU-only fixture timings, without an
  old-code timing baseline; they do not prove a frame-rate improvement.
- `close-push/report.json`: actual lateral dodge, warning/push/recovery, frozen
  commitment target, blocked push, appeal interruption, capture when standing
  in the path, audio targets, grips and pause remain correct. The isolated torso
  overlay still preserves foot positions and restores its bones.
- `motion/report.json`: actual acceleration, braking, bounded turning, reversal,
  terrain response and pause pass; 74 whole-course obstacle approaches reach
  their destinations with swept clearance. The presentation fixture now renders
  each movement sample rather than skipping the intervening animation history.
- Rendered recovery/pivot poses inspected at 2560×1600, movement at 1280×720
  and 390×844. 844×390 also captured. The first portrait fixture looked past Joe;
  its camera now faces his actual location so both planted legs can be reviewed.
- Installed standard-client actions and screenshots are recorded separately in
  `standard-client-final/`. State reports 56/57 readiness checks, with only
  `gameplay_frame_budget` failing. No browser errors were recorded.

### Correction: the alleged presentation discrepancy was an inspection error

The prior version of this report incorrectly described intermittent missing
HUD, phone and lighting. The five relevant `page-1`/`page-settled-1` PNG files in
`standard-client-final`, `presentation-audit` and `presentation-headed` are
byte-for-byte identical: SHA-256
`0b760bd6eade3a43e945514b6a494fda3e5367bdd31abe51352897aa1478176f`.
Decoded pixels contain 1,840 bright HUD pixels in rectangle (80,80,510,110)
and 1,559 bright phone pixels in (860,280,1000,320), in every file. Those
counts are local checks of the previously alleged missing areas, not a general
image-quality metric. Evidence: `output/course-compositor/pixel-verification.json`.

A new fixed-frame browser probe captured six raw framebuffer images, six CDP
surface images and six CDP view images. Each set is byte-identical, with stable
DOM visibility and renderer frame count. Records and PNGs are retained under
`output/course-compositor/`. A native Windows capture was attempted, but the
window tool rejected its own returned Chrome identity on refresh; no native
capture or physical-display validation is claimed. The owned browser was closed.

The assistant misread repeated image previews. These saved files do not prove
an intermittent rendering defect or a need for additional RAF waits. No runtime
workaround was made. The optional `--presentation-audit` wrapper remains useful
for recording DOM/renderer state, but its extra capture is not a repair.

## Remaining limitations

At the time of this pass, the initial walk crossfade still produced about 8.5 cm
of left-foot movement in the straight fixture. The subsequent
`qa/level-one-first-step-2026-11-12.md` pass addresses that measured startup slide
and adds short-stop/restart coverage. Neither pass establishes whole-route
emotional pacing or human animation acceptance. The full frame-budget gate
remains outstanding.

Reproduce:

```text
node tools/probe-course-footwork.cjs --out=output/course-footwork/final
node tools/verify-course-close-push.cjs --out=output/course-footwork/close-push
node tools/verify-course-mower-motion.cjs --out=output/course-footwork/motion
node tools/verify-presented-client.mjs --level-one --url http://127.0.0.1:4187 --actions-file tools/fixtures/course-arrival-input.json --iterations 2 --pause-ms 250 --screenshot-dir output/course-footwork/standard-client-final
```
