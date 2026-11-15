# Hesitation and false-retreat cues

Revision: `20261107-ghost-feints`.

The movement state now reports two gestures: hesitation during the actual stopped portion of an approach, and feint while a false retreat advances again. Gesture metadata is shared by the audio and pixel overlay; it is cleared during fade/abort and omitted for short blocked lanes.

Hesitation plays a brief caught-breath/descending throat tone, with three thin interference bands that hold then slip (.48s, peak .36). A feint plays a reversed scrape and low descending tone, with a direction-reversing five-band tear (.72s, peak .56). Sparse world captions identify both sounds. Each gesture fires once per sighting; existing notice/rush cues remain. Screen cues require seeing the ghost and respect the interference/Reduced Motion settings. Audio respects apparition, mute, pause, focus, priority, warning and recovery gates.

The existing shared noise buffer, six-voice audio limit, 256x144 overlay and source artwork are reused. No new downloads, models, shaders, rendering passes, scene readbacks or navigation queries. The single 5,648-triangle ghost and its safe movement paths remain unchanged.

Verification:

- Real movement traces produce exactly one hesitation/feint screen pulse at the matching stop/reapproach. Existing rhythm, collision, frame-rate consistency and mouse-limit tests pass.
- Offline audio renders notice, rush, hesitation and feint once each, with nonzero signal in both new cue windows, correct spatial pan, peak .01149, max four simultaneous voices and complete cleanup. Repeated samples and protected/muted states do not add cues.
- Fourteen extended hardware site cases pass with actual hesitation/feint screenshots inspected at 2560x1600, unchanged player/Joe/detection snapshots and the same one-draw budget.
- Three extended software profile cases also pass, including actual hesitation and feint captures. Effects CPU p95 .20ms hardware/.30ms software, max .40ms/.50ms (CPU update samples, not full-frame GPU benchmarks).
- Release validation (90 action fixtures / 56 referenced images), syntax and whitespace checks pass.
- All 17 atmosphere regression groups pass at 2560x1600, 1280x720, 800x600 and 844x390, including occlusion, shader preparation, pause and unchanged simulation checks.
- Broad atmospheric audio regression passes signal/clipping, spatial pan, six-voice cap, source cleanup, mute, focus, priority and pause checks.
- Reduced Motion with zero atmosphere density shows a still apparition at 8.6s with null gesture and no screen tear; the sightings off switch hides it. Screenshot inspected at 2560x1600.
- Installed normal gameplay client completes two iterations / 14 units of movement with no console error artifacts; final screenshot and game state inspected.

Artifacts: `output/ghost-feints-20261107/`. Human fright/comfort tuning remains deferred; whole-game software-renderer throughput issues are not claimed solved.
