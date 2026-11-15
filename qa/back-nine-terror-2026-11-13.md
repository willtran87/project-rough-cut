# Back Nine destruction, pursuit and bell correction — November 13

The user's correction is authoritative: Level 1 keeps its Audit Bell; Level 2 has no bells. The blade, destruction, aggression, dramatic music and restart changes apply to Level 2: Back Nine.

## Delivered

- Restored Level 1's Audit Bell, three-check progression, interaction/reply, signs, receipts and related weather/exit behavior. Earlier Level 1 pursuit improvements remain. No Level 1 checkpoint change.
- Removed Back Nine's roadside bell gantries, treadles, shelter bell controls, interactions, musical bell branch and player-facing instructions. The relay objectives and limited repair chargers remain. Rebuilt navigation after removing the physical alarm posts.
- Center cutting deck rests at 0.68 m and lowers toward 0.25 m during active pursuit. It raises during recovery, freezes with pause, and switches pose directly with reduced motion.
- Joe alone breaks the 12 timber hurdles and six new maintenance objects: three timber crates and three groundskeeping trolleys. The player is physically stopped by intact props. Two portable rails were moved off the normal/alternative driving lines; closed shortcut gates still require going around or letting Joe break them. Debris uses 60 pieces across two instanced draws, settles above the ground, and resets on a new attempt.
- Joe drives toward a runner through the abandoned cart instead of routing around it. Swept contact applies a shove, metal impact audio and progressive crushing. The wreck stops against the runner/scenery, then becomes passable after full crushing. Only Joe causes the damage or motion.
- Increased pursuit speeds, acceleration, steering rate and route refresh frequency. Existing charge warnings and earned escape windows remain. In a controlled one-second paired test, cart pursuit advanced 26.40 -> 30.44 m (peak 31.12 -> 34.99 m/s); foot pursuit advanced 6.27 -> 7.27 m (peak 9.43 -> 10.55 m/s). These are fixture measurements, not universal averages.
- Death retries and reloads start at the shed with a fresh cart, both relays offline, replenished supplies and repaired scenery. Legacy checkpoint saves are ignored. Completed campaign escape records still restore completion. `createRun(checkpoint,...)` remains available for isolated developer fixtures; player-facing retry/load never uses it to resume a checkpoint.
- Expanded adaptive music from three to five persistent voices, adding low drum accents and bowed minor thirds. Warning ducking, earned relief, mute, music volume and pause remain supported.
- Fixed the portrait pause panel so Resume and Restart remain fully visible.

## Verification

All owned browser jobs completed and closed; the existing local server remains running. Evidence: `output/back-nine-terror-2026-11-13/`.

- `tools/verify-back-nine-terror.mjs`: eight checks cover every new prop with both player forms and Joe, swept strikes, near misses, player blocking/retreat, Joe opening timber, live wreck pursuit, repeated crushing, runner safety, reset/pause and settled debris bounds. Live Joe struck four times, displaced the wreck 3.91 m and fully crushed it.
- `tools/verify-back-nine-terror-navigation.mjs`: 68 baked/fallback routes match exactly; zero runtime edge-clearance work with baked navigation. Paired pre-pass/current pursuit measurements pass for cart and runner targets.
- `tools/verify-back-nine.mjs`: all 12 driving routes/stage fixtures reach completion with live Joe, capped movement and warned pursuit beats. The western tank route uses the optional charger. Fixtures beginning at a relay are isolated route tests, not available checkpoints.
- `tools/verify-cart-health.mjs`: all three on-foot route fixtures reach the garage; actual fatal ram/ejection, repair, collision, player inability to break timber and pause pass. Replaced the obsolete player-forced timber shortcut with the connected main path.
- `tools/verify-back-nine-choices.mjs`: all seven tight branches, physical gate clearance, damage progression, hidden-target behavior and actual late ram -> foot gap -> garage pass. Joe further crushed the wreck during the late escape.
- `tools/verify-back-nine-terror-browser.cjs`: legacy-save reset, no visible bell apparatus/copy, center-deck poses and interpolation, pause/reduced motion, stable shader/texture counts through destruction, working relay/charger, reload reset and actual Enter/R retry inputs all pass. No browser errors. Inspected 2560x1600, 1280x720 and 390x844 screenshots, including intact/broken props, raised/lowered deck, further-crushed wreck, bell-free shelter and portrait pause. The final browser had 20 programs/40 textures; no before/after overall renderer improvement is claimed.
- Installed gameplay client via `tools/verify-presented-client.mjs`: two final real input bursts, screenshot/state capture and visual inspection pass; no error files. Evidence in `standard-client-final/`.
- `tools/verify-chase-score.cjs` and `tools/verify-chase-score-stages.cjs`: offline Web Audio renders pass. Five persistent score voices; no per-note allocation; zero muted output and paused/tail output; seven score stages and warning ducking. Peak 0.1685 in the 12-second score test. Audio waveforms are in the existing score output locations. No human listening or subjective difficulty claim.
- Restored Level 1 Audit response browser, nightfall/exit checks and installed-client input bursts passed earlier in this pass. Evidence in `output/audit-restored/` and `output/audit-response/`.

## Scope and limitations

Destruction applies to timber hurdles, the six added supplies/trolleys and the player's wreck. Permanent masonry, substantial course fixtures and gate posts retain their existing collision behavior. Older historical bell-diversion/checkpoint harnesses describe the removed mechanics and are superseded by the scoped tests above. The historical `verify-course-navigation.mjs` also has an outdated data-URL import fixture; the new exact baked/fallback test validates the current layout instead.

This pass does not complete the older broad 38-item experience goal or claim an overall frame-rate improvement. Level 1's previously recorded frame-budget failure remains unrelated to the bell restoration. No commit or deployment was performed.
