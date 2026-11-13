# Final Cut — physical arrival and first-pass demonstration

The all-72-item goal remains active. This pass implements the physical arrival and observable startup, then verifies complete Final Cut routes. It does not certify first-time comprehension, horror, engagement, human listening or finished art.

## Implemented behavior

- Garage and keeper’s sluice now have separate physical corridors, scenery and entrance sounds. Their service walks join a raised championship overlook through a real ramp. The direct entry starts on that overlook. Camera elevation follows the same surface dimensions as the modeled deck and ramps; collision comes from the shared arrival layout.
- Joe waits for each branch entrant to reach the common overlook. The existing single actor walks from the equipment bay, turns toward the rig, climbs its near running board and settles into the cab. The engine starts after boarding. The equipment bay contains no duplicate actor or second occupied pursuit vehicle.
- Observation is unlimited. Boarding does not start a lethal pass. The player uses the final-round control below the overlook to request the demonstration. A physical rail holds the player until the first westbound pass has cleared the opening; its rendered slide and collision position agree. Cutting and furniture destruction happen through the existing live rig sweep.
- Arrival reached/requested/open state and the boarding clock persist. Retry after the demonstration keeps a safe overlook and the earned open passage. Pause freezes Joe along with the encounter.
- Corrected the stone and paving atlas crops, moved the bay sign outside its roof eave, lowered the overlook front wall for visibility, sized entrance signs for portrait layouts and added road/pump/low-ground markers. The distant route composition remains a work in progress.
- Static signs share one atlas and draw batch. Collectible, breakable and changing scoreboard signs remain separate. Added explicit disposal for the atlas resources. Inspection found distant text aliasing with nearest-only minification; restored mipmapped minification while preserving nearest magnification.

## Evidence

- `node tools/verify-final-cut-arrival.mjs`: five groups pass. Covers all three spawns, three-minute safe observation, branch-gated boarding, real Use, 30/60/120 Hz first-pass opening, five sliding-gate collision positions, side fences, pause/reload, continuous boarding path and six complete simulation routes.
- `node tools/verify-final-cut-arrival-browser.cjs`: three uninterrupted Final Cut browser runs from fresh direct/garage/drain entries. Actual Gamepad API axes/buttons feed the normal movement/look/Use handlers; no live-state placement or mutation on these runs. All three crossings, pump, reusable bell, live trap, road and result complete with zero captures. A read-only simulation clone predicts crossing waits, so these are informed automated runs, not novice or physical-controller sessions.
- Browser elapsed simulation time: direct 135.66 s, garage 135.28 s, drain 136.32 s. Separate walking simulation pilots take 125.71/132.61/133.64 s; sprinting takes 77.33/81.69/82.34 s respectively. These compact routes do not yet deliver the proposed 8–12 minute first-clear experience.
- `node tools/verify-final-cut-boarding.cjs`: one actor moves from world to rig parent with a measured 0.000784 m head-position discontinuity. Close front-view captures confirm the seated actor is present. Side-view occlusion by folded wings is real geometry. This does not establish planted feet or finished acting.
- Four-size capture coverage: 2560×1600, 1280×720, 844×390, 390×844 for all three entries, plus overlook, deployment, cleared pass, lure, completion and close boarding views. Final artifacts are in `output/final-cut/arrival/`.
- Regression suites passed during the pass: main rules/seven pilots, mowing, messages, ending simulation, ordinary browser interactions, controls, opening, chapter transition links, ending browser and outcome browser. Existing transition tests start from prior-completion fixtures; they do not play the preceding chapters end to end.
- Installed develop-web-game client is rerun after the final sign rendering change in `output/final-cut/arrival/client-atlas/`. Its short movement bursts supplement the complete route suite.

## Performance remains unresolved

The forced GPU-completion diagnostic samples frozen views after warmup. Each sample includes an animation-frame wait, `advanceTime(0)` and `gl.finish()`. These values are not normal gameplay FPS or sustained acceptance. Hardware is RTX 3090 at 1280×720; software is SwiftShader at 960×540.

The initial arrival scenery profile (`profile.json`) had software medians of 138.1/51.4/70.5/96.2/135.6/137.3 ms for arrival/boarding/reveal/cutting/collapse/fence. Static sign batching (`profile-batched.json`) reduced draws from 132/65/78/97/131/147 to 99/62/71/84/100/106. It did not materially improve timings: software medians 137.8/51.8/71.8/97.5/133.1/136.3 ms, p95 273.7/140.4/141.4/192.8/265.9/267.6 ms. Hardware medians remained about 16.9 ms in this diagnostic. The earlier ending-only software baseline was substantially faster; do not claim this regression is resolved or infer GPU performance from CPU submission counters.

After restoring mipmapped minification, the final sequential profile (`profile-filtered.json`) measured software medians **76.3/36.1/43.5/57.3/74.9/95.2 ms**, p95 **151.0/173.2/79.9/111.8/123.6/163.4 ms**, with an arrival maximum of **1143.5 ms**. Hardware medians were 16.9–17.0 ms. This is a useful improvement over the unfiltered atlas, with unchanged draw counts, but still has severe outliers and is not sustained acceptance. The final signs were inspected with this filtering enabled.

## Remaining work

Finish the whole-problem composition and authored dogleg/second/third crossings; add expressive ball aiming and local supply; complete rig/actor/environment art, boundary acoustics and sound design. Review surface-aware sightlines on the raised deck. Audit the full resource lifecycle and sustained performance independently. Human first-time decisions, perceived fairness, horror, fun, listening and physical input ergonomics remain untested. The broader implementation ledger retains these gaps.
