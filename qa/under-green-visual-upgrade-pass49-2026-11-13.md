# Under the Green pass 49 — embedded root junctions

V15 is locally implemented. The full 53-item objective and all seven whole-level gates remain open. The preceding review-only turn did not advance implementation; this turn completes verification and records the runtime work already present in the worktree.

## Runtime changes

Six authored root compositions now have buried main-root ends; five returning roots are also buried. The first 16% of each affected curve transitions from inside the actual wall into the existing cross-section. Vertex counts and all positions beyond that transition remain unchanged. Contact shade fades with emergence rather than leaving a halo around the buried part.

Each main entry uses seven closed, fractured masonry fragments, two tapered mortar cracks and existing soil pockets. These replace six simple boxes per entry. Fragment backs sit in the actual receiving surface. The bunker entry uses the recessed upper earth face and its true 4.94m top; shared dimensions preserve the pre-existing enclosure geometry. Existing materials, image maps, practical lights, routes and controls are retained.

## Final evidence

Artifacts live under `output/under-green/visual-upgrade-local/`.

- `pass49-accepted/{hardware,software}`: 45 captures per renderer, including 18 before and 18 after close/middle/oblique views across all six entries, six responsive views, flood, Q and Reduced Motion. Viewports: 2560x1600, 1280x720, 390x844 and 844x390. Each renderer passes 6,912 camera poses and 336 actual fragment-back masonry/earth support samples; zero recorded errors. Actual pause freezes time, and a camera-turn sequence returns to identical pixels.
- Inspected final native entrance, bunker, crossing, junction, pump and keeper views; software keeper and portrait entrance views. Software screenshots are not proof of native scene resolution. The broad Level 1 comparison remains open.
- `tools/verify-under-green-root-entries.mjs`: 42 closed fragments / 1,848 fragment triangles; 22 root builds over two quality paths, 209 buried first-ring vertices and 3,267 unchanged later vertices. Fragment winding, positive volume, nondegenerate faces and unit normals pass. `tools/verify-under-green-root-geometry.mjs` additionally passes 138 roots / 15,933 vertices, 32 collars, 1,869 seams and 423 pillar vertices. Both pure audits rerun on the current source.
- `pass49-contact`: ten images, 237 surface rays and 69,925 positive-alpha root-shade vertices supported by 6,276 actual masonry triangles, with no unsupported samples. Contact shade only darkens; foot contact, flood and pause checks pass. Timing was intentionally skipped here and measured separately.
- `pass49-route`: 1,379 route frames and 106 actual skinned-body/scythe geometry audits; no recorded intersections/errors. This is a sampled route test, not exhaustive whole-level clearance acceptance.
- `pass49-client`: seven installed-client input bursts, terminal exit 0. Final shot6/state6 inspected: playing at (0,13.064), gallery and first crossing visible. Initial Preparing-button timeout recovered through the action sequence; no error artifacts. No claim of a full human playthrough.

## Rejected intermediate evidence

The first candidate moved control points too deeply behind the wall and generated invalid normals; it was replaced with the bounded buried-section deformation. A preliminary support audit incorrectly allowed other roots as receivers. Restricting receivers to real masonry/earth exposed 15 unsupported bunker fragment corners above the bank. Shared bank bounds and the fragment-height clamp fix those misses. `pass49-accepted` is the final visual source; candidate/refined/final folders are intermediate, not acceptance evidence.

## Cost and limitations

Authored geometry grows by 1,512 triangles: 1,416 from replacing boxes with fractured fragments and 96 from cracks. No new image maps or lights. Across the 18 matched native visual views, three views submit one additional draw; others retain their counts. Frustum bounds make submitted triangle changes view-dependent.

The isolated budget run uses six warm frames and 24 alternating GPU-fenced samples per view, hardware then software after all other owned render jobs finish. Before routes the saved original root-composition source; new optional geometry behavior defaults off for that source. This is a local rendering diagnostic, not ordinary gameplay FPS acceptance.

| Renderer / view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| Native entrance | 9.2 / 11.3 | 9.3 / 10.8 |
| Native bunker | 8.1 / 9.4 | 7.8 / 9.6 |
| Native keeper | 7.5 / 10.1 | 8.2 / 9.6 |
| Software entrance | 75.4 / 79.1 | 74.4 / 92.0 |
| Software bunker | 63.1 / 74.2 | 62.6 / 78.5 |
| Software keeper | 62.4 / 72.3 | 62.5 / 79.3 |

Budget fixtures retain draw/map/program counts. Native resolution is 2560x1600; software is 960x600. Software P95 regresses in all three fixtures and absolute cost remains unqualified. Small median changes do not establish a performance improvement. Full material cohesion, route composition, lighting, water craft, illustration matching, camera finishing and all release gates remain in scope.

Source and harness hashes are retained in `pass49-source/final-hashes.json`. All owned pass49 jobs are terminal; server 4187 is retained. No agents, commit, deployment or artifact deletion.
