# False Retreat Signal-Hierarchy Polish QA

Date: 2026-08-05

## Goal

Reduce redundant False Retreat opening overlays while preserving its deceptive withdrawal, directional warning, and later snapback reveal.

## Change

- The `FALSE RETREAT // MOWER THROTTLE DROPPING` banner yields only while the authored return-direction caption and `JOE IS YIELDING THE LANE` caution are both active.
- The stored banner text, timing, directional caption, and bottom caution remain inspectable.
- The exact opening-string guard does not match `FALSE RETREAT // JOE RECOMMITS`, so the reversal retains its two-second top banner.
- Search attribution, Joe behavior, tactic movement, audio, mower-headlight presentation, collision, and capture remain unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-signal-hierarchy.json`.

The route filed the Audit Bell, retreated into the central fairway, let Joe pick up the new turf trail, and naturally triggered False Retreat during the resulting search.

## Observed state

- Mode: `first_hole`
- Rendered frames: `942`
- Joe mode: `search`
- Joe distance: `72m`
- Joe direction: `RIGHT`
- Search source: `trail`
- Attention read: `FOLLOWING TURF EVIDENCE // 6.4s`
- Stored state banner: `FALSE RETREAT // MOWER THROTTLE DROPPING`
- State-banner visible: `false`
- State-banner deferral: `false_retreat_direction_and_caution_pair`
- Visible threat caption: `MOWER FALLS BACK // WATCH FOR THE RETURN — RIGHT`
- Bottom caution: `JOE IS YIELDING THE LANE — the mower is still pointed at your last position.`
- Average render time: `3.44ms`
- Final render time: `4.8ms`
- Browser-error artifact: none

## Visual inspection

The opening top-center banner was absent, leaving the hedge gap and Joe's committed lane readable. The centered return cue retained direction, and the lower caution explained the deception without covering the player, route thread, objective caption, HUD, or persistent course map.

## Recommit contract

The presentation guard requires the exact opening banner `FALSE RETREAT // MOWER THROTTLE DROPPING`. The tactic changes the stored banner to `FALSE RETREAT // JOE RECOMMITS` when it enters `snapback`, so the reversal no longer satisfies the deferral rule and renders through the established state-banner path for two seconds.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md web/test-actions/false-retreat-signal-hierarchy.json qa/false-retreat-signal-hierarchy-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
