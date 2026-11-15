# Under the Green visual pass 65: gallery root foundations

The preceding goal turn made verified progress on channel depth. This pass advances gallery integration within the original 53 requirements and 48 refinements. It is local progress on V12/V17/V20, not acceptance of the entire gallery or any whole-level gate.

## Change and art review

Three existing gallery roots now disturb the floor beneath them: the living pillar at (-1.8,15), entrance wall root at (4.905,10.2), and crossing root at (-2.905,27.625). Each has a closed, irregular soil mound with small masonry fragments embedded in its shoulder. Flat sediment fans and narrow soil-filled failures extend from those same foundations into the existing ground deposit map. Moisture concentrates beneath the root; the broad outer margin is quieter and drier.

The first mound candidate looked like a continuous raised ring in the reverse view. Its radial outline was reshaped into unequal lobes that tuck beneath the root, and the fragments were reseated on that new profile. `preview`, `paired-preview`, `hardware`, `software`, `route`, and `client` are intermediate. Final geometry/mask acceptance uses the `*-final` directories. A subsequent one-line UV orientation correction aligns mound grain with the floor course coordinates; geometry positions, indices and all gameplay sources were unchanged. That correction has an additional UV unit assertion, three focused views per renderer under `uv-accepted`, and `client-accepted`. Both pre-UV and final source snapshots/manifests are retained.

New module: `web/under-green-gallery-ground.js`. `under-green-ground-finish.js` paints its deposits into the already allocated mask. `under-green-scene.js` adds its geometry to existing material/cell batches. Three mounds plus 11 fragments total 1432 triangles / 1932 source vertices. No new textures, materials, lights, shader logic, animation loop, collision or navigation changes. The pillar's raised geometry fits its existing 1x1m collider; wall geometry stays within the existing 0.20m visual allowance. Only flat material marks spread onto the walk.

## Verification

Evidence: `output/under-green/visual-pass65/`.

- Geometry verifier checks closed two-use edges, outward signed volume, finite attributes, raised-height limits and actual transformed fragment/mound bounds. All three foundations stay within their existing clearances.
- Paired browser verifier covers approach, close, reverse, both wall roots, a crossing view and unchanged pump/bunker control views; native desktop, ordinary desktop, portrait and landscape; crouch, Q lookback, camera return, pause and reduced motion.
- It fingerprints triangles outside the modified foundation region, checks material color attributes and compares player state, actual render sizes, light sources and texture counts. The floor-mask audit checks that sand and wear channels remain byte-exact and that added mud/wetness stays within the three root sites.
- Final native check: 27 views, 2688 camera poses without intersections, 278475 outside-region triangles unchanged, no recorded page/console errors. Software also passes 27 views and 2688 camera poses, with 203743 outside-region triangles unchanged. Mask differences are 2300 native / 2244 software mud/wet bytes, confined to the three sites; sand/wear channels remain exact within each renderer. Native targets reach2560x1600; software desktop is960x600 (ordinary desktop960x540), while compact portrait/landscape use390x844/844x390. No new page/console errors.

- Final dry route:1379frames,106actual skinned-body/scythe geometry inspections, zero scenery/camera intersections, maxfooterror2.415e-7m. The later UV-only alignment does not change this geometry.
- Installed standard client rerun after UV alignment: seven bursts, ready/playing at(0,7.304), elapsed0.75s, checkpoint0, noerrorartifacts. Initial Preparing-button click timeout recovered through subsequent input. Final screenshot and state inspected.
- Native close/reverse, compact portrait and software close/landscape screenshots inspected. Final UV-focused native/software images inspected. Geometry and runtime/verifier syntax checks pass.

Native resources at the approach: 526 draws, 55 textures and 211 warmed programs unchanged; triangles 388954 to 390386. Pillar: 411 draws unchanged; triangles 330218 to 331650. Crossing root: 285 draws unchanged; triangles 242964 to 244044. Shared batching retains the existing draw count.

## Remaining scope

This improves root-to-floor contact and interrupts nearby slab repetition. It does not finish the broad ceiling/wall composition, all district variation, flood integration, actor art or Level 1 comparison. Keep all seven release gates pending and all existing item statuses unchanged. Next substantive work should continue the whole gallery composition and broader district craft rather than repeating this local foundation treatment.


## Completed local budget checks

After all owned visual/client/route processes finished, hardware and software GPU-fenced budget runs completed sequentially. Each fixture has six warm pairs and24alternating samples. Hardware target2560x1600;software960x600. Final results are under `budget/hardware-accepted` and `budget/software-accepted`; the earlier `budget/hardware` predates the final UV alignment. Milliseconds, median/P95:

| Renderer | View | Before | After |
|---|---|---|---|
| hardware | gallery | 16.5 / 19.5 | 16.2 / 19.6 |
| hardware | pillar | 13.5 / 15.8 | 13.3 / 15.7 |
| hardware | wall-root | 11.6 / 13.6 | 10.6 / 12.7 |
| software | gallery | 188.3 / 200.4 | 187.2 / 231.2 |
| software | pillar | 164.6 / 196.9 | 166.2 / 202.2 |
| software | wall-root | 103.3 / 145.3 | 108.2 / 158.3 |

Native medians did not increase in this local sample. Software pillar and wall-root medians increased1.6/4.9ms; absolute software performance remains poor. Other chapter test processes were recorded before timing (see `processes-before-budget.json`), so these are local comparative observations, not isolated benchmarks or an FPS improvement claim. No performance gate closes. All owned process handles are terminal.
