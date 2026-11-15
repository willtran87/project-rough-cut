# Back Nine: destruction, pursuit, irrigation, ghosts and terrain

Scope: Level 2. The Level 1 bell remains restored; Back Nine has no bells. No commit or deployment.

## Changes

- Thirteen existing low hedge/wood windbreaks join the ten previously destructible course fixtures. Joe alone breaks these barriers. Intact fixtures stop the player; broken ones clear collision, ejection, camera and shove paths. Permanent structures still stop Joe. A simultaneous building/barrier contact preserves the incoming force for destruction without letting the sweep reach through the building.
- Cart pursuit bases are now 39/35/32/12.2 m/s on path/rough/wet/sand; the physical catch-up cap is 44 m/s. Foot pursuit caps are 12.3/11.1 m/s during pressure/ordinary pursuit, with stronger acceleration/turning and quicker close-range replanning. Existing attack warnings, recovery and escape windows remain.
- Three independent seeded irrigation cycles: 30-40 second periods, 10-17 seconds on, variable durations across cycles. Water overlays and spray are visible only during active phases. Both player and Joe use the same active wet-ground state; footsteps use the live surface too. Off phases reveal dry grass/paving and restore its handling. Visible heads sit at the turf edge. Simulation time governs cycling, so pause freezes it and same-seed retry repeats it.
- Six Level 1 ghost sightings reuse a pool of two prepared original ghost models. Back Nine opts into a muted green palette, with head highlights capped to blend into the body. Level 1 retains the default material. Ghosts slowly push their mowers, fade with distance, respect reduced motion, and are atmospheric/non-colliding.
- Fifteen authored turf mounds and drainage hollows, sampled range approximately -0.70 to +1.49 m. Foundations and relay courts remain flat. Ground overlays are clipped to a common one-metre triangular height field to avoid intersecting tessellations. Vehicles pitch/roll with the slope; runner, camera, lights, trees, debris and tracks follow the height field.

## Validation

- `node tools/verify-back-nine-living-course.mjs`: four irrigation seeds, wet/dry surface and grip transitions, independent phases, pause/reset, terrain extrema/slopes/foundations, exact overlay/ground plane agreement. Paired one-second pursuit versus the immediately previous source: cart advance 30.445 -> 34.566 m; foot advance 7.272 -> 8.284 m.
- `node tools/verify-course-destruction.mjs`: all 23 fixtures, player blocking, Joe-only destruction, cleared ejection/camera/shove gaps, one event per object, reset, and a live pursuit drive-through. End barriers are tested from their exposed span; adjacent permanent buildings retain collision.
- `node tools/verify-back-nine.mjs`: 12 driving/relay-stage route scenarios complete. Wet-handling fixture explicitly selects an active irrigation interval; speed bound updated to the new physical cap.
- `node tools/verify-cart-health.mjs`: health, impacts, ejection, wreck blocking, player control and all three on-foot route starts complete with live Joe.
- `node tools/verify-back-nine-terror-navigation.mjs`: 68 baked/fallback routes match, zero runtime edge checks. Baked navigation signature 1799212627.
- `node tools/verify-back-nine-terror.mjs`: prior props/timber/wreck/mouth/reset contracts pass; settled debris is verified relative to the new terrain surface.
- `node tools/verify-back-nine-living-course-browser.cjs`: six sprinkler on/off states, three ghost sites, hillside grounding, intact/broken windbreak, pause and restart. Inspected screenshots at 2560x1600, 1280x720 and 390x844. No browser errors. Resource counts stay at 21 shader programs / 44 textures across state changes.
- Installed gameplay client via `tools/verify-presented-client.mjs`: two input bursts, clean exit; both latest full-page captures inspected. No error files.

Evidence: `output/back-nine-living-course/`. Scoped pre-change source snapshot: `baseline-source/`. The final browser report is `browser/report.json`; simulator report is `physics.json`.

No remaining work for this scoped request. Preserve server port 4187 and concurrent work in other chapters. The unrelated older broad project goal is not marked complete.
