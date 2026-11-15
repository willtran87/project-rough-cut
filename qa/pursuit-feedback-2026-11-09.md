# Closing pursuit sound and camera — 2026-11-09

- Added a presentation-only approach envelope driven by real actor separation and relative velocity along the line between them. It starts inside42m, builds faster when Joe is closing, and smooths by simulation time. A nearby mower matching speed produces only a quarter of the full closing threat. Lost sight fades it; no extra visibility raycasts.
- Existing mower voice gains a stronger, brighter, uneven engine growl; existing blade voice gains bite and pitch as Joe closes. Ambient drone/harmonic mix yields slightly, with a small additional filtered wind layer. Existing stereo direction, warning hush, impacts, cart collapse and run-over audio remain authoritative.
- Added bounded roll/heave and up to3.2 degrees of FOV widening. Roll is at most0.01rad, heave0.033m before camera smoothing. Rear view reverses directional roll. Reduced Motion removes all added camera movement/FOV changes while retaining the sound cues.
- Added layer drops to zero during backoff/lineup, relay/ejection/invulnerability protection, pressure openings/gather, breathers, alarms, reveal hush, commitment warning, finale and death. Pause freezes the visual envelope; audio master fades as before. No gameplay changes, new meshes/materials/textures/postprocess/render targets, audio nodes/buffers/downloads or timers.

## Verification

- `verify-pursuit-feedback.mjs`: distance/closing sensitivity, immutable gameplay state, bounded camera, pause, Reduced Motion, hidden fade and all relief gates.
- Hardware/software `verify-pursuit-feedback-browser.cjs`: actual closing pursuit through collision/backoff; strong approach before contact, zero layer after contact, pause freeze, Reduced Motion and9 voices/34 textures/17 hardware or22 software programs unchanged. No first-approach buffer allocation or browser errors.
- `verify-pursuit-feedback-audio.cjs`: real OfflineAudioContext comparison against task-start mixer plus muted/paused/opening scenarios. Close-phase RMS0.0858 vs0.0712 (~20% higher), peak0.2895, no clipping; muted output zero, paused tail below0.0001, opening removes approach layer. Resource counts identical before/after playback:7 oscillators,2 buffer sources,2 buffers,10 gains,9 filters,3 panners,1 compressor.
- Existing cart-damage audio eight-scenario suite and run-over audio five-scenario suite pass unchanged cue counts, allocation limits and pause/mute behavior.
- Installed standard gameplay client completed two bursts; no error artifacts. Inspected actual2560×1600 approach,844×390 and1280×720 gameplay captures.
- Simulation, ram, pressure and player files match task-start snapshots byte-for-byte. Escape windows, pathing, damage and movement remain unchanged. Resource reuse is verified; no general frame-rate improvement claim.

Evidence and task-start mixer: `output/pursuit-feedback/`. `closing-mower.wav` is a five-second render from the actual mixer. Deferred human checks: headphone/speaker balance, blade harshness, camera comfort and clarity of relief; subjective listening approval is not claimed.
