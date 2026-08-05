# Named Night Order Investigation-Signal Polish QA

Date: 2026-08-05

## Goal

Keep the identity of each mandatory Night Order station visible after interaction, when its noise becomes Joe's active investigation target.

## Change

- Field-action distractions now retain the originating station ID, short label, and authored color.
- The existing world marker renders the named station signal plus its live investigation countdown.
- `render_game_to_text` exposes the same source, target, color, countdown, and world label as `hole.fieldChecks.activeSignal`.
- Investigation position, duration, Joe AI, station interaction, objective progression, route guidance, audio, and scoring are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-polish.json`.

The script entered Hole 1, traversed the obstacle-aware route to the Audit Bell, filed it through normal interaction input, and captured the immediate consequence frame.

## Observed state

- Mode: `first_hole`
- Rendered frames: `614`
- Field checks: `1/3`
- Next check: `field-log`
- Joe mode: `investigate`
- Joe distance: `99m`
- Active source: `audit-bell`
- Active target: `{ x: 86, y: 148 }`
- Remaining signal: `4.23s`
- World label: `AUDIT BELL SIGNAL // 4.2s`
- Average render time: `3.52ms`
- Final render time: `2.8ms`
- Browser-error artifact: none

## Visual inspection

The gold named countdown is grounded over the bell's concentric sound rings. It remains readable beside the Audit Bell art, player, mint Field Log route thread, objective dossier, Joe attention panel, and course map. The existing two-line consequence rail still owns the bottom presentation lane.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md qa/named-night-order-investigation-signal-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
