# Menu pixel finish — 2026-11-14

Implemented the ten approved menu refinements.

1. Weathered original pixel title: new SVG retains recognizable lettering, adding small edge chips, cut lines and turf interruptions.
2. Shared icon scale: 16px pixel symbols, 32px preview/launch symbols, crisp glyphs, square badges and pixelated thumbnail sampling.
3. Landmark crops: tuned all four thumbnail focal positions; widened portrait single-card art to 40% for legible landmarks.
4. Caption backplates: compact dark, bordered plates keep location text legible across all four panoramas.
5. Chapter trim: static turf notches, shed rivets, drain slots and tournament pennants.
6. Start Game silhouette: stepped corners, raised edge and original mower-blade SVG.
7. Press feedback: one-pixel depression with compressed/inset shadows on launch, navigation and chapter buttons.
8. Focus: four bright inset corner brackets, with dark brackets on the cream launch button; independent of selected-card check/two engraved corners.
9. Spacing: more header/title clearance and spacious-desktop footer padding; tighter supporting links/controls; compact breakpoints retained.
10. Palette: midnight greens, weathered cream and muted brass with restrained chapter variations and coherent thumbnail grading.

Production changes: web/course-menu.css, web/course-menu-ui.js, web/assets/menu/rough-cut-weathered.svg, web/index.html cache keys. No game loop or particle changes; no new timer or continuous animation. SVG authored as vector geometry, no raster generation.

Validation:
- Native D3D11 idle baseline: 79.20/73.28/70.47 ms task duration per 3 seconds. Updated: 58.44/58.07/59.04 ms. Both 59/59 moving frame intervals, zero layout work, repeated artwork copies or observed browser-layer paints. No measured regression; shared-machine samples do not establish a general speedup or directly test YouTube playback.
- Chapter picker: mouse, touch, keyboard, controller, Settings return, all four previews, all destinations and actual Night Order launch passed. Secondary destination content stubbed after navigation; pages return HTTP 200.
- Gallery tests: equal desktop cards, rapid transition cleanup, real completion records, invalid storage, scroll cues and reduced motion passed.
- Inspected 2560x1600, 1280x720, 390x844 screenshots; 844x390 launch bounds also passed. Inspected keyboard-focus and pointer-down Start Game screenshots.
- Installed gameplay client via existing adapter: actual 2492x1402 capture, first_hole state; screenshot inspected.
- JavaScript syntax and targeted whitespace checks passed.

Evidence: output/menu-pixel-finish (before/after timing reports, baseline sources, layout, features, focus/pressed and gameplay captures).

- Final lifecycle suite passed all chapters, blur/hidden/reduced motion, dialogs/Settings, context recovery, quiet-area pixels and 30-second continuity (54–59 visible particle shapes). No browser errors.
