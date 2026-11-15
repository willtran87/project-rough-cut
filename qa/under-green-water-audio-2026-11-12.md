# Under the Green — separate channel audio sources

Review item 34 required water to retain its physical location when multiple channels are audible. The prior mixer computed each channel's attenuation and bearing, then collapsed all of them into one noise voice at their weighted-average pan. This produced a phantom source between channels on opposite sides of the listener.

The mixer now allocates one persistent noise voice for each of the eight authored water channels. Each retains its own distance, occlusion, phase and stereo bearing. Deterministic offsets into the existing shared noise buffer prevent the sources from emitting an identical waveform. These are channel-level sources at the authored channel positions, not individual emitters for every decorative nozzle.

The combined linear gain stays within the previous maximum-channel budget, distributed proportionally between audible channels. This bounds masking rather than asserting identical perceived loudness. Listening Focus, ambience volume, the aftermath reduction and pause apply to every channel. The existing strongest pressure-warning cue and Joe's engine, contact footsteps and event sounds retain their behavior. Total persistent voices increase from nine to 16, allocated at audio startup; there are no new per-frame Web Audio nodes or new audio assets.

## Evidence collected

- The baseline was captured before editing the mixer: `output/under-green/water-audio/before/offline.json`. At a walkable location with audible sources to both sides, stereo sample correlation was 0.999991, consistent with one panned waveform. The test's `--baseline` mode expects the historical implementation; it does not restore it automatically.
- `tools/verify-under-green-water-audio.cjs` renders the actual mixer in a stereo OfflineAudioContext. All eight cases pass: opposed sources, rear glance, Focus, mute, ambience category zero, pause, near water and a lateral dry route. Opposed-source correlation falls to 0.560997. Rear glance swaps channel energy; Focus lowers water energy; mute/category-zero/pause are silent. Reported source gains sum to the bounded aggregate. This proves the signal behavior, not human localization or mix quality.
- `tools/verify-under-green-footstep-audio.cjs` passes actual contact/cue correspondence at 60/30/15 Hz, independent simultaneous foot envelopes, deduplication, idle, pause/resume, mute/unmute, retry and ordinary pursuit. Its fixed voice-count assertion now reflects eight water voices plus the existing eight other voices.
- `tools/verify-under-green-audio-aftermath.cjs` passes live Joe steps, Focus, lateral attenuation, one-time door/starter, pause, actual gate Use/closure, playable aftermath, applause, results and persisted completion.
- `tools/verify-on-foot-focus.cjs` passes Level 1 and Under the Green remapped keyboard Focus, simulated controller triggers, actual touch events, cancellation and four viewport layouts.
- The installed standard web-game client completed two ordinary movement bursts. Latest screenshot and state inspected: ready/playing, root-gallery bank and landing visible, 16 audio voices, no error artifacts. This short run approaches the lesson; it does not claim a complete crossing or full route.

## Remaining validation

Fresh sequential 300-second production-renderer soaks pass for hardware and SwiftShader. Each completes dry, wet, sprint and checkpoint-3 routes plus a partial repeat, using ordinary replayed inputs with live simulation/AI/audio. Both analyzers pass all stability and frame-rate checks. Warmed render averages are 59.99/38.11 fps; lowest warmed window averages are 59.93/31.72 fps. Both retain 280 geometries, 55 textures, 21 programs and 16 audio voices after the first complete traversal, with no retained heap growth, context loss or page errors. Software uses 640x360 scene resolution and at most one outstanding GPU frame; the HUD remains native resolution. Both final gameplay captures were inspected.

Evidence: `output/under-green/water-audio/soak/{hardware,software}.json` and their `-analysis.json` reports. The scripts accept a separate output path to preserve historical nine-voice measurements. This is local desktop/software evidence, not physical-phone, integrated-GPU, thermal or hour-long qualification.

The refreshed Focus screenshots were inspected at 2560x1600, 1280x720, 844x390 and 390x844. In the portrait root-gallery view, the HUD warning and landing remain readable but the wall-mounted physical signal is outside the forward framing. The DOM layout check does not cover that world-space visibility requirement. Review item 35 needs a focused approach/framing pass; preserve this evidence rather than calling all phone decision cues verified.

Headphone/speaker listening, unfamiliar-player warning comprehension and actual mobile/controller comfort remain pending. The change advances spatial audio and related regression requirements; it does not close the full 44-item goal.
