# Level 1 hedge leaf surfaces

Local V01/V06/V09/V10 progress within the complete35-item/V01–V21 visual upgrade. The opening's broad unlit cover masses remain a wider composition issue; this pass improves leaf structure where actual sources reach the hedge. It does not accept full scene hierarchy or software performance.

## Implementation and visual evidence

The23opaque hedge bodies used a cropped illustration on a smooth lathe normal field. `course-hedge-surface.js` now authors a paired128×128 colour/normal atlas: staggered connected sprays, dark stems, pointed pixel silhouettes, restrained veins and folded leaf halves. Six palette colours occur in the final atlas. Both maps repeat at the original.7m scale, use nearest magnification and mipmapped minification, and remain attached to surface coordinates.

Only the opaque hedge cores use the new material. Their positions, silhouettes, collision/flight profiles, normals/indices and conservative occlusion volumes remain identical. Existing terminal shoots, other foliage, habitat tint, all light sources and28symmetric path lanterns remain unchanged. The surface normal perturbation is projected into the geometry's tangent plane and evaluated by existing Lambert lighting. Native retains three-axis blending; software retains its existing dominant-axis projection. No emissive value, minimum brightness or ambient light is added.

Matched close Audit Row and Night Range views reveal distinct clusters around the same lamps. The darker upper/front faces stay dark. Wider approaches retain the light/dark rhythm and the range marker. This is source-dependent detail rather than a claim that every dark hedge is now readable. Selected high-resolution, ordinary desktop, portrait and actual-client images were inspected.

## Verification

- `verify-course-hedge-surface.cjs`:45views per renderer/version, including all23cores, representative routes,2560×1600/1280×720/390×844, actual movement, pause, bounded warm turns and rebuild. Native baseline99687/current22721 and software baseline20768/current24988 exited0, no browser errors.
- `compare-course-hedge-surface.cjs`:90matched pairs have identical complete recorded world inventories, all23core position/normal/index buffers, growth records, obstacles, lights, lanterns, occluders and camera/resolution data. All45baseline and45current software views match full-geometry rendering exactly and restore exactly.
- Actual native targets2492×1402/1193×671/379×833. Fixed-budget software fixtures800×450 landscape/405×890 portrait. These are explicit fixture budgets; the installed gameplay client still adapts lower.
- `verify-course-hedge-atlas.cjs`: deterministic data, opaque pixels, maximum unit-normal error.00554,10,537fold pixels. GPU normal-map readback matches all source bytes in the correct canvas-albedo orientation, with zero changed channels.
- Lighting audits92313native/13850software exited0: isolate the real hedge materials, remove fog only for the diagnostic, and turn off actual lights plus fixed-source fields.582,151native/60,406software pixels are lit initially; all RGB channels are zero with sources off. Restoring the same sources restores every pixel exactly. No production lighting change is used by this test.
- `test-course-cover-flight.mjs` passes all5,025clearance samples plus low/high/nearest/narrow-cover/rebound checks.
- Installed gameplay clients65124native/99298software exited0 with two movement bursts from the existing range fixture. Both retain first_hole, x11/progress547/clearance4.66 then x20/progress540/clearance7.63, no renderer error. Actual targets2492×1402 and adaptive640×360. Their final views turn past the lit face; an additional retreat fixture preserves a view of the surface during real movement. Final retreat handles/results are recorded in progress.md.

## Resource ownership correction

Initial diagnostic29218/8434 failed exactly-once disposal; diagnostic89212 recorded colour atlas18disposals and batched material17disposals on native rebuild, with the normal atlas once. The scene's generic traversal revisited the same shared map/material for every chunk after the owner had disposed its atlas.

Hedge surface batches are now explicitly owned by the pixel-world module. On disposal, software variants restore their full materials first; hedge meshes detach and dispose their geometry, their unique batched materials dispose once, then owned surface maps dispose once. Generic scene traversal cannot revisit those detached resources. Final native and software audits verify both atlas maps and all captured full/lite hedge materials dispose exactly once and the rebuilt scene is ready. Other material families and other chapters are unchanged.

## Rendering cost

No source geometry is added. Splitting the core surface from other leaf materials adds0–13native or0–6software draws in the checked views. Native submitted triangles change by−6,720..0; software triangles stay exact. Warm resource counts native1018/116/109→1035/118/110 (geometries/textures/programs), software783/116/120→796/118/122. Counts stay bounded during checked camera turns.

Sequential timing process98649 exited0 after all owned functional/client browsers finished. Each view discards12warm frames then measures three groups of12frames through presentation and synchronized pixel readback. Median of group medians, milliseconds:

| Renderer | View | Before | After |
|---|---|---:|---:|
| Native | Close hedge |6.4|5.6|
| Native | Opening |8.1|7.4|
| Native | Approach |6.7|5.9|
| Software | Close hedge |94.8|97.0|
| Software | Opening |91.5|93.2|
| Software | Approach |81.1|85.3|

Native differences are small observations, not a claimed speedup. Software shows additional2.2/1.7/4.2ms in these fixtures. Another chapter's software clearance verifier was live at timing launch, so host-load effects remain possible. The full software performance/high-resolution requirement is still unmet; this pass does not waive it.

Artifacts: `output/level-one-hedge-surface/`, including baseline source, paired captures/reports, atlas/readback verification, lighting/disposal audits, client movement and timing samples. Source/tool snapshots with SHA256 receipts are stored in `verified-source/`. Full route composition, motion/shadow acceptance, material-density consistency and all other unfinished ledger requirements remain active.


Retreat-client closeout: both native/software jobs are absent from the authoritative process inventory, and both produced two complete screenshot/state bursts with no error artifact. Final states match: first_hole, x=-12, progress=547, clearance=4.4. Both final page images were inspected: lit leaf detail remains attached, dark faces remain dark, and the path/marker remain visible. Original process exit codes were lost with truncated tool output; terminal artifact inspection does not claim recovered exit codes.
