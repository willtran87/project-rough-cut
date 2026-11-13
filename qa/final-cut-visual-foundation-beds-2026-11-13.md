# Final Cut — grounded refuge planting

Progress on FV17/FV27 and a refinement of FV24. The previous refuge planting put many roots inside the 0.7m masonry envelope, hiding the intended foundation detail. A shared authored layout now places 18 irregular beds outside the walls, with dominant crowns, younger companions, smaller skirts and bare pockets. The pump has denser damp growth; the pavilion retains lower ornamental remnants; the bunker has compact rough growth. The existing pixel foliage atlas is reused.

All 202 foundation plants follow actual slab height plus 2mm. Their heights range from 0.15m to 0.66m; each crown is limited by the available soil beside service paths and other slabs. The especially narrow west pavilion margin receives smaller, fewer plants. Door throats and actual cutting sectors remain clear. The leaf-litter ground mask now follows the same bed centres and leaves navigation slabs uncovered. Ground height, collision, concealment state, inputs and save data are unchanged.

## Verification

- `tools/verify-final-cut-foundation-layout.mjs`: 18 beds, 202 deterministic roots, 72 bunker/72 pump/58 pavilion plants. Roots outside masonry and cutting sectors, grounded height, conservative crown clearance from every path/gravel slab, litter under every crown, clear door traversal and litter-free navigation samples pass. Minimum bed weight at a root is 0.60125.
- `hardware/report.json`, `software/report.json`, `before/report.json`: 18 views each, native 2560x1600 and fallback 960x600 at the largest viewport, plus 1920x1080, 1280x720, 844x390 and 390x844. Actual strafe, exact pause, no horizontal overflow and warmed resource stability pass. No browser errors.
- Visually inspected final bunker front, pump front/west, pavilion front/west, doorway and portrait views. A first test placed the bunker camera on the raised overlook boundary and tried to strafe against its rail. Corrected to a ground-level camera outside that boundary and a known clear pump approach for movement. The original failed fixture does not represent a runtime movement regression.
- `source/manifest.json` retains five final source/test snapshots and hashes; `comparison.html` contains matched before/after views.

Vegetation changes from 689 to 735 plants and 16,536 to 17,640 triangles, retaining eight batches and the existing textures. Matched native overview is 419 draws before/after; pump front 221; pavilion front 95. Submitted triangles increase by 1,104 / 624 / 144 respectively. Warmed native resources remain 140 geometries/57 textures. The ground mask remains 512x768 RGBA, 1,572,864 bytes; affected texels decrease from 30,394 to 30,209 as broad continuous litter bands become shaped beds. No isolated frame-time acceptance is claimed.

This pass improves building/ground integration; broad facade values, close material scale, roof finish and matched Level 1 acceptance remain open. The full 72-item goal remains active.

Final route/concealment verification: routes/browser.json passes all three uninterrupted input-driven direct/garage/drain routes through ball distraction, crossings, pump, bell, physical collapse and road completion. Four heard redirects, zero captures, 77 screenshots and no browser errors. sightlines/report.json passes all 48 concealment comparisons with no failures/errors. Final software pump close view inspected; warmed resources 140 geometries/54 textures.

Installed web-game client63474 completed with exit0. Fresh client screenshot/state inspected: ready/playing, intro completed, ordinary movement to(-1.8880467,4.7372006),960x540 framebuffer and202foundation plants. No browser-error artifact. All owned jobs are terminal; source hashes match the retained five snapshots.
