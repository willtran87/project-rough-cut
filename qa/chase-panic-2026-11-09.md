# Suspense breaking into panic

## Behavior

- The first eligible close visual encounter gets a .65-second presentation reveal: brief motor hush, rising throttle, warm headlamp emphasis and a small cutting-deck lift/drop. It enters a nine-second panic phase, or eleven seconds after the second relay.
- Panic increases the pace of the existing pulse voice, engine strain, wind and bounded cart-body chatter. A single directional mechanical strike marks the release. No new audio source, vehicle speed multiplier, steering input, camera shake, teleport or pathfinding rule was introduced.
- Sight must remain broken for 1.25 seconds before recovery begins. Percussion drops to one fifth of the recovery envelope while tension fades over four seconds. Sustained sight loss rearms a later reveal, subject to a ten-second cooldown; uninterrupted visibility cannot repeatedly trigger it.
- Existing physical ram windups take priority. Their own hush/rev acts as the reveal and panic can start on release, without a duplicate strike overwriting the clutch sound. Impacts, alarms, timber events and checkpoint respite retain priority. The escape window and collision hulls are untouched.
- One route choice is shown at a time during eligible panic beats: service lane for cover or fairway for speed. The final approach builds engine/rhythm pressure and switches to the garage parking instruction. At the shutter latch, percussion stops, the atmospheric bed fades and the engine is low-pass muffled.
- Fast wet driving adds eight tire-spray instances from the existing 32-instance sprinkler pool, reserving enough capacity for a strict maximum of 32. Existing hurdle splintering remains active. Reduced Motion removes extra chassis/deck/lamp motion and tire spray while retaining audio and readable captions.

## Verification

- `verify-chase-panic.mjs`: reveal timing, finite panic/recovery, earned retrigger, continuous-sight suppression, pause, checkpoint/decoy protection, immutable cart/Joe movement, ram-release priority and latch cutoff pass.
- Six existing live-Joe winning routes pass, as do three alarm distractions, the tension/surge safety gates, five ram escape cases and their solid-contact checks.
- Hardware and software `verify-chase-panic-browser.cjs`: ordinary keyboard driving triggers one reveal; staged reveal, panic, recovery, finale and wet effects render; pause freezes the state; repeat rendering cannot advance it or move the camera/root; Reduced Motion works; resources remain stable. Screenshots inspected at 2560x1600, 1280x720 and 844x390.
- Actual OfflineAudioContext graph: panic RMS .0637 versus hush .0306, peak .220 (below clipping), one reveal strike, muted output zero and inactive tail zero. Recovery percussion is .101 versus .984 during panic in the sampled states; latch percussion is zero. These measurements verify behavior, not subjective fright or mix quality.
- Existing ram browser/audio check passes directional hush/rev/commit, exactly one clutch cue, Reduced Motion and rendered hull containment (9,323 cart / 29,606 mower vertices). Existing alarm audio preserves directional separation, mute and quiet tail.
- Installed standard client completes two driving bursts; presented screenshot/text state inspected. Syntax and whitespace checks pass. A JS exponent-precedence error caught by the initial browser load was corrected before passing tests.

Still 16 programs, 34 textures, two local lights, nine audio voices, 124 static batches and 16 paced preparation batches. Largest preparation upload remains below 2 MiB. No new image assets, shadows, render passes or growing particle pools. Software rendering tail spikes remain; this pass does not claim improved frame time. Human feel/listening assessment remains deferred.

Evidence: `output/chase-panic/{hardware,software,audio}.json`, screenshots and `standard-client/`; `output/ram-windup/software.json` and existing simulation/audio reports.
