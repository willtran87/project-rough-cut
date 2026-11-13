Under the Green camera and fixture clearance — November 12, 2026

This pass fixes reproduced camera and entrance clipping problems from review items 11, 18, 23, 24 and 27. It does not certify all-space clearance or finish the chapter's art/animation review.

Changes:

- Water nozzles and feed pipes previously projected into legal crouched camera positions. The initial focused audit found 768 near-volume intersections among 4,128 sampled views, distributed across all eight outlets. Moved the mouth from 0.20 m to 0.14 m inside the channel edge and the pipe center from 0.07 m to 0.01 m inside it. Joined the collar to the mouth. The visual jet uses the same mouth coordinates; water rules and crossing widths are unchanged.
- Joe's service entrance had a visible right frame without a matching collision return. Added a 0.2 × 2 m right jamb to the authored obstacle list; its visible masonry uses that exact footprint. Ordinary player input stops at the return and still walks through the opening at 3.84 m/s. Joe's continuous entrance and route tests pass.
- The maintenance-record sign at standing eye height intersected wide camera views near the recess boundary. Raised the sign to 2.2 m and placed its extended supports against the retaining wall. The optional record remains visible and reachable.
- A separate rendered entrance audit found the opening door sweeping through Joe at 0.3 and 0.4 seconds. Reversed its swing so it opens away from him, and extended the visible/collidable left wall return to support the parked leaf. Joe's spawn, arrival timing, path and speed are unchanged. The final 32-state rendered check passes (30 visible mesh poses), including the first post-entry walking frames.

The new reusable QA helper clips actual rendered triangles against the volume between the eye and the near plane. It respects world transforms, hidden ancestors and posed skinned meshes. Cached triangles belong only to that frozen audit pose. It runs through the explicit test hook, never the gameplay frame loop. Existing static axial-ray checks remain useful but are not substitutes for this check.

Verification:

- `tools/verify-camera-clearance.mjs`: eleven synthetic boundaries, including a triangle crossing the volume with all vertices outside, wide-FOV corner clipping, exclusion behind the eye/beyond the near plane, hidden ancestors, transformed geometry, a parented camera and sphere-to-triangle distances. The sphere audit now caches transformed triangles and rejects distant triangle bounds before its exact closest-point test; it remains a QA-only operation.
- `tools/verify-under-green-camera.cjs`: 23,424 environment camera samples and 696 gate/actor samples, with no near-volume intersections. Covers 1.12/1.65 m eye heights, pitch -0.85/0/+0.85, four yaw directions, 85-degree FOV and the widest tested aspect (844/390); gate fractions 0/0.25/0.5/0.75/1 and twelve walk/preparation/sweep/recovery poses. The broad environment grid uses the already-open arrival door, as an ordinarily moving player reaches that doorway after its entrance animation. Actor samples use a 1.9 m surrounding ring; they do not establish every possible melee position.
- Real keyboard checks: crouching into a nozzle bank stops at x=-2.7; walking into the new jamb stops before its face; walking through the opening advances 1.92 m in 0.5 s. Camera checks also pass at these resulting positions.
- Sixteen scene captures cover 2560×1600, 1280×720, 844×390 and 390×844. Inspected wide desktop and compact views of the nozzle, record and controls. Captures use the actual 85-degree setting. No page errors reported.
- Core simulation, encounter and navigation suites pass: fresh/checkpoint completions, optional evidence, pressure variants, arrival continuity, water recovery, wet/dry alternatives and 48 enemy arrival-phase scenarios.
- Existing physical tool-clearance suite passes 1,296 sampled placements and 11,569 route frames. These are physical-model samples, distinct from rendered triangle checks.
- Required standard Playwright client passes two iterations. Inspected its latest screenshot and text state: ready, playing, movement 3.84 m/s. Its canvas-only capture omits the DOM HUD; the four-viewport full-page captures include it.

Evidence: `output/under-green/camera/baseline.json`, `browser.json`, `arrival-baseline.json`, `arrival.json`, the named PNG captures and `standard-client/`.

Limits: sampled poses do not prove every camera trajectory, intermediate stance/bob state, actor contact or visual effect. Water spray intentionally passes through space and is not treated as solid scenery. This is desktop browser evidence, not physical-phone or human-playtest acceptance. Broader district art, dynamic presentation, shared preference integration and experience validation remain open in the full implementation ledger.
