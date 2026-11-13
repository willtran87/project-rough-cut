# Under the Green: recognizable scythes, walking ghosts, unseen pursuit

User corrections: Joe still resembled a hedge-trimmer carrier; ghosts should walk through gradual fades; Joe should close distance quickly while unseen and move slowly when visible.

Implemented:

- Rebuilt the weapon around a 2 m-high bent wooden shaft and a broad transverse crescent, more than 1 m across. Grips have different heights/depths. The lower curved blade has matching diagonal collision endpoints and clearance samples. Both Joe and apparitions use this geometry. Legacy internal trimmer API names remain for compatibility.
- Scythe carry now considers sideways angles in cramped spaces. Joe establishes his arrival heading before selecting the initial safe pose. Forward walking stops at contact instead of sliding one coordinate sideways. Tuned the upper grip to remain reachable throughout raised carries, turns and moving poses.
- Apparitions follow selected, clearance-checked curved lanes continuously. Cross-corridor travel is slower and shorter than longitudinal travel. Fade-in is 2.2 s; fade-out spans the last 3 s of a 9 s sighting. Danger interruptions fade over 1.2 s while movement continues. Looking away does not relocate them; pause freezes elapsed time. Smooth transparent shading replaces coarse discard thresholds.
- Ghost animation uses 16 baked walking poses, blended on the GPU from travelled distance, retaining one draw call. Rendered side views show changing legs and forward travel. The dark appearance is local to this chapter.
- Joe's unseen pace ramps after 0.7 s, up to 2.6 times ordinary pace at longer distances. Conservative view/occlusion checks include actual FOV, aspect, pitch and Q rear glance. Entering visibility immediately restores walking pace, including a check of the next proposed position. The last 5 m and water crossings retain ordinary pace; water route planning always uses that pace. No teleport, attack timer acceleration or new player-position knowledge.
- Shortened the last bunker fence rail so it no longer protrudes across the north junction; the faster route exposed a head-level intersection there.

Verification:

- Pure scythe dimensions, 112 swept contact samples, dodge/capture and phase-continuity checks pass.
- Clearance: 1,288 placement/headings; 11,093 route frames; dry, wet and later-section routes complete. Close turns, blocked swings, threshold occupancy and forward movement pass.
- Final rendered moving route: 1,379 frames, 106 actual geometry audits, zero intersections. Hand/foot errors below 0.015 m; final hand maximum about 0.00000013 m. Previous failed checks exposed and corrected grip reach, initial arrival orientation, sliding and the fence rail.
- Unseen pursuit: actual hidden travel reached 4.395 m/s in the test, all visible frames stayed at or below the 2.1 m/s standard walk. FOV/aspect cases, rear glance, wall cover, close range, water pace and arrival progress pass.
- Walking/fade test: continuous motion across all 540 samples, over 2.26 m of cross-corridor travel, maximum per-frame opacity change 0.00523. Normal and interrupted fades, pause and reset pass.
- Browser walking sequence: seven high-resolution time samples plus 1280x720 and 390x844 views; actual Q key slows Joe. Scythe browser suite: seven Joe/ghost views, audio, camera preferences and geometry checks. No console/page errors. Inspected actual 2560x1600, desktop and phone screenshots.
- Installed web-game client completed; latest screenshot and text state inspected, ready/playing, no error artifact.

Artifacts: `output/under-green/scythe-walking-shadows/` and updated `output/under-green/scythes/`. No new long-duration performance claim. Existing server 4187 retained; no commit/deploy or unrelated broad-goal work.
