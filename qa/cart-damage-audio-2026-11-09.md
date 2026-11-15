# Cart damage sound — 2026-11-09

Implemented in `web/cart-damage-audio.js`, integrated with the existing `web/back-nine-audio.js` mixer. No visual, physics, movement, AI or collision edits.

- Damage crunch: several short compression/shear pulses with a descending resonant filter; power and damage scale the response. Uses the existing impact thump and metal-noise source.
- Loose battery-cover rattle below 45 health: follows the model's 19-radian vibration cycle, scales with driving speed, skips selected beats and varies pitch. Stops at rest or after sufficient repair, yielding to physical impacts and important chase cues.
- Failure: the cart motor drops in pitch and sputters over 0.82 seconds, matching the broken headlight pulses. That oscillator then returns to the existing on-foot footsteps. A failed cart awaiting safe ejection remains silent.
- Collapse clanks at failure ages 0.16, 0.93, 1.34 and 1.65 seconds match support buckling, hood landing, cover/bumper settling and the final wheel clunk. Stereo placement and attenuation follow the wreck as the runner moves away. Competing environment/reveal sounds yield during this short sequence.
- Timing follows simulation time. Pause/mute cancel sounding impact envelopes; expired/muted cues are consumed rather than replayed on unmute. Retry clears the previous sequence. Existing master volume/compression remains in use.

## Verification

`node tools/verify-cart-damage-audio.cjs` renders eight real OfflineAudioContext scenarios: normal, intact baseline, mute, pause/resume, stop/repair, retry during collapse, late mute/unmute and competing effects. Normal sequence: 3 crunches, 5 rattles, 1 engine failure and 4 collapse cues. Cue timing error <25 ms at 60 Hz. Peak amplitude 0.428 (no clipping); muted peak 0; paused/final tail 0 in the sampled windows. Repairs/rest stop rattle and retry does not continue the old collapse.

Instrumented allocations remain identical before/after gameplay: 7 oscillators + 2 looping buffer sources = 9 voices; 2 buffers, 10 gains, 9 filters, 3 panners and 1 existing compressor. No new source pool, runtime audio buffers, downloads or load-time sample decoding. Short cue envelopes schedule only on events; no separate timer loop. These resource checks do not claim to fix previous rendering frame spikes.

`node tools/verify-cart-damage-audio-browser.cjs [--software]` passes a real terminal mower collision, engine-failure phase, paused sequence, immediate forward run during four clanks, silence after settling, mute toggle and checkpoint retry. No console errors. 34 textures and 17 hardware / 22 software programs unchanged. Captured 2560x1600; visual output unchanged. Installed game client also passed two normal driving bursts; screenshots/state inspected.

Existing impact direction/mute, pressure wave, close-pass, panic/finale, machinery/alarm and environment audio regression scripts passed.

Evidence: `output/cart-damage-audio/`. Preview: `damage-to-breakdown.wav` is a 10-second stereo render of the actual mixer: impacts near 0.6/1.8 s, loose-cover driving, fatal hit at 4.6 s, collapse and quiet wreck. It is a QA artifact, not a new shipped asset.

## Later listening checks

- Use both headphones and speakers to judge the crunch's metal character and the rattle's audibility under Joe's engine.
- Confirm the engine cutoff reads clearly without masking the escape cue and the clanks appear to come from the wreck.
- Check preferred volume and low-end hardware during a foliage-heavy chase. Automated waveform/timing checks do not replace subjective mix/playtesting.
