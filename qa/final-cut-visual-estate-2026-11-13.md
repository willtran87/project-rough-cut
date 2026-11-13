# Final Cut visual implementation — estate pass

The full 72-item visual plan remains active. This pass adds work toward the planting, architecture and signage requirements; it does not establish Level 1 parity or complete those requirements.

## Implemented

- Five existing Level 1 plant forms on world-rooted bent geometry, plus irregular gravel margins and leaf-litter patches. The low planting stays outside cutting sectors or against existing walls. Coherent wind respects reduced motion; nearby passing machinery bends the plants.
- Separate roof profiles for the low bunker, functional pump shelter and steeper ceremonial pavilion. Overlapping slates, folded sheets, thick half-round ridge caps, gable trim and roof framing stay above existing head clearance.
- Bevelled masonry faces with recessed mortar inside the original solid wall envelopes. Per-block texture phase avoids a single continuous pattern across the wall, but repetition remains visibly too strong.
- Smaller refuge/direction labels, reduced repeated billboards, mounted kiosk labels and physical sign backings/fasteners. Initial pavilion fascia and bell-post text occlusions were found in screenshots and corrected; the latest pavilion screenshot confirms clear lettering.
- Gravel now has its own footstep surface/sound instead of being classified as turf.

## Verification

- `output/final-cut/visual-estate/accepted/report.json`: seven fixed views at actual 2560x1600; hardware tiers 1600/1920/2560 and persistence pass. Viewports 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844 have no horizontal overflow. No browser errors. These are rendering/behavior checks, not a blanket artistic acceptance claim.
- `routes/browser.json`: direct, garage and drain full routes complete using ordinary Gamepad input, without live route-state placement. Includes crossings, pump, bell, collapse, road and completion. Zero captures and zero browser errors. Times: 120.280, 103.368 and 130.074 simulated seconds.
- `ambush-hardware/report.json` and `ambush-software/report.json`: four-direction tells, escapes, pause, rider contact and muted/reduced warnings pass.
- `occlusion.json`: all eight paired tell/no-mower captures are pixel-identical. The added estate detail does not expose the concealed machine in these fixtures.
- `client/state-0.json`: installed web-game client finishes ready/playing after the intro and real movement to y=9.531. Its initial five-second start-button click timed out during software warmup; the subsequent keyboard sequence succeeded. Screenshot inspected; no error artifact.
- `output/final-cut/feedback/audio-render.json`: turf, rough, gravel, paving, road, wet and muted audio fixtures pass surface selection, finite/bounded output and silence-tail checks.

## Reference limitations and remaining visual work

`output/final-cut/level-one-comparison/` contains a twelve-view native-chapter comparison gallery. The first building viewpoints were obstructed and were replaced. It records actual framebuffer sizes: Level 1 currently captures a 1280x720 internal scene within a 2560x1600 screenshot, whereas Final Cut renders 2560x1600. Both use FOV 58, but building distances, native light, aspect ratio and standing eye height differ. These views are useful evidence, not a finished matched acceptance sheet. Machinery craft references and normalized exposure/composition remain open.

Inspection confirms the most visible remaining problems: oversized close reed blades, overly regular border plant groups, repetitive stone patterns, incomplete wall ends/corners, broad flat interior equipment and insufficient material/acting detail on Joe and the mower. The planting response still needs actual chassis/wing contact and settling history. Further roof damage, interior dressing, fixture finish, terrain shaping, effects, story continuity and UI polish remain in the original plan. No requirement has been removed.

Draw counts in the current fixed views range from 70 to 276. This is not a performance budget or sustained frame-rate measurement; full software/worst-case profiling remains open.
