# Final Cut engine and undercarriage

Status: FV41 complete against its engine/undercarriage requirement. Full 72-item goal remains active.

## Delivered construction

- Replaced the solid frame box with channel rails, crossmembers, axle rods, differential housings, a ribbed transmission, drive shaft and couplings. Four mounts support the rear power unit on the chassis. Paired coolant runs connect front radiator tanks to the rear engine, inside the existing frame envelope.
- Added an engine block, ribbed heads, service filters/collars, intake and external pipework behind actual side ventilation gaps. Existing exhaust tubes enter the engine volume. The rear heat exchanger has separate fins and tubes behind guard bars.
- Built recessed front radiator tanks/core and twin seven-blade fans with hubs and shrouds. Removed conflicting opaque boss overlays, coordinated upper warning plates and retained outer protective guards. Openings reveal real geometry rather than a black texture on a sealed panel.
- Reuses the authored industrial finish atlas. Engine assembly: five meshes, 7,856 triangles, one owned material, no new artwork textures. Bodywork remains eight meshes, now 1,828 triangles. This is bounded added detail, not a complete frame-time budget claim.
- Fan angle/speed belong to simulation state, independent of renderer frame count. Fans start with the existing engine-start event, continue through fast turns, freeze on pause/capture, wind down with the physical ending and stop at shutdown. Optional save fields preserve exact rotor pose/speed without invalidating legacy saves.

## Verification

- `node tools/verify-final-cut-engine.mjs`: six groups pass startup/ramp, steady phase independence at30/60/120/144Hz, actual step pause/capture guards, public snapshot/readSave round trip, physical-ending deceleration/shutdown and bounded legacy fields.
- `node tools/verify-final-cut-engine-browser.cjs`: final hardware75306 passes four actual framebuffer comparisons. With engine cast shadows disabled in both comparison frames, removing each targeted assembly changes80,834front-fan pixels,787,453rear-engine pixels,51,329side-engine pixels and152,829low-rear frame pixels. These measurements establish direct visibility, not artistic quality.
- All actual vertices remain inside their corresponding authoritative frame/radiator/power-unit envelopes across16 heading/rotor combinations and four collapsed ending transforms. Fans follow simulation angle exactly. Actual pause, reload and Reduced Motion preserve pose. Warmed geometry/texture counts remain stable across repeated views.
- Hardware native render:2560x1600,1920x1080,1280x720,844x390,390x844. Inspected front, rear, side and crouched low-rear views. Initial diagnostic views were obscured by standing grass; revised fixtures use fully cut sectors and an unobstructed low-rear camera outside the cutting wings. No runtime visibility shortcuts were added.
- Bodywork verifier7570 passes eight bodywork identities plus the new internal engine mesh, all vertex bounds, five seated actions, actual collapse/pause/reload, reduced motion, skin/seat clearance and stable resources. Transfer44988 passes322 actual skinned-triangle and support poses, zero intersections/support failures, maximum foot-target error2.7e-7m. Those runs preceded the final bounded coolant lines/mounts; the final engine audit confirms the additions remain within the same rigid envelopes used by the transfer audit.
- Final rig browser verifier passes eight heading/steering/reel poses, unchanged cutting reach and physical bounds;129 registered contact meshes. Pure rig regression also passes its seeded2000-pose geometry and fixed-step contact checks.
- Four-direction ambush26095 passes real movement escapes, rustle/audio tell correspondence, concealed lamp suppression, emergence, planted grips/feet, pause, compact layouts and muted/reduced warning text.
- First software66643 terminated at the browser's30s reload navigation timeout after passing all four visible-pixel checks. Changed the harness to wait for DOMContentLoaded with120s plus explicit scene readiness; the replacement run is21739. No game source change was needed for this timeout.

## Remaining scope

Matched Level1 parity, broad mower silhouette/material finish, hydraulic collars/clamps/sleeves, Joe art/acting, exterior fixtures, terrain/refuges/effects/story/UI and complete performance/route acceptance remain in the full ledger. The engine work does not establish those separate requirements.


## Final targeted and route receipts

- Software21739 terminal PASS after navigation-wait fix. Direct changed pixels: front10,323/rear112,695/side7,671/frame21,582. Sixteen geometric poses, four endings, pause/reload/Reduced Motion, stable resources and all five viewports pass without errors. Internal rendering960x600 at2560x1600;960x540 at1920x1080 and1280x720;844x390 and390x844 at compact sizes. Inspected software front and hardware portrait; lower-resolution character/material detail remains visibly coarser as expected.
- Full routes62227 terminal PASS: direct/garage/drain, real Gamepad API movement/look/Use with no live-state relocation, three crossings, pump, four total heard ball redirects, bell, physical collapse, road and completion. Zero captures/errors;77screenshots include four-size entry/crossing views and separate actor/record fixtures.
- Exact concealment17538 terminal PASS:48near/far, offset, standing/crouching views across fourcardinal directions are pixel-identical with hidden rig present/removed. No geometry or light leak introduced.
- All nine source/test snapshots inoutput/final-cut/engine/source match final worktree hashes. Final installed client2896 remains live; await terminal and inspect its new screenshot/state before closing this pass.


## Final smoke receipt

Installed client2896 exited0. Fresh screenshot/state inspected: ready/playing, intro completed, player y4.7372,960x540internal. Five engine meshes/two fans/7856triangles are integrated; rotor angle/speed are correctly zero before startup. No errors artifact. All owned test processes are terminal.

FV41 is complete; ledger15complete/27in_progress/30pending. No whole-level parity or complete-goal claim. Next: hydraulic fittings/clamps/sleeves while retaining existing authoritative extension and hose paths, followed by the remaining full checklist.
