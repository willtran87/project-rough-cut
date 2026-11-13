# Final Cut — rolling machinery and service-road clearance

November 12, 2026. Responds to the user's feedback: **“Joe or the machinery feels unconvincing.”** The full 72-item implementation goal remains active. This pass improves normal vehicle maneuvers; it does not certify Joe's dramatic performance or the finished encounter.

## What changed

- Normal completed passes now lead into rolling curves instead of rotating the entire mower in place. Quintic corners join straight road sections with zero curvature at their ends. The authored corner radius parameter is 11.5 m, with the outer road centre at x ±41.5 m.
- An analytic speed profile accelerates and brakes at up to 2.4 m/s², with 4.6 m/s forward and 2 m/s reverse limits. Nearby/repeated strips use a forward–reverse–forward maneuver with a 0.45 s gear pause. Continuous pieces consume remaining movement within the same simulation step, avoiding a visible stop at a curve/straight join.
- All four wheel angles follow their individual turn radii. Rear wheels steer opposite the front wheels. Rendering, player contact and swept contact share those angles.
- Added paved service aprons and a rear road. Moved the stand from x29 to x47, including its roof, rails, signs and columns; moved boundary trees outward and widened the surrounding ground. Ended side fence rails at the actual rear boundary, shifted the scoreboard one metre forward and moved the equipment-bay floodlight out of the maneuver corridor.
- Irrigation jets now derive their destinations from the relocated seats. A longer jet exposed a narrow chair-back collision missed by the old fixed 256 samples; contact search now samples at less than 1 cm horizontal spacing before refinement.
- The fork-ball pilot now waits for a nearby audible pass before throwing. No game hearing radius, line-of-sight rule, lure priority or ball inventory was relaxed.

## Evidence

| Check | Result |
| --- | --- |
| `verify-final-cut-headland.mjs` | 192 maneuvers: both sides, four starting strips, four destinations, same/opposite side, 30/60/120 Hz. Correct end poses, no stationary yaw, reverse pauses, bounded motion, wheel-plane agreement, wall clearance and rejection without state mutation. Maximum acceleration 2.400000000001 m/s²; maximum normalized lateral wheel slip 0.000127. |
| `verify-final-cut-headland-browser.cjs`, hardware and software | 49,540 sampled poses over 64 routes against 28,662 actual static mesh triangles. Detailed triangle separation for the folded rig; conservative tire bounds allow rolling/steering. No detected intersections. This is dense sampled clearance, not a mathematical continuous collision certificate. Actual pause freezes the maneuver and resume advances it. |
| Four-size visual review | Corner/reverse captures inspected at 2560×1600, 1280×720, 844×390 and 390×844. Both renderers covered; machine, seating and service corridor remain visible. Joe's small seated silhouette still needs expressive work. |
| Grandstand, both renderers | 5,890 actual surface probes and 243 pressure trajectories per renderer. No premature mesh intersections or missed landing surfaces; all 145 chairs and 30 steps retained. Relocated stand and rupture images inspected. |
| Core rules | Main 13 groups/seven complete routes; crossing warnings and 14 route-phase comparisons/five finales; visual lure four groups/nine finales; ground and irrigation rules all pass after the final radius change. |
| Uninterrupted browser crossings | Direct, garage and drain starts finish through ordinary injected Gamepad API input, without live-state placement. 172.72/178.11/227.56 seconds, zero captures/errors. Drain route earns one actual ball selection; all three earn the bell trap and road escape. These pilots deliberately wait for warning demonstrations and are not first-time pacing measurements. |
| Existing physical/actor regressions | Rig contact and folding rules pass; actual rendered contact envelopes pass eight poses. Acting test passes all five phases, eight poses, dismount, pause and restore. Ground browser audit passes 1,586 actual skeleton/boot-skin poses, contact, pause, restore and reduced motion. |
| Installed develop-web-game client | Two ordinary input bursts, terminal success. Latest screenshot/state inspected at 6.52 s: waiting/arrival, lighting wash 0, 42 trees, no error files. |

The old acting harness sampled every 0.1 s for 24 s. Rolling turns take longer and arrive already aligned, making `align` one fixed step. The harness now samples at 120 Hz, renders phase changes immediately, and follows through the second pass with a bounded timeout. All prior phase/contact assertions remain.

Artifacts: `output/final-cut/headland/`, plus current rig-contact, grandstand, acting and ground reports. Browser rendering timing was not profiled in isolation; no new sustained-FPS claim is made.

## Remaining scope

- Off-road/masonry recovery still uses the old guarded pivot maneuver. Normal authored headland routes use the new rolling motion.
- The cutting pass still starts/stops at its existing constant speed; the new acceleration profile applies to service-road maneuvers.
- Tire rotation still shares the existing distance phase. Individual inner/outer rolling distance, suspension response, tire detail and drivetrain animation remain opportunities.
- Joe's anticipation, rearward checking while reversing, expression, timing and human impression of intent still need work. This pass preserves his existing hand/foot contact; it does not claim new acting.
- Human fun/fear, first-time route and reveal comprehension, listening, physical devices, full campaign pacing and sustained rendering performance remain open in the implementation ledger.
