# Gaze-responsive ghost reactions

Revision: `20261107-ghost-gaze`.

After the initial notice, staring at a clear, nearby apparition for 1.2 seconds triggers a slow head cock and held breath, accompanied by a thin spatial hum and narrow interference at both screen edges. Turning well away for .4 seconds after watching it triggers a forward lean/lowered head, a scrape from its actual position and interference at one edge. Looking back for .2 seconds triggers a brief head recoil, caught breath and short pixel tear. Each reaction occurs once per sighting. Brief flicks, looking above the ghost, distant ghosts and blocked views cannot initiate staring. Smooth turns retain recognition through peripheral vision. Pose envelopes finish smoothly when a subsequent reaction begins.

These reactions use existing mesh controls and do not change the root path, speed, target, player state or real Joe's navigation. Gaze checks run at most five times per second, using dot products and the existing segment/ellipse cover check. No new assets, models, textures, shaders, render passes, readbacks or navigation searches. Same one-draw, 5,648-triangle model, shared audio noise buffer, six-voice cap and 256x144 pixel overlay.

Reduced Motion disables reactive behavior and interference. Ghost sightings, screen interference, mute, pause, focus, priority, warning and recovery gates remain in place. New sparse sound captions use the existing world-caption channel.

Verification:

- New pure gaze tests pass dwell/hysteresis, quick-flick rejection, gradual turns, pitch/cover/distance guards, reset, duplicate samples, once-only pulses, matching 20/100Hz timing and unchanged travel across watcher/stalker/rusher profiles.
- Existing ghost behavior, four movement rhythms, collision/clearance, feedback and mouse-limiting regressions pass.
- Offline audio renders notice and all three new motifs once, with nonzero new cue signals, correct spatial pan, peak .00669, at most four simultaneous voices and full cleanup. Protected/muted states suppress cues. Existing hesitation/feint and broad atmospheric audio regressions pass.
- Actual rendered stare/look-away/look-back sequences pass with gradual camera turns in hardware and software. Screenshots inspected at 2560x1600 and a small 844x390 viewport; 1280x720 and 800x600 also captured. The interference switch clears the pulse. Player/Joe snapshots remain unchanged after returning the camera.
- Effects CPU update p95 .40ms hardware/.30ms software, max .70ms/.90ms in these runs. These are effect-update samples, not total frame/GPU benchmarks; existing whole-game software throughput issues are not claimed solved.
- Natural Reduced Motion/zero-density opening passes: still ghost at 8.6s, null gaze gesture, no tear, working sightings off switch.
- Release validation passes 90 action fixtures and 56 referenced images; syntax/whitespace checks pass.
- Installed normal gameplay client completes two iterations / 14 units of movement with no error artifacts; final screenshot and state inspected.

Artifacts: `output/ghost-gaze-20261107/`.

Deferred human playtest: stare at an apparition, slowly turn away, then return; assess whether the head reaction, directional audio and edge interference feel connected and unsettling without obscuring navigation. Repeat with Reduced Motion and interference disabled. Human fright/comfort feedback remains deferred at the user's request.
