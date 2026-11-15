# Back Nine experience pass 14 — composed playing surfaces and readable lanes

Previous goal turn made implementation and verification progress. This pass advances the full course-composition requirement instead of treating a narrow rendering optimization as completion. Full 38-item scope remains active; no subagents or human testing.

## Implemented

- Six individually authored fairway axes now have widening landing areas, narrower approaches and paired tee/green endpoints. Their static vertex-tinted mowing strips reuse the original pixel-art ground texture and existing material batches.
- All six tees sit off the cart lanes and outside bunker/wet hazards. Rotated tee beds/markers follow each hole's direction; six narrow mown walks connect them to the actual path network. These are ordinary turf, not additional fast routes or fenced dead ends.
- Corrected the twelfth tee occupying a driving path, the fifteenth tee lying inside a bunker, and the eighteenth green overlapping the irrigation cabinet. Final-green placement was refined again after visual review showed a service lane cutting its interior. Its actual scalloped putting outline now clears all cart lanes.
- Four maintenance courts use rounded rectangular compacted-gravel surfaces, with their existing drainage and stone corner details. This gives the service buildings/equipment a coherent working area rather than unrelated turf ellipses.
- Fixed an independently reproduced visual/handling mismatch: three sampled points on the fast west maintenance lane rendered as sand. The compacted lane shoulders and wheel tracks now sit above bunker sand, while genuine wet overlays remain above them. Shoulders express the movement model's existing six-metre corridor, including on narrower-looking maintenance lanes.
- Bunker banks are cut back at actual route crossings. Thirty-seven shallow timber edge segments explain maintained paths beside sand. They stay outside the fast-lane interior, open at joining routes and flooded areas, and top out at 6.85 cm; they are traversable trim, not new barriers.
- No obstacle footprints, speed/surface rules, Joe behavior, route graph, vehicle models, controls, music, lighting settings or lantern count changed. The initial 90 lanterns remain 90. No new texture, material family, light or frame update loop. Current scene/landscape import-map tag: `20261112-course-layout-2`.

## Verification

Artifacts: `output/back-nine-experience/course-layout/`. The source before this pass remains under its `baseline-source/`, separate from the unchanged whole-goal baseline.

- `verify-course-layout.mjs`: six matching tee/approach/green pairs; sampled full tee footprints clear solids and hazards; all tees outside the fast lanes; no equipment centre in a putting green; actual scalloped green outlines clear cart lanes; 617 mown-walk centreline samples clear foot collision; playing turf remains inside ±40 m; finite geometry; bank triangles clear the fast lanes; shallow retaining edges. Building the art leaves the authoritative COURSE object unchanged.
- Navigation signature remains **2693326411**, with its existing bake and zero fallback edge checks. `verify-fairway-navigation.mjs` compares 68 exact routes against independent live-clearance routing. Existing choices tests verify five cart gaps, three foot gaps, physical mower detours, seven driving branches and protected late destruction followed by on-foot victory.
- `verify-back-nine.mjs`: eight groups pass, including controls, boundaries, pause, surface handling, clubhouse routing, sensory knowledge, capture/retry and twelve full route completions. Four finish with the cart and eight on foot; live Joe is retained. Copied final result to `routes.json` in this pass's artifact directory.
- `verify-course-layout-browser.cjs`, hardware and SwiftShader: ten driving-camera locations across the course at 2560x1600; ordinary/compact service views at 1280x720 and 844x390. Representative before/after high-resolution images, tee/green views and final ordinary/compact images inspected.
- Actual scene ray hits at (-27,464),(-27,474),(-23,482) were sand in the baseline while `surfaceAt` reported path. Final visible surfaces are pathEdge,pathEdge,track. Adjacent (-28,454) remains wet and (-19,470) remains sand, matching physics. These are representative rendered checks, not a claim that every pixel of every route has been classified.
- No late buffer allocations, new programs/textures or browser errors across the tour. Hardware stays at 20 programs, software at 25, both 38 textures. Static batch count remains 134. Preparation remains 19 buffer batches (maximum 1,778,880 bytes) and 23 texture batches (maximum 8,391,211 bytes / four textures), matching the baseline.
- Installed standard gameplay client runs the repaired lane with actual input and live Joe. Cart advances from (-28,455) on wet turf to approximately (-27.762,463.077) on the visible cart path, 100 health; Joe physically advances and prepares a ram. No ordinary banner chatter or errors. The 960x540 presented image and state were inspected. Final import-map version was also loaded through this client.

## Performance evidence and limits

Fixed 960x540 software rendering, paired ABBA blocks, 96 moving samples per version, GPU-fenced completion; no overlapping owned browser benchmark:

| View | Before median / p95 ms | After median / p95 ms |
| --- | --- | --- |
| First fairway | 38.0 / 44.0 | 37.9 / 43.0 |
| Pump court | 39.9 / 43.9 | 38.9 / 43.9 |
| Bunker lane | 40.0 / 42.9 | 39.0 / 43.0 |
| Foliage / visible mower | 49.1 / 71.9 | 48.0 / 52.9 |
| Final green / clubhouse | 56.8 / 68.8 | 57.9 / 62.0 |

The first four views were measured before the final isolated eighteenth-green placement adjustment; the clubhouse view was measured afterward. Draw-count ranges are unchanged in all five comparisons. Triangle differences are small (roughly -134 to +168 in the first four views, -20 to -10 at the clubhouse), with no runtime buffers allocated. These results do not prove a general speedup or fix the earlier software frame spikes; the last view's median is 1.1 ms higher. Keep the broader performance requirement open.

## Remaining work

This implements a coherent course-surface pass with direct visual and route evidence. Continue the unfinished encounter/route-readability, audio, restrained supernatural, connected storytelling, controlled variation, broader animation/retry and performance requirements. Human feel/comprehension/listening tests remain prepared for later, not conducted. Full-goal completion is unproven.
