# Field-signal breakaway destination-continuity polish

Date: 2026-08-09

## Findings

The Audit Bell commitment correctly promised `BREAK TO HEDGE TUNNEL`, but after activation several urgent navigation channels replaced that physical answer with the generic label `BREAK SIGNAL`. The reason for moving remained clear, yet the destination became less precise at the moment the player had to route without relying on the map.

A full collision-aware traversal then reached Hedge Tunnel with the signal still active and exposed a second hierarchy defect. The dedicated `MASK YOUR ROUTE` panel correctly owned stillness progress and Joe's remaining check time, but the earlier station result and Night Order handoff briefly rendered as a second overlapping bottom rail at the exact arrival frame.

## Resolution

- Split tactical reason from physical destination in one shared breakaway-label presentation.
- Retained `BREAK SIGNAL` in consequence copy and the combined bottom handoff.
- Preserved Hedge Tunnel, Service Cart, or Range Cart in the commitment preview, immediate route card, first-person target, rear bearing, course map, and text diagnostics until arrival.
- Added a presentation-only reached-cover ownership check. The dedicated hold panel suppresses the result and handoff rail while the player remains behind the exact cover.
- Preserved the underlying message and handoff timers rather than consuming them. If the player leaves cover while they are still relevant, ordinary presentation may resume.
- Left signal timing, Joe AI, collision, route geometry, noise, scoring, detection, survival, and map gameplay unchanged.

## Native traversal evidence

- Audit Bell activation advanced field checks to 1/3 and started the authored verification signal.
- The route retained `HEDGE TUNNEL` from 58.44 meters through five sampled approach stages.
- Collision-aware sprint traversal reached the exact authored sight blocker in 131 frames with 4.12 seconds remaining.
- At arrival, the breakaway reported `reached: true`, `coverConfirmed: true`, `destinationLabel: HEDGE TUNNEL`, and 0.0/0.9 seconds of hold progress.
- The map reported `HOLD STILL // 0.0/0.9s` and hid stale destination distance.
- The visible message and handoff were null; the original filing result remained preserved as `messageSource` with `messageDeferredBy: field_breakaway_hold_panel`.
- After 120 stationary frames, the hold reached 0.9/0.9 seconds, the world panel changed to `SIGNAL MASKED`, and the map changed to `MASKED // STAY HIDDEN` with 2.12 seconds left on Joe's check.
- No browser errors occurred.

## Responsive, performance, and release evidence

- Exact arrival was visually inspected at 2560x1600, 1280x720, and 800x600. Every layout showed one contained hold panel, one consistent map state, and no duplicate bottom rail.
- The centered canvas measured 2508x1403.75 CSS pixels at 2560x1600, 1209.38x673.27 at 1280x720, and 769.63x428.02 at 800x600.
- The adaptive arrival run held 60 estimated FPS at 3.58 ms average, 4.9 ms p95, 33.4 ms observed max, and one long render frame.
- The required official client passed 49/49 readiness checks at 60 estimated FPS with 4.09 ms average, 5.2 ms p95, 33 ms observed max, and no browser-error artifact.
- The static release verifier passed 87 deterministic action scenarios and 48 referenced runtime assets with no warnings or failures.

No ImageGen asset was needed because this pass strengthens navigation continuity and presentation hierarchy around the existing generated station, hedge, map, and environmental art.
