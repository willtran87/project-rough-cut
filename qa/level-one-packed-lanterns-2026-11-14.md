# Level 1 packed lantern source data

Partial V21 performance progress toward the full high-resolution pixel-art upgrade. This does not complete the visual ledger or establish high-resolution software performance.

## Production change

`scene-3d.js` now selects `course-lantern-light-field-packed.js` on detected software renderers. Hardware retains the existing uniform-based field. The packed field stores each cell's actual source position/power, avoiding the dependent dynamic index into 40 source uniforms. Every intersecting source is retained; light color, range, attenuation and material response remain the same. The separate 47-source ground specialization is unchanged.

Current course grid:18×61, maximum3sources per cell. Packed data plus CPU source buffer uses53,344bytes versus18,208bytes for the original index field. It still uses one texture; dirty source powers update all their cell copies and request one texture upload per changed frame. Frozen frames request none. Source locations are fixed for a course build; rebuilding reconstructs the grid. This is not a general moving-light index.

The28symmetric path lanterns, other existing station sources, ambient.005 and all visual geometry remain. No adaptive resolution threshold is increased on the basis of this limited saving. The page's scene module version is updated.

## Evidence

- `tools/verify-course-packed-lanterns.mjs`:28,644conservative membership samples and11,328packed texel comparisons, including zero/negative/dimmed/restored power; unchanged-frame upload suppression; exact-once disposal and material-hook restoration; empty field.
- Original `verify-course-lantern-light-field.mjs` still passes for the hardware implementation.
- `tools/verify-course-packed-lanterns.cjs`:same-world original/candidate image comparisons across8views×3power states. Both software runs and native run have zero changed channels in all24comparisons each. The benchmark forces the original field for its baseline even after production integration, then clones lit materials preserving other shader hooks and stable ordering. Ground specialization stays active in both variants.
- `tools/verify-course-lantern-field-render.cjs --packed --software --out=output/level-one-packed-lanterns/point-reference-software`:five actual Three PointLight reference views, including a cell boundary and power change; maximum difference1/255, no GL/browser errors.
- `tools/verify-course-packed-integration.cjs` and `--software`:production imports and renderer selection,11captures each at2560×1600,1280×720 and390×844. Checks40anchors/28path lanterns, ambient, flicker uploads, frozen draws, actual Escape pause/resume, stable warm resource counts and exact-once field texture disposal on scene rebuild. No browser errors.
- Images inspected:software opening, woodland and phone; native Audit Bell close view and ordinary desktop. These retain the intended dark intervals and local pools. They do not establish full scene artistic acceptance.

## Timing scope and limits

Direct world renders to960×540, synchronous readback, same camera/world, preserved ground field, frozen shadow/time, source-power changes each frame. Includes field updates and packed texture uploads; excludes compositor, backdrop and simulation. Six alternating rounds per view with8warm-up and20measured frames each. Values below pool60samples per implementation/view and are milliseconds, median/P95.

| Software run | View | Original | Packed |
|---|---|---:|---:|
| First | Opening |71.0/105.1|64.2/94.2|
| First | Woodland |105.9/158.2|92.4/143.3|
| First | Range |85.1/116.8|68.5/101.0|
| Repeat | Opening |72.3/114.8|65.6/92.2|
| Repeat | Woodland |102.5/153.2|90.8/145.4|
| Repeat | Range |66.6/87.5|67.0/89.8|

Opening/woodland median savings repeat at roughly9–13%; range benefit does not repeat. Native pooled medians are6.2→6.2opening,2.8→2.8woodland,5.1→4.3range. Hardware production remains unchanged. Timings on this shared host vary; these are scoped evidence, not a whole-level frame-rate guarantee.

Artifacts: `output/level-one-packed-lanterns/{software,software-repeat,native,point-reference-software,integrated-software,integrated-native}`. High desktop native capture renders at the display-matched target; software integration stays at960×540 in this frozen fixture and486×1067 in portrait. Actual gameplay may reduce resolution further. Whole-route performance, stable motion clarity, remaining materials/composition/actor work and all unaccepted V01–V21 requirements remain open.

Installed web-game client completed8real forward/lateral input bursts through the existing `verify-presented-client.mjs --level-one --high-resolution` wrapper. Final state:first_hole,x-18,progress77,travel90,packed-world-field; final screenshot/state inspected, no error files. Live software render drops800×450→640×360. Completed scene average80.005ms/P95106.5ms over120samples remains outside the target; this is not a matched before/after client measurement. All owned browser processes finished normally.
