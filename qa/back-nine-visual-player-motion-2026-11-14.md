# Back Nine — player motion and physical support

BV27 is complete for grounded player movement, braking, steering and breathing. This is one item in the full 48-item visual upgrade. Player surface/model parity (BV26), environment composition and software fidelity remain unfinished.

## Changes

- Stopping uses two short recovery steps over 0.4 seconds. Supporting soles hold their world position; horizontal recovery occurs with the foot lifted.
- Resuming during or after recovery uses a 0.14-second lifted transition into the distance-driven gait. It does not retain an old support anchor beyond the leg's reach. This also covers reverse movement and restarting a stationary pivot.
- A separate upper-body pivot adds acceleration/braking weight transfer, turning lean, arm bracing, and restrained breathing. Breathing effort rises while running and subsides after stopping. Feet retain their original terrain-driven analytic IK.
- Reduced motion removes the optional lean, breath, shoulder lift and bracing while retaining functional foot placement. Pausing does not advance either pose. Owner changes, time discontinuities and restarts reset presentation history.
- The work-light housing and its actual light source now follow the upper-body pivot. Mounted accessories are registered in the existing defeat-support calculation; the lamp no longer penetrates the floor during a sideways fall.
- Simulation, collision, pursuit, control timing, checkpoints, geometry and material assets are unchanged. The seated model is baked before the new pivot is added.
- Four import-map entries use `20261114-player-motion-3`: chase-runner, runner-gait, runner-balance and back-nine-headlights. The served bytes match their local sources and import keys are unique.

## Verification

Evidence root: `output/back-nine-visual-upgrade/player-motion`.

- `rules.json`: 3,960 baseline/current gait samples, 10,800 transition samples at 15/30/60/120 Hz, and 1,680 balance samples. Forward/reverse stops, 0.07/0.2/0.6-second pauses, resumed turns/pivots, immutable input, duplicate timestamps, reduced motion and reset pass. Near-ground horizontal travel during stopping is reduced by 94.76% in this fixture. Uninterrupted running targets remain identical to baseline. Maximum transition target reach is 0.7583 m, within the original 0.77 m leg length.
- `rig.json`: actual authored geometry confirms a byte-equivalent seated pose, ejection through 1.05 seconds within floating-point tolerance, and unchanged unaccessorized defeat geometry. Both the body alone and the body with the work-light assembly rest 0.015 m above the flat defeat support plane.
- `accepted-native` and `accepted-software`: 13 matched 2560 × 1600 captures, including idle phases, running, both recovery steps, settled stance, reverse stop, slope stop, reduced motion, and four close inspection views. The close views are diagnostic camera positions, not gameplay-camera claims. Actual images were opened and inspected.
- Smaller controlled reduced-motion views at 1280 × 720 and 390 × 844 preserve the character, course and readable interface. The fixture explicitly updates the world with reduced motion after resizing; it does not claim a new settings-UI test.
- Each renderer checks 7,560 actual rig poses at 15/30/60 Hz over three terrain locations, including rapid restart, reverse restart, pivots and reduced motion. Minimum boot clearance is 0.01050 m; maximum planted clearance is 0.03081 m; maximum support displacement is 0.00201 m; IK target error is below 6e-14 m. Repeated renders have zero displacement. Mounted defeat geometry remains at least 0.015 m above its support plane. Pause/resume and full restart to checkpoint zero pass with no console/page errors.
- Every visual sample verifies the rendered work light's source is coincident with its housing attachment point, within 1e-8 m.
- `routes`: 9,917 poses over all 14 authored driving/foot routes at 30 Hz. Actual boot vertices remain above terrain; maximum planted clearance is 0.03180 m, maximum support movement 0.00178 m, and maximum target error below 1.2e-13 m. Uphill/downhill/range images cover 2560 × 1600, 1280 × 720 and 844 × 390. Geometry buffer allocations remain 2,457; programs/textures remain 35/55.
- `comparison.json`: all 13 before/current visual fixtures retain identical player/cart/Joe/time/objective/checkpoint/service/utility/navigation/destruction/wreck/failure/death state. Current native and software states also match.

The existing Level 1 service-building reference was reviewed during this turn's visual review. It remains a reference for authored pixel detail and grounded composition, not evidence that the entire Back Nine now matches Level 1. The current player's dark boot/hand surfaces and broader model finish still require the separate BV26 pass.

## Actual keyboard gameplay and cost

The installed standard gameplay client ran the new fixture with forward movement, an interrupted stop, restart, a full stop, reverse, turning, forward movement and a final settle. Native/software finish at `(20.82830292595025, 71.41017624022923)`, yaw 0.52, speed zero, checkpoint zero, with identical physical state and 11 foot-contact events. Both feet are planted, and breathing effort remains 0.5585 after the run. Final screenshots and text state were inspected. No error artifacts were produced.

A separate original chase fixture includes forward travel, steering and Q rear glance. Its player/cart/Joe/time/objective/checkpoint and other physical state match the previous rider-motion pass exactly. Its final screenshot was also inspected.

No model geometry, material, texture or shader was added. All native visual cases retain 35 programs and 55 textures. The moving work light now refreshes its existing shadow pass during idle breathing: the three idle comparisons add one draw, with no added triangles. Other visual cases retain their draw counts. Triangle differences of -4/0/+4 are exactly accounted for by the existing terrain contact-shadow patches changing with foot position. This is not a claim of zero rendering cost.

The actual stop/start client measured native 2560 × 1440 at 12.14 ms average / 13.30 ms P95. Software rendered 640 × 360 at 125.30 / 168.20 ms. These short shared-host observations do not establish an isolated performance comparison. Software remains visibly coarse and slow; BV48 is still open.

## Failed iterations and remaining scope

Earlier recovery versions exposed old-anchor snapping and unreachable support during immediate restarts. Copying anchors and choosing a fixed stride phase were insufficient. The accepted version blends a lifted restart step and passes the expanded rapid-transition tests without weakening the geometry thresholds.

The initial defeat browser check found the work-light assembly was mounted after the body's support list was captured. The light assembly is now registered and follows the same upper-body transform as its emitter. The original body-only defeat pose remained valid throughout.

The early audit incorrectly assumed all draws and triangles must stay identical. Current measurements distinguish the existing lamp's newly moving shadow pass and terrain contact-patch changes from new resources. Shader/texture equality, exact physical-state comparisons, and full geometry grounding remain required.

`first-native` through `sixth-native`, `final-native` and `final-software` are intermediate captures. Acceptance uses `accepted-native`, `accepted-software`, `routes`, `client-native`, `client-software`, `chase-native` and the current rule/rig/comparison reports. The rest of the 48-item goal remains active.
