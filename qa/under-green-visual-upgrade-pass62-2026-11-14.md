# Under the Green pass 62 — physical channel edges

All 53 requirements, 48 refinements and seven whole-level gates remain active. This pass improves retaining-side water contact and catch-grate construction; it does not establish complete water or Level 1 parity.

## Change

`web/under-green-channel-edges.js` builds 16 closed, tapered sediment deposits along actual retaining walls and 16 catch grates comprising 96 framed panels. Floor-union checks exclude openings and detours from raised deposits. The deposit backs overlap the inner masonry face; unequal shoulders reach at most 29cm inside the floor boundary and taper to the floor between deposits. Existing sediment art, bump/wet masks, source lighting and flood response are reused. There are no new textures, lights, colliders or gameplay rules.

The earlier candidate buried most of each mud shoulder inside the wall. Moving its profile in front of the 11cm inner wall face makes the irregular contact visible at low water and partially submerged during a surge. The initial closed-box grate candidate also spent thousands of triangles on invisible millimetre-scale side/bottom faces. The final grates use layered upward faces on the existing opaque floor, retaining narrow frames, eight rungs per panel and a reinforcing crossbar. They remain below 1.8mm height. This is shallow drainage surface construction, not a false deep pit beneath the player's feet.

Runtime scene changes are limited to importing/calling the new builder and replacing the former two strip grates per water fixture. Water geometry, normals, UVs, indices, placement, simulation, signals, warning stripes and movement remain unchanged. Baseline/verified copies and SHA256 manifest are in `output/under-green/visual-pass62/source/`.

## Verification

Evidence root: `output/under-green/visual-pass62/`.

- `tools/verify-under-green-channel-edges.mjs`: 16 closed outward-facing mud meshes, 2,365 vertices / 4,666 triangles; 930 raised backing samples against real walls. Grates use 1,264 upward faces / 2,528 triangles. Checks cover finite bounds, end taper, winding, closure, floor openings and grate height/normals.
- `tools/verify-under-green-channel-edges.cjs`: `hardware-final` and `software-final` each pass 47 views and 4,608 camera-clearance poses with zero hits/errors. Native actual buffer 2560x1600; software actual buffer 960x600 under desktop screenshots. Responsive views at 1280x720, 390x844 and 844x390.
- Paired low/warning/surge/receding, near/reverse, bypass/return/bunker/range, flood, shore and grate fixtures preserve player/water/flood state, actual resolution and texture count. All eight water-surface geometry/normal/UV/index/world hashes match the baseline. Full 12-second cycle has 48 samples covering all four phases, with flow matching danger and no solid streams. Pause, reduced water motion and exact camera-return image checks pass.
- Lights-out images differ on native hardware and match on software. Geometry changed, so pixel parity in darkness is not an acceptance condition; there is no added emissive material or light. This is not a new whole-scene shadow/occlusion acceptance claim.
- `tools/verify-under-green-moving-clearance.cjs --dry`: 1,379 route frames, 106 body/scythe geometry samples, no intersections, maximum foot error 2.41e-7.
- Installed standard web-game client: seven input bursts, terminal success, final ready/playing at (0,8.84), elapsed 1.15 seconds, no error artifact. Initial Preparing-button click timeout recovered through later input. Final screenshot and state inspected.
- Inspected native low-water, outflow, close shore at low/surge, catch grate, cycle surge and phone views, plus software close shore and the standard-client scene. Remaining channel views and timing results are recorded below when their jobs finish.

## Cost and limits

Native low-water view: 399 draws / 325,300 triangles becomes 400 / 328,344. Near-water: 239 / 316,224 becomes 241 / 319,304. Outflow: 103 / 142,486 becomes 104 / 144,484. Close shore: 109 / 195,772 becomes 109 / 197,266. Texture and program counts match in the paired fixtures. This is not a draw-call reduction claim: the original fixture pieces were already batched.

Broad pool composition still needs stronger localized surface/depth cues, and the close sediment profiles need further material/silhouette integration with the reference artwork. No whole-level gate closes. Retain entrance-only retries, E/Q, Level 1 movement, sound-led tension, opaque enclosure and current pursuit/ghost behavior.

Remaining channel verification: `remaining-native` and `remaining-software` each pass six paired views of the east spillway, range B and keeper spillway. Combined with the full runs, all eight channels have visual coverage; 53 views per renderer in total. Native range B/spillway/sluice and software sluice images inspected. All owned visual/client/route jobs were terminal before sequential budget runs.

Local GPU completion median/P95 measurements (milliseconds):

- hardware: crossing 15.7/17.4 -> 13.7/18.8 ms; outflow 10.8/12.1 -> 9.9/11.9 ms; flood 14.4/16.0 -> 13.3/15.8 ms.
- software: crossing 175.9/262.4 -> 182.2/254.0 ms; outflow 185.7/200.1 -> 190.4/206.0 ms; flood 173.8/277.2 -> 178.8/279.8 ms.

Other Final Cut software rendering was observed during the visual work; at software-budget start only this budget process remained among matching verifier jobs. These short local measurements do not establish global frame-rate acceptance. Native crossing P95 worsens despite lower medians; software medians worsen in all three fixtures and absolute software cost remains poor. No speedup/no-regression claim and no performance gate closure. The additional static pieces are candidates for later coarser batching after whole-level profiling.

Final source manifest still matches the verified runtime files. Next priorities: broad water surface/depth composition; more authored sediment/material integration; gallery floor/ceiling craft; bunker/range/keeper repetition; optional rather than persistent water coaching; full-route motion and performance acceptance.
