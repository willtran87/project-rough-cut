# False Retreat Snapback-Handoff Polish QA

Date: 2026-08-05

## Goal

Ensure False Retreat stops describing a withdrawal the instant Joe's real tactic state changes to snapback, and give the player a concise survival action for the reversal window.

## Change

- Entering `snapback` replaces the opening `JOE IS YIELDING THE LANE` caution with `JOE RECOMMITS — break sideways now; the mower is snapping back to your last route.`
- The replacement rail lasts exactly the existing 1.45-second snapback duration.
- The `FALSE RETREAT // JOE RECOMMITS` banner, directional threat caption, Joe behavior, target, timing, audio, and capture rules are unchanged.
- `render_game_to_text` now exposes the active predator tactic's type, phase, remaining time, duration, target, and presentation contract; it reports `null` while no tactic is active.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-snapback-handoff.json`.

The route filed the Audit Bell, retreated into the fairway, triggered False Retreat from Joe's evidence pressure, and advanced three seconds beyond the prior opening capture to land inside the snapback.

## Observed state

- Mode: `first_hole`
- Rendered frames: `1,106`
- Predator tactic: `false_retreat`
- Predator phase: `snapback`
- Snapback remaining: `0.98s`
- Stored banner: `FALSE RETREAT // JOE RECOMMITS`
- Banner visible: `true`
- Banner deferral: `null`
- Bottom rail: `JOE RECOMMITS — break sideways now; the mower is snapping back to your last route.`
- Visible bearing: `JOE TURNS TOWARD A SOUND — RIGHT`
- Joe mode: `investigate`
- Joe distance: `83m`
- Average render time: `2.41ms`
- Final render time: `2.4ms`
- Browser-error artifact: none

## Visual inspection

The top reversal banner, centered right-side bearing, and lower action rail read as state, direction, and response. They leave the central hedge opening, reticle, Field Log route thread and caption, Joe Attention panel, and persistent course map unobstructed. No withdrawal copy remains during the verified snapback phase.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md web/test-actions/false-retreat-snapback-handoff.json qa/false-retreat-snapback-handoff-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
