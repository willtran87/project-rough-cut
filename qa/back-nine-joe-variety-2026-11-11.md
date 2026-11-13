# Joe dialogue variety

Added 28 new expressions joining Product Owner language with grass, turf, mowing, clippings and roots. Four contextual pools contain 32 total lines including four retained lines: yard (9), range (9), clubhouse (9), shutter finale (5). Existing opening and defeat dialogue remains.

Presentation chooses a shuffled deck per pool. Each line is exhausted before that pool reshuffles, with no immediate boundary repeat. A WeakMap keeps the selected line stable per run and context, including pause/resume. Small separate browser-storage history preserves deck progress across retries/reloads; storage failure falls back to session history. No simulation randomness, pursuit changes, extra barks, audio nodes or rendering resources. Existing story events and urgent-warning priority control when lines can display. The night-range relay hint remains attached.

Validation:

- `node tools/verify-back-nine-dialogue.mjs`: three exhaustive cycles per pool with reloads between every selection, stable output through 120 repeated calls, no per-frame storage writes, no simulation-state mutation, corrupt/unavailable storage handling, navigation and urgent-warning preservation.
- Existing story tests pass checkpoint/log/repair behavior and danger suppression.
- Browser fixtures pass all three course contexts, finale and urgent-message preemption with no page errors. Actual 2560x1600 and 390x844 screenshots inspected in `output/back-nine-joe-language/`.
- Standard installed Playwright client: two on-foot iterations, inspected screenshot/state in `output/back-nine-joe-variety/standard-client/`, no error artifacts.
- Release: 90 action scenarios pass, unchanged 67 runtime images / 26 MiB. Syntax and whitespace checks pass.

These are text expressions, not recorded speech or facial poses. Human assessment of timing/tone remains a later playtest item.
