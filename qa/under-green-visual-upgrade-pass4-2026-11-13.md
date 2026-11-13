# Under the Green visual upgrade — ground and sediment

The full 53-item goal and all seven release gates remain active. This pass advances V02–V05, V17–V18, V20 and V40. It does not establish full Level 1 parity or complete the water/lighting/actor work.

## Changes

- New `under-green-ground-finish.js` supplies staggered 1.46 × 1.16 m slab forms with irregular chipped joints, inset edge shade and per-slab material variation. It samples the quieter illustrated concrete field so the large slab boundaries remain readable; the previous broken-floor illustration competed with those boundaries.
- A separate 1024², world-anchored RGB deposit map controls mud, sediment and wetness. It follows 280 actual wall sections, both banks of all eight water hazards (16 aprons), and the exposed bunker retaining face. The same map spans original floor partitions, so changes in geometry batching do not change the deposit pattern. Fine material detail continues to sample the existing native illustrated source tiles.
- Ground gloss follows deposits; broad dry slab faces are less shiny. Sediment sits beside actual drains and thins away from the retaining face. Existing warning stripes and route markings remain above the ground treatment and readable.
- Reworked the existing wall mud geometry into broad rounded pockets separated by nearly bare smears. A sampled profile ranges from 1.8 cm to 54.8 cm high and projects at most 19.7 cm from the boundary, less than the previous widest foot. Vertex colors distinguish the darker wet toe, compacted middle and drying upper margin.
- No extra ground geometry, collider, slowdown, interaction or navigation obstacle. All changes remain local to Under the Green. No source raster master was regenerated.

## Verification

- `tools/verify-under-green-ground.cjs` passes hardware and SwiftShader. Each run covers 18 recorded fixture/flood views plus crouch and rear-glance images, at 2560×1600, 1280×720, 390×844 and 844×390. Native initial render targets are 2560×1600 hardware and 960×600 software. No browser or shader errors.
- Fresh before/after fixtures retained under `output/under-green/visual-upgrade/ground-baseline`, `ground` and `ground-software`. Inspected entrance, wall base, pump, bunker, portrait crossing and installed-client gameplay. Slab forms now read under both amber and cool light; the crossing's existing triangular spray remains visibly unfinished and is a priority for the next water pass.
- Actual W/C/Q input verifies movement, crouch and rear glance. A rising whole-level flood remains visible over the new ground. The test's fixture placement is for art review; it is not represented as a complete ordinary-input playthrough.
- Full dry-route regression: 1,379 rendered frames, 106 actor/tool geometry samples, zero scenery intersections, maximum foot error 2.414686e-7 m. Evidence: `pass4-clearance`.
- Installed develop-web-game client completed intro and ordinary movement at y=12.68, playing state, actual 960×540 software rendering. Final screenshot and state inspected under `pass4-client-final`.
- Matched hardware fixture draw/triangle counts are unchanged by this pass: entrance 181 draws/277,446 triangles; crossing 221/264,582; bunker 163/243,060; pump 47/184,946. Texture count at these fixtures is unchanged: the new control texture replaces the previously uploaded floor diffuse because the slabs reuse the existing concrete texture. This does not imply equal texture byte usage.
- `tools/profile-under-green-ground.cjs` compares the current implementation against a test-only baseline serving the retained pass-3 atmosphere source and omitting the new floor finish. It alternates baseline/current/current/baseline, measures three fixed views, and uses 40 warm-up plus 100 measured JS draw/gl.finish calls per view. This isolates relative draw cost; it is not gameplay frame pacing, startup decoding, a route soak, or the full performance gate.

## Remaining work

Keep all original requirements. Floors still need authored runnels, contextual traces, localized contact ripples and stronger puddle/depth differentiation. Mud needs selective trapped leaves/stones and final district-specific layering. The imagery and world lighting still require matched Level 1 review. Water jets/splash fans, flood edges, local humidity, shadows, keeper props, Joe/ghost craft, UI and illustration consistency remain in scope.

The first post-edit screenshot run hit ENOSPC. Automatic approval review rejected deletion of superseded generated test captures (policy block); no files were removed. Lossless NTFS compression of generated project output recovered approximately 638 MiB of free space, and both compactor processes were stopped after enough space was available. Subsequent captures and checks finished successfully. Source/assets were not deleted or rewritten for space recovery.

## Relative cost results

Hardware probe at1280x720: current p95 ranges across the two runs were entrance2.5-2.6ms, pump2.0-2.1ms, range2.1ms; baseline entrance2.6-2.9ms, pump1.8-2.1ms, range2.0-2.1ms. Software at960x540: current entrance3.4-3.5ms, pump2.3-2.4ms, range3.2-4.4ms; baseline entrance3.4-3.5ms, pump2.5-2.6ms, range2.7-3.0ms. The software range fixture is more expensive (median2.7ms versus2.4-2.5ms) and should remain in the later full frame-pacing review. These numbers are from forced JS draw/gl.finish calls, not FPS claims. Both probes terminated with zero errors; reports retained as ground/profile.json and ground-software/profile.json.

Measurement clarification: these relative probes time the JavaScript draw and gl.finish call but exclude the asynchronous presentation-fence wait at the start of each iteration. They therefore do not prove completed GPU frame cost; later full performance acceptance must measure actual presentation completion and live frame pacing. Existing numerical samples remain unchanged.
