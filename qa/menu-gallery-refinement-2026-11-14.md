# Gallery refinement: ten visual improvements — 2026-11-14

Implemented all ten approved refinements:

1. The panorama caption names its location (South Gate, Cart Shed, Drain Entrance, Championship Grounds) instead of repeating the chapter title.
2. A compact header makes room for a taller panorama (178px on short desktop, 340px at large desktop, 170px on portrait mobile).
3. Route/group captions and thumbnail metadata are larger and use readable UI typography.
4. Equal-width chapter cards share image heights, title spacing and bottom edges; geometry is checked at 1280x720.
5. A restrained branching connector joins Chapter 02's two route cards.
6. Static gate/yard/pipe/machinery border motifs distinguish the featured scenes.
7. Summary icons now share the chapter emblems' crisp 16-unit pixel silhouette style.
8. Scroll-edge shading and a More below cue appear only where content remains. They update on scroll/layout events, with no polling.
9. Earned completion stamps use a small uppercase, inset-border stamped treatment; the selection check remains a separate symbol.
10. Chapter changes dissolve the previous image over 180ms after the next image is decoded. Only one outgoing layer is allowed, rapid changes invalidate pending work, and completion/cancellation removes the layer. Text and controls do not animate. Game/OS reduced motion skips the dissolve; blur/hidden/menu exit cancel it.

A touch regression test caught the portrait stage remaining at the landscape aspect ratio between game ticks. The visible menu now directly establishes portrait stage height in CSS, so controls remain reachable even with the test client's manual game clock. The chapter picker subsequently passed all inputs and viewports. A previous test selector also needed to distinguish the current image from the intentionally temporary outgoing image; the updated test waits for transition cleanup before visual captures.

Evidence: `output/menu-gallery-refinement/`. Existing before-source snapshots preserve the prior menu. Feature tests cover equal card geometry, caption locations, finite transition cleanup, rapid switching, mobile scroll cues at both ends, truthful save stamps, and both reduced-motion settings. The chapter picker covers all four previews, mouse/touch/keyboard/controller, settings return, fixed launch visibility, destinations and actual Night Order launch.

Final performance evidence: all 59/59 sampled display intervals advanced, with zero idle layout, full-art copies or observed browser-layer paints. The initial timing samples varied substantially, so a serial baseline/current comparison was repeated. Baseline task times were 113.11/90.13/88.46 ms per three seconds; current 109.27/125.01/97.88 ms. Median main-thread time rose from about 90 to 109 ms over three seconds (about 0.6 percentage points of one core). This is a small absolute cost, not a claimed speedup or exact equivalence. The dissolve only runs on selection, cleans up after 180 ms, and no additional perpetual animation or polling was introduced. Results are local/shared-host measurements, not a direct YouTube or whole-machine GPU benchmark.

Lifecycle checks passed all four chapters, inactive/hidden pause, OS/game reduced motion, settings/dialog return, context loss/recovery, responsive text protection and 30-second continuity (53–67 visible fragments). Inspected 2560x1600, 1280x720, 390x844 and 844x390 captures, including completion stamps and the mobile scroller at both ends. Syntax and whitespace checks passed.

Installed gameplay client passed: actual first_hole mode, renderer ready, no errors, 2492x1402 game-canvas capture. Inspected final gameplay and menu preview images. The recorded preview cycles through chapter changes to show the finite dissolves: `output/menu-gallery-refinement/grass-breeze.mp4`.
