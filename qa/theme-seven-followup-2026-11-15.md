# Seven theme refinements — 2026-11-15

Implemented all seven findings from `design/theme-review-2026-11-15.md`.

| Finding | Result |
| --- | --- |
| Paper notice contrast | Explicit dark ink, muted label and rust stamp colors on the pale document. |
| Recovered records | Shared disclosure, serif titles, body size, spacing and reading measure. Back Nine logs become semantic articles, rebuilt only when their text changes. |
| Load-limit drawing | Static maintenance-plan artwork with detailed mower, paper texture, restrained linework and clear route/load labels. The complete drawing fits at the tested desktop and phone sizes. |
| Settings consistency | Sentence-case primary labels, matching control rows, upper-right values, shared typography and focus treatment. Existing controls, handlers and bindings retained. |
| Settings height | Content-sized primary card with bounded scrolling instead of a full-height empty panel. |
| Listening HUD | Compact forest/brass panel, unified divisions and responsive text that retains user scaling. |
| Closing composition | Credits/notice actions share the footer; irrelevant gameplay notes and checkpoint copy are hidden. Back Nine pause copy now describes resuming/restarting. |

## Verification

- Fresh screenshots at actual 2560×1600 first, then 1280×720 and 390×844; inspected settings, populated records, listening, credits and notice. Additional action-bound checks at 844×390 and 130% text.
- All four chapter interaction suites passed: story/start, keyboard/controller instructions, settings category navigation, pause/resume and relevant settings persistence.
- Targeted assertions passed for complete diagram visibility, settings width/return visibility, cached record nodes, notice heading contrast of at least 4.5:1, closing action placement and return/skip/Escape navigation.
- No page errors in capture, interaction or performance reports.
- Installed web-game Playwright client completed two iterations. Inspected final screenshot/state: `final_cut_playing`; no error artifact.
- `node --check` passed for game-theme.js, course-settings-ui.js, back-nine.js and final-cut.js.
- SHA-256 comparison confirms all ten protected intro, fracture, menu atmosphere/presentation and story lead-in files are unchanged from this task's baseline.

Evidence: `output/theme-seven/`, including interaction reports, focused verifier report, screenshots, standard-client outputs, baseline sources and protected-file hashes.

## Performance

Native Chromium D3D11, 1280×720, three-second idle settings samples after loading and settling. Baseline sources were served through isolated browser request overrides; current sources were then sampled in a fresh context.

| Chapter | Baseline main-thread task time | Current task time | Current layouts |
| --- | ---: | ---: | ---: |
| Night Order | 713.6 ms | 666.8 ms | 0 |
| Back Nine | 55.8 ms | 48.1 ms | 0 |
| Under the Green | 99.1 ms | 79.9 ms | 0 |
| Final Cut | 55.0 ms | 35.7 ms | 0 |

No regression appeared in these short samples. Other verification browsers ran concurrently, so these numbers are a local regression check, not a precise speedup or whole-game FPS claim. Night Order's existing settings updates still perform style recalculation; the other paused screens recorded none. This change adds no animation loop, render pass, lighting or particles. Closing updates run on mode/view changes; recovered-log DOM updates only when content changes. The diagram remains one static asset.

Ending/collected-record states were exposed using isolated test fixtures, not a complete route playthrough. Existing server on port 4187 was preserved. No commit or deployment.
