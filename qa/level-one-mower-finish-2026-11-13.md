# Level 1 mower finishes and encounter review — partial

Full V01–V21 scope remains active. This pass follows the broad scene survey into Joe's actual lit encounter. It improves object-specific material craft and supplies current actor inspection evidence; it does not complete the character, machinery or performance categories.

## Findings and implementation

Actual native views at front, quarter, side, rear, close and distant positions showed that the deck's paint, engine, metal and rubber used the same Phong finish (shininess44). Wheel metal instead inherited Lambert shading. The red deck and discharge parts produced broad plastic-looking white highlights. Joe's existing face/clothing/hand detail was readable under the existing floodlight; this pass preserves that art and the enlarged machine geometry.

`course-mower-finish.js` selects finishes by the original GLB material function. `joe-model.js` applies them to the rigid machine and wheel descendants, keeping character materials separate:

- Enamel: restrained warm specular response, clustered paint chips/scrapes near the lower deck edges, darker low skirt.
- Engine: subdued highlights and lower grime/soot.
- Steel: tighter cool highlights and sparse scuffs, including wheel hubs.
- Brass: warmer restrained reflections and tarnish variation.
- Rubber: matte Lambert response and quiet surface variation, including the handle grip and tyres.

Existing illustrated maps remain. Wear uses object-space192pixels/metre, projected onto the relevant surface plane. The initial side projection created vertical bands and was rejected; the accepted profile limits wear near the lower lip and uses the side's vertical coordinate. Fine grain fades with pixel footprint at distance. Final hash arithmetic uses no sine and the footprint needs no square roots. No new textures, geometry, lights or collision changes.

The initial shader compile error used GLSL's reserved word `patch`; corrected before accepting any capture. `finish-candidate` and `finish-valid` on I: are rejected intermediate evidence. Canonical accepted artwork is **`output/level-one-mower-finish/optimized` and `optimized-software`**. The older `after`/`after-software` folders predate the arithmetic optimization.

## Verification

- `review-course-actor.cjs`: all six camera positions checked against actual course collision; initial side position was blocked by the eastern pond and replaced with a legal western view. Joe remains at30,252 under the existing maintenance floodlight. Matched baseline in `before`; accepted final in `optimized` and `optimized-software`.
- Actual2560×1600 viewport renders2492×1402 on native; software960×540. Additional1280×720 and390×844 captures. Inspected native front/quarter/side/near/far and portrait, plus software quarter. No image of a studio rig is substituted for gameplay evidence.
- Actor geometry remains27meshes,141248near triangles and22598distant triangles. Native matched encounter resources935geometries/103textures before and after; shader programs83→86. Software programs92→95. Added finish variants account for the difference; draw counts remain unchanged.
- `verify-course-mower-craft.cjs` native/software: all18actual machine material assignments checked;24gait poses retain grip (maximum error0.00003921world units), foot contacts change with lift, travel animates the loose flap, pause/duplicate render preserve pose, reduced motion stops pulley/flap,60warm updates retain resource counts. Rebuild replaces the craft and disposes each of18finish materials exactly once. Later arithmetic-only optimization separately compiled/rendered on both renderers with no errors.
- `verify-course-mower-motion.mjs`: existing acceleration/braking/reversal model passes at30/60/144Hz. This material change does not alter that simulation.
- `source-hashes.json` records the three runtime files for this pass.

## Performance limits

24warmed submit-through-GPU-fence samples per fixture,2ms polling. Native2492×1402; software fixed960×540. This is a shared machine and bounded scene comparison, not a whole-level performance guarantee.

| State | Native encounter/distant median ms | Software encounter/distant median ms |
|---|---|---|
| Original | 11.1 / 11.1 | 107.2 / 93.9 |
| First finished shader | 12.8 / 10.3 | 125.2 / 115.4 |
| Reverse-order recheck | — | after126.2 / 138.2; before174.2 / 100.0 |
| Final cheaper arithmetic | 13.2 / 11.8 | 124.2 / 106.8 |

The variance prevents a clean causal cost estimate. The final renderer still incurs shader cost, and software performance is poor. Do not claim a speedup, no regression,60FPS acceptance or V21 completion from these numbers. Native finalp95 was14.7/14.5ms in the two fixtures; software132.3/115.5ms.

## Remaining scope

Broader machinery vibration, material craft on added mechanical attachments, effect-origin/disturbance review, first-person hand craft, and transitions across different lighting situations remain open. Continue larger scene-composition and material-density comparisons; retain every subitem in the comprehensive ledger.

## Workspace note

C: briefly had only13MBfree. Automatic approval review rejected deletion of three known rejected screenshot directories with “blocked by policy”; no deletion occurred. Browser temp and initial captures used task-specific I: directories. C: later had1.8GBfree without this task deleting anything; accepted captures and baseline sources were copied into the project. These copies, not external temporary paths, are the canonical evidence above.

## Recovered terminal checks

The completed motion report in `output/level-one-mower-finish/motion/report.json` passes actual acceleration, braking, reversal, pivot, repeated-update stability, pause/grip, 74 swept-clearance approaches, and wet/sand braking. The installed client ended in `first_hole`, ready at adaptive640x360 with no error artifact. These are retained prior-pass checks, not claims that the full visual upgrade is complete.
