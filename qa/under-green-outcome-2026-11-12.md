# Under the Green — factual retry coaching

November 12, 2026. Review item 39, with failure-boundary evidence for 41.

Previously every trimmer capture produced the same generic sentence. The new local outcome module records a failure explanation only after the authoritative blade-contact test succeeds. It selects one actionable suggestion using observable encounter facts:

- Recent surge: a recorded water hit within four seconds and six metres of the capture, with a known outlet. The text describes the surge preceding the sweep; it does not claim the water itself killed the player. Advice offers the dry route only when the outlet actually has one.
- Blocked bank: a stationary player beside an outlet that is still dangerous, with an authored dry alternative. Advice explains when to leave the bank instead of waiting.
- Crouched capture: explains that crouching remained within the blade's sweep and recommends lateral movement or cover.
- Unfinished closure: names the unsecured barrier and recommends earning space before using the release. This branch has a pure contextual test; this pass does not claim an ordinary route reproduction of a capture during gate closure.
- Other captures: names the committed sweep and its lateral evasion opportunity.

The result screen separates the cause from “Next try” and states the actual retry location plus retained bypass/record facts. It preserves immediate retry, existing saves, checkpoint locations, attack rules, water recovery, difficulty and pursuit. The outcome object is transient and is cleared by creating the next attempt. Pause, completion and reload do not display stale failure coaching. Diagnostic state exposes the selected failure kind for verification; no telemetry opt-in is needed for ordinary player feedback.

## Verification

- `tools/verify-under-green-outcome.mjs` → `output/under-green/outcome/rules.json`: actual simulated ordinary, crouched, surge-then-strike and pressurized-bank captures select their respective coaching. Recent-surge coverage executes the real water hit and recovery before the real trimmer strike. Stale, distant and unknown outlet events cannot trigger that advice. No-detour wording, gate context and fresh retry/durable facts also pass.
- The initial blocked-bank fixture began before pressure was active at capture time, correctly selected generic sweep advice and failed its expectation. The fixture now starts during a genuine pressure interval; no product timing was altered to satisfy it.
- `tools/verify-under-green-outcome-browser.cjs` → `output/under-green/outcome/browser.json`: actual browser capture, visible advice, ordinary retry, bypass/evidence retention, cleared failure state, pause and reload all pass. The surge screenshots use a terminal state produced by the real simulation test, not an invented failure description.
- Result/cause/advice inspected at **2560×1600, 1280×720, 844×390 and 390×844**. Text fits its panel; retry is visible on portrait/desktop and reachable by scrolling on the short landscape screen. Existing controller-menu regressions pass, including automatic focus scrolling and retry.
- Existing Under the Green rules, service encounter and audio/aftermath tests pass. The ignored windup still causes defeat; A-then-W still dodges the same committed sweep. Gate completion remains secured, movable during aftermath and persistent after reload.
- Standard web-game client completed two iterations. Latest `standard-client/shot-1.png` and `state-1.json` inspected: playing/ready at 0.8 seconds, no failure or console-error artifact. Syntax and scoped whitespace checks pass.

## Remaining acceptance

This implements event-specific retry guidance; it does not prove that an unfamiliar player understands or follows it. First-crossing comprehension, retirement of learned coaching, full encounter balance, physical-device ergonomics and human listening/playtesting remain part of the active 44-item goal. Chapter-specific failure facts stay local; the other chapters retain their own causes and counterplay.
