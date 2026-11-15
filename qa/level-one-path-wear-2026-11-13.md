# Level 1 path wear — partial comprehensive visual upgrade

Previous workshop-window turn was progress. This pass improves V05.1 path wear and the path/grass portion of V05.2. Full V01–V21 scope remains active.

## Findings and implementation

The turf source crop was measured in linear RGB using the shader's luminance weights: min0,median.010028,p10.002443,p90.033411,max.375206. Only1.6037% of source pixels reach the existing14x clamp. It was not a broad saturation bug; the terrain detail shader was preserved.

`course-path-wear.js` generates static world-metre marks along the authored polylines: compacted centre patches, broken paired wheel wear, coarse/fine grit, grass incursions and dry edge material. Marks have connected, irregular pixel-scale silhouettes. First round-shoulder candidate was revised to uneven12-point grass contours; the outer path band now blends over two restrained widths before the clear1.25m walking surface. Paths, collision, locomotion, hazard logic and route data are unchanged.

Every whole mark conservatively clears sand/mud ellipses, including a small margin. `finishPaths` yields during preparation and respects cancellation; marks are painted into the existing1536x4096 atlas, with no additional frame-time geometry, shader or texture. Current layout produces6669marks, of which1177grass,1813rut,1153pit,383compacted,1734grit and409dry-edge. Counts alone do not establish artistic acceptance; actual lit-route captures were inspected.

`baked-terrain.js` advances the painter version. `bake-startup-terrain.cjs` now supports explicit known variants and uses#game to avoid the old ambiguous canvas selector. Three lossless bakes were produced through the actual runtime painter, preserving old manifest entries:

- standard_review: terrain-d4f53bf8087bfd72.webp,3,003,686bytes.
- eastern_exception: terrain-bc408c38ef06ef19.webp,3,004,896bytes.
- closing_shift: terrain-20662cf5246b0042.webp,3,005,352bytes.

Each bake command verifies decoded RGBA equivalence before writing. Unknown layouts or missing manifests retain the procedural fallback. Current old baseline did not match a prior bake; the new default does.

## Verification

- `node tools/verify-course-path-wear.mjs`: deterministic output, unchanged input routes, degenerate paths, all six mark types and sampled whole-edge clearance from protected footing.510marks in the synthetic test.
- `tools/verify-course-path-wear.cjs`: matched actual-lit-path, crossing and opening views,2560x1600/1280x720/390x844, real ArrowUp movement and Escape pause/resume, stable warmed memory/programs and28lanterns. Native actual2492x1402; software follows existing adaptive budget. All three variants render with the new bake. Standard missing-manifest fallback and software rendering pass.
- Standard runtime full-atlas hash equals fallback and software:6e4653ba647dadcb0899ae24f2325f03e12017b293383a7add286f73bdad8220. Full1536x4096RGBA is compared, including the worker bitmap orientation. Other two fallback receipts appended below when terminal.
- Standard matched views have identical before/after draws and triangles. Warm sample299draws/424858triangles,970geometries/103textures/81programs unchanged. No per-frame cost was introduced; this is not a whole-level frame-rate guarantee.
- Inspected final atlas crop, native range path, portrait layout and software desktop path. The path edge is less uniform; the central route and dark lighting remain readable. Broader ground composition, elevation, roots/erosion, contact and full visual parity remain open.

Artifacts: `output/level-one-path-wear/`. Before routes saved pre-change terrain modules and scene; current outputs use production modules/bakes. No other chapter surfaces changed.

## Final atlas receipt

All three native runtime/fallback suites passed. Full RGBA hashes match:

- Standard:6e4653ba647dadcb0899ae24f2325f03e12017b293383a7add286f73bdad8220.
- Eastern:420f098fb3f56b242295637ac90658a9cc6f641609044e60ebde6d63e9edc86d.
- Closing:106669a99c8d15daa0e4a1fdd7e9d2908039c4a4438a050a5c938343398df02b.

`atlas-equivalence.json` asserts those matches; `source-hashes.json` records eight final source/test/manifest hashes. The installed skill client is separately exercising normal startup and keyboard play; append its final state only after terminal completion and screenshot inspection.

Installed skill client95183 completed eight input bursts, terminal exit0. Final state7 is first_hole/ready, tutorial false, baked terrain true, player x20/progress36/travel50, no error artifact or spatial error. Inspected final shot7 and state7. Software adapted down to640x360 during this normal startup/play run; this confirms gameplay integration, not the high-resolution quality or overall performance gate. High-resolution acceptance for this pass uses the dedicated native captures. Also inspected native closing/eastern range-path captures. All owned jobs terminal, server4187 retained; full comprehensive goal remains active.
