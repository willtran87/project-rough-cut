# Back Nine experience pass37 — terrain-aware running feet

Previous goal turn made progress: manual gates were implemented and verified. Full38-item goal remains active. Shed retries and the deferred human-playtest preference are preserved.

## Finding and change

Current foot-passage regression still passes48 approaches:46 completions, two genuine close catches and no snags. Inspection then found a presentation mismatch introduced by the new course terrain: the runner root followed ground height, but both feet still targeted a flat plane through that root.

A paired scan of actual boot vertices over all11 authored driving routes and three foot passages reproduced7.16cm maximum ground penetration and4.01cm maximum movement of a planted ankle between sampled frames. This is an animation audit along authored routes, not a full physical driving/foot completion test.

`runner-gait.js` now accepts an optional ground sampler. Each foot gets its own elevation and local forward/cross slope; its existing ankle joint follows that slope while the torso stays upright. Analytic sole support includes the existing boot/sole dimensions. The pelvis still keeps each target within leg reach. `chase-runner.js` applies the resulting pitch/roll with existing joints, and the Back Nine scene supplies its shared terrain sampler. Flat-ground callers remain exactly equivalent. No physics, speed, pathing, collision, damage, camera or audio behavior was changed.

The update performs at most11 terrain queries per new presentation frame, and none on a repeated timestamp. Existing prepared height samples are reused. No extra model, texture, light, GPU upload or audio voice was added. Relevant module versions were refreshed in the existing import map.

## Evidence

Artifacts: `output/back-nine-experience/runner-terrain/`.

- Paired hardware30Hz audit:9,917 actual mesh poses in each version. Minimum boot clearance improves from−0.07155m to+0.01134m. Worst planted ankle movement falls from0.04009m to0.00178m. Model retains24 meshes.
- Current hardware60Hz:19,799 poses. Software15Hz:4,977 poses. Across all current samples, minimum clearance exceeds0.0112m, planted movement stays below0.00187m and leg targets remain within numerical solve precision. All14 authored route centrelines are covered, including longitudinal and cross slopes. These sample animation geometry; they do not assert route balance or a player win rate.
-2,940 pure gait cases cover forward/reverse/arc/pivot/stop/restart/reset at15/30/60Hz. Every flat-ground target matches the previous implementation exactly. Duplicate timestamp updates retain the pose and perform no additional terrain queries.
- Hardware/software slope views at2560x1600,1280x720 and844x390 pass. Final screenshots inspected. Resource counts remain unchanged within each run:2030 uploads,45 textures,23 hardware/28 software programs. Current totals include concurrent unrelated scene-detail additions; they are not a resource comparison against pass36.
- Installed standard client completed two real movement/turn/stop bursts on the range slope with live Joe and no invulnerability. Final screenshot/state inspected: player remains alive, moved from y371 to379.66, and retains14 voices. No browser error artifacts.
- Actual browser steering regression passes mouse/right-stick/touch-camera rejection, turn-in-place, forward/reverse, Q rear glance, guide controls and on-foot garage activation/completion. The latter is a garage fixture, not a complete on-foot course playthrough.
- Cart-ejection regression passes continuous poses on both sides, angled seat origins, pause, control return, reduced motion, a real fatal collision, one landing sound and responsive captions. No resource growth. Its obsolete fixed12-voice expectation now compares with the actual initial voice count instead.
- Runner controls and foot-contact-event regressions pass. Current sensory/cover regression passes after correcting an outdated unit fixture to mark the opening departure finished: actual windbreak route has8.28s hidden/searching,4.52s earned relief and physical reacquisition. No production pursuit change was needed. Its legacy alarm-evidence unit does not imply bells are present in Level2.

## Cost and limits

A warm interleaved Node CPU microprofile measured median gait cost0.00057ms before/0.00432ms after, with p950.00098/0.00818ms. This is a small additional CPU cost for slope grounding, not an FPS improvement or a worst-case browser-frame benchmark. Software rendering remains slow: the final installed-client capture reports93.8ms completion p95. Foliage/mower/scene rendering and cold startup remain open under1/35.

The ejection and run-over choreography are preserved; this pass refines normal running/turning foot targets. Human animation feel and route readability remain in the prepared kit. Item19 is technically accepted with the current all-route mesh audit plus controls/ejection evidence. Current ledger:23 implemented/technically verified,14 in progress,1 human-playtest package prepared. All owned test jobs are terminal; server4187 retained. No commit or deployment.
