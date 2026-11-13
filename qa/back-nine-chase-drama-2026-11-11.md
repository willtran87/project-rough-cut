# Back Nine: driving, breakdown and on-foot chase

Implemented from the attached chase request. Local URL: http://127.0.0.1:4187/back-nine.html. Refresh an existing tab for the `20261111-chase-drama` module revisions.

## Changes

- **On-foot pursuit:** engagement range increased from 16 to 30 metres; windup remains 1.8 seconds. Joe tracks a bounded lead for the first 1.1 seconds, locks his heading for the final 0.7 seconds, then commits for 2.9 seconds. Physical acceleration is capped at 9 m/s² and charge speed at 14.8 m/s. A missed charge retains 1.6 seconds of recovery; next charge eligibility is at least 5.2 seconds after launch. Normal pursuit is capped at 9.6 m/s, or 10.7 during pressure. Existing obstacle sweeps, navigation, solid vehicle collisions and post-impact retreat remain active.
- **Wreck approach:** relaxed the overly narrow approach cone that made Joe orbit a stationary runner beside the cart. The mower still collides with the wreck; the runner can use it as temporary cover.
- **Player movement:** steering and automatic follow camera remain; mouse never controls the view. Running accelerates over a short interval, brakes/releases stop promptly, and the existing swept sliding and movement-facing animation remain. Rear glance preserves heading.
- **Ejection:** exact seated hip/knee/arm pose transitions through grip release, airborne bracing, landing and get-up. The chosen landing point is checked against scenery and both vehicles; its selection favors an open side and actual impact impulse. Actual pre-collision speed controls additional lift. A 0.86-second recovery holds the validated landing point; the animation finishes at 1.18 seconds. The existing five-second protection leaves over four seconds of usable escape time. The banner changes from getting up to the actual running controls when control returns.
- **Run-over:** preserves the player's starting heading, blends the fall toward the impact direction, adds articulated knees/elbows and strength-dependent flinch. Mower roll-through speed uses the actual incoming speed, bounded to 3.5–6 m/s. Camera moves into the death framing rather than snapping, checks scenery clearance, and respects reduced motion. Existing synchronized impact, landing, engine pass and 2.4-second defeat transition remain.
- **Atmosphere:** darker shared pixel-art sky and lighting, retained turf readability and beacon. Selected lamp batches and clubhouse windows have independent, slow electrical sags; intervening batches stay steady. Eight nearby tree projections at most form one moving-shadow draw. No shadow maps or new textures. Reduced motion stops sway/flicker; zero light pulses steadies flicker and beacon.
- **Music:** three persistent filtered synth voices create a minor ostinato and dissonant upper layers. Builds after the reveal with proximity, damage and running; softens during relief; ducks under windups and impacts. Pause preserves phrase position. Music volume is independently adjustable and saved; master sound toggle still applies. Total chase voices are now twelve, with no note-time allocations or audio downloads.
- **Vehicle feedback:** low-frequency suspension wobble and roll scale with speed, surface and wear. Existing steering roll, panel rattle, metal crunch, bounded shove and slowdown remain. Brief directional darkened screen edges accompany impacts, with no blur or tearing; effect strength respects light-pulse/reduced-motion settings.
- **Framing:** removed advance on-foot references from cutscene, briefing and initial comfort instructions. Actual breakdown reveals the controls; pause help then retains them. Removed ram-incoming and numeric health-damage banners; optional sound captions, health bar, interactions and objective/checkpoint updates remain.

## Verification

Passed:

