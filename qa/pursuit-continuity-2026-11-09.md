# Pursuit continuity and route following — 2026-11-09

## Changes

- Relay protection now tracks its own 2.5-second window. Joe follows rather than freezing, targeting approximately16m separation, capped18m/s with an11m displacement guard if the player brakes. Damage remains disabled. Pending lineup is cancelled and the old armed ram cleared; Joe must warn again after protection. Initial spawn and five-second on-foot ejection protection retain their prior behavior.
- Added bounded waypoint look-ahead: at most six clearance probes when planning, within6–15m based on speed. Only directly clear waypoints replace intervening grid steps; course walls and narrow gates remain respected. Corner speed uses the next segment and distance available for braking. On-foot routing stays unchanged.
- Catch-up ramps between32–56m, adding up to18% desired speed with a28m/s maximum. It fades before close attacks, requires visibility or a last visual position less than1.5s old, and is disabled during protection, pressure openings/gather, diversions, scripted attacks, on-foot pursuit and the finale. Hidden player position never supplies the boost distance.
- Visible interception attempts release when their exit is passed or no longer reachable in time. Hidden predictions remain fixed. Relay breathers now overlap their protection rather than adding a longer second respite. Protection consumes stale missed attacks; a new recovery cannot restart an existing opening or immediately stack another relief window.
- Existing obstacles/shortcuts retained: route testing demonstrates meaningful relief from the sheltered branch and functioning alarms. Adding clutter was unnecessary for the pursuit issue. Artwork, rendering/audio resources, cart damage, controls, physical backoff and ejection/death animations unchanged.

## Outcomes

Same main route: three hits before this pass → seven, now at8.35/13.53/18.40/28.00/43.08/51.25/56.47s. Repeat exposed attacks commonly4.9–5.3s apart; relays and occlusion still give longer relief. These are physical contacts, not scheduled unavoidable hits.

All six driving routes win. Main/checkpoint starts receive7/5/2 hits; branches1/9/7. The sheltered branch remains an effective evasion choice. All three on-foot routes still win at123.38/80.70/37.90s.

## Checks

- New `verify-pursuit-continuity.mjs`: checkpoint shadow movement39.04m while staying at least15.80m away; braking gap guard; initial protection; catch-up cutoff and hidden-position independence; obstacle/gate-safe look-ahead; braking; visible failed interception release; immutable hidden predictions; no stacked stale relief.
- New hardware/software `verify-pursuit-continuity-browser.cjs`: real relay activation, repair50→70 health, Joe moving during protection, no hit/armed attack, pause freeze and player braking. Both retain17/22 programs,34 textures,nine voices; no browser errors.
- Passed full driving, foot health/win, five ram escape cases, swept vehicle contact, windup, tension, pressure rhythm, decisions/shortcuts, hunt, decoy and run-over simulations. Updated max-displacement assertions to28m/s. Pressure test now verifies a second recovery does not restart an opening, with separate fresh fixtures for alternative clues.
- Installed standard gameplay client completed two bursts; no error artifacts. Inspected2560×1600 shadowing,844×390 layout and1280×720 standard gameplay. No graphics assets or shaders added. No general frame-rate improvement claim.

Evidence/baselines: `output/pursuit-continuity/`. Deferred human checks: sustained pressure across both relays, clarity of renewed warning, fairness of the distant catch-up, and whether the sheltered route's relief feels earned.
