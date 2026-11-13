# Level 2 environmental landmarks and obstacles

Added nine authored landmarks distributed between the nursery, maintenance yard, flooded range and clubhouse approach: three abandoned maintenance trailers, three storm-felled trees and three raised irrigation cisterns. Trailers have tires/hubs, boarded sides, ribs, cargo, reflectors and muddy ruts; trees have tapered trunks, broken branches and sparse foliage; cisterns have stone rims, water sheen, grates, damaged pipework and valves.

Their footprints replace overlapping procedural shrubs/rocks and participate in collision, sight and navigation. They provide off-road obstacles and cover while leaving relays, the driving routes, emergency shortcuts and garage accessible. These are fixed scenery, not new interactable objectives or destructible props. The cart and mower use swept hull contact (including deck width); runners and the run-over continuation also respect them. Vehicle overlap recovery rejects moves into these landmarks.

## Verification

- `node tools/verify-course-features.mjs`: nine authored solid footprints; 108 swept approaches and reverse escapes across cart/mower/foot and all four sides; nine route comparisons against the current geometry's non-baked fallback. Baked signature 786186827, 4410 nodes, zero runtime edge checks.
- `node tools/verify-back-nine.mjs`: all six driving routes complete, including both checkpoint starts and three branches. Main route completes in 67.82 simulated seconds with five rams; cover changes encounter timing.
- `node tools/verify-cart-health.mjs`: all three on-foot starts reach the relays and seal the garage; safe ejection, repairs and wreck collision pass.
- Existing vehicle contact, run-over, decoy, chase decisions and pursuit continuity suites pass. Shortcuts, alarm benefits, warning/recovery and protection remain available.
- Hardware and SwiftShader `verify-course-features-browser.cjs`: captured all nine from the chase camera at 2560x1600, plus 1280x720 and 844x390. Inspected trailer, tree and cistern views, software tree view and small-screen layout. No browser errors. Same 17 hardware/22 software programs, 34 textures, nine audio voices. No additional bufferData uploads during view changes. Observed draw counts 78–95 hardware and 74–94 software for these views.
- Installed standard Playwright gameplay client via `verify-presented-client.mjs`: two driving input bursts, state and full-page screenshots inspected.

## Performance and remaining player testing

All new geometry joins the existing spatial/material batches and culling, reusing pixel maps. No new lights, shaders, texture downloads, animation loops or audio sources. Navigation is baked offline. Collision checks reject distant features before SAT/sweeping. Browser readiness in this run was 2.58 seconds hardware / 4.62 seconds software; these are observations, not controlled cold-start improvements. Extra visible geometry has a cost; no claim that software frame spikes are eliminated.

Deferred player test: drive the main and alternate lanes at chase speed, deliberately use each landmark as cover, back out of corners, and confirm low logs are readable before impact on the target display. Check subjective obstacle spacing and pursuit balance; automated completion is not a substitute for those judgments.

Evidence: `output/course-features/`; original source snapshots: `output/course-features/baseline-source/`.
