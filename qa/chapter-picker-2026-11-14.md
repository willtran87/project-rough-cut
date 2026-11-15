# Consistent main-menu chapter selection

Chapter buttons now select a preview instead of navigating immediately. Night Order, The Back Nine, Under the Green and The Final Cut share the same flow: select a chapter, review its description, then choose Start Game.

- Chapter cards sit above the preview with a single pressed/selected state. The header, tagline, introduction, gameplay hints and Start Game description follow the selection.
- Start Game uses the selected chapter destination. Night Order keeps its existing story/start flow. The other chapters retain their existing entry pages and saved-checkpoint behavior.
- Left/right keyboard and controller input select chapters; up/down selects actions. Enter/Space on a focused chapter card selects without starting. Touch works the same way.
- Selection survives opening and closing Settings. Night Order records appear only with Night Order selected. The story replay menu action has been removed.
- Chapter selection is part of the menu invalidation key; idle rendering remains stopped. No timer or background polling was added to the chapter picker.

Validation:

- `tools/verify-chapter-picker.cjs` passes with no page errors: all four previews, keyboard/controller/touch selection, Settings return, zero repeated idle artwork copies, all three destination URLs, and actual Night Order entry. Destination HTML is stubbed for the navigation assertions, with separate HTTP 200 checks of the real pages.
- Screenshots captured at 2560 × 1600, 1280 × 720 and 390 × 844; desktop and mobile views inspected. Smaller layouts retain vertical scrolling.
- `tools/verify-single-night-order.cjs` passes for fresh and legacy saves, including Settings, Clock Out, start/retry/replay, and preservation of old records.
- Installed develop-web-game client passes via `tools/verify-presented-client.mjs --level-one --native-renderer --high-resolution`; gameplay screenshot and state inspected.
- JavaScript syntax checks pass. Evidence: `output/chapter-picker`; legacy checks: `output/level-one-single-chapter`.

Changed runtime files: `web/chapter-links.js`, `web/course-menu-ui.js`, `web/course-menu.css`, `web/game.js`, `web/index.html`.

## Separate browse and launch actions

The left navigation now contains Chapters, Settings and Clock Out. Chapters focuses and scrolls to the chapter picker without launching. A separate gold Start Game button is anchored in the lower-right footer with the selected chapter's name. It remains visible while the description scrolls; portrait screens use a full-width footer button. Keyboard/controller action navigation includes this footer action.

Updated chapter-picker verification passes, including controller focus on the footer action, Chapters confirmation without launching, all chapter destinations, idle artwork checks and actual Night Order entry. Start Game remains fully within the viewport at2560x1600,1280x720,390x844 and844x390. Screenshots inspected at all four sizes. Fresh/legacy regression passes. The installed-client adapter now clicks Start Game and waits for course preparation rather than repeatedly confirming the menu.
