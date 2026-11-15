# Final Cut — curated replay schedules

FC56 now offers Original round, Far bank first and Return pass through the completed-result menu. The first clear retains the original schedule. Alternate plans share the near-strip demonstration, then change the opening strip order. Actual ball/bell distractions still override the next selection; a committed pass stays locked. After the advertised opening, ordinary perception resumes. Restart/reload retain the selected plan, and the result names the round played.

## Evidence inspected

- `tools/verify-final-cut-replays.mjs`: 36 complete, zero-ball, zero-capture simulated routes across three plans, both fork routes, walking/sprinting/crouching, and intact/fully cut terrain. Cursor persistence and lure/commitment rules also checked. `output/final-cut/replays/matrix.json`.
- `tools/verify-final-cut-replay-safety.mjs`: each of three refuges held for 240 simulated seconds under each plan, with every strip exercised and no capture/automatic victory. Actual bell Use overrides the replay openings and earns physical swale victory in prepared-terrain fixtures. `safety.json`.
- `tools/verify-final-cut-arrival-browser.cjs --replay=1` and `--replay=2`: completed-result fixtures unlock the actual selector, then uninterrupted Gamepad API runs earn preparation, lure, collapse and completion without gameplay placement. Bank plan 1: 140.861 seconds; open plan 2: 134.382 seconds; zero captures/throws/page errors. `plan-1/browser.json`, `plan-2/browser.json`. These are chapter runs, not full campaigns or human tests.
- `tools/verify-final-cut-replay-menu.cjs`: five groups, zero errors; actual keyboard selection, credits return, touch Replay, pause description, Restart, reload and controller selection. Final captures inspected at 2560×1600, 1280×720, 844×390 and 390×844. Compact results scroll naturally; the selector and explanation remain readable.
- Installed web-game client `client-final`: both screenshots/states exist, no error artifacts, no matching Node client process remains. Final shot/state inspected at 6.52 seconds, original round, waiting rig, six decoded speech clips. The prior output lost its session handle; process inventory establishes it is no longer running, not an inferred exit code.

## Limits

The default walking bank pilot crosses at the same 31.60, 46.48 and 57.23 seconds in all plans. Joe's position/phase and remaining cover differ; do not describe this as proof that every route requires new timing. First four observed pass lanes are 0/0/1/2, 0/2/1/2 and 0/0/2/2 (perception and the final bell affect these). Human replay value, dramatic balance, physical-device behavior and full campaign qualification remain open. FC56 is still partial pending that acceptance; the full 72-item objective is incomplete.
