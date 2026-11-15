# Under the Green visual upgrade — pass 13

Full objective remains all53visual requirements and seven release gates. Previous pass made concrete spray improvements but left small-target readability open. This pass addresses V23 readability and V49 physical signal finish.

## Spray footprint and light transmission

Billboard footprint now uses actual render-target height and the camera projection. It aims for a2.5pixel plane width where possible, capped at2.8x scale,6.5cm world width and10cm length. This is a lower-resolution readability aid, not a global pixelation/blur filter; near high-resolution particles retain their physical dimensions. World positions, trajectories, counts and timing are unchanged. There is no opacity or emissive compensation. Pure checks cover8640height/FOV/depth/seed cases with continuous distance response and bounded sizes, alongside663552existing trajectory samples.

Also found a shading cause: camera-facing particle planes rejected lamps behind them, making backlit water artificially dark. Added a restrained back-light diffuse term from the same actual practical sources:35percent for droplets,18percent for impact mist, zero for ground ripples. Ordinary front diffuse/specular response and the silty saturation treatment remain. This is an inexpensive authored transmission approximation. All effect materials retain zero emissive color, ordinary alpha blending and depth testing.

Footprint-only initial hardware29773/software84935 tests pass eight before/after views each. Software76019 includes transmission and passes all eight views with unchanged world positions. At844x390, software pixels with at least3levels of positive droplet contribution increased850→1689; native hardware footprint-only1693→2673. These are comparative visibility measures, not a human readability score. Final combined hardware/software runs additionally test lamp dependence, timing, pause/rear/reduced behavior and GPU-completed frame times; pending below.

## Physical signal finish

All96symbol faces now share normalized physical UVs (the chevron previously sampled only a corner of the glass artwork). Added a shallow12mm glass crown, recomputed normals/bounds, a128px shared fluted-glass image with restrained shade steps, scratches and lower dirt. The inactive symbols use the same artwork without emission.

Each of16two-sided signal housings gains circular recessed seats and solid curved open-bottom hoods. Hoods have real inner/outer/end surfaces; no one-sided sheet disappearance. Everything stays within the previous housing bounds. Existing material batches absorb the geometry, with no new light, texture slot, obstacle, hazard timing or input binding. The existing red circle/amber triangle/green chevron coding remains unchanged.

Final signal-finish hardware47815/software14874 pass16housing bounds and96lens UV/depth checks, five before/after contexts (low,warning,surge,oblique,rear) plus1280x720,390x844,844x390. Native hardware2560x1600; software actual960x600 in the high viewport. Inspected native low/warning/oblique and software low. Zero browser errors. Initial hardware94407 preceded final glass-contrast tuning and is superseded.

Existing state-contract browser9995 passes120cases across all channel types and four viewports. Existing actual-actor geometry1094 passes three wet-route threat poses. Installed skill client34779 exits0: five image/state pairs, final playing(0,16.52), opening inactive/completed,960x540. Finalshot4inspected; no errors artifact. Five source snapshots retained.

## Framing harness corrections and pending work

The older framing harness initially failed because Sprite.raycast requires its camera. Setting the raycaster camera fixes the inspector. It then exposed a pre-existing undefined offset in pump-return fixtures; event-controlled waters now use a finite zero cycle offset. The next run92561 reached its final touch crossing but failed because the intro overlay had never been skipped; inspected captures confirmed the intro. It terminated before replacement. The corrected harness explicitly skips and asserts the opening inactive before testing gameplay. Its replacement is live; await its authoritative handle and inspect actual gameplay captures. Earlier intro-covered captures are not visual acceptance evidence.

Remaining: finish framing/physical camera clearance and normal touch crossing; final combined particle/light/performance runs. Full Level1 parity, scene/material acceptance and software performance remain open. V23/V49 ledger entries stay in_progress pending final receipts; all53requirements/seven gates retained.


## Final framing and hardware receipt

Corrected framing35335terminalPASS:4176documented centered approach cases,20gameplay captures,576actual mount/camera-clearance poses with zero hits; ordinary touch crossing reaches the far bank with zero water hits and opening inactive. Inspected fresh1280x720low-flow and390x844crouched sluice gameplay, replacing the invalid intro-covered evidence. Final signal-finish snapshots show unchanged draw/texture counts in the rear close view: hardware87draws/61textures and software79draws/61textures, with1344additional submitted triangles in that view.

Final combined hardware25206terminalPASS: eight matched before/after views, unchanged droplet world positions,6.5cm/10cm dimension caps, pause/rear/Reduced Motion, zero emissive and actual practical-light response. At844x390, pixels with positive droplet contribution of at least3levels rise1693→3256 (software final pending). Native2560x1600changes chiefly from correct backlighting, not forced enlargement of nearby particles. Fixed-black-background particle-only light probe: actual practical sources raise current particle framebuffer energy109055→165256 (+51.5percent), against the unchanged ambient/player lighting. The earlier composite-contrast probe was invalid for this purpose: switching lamps off darkens the wall behind the particle and can increase its contrast while its actual illumination decreases. Replaced that probe with the fixed-background measurement; did not change runtime lighting to satisfy it.

Hardware GPU-completed960x600median11.0ms before/11.9after, p9514.9/13.9. Six warmups/24samples per version, normal motion, sequential versions. This pair measures the spray changes with the new signal geometry present in both; it does not isolate the hood cost. The verifier waits for other named Node render workloads to finish before timing and records a bounded verified wait when needed. No full production performance acceptance is inferred. Final combined software run is live. All production source files remain unchanged since the installed-client receipt/snapshots.


## Final software receipt and item acceptance

Combined software22147terminalPASS after waiting for the confirmed external render profiler to finish. Eight matched views, same world positions/counts, bounded footprint, rear restore, pause, Reduced Motion and zero browser errors. At844x390, positive droplet-contribution pixels at least3levels increase850→1689; total positive maximum-channel contribution5525→11121. The actual translucent spray remains restrained. Inspected final software portrait and earlier current landscape/keeper views. Fixed-background particle light response rises53093→81658 (+53.8percent) with the practical sources enabled, with zero emissive material color.

Final software GPU-completed960x600median145.0ms before/147.1after; p95150.0/151.1. This records a roughly2.1ms incremental median in the sampled crossing; full fallback performance is still inadequate and the release gate remains open. Hardware and software sampling each begin only after other named Node render jobs are absent. The on-screen contribution probe measures against the unchanged same-state world within each version; the separate light probe intentionally uses a fixed black background so scene brightness cannot invert the interpretation.

All five production files match the post-change snapshots byte-for-byte. Installed client34779receipt remains applicable to this exact runtime. All owned runs are terminal. V23 is implemented against the bounded natural-spray/readable-pressure requirement, and V49 against the physical signal/lens/shape-plus-color requirement. These local acceptances do not accept V25full reflections, V34whole-level dark-value grading, V51HUDcraft, Level1parity or any of the seven full-level release gates. Ledger now8implemented of53; full objective stays active.

Next priority: profile current ordinary rendering components before choosing geometry/shader reductions; the existing software performance gap is much larger than this pass's incremental cost. Continue the remaining materials/root/mud/actor/shadow/prop/UI requirements. Preserve all17fixed sources, solid wall depth, shared movement/E/Q, no checkpoints and quiet action/noise presentation.
