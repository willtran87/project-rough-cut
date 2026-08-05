# Grounded Joe Search-Label Polish QA

Date: 2026-08-05

## Goal

Make Joe's nearby world-space identity reflect the same search evidence already reported by the screen-fixed attention panel.

## Change

- Trail searches display `JOE: TRACKING TRAIL`.
- Lost-sightline searches display `JOE: SIGHTLINE SWEEP`.
- Remembered-cover searches display `JOE: COVER AUDIT`.
- Mandatory station follow-ups display `JOE: SWEEPING <STATION>`.
- The label inherits the active evidence color and exposes its `sourceKind` in text state.
- Search mechanics, timing, pathing, collision, capture, detection, and scoring remain unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-search-handoff.json`.

The route filed the Audit Bell, retreated through bent rough, and paused after Joe discovered the resulting trail.

## Observed state

- Mode: `first_hole`
- Rendered frames: `963`
- Next check: `field-log`
- Joe mode: `search`
- Joe distance: `21m`
- Search remaining: `6.38s`
- Search context: `trail`
- Attention label: `FOLLOWING TURF EVIDENCE // 6.4s`
- World label: `JOE: TRACKING TRAIL`
- World-label source: `trail`
- World label visible: `true`
- World label tactically visible: `true`
- World label suppression: none
- Average render time: `2.71ms`
- Final render time: `2.3ms`
- Browser-error artifact: none

## Visual inspection

The amber grounded label remained attached to Joe and fit at the desired size inside the established panel. It stayed distinct from the Field Log route caption, mower-lane warning, obstacle guidance, course map, and bottom consequence rail. The longer screen-fixed attention label supplied the detailed countdown without duplicating it in world space.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
