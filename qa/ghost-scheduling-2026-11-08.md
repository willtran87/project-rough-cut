# Reliable ghost scheduling

Ghosts now distinguish real danger/protected interactions from background suspense. A due sighting accumulates safe waiting time; background accent cooldowns, distant searches, stale encounter state and scripted suspense flags can defer it for up to eight safe seconds. A brief hard interruption preserves already-earned queue credit. Returning from protection adds one .75-second gap instead of continuously resetting a four-second delay. Warning duration is 1.2 seconds followed by the existing .8-second reveal. Normal 14–20-second recovery gaps after a full sighting remain, and site selection still requires visible clear ground.

Actual chases, very close Joe, elevated detection, nearby visible Joe, nearby search/investigation/contact, earned recovery, the opening grace period, briefing/map/aim/flight/quiet-log/status/filing and calibration remain protected. The Ghost sightings preference still disables the model and resets pending queue credit. No promise of a ghost during unsafe play or where geometry provides no valid anchor.

Once a sighting starts, a background cooldown cannot cancel its warning or rush. New cosmetic horror flashes/manifestations, rear sightings, environmental echoes and objective aftermath wait for the ghost's reserved beat. The ambient director consumes its usual beat/cooldown rather than rapidly rerolling while a ghost is present. Real Joe's chase, perception, scripted approaches, collisions and smarter pathfinding are unchanged; only the ghost's read-only presentation policy observes their state.

## Verification

- `verify-ghost-scheduling.mjs`: eight-second bounded background deferral at 12/24/60 Hz, preserved credit across hard interruptions, recurring spaced sightings under 100 seconds of constant background pressure, pause/duplicate/reset/disable behavior, bounded site probes and nonmutating policy.
- `verify-ghost-scheduling-browser.cjs` and `--software`: a permanently nonzero accent cooldown plus distant search/encounter flag produces a visible ghost at 9.5 seconds in both renderers. New cosmetic manifestations cannot interrupt its reserved beat. Map, aiming, filing, chase, relief and close-Joe fixtures hide it immediately; safe return succeeds. Pause freezes scheduling; Reduced Motion/density zero preserve stationary visibility; apparitions off hides it. These are controlled-state fixtures, not a claim of unassisted player completion.
- Both renderer runs retain 60 shader programs and 91 textures throughout the test. Player, Joe and detection remain unchanged during render-only scheduling. No new assets, lights, draw passes, particle pools, texture uploads or per-frame geometry creation. Existing software FPS/startup limitations are not declared solved.
- `verify-more-ghosts.cjs --reactive --extended`: all 14 authored sites show ghosts; rush, backward withdrawal, watcher/stalker/rusher behavior and one-mesh / 5648-triangle limits pass. Capture timing updated for the shorter protected return and warning so the test observes the rush rather than starting after it.
- Existing motion, behavior and screen-feedback logic suites pass. Release passes 90 scenarios, 56 runtime images / 20.8 MB, no warnings. Syntax/whitespace checks pass.
- Final normal presented-client startup/movement check passes two iterations, ready first-hole state and 14 units of movement without error artifacts. Full-page screenshot inspected. Close-Joe suppression also rejects an already-active legacy manifestation, verified after the final guard adjustment.
- Inspected actual screenshots at 2560x1600, 1280x720 and 844x390; pixel rendering and existing ghost visuals remain intact.

Evidence: `output/ghost-scheduling-20261108`. Revision: `20261108-ghost-scheduling`.

## Deferred human observation

Play a normal run, including optional supplies, aiming and pauses at cover. Record time between visible ghosts, whether other effects interrupt them, and whether the shorter warning remains readable. Check that real chases and post-chase recovery remain clear. Do not infer guaranteed sightings from the controlled clear-ground fixtures; human pacing observations remain prepared, not conducted.
