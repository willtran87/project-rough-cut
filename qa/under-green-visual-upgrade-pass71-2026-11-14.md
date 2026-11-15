# Pass 71 - fixed fixture light bounds

The preceding review refreshed six district captures but did not implement runtime changes. This continuation completes the pending fixture-light optimization before further art additions. The full 53 requirements, 48 refinements and seven acceptance gates remain in scope.

## Change

The merged stationary crossing fixtures, pump housing and keeper release housing now participate in the existing world-bound practical-light selection. Their 69 meshes previously evaluated all 17 lamps; they now evaluate 2-6 lamps each (mean 3.290). Omitted sources cannot reach any point inside the full mesh bound. The existing 13 m source reach, beam distribution, flicker, shaders and material art are unchanged.

Moving levers, needles, latch, diverter, release button and witness remain excluded from the stationary merge. Signal faces retain their material swaps and full light set. Joe, ghosts, water, geometry, collision, controls and simulation are unchanged. Only three runtime files changed: under-green-scene.js, under-green-pump-scene.js and under-green-release-scene.js.

## Evidence

Evidence root: output/under-green/visual-pass71/. The before sources are retained in source/*-before.js. The comparison tool routes these exact three sources for the baseline and uses current runtime files for the candidate.

- Native and software: 31 before/after comparisons each. Every actual framebuffer has an identical SHA-256 and a nonempty RGB sum. Draws, triangles, textures, resolution, lamp state and player state also match. Zero console/page errors.
- Views include seven districts/controls, six pressure times, three flood states, 1280x720 and compact portrait/landscape, pump/release travel, Q lookback, crouch and reduced motion. Actual native resolution reaches 2560x1600; software resolutions are 960x600, 960x540, 390x844 and 844x390.
- Every comparison checks all 69 fixed bounds and all omitted source distances. No fixed mesh leaves its original bound during the tested mechanism movement.
- Real E input moves the pump handle from -0.0833 through -0.2708/-0.5833 to -1 and latched. Release travel progresses 0.0595, 0.2381, 0.5952, 1 and secured. Pixel equality therefore includes actual movement, not only unchanged input states.
- Disposal: all 434 owned material variants receive disposal, all original mesh material identities are restored, and bindings are cleared on each renderer.
- Installed web-game client: seven bursts, terminal exit 0; final ready/playing at (0,8.072), elapsed 1 s, checkpoint 0, actual 960x540. Initial disabled Preparing click timed out; subsequent Enter bursts recovered. Final screenshot/state inspected; no error artifact.
- Native crossing and pump-in-motion, software keeper and final client images were opened and inspected. The separate latest review inspected all six current districts at actual 2560x1600.

## Cost and limits

Stationary bindings increase 385 to 454; owned material variants 374 to 434; dynamic material count falls 92 to 78. Cached programs increase 215 to 220. No texture, light, geometry or draw-count increase. Extra material variants/programs are a startup and memory tradeoff; this pass does not establish startup acceptance.

Sequential warm GPU-fenced timing uses six warm pairs and 24 alternating samples per view. Native baseline to candidate medians: gallery 17.5 to 17.4 ms; crossing 15.9 to 15.5; pump 14.5 to 14.3; range 16.3 to 14.5; keeper 8.6 to 8.5. Other workspace audit/test and Final Cut client processes were live in the pre-timing inventory, so these are local comparisons, not isolated production performance certification.

Software baseline to candidate medians: gallery 251.6 to 259.2 ms; crossing 236.7 to 239.7; pump 190.4 to 171.0; range 253.2 to 244.9; keeper 119.5 to 122.0. This is mixed: the pump and range improve, while the other views are slightly slower. Absolute software performance is still unacceptable.

The subsequent sequential software turning-camera follow-up includes changing visibility: gallery 265.1 to 214.9 ms; crossing 244.3 to 214.8; pump 214.6 to 186.2; range 193.0 to 187.3; keeper 133.7 to 129.1. All five medians improve in this run. It varies yaw at fixed positions; it is not an ordinary-input route or production frame-pacing test. Shared-host contention and the extra shader programs remain qualifications. The reduced lamp work is retained, without claiming general speedup or full performance acceptance.

All owned comparison, profiling, client and timing jobs are terminal with exit 0. Seven current runtime/helper/tool snapshots match their recorded SHA-256 values. A final report audit confirms all 62 framebuffer comparisons, actual handle/release travel and material restoration/disposal. Ledger remains 32 implemented, 20 in progress, 1 pending; all seven gates remain pending.

The profile/report.json diagnostic identifies substantial remaining root, contact-shade and obscured fixture work. No diagnostic omission was shipped. Complete gallery composition, selective moisture response, broader water shores, district framing, actors in motion and full-route performance remain unfinished. No item or acceptance gate is promoted by this pass.
