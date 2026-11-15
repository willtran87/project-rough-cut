# In-game theme unification — 2026-11-14

Implements the 14 items in `design/remaining-theme-aesthetic-review-2026-11-14.md`. The scope is shared presentation and targeted material refinement, not replacement of every illustration or a whole-level art rebuild.

## Implementation ledger

| Item | Implementation |
| --- | --- |
| 1. Pause design | Shared forest-green material, continuous frame/chipped corners, serif headings, restrained metadata and persistent chapter action footer. Night Order puts Resume before assignment details. |
| 2. Settings structure | Categorized Audio, Controls, Readability, Camera and Chapter settings, using relevant categories per surface. Existing native inputs and bindings are retained. The supplemental Night Order dialog uses the same styling/category structure. |
| 3. Outcomes | Common framed art, side-by-side outcome/advice on desktop, vertical composition on mobile, and separate action footer. Existing ending/retry semantics remain intact. |
| 4. Typography | Georgia headings, Segoe UI explanatory text and controls, monospaced gameplay/metadata. Existing text-size preferences retained. |
| 5. Actions | Brass primary Resume/Retry/Continue treatment, quieter secondary actions, visible focus. Primary result actions move to the lower right on desktop and full width on mobile. |
| 6. Controls/materials | Coordinated green/brass controls, checkbox/slider accents, square controls and static material grain. No animated texture or blur filter. |
| 7. Pause hierarchy | Instructions fold into Field notes below the headline/settings. Resume remains accessible in the footer; Back Nine's existing Review instructions button opens those notes. |
| 8. HUD scale | Shared 16–24px responsive objective scale for on-foot chapters, coordinated metadata and tool controls; driving/water-specific information retained. |
| 9. Final Cut arrival | While safely at the overlook before requesting the round, redundant safety/ball/control banners recede. Objective, context and the primary interaction remain; threat/ball instructions return after activation. |
| 10. Dense reports | Night Order statistics, incident history and next-step explanations move into an expandable report. Final Cut completion records are also expandable. New outcomes start with the report collapsed. |
| 11. Branch labels | Shed route and Drain route accompany the intentional two Chapter 02 labels. No chapter renumbering. |
| 12. Pixel-art presentation | Outcome artwork uses consistent contained framing and crisp sampling instead of inconsistent full-screen magnification; Final Cut structural texture density is brought closer to the detailed illustration treatment. Existing source illustrations are retained; no blanket pixelation filter or art regeneration. |
| 13. Environment refinements | Final Cut ashlar/coping repeats change from 1.5m to 0.95m and generic stone from 1.7m to 1.1m, preserving native atlas resolution. Under the Green root pigment changes from `#d2c8ab` to `#e0d2b6` for modest separation under existing practical lighting. No additional lights, geometry, textures or render passes. |
| 14. Journal presentation | Player-facing Field journal contains discoveries, with feedback/test tools retained behind explicit `?playtest` opt-in. No telemetry or messaging changes. |

Shared presentation lives in `web/game-theme.js` and `web/game-theme.css`, mounted through the existing launch adapter. Native event handlers and element IDs survive DOM rearrangement. No new frame loop, polling timer or observer is added by the theme layer.

## Verification

- Actual 2560×1600 captures first, then 1280×720 and 390×844. Interaction/layout checks also cover 844×390. Screenshots and DOM measurements inspected; expanded content scrolls within bounded regions and chapter actions remain accessible.
- All four chapters passed full opening-story progression, briefing keyboard/controller actions, settings category navigation, pause/resume and responsive primary-action bounds. Chapter audio mute changes were exercised and survived resume; Night Order native settings and journal were exercised. Existing 130% briefing text checks passed.
- Staged defeat screens exercised retry in all four chapters. These fixtures test UI/state transitions, not pursuit or collision correctness. Night Order report expansion/reset and victory-art transitions tested separately. Final Cut completion, record expansion, credits and responsive primary-action bounds also passed.
- The installed develop-web-game Playwright client ran. Final run reached `final_cut_playing` with movement input and no error artifacts; its canvas capture was visually inspected. DOM overlay screenshots come from the supplemental harness.
- Fixed issues found during verification: selected-button specificity, Back Nine narrow/landscape overflow, legacy defeat alignment, settings category construction for late-mounted controls, and stale Night Order result-art caching. The mutable artwork canvas is copied correctly; only static pause presentation is cached.
- Seven protected files match pre-change SHA256 hashes: intro-presentation, screen-fracture, course-menu-atmosphere, its fallback, course-menu-ui, course-menu.css and course-menu-materials.css. Intro animation, reveal and lead-in were not changed.

## Performance

Local headless Chromium, native NVIDIA RTX 3090 via ANGLE/D3D11. These are short local comparisons, not a full-route soak or a guarantee for every device. Other work on the shared host can affect timings.

Three-second idle pause samples at 1280×720:

| Chapter | Before browser task time | After | After layouts |
| --- | ---: | ---: | ---: |
| Night Order | 1499.3ms | 611.2ms | 0 |
| Back Nine | 23.2ms | 30.0ms | 0 |
| Under the Green | 34.0ms | 55.3ms | 0 |
| Final Cut | 38.3ms | 55.4ms | 0 |

Night Order previously performed 280 layouts and 584 style recalculations during that sample; the static pause invalidation cache reduced them to 0 and 30. The other chapters retained zero idle layouts/style recalculations and unchanged scene submission counters. Their small absolute task-time differences are below 23ms over three seconds.

Paired live entry-view material checks at 2560×1600, five seconds after warm-up:

| Chapter | Previous materials | Refined materials | Resources |
| --- | ---: | ---: | --- |
| Under the Green | 60.04 FPS | 60.06 FPS | 540 draws, 75 textures, 218 programs in both |
| Final Cut | 57.35 FPS | 59.89 FPS | 324 draws, 66 textures, 131 geometries in both |

No material-refinement performance regression observed in these entry views. This does not establish a causal FPS improvement from changing texture scale or pigment. No quality or performance thresholds were lowered.

## Evidence

`output/theme-unification/` contains capture and interaction scripts, screenshots, reports, protected-file hashes, pause performance before/after, and paired active-material performance. The `results/` subfolder contains staged outcome/retry coverage. Isolated browser contexts were used; tests did not change the user's browser saves. No commit, deployment or external message was made.
