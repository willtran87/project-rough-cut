# Back Nine route choices, on-foot pursuit and cutscene correction

## Delivered

- Three authored route decisions: pump yard, range works and service approach. Thirteen new solid features (22 total) include abandoned carts, maintenance trailers, fallen timber and boarded fencing. Each decision retains an exposed wide route and a 3.6 m cart opening that rejects the mower's cutting deck; two additional 1.7 m passages admit the runner only. Lanterns, worn ground and damaged rails identify connections. Required relays and the garage remain reachable on foot.
- Joe uses the actual deck clearance in baked navigation and path smoothing. A visible commitment to a tight lane can provoke a warned, feasible wide interception; hidden turns do not update his target. Navigation bake signature: 4113333288, 4410 nodes.
- On-foot mouse turning, adjustable sensitivity, camera-relative movement and Q rear glance. Rear glance preserves movement heading and returns to the previous view. Controller right stick and touch drag also turn the view. Click captures the mouse; Escape releases and pauses. Analytic camera sweeps detect thin fences, and movement slides along walls instead of snagging.
- Saved shake and flash intensity controls, shared reduced-motion setting and no motion blur. Close camera clearance hides the player model to prevent the head obstructing the view.
- Articulated knees/elbows, running counter-swing, turning lean, collar, clothing weave, facial detail, hair, belt and boots. Existing ejection and run-over sequences remain. Two small native pixel maps reuse the existing cloth shader.
- A protected red beacon slowly pulses onto terrain and nearby models through the existing mower light. Zero flash/reduced motion gives a steady warning. Added damaged cutting-deck teeth, darker sky/cloud treatment, gouged approaches and a fixed pool of 24 cut-turf stamps. Existing pooled debris and designated breakable lightweight rails remain; solid boarded fences remain protective.
- Directional engine, blades and impact audio follows camera heading and rear glance. Existing nine voices retain distance/occlusion and chase pacing; no additional sound loops or point lights.
- On foot, Joe's 1.8-second warning leads to a 1.15-second fixed-heading charge, with 9 m/s² acceleration and a 10.8 m/s cap. A miss or obstacle produces 1.6 seconds of recovery. Existing post-impact retreat and five-second ejection protection remain. Retry restores the repaired cart at the saved checkpoint without replaying the intro or rebuilding the scene.
- Fixed initially empty damage-geometry bounds that could hide the intact cart body before its first impact.

## Impact damage rules

Let `d = clamp((cart.y - 480) / 327, 0, 1)`. Cap this progress by relay state: `[0.10, 0.34, 1]` for zero, one or two relays. Let the capped value be `p`.

`scale = 1 + 1.15 * p*p*(3 - 2*p)`

`damage = round((4 + 12*strength) * (0.72 + 0.28*abs(front)) * scale)`

Strength is the existing normal closing speed divided by 12, clamped to 0–1; front alignment is also clamped. Only successful physical contacts apply damage. No passive drain or scripted destruction. Relay activation cannot jump immediately to maximum because relay locations occur before the corresponding distance cap. Maximum direct hits rise from 16 early to 21 around y590, 32 at y740 and 34 at the finish. Repairs retain 20 per relay and one optional 25-point service per shelter. Motor load grows subtly with escalation; warnings and escape windows stay intact.

## Corrected scene two

The first perspective edit was rejected. The final replacement was regenerated with built-in imagegen using a strict driver-side profile: aligned equal-sized wheels, straight chassis/roof, side-on seat back and dashboard, and an edge-on steering wheel. The rainy maintenance bay, muted cart finish and amber/cool night palette remain.

- Native 1672×941 master: `assets/cutscenes/back-nine-opening/02-one-cart-side-profile.png`
- Exact final prompt: `assets/cutscenes/back-nine-opening/02-side-profile-regeneration-prompt.txt`
- Runtime WebP: `web/assets/optimized/back-nine-opening/02-one-cart-side-profile.webp`, 465746 bytes
- Slide two references the new filename, avoiding reuse of the rejected cached asset. Other four slides are unchanged. Packaging manifest refreshed.

