# Ghost notice and rush readability

Revision `20261107-ghost-reveal`.

Ghosts now gradually resolve into denser, colder silhouettes after detecting the player. The face gets slightly stronger pixel coverage than the clothing; the original atlas and stepped tonal palette remain. A small head tilt and held breath mark the notice/windup, followed by a forward-set upper body and opposing head angle during the rush. All envelopes ease continuously, with no added strobing or camera movement. The mower and feet stay grounded; the existing morph gait, committed safe lane and player clearance still apply.

The existing ghost shader handles the reveal and posture. No additional meshes, textures, lights, passes or asset downloads. The model remains one draw / 5,648 triangles. Reduced Motion still gets a stationary, unrevealed apparition, and disabling Ghost sightings hides it. Existing audio and interference cues remain phase-driven.

Validation:

- All fourteen hardware sighting sites and three representative software sites passed, including watcher/stalker/rusher notice, rush, screen interference and unchanged player/Joe/detection snapshots. Hardware and software rush screenshots inspected at 2560x1600.
- Isolated same-position/same-opacity framebuffer comparison: waiting 31,532 lit pixels, held notice 42,386, rush 49,942. Rush total RGB energy was 2.05 times waiting. One draw throughout; clearing the motion state resets reveal and posture uniforms. These compare phases within the new build, not old/new screenshots.
- Behavior tests cover bounded posture/reveal, held notice before movement, continuity through sampled phases, obstacles, player clearance, no retargeting and suppression. Feedback/mouse-limit tests pass.
- All 17 atmosphere regression groups pass, including morph movement, depth occlusion, mist, unchanged simulation, pause, shader preparation and 2560x1600 / 1280x720 / 800x600 / 844x390 layouts. Release validation passes 90 action fixtures and 56 referenced images. Syntax and whitespace checks pass.
- Sampled effects-update CPU p95 was .20ms, max .40ms on both hardware and software test runs. This is effects CPU time, not whole-frame GPU time or a claim that existing software-renderer FPS issues are solved.
- Installed normal-play client completed two iterations and 14 units of travel with no error artifacts; final screenshot/state inspected. Integrated ghost-audio and mouse-limit checks also pass: audible notice/rush signals, three voices in the focused sample, no duplicates or camera drift, and unchanged player position.

Artifacts: `output/ghost-reveal-20261107/`. Human fright/comfort tuning remains a deferred playtest item.
