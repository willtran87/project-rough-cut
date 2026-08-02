# Rough Cut Release-Candidate Refinement

Date: 2026-08-01

## Scope

This pass locked scope to the existing Hole 1 and resolved the remaining release-candidate work through route cohesion, presentation safeguards, accessibility defaults, complete input-driven traversal, and focused interaction regressions. It added no new zones, progression branches, objectives, or gameplay systems.

## Implemented fixes

- Route commitment is now coherent. Opening the drain valve suppresses shed-key guidance and keeps the world ribbon, map, and text state on the drain exit. Collecting the shed key commits guidance to the shed exit. If both unlocks are acquired, the nearer valid exit remains available.
- `render_game_to_text` now exposes the next collision-aware navigation waypoint with world coordinates and distance. This mirrors the lantern ribbon and makes non-visual and automated traversal deterministic without teleporting state.
- Bottom message copy now uses a bounded fitted-size safeguard. The Release Corridor cue was also tightened to `RELEASE CORRIDOR — both exits are close. Narrow lanes. Keep moving.` so it stays at the normal readable size.
- A fresh install now inherits the operating system's `prefers-reduced-motion` choice. An explicit saved on/off choice continues to override the system default.

## Complete route regressions

Both routes used ordinary keyboard events, collision-aware waypoints, real interactions, threat avoidance, and the deterministic game clock. Neither route teleported or mutated internal game state.

| Route | Result | Game time | Zones | Filing | Browser errors |
|---|---:|---:|---:|---:|---:|
| Drain valve → culvert | Victory | 55.67s | 8/8 | 100%, one attempt, no cancellation | 0 |
| Shed key → maintenance shed | Victory | 45.50s | 8/8 | 100%, one attempt, no cancellation | 0 |

The drain run recovered from five named collision contacts through the displayed escape directions. The shed run crossed all eight zones without a collision contact. Both committed route labels remained stable through Final Filing.

## Interaction matrix

- Rear view reached the full rear projection while forward movement continued; release returned to forward view and preserved `body_relative_unchanged` movement.
- Pause froze player position, Joe position, and the course clock exactly across five simulated seconds; resume returned to `first_hole`.
- Keyboard chip aim exposed its complete preview, spent one ball, created a recoverable authored ball, and redirected Joe into investigate mode.
- Keyboard crouch plus Listening Focus activated together and released cleanly.
- Synthetic standard gamepad input validated left-stick movement, RT sprint, R3 rear view, LB crouch, LT focus, X aim/release, ball consumption, and controller prompt ownership.
- Synthetic multi-touch validated independent Move, Run, Rear, and Focus pointers; movement continued during rear view and every held pointer cleared on release.
- Result presentation reached the full scorecard, exposed Rematch File / Next Order / Clubhouse actions, and started a tutorial-free targeted rematch through the default Rematch action.

## Presentation, accessibility, and performance

- 844×390 landscape, 390×844 coarse-pointer portrait, and 1280×720 Reduced Motion layouts had no horizontal or vertical overflow.
- Portrait displayed the rotate-device prompt. The canvas remained keyboard focusable, retained its game label, and showed a visible 3px orange focus ring.
- Fresh OS Reduced Motion produced zero camera roll, shift, bob, speed lines, and peripheral rush while preserving sprint gameplay. Saved explicit choices won over the OS default in both directions.
- Spatial mower validation retained vegetation occlusion at 1180 Hz / 0.62 transmission and rotated stereo pan from +0.26 forward to -0.26 rear and back to +0.26 without changing gameplay state.
- The final official browser regression remained in `first_hole`, exposed the new next waypoint, averaged 2.21ms / 1.8ms last canvas render work, and produced no browser error artifact.

Physical-device frame pacing and headphone comfort are necessarily human hardware checks rather than code paths an automated browser can certify. Keyboard, controller, touch, reduced-motion, and audio-routing implementations are covered above with no known defect remaining.