## Verification

- `verify-back-nine.mjs`: all nine route/checkpoint simulations finish with live Joe. Main, old branches 2/3 and new branches 4/5/6 finish on foot; checkpoint 2 and old branch 1 finish with a working cart. Relay repairs explain the full-health branch-1 finish. These are deterministic automated drivers, not human survival probabilities.
- `verify-back-nine-choices.mjs`: all three new branches are drivable with controlled steering, all cart/foot gaps respect actual hull sizes, wide mower detours exist, escalation is smooth/capped/angle-sensitive, and interceptions respect sight. A real late 33-damage ram destroys a 25-health cart; protected ejection, the final foot gap and garage victory succeed with live Joe in 15.5 seconds.
- `verify-cart-health.mjs`: all three entirely on-foot starts complete required relays and the garage with live Joe (124.68, 81.58 and 38.37 seconds). Wreck solidity, safe ejection, repairs and stationary-player vulnerability pass.
- `verify-runner-controls.mjs`: camera-relative movement, rear-glance preservation, thin-fence sliding, camera clearance, dodgeable fixed-heading charge/recovery and steady accessibility beacon pass.
- Hardware and SwiftShader `verify-back-nine-on-foot.cjs`: actual replacement image loads, cutscene/guide/start flow, mouse input, rear glance, pause/settings, reduced motion, pointer capture/release, controller look and UI retry pass. Retry completes under 1.5 seconds. 2560×1600 and 844×390 captures inspected; no browser errors or additional runtime buffer allocations while touring tested views.
- `verify-cart-health-touch.cjs`: real coarse-pointer touch drag, Run and Use pass. `verify-runner-audio.cjs`: stereo changes correctly with camera/rear heading, mute is silent, no clipping, nine voices.
- Existing ram, windup, heavy-impact, run-over and chase-decision simulation regressions pass. Standard installed web-game client exercised the on-foot view and keyboard actions.
- Release validation: 90 fixture validations, 66 image references, 25.58 MB, no missing/unreferenced runtime images or warnings. Runtime syntax and whitespace checks pass. These fixture validations are not 90 full playthroughs.

Evidence: `output/back-nine-route-choices/`, `output/back-nine-on-foot/`, `output/chase-on-foot/`.

## Performance limits and later human playtests

Final 960×540 SwiftShader GPU-completed probes (30 samples per view) measured medians of 29.2 ms in the yard, 31.1 ms at range works, 27.2 ms at the finale, 42.0 ms on the wet lane with mower, 34.0 ms near the runner and 36.9 ms with runner/foliage. The wet sample reached 47 ms. Final ready time was 4.353 seconds in that run. These short probes do not prove worst-case frame pacing or 60 FPS.

Hardware/software shader programs remain 17/22. Textures increase from 34 to 36 (about 0.167 MiB for the two small maps with mipmaps); lights remain two and audio voices nine. The final probe reports 17 geometry preparation batches and 24 texture batches. No new shader compilation or buffer allocation occurs in the tested later views. New scenery still costs raster work compared with the older, emptier course. Compared with the route-enhanced build before the on-foot changes, results are broadly comparable, with roughly 0.3–0.4 seconds more preparation in the paired samples. Software wet-lane/foliage spikes remain unresolved.

Human playtests remain prepared for later, as requested. Check: whether first-time players recognize wide/cart/foot choices; whether five seconds after ejection feels sufficient; whether Q and mouse turning remain comfortable during panic; whether the 1.8-second warning and miss recovery feel fair; whether late damage feels earned while skilled players retain the cart; whether red light is readable without exposing too much; and whether runner detail/animation meets the intended visual quality on actual displays. Automated completion does not establish horror, enjoyment, model parity or final balance.
