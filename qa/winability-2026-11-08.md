# First-level winability audit — 2026-11-08

Candidate: local `web/` served at `http://127.0.0.1:4187/`, revision `20261108-varied-roaming`.
Game source SHA-256: `d9ffc9b95b623b7e2f24af0d365d8ac2c17ffd28ce7d5d5eeee6ce35663f7ac6`.

## Result

No mandatory-objective or victory blocker was reproduced. Both exits reached `victory` in complete ordinary-input runs of Standard Review at normal pursuit intensity (1), with Joe active, all three checks earned, and all four lure balls remaining. Movement, pickups, interactions and final filing used keyboard/mouse input. Read-only route helpers selected waypoints using course geometry and Joe's position; no actors were teleported, objectives assigned, or threats disabled. These are automated route acceptance runs, not human usability testing or a guarantee that every strategy survives.

- Shed: bell → key → field log → release review → shed filing → victory.
- Drain: bell → sprinkler valve → field log → release review → drain filing → victory.
- Evidence: `output/win-audit-20261108/{shed-running,drain-running}/route.json`. Both have zero browser errors. Their immediate result screenshots caught the opening transition; the driver now waits for the result card and captures at 2560×1600.
- Two earlier attempts died while the QA driver stopped to turn and aim a lure near Joe. Correcting its bounded mouse turns, retreat strafing and lure strategy produced successful runs without changing gameplay rules.

## Controlled objective coverage

`node tools/verify-win-objectives.cjs` passes six combinations: Standard Review, Eastern Exception and Closing Shift, each through the shed and drain. Fixtures position actors and park Joe to isolate interaction gates; these are **not** full route runs of the other variants.

Every combination checks locked/unfinished exits, actual E access pickup, all three checks with zero lure balls, movement cancellation of exit filing, preservation of completed checks, successful retry, correct exit attribution and victory. Shed cases use the quiet crouched field-log method; drain cases use the loud method. Release review completes without a lure. Zero browser errors. Finished victory screens inspected at 2560×1600.

Evidence: `output/win-audit-20261108/objectives/report.json` and six screenshots.

## Player completion guide

1. Complete the three required checks: ring the audit bell, stamp the field log, and sign the release review. Face each station and press **E** (or your remapped Use binding).
2. Obtain **either** the shed key **or** open the sprinkler valve to unlock the drain. The field map (**H** by default) can select the intended exit route.
3. Reach the corresponding exit, face it, and press **E**. Stop moving until the opening/filing bar finishes. Movement cancels the attempt, but keeps your completed checks and access item; you can try again.

Quiet filing and lures offer tactical alternatives; they are not required to win. Optional reviews, documents and clean-signal bonuses are not exit requirements. If a ball is still flying or rolling, wait for it to settle before interacting. Break Joe's sightline and use cover after noisy checks.

## Scope and preservation

This audit changes test tooling and documentation only. Pixel art, effects, movement, Joe's navigation and difficulty are unchanged. Deferred human playtests remain useful for measuring how clearly first-time players understand the objectives and how forgiving the course feels. Existing software-rendering performance limits are outside this audit.

Reproduce input-only runs sequentially:

```
node tools/play-complete-route.cjs output/win-audit-20261108/shed-running --shed --hardware --cautious --skip-bonus --no-lures
node tools/play-complete-route.cjs output/win-audit-20261108/drain-running --drain --hardware --cautious --skip-bonus --no-lures
```
