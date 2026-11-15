# Under the Green pass98: channel surface reflections

The eight shallow channels now have two additional millimetre-scale ripple families with curved phase fronts. Their analytic slopes break the existing physical lamps into visible moving reflections. The broader waves, dark silt, refracted bed, sediment margins and opaque depth handling remain. Grazing-angle reflectivity strengthens the surface read while retaining bed detail at steeper angles. Pressure changes amplitude without resetting phase.

The old independent stripe/glint oscillator is removed. A first subtle reflection-only candidate was insufficient; a second straight-wave candidate produced regular bars, and an intermediate highlight mask produced a grid. The final candidate uses warped surface slopes and source lighting without the separate brightness pattern. Existing lights, source occlusion and Reduced Motion control the result. No added textures, materials, geometry, uniforms or passes; no changes to hazard timing, footprint, spray, contact heights or simulation.

## Verified native evidence

- Final native 2560x1600 suite:51 views, all eight channels, low/warning/surge/recession, near/reverse views, bed views and flood. Additional1280x720,390x844,844x390 views;48 quarter-second samples cover the whole12s pressure cycle. Surface states match authoritative water states.
- Geometry hashes, transforms, emissions, player/water/flood states and draw/triangle/texture/program/resolution counts match baseline in paired views. Lights-out image is exactly unchanged; no self illumination introduced. Camera-return pixels are exact. Pause freezes time and Reduced Motion keeps the water clock at zero.
- Actual GPU world-normal readings:198 samples including north/east channels, varying time/pressure, nonuniform mesh scale and cameras above/below/rolled. Maximum error .004666, within the .009 byte-encoding tolerance. Includes unchanged puddle control. The diagnostic supplies the current shore attributes explicitly so it tests the real interior water normals rather than default-zero attributes.
- Inspected final normal-play surge/low, near-bed and cycle44 views at native/1280. The main improvement is visible source reflection and surface movement; broader shore composition, illustration parity and distant motion stability remain whole-level work.

## Scope and limits

Advances V22/V25 and review21/22. Full53requirements,48refinements and seven whole-level gates remain in scope; no requirement promoted by this local pass. The channel surface is still shallow water on the walking floor, not a newly excavated pit. Full flood/puddle treatment is unchanged. Final cost and installed-client completion are recorded below.

Runtime: web/under-green-water.js. Evidence and final source identities: output/under-green/visual-pass98/. Rejected preview folders document the successive art comparisons; hardware/ is the final full native suite.

## Software and normal-diagnostic follow-up

Final software suite passes51views at actual960x600, plus1280x720/390x844/844x390 viewport checks, the full12s pressure cycle, identical paired geometry/state/resource checks, lights-out equality, pause/reduced and stable camera return. No page/console errors. Software surge and portrait bypass images inspected.

The first software normal probe failed eight north-channel underside/rolled views because it assumed the centre fragment sampled local y=.225. An independent byte-encoded coordinate render showed that this tiny65x65 target actually samples the adjacent y=.23125 cell for that pose. The verifier now reads the actual local cell before calculating its analytic expected normal. The runtime shader was unchanged. Both corrected diagnostics pass198readings each: maximum errors .004666native/.005189software, against .009byte tolerance. Initial failing samples are preserved as initial-assumed-centre-samples.json. This verifies the real rasterized normal rather than weakening the tolerance or dropping the failed camera pose.

## Local GPU-fenced cost

Six warm pairs and24 alternating samples per fixture, sequential native/software runs on the shared host. These measurements do not qualify production frame pacing.

| Renderer | View | Median ms before → after | p95 ms before → after |
|---|---|---|---|
| hardware | crossing | 20.5 → 20.2 | 22.5 → 22.4 |
| hardware | outflow | 13.9 → 14.5 | 15.2 → 16.9 |
| hardware | flood | 16.4 → 15.1 | 18.0 → 16.8 |
| software | crossing | 214.2 → 217.3 | 235.5 → 238.1 |
| software | outflow | 155.5 → 146.0 | 198.3 → 197.4 |
| software | flood | 184.2 → 184.4 | 264.8 → 264.0 |

Results are mixed: the native outflow and software crossing medians are slower; other medians are similar or lower. No speedup or performance parity claimed. Absolute software cost remains unacceptable. Resource counts match baseline. The runtime update/contact/disposal and geometry/particle-construction sections are byte-identical to baseline; changes are confined to channel material/shader response.

## Final gameplay and source verification

Installed develop-web-game client completed12bursts, terminal exit0. Initial five-second primary click timed out while Preparing; later Enter bursts started the ready game. Final active play at(0,13.192),elapsed2.533,entrance checkpoint0,actual960x540; no error artifacts. Final shot11 inspected, including the newly visible distant reflection at the first crossing. All four final source hashes rechecked unchanged. Native/software full suites, corrected normal diagnostics, both local budgets and installed client are terminal. The broader implementation goal remains active and incomplete.
