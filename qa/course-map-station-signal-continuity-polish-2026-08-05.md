# Course-Map Station-Signal Continuity Polish QA

Date: 2026-08-05

## Goal

Keep a mandatory Night Order station's identity continuous between its physical world signal, Joe's investigation target, and the persistent course map.

## Change

- Active field-action signals now own the course-map header for their short authoritative lifetime.
- The header uses the station name, remaining signal time, authored color, and bounded text fitting.
- The map source ring uses the same station color.
- Header ownership falls back to Joe's last known signal and then Course Echo pace, eliminating overlapping status copy.
- Joe's last-known-position pulse and every existing spatial marker remain present.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-polish.json`.

The route entered Hole 1, moved through live course collision, filed the Audit Bell using normal interaction input, and captured the immediate investigation state.

## Observed state

- Mode: `first_hole`
- Rendered frames: `634`
- Field checks: `1/3`
- Next check: `field-log`
- Joe mode: `investigate`
- Joe distance: `99m`
- Active signal: `audit-bell`
- Signal target: `{ x: 86, y: 148 }`
- Remaining signal: `4.23s`
- World label: `AUDIT BELL SIGNAL // 4.2s`
- Map label: `AUDIT BELL 4.2s`
- Map header priority: `active_field_signal`
- Average render time: `3.55ms`
- Final render time: `3.6ms`
- Browser-error artifact: none

## Visual inspection

The captured minimap header displayed `AUDIT BELL 4.3s` in gold beside `COURSE MAP`; its tenth-second lead over the world label is the expected result of the existing bounded minimap refresh cadence. The gold signal ring, amber last-known-Joe pulse, player marker, Field Log objective, and other course objects remained visually distinct. No text collision or clipping was visible.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
