# Back Nine experience upgrade

User authorized the ten proposed experience ideas. Implemented in Level 2 only.

## Playable changes

- Joe can commit to a hidden cutoff using the last visible heading. Targets stay fixed when the player changes direction out of sight. The existing 1.5-second signal, navigation, recovery windows and encounter owner govern the maneuver.
- Nearby destroyed hedges produce a one-time escape-gap cue. The existing shared collision/model destruction makes these openings usable. A range-fence pursuit sends Joe down the east perimeter and through the actual `dry-range-east` fixture; full routes observed this destruction.
- Two labeled pressure-release controls require a stopped 0.9-second hold. Each forces its irrigation zone on for 14 seconds, increases visible spray and caps Joe to 7 m/s (4.8 m/s during foot pursuit) while he crosses that flooded turf. Natural irrigation resumes afterward. The third control releases the detailed range cart down the shoulder for an eight-second noise diversion. Sight/hearing can break the distraction. The cart stops at obstacles/player contact and can be crushed by Joe at its current position. Collision, camera and ejection queries use the moved fixture position; its paving stays put.
- Optional control pedestals block the player and can be knocked down by Joe. Their destruction removes that tool for the attempt. The mandatory shutter release remains available.
- A hidden, safe mid-course opportunity can cut Joe's engine for 3.6 seconds, with cooling-metal ticks and a thinned score. Joe decelerates and stops; a 1.25-second restart warning precedes resumed pursuit. This beat cannot replace an existing attack or earned recovery window.
- Ghosts retain their original muted Level 1 models and six roaming loops. Two can stop and watch; one seeded guide turns toward an authored narrow gap and fades. Other ghosts keep mowing. Loop offsets and guide selection vary with the attempt.
- A twelve-bird flock rises from Joe's actual hidden position. Real close passes produce one short grass-fragment/breath envelope and restrained camera motion. Existing mower tracks, red beacon and foliage response remain active. Particle pools are fixed, warmed and simulation-time driven.
- Failed retries now pick a fresh variation seed, changing irrigation offsets, ghost positions and encounter choices. Explicit same-seed simulation reset remains deterministic for QA. The level always restarts at the shed.
- With both relays powered, the player holds Use for 1.3 seconds to free the garage shutter, moves through once it physically clears their height, then completes the existing interior lock sequence. World signs, hold meters, objective text, optional instructions and stronger finale music explain the sequence. During a close rear approach, the cart camera pulls forward to keep Joe's roll cage out of the escape view.

## Validation

- `verify-back-nine-experience-upgrade.mjs`: 14 contracts covering hold/release, flooding/traction, moving-cart collision/destruction, optional pedestal destruction, remembered interception targets, silence/restart ownership, range route validity, bird source, near misses, destruction gaps, exit collision/clearance, end-of-level warning, pause and reset.
- `verify-back-nine.mjs`: 12 baseline routes plus 48 additional route trials across four nonzero seeds complete with live Joe and the new exit interaction. Driver now releases the interaction button and moves when the jam is freed. The extra seeded trials initially exposed the old attack-warning cutoff at y=780; extending the normal warning to y=799 fixes the unannounced final approach without reducing pursuit speed. Gate collision now stops blocking once the rising shutter provides 2.74 m clearance.
- `verify-cart-health.mjs`: all three on-foot route starts complete, alongside health/ejection/collision contracts.
- Existing terror, 23 course-fixture destruction and detail/terrain/particle checks pass. No Level 1 bell changes.
- `verify-back-nine-experience-audio.cjs`: offline engine RMS falls from 0.009535 to 0.0000097 in the quiet interval, returns to 0.008097 on restart, and falls below 0.000004 on pause. Fourteen persistent voices retained.
- `verify-back-nine-experience-browser.cjs`: real keyboard holds operate valves and the rolling cart; watcher stops, guide fades; actual release/drive/lock inputs reach victory; engine/music duck; reduced motion removes flock/debris/ghost movement; pause freezes state; both reset and failure retry restore the level, with a changed retry seed. High-resolution 2560x1600, ordinary 1280x720 and narrow 390x844 captures inspected. No console/page errors; 24 programs and 46 textures across states.
- Installed gameplay client exercised driving input and presentation captures. Final screenshots and console logs are under `standard-client-final`; both software captures retain 960x540 internal resolution. Hardware captures retain 1280x720 internal resolution. This scoped check does not imply a universal frame-rate guarantee.

Evidence: `output/back-nine-experience-upgrade/` (source baseline, simulation and audio JSON, route logs, browser captures). No commits, deployment or subagents. Existing port 4187 server preserved. Older broad project goal is outside this scoped completion.
