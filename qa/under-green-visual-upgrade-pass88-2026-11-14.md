# Under the Green pass 88 — omit fully blocked static lights

The software renderer now omits a practical light from a static batch only when its entire relevant surface is behind a closed opaque wall. This retains pass 87's enclosure shadows while avoiding some lighting and shadow sampling that cannot contribute to the image. The preceding goal turn made progress by implementing those shadows; this turn addresses their measured cost. The full 53 requirements, 48 refinements and seven release gates remain active.

## Implementation and proof boundary

- New `web/under-green-light-occlusion.js` checks a convex wall-shadow volume. A receiver must lie beyond a wall's far-face plane, and all eight corners of its expanded bounds must be blocked by that same wall. Near-wall, opening, inside-light and uncertain cases retain the original lighting path.
- Bounds expand by `3*reach/tileSize + .035 + reach*.003 + .02`, covering neighboring comparison-filter texels and depth bias. The current 13m lights and 128px shadow faces produce approximately 0.399m of additional margin.
- The occluders come from the same carved wall pieces used to construct actual opaque box geometry, inset by 5mm. Keeper recesses remain openings. The helper only reads these boxes; existing camera occlusion is unchanged.
- `under-green-practical-lighting.js` applies the proof to the original part bounds before choosing static light uniforms. Every part within a source's reach must be blocked before that source can be omitted from the whole batch. Existing movement padding is retained.
- `under-green-scene.js` supplies those boxes only on the software path. Native light selection retains its previous behavior. Dynamic receivers retain all 17 sources. No geometry, maps, shadow atlas, source positions, source colors, flicker, gameplay, input or material artwork changes.

At the software scene level, static surface/light pairs fall from 2,698 to 2,329 (about 13.7%). Average sources per static batch fall from 3.415 to 2.948; prepared material variants fall from 753 to 689. The measured views use 225 shader programs instead of 240. Draw and submitted triangle counts are unchanged, as are texture counts. These counts do not imply a proportional frame-time improvement.

## Verification

- `node tools/verify-under-green-light-occlusion.mjs`: six explicit boundary/opening checks, 832 successful hidden-box cases, 104,000 receiver points and 936,000 simulated biased PCF taps checked against independent ray/box intersections. Pass.
- `node tools/verify-under-green-occluded-lights.cjs` and `--software`: all 31 paired frame hashes per renderer are exactly identical to the pass-87 baseline. Zero browser/shader errors. These include seven district/interaction views, pressure phases, flood rise/high/recession, E pump operation, E release through the complete gate movement and aftermath, Q, crouch, pause and reduced motion.
- Responsive viewports: 2560x1600, 1280x720, 390x844 and 844x390. Native desktop draws at actual 2560x1600; software desktop draws at actual 960x600. The native pass was rerun after limiting the optimization to software, and verifies `occlusion: null` plus the original native source counts.
- Lamp definitions, animated light levels and dynamic material counts match the baseline in every captured state. This change does not modify the shader sampling or actor path; pass-87 attack and ghost qualifications remain relevant. No new whole-route/actor-clearance qualification is claimed.
- The installed web-game client exited successfully after 12 bursts. The initial click timed out on Preparing; subsequent Enter inputs advanced through the opening and reached gameplay. Final state: ready, playing, position (0,13.192), elapsed 2.533 seconds, checkpoint0, actual 960x540 software target. No error artifact. Its final screenshot was inspected and is pixel-identical to pass87's final client image.
- The high-resolution gallery image was inspected. Runtime syntax checks pass. Final runtime snapshots/hashes are stored in `output/under-green/visual-pass88/final-source-manifest.json` and were revalidated after testing.

## Cost and rejected variants

The retained software comparison uses six warm pairs and 24 alternating GPU-fenced samples per view while turning. Shared-machine timings are provisional, and this is a fixed 960x600 render-target comparison, not a new live adaptive-floor measurement.

| View | Before median / P95 (ms) | After median / P95 (ms) |
| --- | ---: | ---: |
| Gallery | 254.1 / 285.7 | 224.6 / 273.0 |
| Crossing | 223.1 / 280.0 | 209.6 / 266.3 |
| Flooded pump | 215.0 / 315.2 | 210.0 / 379.6 |

Median observations improve approximately 2–12%, but the pump tail regresses and absolute frame times remain too high. This is partial progress toward the performance requirement.

Two broader variants were not retained:

1. Applying the same omission to native rendering gave no timing benefit: gallery 20.3 to20.5ms, crossing18.5 to20.2ms, pump14.6 to15.4ms medians. The final native path does not use the new omission.
2. Regrouping software surfaces by the remaining source set regressed the pump median from267.7 to289.8ms, and its gallery JPEG differed slightly. That routed candidate exists only under `output/under-green/visual-pass88/candidates/`; the production grouping module is unchanged. Its reports are in `group-budget/software`, not the accepted baseline comparison.

No ledger item or whole-level gate is promoted. Counts remain 32 implemented, 20 in progress and one pending; all seven gates remain pending. All owned processes are terminal. No agent, CUA, image generation, commit or deployment was used.
