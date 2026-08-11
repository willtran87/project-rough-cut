# Clean Break miss-feedback and retry-loop polish

Date: 2026-08-09

Scope: close the failure side of the existing mandatory station Clean Break loop without changing station timing, score, objective progression, Joe behavior, survival, or level content.

## Finding

The deep-route fixture completed Audit Bell and later reported `left_named_cover_before_expiry`, but that failed optional mastery attempt had no durable player-facing result. Success already owned a reward message, Delivery beat, persistent badge, victory continuity, and defeat continuity. Failure was inspectable only through `render_game_to_text()`, leaving the player without a specific lesson or visible reason to improve at Field Log and Release Review.

## Resolution

- Added reason-specific feedback for leaving named cover early, moving or making noise at signal expiry, and failing to complete the visible quiet hold.
- Each lesson confirms that the next station can still score, preventing one miss from feeling like a ruined run.
- Revealed the existing compact mastery badge after the first attempt. Zero successes use a restrained burnt-amber `CLEAN 0/3`; earned progress remains mint; perfect 3/3 remains gold.
- Preserved the current objective row, compact and expanded HUD geometry, and result ledgers. No additional permanent row or resource meter was introduced.
- Added a bounded feedback queue. Slow footing, collision, pursuit, predator tactics, active interactions, exclusive stealth actions, and scored rewards keep priority. The feedback timer pauses while deferred, then the lesson resumes in the existing bottom rail on ordinary ground.
- Routine turf reminders, zone arrival, and optional Joe dialogue no longer postpone the mechanical outcome indefinitely.
- Exposed attempts, misses, tone, colors, active and last feedback, remaining seconds, deferral owner, and the queue presentation contract through `render_game_to_text()`.
- Added `clean_break_miss_feedback_continuity` and `web/test-actions/field-signal-miss-feedback.json`.

## Cause-to-outcome verification

The final official per-frame route used ordinary keyboard input:

1. Filed Audit Bell.
2. Left the station and deliberately abandoned its named Hedge Tunnel cover before signal expiry.
3. Recorded one attempt, zero successes, and `left_named_cover_before_expiry` with no score or objective rollback.
4. Deferred the coaching while Irrigation Mud and False Retreat owned the immediate survival lanes.
5. Moved left to full-speed fairway at `(-24, 223)`.
6. Resumed `SIGNAL TRACKED — stay behind HEDGE TUNNEL until Joe's check ends. The next station can still score.` with 2.05 seconds remaining.
7. Retained `CLEAN 0/3`, Field Log as the next objective, Joe searching at 119 meters, and the ordinary route/map presentation.

The run passed 32/32 readiness at an estimated 60 FPS with 3.13ms average canvas rendering, 5.9ms p95, 39.4ms observed maximum, one long render frame, and no browser errors.

## Responsive visual verification

- 2560x1600: document and viewport matched; canvas measured 2508x1403.75.
- 1280x720: document and viewport matched; canvas measured 1209.375x673.266.
- 800x600: document and viewport matched; canvas measured 769.625x428.016.
- The badge remained inside the objective row, the complete lesson fitted inside the existing bottom rail, and neither overlapped the map, Joe Attention, route markers, or world art.

## Release verification

- `node --check web/game.js`: passed.
- `node --check tools/verify-release.mjs`: passed.
- `node tools/verify-release.mjs`: 48 referenced runtime images, 60.75MB, zero source masters, zero unreferenced runtime images, 81 deterministic action scenarios, zero warnings, and zero failures.
- `git diff --check`: passed; existing line-ending conversion notices only.

## Asset decision

No ImageGen asset was needed. This pass improves the established HUD and consequence hierarchy while preserving the generated Audit Bell, Hedge Tunnel, course, lantern, and environmental art as the visual focus.
