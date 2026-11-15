# Follow-up aesthetic review — 2026-11-14

Review only; no runtime changes. This follows the 14-item theme implementation and focuses on remaining secondary surfaces and specific visual gaps, rather than proposing another global restyle. Preserve the approved intro/reveal/lead-in and the different chapter environments.

Fresh captures: `output/theme-followup-review/`. Reviewed actual 2560×1600 output plus 1280×720 and 390×844. Coverage includes live chapter entry views, Night Order map/journal, categorized settings and touch presentation. Other chapter touch shots use browser touch input; Night Order touch presentation was selected through an isolated test hook. Existing final implementation screenshots provide the outcome/large-screen pause references. This is not a full-route or animation/performance audit.

The first Night Order capture froze manual time before scene preparation completed and was discarded for gameplay review. The successful rerun explicitly waited for at least one scene frame and preparation completion before capture. Final capture reports contain no page errors.

## Findings, in recommended priority order

1. **Settings categories separate some headings and explanatory text from their controls.** Night Order's Chapter tab shows only “Comfort and hold / toggle”; the associated controls are in another category. Back Nine's Chapter tab retains sound-description/light-pulse explanations without the relevant settings, and Final Cut puts its long controls guide alongside picture quality. This is a concrete grouping issue in the last implementation, not a request for more decorative styling. Categorize each heading, control and explanation as a single unit; omit empty categories. Evidence: `night-order-chapter-settings-1280.png`, `back-nine-chapter-settings-1280.png`, `final-cut-chapter-settings-1280.png`; `web/game-theme.js` categorizes direct children independently.

2. **The map artwork is markedly less refined than its frame.** Its oval terrain shapes, fuzzy-looking raster labels and simple corridor silhouette read as a schematic prototype beside crisp DOM text and the detailed course art. Keep it schematic and readable, but give it authored pixel silhouettes, consistent symbols and a deliberate groundskeeper-plan treatment. Cache the static plan; update only live markers. Evidence: `night-order-map-2560.png`, `night-order-map-1280.png`.

3. **The map layout uses excessive empty space on large screens.** At 2560×1600 a narrow map and two wide route rows occupy a small part of an almost full-screen panel. Constrain the reading area and size the plan, legend and route cards as a balanced composition. This is distinct from improving the map drawing itself. Evidence: `night-order-map-2560.png`.

4. **Secondary Night Order HUD pieces retain the older teal treatment.** The objective now uses forest green, while the Map button, bottom instructional banner and resource strip use blue-green fills and older type sizing. Bring those remaining widgets into the existing HUD palette and spacing system; preserve high-contrast threat colors. Evidence: `night-order-hud-1280.png`; `.q-map`, `.q-context`, `.q-caption`, `.q-resources` in `web/quality-ui.css`.

5. **Touch controls still look like separate control kits.** Night Order uses translucent circles and a circular movement pad; Under the Green/Final Cut use rectangular arrows and action tiles; Back Nine uses a narrow row of rectangular driving controls. The mechanics should remain different, but shared label treatment, borders, icon design and pressed/held states would connect them visually. Evidence: `night-order-touch-390.png`, `under-green-touch-390.png`, `back-nine-touch-390.png`, `final-cut-touch-390.png`.

6. **Back Nine's portrait presentation leaves large uncomposed black areas.** Its wide driving view occupies a central band, unlike the full-height on-foot views. Preserve the useful driving field of view; compose the surrounding HUD/background space intentionally rather than simply stretching or cropping the scene. Evidence: `back-nine-touch-390.png` compared with `under-green-touch-390.png`.

7. **Some outcome artwork sits in frames much wider than the image.** Most visibly, Final Cut's completion illustration appears as a small centered image inside a broad horizontal frame. The containment protects the picture, but the empty side areas weaken the ending composition. Fit the frame to the art's aspect ratio or compose art beside the outcome text. Evidence: `output/theme-unification/final-cut-complete-1280.png`; current `#ending-art` styling in `web/game-theme.css`.

8. **Button capitalization and return-location terminology remain inconsistent.** Night Order uses labels such as “RESUME ROUND” and “RETURN TO CLUBHOUSE”; other chapters use “Resume escape,” “Resume,” and “Main menu.” Keep meaningful chapter-specific verbs, but standardize capitalization and use one name for the same menu destination. Evidence: current pause screenshots in `output/theme-unification/` and the fresh chapter-settings captures.

9. **Close foreground lanterns in Night Order look simpler than nearby scenery.** In the entry view, large lamp caps/rings and broad golden faces read as relatively flat geometric shapes against finely textured foliage, signage and masonry. Refine those specific close-up materials, edge wear and glass/metal separation; do not add lanterns or globally increase ambient light. This is a localized art-direction judgment from the entry view, not a verdict on every course prop. Evidence: `night-order-hud-1280.png`, `night-order-hud-2560.png`.

## What does not need another redesign

The shared green/brass frame, serif headings, primary action treatment and folded outcome details now form a coherent foundation. The journal's empty state is simple but stylistically consistent; it is not counted as a defect just because it could have more decoration. Underground darkness, different vehicle controls and the two Chapter 02 branches are intentional differences. No new effects, particles, general lighting changes or intro revisions are needed to address this list.