- `verify-back-nine.mjs`: all 12 complete driving/branch/checkpoint scenarios, including live-Joe ejection finishes and an intact-cart checkpoint-2 finish.
- `verify-cart-health.mjs`: real fatal impact, safe exit, solid wreck, protection, stationary victim pursuit, repairs, breakable gates, and full on-foot completion from starts 0/1/2. The full on-foot course uses the narrow nursery lane to break contact; observed finish times approximately 128/83/39 seconds. Tests were updated from obsolete strafe controls to the current steering controls, including the deliberate landing recovery.
- `verify-back-nine-choices.mjs`: five cart gaps, three foot gaps, mower detours, all tight branches, smooth damage scaling, hidden-route prediction, and a real late 33-damage ram followed by the small service gap and garage completion at 17.2 seconds. Retry restores the cart. Its old foot driver was updated to steer and turn before advancing around sharp corners.
- `verify-chase-drama.mjs`: the dodged charge travels 35.5 metres over 2.92 simulated seconds at a maximum 14.8 m/s, remains heading-locked, and enters recovery. Safe ejection/control return, unspoiled briefing, quiet impact banners and steady comfort lighting checked.
- `verify-runner-controls.mjs`, `verify-heavy-impact.mjs`, `verify-chase-runover.mjs`: no mouse camera, rear glance, thin-fence sliding, collision limits, eight impact directions/strength combinations, obstacle-safe shoves, repeated rams/retreat, and rear/front/side defeats.
- Ejection browser suite on hardware and SwiftShader: rotated seat anchors, both ejection sides, landing/get-up/control return, pause, reduced motion, no new geometry uploads during the sequence. Lowest sampled mesh point was 0.0125 metres above ground.
- Run-over browser suite on hardware and SwiftShader: actual impact, fall, mower crossing, pause, stable grounded pose, defeat screen, retry and reduced motion. Ground pose spans approximately 0.002–0.554 metres. No new geometry uploads.
- `verify-chase-drama-browser.cjs`: initial guide hides twist, music plays, ram/damage banners absent, optional impact sound caption, on-foot pause help, saved music setting, reduced effects, no page errors. Visual inspection at 2560×1600, 1280×720, 844×390 and portrait 390×844.
- Score offline rendering: three persistent voices, zero opening score before reveal, audible chase, silent pause/mute/tail, preserved phrase on pause, no extra node allocations. Run-over audio retains one impact and one landing cue without allocation, replay on unmute, or pause leakage.
- Shared settings and quiet-message/240-selection defeat tests pass. Standard installed gameplay client exercised on-foot input bursts under software rendering; screenshots and reported state inspected.

One **pre-existing test limitation** remains: `verify-back-nine-escalation.mjs` expects the old unsolicited alongside attack at its first fixture. It fails with `intercept` vs `alongside` on both this build and the saved pre-change sources. The current hunt intentionally prioritizes establishing physical threat first. Baseline reproduction is saved in `output/back-nine-chase-drama/baseline-escalation.log`; this test was not weakened to conceal the mismatch.

## Performance evidence

Paired ABBA measurements at fixed **960×540**, SwiftShader, with animation enabled and both scenes using the same renderer. 48 GPU-completed samples per implementation per view; original sources saved before edits. CPU update p95 ≤0.8 ms. One extra shadow draw, no new runtime buffer allocations.

| View | Before median / p95 | After median / p95 |
|---|---:|---:|
| Wet lane and mower | 49.0 / 53.9 ms | 49.7 / 54.1 ms |
| Runner and foliage | 40.0 / 44.1 ms | 40.0 / 43.0 ms |
| Clubhouse | 37.0 / 41.9 ms | 36.9 / 41.1 ms |

Four separate fresh-browser software starts, alternating baseline/current/current/baseline: baseline 4164/4324 ms; current 4181/4273 ms. Means 4244 vs 4227 ms. Same 17 geometry-preparation batches, 23 texture batches, 36 runtime textures; one additional prepared shader (22→23 software, 17→18 hardware). These local samples show no material regression, not a universal load-time guarantee. Software rendering remains below 60 fps at this fixed test resolution; existing dynamic resolution remains active during normal play.

Evidence: `output/back-nine-chase-drama/` contains rules, score and startup JSON, paired performance, guide/ejection/run-over screenshots, standard-client captures, route logs, and `chase-score.wav` for listening later.

## Later human playtest

1. Try the exposed road on foot, then the nursery lane and narrow service gaps. Assess whether Joe's final aiming lock and missed-charge recovery are readable without banner warnings.
2. Lose the cart beside scenery and during a late ram. Check whether the brief recovery feels weighted without feeling unresponsive, and whether the five-second protection provides enough time to choose cover.
3. Judge darkness on a typical monitor, including pond edges, fence gaps and the garage; compare reduced motion and zero light pulses.
4. Listen with headphones and speakers. Judge musical intensity, repetition over a full run and whether engine direction/windup remains distinct. Adjust music volume if needed.
5. Compare intact-cart and on-foot finishes across several players. Automated route success verifies reachability, not human difficulty or subjective horror quality. Human playtesting remains deferred as requested.
