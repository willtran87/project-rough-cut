# Back Nine experience implementation — pass 3

Date: 2026-11-12. Full 38-item goal remains active. This pass addresses encounter starvation, physical route entry and unnecessary replanning. Human playtesting remains deferred.

## Changes

- After a completed physical retreat, a moving cart can create a bounded 2.4-second tactic selection opportunity (every second ram or an unused district opportunity). Stationary and on-foot recovery retain their existing windup behavior. Earned relief and checkpoint/ejection protection take precedence. Hidden steering cannot change the observed selection pace; the opportunity cannot renew without another real retreat.
- Three conditional district priorities use the actual course: pump-yard lane commitment, windbreak interception at the flooded range and a clubhouse close-pass opportunity. They require ordinary visibility, geometry, speed and safety eligibility. They are deliberately skippable by good evasion or an earlier cart failure.
- Announced interceptions begin their physical turn during the 1.5-second signal. Lane/passing attacks retain a 1.8-second warning. A passing corridor extends far enough for a real overtake after the one-second alongside hesitation; it must be clear all the way. Commitment speed is capped at 24 m/s and follows normal acceleration/collision constraints. Hidden targets stay fixed, obsolete visible predictions can be abandoned, and misses retain recovery.
- Score ducks to 0.32 during these warnings. Existing engine/steering/deck movement carries the cue; descriptive warning captions are optional and ordinary banners stay quiet.
- Fixed graph entry around shelter posts: the planner now retains its reachable starting node when skipping it would cross an obstacle. Waypoint consumption verifies the next segment before skipping that entry. Dynamic wreck avoidance also applies when selecting the entry node. Persistent obstacle contact schedules replanning at a bounded interval rather than every simulation tick.
- Updated only relevant Back Nine import-map versions; preserved concurrent campaign/Final Cut integration and shared settings work.

## Verification

Artifacts: `output/back-nine-experience/districts/` and `district-client/`.

- New district simulation checks three feasible spatial attack priorities, complete warnings, frozen hidden targets, physical route connections, optional captions, bounded selection, protection and pause.
- Four input-driven, normal-health full runs complete with live Joe. Main / east clubhouse / reservoir runs using both optional repair stops finish in the cart at 61 / 62 / 83 health. Main route skipping those stops loses its cart through eight real hits and completes on foot. The east clubhouse run encounters all three district priorities; player turns can avoid a completed pass, as intended. All contact steps remain separated. The reservoir stop conserves one unit of unused service supply on reaching full health.
- Browser: a real straight-driving close pass completes at 6.13 m closest center separation, zero impacts and exactly one scrape event. All three warnings exercised with rear look, optional captions, pause and reduced motion. Inspected 2560x1600, 1280x720 and 844x390 screenshots. No page/console errors. 23 shader programs, 36 textures, 12 audio voices remain unchanged; no new buffer allocations during these scenarios.
- Rejoin regression: exact shelter-post stall previously made 381 plans in 12 seconds, peaking at 60 plans/second, and moved 1.53 m. The corrected route makes 25 plans, peaks at 6/second and moves 87.34 m around the shelter. An additional 5,307 route legs around shelter corners, forks and garage approaches have clear physical segments. Baked navigation remains active with zero runtime edge rebuilding. Timing percentiles varied under concurrent browser load, so no raw frame-time or GPU-speed claim is made.
- Existing suites pass: 12 driving routes/checkpoint starts; three on-foot starts; stationary/rear/side/boundary/blocked-reverse ram recovery; windup; physical commitments and gates; health/fatal ram/solid wreck; controls; pursuit continuity; shared encounter priorities; service; quiet messages; seven score arrangements. Source syntax checks pass.
- Installed standard web-game client ran through the presentation-aware adapter. Latest `district-client/page-1.png` and state inspected: ready, on foot, cart-style turning, unchanged recovery protection, no error artifact. This is a smoke check, not human experience acceptance.

## Remaining scope

No claim that all 38 items are complete or software rendering is fixed. District behavior is implemented and automated; human readability/tension balance still needs later playtests. Fork composition and tradeoffs, on-foot cover encounters, finite sensory searches, meaningful mechanisms, damage/animation, environment/light/audio refinement and sustained renderer profiling remain in the full ledger.

Next useful pass: inspect evidence-based loss of sight and on-foot decisions. Current `back-nine-sim.js` refreshes exact lastSeen from every audible hidden movement and otherwise targets one point for ten seconds. Improve the finite search/readability without weakening visible pursuit, creating homing hidden targets, or adding per-frame path probes. Keep current district and route tests as regressions.
