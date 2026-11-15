# Back Nine visual upgrade — ground and rendering pass

The active objective remains all 48 visual improvements, with Level 1 as the minimum bar. This pass is partial; `design/back-nine-visual-implementation-ledger.json` records every requirement. No whole-level completion claim.

## Implemented

- Added dedicated 1254×1254 pixel-art turf with clipped blades, clover, straw and soil gaps. Built-in image_gen produced the source; the exact prompt and PNG are preserved under `assets/environment/back-nine/`. The 2,101,208-byte runtime WebP decodes to identical RGB pixels. It replaces the conspicuously repeating 256-square illustration crop for Back Nine only.
- Added `back-nine-surface-finish.js`. Ground shadow fill now retains the surface artwork instead of replacing it with nearly constant vertex color. Macro growth variation runs per vertex; turf uses one texture read and no per-fragment power operation. Other materials retain their established source exposure. Tonal quantization increased from 48 to 96 steps to reduce visible lighting bands.
- Slightly raised cool hemisphere/moon light while retaining cloud shadow variation. This improves existing terrain-form readability; broader lighting/beacon work is outstanding.
- Fairway cross cuts now bow across each authored hole with continuous strip joins. Greens have a multi-ring blended fringe and finer texture density. Bunker sand has derivative-filtered rake grooves and damp edge tint. Footprints, richer banks, missed strips and extra texture variants remain outstanding.
- Hardware render dimensions follow the displayed stage up to 2560×1440, retaining nearest-filtered artwork, the existing software budget and explicit quality preference. At 2560×1600, all seven native test views reported actual 2560×1440 render buffers. At 1280×720 the buffer remains 1280×720.
- Added reusable fixed-view capture tool and a current synchronous/asynchronous landscape-equivalence verifier. Corrected the old Level 1 comparison tool to select `#game` after additional canvases made its generic selector ambiguous.

## Evidence and checks

- Baseline: `output/back-nine-visual-upgrade/before/`, captured from the actual current build before production changes.
- Final native views: `output/back-nine-visual-upgrade/native-resolution/`. Inspected fairway, green, bunker, maintenance, flood, ordinary desktop and portrait captures. The generated turf removes the obvious checker-like tiling and reveals close blade detail. Terrain, props and camera remain in the same world positions.
- Fresh Level 1 comparison: `output/back-nine-visual-upgrade/level-one-reference-native-2560.png` and `level-one-shared-art.json`. Shared-source checks and actual gameplay entry pass. The current reference is very dark; use it alongside stronger existing Level 1 artwork, not as permission to lower the visual bar.
- `node tools/verify-back-nine-ground-art.mjs`: passes exact current sync/async construction equivalence (1,737 pieces, 500 cooperative yields), unchanged course data and navigation state.
- `node tools/verify-back-nine.mjs`: passes movement, pause, boundaries, Joe pathing/knowledge, defeat/retry and 12 complete driving/ejection routes.
- `node tools/verify-back-nine-detail.mjs`: passes six ghost loops, 4,816 clear-path plants, bounded clippings, pause/reduced/reset and spatial culling.
- `node tools/verify-back-nine-experience-upgrade.mjs`: passes all 14 interaction/simulation contracts.
- Final `node tools/verify-back-nine-experience-browser.cjs`: passes actual keyboard valve/rolling-cart/shutter/garage victory, ghost behavior, silence, reduced motion, pause and both restart paths, with zero page/console errors. Report copied to `output/back-nine-visual-upgrade/experience-browser-final.json`. Hardware resources stable at 25 programs / 46 textures, including after reset. The one additional program is the sand/rake material; no extra texture handle is allocated for the replacement turf.
- Installed standard game client was run after meaningful iterations. Initial dual-sample grass and later per-pixel power versions dropped the software presentation to 640×360 and were replaced. `client-authored-fast` maintains 960×540 in both actual driving/braking bursts. The first final run dropped to 800×450. The native-resolution calculation was then restricted to hardware so software no longer reads layout after UI updates. Final current-source run `client-final-no-layout` retains 960×540 in both bursts; screenshots/state inspected and no error artifact. This short result does not establish a universal software performance guarantee.
- High-resolution native capture sampled a 22.1 ms completion P95, and the complete interaction browser sampled 12.2 ms after its viewport changes. These short harness samples are not a sustained FPS or combined-load acceptance claim.

## Remaining scope / next actions

- All 48 requirements remain subject to full acceptance; 11 are in progress and 37 pending. Existing gameplay features are not treated as proof of the requested visual quality.
- Next: distinct rough/dead/soil artwork, organic route edges and meaningful planting/maintenance scenery; upgraded flood/sprinkler visuals currently remain a conspicuous flat dark overlay.
- Then continue the complete ledger: district/landmark composition, architecture and weathering, player/Joe/mower detail and animation, material-specific aftermath, controlled beacon/headlights/contact shadows, weather/ghost/environment motion, finale/camera/UI and combined-load fidelity.
- Level 1 production code, other chapters, collision/routes, checkpoint policy and bells were not changed. The existing server on port 4187 is preserved. No deployment, commit or goal-completion action.
