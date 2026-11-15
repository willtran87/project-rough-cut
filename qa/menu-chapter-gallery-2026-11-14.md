# Chapter gallery menu — 2026-11-14

All ten approved ideas are implemented:

1. A selected-chapter panoramic preview uses the existing scene artwork and updates only on selection.
2. Individual thumbnail/feature crops emphasize each setting's landmark.
3. Three chapter groups connect the two Chapter 02 alternatives under one route heading.
4. Original crisp SVG pixel emblems identify the gate, cart, drain and tournament mower.
5. A restrained grounds-department seal balances the left column on spacious displays; the chapter summary now occupies that column as well.
6. Original pixel-number glyphs label chapter groups without downloading a font.
7. Fine engraved corner marks reinforce selected cards.
8. Escaped stamps read actual completion records; no new progress or completion is fabricated or written.
9. A compact mobile logo/chapter header leaves room for the panorama; the gallery adapts to three vertically stacked chapter groups, retaining a paired route row.
10. A finite 240 ms opacity entrance uses 0/50/90 ms staggering and cancels/cleans up; it runs once per page, does not replay on chapter/menu changes, and respects game/OS reduced motion and focus loss.

Completion sources: Night Order's saved career escape count; Back Nine and Under the Green completion booleans; Final Cut career completion or a legacy completed finale snapshot. Missing, malformed and blocked storage produce no stamps. Existing save semantics are preserved.

The new feature image reuses an already loaded source. No image zoom, blur, continuous DOM animation, polling or extra particle batch was added. The particle quiet-area selector was updated for the navigation rail and preview caption. Short desktop spacing was tightened after screenshot inspection.

Evidence: `output/menu-chapter-gallery/`. Feature tests passed all previews/emblems, route grouping, truthful earned/unearned marks, malformed/blocked storage, legacy finale records, one-time entrance cleanup and both reduced-motion preferences. The chapter-picker suite passed mouse/touch/keyboard/controller, settings return, four viewports, selected destinations and actual Night Order launch.

Idle comparison at 2560x1600: baseline task work 71.38/75.41/56.19 ms per three seconds; after 69.51/74.36/76.55 ms. Both moved on 59/59 sampled intervals with zero layout, full artwork copies or observed browser-layer paints. Median main-thread work was about 71 vs 74 ms per three seconds: broadly unchanged, with ordinary shared-host variation. These measurements do not directly test YouTube or whole-machine GPU load.

Final lifecycle tests passed for all four chapters, blur/focus, hidden/visible, both reduced-motion preferences, dialogs/settings, graphics-context recovery, and responsive text protection. Thirty-second continuity retained 53–62 visible fragments; no scheduled particle work remained while inactive. Installed gameplay client passed with mode first_hole, renderer ready, no errors and a 2492x1402 game-canvas capture. Inspected current 2560x1600, 1280x720, 390x844 and 844x390 menu captures, earned-stamp fixture, gameplay capture and final preview still. Syntax/whitespace checks passed.
