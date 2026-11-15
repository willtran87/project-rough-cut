# Varied gaze reactions

Revision: `20261107-gaze-variety`.

Each sighting independently chooses one of three responses for staring, looking away and looking back. Choices use a stable hash of encounter identity (27 possible combinations); they are reproducible and remain fixed during a sighting, rather than rerolling each frame.

- Held response: slow head cock, forward lean or recoil, with the existing held-breath/hum/scrape motifs.
- Flinch response: opposite head tilt, raised chin or withdrawn lean, with a longer hesitation, lower/rising scrape tones and narrower, reversed interference strips.
- Two-part response: sidelong head turn/double-take with two continuous motion envelopes, delayed second audio voice and two bounded pixel pulses.

Stare dwell varies .8–1.6s, look-away dwell .4–.8s and return dwell .2–.4s. Each event still fires once per sighting. Angular hysteresis, cover/pitch/range checks, quick-flick rejection, smooth pose blending, safe root travel and real Joe's navigation remain intact.

Variant metadata is shared by the pose, sound and screen systems. Same pixel atlas/model, one ghost draw / 5,648 triangles, six-voice audio limit, shared noise buffer and 256x144 overlay. No added assets, shaders, render passes, readbacks or path queries. Existing Reduced Motion, sightings, interference and audio protection controls remain in use.

Verification:

- 64 synthetic sightings cover all nine event variants and 25 combinations, with continuous bounded envelopes, stable resets/duplicate samples, correctly matched screen variants and no repeated events.
- Existing gaze, ghost behavior, movement variety, clearance, feedback and camera-limit checks pass. Release validation passes 90 fixtures / 56 images; syntax and whitespace checks pass.
- All three offline audio variants pass once-only cue, spatial pan, nonzero signal, protected/muted suppression and cleanup checks. Peaks .00664–.00686, maximum four simultaneous voices; audio signatures differ between variants.
- Six real-scene encounters in each hardware/software mode render all three variants of all three events. Screenshots inspected at 2560x1600; additional 1280x720, 800x600 and 844x390 captures check scaling. Camera returns to its original state and real Joe/player state remains unchanged. Interference off switch clears the pulse.
- Effects CPU update p95 .20ms hardware/.30ms software; max .70ms/.90ms. These are CPU effect-update samples, not total-frame/GPU measurements. Existing whole-game software throughput limits are not claimed solved.
- Reduced Motion/zero-density natural opening passes with a still apparition at 8.6s, null gaze gesture, no interference and a working sightings off switch. Existing feint and broad atmospheric audio regression suites pass.
- Installed normal gameplay client completes two iterations / 14 units of movement with no error artifacts; final screenshot and state inspected.

Artifacts: `output/gaze-variety-20261107/`.

Human playtest remains deferred: compare several sightings and judge whether the dwell/pose/audio differences feel unpredictable but connected, especially the delayed flinch and second head turn. Check comfort with interference disabled and Reduced Motion enabled.
