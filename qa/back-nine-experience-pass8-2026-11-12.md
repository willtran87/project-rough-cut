# Back Nine experience — pass 8, November 12, 2026

Scope: continue the full 38-item implementation; this pass finishes contact-synchronized runner audio and rejects two unsuccessful rendering experiments. The previous user-facing response restated the improvement list rather than advancing implementation; current work resumes from inspected source, completed output artifacts and live process checks. No human playtesting or listening assessment is claimed.

## Accepted implementation

- Runner gait exports sole lift; existing shared foot-contact tracking emits one event only after a foot rises and lands. Both walking/running and turn-in-place contacts are based on the presented pose, not elapsed time multiplied by speed.
- Scene drains contacts into the existing single-frame GPU fence. Sound is released after that frame completes. Stale, duplicate, wrong-run, muted and inactive contacts are consumed without replay; the caller explicitly gates on foreground/visible gameplay. A retried run cannot replay its predecessor's contacts.
- Short path, rough, wet and sand envelopes reuse the failed cart engine voice after its sputter tail. Turning is quieter. No additional voices, buffers, nodes, timers or rendering work were introduced by foot audio.
- Failure sputter, body landing, panel collapse, mower, music and run-over sounds retain their existing voices and timing. Footsteps begin after the ejection blend, not during the fall.
- Updated entry/import revisions, including runner-gait and the new footstep module, to prevent stale dependencies in returning browsers.

## Verification

- `node tools/verify-runner-footsteps.cjs` and `--software`: pass. Each renderer exercised 9 cases (60/30/15 presentation updates per second × running/turning/stopping), duplicate draws, idle, pause/resume, mute/unmute and actual movement input. Contact counts at 60/30/15Hz: run 13/13/13; turn 2/2/2; stop 5/5/4. Audio events match generated landings one-for-one; sampled boot soles are within 0–0.03m of the ground. No runtime audio-node or WebGL buffer allocations; 12 voices, 23 programs, 36 textures retained.
- `node tools/verify-runner-footstep-audio.cjs`: pass. Offline audio covers 23 contacts, all four materials, quieter turns, silence, pause tail, retry and stale/duplicate rejection. Peak 0.183; muted and settled pause output zero. One oscillator/filter/gain reused. Full audio API explicitly rejects inactive/unspecified presentation and consumes that contact on focus recovery.
- `node tools/verify-foot-contact-events.mjs`: pass; shared tracker unchanged.
- `node tools/verify-cart-damage-audio-browser.cjs --software`: pass. Actual fatal contact, engine failure, four collapse cues, ejection landing, movement away, pause/mute/retry; 12/23/36 resources.
- `node tools/verify-runover-audio.cjs`: pass. Body impact and landing, bounded levels, pause and mute; no added allocations.
- `node tools/verify-chase-score-stages.cjs`: pass. Departure/pursuit/flight/relief/finale/closure arrangements, transitions and silence preserved.
- `node tools/verify-cart-ejection.cjs --software`: pass. Min sampled vertex height 0.01167m; 23 programs/36 textures, no first-use geometry uploads and no console errors.
- Installed gameplay client via `tools/verify-presented-client.mjs --back-nine --runner`, up/left/stop action bursts: pass (terminal50731, exit0). Final movement reached x−30.74,y769.38,16 presented footsteps. Final screenshot inspected: runner and route paving remain legible by the service wall; no client error artifacts.
- Hardware/software screenshots at 2560×1600,1280×720,844×390 were generated. 2560 hardware and 844 software inspected: runner, course edges and instructions remain visible. Final1280 software and standard-client captures also inspected; HUD/instructions remain readable and the actor is framed.
- Syntax checks pass for changed runtime modules. Movement/collision/pathing simulation was not changed in this pass; earlier broad route evidence remains scoped to those unchanged systems.

## Rejected performance experiments

Both candidates are archived only under `output/back-nine-experience/`, absent from runtime. Their diagnostic scripts explicitly serve archived candidates; do not restore them from a lower draw count or a single favorable sample.

1. Rigid joint palette batching reduced runner draws from24 to9 and closely preserved pixels, but did not reliably improve completed-frame time. Fixed ABBA medians: cart44→44.9ms, foliage38→38, wreck37→37.9, open29.1→30.2. Moving comparison: cart76.8→76, foliage66→66.9, wreck59→58, open48.1→50.9. Extra setup/shader complexity was not justified. Runtime runner and scene restored to pre-experiment implementation while retaining foot-contact changes.
2. Ground tone cache replaced the software grass fragment power operation with a small preprocessed texture. Fixed ABBA medians: cart94.8→93.8ms, foliage72.9→80, wreck62.9→62, open49→49. Small pixel-rounding changes (mean0.011–0.064 byte/channel) and an extra texture were not justified by mixed/regressing timing. Runtime helper/import/shader changes removed. Baseline and discarded sources/results preserved under `ground-tone/`.

These fixtures are diagnostics, not proof of full-course performance. Whole-system load varied; no broad FPS gain is claimed. The improved full-body camera remains; its extra visible terrain near the wreck is still a target for measured moving optimization.

## Remaining scope

Items1,19,29 remain open at their broader scope: moving software frame stability, full-course movement presentation and enemy direction/distance/occlusion plus accessibility equivalence. Next useful work: mechanical damage/impact/wobble audit (15–17), then authored world/barrier/landmark/lighting and controlled variation. Preserve the full ledger and deferred human test kit. No goal completion claim.
