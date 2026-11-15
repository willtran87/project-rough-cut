# Level 1 first-step animation

Further progress toward J1/J2/V6/X4 and item 13 of the latest 60-item brief.
The full scope remains active; whole-route acting and human acceptance are open.

## Implementation

Joe now starts with a lifted step from his actual stopped pose. Forward motion
frees the rear foot first. A stationary turn instead frees the foot whose leg
would reach its limit first as the hips turn. The other foot stays planted until
its own short swing. The initial steps join the normal gait through a planted
landing, avoiding a jump back to the partially blended animation pose.

Stopping during the first step captures the actual foot position before lowering
it. Subsequent starts select the supporting foot again. The overlay remains
reversible, follows presentation time, and preserves existing torso/head motion,
hand grips and travel-driven wheel rotation. No navigation, collision, chase
speed, geometry, texture, light or rendering-quality changes were made.

Also corrected the reach guard: its shin length must be measured from the actual
animated ankle, before modifying the desired foot position. Measuring to a
circular-step target could incorrectly shorten the allowed reach and move a
planted foot during a turn.

Cache versions for the footwork, Joe and scene modules are
`20261112-first-step`.

## Verification

Artifacts: `output/course-first-step/`. Prior source preserved in `before/`.

- `verified/report.json` passes 14 actual-skeleton scenarios: straight, curve,
  stationary turn, opposite turn/curve, stopping, stopping from a turn, 30/120 Hz
  turning, reduced motion, a 0.1-second start/stop, repeated starts, quick restart
  and repeated turning starts. The early first step is additionally presented
  12 times paused and 12 times at duplicate time, with zero position change.
- The earlier straight-start fixture accumulated 0.0845 m of left midstance
  travel. The same metric now records less than 0.000001 m for either foot in
  every tested scenario, including startup. Fully weighted support drift is
  below 0.000001 m, measured from actual bone positions. The probe also bounds
  per-frame motion and verifies unchanged segment lengths, reachable targets,
  grip error under 0.005 m, stationary wheels, time/distance rewind and relocation.
  A short interrupted step correctly leaves the other foot on the ground; its
  lift assertion explicitly tests that case instead of requiring two steps.
- Model-update CPU p95 was approximately 0.2 ms on this shared host. This is not
  a GPU/frame-rate result or an isolated performance comparison.
- `close-push/report.json` passes actual dodge/capture, locked commitment target,
  recovery, blocked push, appeal interruption, grip, audio and pause checks.
- `motion-centered/report.json` passes acceleration, braking, reversal, terrain
  response and 74 swept obstacle approaches. Its initial fixture settles Joe
  before starting, and capture cameras now face Joe throughout the sequence.
- Startup inspected at 2560×1600; movement inspected at 1280×720 and 390×844.
  844×390 was also captured. The initial off-centre screenshot is retained in
  `motion/`; the centred set is the useful animation-review evidence.
- Installed standard client: two ordinary-input bursts, no errors, inspected
  `standard-client/page-1.png`, mode `first_hole`, player x=13. Readiness remains
  56/57, with `gameplay_frame_budget` failing. Syntax checks pass.

The first candidate exposed a turn-stop reach error and a turn-start transition
pop. Those were fixed, not waived. Repeated-turn testing then exposed poor choice
of the first supporting foot; the predicted-turn reach selection fixes it. Failed
candidate reports remain in `first/`, `second/` and `stress/`.

## Correction to the preceding pass

The earlier reported intermittent missing HUD/phone was an assistant inspection
error. The allegedly different files are byte-identical and contain the relevant
pixels. The prior footwork QA now records hashes, decoded-pixel checks and new
fixed-frame capture evidence. No renderer workaround was introduced. Native
Windows capture could not bind the test browser; it is not counted as evidence.

The tested startup slide is addressed. This does not establish flawless animation
in every encounter, full character-model parity, human fear/fun acceptance or the
outstanding frame budget.
