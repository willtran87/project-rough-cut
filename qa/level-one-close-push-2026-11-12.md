# Level 1 committed close push and recovery

This advances J2/J5/J6 and the attack anticipation/near-miss requirements. The
complete Level 1 goal remains active. These controlled encounters do not prove
whole-route balance, human fear/fun, or satisfactory frame pacing.

## Runtime behavior

The former close-escape grace now has a 0.65-second warning, a 0.48-second
committed push, and a 0.85-second stationary recovery. The target is copied at
the warning, including a short follow-through beyond the observed position.
Hidden player relocation cannot steer the committed push. Blocking cover stops
the push into recovery instead of sending it around the obstacle. Confirmed
appeal review interrupts the sequence and retains its distraction.

The normal contact/capture rule still applies after warning: standing in the
path remains dangerous, as does walking back into Joe during recovery. The
existing eight-second safe rearm remains; dodging grants an escape opportunity,
not repeated immunity. Normal terrain and pressure modifiers remain in force.
This is not a complete acceleration/braking/turn-radius model.

Warnings, committed movement and recovery have separate directional HUD copy.
Existing engine gain/frequency targets rise through warning and push, then
settle in recovery. The user's existing sound mix still applies. No extra audio
voices are created. AudioParam measurements verify integration; no human
listening acceptance is claimed.

Joe now leans his torso into the anticipation and committed push, then eases
back during recovery. Head intent accompanies it. Two-bone arm correction
preserves the existing animated handle grips. The overlay never changes hips
or legs; the existing travel-driven gait and wheel movement remain. Saved local
bone rotations are restored before the next mixer evaluation, preventing drift
on duplicate rendering. The same semantic pose is retained in reduced motion;
there is no added camera motion or oscillation.

## Verification

- `node tools/verify-course-close-escape.mjs`: transitions at 30/60/144 Hz,
  copied target, recovery, safe rearm, interruption and bounded engine cues pass.
- `node tools/verify-course-close-push.cjs`: final process 26390 exit 0,
  eight groups and no browser errors. Actual D input dodges; Pause freezes;
  hidden-left/right paths match; blocked pushes recover; appeal interrupts;
  standing still captures; four sizes and reduced motion retain warning.
- Actual skeleton audit preserves both feet exactly, moves the head with the
  torso, restores all bone poses, and remains identical after forty repeated
  paused applications. Maximum overlay grip error in the sampled phases is
  below 0.000001 m. In the actual warning/push/recovery sequence, total error
  from the authored handle location is below 0.000014 m.
- Actual motor targets: neutral 101.66 Hz / 0.10351 gain; warning sample
  115.19 / 0.10733; push 125.66 / 0.11593; recovery 91.66 / 0.08488. These are
  controlled equal-distance fixture values, not general loudness measurements.
- `node tools/verify-predator-evidence.cjs`: process 87973 exit 0, twelve
  groups, including physical hidden-location path invariance, confirmed
  reacquisition, actual crouched escape and distraction handoff; no errors.
- `node tools/verify-encounter-refinement.cjs`: final process 33500 exit 0,
  eight groups including ordinary interactions, safe rearm/recontact capture,
  grip/pose stability and both shed/drain filing victories; no errors.
- Existing checkpoint report was revalidated: passed, five groups, no errors,
  including both continued exit outcomes. Prior process handles 43540/26712
  are missing and no matching process was live; their truncated console output
  was not treated as a new successful execution.
- Installed client through `tools/verify-presented-client.mjs`: process 22274
  exit 0, two arrival input iterations. Final page-1/state-1 inspected; mode
  `first_hole`, no error artifacts. Readiness remains 56/57: only
  `gameplay_frame_budget` fails. Completed software-scene p95 is 80.6 ms in
  this run, not acceptable 60 FPS evidence.
- Actual screenshots inspected at 2560x1600, 844x390 and 390x844; ordinary
  1280x720 captured by the encounter verifier and installed client. Close mower
  portions naturally leave the view; torso/grip/urgent instructions are visible.
  Existing portrait letterboxing remains. The fixture turns the camera after
  the dodge solely to inspect the actor; production never forces this turn.
- Syntax checks pass for game.js, joe-model.js, course-close-escape.js and
  course-push-pose.js. Cache tag is `20261112-close-push`.

Artifacts: `output/course-close-push/`, including `standard-client-final/`;
`output/predator-evidence/final/`; existing encounter/checkpoint reports.
Further body/vehicle weight, natural encounter frequency, accessibility/device
acceptance, sustained performance, final-escape staging and remaining zone/art
requirements are still open.
