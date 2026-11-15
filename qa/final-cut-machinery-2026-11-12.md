# Final Cut — constructed cutting reels and saved mechanism phase

FC18/FC23/FC47/FC58/FC66 progress. The full 72-item goal remains active and incomplete.

## Changes

`web/final-cut-machinery.js` replaces three solid cylinders with six helical steel blades per bank, visible shafts and support spokes, fixed end bearings and bolts, upper guards and a fixed bedknife. The bedknife has a small radial clearance from the rotating tips. Construction uses indexed vertex-colored geometry with one shared material, no new texture, light or render target. The two wings share their geometry; the shorter center bank has its own pair. There are four unique geometries, 3,464 unique triangles and 5,196 triangles across the three instantiated assemblies.

All constructed vertices remain within the existing 0.32 m reel radius and original authoritative widths. The stationary and rotating meshes each participate in the existing actual-geometry audit. Folding and damage dimensions remain unchanged, including the conservative reel contact envelopes. The scene now audits 77 meshes; the wings contain 28 audited meshes for the same 26 authoritative wing parts because each reel has a rotor and fixed housing.

The old reel spin came from total vehicle distance, so turning with raised cutters still rotated the blades. Simulation now owns a bounded `reelAngle` advanced at 8 radians/second only during actual successful cutting travel. It remains braked on raised headland turns, blocked passes and other inactive phases. The existing six-second collapse slowdown continues from the earned reel phase. Fixed bearings never spin with the shaft.

Wheel rotation was reversed relative to the renderer's negative-z forward axis. It now rolls in the correct direction for forward motion and clearance backing. At physical victory, `wheelBase` and `reelBase` are captured in the ending state. Existing version-1 saves carry these optional fields; legacy or malformed values restore finite zero defaults. The renderer reconstructs wheelspin and reel slowdown from these saved bases and the existing ending clock. This fixes reset orientations on reload without changing movement, targeting, contact, route timing or the trap condition.

## Evidence

- `tools/verify-final-cut-machinery.mjs`: four groups pass. At 30/60/120/144 Hz, actual cutting drives the reels and a moving headland turn leaves them braked; wheel angle matches rolling travel. Twenty live-trap snapshots retain nonzero mechanism phase through serialization/restoration. Pause and shutdown stop exactly. Legacy/malformed values restore finite defaults. Every constructed vertex fits the original radial/width envelope; largest measured radius is 0.320000012 m, floating-point noise.
- `tools/verify-final-cut-machinery.cjs`, hardware and `--software`: four groups, ten screenshots and zero browser errors each. Actual pass motion turns all three rotors while bearings stay fixed. Actual turn motion does not rotate inactive reels. Live trap, pause, actual browser reload, settings-based reduced motion and shutdown pass. Maximum restored world-space rig-vertex displacement: **0 m**. Repeated warmed camera sweeps/updates keep geometry and texture counts stable within the context.
- `tools/verify-final-cut-rig-browser.cjs`: eight yaw/rolling/cutting/turning poses pass with independently varied reel angles; 77 meshes, approximately 4.8e-8 m maximum envelope excess. `tools/verify-final-cut-folding-browser.cjs`: ten deployment/yaw combinations against four wall heights pass with 28 wing meshes and real corner backing recovery. The folding browser audit ran before the final bedknife changed from a box to a narrow radial sector; final full-vertex radial/width validation and final hardware/software folded captures cover that refinement.
- `tools/verify-final-cut-rig.mjs`, `tools/verify-final-cut-folding.mjs`, `tools/verify-final-cut-ending.mjs`: existing contact, clearance recovery, trap, save, pause, gate and completion checks pass. Main `tools/verify-final-cut.mjs` passes thirteen groups and seven complete simulated routes with unchanged timings.
- `tools/verify-final-cut-acting.cjs`: seated control targets, phase cycle, pause/restore and continuous dismount pass. Maximum foot/hand errors remain below 0.001 m. The machinery change does not displace Joe or his controls.
- `tools/verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/machinery/route`: completed-result fixture unlocks Replay, followed by an uninterrupted actual Gamepad API run with no live placement. Original-plan bank route completes in 134.861 simulated seconds, zero captures/throws/errors, nine screenshots. This is one chapter run, not a full campaign or human playtest.
- Installed web-game client, final two iterations: exit 0, `client-final/shot-1.png` and `state-1.json` inspected. Playing at 6.52 seconds; waiting rig and all reels stopped; 90 draws, 68,404 submitted triangles, 42 geometries, 17 textures in that software view. No error artifacts. Off-screen machinery culling means this view is not representative of close rig cost.

Inspected the close blade/shaft/guard view at 2560×1600, 1280×720, 844×390 and 390×844, plus the half-folded underside/end bearing on hardware and software. The narrow portrait view intentionally shows a section of the bank; camera movement can inspect its full length. The shader/material is visible on the actual RTX 3090/D3D11 hardware renderer and SwiftShader. These are authored inspection positions with already-cut terrain, not proof that a new player notices the mechanics during danger.

Artifacts: `output/final-cut/machinery/`, plus the existing `rig-contact/`, `folding/`, `acting/` regression reports.

## Rendering cost and limits

`tools/profile-final-cut-machinery.cjs` compares the former solid-cylinder geometry with the constructed reels, using the current state clocks for both. It runs reference/current/current/reference sequentially in one SwiftShader browser, four warmups and twelve frozen full-RGBA-readback draws per view at 960×540.

| View | Cylinder-reference median range | Constructed-reel median range |
| --- | ---: | ---: |
| Arrival | 142.3–143.5 ms | 141.6–155.1 ms |
| Close deployed rig | 103.5–110.9 ms | 102.3–106.2 ms |
| Half-folded rig | 100.9–118.3 ms | 102.1–102.9 ms |
| Collapse | 142.9–154.1 ms | 145.8–147.3 ms |

One detailed arrival block has a 277.6 ms p95 spike. Baseline drift and readback overhead prevent a reliable incremental-cost or performance-win claim. Overall software scene cost remains high; these frozen diagnostic measurements are not sustained gameplay FPS or release qualification.

When all three banks are submitted, the new geometry adds three draws and 5,052 triangles versus the cylinder reference, with no additional textures. The reference creates one shared unit-cylinder geometry instead of reusing the scene's existing cylinder, so reference geometry-memory differences are not an exact old-build allocation comparison. The shipped implementation's new resources are four geometries and one material; shared geometry is disposed by the scene traversal, and the module disposes its material.

## Remaining scope

Telescoping hydraulics, hoses, power-unit material/detail work, suspension response, running-board/ground foot plants, fingers and final acting/silhouette polish remain. Existing turning mechanics are unchanged. The chapter still needs full supported-device/campaign/lifecycle qualification, sustained performance work and human fun/fear/readability/listening acceptance. The local machinery checks do not close those broader requirements.
