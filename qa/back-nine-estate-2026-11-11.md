# Back Nine: maintained estate composition

## Environment

- Replaced random hedge/rock placement with authored planting islands: 27 hedge obstacles become 15; total obstacle count 111 to 83. All route centerlines, five cart-only gates, three foot passages, relay positions and garage clearances remain unchanged. Rebuilt mower navigation (signature 3095194091, 4,410 nodes); browser confirms the baked graph is used with zero fallback edge checks.
- Six mown fairways, five greens with fringes/cups/flags/tee blocks, subtly scalloped bunker edges, and two irrigation reservoirs outside the playable fence. Reservoirs sit above the boundary terrain; existing trees relocate to dry bank groves without increasing their count.
- Continuous path ribbons with rounded joins replace overlapping slabs. Cart path lighting now uses continuous 24 m main / 30 m branch spacing and deduplication, totaling 166 lanterns including stations and footpath entrances. Shortcuts and narrow passages retain their established ground cues.
- Grounds stores replace most loosely placed trailers on the same solid footprints. The two working trailers carry aligned, secured turf rolls. Service aprons/spurs connect equipment to paths. Most repeated fallen trees become planted strips; two deliberate windfalls and one gouged approach retain signs of violence.
- Fuller boundary turf, irregular tree spacing, low border planting, rounded hedgerow crowns, tidier maintenance yards and terrace furniture. Clubhouse gains stucco over a masonry plinth, facade courses, deep window sills, curtains and entrance detailing. Only two upper/main rooms stay lit, with the entrance still visible; the existing finale lighting dip remains.
- Preserves existing pixel textures, sky/parallax, mist, siren, tension/audio, damage, player controls, Joe's speed/pathing/ram recovery and accessibility settings. No new dynamic lights, particles or frame-update systems.

## Rendering

Turf colors share one static material batch through vertex tints; mown bands are adjacent geometry rather than extra overlapping layers. Scenery remains spatially culled and batched. Static pieces 5,682 to 4,761; material/spatial batches 136 to 126. Software shader count remains 22. Texture count in the inspected scene is 36 versus 37 before.

Eight hardware views: median fenced draw time approximately 6 ms before/after. Visible triangles fall in all sampled final hardware views (roughly 7-22%). These are controlled static views using GPU completion fences and polling, not full-chase FPS or a guarantee against frame spikes. Full reports are output/course-estate/hardware.json and software.json.

Final software comparison: median fenced samples 35.0-42.9 ms after versus 35.0-40.9 ms before. Reservoir view improved 40.9 -> 35.0 ms; green view increased 39.9 -> 42.9 ms. Other changes range from -2.0 to +1.0 ms. P95 remains variable (38-49 ms after). Treat this as mixed, bounded rendering cost with fewer pieces, not a claim that software frame spikes are solved.

## Verification

- Twelve normal-health route/checkpoint completion simulations pass after collision-layout changes.
- Route-choice checks: five cart gaps, three foot gaps, reachable mower detours, seven alternate branches, relay-gated damage, late destruction -> protected ejection -> narrow foot passage -> live garage win, checkpoint retry.
- Hunt/garage, pursuit continuity, vehicle contact, mower retreat and escape windows, and runner-control suites pass. Real-input sightbreak scenario hides the player for 2.87 s and reveals Joe again.
- Hardware and software browser snapshots at 2560x1600; 1280x720 and 844x390 responsive checks. Screenshots inspected for roads, plants, greens, buildings and shoreline. No page/console errors. Installed gameplay client ran two on-foot action bursts; state and presented screenshots inspected.
- Release check passes: 90 scenarios, 67 runtime images / 26 MiB, no failures/warnings. Syntax and whitespace checks pass.

Human follow-up: assess how quickly players recognize the quieter route junctions and service spurs during a live chase, and whether the darker greens/clubhouse remain legible on dim displays. Automated routes demonstrate reachability, not final subjective horror pacing or route preference. Local build only, no deployment.
