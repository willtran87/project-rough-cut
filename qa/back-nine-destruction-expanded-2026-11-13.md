# Back Nine expanded destruction — November 13

Joe can now drive through ten additional existing course fixtures: three parked carts, the turf trailer, the fallen log by the clubhouse, and five low planting beds. This extends the existing timber-barrier, maintenance-supply and player-wreck destruction.

Intact fixtures stop both player forms. Only Joe's swept mower contact breaks them; they collapse into three spreading, crushed sections and the opening becomes usable by the player. Destruction resets per attempt. Permanent buildings, irrigation basins and escape-gate structures retain collision.

Removed these destructible fixtures from Joe's permanent navigation grid and rebuilt the bake. Runtime player collision, impact shoves, ejection clearance and runner camera sweeps still respect each fixture until Joe breaks it. The detailed original models remain visible before impact; destruction uses prebuilt material batches and simulation-time animation without spawning geometry or textures.

Verification:

- `verify-course-destruction.mjs`: all ten fixtures block player/cart impacts and ejection/camera sweeps while intact; only Joe breaks them; the resulting gaps clear every relevant query; impacts are emitted once; fresh attempts reset. Actual Joe pursuit chooses a direct path through a parked cart, destroys it and drives past it.
- `verify-back-nine.mjs`: all 12 driving route/stage scenarios complete with live Joe.
- `verify-cart-health.mjs`: all three on-foot route fixtures complete, plus health/ejection/collision checks.
- `verify-back-nine-terror-navigation.mjs`: 68 current baked/fallback routes match, no runtime edge checks; pursuit comparison passes. New navigation signature: 987439228.
- Existing eight destruction/wreck/debris checks pass.
- `verify-course-destruction-browser.cjs`: intact/crushed views for parked cart, trailer, log and planter; pause/reset, no shader or texture growth during destruction, no console errors. Inspected 2560x1600, 1280x720 and 390x844.
- Installed gameplay client final driving/turning/braking bursts pass; screenshots and text state saved. No overall frame-rate improvement is claimed.

Evidence: `output/back-nine-destruction-expanded/`. No commit/deployment, no agents, no change to Level 1 or its restored bell.
