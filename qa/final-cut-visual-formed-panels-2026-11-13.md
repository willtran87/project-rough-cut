# Final Cut manufactured body panels

Scope: FV36, with contributions to the still-open FV35 silhouette and FV37 material finish. The preceding list-only review did not advance implementation. This pass revalidated and completed the pending formed-panel work against current source and actual rendered geometry.

## Implementation

- Replaced duplicate roof slabs with a chamfered, crowned canopy: folded perimeter, underside channels, crossmembers, stiffeners, fasteners and a real cab-light mount. Registered the canopy in RIG_BODY so its visible shape participates in the shared contact envelope.
- Formed the hood shoulders and waist, separated two recessed service lids with physical gaskets, hinges, latches and filler caps. Moved the oil's height threshold to the actual lowered lid surface.
- Pressed the side-console faces and engine side/rear bands. Added folded returns at the rear radiator opening while retaining the actual ventilation and engine depth.
- Replaced generic wing deck/trim boxes with chamfered deck edges, sloped shoulders, integrated warning paint and three physically recessed rear panels per wing.
- Removed broad duplicate decorative overlays that covered the new forms. Existing curved fenders, hydraulic fittings, tires, engine, cab controls and guarded lamps remain.
- Thirteen formed meshes (nine chassis, four wing), 3,308 triangles, one shared authored material. No new artwork textures. Warmed repeated-deployment resources remain stable; this is not a frame-time or whole-level performance qualification.

## Verification

- Final bodywork2632: actual vertices inside all nine body envelopes, maximum excess 1.32e-8m; at least 0.38433m separating clearance from actual skinned legs; no seat/back/support triangle intersections. Live physical collapse, pause, exact reload (zero vertex restore error), reduced motion and stable resources pass.
- Final transfer46803: 322 actual skinned-triangle/support poses, zero contacts/support failures; maximum foot-target deviation 2.70e-7m.
- Final folding98077: ten deployment/yaw poses, all 24 authoritative wing identities/28 rendered meshes, actual triangle clipping at four masonry heights; maximum excess 4.77e-8m. Real corner backing/folding/recovery and four viewport captures pass.
- Pure rig: 2,000 independent seeded contact comparisons, continuous sweeps, masonry and 30/60/120/144Hz contact checks pass.
- Cab lighting98610: front face gain 10.602, grip gains 2.567/3.095; eight heading/phase states, four saved endings, concealment, pause/reload and reduced motion pass. This ran before the final bounded rear-band shaping and oil-threshold change; neither alters the roof, fixture or cab state.
- Final native hero84414: six ordinary player-camera views, actual keyboard strafe, five viewport sizes, tire contact/resource checks and no errors. Inspected front/rear/hood views alongside elevated panel diagnostics.
- Dedicated formed-panel audit reads actual batched post transforms and raycasts the actual canopy: all four posts overlap its supporting channels by 0.04m; lamp-to-mount gap 5.67e-9m. Direct visible-pixel comparisons exclude cast-shadow contributions. Initial harness errors assumed an unbatched post and a wrapped lamp group; corrected the instrumentation to the actual rendered objects without changing production geometry or weakening assertions.
- Final hardware99805: roof/lids/wing/rear show 204,335 / 195,866 / 140,384 / 153,889 changed pixels. Five native viewports, stable geometry/texture counts and no errors. Roof, lids, wing and rear images visually inspected. Diagnostic captures restore the production background pass.
- Initial software12387 terminal PASS: same physical support checks, four detail views and five viewports; internal 960x600 at 2560x1600, 960x540 at ordinary desktop and native compact sizes. Final background-composited capture run37822 pending at this note.
- Initial full routes78355: all three real-input routes, four heard-ball redirects, pump/bell/collapse/road completion, zero captures/errors, 77 screenshots. The final bounded rear-band edit occurred during this run; use the final-source repeat71900 for final route acceptance.
- Concealment23808: 48 exact hidden-rig present/removed image pairs pass. Final rear-band change remains inside the same concealed body envelope; oil threshold only alters the concealed material.
- Installed client9347 terminal exit0 after final runtime edits. Fresh shot/state inspected: ready/playing, intro completed, player y4.7372, 960x540 internal render, all thirteen formed meshes/3,308 triangles. No errors artifact.

## Remaining scope

Nearby headlight-lit masonry still washes out in native and software captures. FV13 remains open. Overall hero silhouette approval, richer localized wear, Joe's pixel treatment, environment/refuges/terrain/effects/story/UI and matched Level1 acceptance remain unfinished. Neither these geometry tests nor the route regressions establish whole-level visual parity.

## Final receipts

- Final software37822 terminal PASS: all four support/visibility views and five viewports, stable 132 geometries/54 textures, no errors. Native lids and compact portrait wing image inspected. Hardware retains 132 geometries/57 textures; differing shadow resources are intentional.
- Final-source full routes71900 terminal PASS: all three real-input entries and routes, four heard-ball redirects, bank/open crossings, pump/bell/physical collapse/road completion, zero captures/errors and 77 screenshots. This supersedes the mixed-source route run for acceptance.
- Final folded-wing native image and installed-client screenshot/state inspected. Eight source/test snapshots and SHA256 manifest retained in output/final-cut/formed-panels/source.
- FV36 complete. Ledger: 17 complete / 26 in_progress / 29 pending. All 72 requirements remain in scope and the goal remains active. Next: FV13 near-field headlight washout and beam response; preserve physical light origins, reveal/concealment and shadows.
