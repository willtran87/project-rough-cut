# Final Cut — authored vegetation and physical response

This pass completes FV21, FV22, FV25 and FV26. The complete 72-item goal remains active: 8 complete, 25 in progress and 39 pending. Standing cutting-sector rough still needs its own authored finish (FV23); it has not been counted as complete.

## Art and placement

The built-in image_gen tool produced `assets/environment/final-cut/reed-clumps-v1.png` (1536x1024 RGBA). Its full prompt is `assets/environment/final-cut/reed-clumps-v1-prompt.txt`. `web/assets/optimized/final-cut-reed-clumps-v1.webp` is a lossless encoding with the original alpha preserved.

Three clumps have thin stems, alternating arching leaves and irregular seed heads. They replace the old half-metre-wide procedural blades, using bent world-rooted planes and matching color/depth silhouettes. The six stands retain their actual world locations. Inner height/density provides cover; shorter margins and variable crowns make the outer silhouette less uniform. The low verges now use uneven groups, dominant local species and deliberate gaps rather than evenly repeated shrubs. Close and strafing screenshots were inspected.

## Physical response

`final-cut-plant-contact.js` records actual simulation movement in a bounded per-run WeakMap history. Spatially indexed plant roots use the existing body/reel collision geometry. The shader bends contacted plants from their roots and recovers over 3.6 seconds. It does not push plants in the empty space behind the wings. Simulation history preserves contacts when presentation frames are skipped, and repeated rendering cannot advance the reaction. Pending GPU update ranges are bounded even when a batch stays offscreen.

Hidden setup travel does not disturb visible planting before its warning. Coherent low-amplitude ambient wind, stronger localized rustle and actual contact remain separate. Reduced motion removes ambient oscillation while preserving the warning and physical response. Color and depth shaders share the same deformation.

## Evidence

- `output/final-cut/visual-reeds/sightlines-dense/occlusion.json`: **48/48 exact pixel matches** between a hidden-mower capture and its diagnostic no-mower counterpart. Four directions, near/far positions, three lateral offsets, standing/crouched, at 2560x1600. Initial four-view tests missed ten oblique canopy leaks; the expanded audit found them. Taller, denser inner growth fixed them. The failed original evidence remains in `sightlines/`.
- `final-software/report.json` and `final-software/occlusion.json`: all four directional attack/escape fixtures pass, with four pixel-identical hidden-mower pairs. Includes pause, spatial rustle, rider contact, compact viewports and muted/reduced warnings.
- `contact.json`: four headings, actual body/reel contact, empty wing wake, analytic settling, new-run reset, repeated-render invariance, 30/60/120Hz simulation and two seconds without presentation pass. Pause freezes recovery; staging travel does not leak a contact tell.
- `motion/report.json`: close vegetation, real keyboard strafe, simulated emergence, wake and recovery. The pass touched both reeds and verge plants; both returned to zero active responses after recovery. This motion capture predates only the final inner-density increase.
- `final-hardware/report.json`: actual framebuffers 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844; no horizontal overflow. Hardware quality tiers and persistence pass. Seven fixed views, no browser errors. Desktop opening and portrait composition inspected.
- `routes/browser.json`: direct, garage and drain routes complete with ordinary Gamepad input, no live-state route placement, zero captures and no errors. Pump, bell, collapse, road and completion included. These routes use the new art and contact simulation; they precede only the final increase to inner reed density.
- `verify-final-cut-mowing.mjs` and `verify-final-cut-rig.mjs` pass, including real cut-state persistence, 2,000 independent collision comparisons and multi-rate contact behavior.
- `client/state-0.json`: the installed client completed the intro and actual movement to y=9.531, ready/playing, and its software screenshot was inspected. The initial five-second click timeout was a warmup issue. The final keyboard-only run in `client-final/` also completed the intro and movement to y=9.531, ready/playing, without the initial click timeout or an error artifact; its screenshot was inspected.

The earlier `accepted/report.json` profile showed stable GPU resource counts and 3.1–3.7ms median completed draws on an RTX 3090. This was a short moving-camera sample before the final density increase, not sustained gameplay FPS or a complete performance budget. Software overdraw, worst-case effects and full memory budgeting remain FV71 work.

## Remaining scope

Finish standing cutting-strip rough, ground variation and physical terrain; masonry repetition/corners and architectural identity; close mower materials/parts and Joe's face/acting; effects and wreck aftermath; story continuity, UI and all remaining acceptance gates. The new vegetation does not establish overall Level 1 parity.

## Subsequent coordinate audit correction

The expanded 48-view fixture above used a stale hardcoded north/south x=21.5. It is superseded by `output/final-cut/visual-rough-stone/shared-sightlines-final/report.json`, which imports the actual shared 22.8m corridor. All 48 corrected pairs are pixel-identical. See `qa/final-cut-visual-rough-stone-2026-11-13.md` for the subsequent rough/masonry work and current counts.
