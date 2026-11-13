Under the Green: first encounter, recovery, observation, audio and aftermath

Interim implementation toward the full 44-item goal; NOT a completion audit.

Joe now enters from an actual connected ground-level alcove ahead of the player, opening a door instead of floating down through a ladder. The fixed entrance is authored in under-green-encounters.js, with continuous world movement. CP1 remains the first encounter checkpoint, now at y44 with Joe in the nearby entrance bay; earlier chapter facts keep their existing meaning.

Player water recovery is bounded to 8m/s and respects the actual entry side, walls and Joe. Look remains available; outward steering can reach a side bank. Recovery protection applies only to a player inside a channel. Repeated bank contact does not suppress Joe's attacks. Joe backs out of a new surge continuously at walking speed. Existing late-commitment test now observes recovery start and finish across time rather than demanding instant placement.

Sight requires a cone or close proximity, and hearing uses actual player movement with water/wall masking. Joe searches last-observed evidence, then follows authored inspection points without reading hidden player position. Captions use phase and measured separation trend. Repeated unseen search was checked to avoid permanently freezing at the last point.

Opt-in local telemetry records crossing entry/exit, arrival phase, branch choice, waiting, water hits, phase changes and min/exit separation. Event history is bounded, aggregate counts retained, no external upload or identifiers. Enable with ?telemetry or __underGreen.enableTelemetry(). Standard successful-route test now writes full telemetry in output/under-green/simulation.json.

24 first-crossing scenarios (six arrival times, 7m/14m initial separation, wet/dry) demonstrate six paired wins for each route. Late waiting at 7m can be fatal; successful crossings and dry detours have no forced hits. This is controlled simulation evidence, not unfamiliar-player testing.

The standard full-walk route now reaches a minimum 4.36m gap and spends 4.35s within 10m, but finishes roughly 130m ahead. Total time ~76.28s includes 4.5s of new aftermath. Full sustained pursuit remains unsolved; geometry needs folding/compaction. Do not claim first-crossing improvements solve the chapter.

After the sluice secures, a 4.5s live aftermath preserves movement/look/rear glance, pause/resume, and safe-side collision. Machinery fades; procedural distant applause begins before the result panel. Durable completion is saved when secured and restores correctly after reload.

Audio has stride-driven Joe/player footsteps, engine/teeth, water/knocks, door/starter/pump/gate cues and crowd texture. Focus ducks masking water/player steps and emphasizes Joe. Spatial helper uses metres, source height, lateral distance, yaw, occlusion and range; skips occlusion work for inaudible sources. Global volume/mix buses honored. Runtime graph targets/events/lifecycle verified. No claim of a human listening test: perceptual sound-quality validation remains open.

Closed the root entrance's abrupt roof gap, added transition portal frames, reduced masonry atlas contrast and introduced district tints. These are initial readability fixes, not final district art. Joe hand/tool poses, broader structural connections, dynamic collision inspection, fluid rendering, signage, static light behavior and mobile composition remain open.

Passed checks:
- verify-under-green.mjs: seven real-movement, live-Joe runs, all pressures/checkpoints/evidence, strikes, saves and aftermath.
- verify-under-green-design.mjs: surge barrier/immunity/late return/walking windows, rendered floor parity, keeper closure.
- verify-under-green-rules.mjs: correctness boundaries, migration, warning/guidance, remaps and gate aftermath.
- verify-under-green-encounters.mjs: arrival continuity, recovery bounds/collision/control, perception/captions, 24 comparisons, bounded telemetry.
- verify-under-green-browser.cjs and verify-under-green-encounters-browser.cjs: real controls, entrance, recovery, telemetry, pause/results, responsive layouts, zero runtime errors.
- verify-under-green-audio-aftermath.cjs: Q focus audio targets, stride events, lateral spatial attenuation, one-shot cue lifecycle, pause silence, controllable ending/applause/result/reload.
- verify-under-green-controls.cjs: unchanged Level 1 movement/sensitivity/non-inverted mouse, rear, gamepad and touch.
- verify-under-green-layout.cjs: 1,234 static standing/crouching clearance samples, real dry-route movement, viewed outlet selection and red-water defeat. Range advice assertion corrected to APPROACH because approach distance is now included; no weaker collision criterion.
- Required standard web-game client: two iterations, screenshot/state inspected in output/under-green/encounters/standard-client.

Inspected 2560x1600 entrance, recovery, aftermath and district images; 390x844 entrance and 844x390/390x844 layout captures. Software standard-client output is 960x540. Device performance and unfamiliar-player validation remain outstanding. Existing local server retained. No deployment.
