# Back Nine experience pass 11 — landmarks and grounded lighting

The full 38-item goal remains active. The preceding goal reply restated the roadmap without implementation progress; this continuation recovered terminal verification artifacts, completed the pending landmark checks, corrected moon shadows and verified the final runtime. No subagents or human testers. Other chapter/settings changes were preserved.

## Runtime changes

- Added three authored identities to existing structures: an irrigation header tank and ladder, a covered night-range service bay, and a stopped clubhouse clock. The 54 parts / 996 triangles use existing static batching, no new textures or lights. Supports remain within existing solid footprints. No course collision or navigation data changed.
- Confined independent slow electrical faults to the two service fixtures and existing clubhouse windows. Navigation lanterns retain at least 68% of their base brightness even during a circuit dip. Garage/shelter cue materials remain separate. Zero flash and reduced motion keep fault fixtures steady. Clock face uses a dim existing shader type so it remains legible; the first painted-face candidate was too dark and was replaced before final verification.
- Moon silhouettes now project away from the actual directional light, with length derived from tree height and light elevation. Stationary trees no longer have independently swaying shadows. Cloud attenuation fades shadow contrast. Selection responds to sideways movement even with frozen time/reduced motion. Fixed scratch arrays and cell caching avoid time-only matrix uploads; the existing eight-instance/one-draw budget is retained. Dynamic beacon shadows remain separate unfinished work.
- Import-map cache versions for scene/night/landmarks are `20261112-landmarks-2`.

## Evidence

Artifacts: `output/back-nine-experience/landmarks/`. Pre-pass sources remain in its `baseline-source/` directory.

- `verify-course-landmarks.mjs`: actual transformed vertices stay inside the existing pump/range footprint or on the clubhouse facade. Navigation signature remains 2693326411, 4410 baked nodes, zero fallback edge checks. Three fault patterns sampled over 3600 frames: minimum gain .586–.592, maximum per-frame change below .01; comfort fallback steady.
- `verify-course-moon-shadows.mjs`: 24 rendered instance projections checked against independent ray/ground intersection; 3600 stationary time updates produce no matrix uploads; lateral relocation, cloud contrast, changed light direction, below-ground light and disposal pass.
- `verify-course-landmarks-browser.cjs`, hardware and SwiftShader: four viewpoints (pump, range, club, planting) at 2560x1600, 1280x720 and 844x390. Twelve lighting combinations cover reduced motion, flash 0/.5/1 and circuit dip 0/1. No runtime buffer allocations, new shader programs/textures or browser errors. Existing counts remain 18/23 programs and 36 textures. Screenshots inspected; route surfaces/openings remain visible and the corrected clock reads at driving distance. These viewpoints do not establish whole-course darkness/composition acceptance.
- Existing full-route output reports PASS, as do the five cart/three foot gaps, reconnecting branches, late impact/ejection/on-foot garage/retry checks. `verify-chase-drama.mjs` rerun passes protected landing, 35.529 m committed charge/miss/recovery, quiet banner/optional caption behavior and spoiler-free opening. Rendering-only shadow changes did not alter simulation.
- Installed standard gameplay client run through `verify-presented-client.mjs --back-nine --pump-yard`, actual accelerate/steer/look-back/brake input. Final page/canvas/state inspected: cart (16.470,169.935), 100 health, no hits or error artifacts. Final output is `client-final/`.

## Performance

Final completed-GPU ABBA benchmark: SwiftShader at 960x540, 96 measured moving samples per version per view. Values are milliseconds, baseline → final; they are not displayed-frame FPS or a sustained hardware playtest.

| View | Median | p95 |
|---|---|---|
| Pump | 27.0 → 27.9 | 32.8 → 33.0 |
| Range | 26.9 → 26.9 | 29.9 → 31.7 |
| Club | 33.0 → 33.1 | 40.0 → 42.0 |
| Foliage/mower | 38.8 → 38.0 | 55.0 → 46.9 |

No runtime buffer allocations. Landmarks add approximately 0–2 visible draws in sampled views. Timings are broadly similar; tails vary, and maxima still reach 55.9 ms. No broad frame-spike fix is claimed. A prior run overlapped another browser client and is retained as `moving-performance-contended.json`, not used for the conclusion. The final `moving-performance.json` was run after this pass's other browser jobs ended.

## Remaining acceptance

Purposeful fixture flicker is implemented and checked. Landmark navigation, darkness and shadows are only partially accepted: wider route/readability review, physically sourced moving-light shadows and beacon cover/occlusion remain. A moon-shadow correction must not be counted as completion of the requested moving shadows. Whole-course composition, sound direction/occlusion, environmental story, supernatural restraint, dialogue/variation and remaining animation/retry/performance work stay in the full ledger. Human landmark/flicker recognition questions are prepared for later; no human balance findings are claimed.
