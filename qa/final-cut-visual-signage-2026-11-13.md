# Final Cut estate signage and focal hierarchy

The previous goal turn made verified progress on static scenery rendering. This pass advances FV34 within the complete 72-item visual upgrade. It does not establish whole-level Level1 parity or complete the remaining performance, character, environment, story or interface work.

## Changes

- `web/final-cut-sign-art.js` paints sign lettering on a discrete source grid with integer enlargement, fitting each line without horizontal stretching. Refuge/receipt boards use estate serif lettering; directions retain condensed practical labels; hazard plates have an ochre side stripe; the collectible load-limit notice has paper and ink treatment with an attached spring clip.
- Restrained chips and broken pinstripes stay at the rim. The central message remains undamaged. Static signs share a single atlas and draw, now with real normals and Lambert lighting/shadows plus a small readability floor. Mutable signs use the same treatment and remain attached to their actual parents.
- The distant scoreboard face changes from16.5×4.5m to12.4×3.1m,48.2% less area. Its backing, poles and lamp brackets follow the smaller assembly. The nearby receipt board retains its size and complete campaign text, including all five lines.
- The elevated duplicate pump board is removed; the eave label now says PUMP / BYPASS. Important fork, bank, swale, bell, exit and control directions remain.
- Sponsor boards move ahead of their support poles; the previous center-pole lettering occlusion is fixed. The fork post now reaches the plate and remains behind its face, within the existing collision envelope.
- The scene-root collectible sign now registers its original texture and front/back materials for disposal when it bypasses the static atlas. Previously that mutable exception missed the cleanup list.

## Evidence inspected

- Native baseline34026 passed after correcting the test to warm offscreen assets before measuring resource stability. Final refreshed baseline18828 and production hardware75423 each pass21 compositions, including2560×1600 and1920×1080,1280×720,844×390,390×844 layouts. Software29387 passes the same21 compositions at its actual render sizes.
- Reviewed dark/lit overlooks, pump identity, bank portrait, scoreboard, fork, full receipt, sponsor and record close-up captures. Original/current views are paired in `output/final-cut/signage/comparison.html`.
- Text-layout bounds fit every generated line; exactly one static PUMP / BYPASS label remains. Both mutable boards retain the complete five-line receipt. Actual Enter does not collect the record; E does, and the physical record/clip disappears. Actual pause preserves screenshot pixels exactly.
- Mounting audit passes441 rays across text rows, from straight ahead and±45degrees, against nearby physical scenery and sign supports. No structural piece blocks the sampled lettering. The first diagnostic incorrectly included the invisible alternate scoreboard; correcting the test to honor ancestor visibility removes that false failure.
- Full routes81198 pass three uninterrupted direct/garage/drain finales, four heard ball redirects, bank/open crossings, pump/bell/collapse/road, and zero captures/errors.77 screenshots retained.
- Sightlines71544 pass all48 hidden-Joe versus removed-Joe image comparisons, across the cardinal approaches. Sign lighting does not disclose the concealed machine.
- Disposal test passes actual GL texture lifetime for record, scoreboard, receipt board and ending board. All four maps are uploaded/live before world disposal and deleted afterwards; each texture/front/back material emits exactly one disposal event.
- Warmed resources remain139geometries and60hardware/57software textures. The lettering uses the existing atlas/maps; no new raster asset loads or light sources were introduced.

## Final receipts and cost

- Installed gameplay client31792 finished normally. Its screenshot/state were inspected: intro completed, playing at(-1.8880,4.7372),960×540, no error artifact. The subsequent cleanup-only change was covered by the real disposal check and installed final-source startup21342, which finished ready/briefing at960×540 with its screenshot inspected.
- Native shading measurement finished before the software measurement began, after all owned browser checks were terminal. It compares the same current sign geometry/art using unlit Basic and production Lambert shading, with all active shadow lamps refreshed and synchronized framebuffer readback. Five timed samples per condition, basic/lit/lit/basic order. Averaged medians: overlook13.80→13.45ms, pump12.40→12.65ms, receipt10.70→10.85ms. Draw/triangle counts are identical between shading conditions. These small differences do not establish a general FPS guarantee or compare against the old larger board geometry.
- Software cost66609 completed normally, but its samples vary widely: repeated basic/lit conditions disagree substantially at the overlook and pump. The result is diagnostic and does not establish a reliable software shading delta. FV71 remains incomplete; the already-known software performance problem is not resolved by this art pass.
- The atlas remains one texture. Packing dimensions derived from the captured label sizes are4096×3253 before and4096×3260 now: approximately0.153MB more RGBA8+mip atlas storage. The two smaller scoreboard maps decrease separately. Texture-object count alone is not a claim of identical byte usage.
- All owned jobs are terminal. Seven source/test snapshots and SHA256 hashes are retained under `output/final-cut/signage/source/`. The full-route evidence predates only the cleanup registration, which changes no visible geometry, input or simulation behavior; the final disposal/startup checks cover that addition.

FV34 is complete for the current signage system: hierarchy, physical mounting, lettering, selective weathering, readable directions and mutable narrative behavior have been implemented and inspected. The ledger is18complete/25in_progress/29pending. Next: functional/damp pump-shelter character and neglected pavilion/interior detail under FV27/FV31/FV33. Keep all other material, Joe/mower, effects, story/UI, performance and matched Level1 acceptance requirements active. No agents, commits, deployment, deletion or unrelated runtime edits; server4187 remains available.
