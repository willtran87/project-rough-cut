# Encounter timing and feedback follow-up

This supersedes the cart timer's delayed/jammed behavior described in the first encounter pass.

## Changes

- Cart timers now have a four-second fuse and a six-second ringing window measured in simulation time. The bell sounds on schedule, including during a chase. Joe only investigates if direct contact, another lure and protected commitments have cleared; a late response uses the remaining ring time instead of starting another six seconds. A new ball lure remains authoritative after the timer has attracted him once.
- A timer ignored for its whole window becomes available again. Its result is reported after the player reaches safety. Winning-run summaries credit actual attraction, not merely sounding the bell. Repeated Use while the dial is running no longer gives an incorrect out-of-reach message.
- Nearby prompts show the countdown or current ringing state. The dial has a steady active indicator and a small ringing movement; Reduced Motion keeps it still. Status requests and required interactions retain priority.
- Bells, paper and desk sounds use camera-relative stereo and bounded distance attenuation. The timer sounds at most three short pulses per activation. New panned tone nodes disconnect when they finish; no persistent audio voices are added.
- Objective replies wait until the original station signal has ended. Distant investigation/search of old evidence no longer blocks them solely because an encounter flag or residual suspicion remains. They require two seconds with Joe beyond 110 course units, no sight, suspicion below .5, no chase and no protected player action. Important captions, the shared accent budget and recovery periods retain priority. Stale/out-of-range sounds are discarded; physical traces persist.

## Verification

- Pure timing checks pass at 20, 60 and 144 Hz, including frame overshoot, zero-time pause and expiry. Stereo calculations reverse correctly when facing the opposite way.
- Hardware/software browser checks exercise actual E winding, timing, inspection, chase/lure priority, late attraction, refund, pause, countdown/ringing presentation, status-request priority, distant-search aftermaths, near-danger and interaction protections, shelter/finale/capture regressions and bounded instancing. Offline rendered audio verifies left/right reversal, bounded peaks and silence after cues end.
- Normal-input shed and drain runs win with live Joe and normal pressure. A further shed run with a brief ordinary crouched listening stop also wins and records the release aftermath at 57.1 seconds. No actor/objective state is written by those route runs. Quiet cues remain conditional; fast or continuously threatened runs need not hear every reply.
- Visual checks include 2560×1600, 1280×720 and 844×390. The installed normal-input client verifies ordinary startup and movement. Objective gates, existing tension-director checks and release validation are retained in the acceptance pass.

Evidence lives under `output/encounter-followup-20261108/`. `--encounter-audit` on the route runner records read-only scheduling diagnostics for later pacing review. Human tests remain prepared for later; no fun/suspense ratings or resolved historical software-rendering stalls are asserted. No geometry, draw call, texture or light was added by this follow-up.
