# Joe pursuit response — November 12

User feedback: Joe still feels clunky and needs better pathing, seeking, and aggression.

Implemented direct steering toward freshly seen players across clear dry ground, and greedy smoothing of dry navigation segments. Wall/body clearance remains 0.8m for planned shortcuts. Water beds are explicitly excluded even while low, crossing endpoints retain their timing checks, and shut gates block shortcuts. Joe's existing walking speeds, windup, sweep, recovery, and physical weapon collision remain unchanged.

After losing contact, Joe scans for 0.55s and checks a continuation of the direction he actually saw the player moving. Nearby branch probes are clipped to reachable dry ground. Movement evidence expires after six seconds; stale or exhausted trails return to authored inspections, with 1.1s inspection scans. No unseen player position enters search-target selection. Retry does not persist live pursuit memory.

## Measured behavior

Matched initial states and ordinary simulation inputs, standard difficulty:

| Scenario | Previous first windup | Current first windup | Previous travel | Current travel |
| --- | ---: | ---: | ---: | ---: |
| Clear diagonal, either direction | 5.52s | 3.33s | 10.19m | 6.96m |
| Pump buttress approach | 7.37s | 5.70s | 14.17m | 11.23m |
| Moving service approach | 8.13s | 5.60s | 15.86m | 11.72m |

The clear diagonal now has zero turn-only or visible stationary approach time. Original source copies and before/after frame traces are retained under `output/under-green/pursuit-motion/`. The fixture historically named `lost-service-trail` does not lose sight; it is a moving-approach measurement, not search evidence.

## Verification

- `verify-under-green-pursuit-motion.mjs`: dry-corner clearance, both water orientations, preserved crossing markers, shut gate, stale-memory expiry, actual moving loss of sight, committed blade capture and delayed sidestep. Two different unseen stationary player positions produce identical navigation/attack behavior; diagnostics measuring player distance are excluded. Fresh remembered-trail continuation starts at 0.567s.
- `verify-under-green.mjs`: seven complete ordinary-input routes including all difficulty settings, all checkpoints, optional evidence; pause/save/gate/water/physical capture checks pass.
- `verify-under-green-folded.mjs`: eight complete route variations plus all crossing directions, pressure recovery, and service encounter counterplay pass. Previously tolerated water contacts remain maximum budgets; earlier safe arrival need not reproduce an old hit.
- `verify-under-green-approach-strike.mjs`: frozen original service approach still detects fresh incoming motion; continuing is captured. Stop and sidestep after 0.25/0.5/0.75s all survive the committed strike. Seven additional route variants complete.
- Browser: 58 actual simulation poses pass mesh intersection and floor checks. Real keyboard sidestep after 0.35s escapes; ignoring the same windup is captured; releasing movement stops immediately. No page errors. Captures at 2560×1600, 1280×720, 844×390, and 390×844. High-resolution windup and pump-corner views and portrait pump view inspected. The pump buttress legitimately occludes Joe before he rounds it.

## Test corrections and limits

The old QA dodge aimed at its route waypoint when Joe was near, which could direct the player into Joe after encounters shifted. The pilot now uses the visible attacker's position for its ordinary lateral dodge. This did not change game controls or attack timing. The old approach-strike test depended on one exact full-route meeting; that encounter is now frozen independently, while complete routes remain separately tested. An unrestricted initial search candidate followed stale/no movement evidence and caused long absences; it was rejected. Current local continuation requires recent witnessed movement.

These are deterministic checks and rendered-pose coverage. They do not establish human tension, every possible path, or final sustained device performance. The broader 44-item goal remains active; unfamiliar-player and device acceptance remain open.

Installed gameplay client also passed: ordinary forward movement crosses the lesson with zero water hits, Joe physically enters through his service door, and key release produces zero player speed. Latest screenshot/state inspected at 8.88s. Artifacts: output/under-green/pursuit-motion/client/.
