# Starting, loading, and tutorial screen consistency review

Date: 2026-11-14. Review only; no runtime changes.

## Assessment

The screens belong to the same color family, but do not yet feel like one finished interface. Dark greens, warm ivory, brass accents, and atmospheric chapter illustrations are common. The current menu has a much more developed material treatment, typography hierarchy, chapter identity, and primary-action hierarchy than the screens that follow it.

The strongest opportunities are a shared briefing layout, a common loading presentation, and consistent typography/buttons. Keep each chapter's artwork, mechanics, narrative, and atmosphere. The approved pre-menu reveal animation and lead-in should remain unchanged.

## Evidence and scope

Reviewed local source and captured fresh-session chapter opening stories, loading states, and pre-play briefings/tutorials at 2560×1600, then 1280×720 and 390×844. Evidence is in `output/screen-theme-audit/`; `capture.cjs` reproduces the launch captures. Each chapter used an isolated browser context and real UI input. No page errors were reported in the capture runs.

The first Night Order tutorial capture was covered by the loading overlay. That capture was repeated after the real loader became hidden; the current tutorial screenshots show the actual briefing. Initial captures are transient loading evidence, not final-art quality judgements. Final Cut's partially painted initial illustration is not treated as a persistent rendering defect.

The menu comparison uses the recently verified `output/menu-chapter-detail/layout/menu-1280-1.png`. This audit covers front-end onboarding screens. In-world phone notifications, water lessons, encounter hints, and later tutorial states were only sampled in source, not exhaustively playtested. No performance benchmark was run for this review; performance recommendations below are implementation constraints, not measured improvement claims.

## Current consistency by screen

| Screen | What already fits | Main differences from the menu |
| --- | --- | --- |
| Night Order briefing/tutorial | Forest palette, warm gold, clear goal strip, primary action on the right | Courier throughout, flat thin-bordered panel, dense instructions, older background art, mobile heading spacing defect and partly off-screen action |
| Back Nine briefing/tutorial | Same palette and goal strip as Night Order; useful inset chapter art | Courier document appearance, long two-column instructions, flat surfaces, primary action on the left |
| Under the Green briefing/tutorial | Atmospheric environment background, serif heading and readable sans-serif body; closest typographic direction | Plain panel, very different proportions, left-hand action, extra chapter navigation with repeated 02 labels |
| Final Cut briefing/tutorial | Strong chapter artwork, serif heading, appropriate dark palette | Oversized vertical stack, separate visual system, monospace body, start action below the fold on ordinary desktop and mobile |
| Night Order loading | Atmospheric art, legible preparation message | Separate full-screen composition and older opening illustration; no shared chapter identity with the menu |
| Other chapter loading states | Preparation text and disabled actions; chapter context remains available | Preparation appears inside each chapter's independently styled briefing; placement and prominence differ |
| First three chapter stories | Shared illustrated-story component; consistent image, caption, and navigation layout | Plain chrome and button materials do not match the newer menu |
| Final Cut story | Same broad illustrated-story pattern | Separate implementation, monospace prose, different caption grid, button hierarchy, and maximum width |

## Highest-priority findings

### 1. Final Cut hides the action below its presentation

At 1280×720 the start panel has 1198 px of scrollable content; at 390×844 it has 1390 px. The 720 px screenshot shows the illustration, enormous title, tagline, and introductory copy, but no start button. This is a layout problem before it is a decoration problem.

Use a bounded briefing shell with a compact art region and a persistent action footer. The content region may scroll, while the primary action and return control stay visible. Do not solve this by shrinking all body text.

Sources: `web/final-cut.html`, `web/final-cut.css`, `web/final-cut-story.css` (`#chapter-splash`). Evidence: `final-cut-start-guide-1280.png`, `final-cut-start-guide-390.png`.

### 2. Night Order has a mobile heading defect

At 390 px the title reads “One lastnight order.” The mobile rule hides the `<br>` without providing a word separator. Its tutorial content also exceeds the visible panel (876 px content versus 835 px visible), leaving the primary button partly below the initial viewport.

Preserve the word boundary when removing the line break and use the common action footer. Overflow itself is acceptable; obscuring the action is avoidable.

Sources: `web/quality-ui.js`, `web/quality-ui.css:27`. Evidence: `night-order-tutorial-390.png`.

### 3. Launch order changes between chapters

On fresh sessions, Night Order and Back Nine present the story before the final briefing. Under the Green and Final Cut present the briefing first; pressing its main action opens the story before gameplay. The same apparent “start” action therefore has different meanings.

Use one deliberate sequence: menu selection → opening story, unless skipped → ready briefing → enter gameplay. Loading can happen during preceding screens where safe; a loading screen should appear only when work remains. Persist skip preferences and preserve checkpoint/resume behavior. Do not add a forced wait or another redundant confirmation screen.

Sources: `web/quality-ui.js`, `web/back-nine.js`, `web/under-green.js`, `web/final-cut.js`.

## Ten concrete improvements

