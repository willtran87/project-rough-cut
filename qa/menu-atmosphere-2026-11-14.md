# Menu atmosphere

Superseded by the user's speckled grass direction: see `qa/menu-speckles-2026-11-14.md`. Corner blades and chapter accents below describe the previous iteration and have been removed.

Implemented gently swaying faceted grass at the outer bottom corners, behind the menu controls, and one localized accent on the selected chapter illustration: Night Order lamplight, Back Nine rain, Under the Green ripples, Final Cut amber beacon. Unselected illustrations stay static. Decorative elements cannot receive focus or pointer input.

The isolated scheduler updates two small grass silhouettes and one chapter accent at most ten times per second. It does not redraw either the game or the full-screen illustration. It cancels its timer on window blur, page hide, hidden tabs, menu exit, settings/dialogs, and either OS or in-game reduced motion. Resume preserves phase without a large elapsed-time jump. Small screens retain the fixed Start Game footer.

Verification passed:

- `node tools/verify-menu-atmosphere.cjs`: all four chapters, actual transform changes, timer cap, blur/focus, hidden/visible, OS/game reduced motion, modal pause/resume, Settings return, viewport geometry. No browser errors.
- Four three-second active samples: 29/29/29/30 decorative ticks, **zero game GPU presentations and zero full-screen artwork copies**. Main-thread task work was 87.0/85.9/79.9/70.4 ms; layout work zero. The shared host can affect timing; these are observations, not a browser-wide playback guarantee.
- Unfocused, hidden, OS reduced motion, and game reduced motion: zero decorative ticks and no scheduled timer. Unfocused task work 46.3 ms per three seconds; hidden 47.7 ms.
- `node tools/verify-chapter-picker.cjs`: mouse, touch, keyboard/controller selection, settings retention, all destinations and actual Night Order start passed.
- Installed gameplay client through `tools/verify-presented-client.mjs --level-one --native-renderer --high-resolution`: actual first-hole movement, no captured errors; screenshot and state inspected.
- Menu screenshots inspected at 2560×1600, 1280×720, 390×844, 844×390. Syntax and diff whitespace checks passed.

Evidence: `output/menu-atmosphere/report.json`, menu screenshots, and `output/menu-atmosphere/client/`. YouTube itself was not tested. Active decorative animation necessarily adds a small amount of work compared with the static menu; it stops when switching focus to another browser.
