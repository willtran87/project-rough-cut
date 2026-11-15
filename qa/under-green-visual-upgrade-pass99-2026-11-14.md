# Under the Green pass99: irregular channel reflections

The eight channels now use two drifting irregular ripple fields for their optical normals. Their different orientations and scales break the previous parallel reflection bands into small uneven highlights. A narrower, dimmer material response retains dark water between those highlights. The shallow sediment bed, existing long waves, 160 samples/metre surface coordinates, bank blend, source lighting and reduced-motion clock remain.

Only `web/under-green-water.js` has a retained runtime change. The irregular fields supply analytic gradients of smooth scalar height fields, with 4mm and 1.8mm amplitude coefficients. They change shading only. Mesh construction, all geometry attributes, collision/contact heights, spray, particle updates and simulation remain unchanged. No new textures, lights, geometry, uniforms or passes.

## Visual decisions

- A first shorter-sine/higher-shininess candidate produced a visible grid and was rejected (`preview/`).
- A broader irregular field removed the stripes but produced overly soft reflections (`irregular-preview/`).
- Final smaller irregular fields and tighter, dimmer specular response produce broken glints (`final-preview/`, followed by final full `hardware/` and `software/` suites).
- Inspected final native low/surge/range, near-bed, pressure-cycle and portrait captures, plus software surge/cycle. Preserve the dark bed and irregular source response. This is local water refinement, not approval of the entire gallery, flood material or Level 1 parity.

## Verification

- Native and software: 51 views each, all eight channels, low/warning/surge/recession, reverse/near/bed views and flood. Actual native render sizes: 2560x1600, 1280x720, 390x844 and 844x390. Software: 960x600, 960x540, 390x844 and 844x390.
- A complete 12-second pressure cycle has 48 quarter-second observations, all four phases, spray danger agreeing with simulation, and no solid streams. Pause and Reduced Motion freeze the expected clocks. Camera-return images are exact.
- Paired geometry hashes, world transforms, player/water/flood state, draw counts, triangles, textures, programs and resolution are unchanged. With all light sources disabled, baseline and final images are exactly equal. No page or console errors.
- Independent central differences of the scalar height field verify the shader's analytic slopes and coordinate transforms. Actual GPU normals: 198 samples per renderer, north/east channels, nonuniform scale, three times, three pressure values, above/below/rolled cameras and unchanged puddle controls. Maximum error .005126 native / .005181 software against the unchanged .009 byte-encoding threshold. Actual sampled surface coordinates are read back to avoid assuming an ideal raster-centre hit.
- Source comparison proves the geometry/update/disposal tail remains byte-equivalent after text decoding. Practical lighting is restored byte-for-byte to the pre99 snapshot. Five final runtime hashes are recorded in `output/under-green/visual-pass99/final-source-manifest.json`.

## Rejected lighting experiment

A `directLight.visible` branch skipped shadow lookup and BRDF work for exactly zero attenuated light. Local software median milliseconds baseline/candidate: gallery179.1/182.0, crossing174.1/177.1, flooded pump179.5/183.8. Native: gallery23.9/25.2, crossing18.4/19.6, flooded pump14.7/14.6. No useful improvement; the branch was removed. Another chat's browser test overlapped part of the software measurement, so these are provisional timings, not an isolated causal claim.

The candidate source and measurement reports remain under `rejected/` and `budget/`; the active-light budget tool explicitly routes the saved rejected candidate. The expanded actor/ghost pixel verifier was prepared but not run after performance rejected the candidate, and is not acceptance evidence.

## Remaining scope

Advances V22/V25 and review21/22. All 53 requirements, 48 refinements and seven whole-level gates remain in scope. No requirement status is promoted by these local checks. Software playability, complete gallery/shore composition, distant moving-camera stability, and matched Level 1 acceptance remain open. Local budget and installed-client results are recorded below.

## Final local rendering cost

Six warm pairs and 24 alternating GPU-fenced samples per fixture. Baseline is the pre99 channel material. Native and software runs were sequential. Another chat's browser suite overlapped the software run, so timings are provisional shared-machine measurements.

| Renderer / view | Median before / after (ms) | P95 before / after (ms) |
|---|---:|---:|
| hardware / crossing | 19.5 / 19.5 | 21.9 / 21.6 |
| hardware / outflow | 13.9 / 13.7 | 16.0 / 15.5 |
| hardware / flood | 14.8 / 15.6 | 17.1 / 16.9 |
| software / crossing | 222.8 / 224.7 | 239.3 / 247.9 |
| software / outflow | 196.5 / 195.3 | 208.5 / 205.7 |
| software / flood | 177.5 / 176.5 | 180.9 / 190.6 |

Draws, triangles, textures, programs and resolution are unchanged in each pair. The change provides no speedup claim: native flood and software crossing medians increase, other local medians are similar or lower. Absolute software cost remains unacceptable; this is not live frame-pacing or whole-level performance acceptance.

## Installed-client and final audit

The standard develop-web-game client completed 12 input bursts (terminal exit0). Its initial five-second click timed out on Preparing; subsequent Enter/menu and movement inputs recovered after load. Final state11 is ready, under_green_playing, entrance checkpoint0, position(0,13.192), elapsed2.5333s, actual render960x540. No error artifacts; final shot11 was opened and inspected. This verifies ordinary entrance movement, not the entire level route or startup performance.

All five final source hashes were rechecked after verification. All owned test handles are terminal. Requirement counts remain32implemented/20in_progress/1pending; all seven full-level gates remain pending. The active goal is not complete.
