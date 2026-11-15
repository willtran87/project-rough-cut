# Under the Green visual upgrade — pass 34

Scope: V02–V06 keeper timber material craft and sampling. The full 53-item plan remains active; these broad requirements remain partial. This pass does not establish whole-level Level 1 parity, release readiness or a completed software performance gate.

## Selected artwork and integration

Built-in image_gen produced `assets/environment/under-green/keeper-timber-v1.png`; the identical native PNG is copied to `web/assets/under-green/keeper-timber-v1.png`. Full generation prompt: `assets/environment/under-green/keeper-timber-v1.prompt.md`. Requested2048square, delivered1254square; no resampling or image edits. The selected image uses muted gray/olive-brown longitudinal fibers, irregular sparse knots/splits, quieter worn regions and localized damp staining. It replaces the inherited512square canvas grain and its repeated concentric knots on the keeper ceiling, beams, desk, cabinets, rack trim and rake handle.

The four-metre field yields313.5source texels/metre, matching the architectural masters. Ceiling UVs retain grain along each physical member with independent phases per piece. Furniture and dark timber variants use the same explicit physical scale. The color texture supplies neither bump nor gloss: existing matte material response and real joinery stay independent. Nearest magnification and mipmapped minification are preserved. No new geometry, material families, maps, lights or shader flags. The new map replaces the previous wood map one-for-one.

The new image is decoded before room construction. Independent architectural, machinery and timber asset preparation now run together; no startup speed improvement is claimed from that source change alone. Runtime exposes actual source dimensions, four-metre span and313.5density in the keeper-workspace stats.

## Verification

Native4726 and software53886 both terminal PASS32views: eleven paired desktop fixtures (ceiling, beam, entry/return, close desk and boot rack, tool rack, gallery/pump controls), plus1280x720/390x844/844x390 views, Q rear glance, pause/wait and Reduced Motion. Actual desktop targets2560x1600native and960x600software. All paired draws, submitted triangles, texture counts, shader counts, fixed lights, player and Joe states match. No console/page errors.

Browser audits hash actual position, normal and index buffers of all285structural meshes before/after: identical. Three real keeper timber batches use1254square artwork at4m span; bump/specular maps remain absent and filters match. Camera-away-and-return produces identical framebuffer hashes within each renderer. Updated pure overhead verifier confirms physical UV edge scale, unchanged geometry and preserved gate aperture. No gameplay/collider changes warrant repeating the previous full actor/gate route suite; pass33 remains the physical clearance evidence for the unchanged structures.

Native ceiling and close desk screenshots inspected: fibers/wear are richer, concentric ring repetition removed, records remain readable and the room remains dim. Native gallery/pump control screenshots are pixel-identical before/after. Final installed client28401 terminalexit0; screenshot/state inspected ready/playing at(0,8.84),960x540, no error artifacts. Initial five-second click while Preparing timed out; subsequent input entered play. No startup acceptance claim.

## Cost and limits

Encoded new PNG2,686,964bytes. Replacing512square with1254square adds approximately6,988,651bytes of RGBA storage with a full mip chain (about6.7MiB); actual driver allocation can differ. Equal texture counts do not imply equal memory or upload cost. Isolated timing receipts follow after completion.

The material still repeats on a four-metre period. This localized improvement does not complete V04's whole-level variation criterion or the broader prop/actor coherence requirements. Other inherited surfaces, meaningful floor/debris treatment, route framing and software frame budget remain in scope. Ledger unchanged24implemented/28in_progress/1pending; allseven release gates pending.


FINAL: isolated native3406/software95478 terminalPASS, six warm pairs followed by24alternating GPU-completed frames per fixture, no overlapping owned GPU jobs. Native desk median9.2→8.5ms/P9511.2→10.2; ceiling11.2→10.0/P9513.3→12.8. Software desk off median 59.5ms/P95 63.4ms, on median 61.4ms/P95 63.4ms; ceiling off median 102.8ms/P95 106.9ms, on median 104.8ms/P95 111.4ms. Fence durations include CPU/context-switch/poll overhead; local native variation is not a general performance-improvement claim. Software frame-budget gate remains unmet. Actual native/software textures, draws and geometry counts remain identical. Native portrait desk and software close boot rack also inspected. Allownedjobs terminal; source/asset hashes verified. Full53goalactive,24implemented28in_progress1pending/allsevenreleasegatespending.
