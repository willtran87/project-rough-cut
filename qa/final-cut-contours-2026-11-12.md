# Final Cut — authored fairway and finishing green

The championship turf now has a shaped fairway that passes east of the pump shelter and bank wall, bends west alongside the low swale, and meets a collar and putting green around the existing flag. Alternating mowing tones and a smoother short-turf treatment distinguish these areas from the surrounding ground. This advances FC09/57; it does not complete the wider layout, landmark staging or human comprehension requirements.

The central 48 × 96 m surface is one mesh, 1,054 triangles and one material using the existing grass texture. Ground polygons are partitioned around the green rather than layered over each other. Vertex tint enters the existing turf color correction before lighting, avoiding a dark rectangular boundary. Outside turf keeps its original texture treatment. The surrounding ground is split into four pieces to remove an unnecessary full floor beneath the central slabs. The existing walking slabs, heights, cover sectors, collision, routes and encounter rules are unchanged.

Visual review rejected an earlier fairway running beneath the pump shelter. The independent footprint audit then caught the return bend entering the swale's northeast corner; it now begins after the swale. No failed intermediate result is counted below.

## Verification

- `node tools/verify-final-cut-contour.cjs` and `--software` pass on D3D11 and SwiftShader, nine captures each and zero browser errors. Actual mesh ray tests cover 4,608 ground samples with exactly one hit each. Total projected area is 4,608.0000403 m²; maximum height error against the existing 0.006 m surface is 5.22e-11 m. Positions and normals are finite.
- A separate 7,605-point test samples built mesh faces inside the existing bunker, pump, bank wall, swale and pavilion-approach footprints. No maintained-fairway face intrudes. This is independent of the profile interpolation; finite sampling is not an exhaustive analytic proof.
- Inspected high-resolution 2560 × 1600 arrival/overhead/fork/green and fully cut views, plus 1280 × 720, 844 × 390 and 390 × 844 arrival layouts. The narrow portrait view retains free look. Tall cover still conceals much of the fairway before it is cut; this pass does not establish a complete initial overview of the swale.
- During this pass, the actual-lighting suite passed five groups including architectural occlusion, movement, pause/reload, reduced motion and collapse. That run preceded the final profile-only adjustment at the swale. Final renderer captures and completed-render profiling use the final profile.
- Ground support tests pass four groups at 30/60/120 Hz with zero planted-foot drift. Main encounter tests pass thirteen groups and seven routes, including fully cut recovery. These are automated simulation checks, not first-time comprehension or pacing evidence.
- An uninterrupted original-plan bank route through normal Gamepad API handlers completed in 131.5616 simulated seconds, zero captures, zero throws and zero browser errors. It uses a completed-result fixture only to unlock Replay before the route; no live player placement. That route preceded the final fairway profile adjustment; gameplay geometry and rules did not change. Its lure view shows the finishing green beside the prepared swale.

## Measured render cost

`profile-final-cut-contour.cjs` compares a saved pre-change scene with the current scene sequentially in ABBA order in one browser. Each frozen view has four warmups and twelve timed draws, each completed with full RGBA readback. Values below average the two per-variant medians. Readback is included; these are not sustained gameplay FPS measurements.

| View | D3D11 baseline → current, ms | SwiftShader baseline → current, ms |
| --- | --- | --- |
| Arrival | 4.65 → 4.70 | 150.55 → 153.00 |
| Fork | 3.80 → 3.70 | 99.35 → 99.50 |
| Green | 3.60 → 3.35 | 35.90 → 38.55 |
| Collapse | 4.75 → 4.50 | 92.25 → 93.80 |

D3D11 rendered at 1280 × 720 on the RTX 3090; SwiftShader at its existing 960 × 540 cap. Hardware differences overlap the observed baseline variation and do not establish a speedup. Software adds approximately 0.15–2.65 ms in these samples. Each view gains one draw and 1,090 submitted triangles, including the split surrounding floor. The contour adds one geometry and no textures: observed warmed scene counts are 48 geometries / 20 textures. The software renderer remains unqualified for sustained performance.

Artifacts are under `output/final-cut/contours/`: `hardware/`, `software/`, `baseline/`, `route/`, `profile-hardware.json`, `profile-software.json`, and the saved `baseline-scene.js`. The installed develop-web-game client passes in `client-verified/`. Its latest screenshot and state were inspected: 6.52 simulated seconds, player at the closed course rail, rig waiting, dry swale, 48 geometries / 20 textures, and no captured browser errors. All owned test/profile processes reached terminal exit 0 after fixes.

Remaining: FC04 full-problem sightline, full dogleg/landmark and encounter composition, stronger rig/actor/dramatic work, human fun/fear/listening/comprehension, supported physical devices, full campaign and sustained performance. The original 72-item implementation goal remains active.
