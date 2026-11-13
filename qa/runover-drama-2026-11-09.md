# Run-over presentation — 2026-11-09

- Added brief impact recoil, a 1.25-second camera drop/dolly, restrained tilt and 64-to-60-degree field-of-view settling. Absolute death age drives effects, so pause freezes the shot and low frame rates cannot accumulate camera drift. Reduced Motion retains the steady original side shot. Retry restores ordinary camera projection.
- Added an initial head/arm flinch to the existing falling runner. Final pose, road clearance and death duration remain unchanged; mower passage reveals the body before retry.
- Added an exclusive death mix using existing voices: low impact thud and filtered scrape, short breath, landing thud at 0.66 seconds, engine/blade swell during passage and quiet ringing aftermath. Ordinary chase cues yield while the player is defeated. Muted or late cues are consumed without replay; pause cancels envelopes; retry releases the mix.
- No new textures, meshes, render targets, shaders, audio nodes, buffers, downloads or timers. Camera uses a reusable pose object and existing geometry. Simulation, damage, pathing, physical backoff and five-second ejection protection files match the task-start snapshots byte-for-byte.

## Verification

- `node tools/verify-chase-runover.mjs`: same seven stationary rams, 3.43-second spacing, repeated moving contact, rear/front/side run-over, scenery/wreck solidity and five-second ejection protection.
- `node tools/verify-chase-runover-browser.cjs` and `--software`: actual collision through fall/pause/overrun/caught/retry, no input revival, camera frozen during pause, lowered camera/narrowed FOV, Reduced Motion fixed shot, one impact/landing cue. No browser errors or new buffer allocations. Same 17 hardware/22 software programs, 34 textures and nine voices.
- `node tools/verify-runover-audio.cjs`: real OfflineAudioContext rendering for normal, pause, mute, late unmute and retry. Peak 0.350, landing at 0.6667 seconds, silent paused tail, no clipping or new audio resources. Two buffers, seven oscillators, two buffer sources, ten gains, nine filters, three panners and one compressor unchanged.
- Existing `verify-cart-damage-audio.cjs` passes all eight damage/repair/pause/mute/retry/priority scenarios; cart crunches, rattles and timed collapse cues preserved.
- Installed standard gameplay client via `verify-presented-client.mjs`, two drive bursts; both states driving, no error artifacts. Inspected the real page capture.
- Inspected actual death captures at 2560×1600 and 844×390; browser suite also captures 1280×720. Body reads clearly after the mower passes; no road penetration. Dark pixel art retained.

Evidence and baseline snapshots: `output/runover-drama/`. `runover-mix.wav` is a five-second render of the actual audio mixer. Resource reuse is verified; this pass does not claim that earlier software-rendering frame spikes are resolved.

Deferred subjective checks: headphone/speaker balance of thud versus blade; comfort of camera drop/tilt and Reduced Motion; readability of the player falling behind the mower before emerging in the aftermath. Human listening/playtest approval is not claimed.
