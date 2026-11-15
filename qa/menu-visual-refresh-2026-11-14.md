# Chapter menu visual refresh

Request: implement the ten proposed visual improvements while retaining the menu performance work.

| Improvement | Implementation |
| --- | --- |
| Chapter backgrounds | Existing gate, cart shed, drainage tunnel, and tournament mower illustrations switch with the selected chapter. Static images; no scene simulation. |
| Pixel wordmark | Local SVG Rough Cut lettering with sharp pixel edges and a worn underline, alongside the chapter identity (above it on phones). |
| Illustrated cards | Four compact thumbnail cards, with larger artwork at high desktop resolutions. |
| Selected state | Brass corner checkmark, inset border, and contrasting fill; independent keyboard focus outline. |
| Balanced spacing | Narrower action column, compact previews, bounded desktop panel height, and a fixed footer. |
| Atmospheric preview | Short premise and three chapter-specific SVG icon highlights replace the numbered instruction list. |
| Typography | Pixel wordmark, serif chapter headings, and readable system sans-serif controls/body text. No font downloads. |
| Material finish | Static repeating paper flecks, brass borders, engraved dividers, and restrained shadows. No filter-based noise. |
| Button feedback | Immediate hover, keyboard focus, and pressed states. Gold Start Game remains the strongest action. |
| Quieter utilities | Understated utility links, course records, and footer input hints. |

## Performance design

- No timers, animation loops, CSS animations, backdrop filters, or animated backgrounds added.
- Existing dirty-render key and focus/visibility throttling remain unchanged.
- Full-size illustration source and preview text change only when chapter selection changes.
- `tools/build-menu-art.py` reproducibly derives bounded 1440-pixel scenes and 480-pixel thumbnails from existing illustrations. All nine menu assets total 1,008,593 bytes; initial menu needs only one scene plus four thumbnails and the SVG.
- Artwork does not use a running game scene. Selection, focus, and button effects use ordinary DOM/CSS updates.

## Verification

Evidence is recorded in `output/menu-visual-refresh/`: before/after performance samples, layout screenshots, and the installed gameplay client's screenshot/state capture.

The chapter picker checks cover mouse, keyboard, controller, touch, settings return, chapter routing, and actual Night Order startup. Performance checks sample all four selections, unfocused visible state, and hidden state, and assert zero repeated game GPU presentations or menu canvas copies. Layout checks use 2560×1600, 1280×720, 390×844, and 844×390 viewports.

Browser-wide YouTube playback is not part of the automated measurement.

Results: all checks passed; no page errors. Each three-second idle sample recorded **0 game frames, 0 game GPU presentations, 0 menu artwork copies, and 0 ms layout work**. Main-thread task time was 45.1 ms for Night Order, 44.3 ms for Back Nine, 46.0 ms for Under the Green, and 45.4 ms for Final Cut. Unfocused-visible and hidden samples were 36.7 ms and 32.8 ms. The pre-refresh focused sample was 49.4 ms and unfocused-visible sample was 38.4 ms. These short samples show no observed idle regression, not a broad browser-performance benchmark.

Commands passed:

- `node tools/verify-menu-visual-performance.cjs --baseline` and current mode.
- `node tools/verify-chapter-picker.cjs` (including all four responsive layouts and controller/touch input).
- Installed gameplay client through `tools/verify-presented-client.mjs --level-one --native-renderer --high-resolution`, using `tools/fixtures/course-arrival-input.json`. Captured actual `first_hole` gameplay and movement state after Start Game.
- JavaScript syntax and focused diff whitespace checks.

Visually inspected the 2560×1600 menu, 1280×720 menu, 390×844 portrait, 844×390 landscape, and gameplay capture. Small screens scroll the chapter content while keeping Start Game visible in the footer.
