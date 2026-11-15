# Faster, more aggressive Level 1 Joe

## Changes

- Confirm exposed contact after .48 seconds instead of .65, with the existing detection threshold and sight/hearing checks. Chase reaction delay .24 → .18 seconds; investigation reaction .45 → .32.
- Requested chase speed 29–36 → 34–43 course metric units/second. Alert builds faster. Investigation speed 23 → 26; pursuit of the last known position 24 → 30; search travel 16 → 19. Existing difficulty, course pressure, overtime, wet turf and sand multipliers remain.
- Last-contact pursuit persists for 1.6 seconds instead of 1.25 before switching to a bounded evidence search. Search budget 6 → 7.5 seconds, still ending early if all search points are exhausted. It never reads a hidden player's new location.
- Visible velocity prediction looks up to .65 seconds ahead instead of .5, retains its eight-unit maximum and requires clear space. Hidden or blocked prediction falls back to observed evidence.
- A moving goal in the same corridor updates the existing route's final segment immediately if clear. Other obstacle waypoints stay intact. Obstructed new goals cannot overwrite the safe route. When a new route is necessary, chase replanning uses a four-unit target displacement and .28-second cooldown instead of seven units/.42 seconds; ordinary movement retains its existing cadence.
- Swept collision, acceleration/braking/turn limits, close-attack telegraph, committed attack target, dodge/recovery window and appeal interruption remain intact. No model, geometry, audio or other chapter changes.

## Results

Paired actual-game tests load the saved pre-change source and current source in separate browser pages. In an exposed moving-target fixture, peak speed increased **36.1169 → 43.1504** (19.5%); first-second travel increased **25.9154 → 28.5951** (10.3%, including acceleration). Visible-contact confirmation improved **.65 → .4833 seconds** at 60 Hz. The clear final-leg update eliminated a three-unit stale endpoint while retaining obstacle waypoints.

- `verify-course-pursuit.cjs`: paired results above and **222** valid obstacle approaches at requested speed 43, across 30/60/120 Hz. All reach within .5 units, no swept collisions at the tested 1.9-unit clearance; slowest 5.333 seconds. These are systematic eligible approaches, not exhaustive arbitrary starting poses or full-run balance acceptance.
- `verify-course-pursuit.mjs`: blocked-goal rejection, waypoint retention, target snapshots, bounded prediction, hidden-contact behavior.
- `verify-course-mower-motion.cjs`: before and after passes, 74 approaches each, terrain response, acceleration/braking/reversal, Pause and attached grip. Aggregate steps at unchanged requested speed 28: 12,744 → 12,621. No claim of a general pathfinding performance gain.
- `verify-course-close-push.cjs`: actual lateral dodge, stationary capture, warning/push/recovery, blocked attack, appeal, hidden target invariance, four-size presentation and actual skeleton/grip/audio parameter checks pass.
- `verify-search-memory.cjs`: actual ball diversion, fresh evidence, hidden relocation invariance, sight/sound loss, Pause, eventual return to patrol and reacquisition pass. Its old 80-frame wait was explicitly updated to 100 frames for the new 1.6-second pursuit handoff.
- Pure search-memory and mower-motion tests and JavaScript syntax checks pass. Browser suites report no errors.
- Inspected chase views at 2560x1600, 1280x720 and 390x844. Standard installed client also exercises ordinary startup and movement in `output/joe-pursuit-2026-11-13/standard-client`.

The first paired fixture put the player outside actual sight range, correctly producing no pursuit. Replaced it with an unobstructed, in-range moving target; detection was not bypassed to obtain the result.

Evidence: `output/joe-pursuit-2026-11-13/`, including baseline source, paired report, fast-path results and regression reports. Full-route human difficulty/fun assessment and the existing level-wide frame-budget issue remain outside this completed pursuit tuning pass.
