# Back Nine: sparse light, stronger pursuit and vehicle damage

## Shipped changes

- Retained the six continuous fairways/greens, boundary planting, service courts and tactical routes from the preceding composition pass. Added flush drainage channels to the four service courts and recessed irrigation heads around green edges. Wet turf uses irregular contours and a restrained ground tint instead of hard black discs. These details introduce no new solid obstacles.
- Reduced lanterns from 148 to 90 (39%). Ordinary paved spacing is 52 m and secondary-track spacing 70 m, with lights retained at gates, foot-route entrances and alarm stations. Darkened the sky, moon and hemisphere illumination while retaining the turf readability floor and destination lighting.
- The mower's existing point light is now a red roof beacon with a 40 m cutoff instead of 18 m. It follows the beacon's actual position and slowly pulses over 1.6 seconds, with power 105–200. Reduced motion and zero flash intensity retain steady power 105. No extra point light, shadow map, bloom layer or particle system was added. Warm headlights remain visible on the model.
- Cart pursuit road/rough/wet/sand targets are now 31/28/26/10.2 m/s, formerly 27/25/23/9.3. Catch-up cap increases from 31.5 to 36.5 m/s; acceleration response rises from 4.4/5.5 to 5.3/6.4 and turn-rate limit from 1.32 to 1.38 rad/s. Corner braking, visibility-based knowledge, interception, distractions, checkpoint protection, ram windup, retreat and on-foot limits remain.
- Added rear cart coachwork, vented breakaway hatch, battery cradle, crash-bar corners and roof flanges. Mower additions include welded cheek plates, heat shields, broad hose runs and couplings. All detail uses existing materials and vehicle batches, inside existing hulls.
- Stronger roof/frame sag and lean, hood displacement and loose hatch movement. A fourth wear layer adds a broad roof split at battered health. Existing progressive stages, collapse, repair and settled debris behavior remain. HUD names the current damage condition, highlights critical health without flashing, and impact captions show actual health lost for longer.

## Verification

- Hardware and SwiftShader visual tests at 2560×1600, 1280×720 and 844×390: no console/page errors; captions and damage HUD do not overlap. Approach/close beacon views, steady reduced-motion beacon, wet turf, pristine-to-critical cart states and repairs captured and inspected.
- Damage browser suite: collapse timing, settled debris, ground clearance, reduced-motion settled wreck, pause stability and repair reset all pass. Zero new GPU buffer allocations during the health/collapse sequences; program/texture counts remain stable.
- Installed standard gameplay client: two on-foot action sequences completed; latest screenshot and game state inspected. Browser keyboard steering, reverse, look-back, mouse/right-stick exclusion and powered on-foot garage victory pass.
- `verify-red-night-pursuit.mjs`: in the same one-second visible-approach fixture, Joe travels 30.39 m instead of 25.81 m and reaches 33.76 m/s instead of 30.18; no collision or player damage in that fixture. Beacon power and comfort-mode stability checks pass.
- Main simulation suite completes all 12 full-start/checkpoint/branch scenarios with live Joe and no teleports. Final-checkpoint run retains an intact cart; full-start automated routes generally lose the cart and finish on foot. This is evidence of reachability, not proof of human difficulty balance.
- Five cart gaps, three foot gaps, seven tight branches, interception, relay-gated damage, protected late ejection, on-foot escape and checkpoint retry pass. Mower retreat remains about 5 m and first recovery about 3 seconds in the ordinary contact fixtures; blocked retreat still finds an escape.
- Release verification passes 90 action scenarios with 67 runtime images and no missing assets/warnings. Navigation layout/signature remains 2693326411, 4410 nodes.

## Rendering cost and limits

Final standalone software scene: 4568 static pieces (previously 4936), 129 batches (128), 140 trees, 22 shader programs and 36 textures. No new runtime asset textures. Geometry upload batch maximum is 1,882,048 bytes (previously 1,961,528). Paired captures allocate no new GPU buffers while playing.

Same-renderer, fixed 960×540 SwiftShader ABBA comparison, 48 samples per version per view:

| View | Median before → after, ms | p95 before → after, ms |
| --- | --- | --- |
| Wet lane and mower | 48.9 → 52.2 | 65 → 70 |
| Reservoir shore | 42.9 → 43.0 | 52 → 54 |
| Green | 41 → 45 | 52 → 61.4 |
| Runner and foliage | 41.2 → 42.3 | 50 → 50 |
| Clubhouse | 37 → 37 | 50.6 → 58 |
| Front mower | 35.9 → 37 | 39.3 → 42 |

The broader red illumination has a measurable software cost despite fewer lanterns. It is not a performance improvement, and existing software spikes remain. A single-light shader specialization was tried but removed because the small measured benefit did not justify eight additional startup programs. The shared local-light module is unchanged.

Evidence: `output/back-nine-red-night/`, including `paired-performance.json`, `software-visual.json`, `hardware-visual.json`, `pursuit.json`, `damage/` and `standard-client/`. Main simulation report: `output/back-nine/simulation.json`. Intermediate experimental captures are not the shipped performance result.

Later human playtesting should focus on the rate of cart loss with the faster pursuit, route recognition with sparse lanterns and beacon readability on the player's display. Human feedback remains deferred as previously requested.
