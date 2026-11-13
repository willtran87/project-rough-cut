# Final Cut turf condition and laid stone paving

Progress toward FV03–06, FV15, FV17 and FV18. The full 72-item objective remains active. This pass does not establish complete Level 1 parity, physical terrain relief, live mowing tracks, saturated-water response or performance acceptance.

## Runtime changes

`final-cut-turf-layout.js` authors 19 dry, damp and worn regions around the actual fairway, nursery, reed edges and refuge entrances. Fairway/green care attenuates dry and damp conditions; the putting surface also suppresses wear. Entrance wear remains visible on maintained turf at the pump. The static mask uses 256×512 RGBA pixels (524,288 bytes), with irregular broad boundaries and no per-frame mutation.

`final-cut-ground-finish.js` now uses the existing ground atlas's actual earth cell for worn entrances and dirt margins. Its subtle grooves depict pre-existing groundskeeping condition, never evidence of a live Joe pass. Buried curb shading uses the gravel source's mineral values. Ground masks share world coordinates and do not change height, collision, footsteps, concealment or routes.

`final-cut-paving.js`, `final-cut-surfaces.js` and the scene material setup replace the old repeating crack-island paving with 0.72×0.48 m stone flags in a half bond. Fourteen-millimetre joints, narrow edge shading, sparse 6 mm edge losses, six restrained stone values and independent source phases distinguish flags. The existing gray limestone atlas supplies the clustered detail. A 3 mm sampling grid keeps close edges deliberate; explicit texture gradients avoid false mip selection at stone boundaries, and distant joints converge toward mean coverage. Finish coordinates include the actual instance and model transforms, so batching and the separate ramp meshes do not reset the paving pattern.

The paving remains a material finish on the actual existing slabs. It adds no collision, displacement, geometry, lights, textures or draw calls. Reusing the masonry map removes the old paving map from the warmed render set. Other chapters and raster source art are unchanged.

## Verification

- `tools/verify-final-cut-turf-layout.mjs`: 74,305 samples, 19 patches; bounded weights, maintained green, pump wear and traversable entrance positions pass. Existing foundation-layout check passes all 202 roots and 18 beds.
- `output/final-cut/turf-condition/hardware/report.json` and `software/report.json`: 18 final-source views each, five viewport sizes, real strafe, exact pause, camera turn/return invariance and warmed resource stability. These precede the paving change. The turf-only direct/garage/drain browser routes also passed with no errors. The earlier installed-client receipt predates the final pump-wear attenuation fix and is not used to prove that fix.
- `output/final-cut/paving-finish/hardware/report.json`, `software/report.json`, and `before/report.json`: 19 views each, including overlook, both ramps, all refuge floors, nursery edge and bank path; actual keyboard strafe, exact pause, camera turn/return and warm resource stability pass with no console/page errors. The baseline intercepts only the saved pre-paving scene/surface files and retains the current turf condition.
- Hardware framebuffers: 2560×1600, 1920×1080, 1280×720, 844×390 and 390×844. Software: 960×600 at the large 16:10 viewport, 960×540 at both 16:9 desktop viewports, native at the two compact sizes. No horizontal overflow. Inspected close deck, ramp transition, pump floor, software pump and portrait deck captures.
- Native warmed resources: 139 geometries/65 textures, versus 139/66 before paving. Software: 139/62. Submitted draws and triangles match for the ten primary native fixture views. Some later responsive samples differ due to shadow-refresh timing, so they are not attributed to the material change. Resource stability alone is not frame-time acceptance.

- `paving-finish/routes/browser.json`: final source passes all three uninterrupted direct/garage/drain finales, four heard ball redirects, zero captures/errors and 77 retained screenshots. This includes real E record collection and gamepad movement/Use through the pump, crossings, bell, collapse and road ending.
- `paving-finish/sightlines/report.json`: all 48 front/back/side, near/far, standing/crouched concealment pairs are pixel-identical with the rig present/absent. Every casting-light shadow is refreshed after visibility changes.
- `paving-finish/client/`: installed client exits 0 after intro progression and actual keyboard movement. Fresh screenshot/state inspected: ready/playing at (-1.8880467,4.7372006), 960×540, current 19-patch turf mask and earth source, no error artifact. This receipt includes the final pump-wear fix and final gray paving.
- Nine production/test source hashes match the captured final snapshots. All owned browser and profiling jobs are terminal.

## Cost comparison

`tools/profile-final-cut-paving.cjs` ran sequential ABBA pages after the other owned browser jobs finished. Each view uses three warmup and seven frozen render/full RGBA readback samples. Both variants retain the final turf masks. This isolates paving; it does not measure the incremental turf-condition shader cost or sustained gameplay.

Native 1280×720 median ranges: deck 4.9 ms before versus 4.9–5.9 ms current; pump 5.3–5.4 ms before versus 5.4–5.9 ms current. Software 960×540: deck 356.8–364.5 ms before versus 362.1–390.4 ms current; pump 226.1–226.4 ms before versus 230.0–230.4 ms current. Submitted draws/triangles are identical within each tier/view and the current material uses one fewer texture. The repeated deck measurements drift, so a precise universal delta is not supported. Software absolute performance is still unacceptable; FV71 remains open. Reports: `paving-finish/profile-hardware.json` and `profile-software.json`.

## Remaining scope

Broad turf repetition and large-scale terrain shape remain; a static condition mask does not complete FV15/FV16. Damp tint does not complete the flood progression or saturated mud. Remaining path margins, stone-to-soil transitions, wider material-density comparisons, facade composition, Joe/mower finish, effects, story/UI continuity and all full-level acceptance/performance requirements remain in the ledger.
