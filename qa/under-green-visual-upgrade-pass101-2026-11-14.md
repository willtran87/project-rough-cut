# Under the Green visual pass 101: hidden repair backing

Progress toward the existing 53 requirements and 48 refinements. No requirement or whole-level gate is promoted by this local optimization.

## Retained change

The narrow east gallery repair previously shaded a complete brick face behind opaque plaster. `under-green-gallery-backing.js` removes only that hidden inner face, retaining brick islands behind the plaster windows and a 55 mm overlapping ribbon around its chipped perimeter. The four wall partitions retain their other five faces, bounds, colliders and conservative occluders. The original complete wall geometry is retained for the static shadow bake, then disposed. The original material and world UV projection still apply.

The final scene matches the tested candidate byte-for-byte. No artwork, gameplay, lights, textures or shader variants were added. E/Q, movement, entrance-only retries, water behavior and pursuit remain unchanged. The additional contour triangulation adds 2,202 triangles; measured draw counts are unchanged.

An initial routed prototype incorrectly shared the box geometry's `userData`, leaking its clipping tag onto unrelated walls. It was rejected without being installed. The corrected version creates separate metadata and checks the transformed wall bounds. The first `budget/software` output is rejected evidence; use `refined-budget/software`.

## Verification

- Geometry: 22,684 first-hit ray comparisons including grazing views at chipped boundaries, both sides of walls and plaster windows. Maximum distance difference 3.55e-15 m. Finite attributes and original bounds preserved. An unrelated distant wall is explicitly rejected by the helper.
- Native and software: 55 views each at 2560x1600, 1280x720, 390x844 and 844x390; six flood states, 2,688 camera poses and 15 opaque-wall sentinel probes per renderer. No browser errors. Shadow appearance, unchanged outside-geometry fingerprints, ground-mask bytes, player states, texture/program counts and lighting configuration verified. Camera-return pixels remain exact; pause, crouch, rear view and reduced-motion checks pass.
- Raw image comparisons: 23 paired views per renderer. Fourteen unaffected views, including crossing, reverse, pump and keeper, are pixel-exact. Native repaired-wall views change at most 82 of 4,096,000 pixels, maximum channel delta17. Software upscaling spreads these differences: at most5,260 pixels (0.129%), maximum channel delta13, mean RGB delta0.00119/255. These are small sampling differences, not bit-exact fidelity. Strict changed-area, high-delta-area, peak and mean bounds are now enforced by the verifier and were checked against both saved reports.
- Native repair/crossing/portrait and software repair screenshots inspected. Plaster chips, exposed brick, root silhouettes and dark wall backing remain intact.

## Paired GPU-fenced timing

Six warm pairs, then24 alternating samples. Values are median / p95 milliseconds, baseline → candidate.

| Renderer / view | Median | p95 |
| --- | --- | --- |
| Hardware approach |24.7 →24.0|27.1 →25.6|
| Hardware repair |16.6 →16.0|19.9 →18.3|
| Hardware crossing |18.9 →18.3|20.5 →20.4|
| Software approach |280.5 →284.2|292.4 →304.7|
| Software repair |215.8 →195.5|227.7 →208.8|
| Software crossing |193.1 →197.0|201.3 →207.3|

The repair close-up improves about9.4% on software. Approach/crossing software costs increase slightly in this sample; absolute software performance remains poor. Another chapter's software test was running concurrently, so absolute timings and comparisons to previous passes are not whole-route benchmarks. This pass does not close the performance gate or establish Level1 parity.

## Evidence and next work

Reports and images: `output/under-green/visual-pass101/{hardware,software,geometry,refined-budget}`. Reproducible verifiers: `tools/verify-under-green-gallery-backing{.cjs,.mjs,-budget.cjs}`. Baseline/candidate source snapshots are retained. The visual verifier's `--check-report=` mode validates saved raw pixel metrics without rerendering.

Continue complete gallery composition and deliberate pixel clusters, then bunker soil/retaining transitions, range bay variation, pump lower-casting separation and keeper room composition. Current matched Level1, full-route motion/actors, hazard states, responsive/accessibility and performance gates remain open. A local static optimization is not final artistic acceptance.

Installed standard gameplay client:12bursts, terminal0, finalready/playing at(0,14.216),checkpoint0, no error artifacts; finalshot11 inspected. Initial Preparing-button click timed out after5seconds and the later menu input recovered. Final production source hashes match the tested candidate and `final-source-manifest.json`. All owned pass101 test processes are terminal; the software verifier completed its successful report after its tool handle was lost during compaction. No concurrent chapter process was stopped.

Storage: four packed deposit binaries archived losslessly in `deposit-evidence.zip`; archive bytes verified against SHA256 manifest before original `.bin` removal. Reports and all images retained.
