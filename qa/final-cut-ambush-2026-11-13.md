# Final Cut — concealed cardinal attacks

November 13, 2026. Implements the request for faster off-course movement, concealed setup, grass-rustle tells, four approach directions and greater encounter pressure.

## Resulting encounter

- The protected first demonstration keeps its existing timing. Subsequent attacks reposition at up to **12 m/s**, accelerate into **10.2 m/s** charges, and use **1.9 seconds** of warning, shortened to **1.65 seconds** after the pump is prepared. Previously the normal service-road cruise was 4.6 m/s, cutting speed 7.2 m/s and announcement 4 seconds.
- East/west attacks retain the authored fairways. North/south attacks use the eastern corridor at x = 22.8 m, from y = 25 to 88. This corridor clears masonry, the irrigation feed/manifold and permanent fixtures. The fork basket now stands at x = 14.5, y = 56.2, outside both the mower envelope and the bank route.
- Six fixed reed stands screen the side service roads, the north/south staging positions and the far service connection. The public-road opening remains clear. Joe never teleports or disappears according to camera direction. The reeds physically occlude the rendered rig and bend around an emerging charge.
- A localized moving patch and a spatial rustling sound identify the imminent entry. Setup lamps are dimmed; headlights brighten during the final 0.35 seconds. Essential text remains with sound muted or dialogue subtitles disabled. Reduced motion replaces rapid flutter with a steady bend.
- Reeds block Joe's sight too. He may remember an actual sighting for eight seconds or running footsteps for nine seconds. A committed attack never follows subsequent hidden player movement. Deliberate ball/bell lures override ordinary selection; advertised replay opening strips remain horizontal.
- Saturated swale turf reduces player movement to 78%. Running on exposed ground leaves audible evidence. Vertical reels now remove actual rough cover along their swept footprint, and those cuts survive reloads.
- Stone shelters, checkpoints, ball recovery, the physical flooded-swale trap and road escape remain functional. Guide text explains the rustle, cardinal orientation, running noise and wet footing.

## Verification

`tools/verify-final-cut-ambush.mjs` passes **32 cases**: four directions × four frame rates × standing/evading. Standing in the charge is caught; a walking sideways reaction after a 0.55-second delay escapes. Checks cover bounded displacement, actual rig/masonry/fixture clearance, irrigation clearance, warning before commitment, peak speed, pause, immutable targets, vertical mowing/save restoration, reed sight occlusion, running noise and wet movement.

`tools/verify-final-cut-ambush-browser.cjs` passes on hardware and software renderers. It checks all four actual rendered entries, dim/bright headlights, directional audio state, planted Joe hand/foot contacts, real keyboard evasion through the complete pass, pause, muted/reduced warnings and layouts at **2560×1600, 1280×720, 844×390 and 390×844**. Screenshots across those sizes were inspected. Diagnostic views use already-cut ground so foreground rough cannot falsely account for concealment.

Paired images with the rig visible versus temporarily removed by the diagnostic harness measure concealment at the warning viewpoints. Separate time samples measure changed grass pixels in the world image. These are viewpoint-specific rendering checks, not a claim that every possible elevated or side view hides every part of the rig.

The existing main simulation suite passes seven complete routes. Mowing, rig contact, drama, ball rules, visual-lure routes and replay shelter/trap safety were exercised. The visual-lure fixture now observes the player before entering the reeds instead of expecting sight through them. The ball-route pilot waits at a safe dry position and throws during an audible nearby pass. An intermediate basket location obstructed the bank pilot; the final position clears that route.

Full browser command:

`node tools/verify-final-cut-arrival-browser.cjs --crossings --out=output/final-cut/ambush/crossings`

This verifies uninterrupted direct, garage and drain routes through the rail, middle-cover retreat, crossings, pump, trap and road. The drain route additionally uses a ball redirection. Full-route movement uses ordinary Gamepad API input; diagnostic fixture placement is confined to the separate presentation checks. Reports retain captures, browser errors, timing and 65 screenshots.

Final run exited 0: direct **123.23 s**, garage **125.62 s**, drain **160.07 s**; all had **zero captures and browser errors**. Hardware and software concealment comparisons found zero visible-rig pixels in all four warning views; the world-image time comparisons changed 31,383–117,520 pixels. The installed game client exited 0, with its latest gameplay screenshot/state inspected and no error artifacts. All owned test processes finished.

Evidence directory: `output/final-cut/ambush/`. Main files: `rules.json`, `hardware/report.json`, `software/report.json`, each renderer's `occlusion.json`, `crossings/browser.json`, regression logs and `client-final/`.

## Scope and limits

Update: the later [rolling-turn and boss-art pass](final-cut-rolling-boss-2026-11-13.md) replaces the stop/pivot simplification below, moves vertical endpoints to y=31–85 and refreshes the rendered rig/concealment checks. This document records the earlier ambush tuning baseline.

North/south attacks use one physically clear eastern corridor, not arbitrary paths through shelters. Fast service navigation currently stops and yaws at its checked corners; it does not retain the older rolling curve at every ambush corner. Contact remains authoritative, but that maneuver is a simplification to revisit for driving realism. No sustained FPS, human listening, fear or difficulty-rating claim is made. This is a playable, automatically verified tuning pass; the full 72-item backlog remains incomplete. No commit or deployment was made.
