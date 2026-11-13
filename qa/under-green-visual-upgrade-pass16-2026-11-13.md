# Under the Green visual upgrade — pass 16

Scope: V16 selective moss and feeder roots; V19 differentiated damp growth. All 53 requirements and seven release gates remain in scope. This is local feature qualification, not whole-level Level 1 parity or frame-time acceptance.

## Changes

- Replaced the 42 regularly spaced moss beads with 12 irregular, continuous moss patches tucked around the six authored root entries. Added five low algae films, six historical tide stains, three narrow mineral runs and two small pale fungal patches: 28 patches total.
- A new 1024 × 256 pixel atlas uses coordinated, distinct motifs: forked moss leaves, connected olive algae films, broken gravity-driven mineral runs and layered fungal arcs. Sharp magnification and mipmapped minification preserve the existing rendering approach. The material separates their specular strength and highlight width without additional texture samples or an animated shader.
- All patches are shallow opaque meshes with irregular outlines and darker edges, sharing one source material and six spatial batches. No emissive growth, transparency, alpha cards or new dynamic effects. Geometry totals 1,372 vertices / 2,016 triangles. The added atlas is approximately 1.33 MiB of RGBA8 storage including a full mip chain; this is a format estimate, not a GPU memory measurement.
- Added 15 fine ceiling feeders on hardware / 9 on software at three selected knots. They attach to existing limbs, taper strongly and stop above 2.7 m. Existing 48 / 24 wall hairs remain. Most wall/ceiling intervals stay quiet.
- A physical receiver test caught patches floating in front of the bunker's upper bank. Those patches now follow the real earth face set back from the lower masonry. Final tests include the bank geometry as a receiver and check every patch vertex. Close-view review also prompted a darker mineral base and more irregular silhouettes to reduce the clean decal appearance.

## Verification

- `verify-under-green-growth.cjs`: final hardware session 94949 and software session 46327 passed. Each captured 16 matched before/after views across six entries, a low waterline and a ceiling knot. Actual hardware render size was 2560 × 1600; software was 960 × 600 within the same viewport. Zero browser errors. Both paths checked all 1,372 growth vertices against physical masonry/earth, with zero unsupported vertices and valid normals. Opaque/depth-writing materials, atlas size, triangle count and authored patch count passed.
- Final close-view screenshots were inspected for entrance, bunker, junction, pump, low waterline and ceiling; software entrance and bunker were also inspected. Pixel atlas inspected directly. Growth stays restrained in the existing lighting; broad scene lighting and material cohesion remain separate unfinished work.
- Compared with retained pass15 source, final native sampled views add zero or one submitted draw; software adds one only in the low-waterline view. Both add one texture. These are view-specific count comparisons, not frame-time qualification. No isolated timing was performed.
- Final `verify-under-green-environment.cjs` session 71394 passed 30 views at 2560 × 1600, 1280 × 720, 390 × 844 and 844 × 390. The run checks 172 opaque roof rays, 3,168 camera placements, 21 gate-travel fractions, movement/crouch/Q, pause, 45°/85° FOV and Reduced Motion. Zero errors. Final artifacts: `pass16-environment/hardware-final`.
- Dry rendered route session 84490 passed 1,379 frames and 106 Joe/body/scythe geometry audits, with zero intersections and maximum foot error 2.415e-7 m. This preceded only contraction/darkening of patch outlines and the final upper-bank placement adjustment; final receiver and camera checks cover the resulting geometry. It does not establish ordinary software frame pacing.
- Root geometry verifier still passes 138 builds, 15,933 vertices, 32 collars, 1,869 seam checks and 423 pillar vertices.
- Final installed development-skill client session 39688 exited 0 with five screenshot/state pairs, no error artifact, opening completed and inactive, and gameplay at (0, 16.52), actual render size 960 × 540. Final screenshot and state inspected.

## Status and next work

V16 and V19 are implemented for their local scope. The ledger now has 11 of 53 items implemented; all seven release gates remain open. V15 still needs final entry composition/material acceptance. New growth does not finish the larger mud, architecture, pixel-density, surface-noise, lighting, actor or performance requirements. The next major improvement should address coherent material pixel clusters and dark-value separation (V02–V06 / V34) before adding more decorative layers. Full matched Level 1 and movement acceptance remains required.

Final source snapshots and SHA256 records are retained in `pass16-source`, alongside the pre-pass atmosphere/composition files. No changes to navigation, input, AI, checkpoints, banners, flooding or other chapters; no commit, deletion or deployment.
