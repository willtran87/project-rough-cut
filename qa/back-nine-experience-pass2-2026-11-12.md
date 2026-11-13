# Back Nine experience — implementation pass 2

This is progress toward all 38 items in `design/back-nine-experience-implementation.md`, not completion of the goal.

## Player-facing changes

- Actual running-cart, battered-cart and on-foot arrivals receive distinct endings. A pristine arrival is recognized within the running-cart case. Optional crew logs are acknowledged independently of vehicle condition; no outcome is ranked above another.
- Completion saves store validated final vehicle/player/Joe poses, health, hit count and recovered logs. Refresh preserves the arrival and settled wreck without replaying destruction or final audio. Older saves keep success and explicitly say arrival details were not stored.
- Failure advice uses observed context captured before the run-over animation changes it: near the wreck, a bunker, a committed charge, the powered/unpowered garage, or ordinary pursuit. Cause, useful advice, Joe commentary and retry remain separate.
- Result controls remain available while longer text scrolls. Portrait results use the available height. Concurrent Final Cut continuation work is preserved.
- Garage circuit lamps repeat the two-relay visual language, parking markings show the stopping area, and an eight-segment wall meter reflects the actual release hold. Both cart and foot require the advertised brake/use hold for 1.2 seconds. Release before commitment resets it; incomplete relays and partial entry cannot start closure. Existing protected physical closure and latch sound remain.
- Fixed a director ordering bug that classified sealing as a protected moment before reaching its dedicated audio/panic state.
- The three-voice score now varies its recurring motif, rhythm and instrumentation across departure, pursuit, escalation, flight, finale, closing and earned relief. Tempo/layers ease between states; warning and reveal sounds duck the score. Relief removes the driving pulse while world sound continues.

## Evidence

`output/back-nine-experience/outcome/`:

- `verify-chase-outcome.mjs`: four real shutter completions with live Joe, six captured failure contexts, pause, one completion event, reset/retry, validation and legacy fallback.
- `verify-chase-outcome-browser.cjs`: four endings saved and reloaded, preserved foot/wreck state and logs, contextual defeat, nonrepeating successive Joe lines, full-health checkpoint retry, fresh-run reset and old-save compatibility. Screenshots at 2560×1600, 1280×720, 844×390 and 390×844 inspected. Initial portrait test exposed a cramped letterboxed panel; corrected layout rerun passes with title and all actions in the viewport.
- `routes.log`: 12 live-Joe driving route/checkpoint completions. `foot-routes.log`: all three foot starts complete. `choices.log`: actual late fatal ram, protected ejection, pedestrian gap, garage and retry; all authored cart/foot gaps retain physical clearance.

`output/back-nine-experience/garage/`:

- `verify-chase-garage.mjs`: deliberate activation, cancelled partial hold, both relays, whole-hull entry, cart and foot success.
- `verify-chase-garage-browser.cjs`: 0/1/2 circuit states, 4/8 hold segments, release reset, closing arrangement/panic, one latch sound, normal/high-resolution/compact views. Actual high-resolution approach and in-bay meter screenshots inspected.
- Same **23 software shader programs / 36 textures / 12 audio voices**. No `bufferData` allocations during indicator changes. One additional merged unlit indicator mesh; housings and paint join existing static batches. This is bounded resource evidence, **not proof of improved frame times**.

`output/back-nine-experience/score/`:

- `verify-chase-score-stages.cjs` renders 42 seconds of audio, seven distinct arrangements and a latch-to-silence ending. Maximum tempo change per 60 Hz update: 1.94 BPM. Flight RMS 0.0427, relief 0.00260, completed tail 0. Three oscillator/filter/gain voices, no added nodes during playback. WAV retained for later listening feedback.
- Existing `verify-chase-score.cjs` passes pause phase preservation, music mute, fade-out and bounded output.

Additional checks passed: shared encounter priorities/earned dodge; quiet messages and 240 persisted defeat selections; runner controls/collisions; service repair/Joe approach; long locked foot charge; software ejection; live music/preferences/captions/reduced motion browser checks; installed standard web-game client via `verify-presented-client.mjs`. Standard client screenshot inspected at `outcome-client/page-1.png`.

## Remaining work and next evidence

The full 38-item ledger remains open where marked. No claim is made that renderer frame spikes or startup stalls improved in this pass. Human testing remains prepared for later, not conducted.

Route results expose a useful next target: most full routes show no interceptions/commitments/close passes. The automatic backoff-to-windup transition in `mower-ram.js`, six-second hunt cooldown resets and a narrow distant commitment window starve those alternatives. Next pass should coordinate district encounters through the existing shared director, preserving the post-hit escape window and full warning, then compare actual route decisions and attack diversity. Do not add independent overlapping scare timers or use test counters as a substitute for visible behavior.
