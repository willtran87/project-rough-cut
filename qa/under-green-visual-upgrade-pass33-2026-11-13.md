# Under the Green visual upgrade — pass 33

Scope: finish the missing pump/keeper overhead identities in V09; advance approach composition V11. The full 53-item objective and all seven release gates remain in scope. Level 1 parity, whole-route composition, material cohesion and software performance are not established by this local pass.

## Implementation

The pump house gains four I-section steel beams with real wall seats, end stiffeners and sparse rivet heads, plus an eastern suspended cable rack. The existing concrete slab, machinery and irrigation pipes remain visible. Beams span the actual covered floor union from x=-27 to -13 at four bays outside the central cross-pipe. The lowest new part is 3.67m. Existing machinery materials supply the pixel textures; no new maps or lights. 162 boxes / 1,944 triangles.

The keeper room gains twenty narrow timber lining boards, three wall-supported crossbeams, retention straps and bolt heads. Grain follows each member at the existing keeper timber's 256 source texels/metre; individual pieces use different grain phases rather than repeating identical knots at identical positions. The lining meets the solid slab and ends before the gate pocket. The lowest seat is 3.55m. 29 timber meshes and 42 hardware boxes / 852 triangles, reusing existing keeper wood and machinery maps. The room now reads as a former occupied workplace, distinct from the gallery vault, bunker earth/timber retaining structure, pump steelwork and range metal service ceiling.

The combined addition is 2,796 triangles. Geometry is static and batched. No controls, collision/navigation footprints, pursuit, water timing or progression changes. No new checkpoints, banners or camera effects.

## Render grouping decision

Retained the existing shared material batches. Looking upward can submit additional existing machinery/furniture because the overhead detail extends a shared batch's bounds: the keeper ceiling fixture adds7,452 submitted triangles despite2,796 new triangles in the entire level. A separate-overhead variant reduced that fixture to2,748 extra submitted triangles, but added five more draw calls there. Direct alternating completed-frame comparison found no consistent timing benefit: native pump9.2→9.5ms and keeper9.9→10.9ms; software pump77.4→76.3ms and keeper106.2→106.4ms (merged→separated medians). These local timings include CPU/context-switch/fence polling overhead and are not a full performance-gate result.

The separate variant was removed from runtime; exact source snapshots and a reproducible comparison tool are retained. No generic render-group API remains in the game. Three inspected native views (pump room, keeper ceiling, gallery) were pixel-identical between variants. Selected final visual evidence is `pass33-complete`, forty views per renderer; `pass33-separated` is comparison evidence only. Texture and light counts are unchanged; one additional shader variant is compiled. Selected native draw increases0–7 and software0–7 across the fourteen fixtures. Submitted triangles depend on frustum/batch visibility, not only new geometry count.

## Geometry and interactions

Pure builder tests verify physical beam wall anchors, positive bounded dimensions, source UV scale on every timber face, minimum heights, pipe headroom and complete exclusion from the gate slot. Actual renderer audit verifies 48 Joe movement/windup/sweep/recovery poses below beams and the cable rack, with zero geometry collisions. Camera fixtures include standing/crouched eye height, extreme pitch, 45/85 degree FOV and portrait/landscape aspect: 2,016 positions. Gate travel is sampled at 21 fractions. Actual E pump interaction, moving handle, latched state, Q rear glance, pause and Reduced Motion are exercised in the browser verifier.

## Visual acceptance scope

The final comparison uses fourteen paired native desktop fixtures across all five districts, plus responsive 1280x720, 390x844 and 844x390, rear/pause/reduced and pump states: forty images per renderer. UI district title is hidden in QA. Keeper ceiling-only and pump-room views provide silhouette evidence independently of room-name signage. Native pump overview/ceiling, keeper ceiling and portrait entry, gallery and software keeper entry have been inspected during development. The keeper's inherited grain artwork remains an opportunity under broader V03/V04 material refinement; V09 concerns the distinct structural profiles.

No image generation this pass. Source snapshots and hashes are retained under pass33-source. Final renderer, client and isolated timing receipts will be appended after completion.


Final selected rendering receipts: combined native80783/software95429 terminal PASS40views each, no errors; native2560x1600/software960x600 in desktop fixtures. Camera2016placements and gate21fractions pass in each renderer. Actor91390terminalPASS48poses. The later separated-group experiment92399/35644 also passed40views each, but is not the selected runtime. Original material batching restored exactly; final selected native timing screenshots inspected. Actual E handle transitions/latch and Q/pause/reduced remain verified. No missing vertex-color attributes in either selected timing scene.

Isolated selected before/after timings (six warm pairs,24 alternating completed frames per fixture): native53281terminalPASS, pump median9.4→9.9ms/P9510.9→11.3, keeper10.4→10.0/P9511.6→11.8. Software12653terminalPASS, pump78.8→84.7/P9584.4→107.3, keeper92.9→109.3/P9599.6→119.0. Added visible surfaces increase software cost; its full frame-budget gate remains unmet. No other owned GPU job overlapped these measurements. An additional test-only early timber draw-order hypothesis76182 did not improve keeper timing (107.4→111.1ms); no draw-order change was applied to runtime. Source remains the selected ordinary material ordering and batching.

V09 is locally accepted for distinct overhead profiles across allfive districts. V11 remains partial for whole-route framing; V02–V06 still cover inherited material/scale/texture finishing, including keeper timber grain. Ledger24implemented/28in_progress/1pending, allseven full-level release gates pending. Ten source/test snapshots/hashes saved and verified. Final installed-client receipt follows.


Pass33 FINAL: installedclient74246 terminalexit0; finalshot4/state4inspected ready/playing,player(0,12.68),actual960x540,noerrorartifacts. InitialPreparingclicktimeout remains startup limitation. Allownedjobs terminal; tenfinalhashesmatch. Native bunker/range plus selected-budget pump/keeper screenshots also inspected. Full53goalactive24implemented28in_progress1pending/allsevenreleasegatespending.
