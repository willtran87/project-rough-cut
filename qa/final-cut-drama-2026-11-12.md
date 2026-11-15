# Final Cut — dramatic direction, dialogue and optional unease

Implemented locally against FC25/30/31/38/59/60, with lifecycle evidence for FC67. The full 72-item goal is still incomplete. Technical checks below do not establish that the chapter is frightening or engaging for unfamiliar players.

## Dramatic direction and speech

`final-cut-drama.js` derives arrival, demonstration, silence, approaching/committed danger, close pass, crossing window, refuge release, collapse, shutdown and safety from the actual simulation. Refuge entry quiets the score and wind; machinery remains audible. The first-cut ceremony stop retains four seconds without score. Focused listening ducks the score; the coda resolves to silence. No threat timing, targeting or player movement is changed by this director.

Five authored Joe lines use packaged local Microsoft David Desktop speech with a constrained cab-speaker filter. Source script, WAVs, reproducible build and provenance are in `assets/audio/final-cut-joe/`. The runtime clips total 63,527 bytes. This is a synthetic performance pending human listening/acting review.

Optional lines yield to interactions, aiming, focused listening and actual danger. Their short opportunities expire. Heard flags persist; retry/reload never restores an active line. The decoder tolerates per-asset failures, rejects late stale starts, resumes paused clips from the remaining offset and permits at most one transient source. Mute and subtitle controls remain independent. Machinery and speech use actual position/pan and masonry filtering.

## Optional cloth beat

`final-cut-unease.js` adds one physical sponsor banner outside the east course boundary, visible through the pump shelter's real opening. After preparation and two settled seconds, wind drops; a single slow fold moves the cloth, then settles. The fixed upper edge remains attached to its rail. It introduces no actor, lethal silhouette, collision, jump sound, camera motion, objective or essential cue.

Scheduling requires the actual pump refuge, fully prepared water, a distant rig, quiet dramatic phase, stationary player, visible banner within the actual horizontal field of view, and no interaction, message, dialogue, aiming or listening. Teaching, exposed movement, danger and victory suppress it. New priorities cancel it without queuing a later scare. The consumed flag persists; reduced motion suppresses scheduling and all cloth flutter. Pause freezes its simulation age. Audio only lowers existing wind; no additional source is allocated.

The first portrait capture showed the banner outside the narrow camera view. Fixed scheduling to receive the real camera half-FOV from the input layer. Browser coverage now explicitly verifies the offscreen opportunity stays unconsumed, then looks toward the cloth and observes the fold. A nearby uncollected record also correctly suppresses the beat; visual fixtures use a collected record to isolate the optional atmosphere.

## Verification

- `verify-final-cut-drama.mjs`: eight groups, including state-specific triggers, pause, danger interruption, expiry, refuge release and protected shutdown.
- `verify-final-cut-voice.mjs`: delayed decode, pause offset, cancellation, ownership replacement, source bound and disposal.
- `verify-final-cut-drama-browser.cjs`: five real decoded clips (RMS .063–.071, peaks .600–.712), actual audio pause/resume and settings, missing-asset fallback, persisted heard flags and four enlarged-caption layouts. Independent Web Audio instrumentation measured a maximum of one transient speech source, zero remaining after cancellation/mute; no page errors.
- `verify-final-cut-unease.mjs`: one-time timeline, fifteen suppression conditions, narrow-FOV and reduced-motion gating, interruption, pause, save normalization and integration at 30/60/120/144 Hz.
- `verify-final-cut-unease-browser.cjs`: actual simulated trigger at 2560×1600, 1280×720, 844×390 and 390×844; pause/resume, shared reduced-motion control and actual save/reload. Rendered hem displacement .648 m; top attachment unchanged. No page errors.
- `verify-final-cut.mjs`: thirteen core groups and all seven ordinary-control simulation pilots passed; default 125.708 s, sprint 77.325 s, seed 2 126.375 s, unchanged from prior contact work.
- Pending prior full-route browser handle was polled to completion: direct/bank, garage/open and drain/ball-distraction routes all finished with zero captures, 65 screenshots and no errors. This run includes the drama/voice work; it predates the optional cloth addition.
- Ending browser regression: twelve captures, no errors, after cloth integration.
- Controls browser regression: actual remapping/persisted prompt, gamepad movement/listening/pause, blade defeat/retry and simultaneous touch input/cancellation; five groups, no errors.
- Installed develop-web-game client: two movement bursts completed, final screenshot and text state inspected at 6.52 simulated seconds. Waiting rig/arrival remained coherent, no optional scare fired, five dialogue assets decoded, no error artifacts. 69 draws, 22 geometries and 15 textures in this sample; these are counts, not performance certification.

Artifacts: `output/final-cut/drama/` and `output/final-cut/unease/`. Visually inspected actual dialogue desktop/portrait captures and cloth desktop/landscape/portrait captures. No FPS claim is made from these screenshots or CPU submission statistics.

## Remaining scope

Human listening and unfamiliar-player horror/fun acceptance remain open. The restrained score now follows authored phases but its composition/timbre is still procedural. Final environmental art, convincing machinery recordings, broader acoustics, animation/contact polish, complete device/performance acceptance and the other ledger requirements remain. FC31 is implemented with technical/visual evidence; whether the optional beat improves dread still needs a player judgment.
