Under the Green implementation: rules and first shared foundations

This is an interim delivery toward all 44 review items. See design/under-green-implementation-ledger.json. Encounter layout, sustained pursuit, Joe staging/animation, bounded water recovery, visual reconstruction, audio, playable aftermath, mobile/controller improvements, profiling and unfamiliar-player validation remain open.

Implemented and verified:

- Sluice uses the console at (2.65,219), facing/reach/line-of-sight. Gate clearance is 3.3*(1-fraction) against actor height. Closure cancels and reverses when player leaves protected side or Joe occupies threshold; completion requires secured inside state. Same-side Joe never freezes merely because gate passed halfway.
- Bypass is a durable version-2 chapter fact. Version-1 saves migrate from checkpoint/completion. Retry/reload immediately after lever restores mechanism even before checkpoint 2. Chapter restart deliberately starts a fresh bypass.
- Every outlet exposes a timed or explicit event-controlled state. Return warning has actual two seconds; permanent return never promises another opening. Crossing advice includes approach, stance/speed, remaining bank clearance and .35s reaction margin. WAIT uses amber.
- Level 1 and Under the Green share key validation/label resolution and untouched legacy-layout migration. Existing Back Nine steering behavior remains unchanged.
- preference-store retains existing namespaces, validates campaign fields, preserves unknown fields, and offers changed-field writes. Level 1 uses a normalized initial snapshot so unrelated newer preferences survive its saves. Both Level 2 branches read shared campaign preferences and use shared record writes. Under the Green exposes campaign volume/reduced motion and gives campaign reduced-motion precedence over a stale local override.

Verification run:

- node tools/verify-under-green-rules.mjs
- node tools/verify-campaign-preferences.mjs
- node tools/verify-under-green.mjs (seven live-Joe completion scenarios; three pressures, checkpoints, evidence)
- node tools/verify-under-green-design.mjs
- node tools/verify-under-green-browser.cjs
- node tools/verify-under-green-controls.cjs
- node tools/verify-under-green-build-browser.cjs
- node tools/verify-under-green-transition.cjs (actual drain and shed handoffs; sibling checkpoint preservation)
- node tools/verify-interact-controls.cjs (updated to skip existing Level 1 story through its real UI; migration, actual E/G keys, conflict swap, persistence)
- node tools/verify-runner-controls.mjs
- node tools/verify-back-nine-opening-controls.cjs (wait predicate now tolerates asynchronous bootstrap before hook exists)
- Required develop-web-game standard client, two iterations of movement with pauses; output/under-green/build/standard-client.

Browser screenshots inspected at 2560x1600 and 390x844; browser captures also cover 1280x720 and 844x390. Browser suites report zero runtime errors. Standard-client 960x540 software rendering and state inspected. No new performance or human-fun claim follows from these correctness checks.

Observed remaining visual issues: extremely repetitive stone, abrupt roof/sky joins, disconnected pipe ends, basic console art and water sheets, dense phone HUD. Current all-walk automated route ~71.78s still leaves a large lead: sustained pursuit is NOT fixed. No external deployment, broad cleanup or repository reset performed.
