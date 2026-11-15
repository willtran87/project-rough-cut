# Faster pursuit and atmospheric contrast

## Tuning

- Driving pursuit targets: paved 24 → 27 m/s, rough 22.5 → 25, wet 21 → 23. Sand remains 9.3. Overall cap 28 → 31.5 m/s with the existing visible-target catch-up envelope. Corner braking and turn-rate limits remain unchanged.
- Driving acceleration response: 3.8 → 4.4, armed ram 4.8 → 5.5. Cart windup detection begins within 20 m instead of 16, retaining the full 1.8-second warning.
- Foot pursuit caps: 7.4 → 8.0 normally, pressure 8.6 → 9.2. Warned locked-heading charge 10.8 → 11.6 m/s. Foot windup retains its 16 m range. Wreck-side approach now has priority over beginning a charge through the abandoned cart.
- Preserved 1.1-second minimum retreat plus clearance requirement, 1.8-second windup, 1.6-second missed-charge recovery, five-second ejection protection, checkpoint respite, alarms, collision sweeps and damage rules.

## Atmosphere

`chase-atmosphere.js` supplies shared simulation-time envelopes. A slow storm swell begins after 18 seconds, lasting 12 or 15 seconds on alternating 47-second cycles. Existing moon/hemisphere illumination gently dims; no lightning, blackout, extra lights or fog obstruction. Reduced motion or zero flash strength disables this modulation.

Proximity lowers ambient noise smoothly so Joe's existing directional engine becomes more dominant. Distant low rumble and beating drone tones reuse existing audio voices. Retreat, ejection protection, checkpoints and alarm distractions release the proximity hush; pause freezes envelopes. No new sound nodes during playback.

## Verification and results

- Three same-input baseline comparisons at 30/50/65 m initial separation: first hits occurred 0.82/0.85/0.93 seconds sooner. Across the three 25-second scenarios, hits increased from nine to ten; individual route outcomes still vary. All repeated hits kept more than 2.8 seconds between contacts.
- Twelve normal-health route runs passed: main route, both checkpoint starts and nine alternate routes. Eleven finished on foot; the final-checkpoint start finished with an intact cart. This simple route follower does not use the alarm/repair strategy, so these results do not establish intact-cart balance for a skilled complete run.
- Ram recovery, run-over, solid collisions, warned charge evasion, checkpoint follow protection, decoys, lost-sight prediction, garage sealing, pause and release checks passed. Updated route-test foot steering to the actual cart-style controls and physical speed assertions to the new cap.
- The old exposed-main-road sightbreak fixture no longer reliably lost Joe. The live visibility test now deliberately takes the reservoir cover route and uses extra fixture durability to isolate visibility; it observed 2.87 seconds hidden followed by a reveal. Normal-health route tests remain separate.
- Browser atmosphere checks at 2560x1600, 1280x720 and 844x390 passed and screenshots were inspected. Same 22 software shader programs, 37 textures and 91 draws in matched calm/storm views; no added scene geometry. Installed standard client passed two on-foot iterations with no page errors.
- Offline audio: storm RMS 0.0355 vs calm 0.0242; peak 0.105, muted output zero, pause/tail silence, nine voices and no runtime node allocations. This is signal validation, not a claim of human listening evaluation.
- Release: 90 scenarios; 67 runtime images / 26 MiB. Syntax and whitespace checks passed.

Evidence: `output/chase-menace`, `output/back-nine/simulation.json`, `output/mower-ram`, `output/pursuit-continuity`, `output/back-nine-hunt`. Later playtesting should assess full-run cart survivability, fatigue from the stronger pressure and audibility of the low rumble on ordinary speakers. No deployment.
