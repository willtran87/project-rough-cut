# Back Nine pass 27 — wreck routes and obstruction-safe ejection

The previous goal turn was progress. This pass extends required-route coverage and fixes two defects found during that audit. The complete 38-item objective remains active; human testing stays prepared for later.

## Defects and changes

The old ejection landing test used the navigation sight sampler, spaced up to 1.5 metres apart. It could skip a narrow garage bollard between the cart and an otherwise clear landing point. A dense garage sweep found 178 such crossings in 6,720 legal cart/mower arrangements. Three actual fatal rams reproduced the issue, rather than relying solely on directly calling the abandonment helper.

`chase-ejection-clearance.js` checks each entire short segment analytically against the same expanded obstacle boxes and circles used by the runner. `leaveBrokenCart` now validates both the cart-centre corridor and the visible seat-to-landing corridor. It retains the existing candidate positions, scoring, physical mower/wreck separation, retry-after-backoff fallback, control recovery and protection window. No collision shape, damage, pursuit speed, route or navigation bake changed.

The corrected landing exposed an existing camera problem beside the garage wall. The physical runner already occupies its landing point while the visible body is still leaving the seat. The camera followed the former, putting the wall in front of the falling body. During ejection it now follows the rendered body, checks the interpolated camera arm against obstacles, preserves enough height in tight clearance and frames the body. Its temporary focus fades through the existing 0.86–1.18 second recovery; ordinary steering-follow, rear glance and reduced-motion behavior retain their controls. This adds no render assets or shaders.

The first camera candidate removed wall occlusion but produced an excessive close-up. Keeping camera height and centering the temporary focus corrected that framing; final high-resolution images were inspected. Tight physical corners can still partially conceal legs behind real scenery. The change does not make walls transparent or claim a human comfort assessment.

## Required-route evidence

`verify-chase-wreck-routes.mjs` builds an offline 0.5 m runner grid and uses exact swept links around the wreck, plus 0.08 m static segment checks. It checks a spread of road positions and eight headings around relays, all five cart gaps and the garage. Of 663 legal cart placements, 24 had no legal mower at the sampled approach offsets and are explicitly excluded. All 639 remaining cases (134 course, 505 critical) have a landing connected to every remaining required relay and the garage. Eighteen representative paths are replayed using actual stepped runner movement, including turning, with the wreck present; all reach the garage.

The initial lattice incorrectly reported a trapped runner beside the service trailer at (-22,767). A separate 0.05 m local flood and real movement showed a traversable diagonal channel and nearly 14 m of escape movement. Expanding only the audit's exact start connections beyond the sub-grid sliver fixed the false failure. No production collision or landing rule was weakened. The failed diagnostic remains `before-connectivity.json`.

This proves connectivity for the stated sampled configurations, not every continuous pose, player decision or live-pursuit outcome. The test deliberately separates structural reachability from chase balance.

## Ejection and performance evidence

- `verify-chase-ejection-paths.mjs`: all 6,720 garage arrangements still produce a landing. All 13,440 centre/seat segments pass independent 5 mm sampling; crossings fall from 178 to zero. Every old failing segment is rejected by the analytic check. Tangency, degenerate segments, world boundaries and unchanged baked navigation signature 2693326411 are checked.
- `verify-chase-breakdown-clearance.mjs`: 1,401 existing route/feature placements pass, at least five usable movement directions in the tested samples. Four genuine fatal-impact/control-return scenarios pass. The wreck still buys roughly 2.38 seconds of cover, Joe physically detours and eventually catches a stationary runner.
- `fatal-comparison.json`: three genuine garage-approach impacts with cart headings 135°,180°,270° choose a bollard-crossing landing under the previous implementation and a clear one after the fix. These fixtures start the actors near collision but do not force a damage event or call abandonment in the current simulation.
- `verify-chase-garage-ejection.cjs`: hardware completes all three fatal-impact → ejection → normal gamepad movement → garage closure chains with Joe active. The latter two require running around the wreck and garage corner. Every sampled rendered root has a clear ground corridor; every sampled camera-to-body segment is unobstructed. The new camera does not change those completion times.
- Existing `verify-cart-ejection.cjs` passes the final hardware version: seat origin, animation continuity, ground support, asymmetrical limbs, side camera, pause, reduced motion, actual collision, landing sound, readable captions and prompt control recovery. No new programs/textures/audio voices.
- Inspected final hardware ejection images at 2560×1600 and compact 844×390; browser coverage also includes 1280×720. The original heavily wall-occluded shots are preserved under `camera-before/`.
- Paired AB/BA CPU measurement, 500 samples per version across representative garage cases: landing selection median 0.770→0.837 ms, p95 1.300→1.407 ms; observed maxima 1.951→5.058 ms. This is bounded one-time correctness work, not a GPU or frame-spike improvement. Broader sweeps give approximately 1 ms median / 1.7 ms p95. Camera obstruction work is limited to the brief ejection presentation.

Artifacts and source snapshots: `output/back-nine-experience/wreck-routes/`. Runtime changes are in the new clearance helper, `chase-player.js`, the ejection camera portion of `back-nine-scene.js` and their HTML cache versions. Other chapters and shared movement/collision functions are unchanged.

## Remaining scope

Continue software-rendering hot spots and whole-course route/readability/lighting/spatial-audio/encounter-priority acceptance. Required-route wreck connectivity now has broad sampled technical coverage, with real gameplay checks at the garage; do not confuse that with a human difficulty or fear assessment. The human kit should examine finding the way around a wreck, the short camera reframing and choosing cover after an awkwardly oriented crash.


## Final verification

The final SwiftShader garage-ejection run also passes all three actual fatal-impact/escape chains with the same completion times as hardware: elapsed from the staged time20 start is8.583,11.800 and12.017 seconds. All44 sampled camera/body rays per heading remain clear; resources stay25programs/40textures/12voices (hardware20programs). Final software2560×1600,1280×720 and reduced-motion844×390 images inspected. The latest standard installed client completes two normal on-foot movement/turning bursts (time2.883→3.750s) with current controls/instructions,25programs/40textures and no errors; final page/state inspected. This client fixture verifies controls/render integration, while the separate garage test proves the complete escape chains.

All owned verification handles are terminal. No cold-start or software GPU frame-time improvement is claimed. The full goal remains active.
