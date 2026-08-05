# False Retreat Cross-Input Action Polish QA

Date: 2026-08-05

## Goal

Make False Retreat's short snapback response immediately actionable on keyboard, gamepad, and touch without adding UI or altering the tactic.

## Change

- Keyboard: the bottom rail resolves the active remapped `move_left` and `move_right` labels.
- Gamepad: the rail says `LEFT STICK SIDEWAYS NOW`.
- Touch: the rail says `DRAG LEFT PAD SIDEWAYS NOW`.
- Every variant retains `cross the mower's returning line` as the shared tactical explanation.
- The message still lasts exactly the existing 1.45-second snapback duration.
- Movement, input handling, target, timing, AI, audio, banner, bearing, collision, and capture are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-snapback-handoff.json` and a 100 ms inter-step pause.

The deterministic route filed the Audit Bell, triggered False Retreat, and captured the keyboard presentation during the snapback window.

## Observed state

- Mode: `first_hole`
- Active input method: `keyboard`
- Rendered frames: `1,128`
- Predator tactic: `false_retreat`
- Predator phase: `snapback`
- Snapback remaining: `0.98s`
- Exported move-left binding: `A`
- Exported move-right binding: `D`
- Bottom rail: `JOE RECOMMITS — A / D SIDEWAYS NOW; cross the mower's returning line.`
- Bottom-rail length: `71` characters
- Visible bearing: `MOWER SNAPS BACK INTO YOUR ROUTE — RIGHT`
- Average render time: `2.29ms`
- Final render time: `2.6ms`
- Browser-error artifact: none

## Visual inspection

The binding-aware bottom rail remains centered inside its protected frame without touching the pause control. The top reversal banner and center danger bearing remain separated, and the hedge opening, reticle, Field Log route, Joe Attention panel, and course map stay unobstructed.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md qa/false-retreat-cross-input-action-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
