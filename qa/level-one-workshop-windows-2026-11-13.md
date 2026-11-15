# Level 1 workshop windows — partial comprehensive upgrade

Previous goal turn made progress through distinct material maps. This pass addresses V07.4 selective interiors and the service buildings' flat emissive panes. Full V01–V21 scope stays active.

## Change

The clubhouse already had51 perspective room apertures; those retain the existing design. The service building and maintenance shed now each have a separate workshop aperture. The interior contains timber wall lining, two shelves with cans, hanging hand tools, a bench with legs, abandoned paper and a closed tool case. Ray/box intersections produce parallax and mutual occlusion. Furniture faces receive distinct shading; world-attached timber fibres and a192samples/metre aperture grid preserve the pixel idiom. Dust stays at the glass edges. The first brighter, flat-furniture candidate was refined and dimmed before final checks.

Four narrow jamb returns per window supply physical recess thickness. Existing real window mullions remain. The room is a scenery shader behind the fixed aperture; it does not add a navigable room or change collision. It adds no lights or image textures and does not change ambient light or lantern placement. Each workshop is a two-triangle aperture; normal static batching handles the added jambs.

Changed files: `web/clubhouse-windows.js`, `web/pixel-buildings.js`, `web/pixel-world-props.js`. Workshop resources join the building lifecycle and are disposed before scene teardown. The factory's default behavior remains clubhouse rooms.

## Evidence

`tools/verify-workshop-windows.cjs` routes the saved before source when requested. Baselines are the two original modules in `output/level-one-workshop-windows/baseline-source`. Final artifacts are in `after` and `after-software`.

- Eight high-resolution views cover front, left, right and approach for both windows. Actual native2492x1402 inside2560x1600; software960x540 during the visual suite.1280x720 and390x844 gameplay views also captured/inspected.
- Real D-key traversal moved from(-101.3455,232)to(-101.3455,244) on native; pause, reduced motion and camera turning preserve all aperture anchors. Both renderer suites passed without browser errors.
- Scene contains exactly two workshop quads of.95m virtual depth and the existing204-vertex clubhouse batch (51windows).28lanterns and ambient.005 remain.
- Actual scene reset detaches and disposes both workshop resources and the clubhouse resource exactly once, then creates one clubhouse batch and two replacement workshops. Warm memory/program counts remain stable through20camera updates.
- Native matched views submit one fewer draw, with74additional triangles in most views and112 in the maintenance-left view. These are observed total-scene deltas including static batching/shadow passes. Texture count104→103, geometries941unchanged, programs80→81 in the sampled warm native scene. Software final resources720geometries/104textures/90programs.
- Close native service-window median9.9→9.9ms;5m approach11.3→9.7ms.24post-warm samples per fixture, CPU submission through GPU fence with2ms polling. Small observed timing changes are not whole-level performance guarantees.
- Initial software budget runs adapted resolution mid-sample, so they are not fixed-resolution comparisons. Final budget reruns use a test-only fixed.75scale route, without changing production adaptation. Their receipt is appended after completion.

The new rooms improve selected interiors; whole-level architecture, local exterior bounce, material parity, terrain and extended-play performance are still open. In particular, exterior walls remain deliberately dark under the current lighting, and this pass does not claim that all fixtures/contact shadows have met the final bar.

## Final receipt

- Fixed software960x540 comparison: near median172.1→159.9ms,p95248.2→173.4; approach median121.3→122.3ms,p95161.5→176.5. Runs were sequential with no other owned GPU job. These slow baseline/after values leave the broader software-performance gate unmet. No claim that the new room accelerates rendering; measurements vary.
- Existing `verify-clubhouse-windows.cjs` terminal PASS:51windows, room/flat comparison, three route views, actual keyboard traversal, pause/reduced motion,2560/1280/844/390 layouts, stable warmed resources, scene rebuild and idempotent disposal. Inspected its final native crossing screenshot.
- Installed skill client terminal exit0; inspected screenshot/state remain`opening_story`, no error artifact. Actual gameplay evidence comes from the focused workshop and clubhouse suites, not this prologue capture.
- Four final source/test hashes saved to `output/level-one-workshop-windows/source-hashes.json`. All owned processes terminal; server4187 retained. No agents, commits or deployment. Full visual goal remains active.
