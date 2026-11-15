# Under the Green pass81: spray breakup and pixel droplets

Local refinement of V03/V23/V24/V48. The complete53 visual requirements,48 refinements and all seven whole-level gates remain active. No item status promotion.

## Retained design

Each droplet flight now has a coherent launch direction selected by its emission time and nozzle position. Successive lifetimes vary the launch spread instead of replaying one narrow arc. The breakup envelope widens downstream, with subtle lateral sway and a mix of short filaments and smaller rounded drops. Analytic tangents track the actual flight, so the billboard points along its motion. Channel clocks are offset to avoid synchronized repeated patterns; looking away never restarts them.

The existing64x64 droplet mask now has a blunt head, tapered tail and four restrained coverage bands instead of a soft circular spot. It is still a lit, non-emissive particle using the existing nearest magnification and distant filtering. Impact mist rotates in its own plane to break identical lobe orientation. Gravity-driven fans, world-size caps, physical nozzles/landings, hazard schedule, whole-level flood and contact origins remain. No additional particles, meshes, maps, shaders, draws or gameplay geometry.

## Verification

- Pure spray suite:663,552 bounded flight/fan samples,8,640 resolution/FOV footprint checks,12,288 analytic tangent comparisons (max error0.00000322).4,078 of4,096 consecutive lifetimes differ by more than2mm; phase-wrap opacity stays below.001. Gravity, finite values, water-surface lifetime and deterministic world clock pass.
- Native25877 and software53958 both exited0. Ten paired views each: close nozzle, waiting bank, keeper, side, rear, pump outflow, high flood and low/warning/receding pressure states. Hazards and rendering counts/resources match baseline. With droplets/mist hidden, every background framebuffer hash is exactly equal.
- Both renderers verify opaque-wall occlusion, same-camera return after rear glance, changing travel over time, six motion captures, frozen pause and Reduced Motion. Each has extra1280x720,390x844 and844x390 captures. Native main captures are actual2560x1600; software high-viewport buffers are960x600. Compact screenshots follow the Reduced Motion check; whole-level normal-motion/FOV acceptance remains open.
- Native close nozzle/side/front, motion frame and844px landscape plus software flood were inspected. The source-defined arcs remain readable, but their individual drops are less uniform. Visible effect-pixel coverage is73-88% of baseline in active native views and70-99% on software. This reduction reflects narrower droplet masks, not fewer particles. This metric alone is not an artistic acceptance criterion.
- Installed client25664 exited0 after8bursts. Initial Preparing timeout recovered through Enter; finalready/playing,checkpoint0,elapsed1.9167,player(0,11.4),actual960x540. Final image/state inspected; no error artifact.

## Cost and remaining scope

Native moving-spray timing61480 exited0: baseline/current medians front17.3/17.4ms,side13.4/13.5ms,flood16.3/16.5ms. Software report is complete: front medians439.7→479.6ms/P95538.1→665.2ms; side207.0→219.2ms/P95290.7→297.5ms; flood312.4→337.0ms/P95364.7→377.0ms. Native P95 front20.3→23.7ms,side16.1→15.2ms,flood18.4→18.4ms. Software is slower in all three local samples; preserve this regression as an open performance concern. Each fixture uses six warm pairs and24 alternating GPU-fenced frames with advancing spray time. These local diagnostics do not qualify production pacing or the overall visual build. Broader water composition/depth/reflections, full-route actor and district acceptance, current matched Level1 comparison and software performance remain unfinished.


Closeout: the original software handle28555 is now unknown, and its final report contains all three completed fixtures. Final source snapshots are recorded in output/under-green/visual-pass81/final-source-manifest.json. No whole-level gate or requirement status was promoted.
