# Under the Green visual upgrade — pass 32

Scope: V10 retaining-wall opacity. The full 53-item plan and seven release gates remain active; this bounded fix does not establish whole-level enclosure or Level 1 parity.

## Change

Confirmed a six-centimetre gap between the retaining cap top at 4.10m and upper face bottom at 4.16m. A mesh probe found 374 open rays among 410 sampled positions. The upper faces now start at 4.08m, overlapping the cap by 2cm, and extend to 4.90m to overlap the roof. The cap height is shared through RETAINING_CAP_TOP. All 47 changes preserve material, horizontal footprint, box count and topology. Existing braces, roof panels, inspection wells, gate slot and western exposed bank are unchanged. No maps, lights, navigation or gameplay changes.

## Geometry and gate validation

`verify-under-green-retaining-seam.mjs` compares original/current builder output: 1,131 boxes and 46 additional geometry submissions, identical member positions/UVs and structural statistics. Only the 47 upper faces change; all edits are above 4.08m. 4,920 actual mesh raycasts across twelve heights pass. The unchanged western bunker bank has a separate continuous strata cross-section and is explicitly excluded from this test. The original 410-ray seam probe now has zero misses.

`verify-under-green-seam-gate.cjs` passes 21 gate positions with no point or box collisions through the moving interior bars/crossbars. Side insertion into guide housings is intentionally outside that existing audit's scope.

## Native rendering

Final native verifier completed 34 views at 2560x1600, with responsive 1280x720, 390x844 and 844x390 checks, Q rear glance, pause/wait and Reduced Motion. Paired draws, submitted triangles, programs, textures and lights are unchanged. Player/Joe states match. No console/page errors.

A temporary bright magenta plane placed outside the retaining wall provides an occlusion negative control. At 14m/19m, the original seam leaks 348/262 native pixels; the fixed scene leaks zero. At 4m both are occluded by the projecting cap lip. The initial near-distance expectation was corrected for that real geometry, and the camera pitch aligns the distant slit with a render pixel centre to avoid subpixel false negatives. Sentinel geometry exists only in the test. Before/after 19m screenshots were inspected.

## Software and client

The initial software test rejected a 12-triangle difference in visible submission. This is one existing box entering the frustum after resizing, not added topology. The pure builder comparison proves topology preservation. The browser assertion now bounds submission changes to the 47 resized boxes; the final report records actual deltas. Final software receipt follows below.

Installed skill client completed five bursts (exit 0). Final screenshot/state inspected: ready/playing, player (0,12.68), actual 960x540, Joe absent, no error artifacts. Its initial five-second click timed out while the button was still Preparing; later input entered gameplay. This is not startup-time acceptance.

## Remaining visual priorities

Continue the full plan: coherent material/actor pixel scale; less recognizable surface repetition; pump/gallery/keeper overhead composition and transitions; district approaches in both directions; remaining water, props, actor and presentation polish. Compare against Level 1 at matched actual render resolution. The complete 53-item list is the finish standard, not a claim that every item is already accepted. Full software frame performance remains unresolved; no new timing claim from this pass.


FINAL: software session5351 terminal PASS34views, zero errors, actual desktop960x600 inside2560x1600 viewport. Same draws/programs/maps/lights; range-east submits12 additional triangles from one resized existing box entering the frustum, every other pair unchanged. All three after-sentinel positions report zero magenta pixels. Software far-sentinel/native portrait and installed final gameplay screenshots inspected. Earlier software sessions76156/70897 failed the old exact-submission assertion;70897 had already loaded that assertion before its correction. Neither indicated a runtime or topology regression. All owned jobs terminal, five final source hashes saved and verified. Ledger remains23implemented/29in_progress/1pending; allseven full-level gates remain pending.
