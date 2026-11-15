# Under the Green visual pass102: reclaimed gallery paving

Local progress on broad floor composition and material variation within the full53 requirements and48 refinements. No whole-level gate or item is promoted by this pass.

## Change

The entrance-to-first-crossing gallery uses mixed flagstone courses instead of equal-depth slab rows:1.52m,0.88m and1.37m depths with varied1.48–2.16m widths and independent offsets. Narrower clay-filled joints reduce the heavy regular grid. Selected flags have a split face with a restrained mineral rim; direction, origin and bend vary by stone. Existing illustrated grain, pigment variation, mud fans, runoff, historical wear and flood response remain.

The new layout spans course coordinates y4.64–19.72, x±5.1, with ends aligned to the original mortar seams. Other districts retain their paving. This is material work on the original floor, not raised geometry or an added obstacle. No new texture, material, light, geometry or render pass. No changes to movement, E/Q, pursuit, hazards, banners or entrance-only retries.

The initial candidate had repeated diagonal splits. Its preview and first native/software comparisons are superseded artistically. The final candidate varies the direction and bend without adding a noise lookup. Source snapshots and revision records distinguish the two candidates.

## Verification scope

`tools/verify-under-green-gallery-paving.cjs` compares the original and candidate ground modules through routed browser loads. It captures the gallery from front/rear/close views and both boundary seams, plus pump/keeper/range/bunker controls; four flood times;2560x1600,1280x720,390x844 and844x390; crouch/rear/reduced motion. Player state, actual resolution, lights, draws, triangles, texture counts and program counts must match. Other district control pictures must be raw-pixel identical. Camera-return pictures must match exactly; pause must freeze simulation.

The original deposit-map generator is text-identical. Geometry and gameplay modules are unchanged. Consequently this pass does not repeat the earlier geometry/scythe-clearance suite or claim new whole-route motion acceptance. Existing scene opacity and collision behavior are preserved through unchanged geometry, not established anew by a narrow floor screenshot.

Timing uses GPU completion fences, four warm pairs and24 alternating samples at three fixed views. These are local comparisons on a shared machine, not sustained frame-rate or whole-level performance qualification.

Final renderer reports, visual inspection and installed gameplay-client outcome are recorded below after completion.

## Next acceptance work

Run a current whole-level acceptance audit against all53 explicit criteria and the seven gates before choosing another cosmetic pass. Use fresh matched Level1 close/middle/distant views with actual render sizes, full Under the Green district and prop review, and actor/motion/hazard/accessibility evidence. The saved Level1 service-maze still was inspected here as an art reference; it is not a fresh matched benchmark.

Preflight: `verify-under-green-visual-upgrade.cjs` checks selected metadata/views and cannot prove the entire scope. `profile-under-green-route-views.cjs` contains an obsolete scene return marker and must be refreshed before reuse. Do not treat historical verifier success as current full acceptance. The broader gallery ceiling/wall composition, district framing and whole-level performance remain unresolved until the audit provides stronger evidence.

## Final renderer evidence

Final native and software comparisons each passed38views,16paired images, resource/player-state parity, exact control pictures, camera return, pause and reduced-motion checks. No page/console errors. Native renders2560x1600; software uses its960x600 cap at that viewport, with smaller layouts reported separately. The screenshot dimensions alone are not a native-detail claim. Inspected final native/software floor and compact views, native seam/flood/approach views, and the saved Level1 reference.

| Renderer/view | Median before → after (ms) | p95 before → after (ms) |
| --- | --- | --- |
| hardware/approach | 27.2 → 25.2 | 29.5 → 27.5 |
| hardware/floor | 25.8 → 25.6 | 27.5 → 27.2 |
| hardware/crossing | 21.5 → 19.7 | 23.5 → 22.4 |
| software/approach | 212.6 → 212.4 | 222.2 → 217.5 |
| software/floor | 173.6 → 173.6 | 182.4 → 182.0 |
| software/crossing | 196.3 → 195.3 | 209.1 → 222.6 |

The final local medians stay near or below baseline. No speedup is claimed for an art change; absolute software frame cost remains poor and the whole-level performance gate remains pending. Final reports live in `final-hardware` and `final-software`; earlier `hardware`/`software` reports belong to the superseded fracture design.

The final ground module was copied byte-for-byte from the verified candidate. The deposit-map generator is unchanged. Source hashes are recorded in `final-source-manifest.json`.

Installed gameplay client:8bursts, terminal0, ready/playing at(0,9.096),checkpoint0, no error artifacts; finalshot7 inspected. Initial5second Preparing-button click timed out, later menu input recovered. Source hashes rechecked after all retained tests. All owned102processes are terminal.

Storage maintenance: losslessly archived the previous pass100/101 packed deposit masks with SHA256 verification before removing original binaries, preserving evidence and avoiding redundant raw4MiB files. No unrelated artifacts removed.
