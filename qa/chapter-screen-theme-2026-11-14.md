# Chapter starting, loading, and tutorial theme

Implemented the ten recommendations from `design/screen-theme-consistency-review-2026-11-14.md`.

## Delivered

| Item | Implementation |
| --- | --- |
| 1. Shared materials | `launch-screens.css`: static forest-green grain, ivory type, aged brass, continuous edges and corner cuts. No animated texture or filter. |
| 2. Typography | Shared Georgia titles, Segoe UI instructions/buttons, restrained monospace field labels. |
| 3. Briefing layout | `launch-screens.js`: common chapter header/art, goal strip, three essential tips, optional field notes, scroll region and separate footer. Native nodes/handlers retained. |
| 4. Primary action | Consistent “Begin chapter” brass control with chapter emblem, lower right on desktop and full-width at the bottom on mobile. Checkpoint continuation retains “Continue chapter.” |
| 5. Loading presentation | Chapter identity, framed cached artwork, reserved preparation/status area and existing real readiness/error handling. Night Order uses matching artwork/materials. Import-error retry recovery verified in all three separate chapter pages. No fake progress or forced wait. |
| 6. Tutorials | One goal and three short essentials per chapter. Full original instructions remain under Field notes; native controls/settings remain available. No route trail or additional walkthrough overlay. |
| 7. Chapter identity | Menu artwork and pixel emblems reused in briefings/buttons/story headers. Chapter 02 explicitly identifies Shed or Drain route. Competing chapter-link rows are hidden during launch. |
| 8. Story chrome | Shared header/footer materials, title/body hierarchy, primary/secondary actions and skip wording. Final Cut caption grid matches the shared stories. Existing illustration transition timing retained. |
| 9. Launch sequence | Fresh launch plays the chapter story, unless opted out, then returns to a ready briefing. The final start action enters gameplay. Under the Green and Final Cut no longer start gameplay directly when the story finishes. Replay and checkpoint policies retained. |
| 10. Responsive/input behavior | Persistent actions, scrollable notes/settings, keyboard focus wrapping, shared controller adapter including Night Order, 130% instructional text support. Mobile Night Order word boundary corrected. |

The pre-menu reveal, atmosphere/lead-in, title fracture, and menu implementation files have matching before/after SHA-256 hashes. Records: `output/screen-theme-implementation/protected-before.json` and `protected-after.json`. Changes to the main game loop are limited to the chapter briefing rendering/input/lifecycle path and chapter-story module version. Intro timing and rendering branches retain their behavior.

## Performance

Three-second local Chromium/D3D11 idle samples at 1280×720, using equivalent fresh-session launch paths:

| Briefing | Before task time | After task time | After layout count |
| --- | ---: | ---: | ---: |
| Night Order | 2972.7 ms | 64.8 ms | 0 |
| Back Nine | 36.2 ms | 26.8 ms | 0 |
| Under the Green | 28.9 ms | 36.4 ms | 0 |
| Final Cut | 36.4 ms | 34.3 ms | 0 |

These are local samples on a shared host, not universal timing guarantees. The small differences between the other chapters are within the scope of host variability; no speedup is claimed for those chapters. Night Order previously rendered the hidden course behind its tutorial. The DOM briefing now owns presentation after preparation, with a cached presentation key and 20 Hz input polling. No new idle loop was added. An idempotent settings-hide guard avoids redundant style invalidation.

The final all-chapter layout/regression rerun also passed. Its three-second task samples were 188.4 / 53.9 / 80.6 / 41.5 ms respectively, with zero layouts in every chapter and no page errors. This wider range is recorded rather than treating one host timing sample as a fixed budget. Final screenshots and results are in `verify-night-order-back-nine-under-green-final-cut.json` and the `*-brief-*.png` files.

Reported scene frame/draw counters did not increase during any final idle sample. Back Nine and Under the Green each retained one prepared frame; Night Order needed no hidden presentation. Final Cut draw counters remained unchanged. No layout work occurred. Night Order still has some existing style recalculation, so this is not a claim of zero total browser work.

Simulated document-hidden/blur handlers kept Night Order in its unstarted briefing, added no scene frames or layouts, used 35.2 ms task time over two seconds, and allowed starting after focus returned. Real gameplay still auto-pauses on blur/visibility loss. This is an automated lifecycle test, not a measurement of YouTube playback in another browser.

Evidence: `baseline.json`, `performance-final.json`, `background.json` in `output/screen-theme-implementation/`.

## Verification

- Captured and inspected high-resolution 2560×1600 first, then 1280×720, 390×844, and 844×390. Primary controls stayed inside the viewport; no horizontal content overflow.
- Completed and skipped stories; verified Back/Next and saved skip preferences, all four chapter starts, pause/resume, and native settings/field notes.
- Keyboard Enter opens/closes field notes without launching a chapter. Synthetic controller A opens notes, B closes them, and A on Begin chapter starts gameplay. Neutral-input boundaries remain handled by the existing controller adapter.
- Tested 130% instructional text at desktop, mobile, and short landscape sizes.
- Injected module-load failures for Back Nine, Under the Green, and Final Cut. Each showed a visible Retry loading action and recovered after the network fault was removed.
- Ran the standard develop-web-game Playwright client and inspected its canvas output/state. The client captures the underlying game canvas; full-page custom captures verify the DOM screens above it.
- No unexpected page errors in normal launch/input runs. The retry test deliberately produces failed-import console errors.
- Corrected two integration issues caught during testing: Final Cut initially selected a nested credits action group; shared wrapper styles initially removed the Back Nine pause panel's box. Final tests use the primary button's own action group and preserve native pause/result shell styling.

Scripts and reports: `verify.cjs`, `interactions.cjs`, `retry.cjs`, `performance.cjs`, `background.cjs`, and corresponding JSON files in `output/screen-theme-implementation/`.

## Scope

No gameplay mechanics, chapter checkpoint rules, intro artwork, pre-menu reveal animation, or menu atmosphere changes. Static chapter artwork is cached; no additional particle system, animated grain, continuous glow, or hidden scene loop. Existing unrelated workspace work and the local 4187 server were preserved. No agents, commit, deployment, or external messages.
