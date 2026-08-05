# False Retreat Snapback-Direction Polish QA

Date: 2026-08-05

## Goal

Make False Retreat's center bearing describe the real mower reversal instead of falling back to generic investigation wording.

## Change

- During `false_retreat / snapback`, the existing `joe_investigate` caption slot reads `MOWER SNAPS BACK INTO YOUR ROUTE`.
- The caption uses danger styling, Joe's live player-relative bearing, and the remaining snapback duration.
- Refreshing Joe's investigate state preserves the authored snapback cue instead of overwriting it.
- Outside snapback, the established `JOE TURNS TOWARD A SOUND` investigation caption is unchanged.
- No extra caption card, AI change, tactic timing change, or gameplay modifier was added.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-snapback-handoff.json`.

The first post-change replay exposed an update-order overwrite and was rejected. After moving ownership into the central Joe-state announcement path, the identical deterministic route was replayed successfully with a 100 ms inter-step pause.

## Observed state

- Mode: `first_hole`
- Rendered frames: `1,122`
- Predator tactic: `false_retreat`
- Predator phase: `snapback`
- Snapback remaining: `0.98s`
- Stored banner: `FALSE RETREAT // JOE RECOMMITS`
- Banner visible: `true`
- Bottom action: `JOE RECOMMITS — break sideways now; the mower is snapping back to your last route.`
- Visible center captions: `1`
- Visible caption: `MOWER SNAPS BACK INTO YOUR ROUTE — RIGHT`
- Caption category: `danger`
- Generic investigation caption queued: `false`
- Average render time: `2.48ms`
- Final render time: `2.2ms`
- Browser-error artifact: none

## Visual inspection

The top banner names the reversal, the center danger card communicates the mower's live right-side bearing, and the bottom rail gives the survival action. The three surfaces remain visually separated and leave the hedge opening, reticle, Field Log route thread and caption, Joe Attention panel, and persistent course map readable.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md qa/false-retreat-snapback-direction-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
