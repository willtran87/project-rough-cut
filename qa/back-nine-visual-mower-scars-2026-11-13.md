# Back Nine terrain scars — partial BV07

The full 48-item objective remains active. This pass improves persistent mower damage, but does not close BV07: exposed-soil artwork, more varied deposited clippings, and broader route/lighting acceptance remain. BV43 and BV48 also remain in progress.

## Implementation

- `back-nine-mower-scars.js` replaces the Back Nine scene's legacy 24 flat instanced stamps. The old module is retained for its other consumers/tests.
- A fixed pool of 256 segments in eight spatially culled batches retains approximately 248–282 metres of successfully marked travel. Batches recycle 32 oldest segments together; this is bounded recent history, not permanent whole-run storage.
- Each segment has 123 vertices and 136 triangles. Positions and normals sample the common terrain field, with world-anchored turf UVs. Cut turf, two wheel lanes, eight diagonal tread details and four settled clipping fragments share the existing grass map and one material. No new texture or simulation state.
- RGBA vertex colors soften outer boundaries and the start of a trail. Wet wheel lanes are darker at creation; underlying flooded turf remains visible through the cut. Wet marks remain dark after the irrigation turns off. This pass does not model gradual drying of the marks themselves.
- Sampling follows actual travel at 1.1 m intervals, interpolating heading through turns. The same authoritative cutting condition controls the dropping center deck and these scars. Pauses, inactive decks, fresh runs, time rewinds and large teleports cannot bridge untouched ground.
- Full footprint checks reject paved routes, sand, relay/garage floors and course boundaries. An additional dense footprint check excludes narrow inset footways. No collision, AI, speed, or navigation edits.
- The first capture exposed an excessively black strip: mown turf lacked the surrounding ground's albedo-preserving moonlight floor. The mown material now uses that same turf response, without the untouched-grass flood mask. Other material cases retain their previous behavior.

## Evidence

Evidence root: `output/back-nine-visual-upgrade/scars`, a junction to `D:/CodexArtifacts/project-rough-cut/visual-upgrade/scars-20261113`. Generated test files were written there directly to preserve C: space.

- `node tools/verify-back-nine-mower-scars.mjs` passes. Tests actual vertex winding, finite/unit normals, triangle interior and edge clearance over the sloping route, stationary/pause/resume/teleport behavior, excluded surfaces, wet marks, identical stamp counts at 30/120 Hz, fixed buffer identity across 660 emitted marks, bounded recycling, retry and disposal. 6,120 sampled triangles; clearance 0.0544–0.0693 m above the common terrain field. This route check does not prove every possible course slope/heading combination.
- `node tools/verify-back-nine-ground-art.mjs` passes (1,737 parts). Outputs retained in `rules.json` and `ground.json`.
- `node tools/verify-back-nine-mower-scars.cjs output/back-nine-visual-upgrade/scars/native-accepted` passes. Native 2560×1600 viewport/2560×1440 scene, followed by 1280×720 and 390×844. The harness positions a real gameplay camera and directly replays mower poses through the production scar update for controlled dry curves, a hill, side views, active irrigation and actual off-cycle drainage. These are controlled art views, not an autonomous whole-course playthrough.
- Equivalent `.../software --software` passes. Both browser suites verify pause, reduced motion, resource stability and restart to briefing at the shed (checkpoint 0, cart 0,14), with zero page/console errors. Native 29 programs/51 textures; software 35/51, stable across tested views. One additional shader variant versus the storm pass; no extra map.
- Installed standard gameplay client, via `verify-presented-client.mjs --back-nine --mower-scars --high-resolution`, two action bursts with `tools/fixtures/back-nine-mower-scars.json`, native and software. The adapter adds the existing Q rear-glance key to the installed client's key table; gameplay code is unchanged. Fixture seeds the encounter, then actual forward/turn/glance input drives the simulation. Both end with player (25.6567,91.6420), Joe charging and 20 emitted trail segments. Both screenshot/state pairs exist, no error artifacts. Native remains 2560×1440, final average 13.31 ms/p95 19.0 ms. Software remains 640×360, 78.72 ms/p95 102.2 ms. These short samples do not prove combined-load performance or regression-free timings.
- Actual images inspected: native accepted dry forward, dry side (earlier opaque-boundary iteration), drained ground, 1280 and 390; software dry view; native and software standard-client rear-glance screenshots. The native trail now blends into the surrounding turf and its two wheel lanes are legible on the hill. Small clipping pieces and soil detail still need artistic refinement. Portrait HUD still obscures much of the letterboxed scene, and software loses fine detail.

## Test failures / limitations retained

- First geometry test caught inverted triangles where the irregular outside edge crossed the next vertex column. The edge variation is now constrained outside that column; final geometry tests pass.
- First browser run expected the obsolete mode name `shed`. Current `createRun` returns `briefing`; the final assertion checks both that authoritative mode and the original shed coordinates/checkpoint.
- A cache-version string edit briefly produced an invalid import-map URL. That run was terminated, the map repaired, and all accepted suites ran afterward. `native` and `native-final` are intermediate captures; final visual evidence is `native-accepted`.
- `node tools/verify-chase-barriers.mjs` fails at line 21: `Barrier 0 foot=false dir=-1 cannot be pushed`. This occurs in its simulation crossing loop before constructing its legacy mower-track renderer; it imports none of the changed visual modules. No simulation/barrier files were changed in this pass, and this suite is not claimed green.
- All owned browser jobs are terminal. Server 4187 retained. No agents, commit, deployment or whole-goal completion claim.

Next: improve exposed soil and clipping silhouettes, then continue terrain transitions, scene density/stories, contact shadows, ghosts/actor motion, camera/UI and software combined-load fidelity. Keep all 48 requirements intact.
