# Final Cut — Joe anticipates turns and checks behind

November 12, 2026. Continues the full 72-item implementation goal, prioritizing the user's report that Joe or the machinery feels unconvincing. Previous goal turn made verified progress on rolling headland maneuvers. This pass adds driving performance to those maneuvers.

## Runtime changes

- Joe looks ahead along his already committed service-road curve. The gaze eases in over 0.55 seconds and leads steering instead of merely copying the current wheel angle. It never reads the player's hidden position.
- Before a reverse gear change, he starts a shoulder check during the final 1.1 seconds of braking. The pose holds throughout actual backward motion and returns forward during the following gear pause.
- The head and torso share the rotation. He checks the course-facing rear quarter, making the action visible from the playable side of the fence. A legal x24 course-side camera was inspected in addition to close diagnostic views.
- The existing inspection of the freshly cut strip now includes a torso turn, not just a head swivel.
- Both palms retain the control's orientation while the chest rotates. Hand and foot positions remain solved against the existing wheel, lever and floor supports. The single actor, control geometry, movement, perception and collision rules are unchanged.
- Diagnostics expose the current cab-performance values; no history-dependent animation state or additional saved state is required.

## Verification

`tools/verify-final-cut-driving-look.cjs` follows six complete maneuvers at 120 Hz: both sides, repeated/nearby strips requiring reverse, and a forward-only lane change. The check verifies gaze anticipation, no backward movement before the rearward check, bounded pose changes and the return forward. Maximum sampled head/torso angular speed is 3.146 rad/s.

The hardware audit renders **224 actual skeletal poses**, including dense shoulder-check transitions and 46 cut-inspection poses. It checks 14,244 weighted skin vertices, actual triangle intersections with the seat components, planted palm orientation, hand/foot reach and actor culling bounds. Results:

- Maximum hand-position error: 0.000000120 m; foot error: 0.000000071 m.
- Maximum palm orientation difference from the same controls without the torso twist: 0.0000005 rad.
- No detected seat intersections. Maximum skin radius 1.818 m, within the existing 2.5 m culling sphere.
- During actual reverse travel, the measured head orientation points into the rear hemisphere: forward dot approximately −0.209.

The software pass repeats **24 key/extreme poses**, all six motion sequences and the rendered views. Dense identical skeletal geometry is audited on hardware; software evidence is not described as a second 224-pose audit. Both passes exercise actual pause and reduced-motion settings, with unchanged contact and pose. Errors arrays are empty.

An initial orientation assertion compared non-unit quaternions returned by matrix decomposition and reported roughly 0.1° even for unchanged hands. The verifier now normalizes orientations before angular comparison; the 0.00001 rad acceptance limit remains. The corrected complete passes succeeded on both renderers.

Close views, intermediate look states and the course-side view were inspected. Coverage includes **2560×1600, 1280×720, 844×390 and 390×844**. Joe remains a small figure at service-road distance; the close views alone are not evidence of first-time dramatic recognition.

The existing acting regression also passes eight poses, all five operating phases including the new `check-reverse` action, dismount continuity, pause and restored bogging. The installed develop-web-game client completed two input bursts; its latest screenshot/state were inspected at 6.52 seconds, with Joe boarding, no cab pose applied prematurely, lighting wash 0 and no error artifacts.

Artifacts: `output/final-cut/driving-look/`. Final hardware/software reports, sample data, eight views per renderer, acting log and installed-client output are retained. No new full-playthrough or sustained-frame-rate claim is made for this rendering-only pass; prior headland playthrough evidence remains documented separately.

## Still incomplete

Facial expression, fingers, more expressive loss-of-composure timing, suspension and drivetrain detail remain. Off-road recovery still pivots and cutting passes still use their prior speed behavior. Human recognition, fun/fear, listening, devices, full campaign pacing and sustained performance remain open. FC58 and the full goal are not complete.
