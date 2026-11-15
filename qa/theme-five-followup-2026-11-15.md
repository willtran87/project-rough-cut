# Five theme refinements — 2026-11-15

Implemented all five findings in `design/theme-review-next-2026-11-15.md`.

1. Night Order defeat/victory cards now size to the report, with bounded scrolling when needed. The large empty area is removed.
2. Phone settings use a focused view: outer pause furniture is temporarily hidden, controls occupy the available space and Back stays visible. Long control instructions and the existing Under the Green story replay live in a folded help disclosure. Original nodes, live instruction updates and handlers are preserved.
3. Generated keyboard editors now use filled rows, consistent key styling and focus treatment matching primary settings. Native dropdowns and capture buttons retain their respective interaction behavior.
4. Back Nine defeat has one restart action. Restart remains available while paused; the defeat primary still starts a fresh driving run from the shed. No changes to story playback code.
5. The camera preview has a brass ruler, center line and pointer. Its existing drag-driven position updates remain unchanged; the scale is static CSS.

## Validation

- Fresh actual 2560×1600 screenshots first, then 1280×720 and 390×844; inspected all affected layouts. Intermediate Back Nine phone scroller overflow and competing legacy binding-row styles were corrected and recaptured.
- All four chapter interaction suites passed: story flow, keyboard/controller start, settings categories, applicable preference persistence, pause/resume, 130% text and action bounds at 2560×1600, 1280×720, 390×844 and 844×390.
- Final focused verifier passed all four chapters. Assertions cover compact Night Order result height, visible result actions, actual preview dragging, at least two controls initially visible on phones, visible Back, hidden outer pause footer, key changes/reset, help disclosure, focus restored on Back, and Back Nine's single retry returning to driving.
- No page errors in the capture, focused verifier or interaction reports.
- Installed web-game Playwright client completed two input iterations; final screenshot inspected and state reports `final_cut_playing`, ready. No error artifact.
- JavaScript syntax checks passed for all three modified scripts.
- Ten protected intro, fracture, menu presentation/atmosphere and story lead-in files match their task-start SHA-256 hashes.

Evidence and reproducible scripts: `output/theme-five/`. Only four runtime files changed in this task: `game-theme.js`, `game-theme.css`, `course-settings-ui.js`, `back-nine.js`. Baseline copies and task-local diffs are included. Existing server on port 4187 and unrelated work were preserved. No commit or deployment.

## Performance method and limits

The implementation adds no timer, animation loop, WebGL work, lighting or asset downloads. Help disclosures are constructed during settings setup. Existing settings signature caching and preview updates are retained.

The initial native Chromium/D3D11 comparison used 1280×720 and three-second idle settings samples. All eight samples recorded zero layouts. Back Nine/Under the Green/Final Cut recorded zero style recalculations. Their current task times were 48.6/66.7/46.7 ms per three seconds, versus 60.9/132.8/39.9 ms for their baselines. Other test browsers were active during parts of this pass; these are local regression checks rather than precise speedup or whole-game FPS measurements.

Night Order's initial sample rose from 427.0 to 547.0 ms per three seconds while verification browsers were active. A separate isolated baseline/current/current/baseline confirmation with five-second samples was run to distinguish scheduling noise from a repeatable regression; results are recorded below.

Isolated Night Order confirmation: baseline samples used 531.4 and 405.4 ms of main-thread task time per five seconds (mean 468.4 ms); current samples used 483.0 and 382.4 ms (mean 432.7 ms). Mean script time was 158.5 ms baseline and 152.8 ms current. All four recorded zero layouts and no page errors; style recalculations stayed at 308–311. There is no repeatable regression in this local check. These short samples do not establish a whole-route/device performance guarantee.
