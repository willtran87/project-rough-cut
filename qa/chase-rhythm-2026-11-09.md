# Pursuit rhythm and panic follow-through — 2026-11-09

## Implemented

- Added a simulation-time pressure director after the first panic reveal. Sustained pursuit has 9–11 second pressure periods, 3.4-second openings, then a 0.8-second engine buildup. An active warned attack finishes before a scheduled opening. A missed committed attack or escaped ram can earn the opening sooner. Later pressure waves do not increment/spam the original sight-reveal counter.
- Openings suppress new lane/intercept/ram windups and cap ordinary mower target speed at 8.5 m/s. Existing deceleration remains gradual; cart acceleration, steering, brakes, camera and collision hulls are unchanged. Contact recovery, immunity, checkpoints, alarms and garage closing take priority. Original reveal cannot interrupt an earned opening; a genuine new reveal keeps its hush before another wave.
- Contextual opening cues select an unbroken forward timber cut, unused alarm, cover/path choice or powered garage approach. Cues use the existing caption rail and leave all route selection to the player. Updated the actual briefing source, not just fallback HTML.
- A parallel close pass can physically earn one second pacing alongside. The mower follows its recorded route and matches the cart's pace, lifts its decks and revs, then releases. Hidden turns do not retarget it. Collision/protection cancels the cue. No teleport or guaranteed hit.
- Stronger coordinated release through existing engine, lamp and deck presentation. Later waves reuse the impact-noise voice only when no impact, timber event, ram release or pass needs it. Moving cart rattles and a short synthesized strained-breath envelope react to actual passes/close approaches with an eight-second cooldown. No speech/audio assets or new voices.
- Three low breakable service rails added to the existing instanced timber pool. Break detection follows the real oriented mower deck/cart footprint. Pressured mowing in nearby rough throws small clippings through the existing spray pool. No new static colliders, navigation changes, physics debris or textures.
- A one-time final engine buildup near the powered garage, when the encounter state permits, highlights the bend and destination. Existing full-cart parking, shutter latch, quiet sound bed and muffled outside mower remain intact.

## Verification

New `verify-chase-rhythm.mjs` covers timed cycles, reveal/opening coordination, available route choices, unchanged player controls, reduced mower speed, protections, pause, fixed-target pacing, cancellation, event-driven distress and oriented timber contacts. A physical drive at (14,340) earned exactly 60 simulation frames alongside with no overlap/hit. The original physical close-pass case still passes without hits.

All six win routes pass with zero contacts. Full-start routes encounter two pressure waves; checkpoint routes can outrun Joe and do not artificially force an encounter. Original panic, tension, hunt/interception, decoys, three shortcuts and five ram escape tests pass. Six rendered collision cases and vehicle geometry containment pass. Actual keyboard/touch/gamepad, pause, save/reload, retry, second relay and garage finish browser checks pass.

Hardware and SwiftShader browser scenarios cover release, opening, alongside, splintering rails, final approach and Reduced Motion. Inspected 2560x1600, 1280x720 and 844x390. Installed develop-web-game client used for normal driving and final captures. No browser errors. Offline audio: one later-wave strike, impact priority, silent mute; normal peak 0.2074, quiet tail 0.0000576. Navigation bake still matches an independent rebuild; production edge checks zero, signature 47348588.

## Performance and limits

Still 17 shader programs, 34 textures, two local lights, nine voices, 32 spray slots and 15 paced preparation batches (largest 2,060,232 bytes). Timber pool grows 54 to 72 instances: 18 matrices / 1,152 bytes plus existing box instances, no additional timber draw. No new view-time GPU buffer allocations in tested views.

Sequential 960x540 SwiftShader ABBA scene comparison with active pressure and moving mower: wet old medians 54.8/43.9 vs new 56.1/45.1 ms; foliage 48.4/48.3 vs 49.5/48.2; mower 41.5/40.4 vs 40.2/39.0. New foliage p95 51.8/53.0 ms. Draw counts equal in these poses (62/95/74); pixel differences include new clippings. Shared current course/dependencies mean this isolates scene behavior, not a complete before/after build. Host/warmup variability remains substantial. No claim of stable 60 FPS or solved software/startup stalls.

Evidence: `output/chase-rhythm/`, including source baseline, simulation, routes, audio, hardware/software reports, performance and screenshots.

## Human playtest prepared for later

1. Drive from the start; note whether the first release clearly changes the rhythm without hiding the road.
2. Bait a lane commitment, escape, and choose a timber gap or the fast path during the opening. Confirm the cue names an available opportunity.
3. Hold a straight line when Joe draws level; assess whether the pacing beat is readable and frightening. Try steering away during it.
4. Check that rattles/breathing communicate threat without masking the mower's side or ram windup.
5. Try a slow gate push, a mistaken turn, a collision and a checkpoint retry. Confirm recovery remains fair.
6. Reach both relays and the garage; assess the final buildup, bend readability and relief when the shutter latches.

Human feel assessment is deferred as requested; automated checks establish behavior and safety of the controls, not how frightening it feels.
