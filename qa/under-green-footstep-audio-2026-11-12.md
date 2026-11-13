# Under the Green — contact-driven footstep audio

Joe's footstep cues now follow the rendered shoe contacts, including turns and settling. The earlier `floor(walk / .78)` audio counter did not match the two feet in the walking animation and ignored stationary turns entirely. The simulation's path, speed, attacks and hearing rules are unchanged.

`web/foot-contact-events.js` arms a foot after its sole rises above 18 mm and emits a landing when it falls to 8 mm or below. Hysteresis prevents floor jitter from producing repeated taps. The actor supplies the cached shoe geometry's transformed lower extent and actual world position. Events are bounded, owned by the current run and consumed once after a pose is drawn. They do not accumulate while a GPU frame is skipped. Duplicate renders, paused/hidden actors, new runs, position/time discontinuities and long jumps cannot manufacture or replay a landing.

The audio consumer checks event ownership and current time, drops muted/paused contacts and deduplicates repeated delivery. Left and right feet have independent bounded envelopes so a simultaneous landing cannot cancel the other foot's cue. Both use existing spatial attenuation, stereo orientation, occlusion, Listening Focus and campaign volume controls. Total persistent voices increased from eight to nine. The per-step envelope is shorter and lower than the old single distance pulse; perceptual mix acceptance still requires listening.

Verification:

- `node tools/verify-foot-contact-events.mjs`: two-foot lift/landing, jitter hysteresis, duplicate consumption, pause at unchanged simulation time, new run, teleport, rewind and long-gap suppression pass.
- `node tools/verify-under-green-footstep-audio.cjs`: each contact detected in nine staged walking/turning/stopping trajectories at 60/30/15 presentation updates per second produces exactly one cue. Duplicate draws produce none. Idle, pause/resume, mute/unmute and a fresh run remain silent until a new contact. An ordinary simulated pursuit produces eleven contact cues. A separate real Web Audio check confirms two simultaneous contacts retain independent nonzero envelopes, replayed event objects do not increment the count, and pause cancels both envelopes. AudioParam inspection waits for an audio processing quantum rather than assuming scheduled gain is immediately reflected in `.value`.
- `node tools/verify-under-green-audio-aftermath.cjs`: Listening Focus, water positioning, door/starter, pause cancellation and the playable secured-gate aftermath pass. The footsteps portion now advances through presented frames; a single one-second time jump cannot establish visible contact synchronization.
- `node tools/verify-under-green-footwork.cjs`: all 1,890 pose samples, 318 actual floor samples and duplicate-render checks pass. Diagnostic sole heights are rounded to nanometres to avoid treating insignificant floating-point recomputation as a changed pose; physical geometry is not rounded.
- `node tools/verify-under-green-trimmer.cjs`: 72 poses and 90 duplicate renders retain hand grips and authoritative blade endpoints.
- Required standard client completed two movement bursts after the final audio change. Latest screenshot/state inspected: root crossing visible, ready/playing at 3.84 m/s, nine audio voices, no error artifacts. High-resolution pursuit capture inspected after correcting the test camera's inherited checkpoint heading. Syntax/whitespace checks pass.

Cadence observations are not yet an acceptance result. The three-second walking probe produces sixteen contacts at each tested presentation rate. The turning probe produces seventeen at 60/30 Hz and fourteen at 15 Hz; settling also differs at lower cadence because local foot placement is presentation-driven. The audio matches the pose actually shown and does not backfill invisible steps. The rapid short-stride walk/shuffle remains a substantive animation/listening review item; synchronization alone does not establish a deliberate, threatening walk.

## Isolated actor CPU measurement

`tools/profile-under-green-actor.cjs` compares the reconstructed pre-footwork adapter with the current implementation. `tools/under-green-actor-baseline.cjs` validates the source transformation before using it; the working tree is not replaced. Same browser, sequential variants, 200 warmup updates per mode, twelve batches of 500 updates. Hardware reports Intel Xeon Gold 6148 at 2.40 GHz; browser is Headless Chrome 148 on Windows.

| Actor mode | Baseline median batch mean | Current median batch mean | Difference |
| --- | --- | --- | --- |
| Walking | 0.0522 ms/update | 0.0864 ms/update | +0.0342 ms |
| Turning | 0.0524 ms/update | 0.1068 ms/update | +0.0544 ms |

This measures bone animation, arm/leg IK, shoe constraints and contact detection in an isolated actor update. It excludes scene updates, GPU rendering and the audio mixer. Batch means are not individual-frame percentiles; this does not prove phone performance, long-session memory stability or a whole-game FPS target.

Evidence: `output/under-green/footstep-audio/verified.json`, `samples.json`, `actor-profile.json`, `pursuit-2560.png` and `standard-client/`. Full human listening, cadence refinement, broader dynamic clearance, physical devices and the remaining 44-item campaign scope stay open.
