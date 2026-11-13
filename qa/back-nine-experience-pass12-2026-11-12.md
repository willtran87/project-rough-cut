# Back Nine experience pass 12 — approaching beacon and moving cover shadows

Full 38-item goal remains active. Previous goal turn made verified progress. This pass advances physical lighting; it does **not** close the performance requirement or claim all atmosphere work is complete. No subagents or human testers.

## Implemented behavior

- Joe's existing 40 m point beacon now casts shadows from substantial authored opaque course geometry. Removed the unrelated global .55 brightness multiplier based on whether Joe sees the player. Cover blocks the source locally; exposed scenery remains lit.
- Added a fixed six-face 128 px BasicShadowMap with one nearest lookup. Shadow geometry has 983 pieces / 13,844 source triangles, restricted to nearby cover in one merged batch. The finite-volume index compactor retains two metres of padding between one-metre updates. Current cover test submits 768 nearby triangles per face, not the whole course.
- Decorative trim/tubes and painted needle cards do not enter the shadow pass. Dense rounded foliage uses interior octahedra, not oversized rectangular walls. Static cover is independent of the gameplay camera's visibility indices, so looking away cannot remove a blocker. Detailed actors/vehicles are receivers, not resubmitted as shadow casters. The moving garage shutter is an actual caster and invalidates the cached depth when it moves.
- Light movement/retry/shutter movement refresh shadows; stationary intensity pulses do not. A zero-intensity distant beacon skips the shadow update. The source remains physical in reduced-motion mode; optional pulses stop, not the visibility warning.
- Beacon power is three times its former value (315–600 normal, 315 steady), with the same 40 m cutoff and slow 1.6 s cycle. This makes approaching red light visible on service surfaces rather than disappearing below their night shading. It does not change pursuit speed, damage, collisions or controls.
- Bounded preparation now uploads shadow-only layer geometry too, avoiding 56 late buffer allocations seen in the first candidate. Temporary preparation-light shadow targets are disposed. Main shadow resources warm before control. Shader optimization skips a Lambert cube lookup only when its direct diffuse contribution is zero. Dormant material variants are included before use, preventing a first-view shader compilation observed in an incomplete candidate.

## Verification and evidence

Artifacts: `output/back-nine-experience/beacon/`; pre-pass scene/html and pre-optimization pine/light-culling modules retained under `baseline-source/`.

- `verify-chase-beacon.mjs`: 306 light-to-ground rays compare the shadow proxy with independent visible-wall intersections, including open ends and distant relocations. Stationary pulses do not rebuild; moved shutter, retry and a reactivated light do. This is representative geometry evidence, not a complete course visual audit.
- `verify-chase-beacon-browser.cjs`: hardware and SwiftShader, cover/emergence/garage/on-foot views at 2560x1600,1280x720,844x390. Screenshots inspected. A sampled road pixel behind the windbreak is RGB(5,16,16), exactly matching the beacon-off reference. Disabling shadow occlusion gives (10,16,16); moving Joe onto the exposed side gives (102,12,20). A rear glance and return preserve the result. This verifies an actual rendered effect, not just a setting or reported shadow count.
- Four flash/reduced-motion combinations retain the steady warning when requested. No new runtime buffer allocations, shader programs, textures or console errors over the scenario sequence. Final resource counts are 20 hardware / 25 software programs and 38 textures: two programs and two shadow textures above the previous pass, allocated during loading.
- The initial pixel fixture sampled terrain whose minimum shading masked weak distant red light; the final independent road hit is retained in the diagnostic JSON. The fixture also now resets the camera between distant staged areas. Do not describe the discarded samples as a rendering failure or successful occlusion evidence.
- Installed standard client, final `client-live/`: real accelerate/steer/brake inputs, live Joe, no grace override. Cart ends (-12.762,433.077),100health; Joe moves to(-22.658,436.473),search mode,7plans;25 shadow updates, no error artifacts. Page/canvas/state inspected. Earlier `client/` held Joe under grace and is only a controls/cache check.
- Existing local-light culling and bounded course-preparation tests pass. Choices/gaps/late-ejection/foot victory/retry and chase-drama tests pass. No simulation or navigation data changed.

## Performance remains unresolved

Final completed-GPU ABBA,960x540 SwiftShader,96 samples/version/view. These are not displayed-frame FPS or a sustained device playtest:

| View | Median baseline → new | p95 baseline → new |
|---|---|---|
| Pump | 28.9 → 34.9 ms | 34.7 → 49.0 ms |
| Range | 28.0 → 32.8 ms | 32.7 → 36.9 ms |
| Club | 33.9 → 39.9 ms | 39.1 → 44.9 ms |
| Foliage/mower | 40.9 → 46.0 ms | 45.0 → 50.9 ms |

No runtime buffer allocations. Six extra shadow draws normally, more near the shutter. Initial unrestricted copies added about20ms in one paired foliage sample; merging/culling simplified cover cut that cost. Nevertheless the current roughly5–6ms overhead is real and **not accepted as satisfying performance preservation**. A64px candidate did not improve measured timing and was rejected; retain128px. The standard live client also reached its existing640x360 adaptive tier during the action burst; this is not a successful image-quality/performance acceptance result. Compare the same live scenario against baseline before attributing the entire tier change to this feature.

Next work should reduce the remaining software cost while retaining actual occlusion/moving shadows and the stronger warning. Do not quietly remove the effect or call it finished from functional tests alone. Broader real-course cover/edge cases, sustained motion/comfort assessment and the remaining full-scope ledger work stay open. Human listening/visibility/balance testing remains prepared for later.
