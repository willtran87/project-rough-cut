# Ghost faces and fluid motion

Revision: `20261107-ghost-expression`.

The close-up face already contained the original eyes, brows and mouth, but the ghost's pale tone curve flattened their contrast. A localized, stepped facial curve now gives those features depth without replacing the atlas or adding textures. A small jaw relaxation develops after noticing the player.

The old sideways neck shear is now a soft, pivoted head rotation. Bounded head yaw/nod, asymmetric shoulder lift and lateral upper-body sway vary by sighting identity and ease in. Notice still has a deliberate held breath; some breathing returns during movement. The mower and foot anchors remain outside the new deformation masks. Periodic cubic blending of the six existing walk poses gives continuous pose velocity across the full loop, and speed-to-walk weighting eases more gradually.

The existing ghost remains one draw / 5,648 triangles with the same eight morph targets. Four existing walking targets now contribute to the blend. No new geometry, texture downloads, lights, render passes, animation mixers or navigation queries. Reduced Motion receives zero secondary-motion parameters. The actual player, Joe, safe rush lane, close-player dissolve, camera controls and sound/interference triggers are unchanged.

Verified:

- Isolated rendered reveal and secondary motion, plus reset of every new parameter. Notice/rush visibility remains stronger than waiting. The largest numerical derivative mismatch across the six gait boundaries was .00072; weights remain normalized and nonnegative. Secondary motion changes actual framebuffer pixels.
- Before/after close-ups inspected at 2560x1600; deeper eyes/mouth remain aligned to the original textured face. Hardware and software gameplay rush screenshots inspected at 2560x1600.
- Fourteen hardware locations and three software profile cases pass, including notice/rush/tear behavior, the one-draw limit and unchanged player/Joe/detection snapshots.
- Pure behavior, legacy ghost movement, feedback/mouse limits, release validation (90 action fixtures / 56 referenced images), syntax and whitespace checks pass.
- All 17 atmosphere regressions pass, including real depth occlusion, morph deformation, pause, mist, shader preparation and layout at 2560x1600, 1280x720, 800x600 and 844x390.
- Effects-update CPU p95 .30ms on both runs; max .60ms hardware / .50ms software. These are sampled CPU costs, not whole-frame GPU timings or proof that existing software-renderer throughput issues are resolved.
- Normal installed client completed two iterations / 14 units of travel without error artifacts; final screenshot/state inspected. Natural opening with Reduced Motion and zero atmosphere density still produced a visible ghost at 8.6 seconds, with every new movement parameter zero and no screen tear; disabling Ghost sightings hid it.

Artifacts: `output/ghost-expression-20261107/`. Human fright/comfort tuning remains deferred.
