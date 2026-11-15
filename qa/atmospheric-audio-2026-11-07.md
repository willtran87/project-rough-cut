# Contextual atmospheric audio — November 7, 2026

Revision `20261107-atmospheric-audio`. Adds quiet environmental texture to the existing reactive procedural score; retains the original art, geometry, movement, Joe pathing and gameplay sound buses.

## What plays

- Woodland: sparse insect chirps and occasional two-part owl calls, with varied pitch and spacing.
- Three ponds: low croaks, short droplets and filtered water/reed noise.
- Service and exit sheds: slow wooden creaks with filtered friction texture.
- Course edges: short wire resonances/rattles, with side determined in world space and rotated by camera yaw.
- Clubhouse: a distant, warped closing-time chime and radio-like static, not intelligible orders or a gameplay prompt. At least 38 seconds between successful local chimes.
- Ghost sightings: a slowly swelling breath-like noise and detuned falling tones. The cue reads the anchor/key of the actual visual sighting, rather than inventing a second ghost location. A 19-second cooldown prevents repeated sighting audio. No fake mower or player-footstep cues are added.
- Quiet windows: brief dips in the environmental bed and musical score; selected ghost sounds start after the dip begins. Mower, danger and gameplay-effect buses remain untouched. Protected interactions can defer these windows.

## Controls and resource limits

All new voices route through **Course Ambience** and therefore the existing master control. No new audio files, downloads, decoded buffers, convolvers or permanent oscillators are added. The existing two-second noise buffer is reused. One gain node is retained; no more than six transient sources can be active/scheduled concurrently. Motifs reserve their entire voice count before starting. Source, filter, gain and optional stereo-panner nodes disconnect on completion.

Listening Focus and gameplay-priority conditions duck existing flavor and prevent new events: pursuit, significant detection, aiming/ball flight, station activation, quiet logging, Status Requests and escape filing. Pause, menus, tutorial/map, calibration, loading and zero ambience/master volume suppress the layer. Ghost sounds respect the apparition setting and are absent without a visual audio anchor. Sparse shed/clubhouse/ghost captions use one low-priority flavor slot and yield to active non-world captions.

Scheduling uses deterministic local variation, not gameplay's random-number stream. It reads presentation state without adding noise evidence or modifying detection, collision, navigation or AI decisions.

## Verification

`tools/verify-atmospheric-audio.cjs` renders the real Web Audio graph through OfflineAudioContext and checks the live game integration:

- All seven sound families generate nonzero audio; maximum isolated peaks are below 0.015 full scale before master mixing. This is a signal/level check, not a human listening review or a guarantee about every combination of existing game sounds.
- Maximum six voices; all sources clean up after playback. Stereo direction flips with camera orientation.
- Mute, priority, Listening Focus, Pause, duplicate-frame scheduling and deliberate hush checks pass.
- An actual visible 3D ghost supplies an audio anchor and triggers a ghost cue; disabling apparitions removes that anchor.
- Player state, Joe state and detection are unchanged by audio updates. Existing movement/pathing tests pass all nine groups, including 29 obstacle approaches and near/distant Joe continuity.
- Existing hardware atmosphere suite passes all seventeen groups: mist, ghost movement, occlusion, Pause, comfort settings and first-use shader reuse. High-resolution 2560×1600 pond capture inspected.
- Release validation and JavaScript syntax/whitespace checks pass.
- Installed normal-play client completes three iterations / 28 units, triggers the woodland layer and cleans up its voices, with no browser error artifacts or sampled clipped output. Final screenshot/state inspected. No new voices are allocated while loading.

Single paired cold-entry sample, fresh hardware browser processes, local server, 2560×1600:

| Metric | Before | After |
| --- | ---: | ---: |
| First completed scene | 6.1147 s | 6.1129 s |
| Largest loading RAF gap | 183.3 ms | 150.0 ms |
| Two-second movement | 48.396 units | 48.3984 units |

This sample shows no material loading-time regression; the frame-gap difference is not evidence that adding audio improves rendering performance. Existing software foliage and cold-frame limitations remain. No changes to the GPU preparation pipeline were made.

Evidence and task-start snapshots: `output/atmospheric-audio-20261107/`. Human listening/balance feedback remains to be collected; no subjective listening validation is claimed. No deployment or commit was performed.
