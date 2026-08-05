# Evidence-Attributed Joe Search Polish QA

Date: 2026-08-05

## Goal

Make Joe's search state explain the evidence he is actually following instead of displaying the ambiguous `SEARCHING LAST SIGNAL` for every search source.

## Change

- Search presentation can identify a completed Night Order station, discovered turf trail, lost sightline, or remembered-cover audit.
- The latest evidence replaces older search copy and supplies the existing attention-panel countdown and accent.
- Listening Focus's active tactical movement read still takes priority.
- Search duration, search center, navigation, detection, trail discovery, cover memory, and capture rules are unchanged.
- `render_game_to_text` exposes the active source under `hole.joe.searchContext`; station-only handoffs are also available under `hole.fieldChecks.searchHandoff`.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-search-handoff.json`.

The initial stationary settle correctly ended in capture as Joe reached the bell. The final scenario filed the Audit Bell, retreated diagonally, and paused after its signal expired so Joe could transition through the station sweep and discover the player's bent-grass evidence.

## Observed state

- Mode: `first_hole`
- Rendered frames: `970`
- Field checks: `1/3`
- Next check: `field-log`
- Active station signal: none
- Joe mode: `search`
- Joe distance: `21m`
- Search remaining: `6.38s`
- Search kind: `trail`
- Search source: `TURF EVIDENCE`
- Search target mark: `20`
- Attention label: `FOLLOWING TURF EVIDENCE // 6.4s`
- Detection source: `trail`
- Average render time: `3.21ms`
- Final render time: `2.3ms`
- Browser-error artifact: none

## Visual inspection

The fitted amber evidence label remained inside the Joe Attention lane and matched the simultaneous `COVER SHRED`, mower-lane, and hiding-line warnings. The expired bell signal was absent, while the Field Log objective ribbon and course map had resumed their ordinary route presentation. Joe's grounded search label remained readable and no new panel was added.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md web/test-actions/night-order-station-search-handoff.json`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
