# Final Cut — connected wing hydraulics

FC18/FC23/FC47/FC58/FC64 progress. The full chapter and 72-item goal remain incomplete.

## Implementation

The two rigid brass bars have been replaced by articulated hydraulic cylinders, glands, fixed-length piston rods, pinned clevis mounts, supply fittings and two slack hoses per side. `web/final-cut-hydraulic-layout.js` defines these parts in rig-local coordinates. `web/final-cut-hydraulics.js` constructs the same parts in the scene.

Each chassis mount stays fixed while the opposite mount follows the actual wing transform. The 0.92 m piston rods slide inside their barrels; they retain engagement throughout the 1.144–1.953 m pin-to-pin range. Hoses bend upward and forward, and a bounded solver retains their sampled lengths at 0.74 m and 1.18 m. Their maximum measured length error is approximately 0.016 mm. These are visual mechanisms driven by the authoritative wing pose, not a new fluid/force simulation.

The same mechanism follows both sides' different strains during the existing collapse and inherits the body's sinking/rolling transform. No independent animation timer, save field, interaction or control was added. Existing pause, reduced-motion body behavior and saved ending clocks remain authoritative.

There are 64 hydraulic pieces in five instanced batches using two shared geometries and existing materials, with no new texture, light or render target. Matrices update only when either wing angle changes. The layout cache holds two poses, including cached clearance envelopes; unchanged turns/cutting poses do not repeatedly solve hose shapes. The instance buffers are disposed with the module, and geometry remains owned by scene disposal.

Masonry clearance now includes each actual cylinder, mount and hose segment, clipped by wall height. The old decorative bars were removed from `RIG_WING_PARTS`. Player damage footprints and movement/targeting rules are unchanged, but the structural clearance model now represents the new geometry. Existing route and corner-recovery timings remain unchanged in the tested cases.

The scene audit now reads the actual hydraulic **instance matrices**, rather than detached mesh proxies. There are 139 audited rig meshes/instances: 26 rendered wing meshes for 24 original wing structures, plus 64 hydraulic pieces and the existing chassis/wheels/center reel.

## Verification and corrections

- `tools/verify-final-cut-hydraulics.mjs`: 121 folding positions, seven steering settings and 8,869,784 sampled tube-surface/tyre comparisons. Hoses also clear the cab-post boxes. Fixed rod length, barrel engagement, available stroke and hose length checks pass. Tube surfaces use the rendered eight-sided cross-section with sixteen additional longitudinal subdivisions; this is sampled conservative-volume evidence, not an exhaustive arbitrary-geometry collision proof.
- The first endpoint-only tube test missed a tire intersection in the middle of an extended barrel. Longitudinal sampling reproduced it. Moving both mounts 0.15 m rearward, including their clevises and ports, fixed the reported overlap. Final dense checks pass; the sparse initial pass is not treated as proof.
- `tools/verify-final-cut-hydraulics.cjs`, hardware and software: 27 actual instanced-geometry poses against eight masonry heights, 353,532 clipped vertex/triangle-edge samples per renderer, eight screenshots and zero browser errors. Maximum containment excess is approximately 4.4e-7 m; independent pin-center/mount error approximately 1.3e-7 m. Actual announce/deployment, pause/resume, physical victory, asymmetric collapse, browser reload and reduced-motion settings pass. Maximum restored hydraulic geometry shift: **0 m**. Warmed camera sweeps retain stable geometry/texture counts.
- Final hardware captures use coherent announce-state captions for the authored folding fixtures and restore the inspection camera after reload. Software was also rerun after the fixed-length rod refinement.
- Existing rig and folding browser suites pass: eight contact/roll poses with 139 audited objects, ten wing folding/yaw cases with 26 wing meshes and actual corner backing recovery. These regressions preceded the final hidden rod-tail refinement; final hydraulic triangle audits and dense tube checks cover that refinement. The exposed rod endpoint and containing barrel did not change.
- `tools/verify-final-cut-folding.mjs`: eight actual ten-second corner/deployment recoveries at 30/60/120/144 Hz, no penetrations/captures and unchanged recovery positions. Main rule suite passes thirteen groups/seven complete simulation routes, including both alternate schedules and fully cut terrain, with unchanged timings.
- `tools/verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/hydraulics/route`: original-plan bank route completes through actual Gamepad API input in 134.861 simulated seconds, zero captures/throws/errors, nine screenshots. The completed-result fixture occurs before Replay; no live gameplay placement afterward. This route ran before the final hidden rod-tail refinement; final actual deployment/trap/reload checks cover that contained geometry change. It is one chapter route, not a full campaign or human playtest.

Inspected close linkage views at 2560×1600, 1280×720, 844×390 and 390×844, the fully raised linkage on hardware, and the half-folded mechanism on software. The short visible rod retracts into the barrel; the mounts remain seated and hoses bend around the assembly. Portrait deliberately frames only part of the mechanism, which can be inspected with the free camera. These visual fixtures do not establish first-time player perception or fear.

Artifacts: `output/final-cut/hydraulics/`, plus current rig-contact/folding regression reports. The final installed web-game client completed two input iterations and exited 0. Its latest shot-1.png and state-1.json were inspected: playing at 6.52 seconds, both wings raised with approximately 4.4 cm rod extension, 90 draws / 68,404 submitted triangles, 44 geometries / 17 textures in that software view, no error artifacts. The rig is mostly outside that view; these counts do not represent close mechanism cost.

## Performance evidence

The initial local nearby-masonry microbenchmark was about 0.264 ms per call. Caching envelopes, reusing complete projections below the wall height and removing intermediate hose-solver arrays reduced the final local mean to 0.0734 ms, p95 batch mean 0.0753 ms. The previous machinery pass measured about 0.047 ms before adding these structures; these separate runs are not a matched device benchmark. Distant broadphase remains approximately 0.0010 ms. This is Node CPU timing, not frame-rate evidence.

`tools/profile-final-cut-hydraulics.cjs` runs former-bars/current/current/former-bars sequentially in one SwiftShader browser. Both references use the current simulation/clearance. Each view has four warmups and twelve frozen full-buffer RGBA-readback draws at 960×540.

| View | Rigid-bar reference median range | Connected hydraulics median range |
| --- | ---: | ---: |
| Arrival | 143.7–158.9 ms | 145.1–148.3 ms |
| Extended | 96.5–112.8 ms | 96.9–113.4 ms |
| Half-folded | 95.3–115.2 ms | 97.6–115.0 ms |
| Collapse | 144.9–159.8 ms | 147.0–162.9 ms |

There are large timing spikes in both variants and drift across blocks. These measurements do not establish a reliable incremental cost, sustained gameplay FPS, or performance acceptance. The final fixed-length hidden rod-tail refinement keeps the same geometry/draw counts and exposed surfaces; it was made after this diagnostic profile. Overall software scene cost remains high.

When fully submitted, the new mechanism adds three draws and 1,864 triangles over the two old bars, with no new textures/materials. The reference creates a separate shared box geometry instead of reusing the scene's unit box, so memory differences are not an exact old-build allocation comparison. The shipped mechanism owns two new geometries.

## Remaining scope

Power-unit panels/materials, chassis detail, suspension, running-board/ground foot plants, fingers and final acting/silhouette polish remain. Wider grounds composition/props, full campaign/device/lifecycle acceptance, sustained scene performance and human fun/fear/listening tests are still open. This pass advances the machine's construction and motion without closing those requirements.