1. **Share the menu's material palette.** Extract reusable color, border, grain, shadow, and spacing tokens from the menu. Use painted forest-green surfaces, warm ivory, and aged brass. Keep continuous even edges and chipped corners; avoid the missing-edge chunks the user disliked.
2. **Use one type hierarchy.** Georgia for chapter/story titles, the menu's sans-serif for instructions and buttons, and monospace only for small equipment or field labels. Establish consistent title sizes, line lengths, and secondary-text contrast.
3. **Build one briefing shell.** Chapter header, inset illustration, short goal, essential mechanic cards, optional details, and a stable footer. Use it across all four launch pages, with responsive art placement and chapter-specific content.
4. **Standardize the primary action.** Reuse the prominent brass button and chapter emblem. Keep it lower right on desktop and in a visible mobile footer. Use a consistent action such as “Begin chapter,” with the chapter name beneath. Keep Main menu and Controls & comfort secondary. Give loading, disabled, focus, hover, and pressed states consistent styling.
5. **Unify loading presentation.** Use the same chapter header/art frame and a reserved status area. Show truthful preparation stages when available, otherwise a simple indeterminate indicator. Include consistent failure/retry handling. Avoid invented percentages, fake delays, and a second animated background.
6. **Make the tutorial easier to scan.** Lead with one goal and up to three short essentials. Use existing chapter symbols and static equipment diagrams as useful visual anchors. Move long tactics into optional help. Preserve essential safety/action instructions and let players discover routes rather than exposing a complete walkthrough.
7. **Carry chapter identity through every screen.** Reuse menu emblems, names, route descriptors, art grading, and frame treatments. Back Nine and Under the Green are alternate chapter-two routes; explain that relationship rather than showing unexplained duplicate 02 links. Return chapter selection to the main menu instead of maintaining a second competing selector in the briefing footer.
8. **Bring story chrome into the same family.** Align title/caption typography, header/footer materials, progress count, skip wording, and primary/secondary buttons. Reuse the shared story shell where feasible, preserving Final Cut's own content and existing story pacing. This does not require changing the approved pre-menu animation or lead-in.
9. **Make the launch sequence predictable.** Apply the sequence described above, with consistent back/replay/skip/resume behavior. Keep each chapter's actual checkpoint policy accurate; common styling must not imply common save rules.
10. **Share responsive and accessible behavior.** Keep actions visible at short heights, allow text to scroll without horizontal overflow, retain readable text at enlarged UI scale, and use the same keyboard/controller focus treatment. Keep loading announcements and retry controls accessible. Fix the specific Final Cut and Night Order defects as the first acceptance cases.

## Implementation approach

Create a small shared theme stylesheet and reusable briefing/loading presentation, with chapter data supplying artwork, emblem, goal, instructions, and action labels. Scope styles to these screens; do not apply broad typography changes to gameplay HUDs or in-world displays.

Existing entry points:

| Responsibility | Files |
| --- | --- |
| Menu reference | `web/course-menu-materials.css`, `web/course-menu-ui.js`, `web/chapter-links.js` |
| Night Order briefing | `web/quality-ui.js`, `web/quality-ui.css` |
| Night Order loader | `web/index.html`, `web/styles.css`, `web/scene-3d.js` |
| Back Nine | `web/back-nine.html`, `web/back-nine.css`, `web/back-nine-guide.css`, `web/back-nine-opening.js`, `web/back-nine.js` |
| Under the Green | `web/under-green.html`, `web/under-green.css`, `web/under-green-opening.js`, `web/under-green.js` |
| Final Cut | `web/final-cut.html`, `web/final-cut.css`, `web/final-cut-story.css`, `web/final-cut-story.js`, `web/final-cut.js` |
| Shared stories | `web/opening-story.js`, `web/opening-story.css` |

Prioritize layout/action defects, then shared briefing/loading styling, then story chrome and flow consistency. Avoid copying the full menu implementation into each chapter. In-world tutorials should inherit appropriate colors, keycaps, and icon vocabulary later while retaining their functional placement and diegetic appearance.

## Performance and acceptance criteria

- Prefer static CSS material textures and cached chapter images/SVGs. Update chapter details only on selection or state changes.
- Add no idle JavaScript render loop, animated grain, full-screen blur, or continuously repainted glow. Existing atmosphere should remain a single bounded effect, paused when hidden or unfocused.
- Preserve rendering gates while menus/briefings are open and avoid duplicate scene presentation. Loading can prepare assets without continuously rendering a hidden world.
- Decode only necessary artwork; reuse cached assets. Preserve useful loading errors and retry paths.
- Verify 2560×1600, 1280×720, 390×844, and a short landscape viewport, plus enlarged text/UI scale. Confirm visible primary actions, correct mobile title spacing, no horizontal overflow, and readable instructions.
- Exercise fresh start, skipped story, replay, resume, retry, return to menu, keyboard/controller focus, and touch scrolling. Confirm the player remains safe/paused until the intended final start action.
- Compare idle task time, layout/paint counts, scene frames, and background-tab behavior against the current menu baseline. Check visible video playback in another browser on the user's machine before claiming the interference issue is resolved.

## Selected screenshot evidence

- Menu reference: `output/menu-chapter-detail/layout/menu-1280-1.png`
- Night Order desktop/mobile: `output/screen-theme-audit/night-order-tutorial-1280.png`, `night-order-tutorial-390.png`
- Back Nine briefing/loading: `output/screen-theme-audit/back-nine-start-guide-1280.png`, `back-nine-loading-2560.png`
- Under the Green briefing/loading: `output/screen-theme-audit/under-green-start-guide-1280.png`, `under-green-initial-2560.png`
- Final Cut desktop/mobile: `output/screen-theme-audit/final-cut-start-guide-1280.png`, `final-cut-start-guide-390.png`
- Story comparison: `output/screen-theme-audit/night-order-story-1280.png`, `final-cut-story-1280.png`
