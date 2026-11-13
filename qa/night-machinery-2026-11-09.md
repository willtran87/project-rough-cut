# Industrial mower and chase decisions

Implemented: stronger mower silhouette and blade timbre; four collidable pump installations; perimeter deadwood; three working alarm treadles on the alternative routes at (-25.2,150), (-28.8,443), (26.5,685).

Hold the brake below 2.5 m/s within 3.2 m of a treadle for .7 seconds. Releasing or leaving cancels the hold. The seven-second alarm diverts Joe only while hidden, within 90 m of the bell and outside startup/checkpoint grace and ram recovery or windup. He follows the fixed bell position using the existing pathfinder. Seeing the cart or hearing it above 6 m/s within 48 m cancels the diversion. The player-facing quiet-speed advice is below 20 km/h to leave margin. Each treadle works once per attempt; retry replenishes them. No extra action key.

## Automated evidence

- `node tools/verify-back-nine-decoys.mjs`: all three activations/investigations, expiration, one use, interrupted hold, pause, visible activation failure, vision/noise reacquisition, hidden quiet movement, solid props and retry. Input-driven escape comparison: 78.10 m separation and no hit with alarm versus 10.48 m and one hit without.
- `node tools/verify-night-machinery-browser.cjs` and `--software`: actual brake input, captions, visible approach indicators, bell swing, Reduced Motion, pause, acceleration breaks diversion, no console errors, resource bounds. Inspected 2560x1600, 1280x720, 844x390 screenshots.
- `node tools/verify-night-machinery-audio.cjs`: actual offline graph, directional bell, mute, pause tail, bounded peak, nine persistent sources. Peak .178; right/left bell RMS .0192/.00918; mute zero; tail .0000316.
- Existing all-six-route victory simulation, hunt/finale, tension/escalation, ram escape/windup simulations, vehicle contact browser, windup geometry/audio browser and course-effect audio pass. 38,784 mower vertices fit the existing collision hull in the windup check.
- Installed standard client ran through `tools/verify-presented-client.mjs`; state and presented screenshots inspected under `output/night-machinery/standard-client/`.

Resources remain 16 programs, 34 textures, two local lights and nine audio sources. Added one panner, fixed model details, three bell groups and spatially batched scenery. Static material batches increased from 232 to 249. Software startup in the staged check was 3.44 s. The ordinary opening sample was 37.94 ms average / 46 ms p95 at 960x540; staged camera jumps included a 614.8 ms spike. These samples do not prove throughput parity; existing software rendering limitations remain.

## Human playtest prepared for later

1. Play the open route, then one side lane. Without being told where to stop, note when you recognize the pressure gauges and treadle. Did you have enough distance to brake?
2. Try an alarm while hidden; remain below 20 km/h until safely separated. Try it while visible, then accelerate during a diversion. Explain why each attempt worked or failed. Check whether the bell direction and Joe's engine make his response understandable without looking back.
3. Compare perceived risk and enjoyment of staying fast against stopping to divert him. Record confusion, unwanted stops, hits and which option you would choose under close pursuit.
4. During a ram, look back and assess mower silhouette, face readability, deck guards and sound. Does it feel dangerous without hiding the escape direction or overwhelming the warning rev?
5. Repeat with Reduced Motion, mute, touch and controller. Functional choices and warnings should remain understandable. Record any nausea or discomfort separately from intended suspense.

Human fear, listening and first-time comprehension are not yet validated; no user playtest is required to finish implementation.
