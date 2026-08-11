# Adaptive repeat-capture coaching polish

Date: 2026-08-08

## Goal

Turn repeated failure into a progressively clearer experiment for the next run without weakening Joe or replacing the horror encounter with a tutorial.

## Finding

The career record correctly persisted `lastCaptureCause` and `captureCauseStreak`. Incident Review rendered an orange border and `REPEAT ISSUE xN`, but every streak level reused the original counterplay sentence. The player learned that they repeated a mistake without receiving a more specific adjustment.

## Resolution

Every diagnosed capture cause now owns two bounded coaching tiers:

- `guided_adjustment` at repeat two: one concrete behavior to change.
- `recovery_drill` at repeat three and above: a short repeatable route, timing, or stealth drill.

Covered causes:

- Unsafe Final Filing
- Floodlight Exposure
- Open-Lane Sprint
- Upright in Rough
- Sightline Held
- Bunker Noise
- Sprint Noise
- Rough Rustle
- Audible Movement
- Trail Chain
- Blind Corner

The coaching mode propagates through the complete loop:

- Incident Review title and instruction prefix.
- Selected Retry detail (`ADJUST` or `DRILL`).
- Result-action description.
- Reopened-run target, state banner, and bottom rail.
- `render_game_to_text` mode and repeat-count diagnostics.

Joe AI, movement, awareness, detection, collisions, objectives, scoring, and capture thresholds are unchanged.

## Organic repeat-two evidence

`web/test-actions/release-hardening-repeat-capture.json` performs the staged load, Audit Bell, Water Hazard capture, Retry File, and the same route a second time without injecting state.

- Final mode: defeat.
- Captures: 2.
- Rounds started: 2.
- Cause: `held_sightline` both times.
- Persisted streak: 2.
- Coaching mode: `guided_adjustment`.
- Incident title: `REPEAT x2 // ONE CHANGE`.
- Selected action: `ADJUST // BREAK SIGHT`.
- Adjustment: `Stop crossing open turf. Reach solid cover, wait for Joe to turn away, then move one gap at a time.`
- Readiness: 18/18.
- Browser errors: none.
- Exercised zone p95: Tee 4.2 ms, Audit Row 5.6 ms, Water Hazard 6.0 ms.

## Recovery-drill evidence

A same-order test fixture carried a two-capture Sightline Held streak into one real Standard Review Water Hazard capture.

- Captures: 3.
- Persisted streak: 3.
- Coaching mode: `recovery_drill`.
- Incident title: `REPEAT x3 // RECOVERY DRILL`.
- Selected action: `DRILL // BREAK SIGHT`.
- Drill: `Use Listening Focus from solid cover; move only after Joe turns, and cross one short gap at a time.`
- Retry File reopened to the same drill with `repeatCount: 3`.
- Tutorial and optional practice drill remained skipped.
- Compact HUD remained active.
- Player moved 12 meters immediately after retry.
- Browser errors: none.

## Responsive evidence

- `2560x1600`: canvas `2508x1403.75`, zero overflow.
- `1280x720`: canvas `1209.375x673.265625`, zero overflow.
- `390x844`: canvas `375.21875x208.671875`, zero overflow.
- The high-resolution drill title, evidence, drill sentence, and selected Retry card fit without overlap.
- The reopened drill remains in the established bottom rail and leaves course, map, Joe Attention, and route guidance unobstructed.

## Automated contract

`adaptive_repeat_capture_coaching` requires all 11 diagnosed causes to own non-empty adjustment and drill tiers. `tools/verify-release.mjs` also rejects removal of the adaptive coaching implementation.
