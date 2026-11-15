# Suspense pacing — 2026-11-07

Build: `20261107-tension-director`. Reload the local game to load this revision.

The director now distinguishes quiet, unease, warning, approach, confrontation and recovery. Patrol changes give 3.8 seconds of warning, then use Joe's existing collision-aware movement toward an authored patrol destination. The directional mower caption takes priority over the environmental omen. No teleporting or hidden-player tracking was introduced.

Warnings, cover audits, rear sightings, flashes and manifestations share a cooldown. Scheduled flashes and manifestations have at least nine seconds between accents; they cannot both fire on the same frame. Ambient omen intervals vary deterministically. Aim, map, filing, status and exit commitments suppress new cosmetic scares and cancel pending director patrol changes. Actual perception, pursuit and player-generated evidence remain active.

After pursuit, three continuously settled seconds (patrol, detection at most 0.12, Joe at least 90 authored distance units away) earn 9–14 seconds of recovery. Longer encounters earn longer recovery. Natural insects return, spooky location/ghost accents and random hush pause, and score gain falls. A real new chase overrides this pacing. Staged engine silence ends at detection above 0.2 or distance below 78 authored units, with an immediate audio guard as well as the simulation transition.

The implementation adds small scalar state and timer checks. It reuses existing art, effects and audio voices; no geometry, textures, render passes, path searches or startup assets were added.

## Verification

- Focused browser checks: warning/approach sequence; no teleport; protected commitments; cover-audit spacing; continuously earned recovery and real-contact override; shared scare budget; nearby mower restoration; warning/recovery audio; paused timers.
- Gameplay regression suite: nine groups including 29 obstacle approaches, bounded evidence-led interception, completed searches, ordinary patrol movement, fresh-contact override, movement/aim UI and original/distant Joe models.
- Audio regression suite: generated signals, panning, pause/mute/focus, cleanup, at most six transient voices and no clipping in the sampled cues.
- Atmosphere regression suite: all 17 groups passed, including visible pond mist, moving/depth-occluded ghost Joes, floodlight haze, prepared effect shaders, comfort controls and four viewport sizes (2560×1600, 1280×720, 800×600, 844×390).
- Visual inspection at 2560×1600 and 1280×720. Existing pixel art, world geometry and mist retained.
- Release validation: 90 action fixtures, 56 runtime image references, no failures.

Artifacts: `output/tension-director-20261107/`.

- Normal installed gameplay client: three iterations, 28 units travelled, first-hole gameplay reached, screenshots inspected, no error artifacts.
- Paired fresh-browser software startup: completed first scene 11.711s before / 9.286s after; maximum loading frame gap 183.3ms / 183.2ms. Both had 65 GPU preparation batches, 249 compile representatives and 1,134 static buffers. World-object data and Joe triangle counts matched. Movement advanced 48.80 / 48.40 units in 2.066 / 2.022 real seconds. No browser errors. This single variable sample shows no observed startup regression; the lower time is not evidence that suspense logic optimizes loading. Sustained software foliage/pond frame rate remains an existing limitation.

## Human test for later

1. Play a fresh run with sound. Before each patrol change, can you identify the mower's direction and choose cover before Joe arrives?
2. Escape a chase. Does the quieter interval feel earned, and is there enough time to make one deliberate decision?
3. Aim or file near danger. Are the useful sounds clear without making Joe harmless?
4. Play a second run. Do the quieter stretches build anticipation, or are they too long? Note the location and approximate time.
5. Rate suspense, fairness and cue clarity separately from 1–5. Note whether you were startled, uncertain, or frustrated at each memorable event.

Automated checks establish behavior and regressions, not whether the pacing feels scarier. Human feedback remains deferred as requested.
