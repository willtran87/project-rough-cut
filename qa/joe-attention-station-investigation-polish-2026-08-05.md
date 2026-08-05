# Joe Attention Station-Investigation Polish QA

Date: 2026-08-05

## Goal

Keep the mandatory station identity visible in the Joe Attention panel while Joe investigates its loud field-action signal.

## Change

- The shared field-action signal now exposes a dedicated attention label.
- The Joe Attention status line uses that label and station color only during a matching field-action investigation.
- Text fitting is bounded between 11 and 8 pixels inside the existing 228-pixel lane.
- Non-station investigations retain the generic `VERIFYING DISTURBANCE` status.
- Joe behavior, signal duration, alert, detection, status priority, panel geometry, and objective progression are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-polish.json`.

The route entered Hole 1, navigated course collision, filed the Audit Bell through normal interaction input, and captured Joe's immediate investigation response.

## Observed state

- Mode: `first_hole`
- Rendered frames: `622`
- Field checks: `1/3`
- Next check: `field-log`
- Joe mode: `investigate`
- Joe distance: `99m`
- Active signal: `audit-bell`
- Signal remaining: `4.23s`
- Attention label: `VERIFYING AUDIT BELL // 4.2s`
- Average render time: `3.08ms`
- Final render time: `2.9ms`
- Browser-error artifact: none

## Visual inspection

The Joe Attention panel displayed the full gold `VERIFYING AUDIT BELL // 4.2s` line at its desired 11-pixel size. It remained inside the existing lane with clear separation from the detection meter, composure read, Joe distance, and score projection. The world signal, map header, objective dossier, Field Log route, and consequence rail remained readable and consistent.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
