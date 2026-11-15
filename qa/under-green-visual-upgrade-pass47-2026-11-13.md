# Under the Green pass 47 — constructed gallery vaults

Status: implementation and local visual/clearance verification passed. Full 53-item objective and seven whole-level gates remain active. V07 and the broader material/composition requirements remain partial.

## Change

`under-green-vaults.js` replaces three zero-thickness elliptical soffit sheets with closed masonry shells. Inner faces, outer beds, reveals and radial ends have consistent outward winding. Six end ribs now use 108 fitted wedge-shaped stones, separated by narrow joints over the continuous shell. Slight alternating bed depths avoid a perfectly uniform edge.

`under-green-districts.js` also replaces the three older overlapping-box ribs at course y10,22,30 with 62 fitted stones. The wide entrance retains its five-metre radius; the other ribs retain the three-metre gallery span. Overall: nine ribs, 170 fitted stones, three closed barrel shells and six existing springing ledges. No new route obstacles or colliders. Lowest masonry remains 2.89m.

The curved texture coordinate follows actual faceted elliptical arc length, correcting the previous circular-distance mapping. Shared masonry artwork retains 313.5 source texels/metre. The cloned vault material now explicitly preserves the source's custom stain shader hooks; Three's clone had omitted them. No new texture images or lights.

## Verification

- Pure actual-geometry audit: 179 closed meshes, 4,252 triangles, finite vertices/UVs/normals, no degenerate triangles, paired oppositely directed welded edges, positive signed volumes, 75 real overhead ray hits, physical soffit UV scale and inherited material-hook identity. Report: `pass47-source/geometry.json`.
- The first pure audit used a 2-micrometre tolerance for long Float32 UV spans; it was corrected to 10 micrometres after observing quantization at larger course coordinates. Geometry was not changed to satisfy the tolerance.
- Final native/software browser reviews: 31 views and 24 camera-turn steps each; approach, underside, reverse and oblique views across all spans plus entrance ribs. Exact fixed-pose image return, actual pause, Reduced Motion, flood and Q lookback pass. Zero shader/page/console errors. `pass47-final`.
- Viewports: 2560x1600, 1280x720, 390x844, 844x390. Native desktop target2560x1600; software uses its lower-resolution target. Native close joints/soffit/entrance and software portrait/reverse views inspected. This does not prove complete matched Level1 parity.
- Per renderer, 4,032 actual camera-volume poses across the gallery: two eye heights, three pitches, four yaws, FOV45/85 and portrait/landscape aspects; no intersections. `pass47-final/*/clearance.json`.
- Current dry-route replay: 1,379 sampled frames,106 actual skinned-body/scythe geometry audits, no intersections; hand/foot errors remain below .015m (maximum foot error .000000242m). `pass47-route`. This is a route-specific geometry check, not all-encounter/full-level clearance acceptance.
- Installed client: five input bursts; initial Preparing click timeout, followed by briefing/intro and actual gameplay at (0,7.688). Final shot/state inspected, fitted-vault stats present, no error artifacts. `pass47-client`.
- Intermediate `pass47-vaults` captures only the six barrel-end ribs; final `pass47-final` includes all nine ribs. Preserve that distinction.

## Cost and remaining work

Whole feature geometry grows from1,932 to4,252 triangles (+2,320). Matched final views retain draw counts, texture counts, source lights and player state; shader programs grow142to144 because vaults now retain the authored stain hook. No blanket performance acceptance from unchanged draw counts.

The first crossing's existing signal hood obscures part of the lower instruction line in the upward close-approach fixture (0,18,pitch.25). The sign is readable from farther back, but V50 remains partial; review its mounting and approach-angle readability next. Broader gallery composition, recessed construction detail, root/architecture joins, full Level1 comparisons and all seven whole-level gates remain open.


## Final local timing

Six warm and24alternating GPU-fenced samples per view, native then software, after other owned verifiers completed. Values are median/P95 milliseconds.

|Renderer/view|Before|After|
|---|---:|---:|
|hardware/galleryApproach|15.1/16.8|13.6/15.3|
|hardware/gallerySoffit|12.1/13.8|10.8/11.8|
|hardware/galleryReturn|11.7/13.9|10.6/12.6|
|software/galleryApproach|190.3/220.8|194.3/228.0|
|software/gallerySoffit|105.5/110.5|107.5/132.1|
|software/galleryReturn|168.1/181.0|163.6/194.3|

Native local cost does not regress. Software median changes are +4.0ms approach,+2.0ms soffit,-4.5ms return; absolute software performance remains poor. These are GPU-fenced fixture diagnostics, not ordinary-play FPS or whole-level performance acceptance. All owned pass47 jobs terminal; server4187 preserved.
