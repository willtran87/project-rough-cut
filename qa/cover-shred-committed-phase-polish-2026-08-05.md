# Cover Shred Committed-Phase Polish QA

Date: 2026-08-05

## Goal

Give Cover Shred's physical cut a truthful countdown and authored directional cue without replacing useful search evidence during telegraph or adding more UI cards.

## Change

- Telegraph preserves the active evidence-source Joe Attention read.
- Entering `shred` switches Joe Attention to `CUT LINE CLOSING // <time>s` using the authoritative 2.8-second phase timer.
- The existing `cover_shred` caption slot advances to `MOWER CUTS INTO YOUR HIDING LINE` with the cut target's live bearing, danger styling, and remaining duration.
- Later investigate announcements preserve the committed caption instead of replacing it with generic sound copy.
- The existing top-banner deferral and `leave the rough` action rail remain unchanged.
- Pursuit lock retains higher priority, and AI, detection, capture, movement, target, audio, scoring, and navigation are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/cover-shred-commit-attention.json` and a 100 ms inter-step pause.

The route files the Audit Bell, retreats into effective rough, triggers Cover Shred from Joe's trail search, and captures one deterministic frame after telegraph becomes physical shred. Earlier route iterations validated telegraph preservation and were discarded when longer waits allowed open sight to cancel the tactic.

## Observed state

- Mode: `first_hole`
- Rendered frames: `969`
- Predator tactic: `cover_shred`
- Predator phase: `shred`
- Tactic remaining: `2.78s`
- Attention kind: `cover_shred_commit`
- Attention label: `CUT LINE CLOSING // 2.8s`
- Attention remaining: `2.78s`
- Attention color: `#f07441`
- Joe mode: `investigate`
- Joe distance: `19m`
- Player in effective rough: `true`
- State banner visible: `false`
- Banner deferral: `cover_shred_direction_and_action_pair`
- Visible center caption: `MOWER CUTS INTO YOUR HIDING LINE — RIGHT`
- Generic investigation caption queued: `false`
- Bottom action: `JOE IS MOWING YOUR HIDING LINE — leave the rough before the cut reaches you.`
- Average render time: `3.10ms`
- Final render time: `2.5ms`
- Browser-error artifact: none

## Visual inspection

The cut-line countdown is fully readable in Joe Attention. The committed center card begins its established fade-in on the captured phase-boundary frame, while its exact text, right bearing, danger category, and sole-visible-card ownership are confirmed by text state. The route thread, Field Log caption, Joe sprite, grounded status, bottom escape action, and persistent map remain readable; the synonymous top banner stays intentionally deferred.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md web/test-actions/cover-shred-commit-attention.json qa/cover-shred-committed-phase-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
