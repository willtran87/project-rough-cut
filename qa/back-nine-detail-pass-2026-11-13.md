# Back Nine: Level 1 detail and moving ghosts

User requested more ghost movement and a richer Level 1-style environment, high-resolution pixel art, detailed models, and grass kicked up by the mower.

## Delivered

- Six clear 38.25 m mowing loops replace the previous 4.8 m swaying motion. Ghosts travel at 1.10-1.42 m/s, turn continuously, and use traveled distance for walking pose and mower wheels. Original muted Level 1 models remain in a two-model pool. Pause freezes motion; reduced motion presents stationary ghosts.
- Reused the original six high-resolution Level 1 verge illustrations in one atlas: 4,816 rooted plants / 9,632 crossed cards. Added wind and mower contact bending, 156 small stones and three drainage grates. Placement excludes maintained routes, foundations, putting greens and loose fixtures. Repositioned existing baked Level 1 trees into all 15 permanent planting beds, retaining the overall 140-tree budget.
- Continuous turf clippings replace the eight white attack-only cubes. A bounded pool of 96 grass fragments emits from deck edges, carries momentum, tumbles, falls and settles on the actual terrain. Wet turf produces darker clumps; road/bunker surfaces do not emit grass. Pause, reset and reduced motion are covered.
- More modeled details on the existing objects: golf bags/clubs, tool racks, service notice frames, hinges, hose reels, pump fittings, cistern valves, hydraulic hoses/couplings and drag chains. Destructible fixtures keep the additional pieces in their collapsing chunks.
- Three timber benches and three golf-ball washers are new physical scenery, also destroyable only by Joe. Twelve loose fixtures now share the bounded debris pool, alongside the existing 23 destructible course fixtures/timber/wreck.

## Runtime and visual verification

- `node tools/verify-back-nine-detail.mjs`: continuous clear loops and turning, real travel/gait, all plant clearances, bounded/finite clippings, ground settling, pause/reset/reduced motion, and optional distance culling/restore.
- `node tools/verify-back-nine.mjs`: all 12 driving and relay-stage scenarios complete.
- `node tools/verify-cart-health.mjs`: all three on-foot routes complete; damage, ejection, wreck and controls pass.
- `node tools/verify-back-nine-terror.mjs`: every loose fixture is Joe-only; timber, mouth, wreck, debris, pause and reset contracts pass, including new benches/washers.
- `node tools/verify-course-destruction.mjs`: 23 course fixture contracts and live drive-through pass.
- `node tools/verify-course-culling-restore.mjs`: 48 full-geometry restore/recull cycles pass.
- `node tools/verify-back-nine-detail-browser.cjs`: ghost moves 4.36 m in four seconds; visible continuous clippings, intact/crushed bench, model details, vegetation, pause and resize. Inspected 2560x1600, 1280x720 and 390x844 captures. Zero console/page errors. Programs/textures stable at 23/45 across scenes and effects.
- Installed gameplay client: two bursts via `tools/verify-presented-client.mjs`, latest screenshots inspected and no error files. Initial software run downscaled too far; optimized foliage now fades/culls at 32 m in software and 60 m in hardware, with cheap vertex lighting on software that retains live headlight/beacon response. The final software run holds 960x540 for both bursts, matching the previous pass, instead of falling to 640x360. Hardware browser captures use the existing 1280x720 internal presentation. This is a scoped check, not a universal frame-rate guarantee.

Evidence: `output/back-nine-detail-pass/`; final software captures: `standard-client-optimized/`; detailed browser report: `browser/report.json`. Earlier performance captures remain for comparison. Source snapshot: `baseline-source/`.

No further scoped TODOs. No Level 1 edits, commits, deployment or agents. Preserve the server on port 4187, other chapter changes and the unfinished older broad project goal.
