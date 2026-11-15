# Cart health, aggressive pursuit and on-foot escape — 2026-11-09

## Implemented behavior

- Cart starts at 100 health. Eligible mower impacts use 8 + 24 * impact strength, rounded; current physical feedback clamps strength to 0.32–1, so ordinary damage is 16–32. Three light contacts no longer end a run; even maximum rams need four hits against an unrepaired cart. Existing 2.8 s damage protection, swept hull collisions, physical backoff and warned ram windup remain.
- Accessible native progress bar and numeric health, amber low-health treatment, impact feedback and updated briefing. Relay activation restores 20 health; one-use optional crew-log service restores 25, capped at 100. Hit count remains diagnostic only.
- Zero health immobilizes the actual cart. A bounded local search places the player outside the wreck, walls and mower. The runner receives a five-second protection window; Joe physically backs off. A failed safe-exit search retries after backoff instead of ejecting through scenery.
- On-foot state is separate from the cart. WASD/arrows run relative to the normal camera heading; A/D strafe, S retreats, diagonals are normalized. E or Space stops/holds interactions. Q looks back; pause/fullscreen remain. Touch labels switch to Run/Back/Use; gamepad left stick moves and B uses. The wreck cannot be repaired or re-entered during that attempt. A caught retry restores a healthy cart at the saved checkpoint.
- On-foot player can activate relays, collect crew logs, trigger alarm treadles, force shortcut gates from either direction, and win by holding E/Space fully inside the powered garage. Repairs never resurrect a wreck. Contact with the mower after protection expires catches the runner.
- Joe's cart pursuit bases rise from 14.6/16.2/12.8/7.2 to 15.8/17/13.8/7.8 m/s on path/rough/wet/sand. Steering limit 0.9 -> 1.02 rad/s, acceleration response 2 -> 2.5, regular route interval 0.65 -> 0.5 s, prediction up to 1.15 s, last-seen search 8 -> 10 s. Speed remains capped at 18.3 m/s. Alarms, hidden-player evidence, warned commitments, pressure openings, checkpoint grace and garage protection retain priority.
- On foot, ordinary mower pursuit is capped at 7.4 m/s, pressure at 8.6, openings at 4.5. Car-sized lane-pass scripts are suppressed; warned rams, tension and pressure waves continue. A temporary wreck exclusion overlays the existing baked A* graph without invalidating static edges. Tight waypoint acceptance, slower near-wreck turns and straight reversing prevent pinning on the wreck. Collision with the wreck does not force a new global route every frame.
- Runner uses existing palette/materials, batched rigid body parts, running/idle blending and existing audio voices for footsteps. The seated driver disappears from the tilted, abandoned cart. The camera moves close enough at dismount to avoid the cart roof hiding the player. No new textures, skeleton shaders, lights or audio nodes.

## Verification

- `verify-cart-health.mjs`: variable damage, three survivable glances, capped repairs, actual fatal ram, safe exit, escape protection, frozen wreck, movement/strafe/diagonal behavior, wall/wreck collision, pause, physical mower detour and stationary catch with bounded plan count, health-based service stops, gates from both directions.
- Three complete on-foot runs with live Joe: from start / checkpoint 1 / checkpoint 2 in 123.38 / 80.70 / 37.90 seconds. Both mandatory relays and garage sealing succeed. Nearest mower gaps 8.90 / 9.05 / 25.54 m. No teleport; maximum mower step under the existing 18.3 m/s cap.
- `verify-back-nine.mjs`: all six existing driving routes still win with live Joe; no contacts on these routes. Existing navigation, hidden-player evidence, boundary and pause checks pass.
- `verify-vehicle-contact.mjs`: rear, head-on, side/reverse, rotating/swept contacts, grace, backoff escape, pinned wall cases, overlap recovery and the new health -> on-foot -> caught lifecycle pass. Legacy three-hit assertions updated to the requested lifecycle.
- `verify-chase-rhythm.mjs`, `verify-ram-windup.mjs`, and software pressure-wave browser checks pass. `verify-back-nine-decoys.mjs` confirms all alarms and actual escape benefit. Story unit/browser tests now verify 25-health service repair, single-use behavior, logs and checkpoint persistence.
- `verify-cart-health-browser.cjs` passes on SwiftShader and RTX 3090 hardware: rendered low/zero health, actual ram transition, hidden seated driver / visible runner, real keyboard movement, pause, rear view, touch input, gamepad axes, E-held crew log and garage completion, and repaired-cart checkpoint retry. No browser errors.
- Dedicated coarse-pointer/mobile context at 844x390 verifies the visible Run/Use controls with actual browser touch events, running and hold-to-use collection. Screenshot inspected.
- Existing hardware browser suite passes driving controls, checkpoint reloads, garage finish, replay, touch and gamepad. Installed develop-web-game client run and inspected after implementation.
- Reviewed 2560x1600, 1280x720 and 844x390 captures of health, dismount and running. Fixed the initially obstructed dismount camera before final captures.

## Graphics / performance evidence

- All 17 static driving comparisons and all six moving captures are pixel-exact against the task-start scene. Both comparison scenes use the new simulation to isolate rendering; this is not a claim that pursuit behavior is unchanged.
- 180-frame fixed-960x540 SwiftShader rendering replay: before median/p95/max 47.7/63.4/72.9 ms; after 47.2/62.8/69.0 ms, identical 92.85 average draws. One sample only; do not claim a broad performance improvement or solved software-frame spikes.
- Software 22 / hardware 17 programs, 34 textures, two lights, nine audio voices retained. No new view-time GPU buffer allocations when first switching to foot or entering wet/garage views.
- Runner buffers prepare during loading: software 16 geometry batches (previously 15), hardware 15, maximum batch still 2,060,232 bytes. Texture queue remains 23 bounded batches. A small extra software preparation batch is the cost of avoiding a dismount allocation hitch; no cold-start speed improvement claimed this turn.
- Navigation remains baked signature 47348588 / 4410 nodes / zero static edge checks. Full on-foot run uses 328 route plans over 123 s including obstacle recovery; no per-frame wreck-triggered global replan loop.

Evidence and task-start snapshots: `output/chase-on-foot/`. Existing regression scripts retain their established output folders.

## Human playtest for later

1. Compare a glancing collision with a full ram; confirm damage and the low-health warning are understandable while steering.
2. Let the cart break with Joe close. Confirm the camera, runner and five-second escape opportunity are clear without pausing to read.
3. Escape via a narrow timber gap, an alarm and a relay. Verify that running is frightening but gives enough room to make decisions.
4. Finish the garage on foot with keyboard, controller or touch. Check that hold-to-use prompts are clear and the shutter feels safe.
5. Assess whether Joe's faster pursuit and four-to-seven-hit cart durability feel fair over several fresh runs. Subjective tension/fun is not established by automated tests.
