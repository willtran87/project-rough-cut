# Level 1 culling reference correction — 2026-11-14

The apparent culling failures reported during the coursed-stone pass were caused by the test reference renderer. Production culling did not require a change. The previous turn was progress; this turn repairs the verification, proves the cause, and replaces an incorrect outstanding-work finding with current pixel evidence. The full visual-upgrade objective remains active.

## Cause and correction

The old oracle overwrote a compacted index buffer with the original full indices, but retained cached per-part `drawOffset` values. Returning to the same camera then skipped copies whose cached offsets appeared unchanged, although the underlying buffer had been replaced. Later shots and comparisons could therefore consume incorrect packed geometry.

The reference also retained per-part visibility flags and pending partial GPU update ranges. Those flags feed local-light material selection; a full-geometry reference needs full visible-piece metadata. A full CPU overwrite needs an explicit complete GPU upload, not an inherited partial range.

`tools/fixtures/full-index-reference.cjs` now restores the full buffer, replaces pending uploads with a full range, resets every cached run offset, marks every reference piece visible, and invalidates compaction. The injected test hook invalidates camera culling. Returning to ordinary rendering recomputes visibility, lighting reach and packed offsets correctly. No production renderer, scene, art, light, collision or gameplay logic changed.

## Evidence

- `node tools/verify-full-index-reference.mjs`: 128 full-reference/normal-view transitions across every six-part visibility mask in both16/32-bit index formats. Includes empty batches, partial prefixes, disjoint runs and deferred GPU uploads. The former overwrite is reproduced and asserted incorrect; the fixed helper restores both CPU/GPU contents and same-camera compaction.
- `node tools/verify-visible-indices.mjs`: existing512visibility transitions, delayed uploads, tail-only and unchanged cases pass. This independently checks the production compactor.
- `node tools/verify-course-stone-courses.cjs --software` and `--before --software`: 15views each, including six close walls, opening, Audit Row, water approaches, service maze, exit, ordinary/phone views and walked pose. Every normal/full reference comparison has zero changed RGBA channels. Every return from the reference to the original compacted view also has zero changed channels. Both reports now record `wholeWorldCullingExact:true`; the earlier regression-only threshold was replaced by strict pixel equality.
- Existing movement, pause/resume, resource stability and scene-rebuild assertions still pass. All six current stone skins reappear after rebuild. No browser errors. Both runs have stable747geometries/113textures/117programs in the warm view.
- Viewports2560×1600,1280×720,390×844; software comparison uses the controlled0.625budget. Current service-maze and phone screenshots were opened and inspected. These are comparisons at fixed simulation poses, not a complete motion or frame-rate acceptance test.
- Production `pixel-world-props.js` and `visible-indices.js` are byte-identical to this turn's starting snapshots. Source snapshots and SHA-256 manifest accompany the corrected verifier. Actual input/client evidence for the unchanged production scene remains in the coursed-stone QA.

The corrected software baseline/final comparison retains identical object/hull/obstacle/light/lantern/occluder/camera data. It shows no new draws, textures or programs, equal geometry resource counts and0–6384fewer submitted triangles for the new stonework. Some older submission deltas were contaminated by the broken oracle and are superseded by the regenerated comparison.json. Native comparisons did not use that oracle and remain unchanged.

## Scope and retained history

The original faulty reports, comparison and verifier are preserved under `output/level-one-culling-reference/baseline-source`. The initial safe diagnostic passed15views; the final shared-helper runs add explicit restoration equality and cover both baseline and current wall geometry. Their terminal process IDs are36100,78117and5249, all exit0.

The prior claim of existing software culling errors up to246/255 is withdrawn for these views. The failed stone-only experiments from that pass are not acceptance evidence. No new culling bug should be inferred from those records without rerunning a coherent reference.

This clears the specific false culling alarm. It does not accept the entire V21 category, software high-resolution fidelity/performance, all moving-camera/light situations, route composition or the full35-item visual-art checklist. Resume the remaining art-direction work against the current Level1 reference rather than attempting to fix this test-induced image difference in production.
