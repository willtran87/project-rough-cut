# Additional theme review — 2026-11-15

Review only, following the seven-item implementation. No runtime source, artwork, intro, lead-in or performance settings changed. The current loaded menu remains the reference. This list identifies five localized inconsistencies; it does not call for another global redesign.

## Evidence and scope

Fresh screenshots in `output/theme-review-next/`, captured at actual 2560×1600 first, then 1280×720 and 390×844. Inspected the loaded menu, Night Order primary Controls/camera preview and key bindings, its defeat/victory screens, and other chapters' Controls and defeat screens. All four chapter capture reports have no page errors. Defeat/victory states were staged with browser-local fixtures; these are presentation observations, not complete gameplay-route verification.

An extra attempted quiet-stamp progress fixture cancelled during time stepping. Its screenshots show the cancellation message and are not evidence for a progress-bar defect. No progress-bar finding is included.

## Findings in recommended order

1. **Night Order results still stretch too tall on a large monitor.** At 2560×1600, the defeat report fills only the upper part of a nearly full-height card, leaving a substantial empty area above the distant footer. The compact settings and later-chapter outcome cards now make this particularly noticeable. Give the result card a content-sensitive height with a bounded scroll area for expanded details. Evidence: `night-order-defeat-2560.png`, compared with `under-green-defeat-2560.png`. Source: `.course-result-card { height:100% }` and the flexing `.course-result-scroll` in `web/quality-ui.css`.

2. **Phone Controls panels spend their visible area on instructions and nested panel furniture.** At 390×844, Under the Green initially shows Replay story and a long instruction paragraph; Final Cut shows a dense all-device paragraph and the next section heading; Back Nine barely reaches the first binding row. The settings Back/save footer and the outer pause footer further reduce the visible control area. This feels much more crowded than the menu's clear hierarchy. Collapse or organize help by input method, put editable controls first, and give the inner form a deliberate mobile layout with less nested framing. Keep help accessible. Evidence: `under-green-controls-390.png`, `final-cut-controls-390.png`, `back-nine-controls-390.png` and `final-cut-controls-1280.png`. This is a spatial/content hierarchy issue, separate from the repaired row colors and label casing.

3. **Key-binding editors remain visually different across chapters.** Night Order uses large filled action rows with key buttons; Back Nine and the other chapters use unboxed label/select pairs inside a fieldset. The previous row normalization explicitly excludes generated keyboard fields. Apply shared row spacing, label weight, key-value treatment and focus/changed states while retaining each editor's actual interaction behavior and chapter-specific actions. Evidence: `night-order-bindings-390.png`, `back-nine-controls-2560.png`; `web/keyboard-binding-settings.js`, `web/course-settings-ui.js`, `settingRows()` in `web/game-theme.js`.

4. **Back Nine defeat presents two insufficiently differentiated restart choices.** “Restart level” and the brass “Restart from the shed” sit beside each other. They appear to represent different retry destinations, although both reset the run; the secondary path can replay the opening depending on preferences, while the primary immediately returns to driving. Preserve any useful behavior, but present one clear retry action and label any replay alternative by what it actually does. Evidence: `back-nine-defeat-1280.png`; `primary()`, `freshRound()` and the restart visibility rule in `web/back-nine.js`.

5. **The camera test area still looks like a placeholder.** The otherwise finished Night Order Controls tab contains a wide empty rectangle with a small pale vertical bar under “Drag here to test look.” It lacks the deliberate equipment/survey treatment used elsewhere. A restrained brass heading scale, a center mark and a recognizable moving marker would make the preview feel authored and communicate the response better. Keep it lightweight and input-driven. Evidence: `night-order-primary-camera-2560.png`; `.course-look-preview` in `web/course-settings.css`. This is lower-priority art direction, not a broken control.

## Boundaries

Do not revisit the approved intro/reveal/lead-in or add particles, blur, extra lights or continuous animation for these findings. Different environments, driving/on-foot controls and meaningful danger colors remain intentional. No performance benchmark was run for this read-only review; these recommendations can be implemented mostly through static layout/markup and existing state updates.
