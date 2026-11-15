# Under the Green pass 60 — channel contact and reflection

The previous review turn made progress through six current native captures and refined priorities. Resumed verification processes were revalidated against the live process inventory: all accepted visual/normal/client jobs were terminal, with successful reports. The full 53 requirements, 48 refinements and seven gates remain active.

## Runtime change

`web/under-green-water.js` refines existing channel surfaces with 160 samples/metre, narrow irregular sediment/contact margins, two optical ripple slopes and broken five-step specular highlights. Reflections come from scene lights; the former additive diffuse glint is removed. Wave phase follows a continuous clock, while pressure changes disturbance amplitude. This prevents pressure changes from shifting the entire reflection pattern. Initial overly soft highlight and pressure-dependent-phase candidates were rejected.

The optical slopes correspond to 12mm/4mm height fields but do not change surface geometry, gameplay depth, flood speed, spray, droplets or impact-ring systems. Existing contact effects remain. No new geometry, lights, textures or colliders. This is a local water-material improvement; broad water composition still needs stronger shore/depth staging and full motion/art acceptance.

## Evidence

Evidence root: `output/under-green/visual-pass60/`.

- `hardware-accepted` and `software-accepted`: 41 views each, including eleven paired water/flood/near/reverse fixtures, 1280x720, 390x844 and 844x390 layouts, reduced motion and twelve sampled cycle frames. Native actual buffer 2560x1600; software desktop buffer 960x600 beneath 2560x1600 screenshots. Final close, east-west, portrait, cycle and client screenshots inspected.
- Each renderer advances 48 consecutive 250ms steps across a complete 12-second cycle, covering all four pressure phases. Flow visuals match danger state; zero solid streams. Pause freezes elapsed simulation; reduced animation clock stays zero. Camera departure/return produces identical PNGs. These are sampled sequences, not a full-framerate human motion acceptance.
- All eight channel position/normal/UV/index/world-transform fingerprints match the baseline. Player/water/flood state, actual resolution, draw/triangle/texture/program counts match each corresponding fixture. Lights-out before/after PNGs are identical; no self-illumination. No recorded page/console errors.
- `normals-accepted/hardware` and `/software`: 198 diagnostic samples each across north/east channels, puddles, three clocks, three pressures and multiple camera poses. Maximum normal-vector error 0.005556 native / 0.007865 software, under 0.009 for 8-bit encoding. Diagnostic disables vertex displacement to compare the same physical sample; production displacement remains intact.
- `normal-regression-accepted`: historical camera-orientation baseline max error 0.083611; current max 0.004665 across 66 samples per state. Puddle formula unchanged.
- Existing pure water contract/contact checks passed during this implementation: 173304 state-parity, 23120 wait-parity, 23 malformed-authoring rejections; contact boundaries, footsteps, actual Joe soles/blade, dry/raised suppression, pause and bounded pools.
- Installed standard client `client-accepted`: seven bursts, final ready/playing at (0,8.84), elapsed1.15, no error artifact; final shot/state inspected. Smoke check, not a full playthrough.
- Final runtime copy and SHA256 manifest refreshed after the continuous-phase revision in `source/`.

## Cost and limits

All owned render jobs were terminal before sequential final budget runs (native40356, software78828, both terminal success). Other Final Cut render tasks were observed on the shared machine; timing is provisional and does not prove a speedup or no regression. Each case uses six warmup pairs and 24 alternating GPU-fenced samples per version.

| Renderer/view | Baseline median/P95 ms | Revised median/P95 ms |
|---|---:|---:|
| Native crossing |13.8 /17.1|14.4 /17.2|
| Native outflow |10.7 /15.4|10.6 /12.7|
| Native flood |15.1 /16.8|14.8 /17.4|
| Software crossing |253.0 /348.4|250.6 /327.5|
| Software outflow |199.9 /262.0|199.9 /254.3|
| Software flood |237.7 /333.3|257.7 /346.5|

Software absolute cost is unacceptable for fluid play and its flood samples worsened. Concurrent load limits attribution. V22/V25/V52 stay in progress; no whole-level art or performance gate closes. Next: gallery focal lighting, physical water-edge composition, district variation and whole-route visual acceptance.
