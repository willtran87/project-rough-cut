# Back Nine experience — pass 23: working-mower reveal and escape continuity

The previous goal reply restated the roadmap without implementation progress. This pass recovered the pending implementation and tests, investigated downstream encounter changes, retained verified behavior and updated acceptance coverage. All 38 requirements remain in scope. Human playtests remain prepared for later.

## Retained behavior

- Joe begins physically mowing the first fairway at (22,94), facing across it, with a 3.2m/s working limit. He notices a visible approach, stops and turns toward the observed position for 1.65 seconds, then enters normal physical pursuit. No teleport, camera takeover, new invulnerability or scripted damage. Checkpoint retries skip this beat.
- The existing audio/light reveal now builds over that notice interval. A brief obstruction of up to .25s no longer cancels the presentation; sustained cover still does. This does not change Joe's sensory evidence or targeting. The deliberately stopped mower no longer enters stuck-reversing logic.
- Ejection placement now prefers an already-safe door candidate with 3.5m of forward escape space, checked against scenery, the wreck and Joe. Existing placement, impulse and protection rules remain. Narrow locations can still require a turn; no position outside the original candidate set is introduced.
- A passing attempt can retain its original 6.2m lateral entrance and widen the exit outward to 12.4m if the straight exit is obstructed. Both complete segments require 2.7m clearance. The lane stays frozen after the full 1.8s warning. It never bends back toward hidden player steering.
- Updated module/entry cache tags; departure state is available in the diagnostic state output.

## What the district investigation actually established

The initial suspected scheduling starvation was not sufficient to explain the missed clubhouse opportunity. At the representative clear approach around y665, the cart still had roughly one second of post-hit invulnerability. `updateHunt` correctly refused another attack. At protection expiry the straight corridor was blocked. Those escape windows were preserved; the director and damage rules were not weakened to force a set piece.

The outward exit admits two additional natural warnings in the 64 maximum-pace runs. Those drivers turn away and prevent an actual overtake. A broader 16-run sample across 8/10/12/14m/s target speeds found two real clubhouse overtakes at 12m/s. Both full runs finish in the cart with23HP. District acceptance now includes a moderate-pace actual overtake and a slower on-foot finish, while retaining the original fast routes. Optional encounters are not required on every route/seed.

The former test also required consuming repair supplies even when checkpoint healing had already filled the cart. It now requires consumption only for damaged arrivals; supply bounds and real repair behavior remain asserted.

## Simulation and physical evidence

- `verify-chase-departure.mjs`: moving, waiting and slow starts at direct30/60Hz; pause, unchanged checkpoint spawns, no overlaps, bounded displacement, full ram warning and quiet ordinary banners. Actual runtime simulation remains fixed60Hz; downstream direct30Hz behavior is not claimed identical.
- At60Hz, normal route notice4.067s, pursuit release5.733s, first contact11.867s. Earlier baseline first contact6.517s. Waiting is not permanent safety: first contact17.9s. Slow approach first contact14.55s.
- Same initial wreck comparison: old landing gives1.369m forward movement before the rear panel blocks it; new safe side landing gives10.337m in140steps.
- `verify-chase-breakdown-clearance.mjs`:1,401 clear placements, at least five valid candidates, minimum reachable distance5.057m. Four actual fatal impacts return movement; wreck cover remains physical and useful, without permanent protection. Ejection CPU median1.051ms/p951.418ms in this sample; this is not GPU evidence.
- `verify-cart-health.mjs`: impact-scaled health, repairs, actual fatal ram, five-second protection, wreck collision, stationary-runner capture, both relays and garage. All three on-foot starts finish. The artificial immediate opening wreck now uses the central timber opening then nursery lane; approaching the newly forward-positioned mower head-on can be fatal. Six exploratory routes produced one win and five catches in that artificial case; this is not proof that all early escape choices are balanced.
- `verify-chase-passing-exits.mjs`: old straight corridor rejects the captured natural state, new outward corridor clears; warning duration, frozen hidden prediction and post-hit/checkpoint/earned protection verified.
- `verify-chase-districts.mjs`: seven complete runs, distinct district encounters across routes, a real overtake, cart and foot finishes, physical displacement/contact bounds and actual repair stops.
- `verify-chase-variation-routes.mjs`:64 complete runs,55 cart/9 foot finishes,14 tactical patterns, lowest surviving cart1HP. The opening changes downstream pacing from the previous42/22 split; later human balance remains a question, not a proven improvement in difficulty.
- Existing panic and encounter regression suites pass, including a35.529m committed foot charge and a usable earned recovery window.

## Browser and visual evidence

Opening: hardware/software at2560×1600,1280×720,844×390. Actual rendered-mower subtraction confirms working, notice and rev visibility; full windup is captured at desktop. Pause, reduced motion, quiet banners and unchanged resources pass. Final high-resolution rev and compact notice images inspected.

Ejection: recovered terminal software result and existing hardware result both pass. Continuous pose/grounding, actual fatal contact, synchronized landing, control return, comfort and enlarged captions verified. Compact control-return image inspected.

Natural passing: `verify-chase-natural-pass.cjs` replays states captured from full simulated runs through actual controller input and the live update/render/audio path, on both renderers. Moderate-pace pass reaches8.548m closest center separation, passes once and recovers without an added hit. Wider attempt reaches15.301m; the player evades it, Joe recovers and no hit is added. Rear-glance warning/alongside and forward escape screenshots inspected. Compact1280/844 layouts pass. Initial test inputs failed to compensate for the actual stick deadzone; corrected input follows the route at simulation cadence. An empty-banner assertion was corrected to permit the legitimate exposed-bell interaction prompt. Neither correction changed game controls or removed a gameplay warning.

Installed standard client: two actual three-second ArrowUp bursts from a fresh start. Carty43.867→78.108; Joe working→lining_up; notice4.45s/release6.117s on this straight rough-ground route.100HP/no hits, quiet banners. Screenshots and state inspected; no error artifacts. The client uses documented `up`, not unsupported `w`.

Same20hardware/25software programs,40textures and12audio voices; opening/ejection buffer-upload checks unchanged at1,114. No new render assets. Moving-frame performance was not measured in this pass: more forward-visible Joe can change cost despite unchanged allocation counts. Software frame spikes and cold-GPU pressure remain open.

Artifacts: `output/back-nine-experience/opening-pacing/`, `output/back-nine-chase-drama/ejection/`, current district/variation reports and `output/chase-on-foot/simulation.json`. Pre-pass source remains in `opening-pacing/baseline-source/`. No subagents used. Preserve concurrent chapter/shared-file work.

Next: measured moving-frame stability plus remaining whole-course route/landmark/darkness, natural encounter/audio/dialogue/omen acceptance. Do not repeat this introduction pass or force the clubhouse encounter on every driver. The full scope remains active.
