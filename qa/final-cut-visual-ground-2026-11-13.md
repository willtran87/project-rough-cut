# Final Cut ground transitions and shelter construction

This pass completes FV24 and progresses FV15, FV17, FV18, FV29 and FV31. The complete 72-item implementation remains active; terrain shape, hero machinery, character craft and final Level 1 parity remain unproven.

## Changes

`final-cut-ground-finish.js` derives a 512x768 RGBA material mask from 16 actual ground slabs and the three refuge footprints. It blends authored gravel spill, exposed soil, leaf/root litter and flush stone edging into existing ground materials. Door aprons stay distinct from planted west/north/south foundation beds. Boundary beds vary along the estate edge. All detail uses world coordinates; there are no new ground surfaces, collision changes, depth-offset patches or fake live tire marks. The old separate verge-ground polygons were removed. Turf material scale is now 1.9m per tile instead of 3.2m, with restrained fairway/fringe color separation.

The ground atlas's existing gravel and woodland-litter cells supply small stones, leaves and shallow root detail beneath the already-authored verge plants. The fine mineral cell from the stone atlas supplies compacted soil and buried edging without introducing the ground atlas's pictured ruts as alleged player/mower evidence. No new raster artwork was generated in this pass.

Shelters now have 91 individual overhead boards/panels with millimetre-scale bow, 84 steel knee-brace plates and their bolts. The pump has metal cladding; bunker and pavilion have timber. The wood shader aligns grain to each piece's long local axis, including angled braces and vertical posts, with a different phase per instance. Existing roof and wall envelopes remain in place, with all new ceiling work above the player. Exposed end-grain and refuge-specific equipment remain FV29/FV31 work.

## Evidence

Paths are under `output/final-cut/visual-ground/` unless stated otherwise.

- `accepted/report.json`: nine native hardware views at 2560x1600: service edge, pump apron, pump foundation bed, boundary planting, fairway, path junction, and all three shelter ceilings. Real keyboard strafe. Actual framebuffers also checked at 1920x1080, 1280x720, 844x390 and 390x844, without overflow or errors. Ground and ceiling screenshots plus portrait were inspected.
- `software/report.json`: same nine views and responsive checks, no errors. Actual software framebuffer at the initial 2560x1600 viewport is 960x600; 1920x1080 and 1280x720 viewports use 960x540. The small landscape/portrait viewports render at their native dimensions. Boundary-bed screenshot inspected; the lower tier preserves material placement and authored detail.
- `routes/browser.json`: all three uninterrupted direct/garage/drain routes pass using actual Gamepad API movement/look/Use, with pump, crossings, ball diversion, bell, physical collapse, road and completion. Zero captures and no browser errors. New `--compact` retains 20 representative screenshots while running all the same route and viewport checks. These routes precede only the final flush-edging mask and timber phase variation.
- `client/state-0.json`: installed Playwright client completes intro and actual keyboard movement, ready/playing at y=9.531. This first client predates the timber/ceiling finish. Final client is tracked separately below.
- `profile-hardware.json`: same current geometry and materials with only the new ground-blending decorator disabled for baseline. Twelve warmup and 24 timed JS draw plus gl.finish calls per view; no asynchronous presentation fence is timed. Baseline/current medians in ms: edge 1.7/1.6, overlook 3.9/3.2, standing rough 2.5/2.0. Resource counts stay fixed during each sample. Order/warmup/system load can explain lower current values. These samples do not establish GPU completion, a performance improvement, or sustained FPS. A software client was running during this short hardware sample.
- `profile-software.json`: terminal success, stable resources and no errors. Baseline/current call-time medians: edge 2.4/2.3ms, overlook 4.8/4.3ms, standing rough 3.2/3.1ms. The same timing limitations apply, with concurrent browser load. FV71 remains open.
- `client-final/state-0.json`: terminal success on final ground/ceiling source, ready and playing at y=9.531, E bound to Use, actual software framebuffer 960x540. No error artifact; `shot-0.png` inspected. Intro and actual keyboard movement pass. The initial scene is dark and the lighting/readability acceptance remains open.
- Production masonry-envelope test still passes after the overhead additions. Mowing/persistent cuts and physical vegetation response tests pass. No simulation, input, collision or route geometry changed.

## Scope and remaining work

Ground detail is a surface finish, not completion of physical terrain FV16. Fairway authoring still needs matched Level 1 acceptance, and further apron/junction review remains FV17. Saturated ground and water need a separate pass. Shelter cladding/plates do not complete interiors, end-grain, fixture design, exterior roof damage, or distinctive equipment. Hero mower/Joe detail and all remaining effects/story/UI/acceptance requirements remain intact.

Disk handling: 48 superseded PNGs from the prior rough/stone route run were removed after verifying absolute paths inside that generated-output directory. Its report and 23 representative images remain. The new compact route option avoids repeating that volume of output.
