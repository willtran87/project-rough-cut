# Under the Green: compact range and timed route choices

The final district is now 35% shorter along its travel axis. The keeper control moves from y=2 to y=14.6, bringing it 12.6 m toward the entrance. Corridor widths, movement speed, Joe's walking speeds and attack rules are preserved. The two range outlets remain six seconds out of phase; their offsets are now 7 and 1. Each is 3.9 m deep, with a separate middle landing and an east recovery route.

Collision floors, water, checkpoints, gate/console, inspection destinations, route markings, lamps, roof transitions and netting use the same range coordinate conversion. The middle support sits at the landing edge; the connection is wide enough for both actors. Existing checkpoint IDs retain their encounter meaning, so version-3 saves restore to the relocated safe starts rather than stale coordinates.

The tighter gate audit found a fresh-pose trimmer overlap at a partially closed gate. Initial placement can now select a 1.5-radian upright carry when the shallower poses are obstructed. Movement still checks tool clearance continuously; this does not grant passage through the gate.

## Results and limits

| Scripted route | Completion time | Final separation |
| --- | ---: | ---: |
| Full dry walk with dodge responses | 75.23 s | 12.51 m |
| Full wet walk | 87.25 s | 12.89 m |
| Full sprint with dodge responses | 50.75 s | 22.77 m |
| Checkpoint 1 dry | 51.23 s | 26.08 m |
| Checkpoint 2 dry | 25.23 s | 22.73 m |
| Checkpoint 3 dry | 20.23 s | 12.89 m |

The prior full dry separation was 30.01 m. This improvement combines physical compaction and phase placement, without changing speed or reading the hidden player. The current scripted full dry range reaches a minimum separation of approximately 9.62 m. This is closer contact, not proof of a frightening climax. Sprinting still buys a clean escape, and checkpoint 1 remains comparatively low-pressure.

At checkpoint 3, twelve arrival seconds were tested with both routes. All twelve dry recoveries completed. The wet route reached the next landing up to 4.92 seconds sooner when an opening was available; the dry route was up to 3.78 seconds faster at other phases. These comparisons use the next landing, because the final keeper outlet can erase earlier time differences. They demonstrate a timing-dependent tradeoff at the middle landing, not balanced player preference across the entire chapter.

The pilot was corrected to finish short clear segments to fractional-coordinate targets. Its checkpoint branches now preserve the requested wet route instead of silently substituting the dry path. Earlier exploratory files (`phase-comparison.json`, `arrival-comparison.json`, scale trials) predate one or both corrections and must not be treated as final validation. Final evidence is the compact-range `verified.json`, current folded/rules, clearance reports and late-pursuit verified report.

## Verification

- `verify-under-green-compact-range.mjs`: direct middle connection for .4/.8 m navigation clearances, dry checkpoint starts, and 24 middle-landing route runs across twelve arrival times.
- `verify-under-green-folded.mjs`: complete wet/dry, sprint, observation pauses, optional evidence, all checkpoints, physical pump prerequisite, current saves and gate geometry.
- `verify-under-green-clearance.mjs`: 1,288 floor/heading placements and 11,569 live-Joe route frames, plus turns, interrupted strikes and threshold occupancy.
- Rendered geometry audit: nine poses, 14,697 vertices each; no reported structure/tool intersections after the upright-pose fix.
- Browser interaction checks: pump operation, real movement through the drained outlet, checkpoint 3, physical closure, aftermath and results. Static camera clearance sampled 1,126 positions with no hits.
- Four viewport captures inspected: 2560×1600, 1280×720, 844×390 and 390×844. Current signals, landing and gate share the compact geometry. Standard client latest screenshot/text state also inspected; normal 3.84 m/s walk, no water hit or error artifact.

Human enjoyment, first-time comprehension and physical-device ergonomics remain unverified. The range still has an empty distant background and repetitive wall treatment; this pass does not claim final art quality. Broader campaign settings/menu integration, pump staging and performance work remain in the 44-item ledger.
