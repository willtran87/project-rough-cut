# Under the Green visual upgrade — pass 15

Scope: complete V13 sculpted root cross-sections, advance V15 root/masonry soil contact. Preserve all 53 requirements and seven release gates. This is local feature acceptance, not full Level 1 parity or performance acceptance.

## Production changes

- New construction-time root geometry helper replaces the identical two-swell profile repeated on every root. Stable world-derived seeds vary burls, taper modulation and the position of longitudinal bark clefts. Unequal lobes break the circular hose-like section. Authored main limbs grow collars around actual branch attachment positions; the geometric width and color shading follow the same shape.
- Illustrated bark retains its existing texture density and filtering. A vertex-color attribute adds restrained broad ridge/cleft shading without a new texture or fragment-shader effect. Coincident normals at the duplicated tube seam are averaged, removing an artificial lighting seam while preserving UVs.
- Lower wall growth retains its20cm boundary allowance. Above2.3m the authored thick forks gradually gain depth, reaching at most32cm by3.1m. This addresses the flat-strap appearance without expanding body-height obstruction. The gallery pillar remains within its existing1×1m collision footprint.
- Root contact ribbons use the same new width profile and retain their clipping to actual masonry receivers. Added18small soil deposits beneath displaced mortar at the six authored root entries, using the existing mud material and static batching.
- The inspection-well's fine roots now supply neutral color attributes so they remain compatible with the shared root batch. An early browser run caught the mixed-attribute merge failure; that failure was fixed before final scene/route acceptance. No source texture regeneration, camera filter, navigation/input/AI/water/checkpoint/banner change.

## Evidence

- `verify-under-green-root-geometry.mjs`:138authored root builds over both quality paths,15,933vertices,32branch-collar checks,1,869seam checks,423pillar vertices below2.3m. Finite/unit normals, deterministic output, declared intrusion bounds and original triangle topology pass.
- Final `verify-under-green-environment.cjs` run68220:30views at native2560×1600,1280×720,390×844,844×390;3,168actual camera geometry placements;172opaque roof rays;21gate-travel fractions; W/C/Q input, pause,45°/85°FOV and Reduced Motion pass. Zero errors. Artifacts in `pass15-environment/hardware-final`. Earlier `hardware` captures precede the final upper-depth refinement.
- Final before/after root verifier9823hardware and71186software:12matched views each across entrance, crossing, pillar, bunker, pump and keeper. Hardware renders2560×1600; software renders960×600 at that viewport. Root batches remain16. Full root geometry remains83,199vertices/413,520indices native and42,664vertices/196,686indices software. Texture count stays69 in these close fixtures. Soil/culling changes cause up to one extra submitted draw in sampled views; do not equate unchanged root topology with unchanged whole-frame cost.
- Final contact verifier90930:10views,239physical receiver rays,70,012positive-alpha ribbon vertices checked against5,168actual masonry triangles; zero unsupported vertices. Contact shade only darkens, remains two draws, and follows actual flood/foot positions. Its optional timing overlaps the native root comparison and is not an isolated performance result.
- Full dry-route rendered replay37523:1,379frames,106Joe/body/scythe geometry audits, zero intersections, maximum foot error2.415e-7m. This is a deterministic route replay, not a claim of ordinary real-time software pacing.
- Final installed development-skill client52737 exited0 with five screenshot/state pairs. Intro completed, `under_green_playing` at(0,16.52), actual960×540, no browser error artifact. Final screenshot/state inspected.

Native entrance/crossing/pillar/bunker/keeper/pump close views and matched software bunker before/after were visually inspected. Bark, branch collars and clefts read as wood; the upper root has more volume under the bunker lamp. Existing masonry fine noise, moss clump regularity, and dark-room material separation still need the separate V03/V16/V28/V34 passes. Those limitations remain open rather than being hidden behind the root-shape acceptance.

## Scope and remaining work

V13 is implemented with this evidence. V15 advances through soil deposits and updated grounding, but its full six-entry material/composition acceptance remains in progress. V14's route-wide density/composition, V16's natural moss/feeder treatment, V17–V19's sediment/growth family, other materials, lighting, actors, props and presentation remain in scope. All seven release gates remain open, particularly software frame delivery and matched Level1 comparisons.

Five final production snapshots and SHA256 records are retained in `pass15-source`; original atmosphere/composition/contact files are retained with `-before` suffixes. Comparison-only baseline well geometry removes exactly the new neutral color attribute to reproduce the former batch schema. No deletion, commit, deployment or other chapter runtime changes.
