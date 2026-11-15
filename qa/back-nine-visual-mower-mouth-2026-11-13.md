# Back Nine mower mouth and materials — partial visual upgrade

The full 48-item objective remains active. This pass advances BV29–BV31; it does not establish whole-level visual parity or complete machinery animation.

## Implementation

- Added a recessed throat, eight beveled upper teeth, lower lip, ribbed rotating feed roller, bearings, welded side supports and hydraulic clevises. The existing authoritative cutting-deck height remains 0.68 m at rest and 0.25 m while cutting. The front chassis and grille now leave space for the opening.
- Two extending piston rods and twenty hose segments follow the actual body/deck transforms. The roller turns while cutting, freezes on pause, stays still with reduced motion and resets with a fresh run. Three fixed instance pools avoid per-frame geometry creation. Unchanged body/deck transforms skip matrix uploads.
- Added three authored 1254×1254 pixel material images: chipped green enamel, worn steel and layered rust. These were generated using built-in image_gen; original PNG copies and exact prompts are preserved in `assets/enemies/back-nine-mower/`, with runtime copies in `web/assets/optimized/`. Level 1's crafted rubber and brass complete the five mower-specific materials. The earlier all-procedural material trial looked too smooth and was superseded.
- Surface clones are restricted to the mower. Shared `vehicle-detail.js` retains its previous default geometry unless `openMouth` is explicitly enabled. No pursuit, attack, collision, destruction or checkpoint rules changed.
- Back Nine import-map versions include the new modules and updated vehicle detail.

## Verification

- `node tools/verify-back-nine-mower-mouth.cjs`: paired native before/after captures and assertions pass. Viewport 2560×1600; actual native scene 2560×1440. Raised, intermediate drop, lowered, frontal, side, whole-machine, motion and slope views captured. Also checked ordinary 1280×720 and portrait 390×844.
- `node tools/verify-back-nine-mower-mouth.cjs --software --after-only`: same animation, pause, reduced-motion, restart and resource-stability assertions pass. No console/page errors in either renderer. Inspected native raised/lowered/front/whole/slope/responsive images and software lowered image.
- Measured hydraulic anchor distance changes from 0.254 m raised to 0.681 m lowered. Eighty warm updates produce no new buffer allocations, programs or textures. Native programs remain 27; textures increase 46→51. Matched whole-machine view adds eight draw calls and 2,808 triangles (83→91 draws; 98,882→101,690 triangles). Three large RGBA maps plus two small maps require roughly 25 MB with mipmaps; this is not a performance-neutral change.
- Installed standard gameplay client, through `verify-presented-client.mjs --back-nine --mower-mouth --high-resolution`, completes two retreat/turn/stop bursts under live Joe pursuit. Player finishes at approximately (-1.41,70.12); Joe tracks the player and the deck remains lowered with the feed roller advancing. Screenshots and state inspected; no error artifacts. Software target drops from 800×450 to 640×360, so combined-load fidelity remains open.
- `verify-back-nine-terror-browser.cjs` passes raised/lowered/reduced/pause states, maintenance destruction, crushed cart presentation, relay/charger operation, no Level 2 bells, legacy-save rejection and full shed restarts through reload/Enter/R. Corrected its stale six-prop/60-piece expectation to the actual twelve-prop/120-piece scene, also checking that destruction does not increase the pool. Production destruction code was unchanged.
- Current pure terror and course-destruction suites pass: Joe-only prop destruction, swept wreck impacts, pause/reset, all 23 destructible course features and an actual live-pursuit pump-yard-cart impact. The 18-file source/asset manifest is verified at `output/back-nine-visual-upgrade/mower-mouth/source-manifest.json`; all three source/runtime image pairs match.

## Evidence locations and limits

- Final native comparison: `output/back-nine-visual-upgrade/mower-mouth/native/`.
- Final software: `output/back-nine-visual-upgrade/mower-mouth/software-final/`.
- Standard-client evidence: `output/back-nine-visual-upgrade/mower-mouth/client/`, copied from the successful run on D:.
- Terror-browser report: `output/back-nine-visual-upgrade/mower-mouth/terror-browser.json`; images at `D:/CodexArtifacts/project-rough-cut/mower-mouth/terror-browser/`.
- One client attempt failed writing its screenshot because C: was full. Only this task's superseded `native-final/*.png` captures were relocated, with hash verification, to `D:/CodexArtifacts/project-rough-cut/mower-mouth/earlier-material-trial/`. New browser temporary files and captures used D:. No unrelated cleanup was performed. The successful client rerun replaces the incomplete evidence.
- Diagnostic close cameras force the mower visible and do not update all world culling for their custom view; the slope image validates machine attachment, not the surrounding landscape. Actual gameplay and responsive captures use the real camera.
- The existing red beacon overexposes nearby metal during bright phases. BV35 still needs a measured lighting pass that retains distant warning visibility and close material detail. Portrait HUD coverage and software resolution loss remain open under BV47/BV48.
- BV29 still needs broader engine/belt/guard and object-specific wear refinement. BV30 needs acceptance across normal encounter distances and lighting. BV31 still needs independent suspension, loose panel/chain motion and broader machinery behavior. Continue the complete environment, character, atmosphere, aftermath, presentation and performance ledger.
