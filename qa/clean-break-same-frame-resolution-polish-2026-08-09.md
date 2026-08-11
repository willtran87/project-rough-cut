# Clean Break same-frame resolution polish

Date: 2026-08-09

## Finding

A native Audit Bell run was extended through activation, collision-aware movement to Hedge Tunnel, the full 0.9-second quiet hold, successful masking, signal expiry, earned Clean Break, and subsequent False Retreat. The mechanics resolved correctly, but the exact reward frame showed `CLEAN BREAK` while the cached course map still read `HOLD QUIET 0m`; first-person diagnostics also retained `HOLD QUIET`. Both recovered to Field Log one frame later.

The same screenshot revealed a tonal mismatch. Earned Clean Break used the same orange border as danger, blocked actions, and failed consequences, weakening the sense of mastery and reward.

## Resolution

- Retire the completed field-signal owner before applying the navigation handoff.
- Refresh the first-person navigation guide during the same update that resolves the signal.
- Force the bounded minimap cache to redraw from the new navigation state on that frame.
- Record the source station, next target, navigation refresh, map invalidation, resolution time, and presentation-only scope in text diagnostics.
- Give a visible Clean Break reward a dark-green surface, mint outer frame, restrained mint inner highlight, and pale mint text.
- Preserve the existing danger-orange treatment for misses and ordinary consequence messages.
- Preserve Joe AI, follow-up search, collision, route geometry, noise, scoring, signal timing, survival, and reward deferral behavior.

## Native interaction evidence

- Collision-aware sprint traversal reached Hedge Tunnel in 131 frames with 4.12 seconds left on Joe's Audit Bell check.
- The quiet hold completed and remained masked through verification expiry.
- On the exact resolution frame, first-person guidance selected `field-log / FIELD LOG` at 331.94 meters.
- The diagnostic handoff recorded `audit-bell → field-log`, `refreshNavigation: true`, `invalidateMiniMap: true`, and `gameplayEffect: none` at 14.93 seconds.
- The persistent map showed `FIELD LOG 332m`; no `HOLD QUIET 0m` copy remained.
- The HUD showed `FIELD CHECKS 1/3 // FIELD LOG` and `CLEAN 1/3`.
- The Clean Break lesson appeared in the mint success rail with its full 2.65-second duration while Joe began the authored Audit Bell follow-up sweep.
- False Retreat subsequently deferred the lesson at 2.63 seconds, kept its timer paused, and retained Field Log as the first-person target.
- No browser errors occurred.

## Responsive, performance, and release evidence

- The corrected reward frame was visually inspected at 2560x1600, 1280x720, and 800x600.
- Canvas geometry remained centered and contained: 2508x1403.75, 1209.38x673.27, and 769.63x428.02 CSS pixels respectively.
- The final native resolution frame held 60 estimated FPS at 2.94 ms average render work, 3.7 ms p95, 29.7 ms observed max, and one long frame.
- Product readiness passed 50/50.
- The official activation regression passed 50/50 at 60 estimated FPS with 3.97 ms average, 4.5 ms p95, 28.5 ms observed max, one long frame, all 48 runtime assets settled, and no browser-error artifact.

No ImageGen asset was needed because this pass improves timing, navigation continuity, and reward hierarchy over the existing generated station, hedge, map, and course artwork.
