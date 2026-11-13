# Under the Green visual pass 23: Joe identity and contact wear

V42 and V43 accepted locally. All 53 visual requirements and seven full-level release gates remain in scope.

Joe retains the seven byte-identical embedded Level 1 texture maps (1254px sweater/face, 627px collar/skin/leather/trousers/hair). The local adapter now also applies the established blue shirt tint and 48-step lighting palette. Nine non-emissive material finishes distinguish wool, skin, leather and rubber. Mud dulls highlights; wet leather was reduced after an overly glossy intermediate was rejected. Original face blending remains.

Per-foot wetness samples real rendered soles against shared puddle/channel/flood heights. Damp hems dry over 45 seconds; soil remains. Real dangerous-channel recovery wets hands and sweater/shirt cuffs, drying over 30 seconds. Geometry attributes limit these effects to appropriate parts. Pause freezes history; a fresh run clears accumulated dampness. No collision, pursuit, movement or input changes.

## Verification

Final artifacts: output/under-green/visual-upgrade/pass23-complete/{hardware,software}/report.json. Both report passed=true and zero errors; no matching test process remains live.

- verify-under-green-actor-surfaces.cjs: 30 native/responsive views (actual2560x1600,1280x720,390x844,844x390); 27 software views (actual960x600 at2560x1600 viewport). Front/side/rear/feet dry, flooded and drained; real simulation jet contact; cuff coverage including Collar material; drying residue; actual pause/resume; fresh-run reset. The reset is a createRun test, not an actual UI retry-button test.
- verify-under-green-actor-wetness.mjs: PASS on final source. Per-foot contact, shallow water versus retained high damp marks, drying/residue, real jet recovery, same-time freeze and new-run reset.
- pass23-clearance: 1379 dry-route frames,106 actual mesh audits,zero intersections,max foot error2.414686e-7. This preceded final color/tint and cuff mask refinements; those later edits change no positions or kinematics.
- Installed develop-web-game client: five screenshot/state pairs in pass23-client-complete, no error artifact, process terminal. Final shot4 inspected: playing at(0,8.84),actual960x540. Prior initial click timeouts are not treated as gameplay acceptance; dedicated tests cover actor behavior.
- Visually inspected final native front dry, cuffs after actual jet, portrait390x844, software damp feet and installed-client final gameplay. Earlier work also inspected native side/rear. No new glow, no bright wet-cloth blanket.

## Cost and limits

Matched native front dry:111 draws,134878 triangles,79 textures,131 programs both before/after. Wear adds227904 attribute bytes (about0.217MiB) and zero texture maps. Shared finish uniforms prevent material-specific program proliferation. These counts do not establish frame-time/startup parity. Shader work requires full-level profiling.

Evidence for Level 1 asset identity: pass23-source/reference-textures.json. Final runtime and tests snapshotted with SHA256 in pass23-source/final-hashes.json. Whole-level matched Level 1 quality, performance, remaining architecture/water/lighting and V45/V46 attack polish remain open. Ledger18implemented/30in_progress/5pending;allsevenreleasegatesopen.
