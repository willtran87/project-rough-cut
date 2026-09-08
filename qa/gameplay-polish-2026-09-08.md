# Gameplay clarity and reward polish

Date: 2026-09-08. Scope: implementation following the gameplay experience review.

## Delivered behavior

- First-time players see three concrete ideas in the menu: follow lanterns, divert Joe, and break his sightline. The portfolio and Overtime panels appear after the first run.
- Compact gameplay uses a larger objective/inventory panel and an attention panel that retains the same threat explanation as desktop. Critical rail text wraps at a displayed size of at least 14 pixels in the tested viewports. Touch rails fit between the movement pad and action buttons.
- The compact Survival Briefing is reduced to three short action rows and two control lines. The rear-direction panel and reward cards clear the enlarged HUD. The compact map preserves collision clearance, footing escape, and reached-cover hold priority.
- Scanlines are composited over the gameplay world before the HUD, briefing, captions, and controls. The environment retains its original visual treatment while critical text is clean.
- Stealth coaching now instructs players to reduce attention and use cover rather than promising safety solely because Joe turns. Pressure difficulty scales positive detection accumulation; it no longer slows recovery in Steady or speeds recovery in Relentless.
- Optional Sprint Reviews require the normal Interact binding: keyboard Enter, controller A, or touch Use. The action previews the bell's consequence, ball reward, and exact filing reduction. Required stations, emergency actions, exits, and recoverable items retain priority.
- A full-inventory review grants a reserve ball instead of discarding its reward. One reserve automatically fills the slot opened by the next chip. Each review rewards once; the three reviews cap the reserve at three; retry clears it. Both HUD layouts and state export report reserve inventory.

## Verification

- `node tools/verify-release.mjs`: passes syntax, static release contracts, 48 runtime image assets, and parsing of 89 existing action fixtures. Fixture parsing is not equivalent to executing all fixtures.
- Installed develop-web-game client: the deep-route replay reaches Audit Bell and Water Hazard. The later opening/collision replay passes 57/57 runtime readiness checks, with 5.6 ms reported p95 render work and no browser error output. Its fixed-step execution does not certify real-time device frame pacing.
- `node tools/verify-gameplay-polish.cjs`: browser regressions cover ordinary input to the first station; immediate compact-map routing; review pass-through versus explicit activation; missing-ball and full-inventory rewards; duplicate and three-review caps; reserve consumption; required-station priority; consistent detection recovery; both exit filing/cancellation/completion sequences; retry reset; pause/resume; synthetic touch Use and controller A/held-button/disconnect handling.
- Edge cases use a test-only source interception that exposes state inside the browser test. The production game has no added test-state access. Exit completion tests begin from controlled exit setups; they do not establish that an entire naturally played route is balanced.
- Inspected menu, briefing, station, muddy-route, review-preview, earned-reward, and touch captures at 2560x1600, 1280x720, 800x600, and 844x390. Original generated art remains in use.
- Local screenshots and JSON: `output/gameplay-polish-2026-09-08/`. These artifacts are ignored by Git. The reproducible browser regression tool is tracked under `tools/`.

## Performance qualification

A normal-time, high-resolution headless comparison was run against the original HEAD source and the edited source on the same shared machine. Baseline: 17.05 ms average render work, 47.6 ms p95, 14.4 estimated FPS. Edited: 13.36 ms average render work, 37.8 ms p95, 15.1 estimated FPS. Both exceed acceptable interactive frame times in this environment. This small sequential sample does not demonstrate a regression from the edits or establish a release-grade performance improvement. Starting progress differed slightly because the real-time simulation clamps long updates.

The existing physical keyboard/controller/touch sessions and 10-15 minute hardware soak still require human evidence. Do not equate automated functional success with proof of comfortable controls, stable hardware performance, or repeat-play enjoyment.

## Remaining design experiments

Directional vision, differentiated mandatory station mechanics, and optional failed-encounter rehearsal remain proposals. This implementation concentrates on confirmed clarity and reward problems; it does not silently change the core pursuit geometry or ranked-run reset structure. Evaluate those larger changes through representative full runs and observed player decisions.
