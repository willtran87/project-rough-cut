# Ten menu refinements — 2026-11-14

The clubhouse menu now includes all ten agreed visual refinements:

1. A fine brass selected-card frame, inset chapter-color edge and smaller inset check badge.
2. Fixed thumbnail saturation/contrast/brightness grades tuned for a consistent collection.
3. Denser shading immediately behind the menu panel while the surrounding moonlit scenery stays visible.
4. Larger chapter title, quieter subtitle and chapter-colored kicker.
5. Shared gutter/gap values and coordinated header, card, navigation and footer spacing.
6. Restrained grain, subtle top lighting and fine borders on the panel surfaces.
7. A refined static brass Start Game gradient, inset rim, framed arrow and tactile pressed state.
8. Consistent hover borders and 2px keyboard focus outlines across interactive elements.
9. Grouped secondary footer links with fine underlines and quieter control hints.
10. Moonlit green, faded amber, drainage teal and cold steel chapter accents in kickers, icons and selection details.

No new idle animation, backdrop blur, animated filter or image zoom was added. Thumbnail filters are static. The existing grass renderer, counts, cadence and pause behavior are unchanged. Short desktop spacing and large-screen image heights were refined after screenshot review to fit summaries above the launch footer.

Evidence: `output/menu-polish-ten/`. The previous CSS and grass renderer are preserved under `baseline/`. The before run recorded 62.64/72.97/66.30 ms of main-thread work per three seconds, 59/59 moving sample intervals, and zero layout/copies/browser-layer paints. Measurements are local/shared-host observations, not direct YouTube or whole-machine GPU qualification.

Final smoothness comparison: after samples used 73.70/50.94/52.41 ms per three seconds, versus baseline 62.64/72.97/66.30 ms. Both advanced on 59/59 sampled intervals, with zero layout, artwork copies and observed browser-layer paints. No performance regression was observed; host variation means the lower median is not claimed as a causal speedup.

Chapter-picker regression passed mouse, touch, keyboard and controller selection, Settings return, all four chapter previews, persistent footer launch visibility at 2560x1600/1280x720/390x844/844x390, three secondary-page destinations (loads stubbed; actual URLs returned 200), and actual Night Order launch. Inspected final high-resolution desktop, ordinary desktop and portrait/landscape captures. No page errors.

Lifecycle verification also passed: all four chapter menus, unfocused/hidden pause, OS/game reduced motion, settings/dialog return, context loss/restoration, responsive quiet areas and 30-second particle continuity (51–61 visible fragments). Idle chapters generated no gameplay GPU presentations or artwork copies. Installed gameplay client passed with a 2492x1402 game-canvas capture; inspected the gameplay and final preview images. Syntax/whitespace passed. Final preview: `output/menu-polish-ten/grass-breeze.mp4`.
