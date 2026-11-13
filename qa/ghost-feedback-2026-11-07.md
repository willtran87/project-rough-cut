# Ghost feedback and bounded mouse look

Revision `20261107-ghost-feedback`; reload the local game.

Ghost notice now triggers a spatial inhalation/strained tone, and a rush triggers a descending spectral shriek. They use the actual ghost's position and phase, emit at most once per phase per sighting, and share the existing six-voice ambience budget. Listening Focus, priority gameplay sounds, recovery, pause and mute suppress new cues. Existing sound captions identify each cue. No audio files, new buffers, convolution or continuous sound sources were added.

When the player first looks toward a visible ghost through clear space, the existing 256×144 overlay produces a brief pixel-strip interference pulse. A noticed ghost's charge produces a stronger pulse. Pulses last at most 0.55 seconds, are spaced by at least 0.85 seconds, preserve the center aiming lane and leave the HUD in place. No framebuffer readback, full-scene copy, extra 3D draw, camera shake or new shader. This low-contrast effect has its own saved **Ghost screen interference** switch, enabled by default independently of **Scare flashes**. Reduced Motion and existing ghost/director suppression also disable it.

Mouse look now consumes input on simulation updates rather than changing yaw immediately inside pointer events. Sensitivity and inversion apply before the limits. Maximum turn rates are 2.1 rad/s horizontal (about 120°/s) and 1.4 rad/s vertical (80°/s), also bounded to 0.055/0.035 radians per update. Small input is smoothed over 22ms. Accumulated input is bounded and expires after 100ms without new movement; reversal discards the old direction. Pause/map/loading, look-back, pointer release/unlock, loss of focus and restart clear pending input. Controller/touch controls, movement speeds and real Joe's navigation are unchanged.

## Verification

- Pure checks: extreme input/event floods at 20/30/60/144Hz, fine movement, reversal, nonfinite input, reset; bounded ghost pulse lifecycle and duplicate/suppressed frames.
- Browser camera checks: a 5,000-pixel event does not turn immediately; its first 60Hz update turns only 0.035 radians. Sustained event floods stay at 2.1 rad/s, then settle with no continued drift. Map/release discard pending movement; inversion works; player position stays unchanged.
- Offline audio renders both cues, with one event per phase, stereo direction, cleanup, suppression and no clipping. Sample peak 0.00534; maximum three concurrent voices in the focused test, within the existing six-voice cap.
- Hardware: all fourteen locations, all reactive profiles and an actual rush/tear pulse pass. Software: three representative locations cover all profiles and the tear effect, with submitted frames awaited. The original single ghost draw and sub-6,000 triangle count remain; player/Joe/detection snapshots are unchanged.
- Tear screenshot inspected at 2560×1600. Comfort setting persists and is available in the scrollable dialog at 2560×1600 and 844×390.
- Release validation: 90 action fixtures and 56 runtime image references pass.
- Existing atmospheric audio regression and all 17 atmosphere/effects regression groups pass, including voice limits, spatial panning, ghost depth occlusion, mist, shader preparation and comfort controls across four viewport sizes.
- Normal installed gameplay client: two iterations, first-hole gameplay, 14 units travelled, no error artifacts; screenshot and state inspected.

Artifacts: `output/ghost-feedback-20261107/`. Automated audio checks verify signals, not subjective listening quality. Whole-game software FPS remains a separate performance limitation.
