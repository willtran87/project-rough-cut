# Cover Shred Signal-Hierarchy Polish QA

Date: 2026-08-05

## Goal

Reduce redundant Cover Shred overlays while preserving the directional warning and exact survival action.

## Change

- The `COVER SHRED // ROUGH ENTERING SCOPE` state banner yields only while the authored directional caption and `leave the rough` message are both active.
- The banner text, lifetime, lock, and inspectable state remain intact.
- The centered threat caption retains mower direction.
- The bottom rail retains the actionable escape instruction.
- Tactic timing, target, mower effects, audio, Joe behavior, search, and capture are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/night-order-station-search-handoff.json`.

The route filed the Audit Bell, retreated through bent rough, allowed Joe to discover the trail, and naturally triggered Cover Shred during the resulting search pressure.

## Observed state

- Mode: `first_hole`
- Rendered frames: `962`
- Joe mode: `search`
- Joe distance: `21m`
- Search source: `trail`
- World label: `JOE: TRACKING TRAIL`
- Stored state banner: `COVER SHRED // ROUGH ENTERING SCOPE`
- State-banner visible: `false`
- State-banner deferral: `cover_shred_direction_and_action_pair`
- Visible threat-caption cards: `1`
- Duplicate caption cards: `0`
- Bottom instruction: `JOE IS MOWING YOUR HIDING LINE — leave the rough before the cut reaches you.`
- Average render time: `4.52ms`
- Final render time: `4.1ms`
- Browser-error artifact: none

## Visual inspection

The top-center moonlit course view remained open. The centered `[ MOWER DECK LOWERS TOWARD THE ROUGH — RIGHT ]` card retained direction, while the bottom consequence rail retained the exact response. Joe's grounded trail label, attention panel, Field Log route, obstacle guidance, and course map remained readable.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
