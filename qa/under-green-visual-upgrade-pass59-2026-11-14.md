# Under the Green pass 59 — pump work-light composition

The previous goal turn made progress through six fresh native captures and an updated, prioritized visual review. This pass implements the resulting pump-lighting work. The full 53 requirements, 48 refinements and seven release gates remain active.

## Change

- Moved the existing pump-work fixture from course (-25.65, 41.25) to (-24.5, 42.1), retaining its 2.8 m height, warm pigment, power, reach and independent flicker. Its housing, glass, cable, glow and structural hanger follow the authored position.
- Added an optional source distribution to fixed practical lighting. The pump hood directs light downwards: 48-degree inner cone, 78-degree outer cone, 12% cage spill. Diffuse and specular response use the same smooth distribution. Other fixtures remain omnidirectional.
- Static batches only compile beam work when their light set includes the source. Moving actors receive the same world-fixed light. The direction transforms into camera space every draw; program keys distinguish beam positions within each culled source list.
- No additional light sources, textures, colliders or machinery geometry. No movement, flood, pursuit, attack, controls or retry changes.

The motor's cooling fins and curved enamel casting now separate more clearly while the upper plaster wall recedes. A farther rearward lamp candidate was rejected after visual comparison. The intended west-side operating position shows both gauges and RETURN/RANGE tags clearly; the previously reported east-side blocked rays do not justify moving these labels.

## Evidence

All evidence is under `output/under-green/visual-pass59/`.

- `tools/verify-under-green-pump-light.cjs`: final hardware and software runs each pass 29 captures. Native desktop render buffer 2560x1600; software desktop buffer 960x600 beneath a 2560x1600 capture. Additional viewports 1280x720, 390x844, 844x390. Includes front, side, return, operator, distant approach, flood, minimum lamp output, reduced motion, operated pump, crouch and Q lookback; gallery/range/bunker comparison fixtures also captured. Final screenshots were inspected, including native close/approach/minimum/portrait and software close/landscape/reduced views.
- Each renderer passes 2,112 camera clearance poses. E actually diverts the pump; pause freezes elapsed simulation time; leaving and returning to the settled operator camera produces an identical PNG.
- Geometry outside the two lamp-position envelopes is unchanged: native 271,386 triangles/hash 2612962299, software 196,654/hash 2484036988. Other lamp definitions are identical. Player fixture state, actual buffer sizes and texture counts match the corresponding baseline captures.
- `tools/verify-under-green-practical-beams.cjs`: compare the actual practical-light shader to stock Three PointLight/SpotLight composition, with diffuse/Phong surfaces, static variants, a dynamic-material sphere, four camera orientations and reduced-motion on/off. Both renderer paths pass eight comparisons with maximum channel difference zero. A lights-out comparison ensures the oracle has observable illumination.
- `tools/verify-under-green-moving-clearance.cjs --dry`: 1,379 route frames, 106 body/tool geometry samples, zero intersections; maximum foot error approximately 2.41e-7.
- Installed `web_game_playwright_client.js`: seven input bursts, terminal success, final state playing at (0, 10.12), elapsed 1.5333, ready true; final shot/state inspected and no error artifact. Initial Preparing-button click exceeded the client's five-second timeout; later Enter bursts recovered. This is a smoke check, not a full player-driven playthrough.
- Before and verified copies plus SHA256 manifest for the three changed runtime modules are in `source/`.

## Cost and limitations

Representative native draw/triangle counts are unchanged: pump 83/118646, operator 409/336430, gallery 525/386546. Corresponding texture counts are unchanged. Shader programs rise from 169 to 207 because source distributions require additional material/light-set variants. Startup/whole-level shader cost remains part of the open performance gate.

All owned visual-test processes were terminal before sequential paired budget runs. Other project render tests were observed before and during timing, including a Back Nine software benchmark. These are provisional shared-machine measurements, not clean performance acceptance and not evidence of a speedup.

Native median/P95 milliseconds, baseline → revised:

| View | Baseline | Revised |
|---|---:|---:|
| Pump | 9.1 / 10.4 | 8.2 / 10.2 |
| Operator | 13.1 / 14.8 | 11.3 / 13.7 |
| Gallery | 16.4 / 18.4 | 14.2 / 17.3 |

Software median/P95 milliseconds at actual 960x600, baseline → revised:

| View | Baseline | Revised |
|---|---:|---:|
| Pump | 102.2 / 127.7 | 100.2 / 131.9 |
| Operator | 258.0 / 274.4 | 262.3 / 287.3 |
| Gallery | 157.4 / 210.2 | 161.4 / 233.2 |

Software operator/gallery samples and P95s worsened; absolute cost remains far outside a playable target. Concurrent software load prevents assigning the difference solely to this change. No software performance acceptance or no-regression claim is made. This change improves the pump composition; it does not establish whole-level Level 1 parity, complete shadow coverage, finished wet-highlight craft, or final performance acceptance.

Next: finish gallery focal/wet lighting, refine water contact and broken reflection in motion, then extend district composition and complete the existing whole-level gates. Retain the operator-side finding when revisiting the general sign audit.
