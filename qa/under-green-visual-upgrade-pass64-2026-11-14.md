# Under the Green visual pass 64: submerged sediment and channel depth

Scope: advance V22 within the full 53-item plan and 48-refinement review. The preceding requested review supplied fresh static evidence but did not finish this pending implementation. Revalidated the actual worktree and completed the water candidate. No gate or item is declared complete by this local pass.

## Change

- Channels reuse the existing authored sediment map at 313.5 texels/metre. The scene lends its existing mud texture to the water builder; ownership/disposal remain with the crafted material set.
- The production water shader refracts the viewing ray onto the walking floor at height zero. Sediment therefore reads below the surface instead of being painted onto the wave. Its visibility decreases with optical path length and grazing-angle reflection. The current displaced water height drives attenuation, including its small waves.
- Low water reveals dark brown sediment; high water obscures it beneath restrained green-brown murk. Existing contact shade, directional wave normals, broken practical-light reflections, ballistic spray and contact effects are retained.
- Water remains opaque and depth-writing. This is a lit approximation of a sediment-coated bed, not scene-color refraction or new underwater geometry. The flood material is unchanged; broader flood/shore composition remains open.
- Two runtime files changed: `web/under-green-water.js` and its construction call in `web/under-green-scene.js`. No gameplay/AI/input/collision edits, new textures, geometry, lights or draw calls.

## Evidence

Artifacts: `output/under-green/visual-pass64/`. Initial `preview` and `refracted-preview` are intermediate. Accepted runtime captures are `hardware` and `software`; source snapshots and SHA256 manifest are under `source`.

- `verify-under-green-channel-depth.cjs`: 51 views per renderer, covering all eight channels, low/warning/surge/receding phases, steep bed inspection, reverse approach, flood, reduced motion and 2560x1600/1280x720/390x844/844x390 layouts. Actual hardware target is 2560x1600 at the largest viewport; software is 960x600, not native desktop resolution. Software ordinary desktop is 960x540; compact targets match their viewports.
- Baseline/current water geometry attributes, index, world matrices and emissive values match. Paired player, water and flood state match exactly, as do draw/triangle/texture/program counts. All lights disabled produces exactly matching before/after pixels in each renderer.
- A 48-step, 12-second cycle covers all four water phases. Visible flow agrees with authoritative danger and solid-stream count remains zero. Camera return is pixel-exact. Pause freezes elapsed time; reduced motion holds the water animation clock at zero. Zero recorded page/console errors.
- `verify-under-green-channel-bed.cjs`: 32 actual GPU probes per renderer cover north/east orientation, shallow/deep surfaces, viewing distance, elevation and camera roll. Refracted floor positions and transmission agree with an independent ray/floor calculation within 0.00210 native and 0.00193 software in normalized output channels (threshold 0.008). A transparent test surface below production water is completely occluded; above water it changes the image. This verifies depth ordering, not a full Joe/ghost animation review.
- Installed standard web-game client: seven bursts; final ready/playing at (0,7.304), elapsed 0.75s, checkpoint zero. Final screenshot and text state inspected; no error artifacts. Initial disabled Preparing-button click timed out, and subsequent input recovered into normal play.
- Runtime syntax checks passed. Inspected native shallow/deep/approach/compact views, software shallow/landscape views and the standard client screenshot. Shallow bed detail is visible, high water remains murky, and phone framing retains the crossing surface and signal.

Representative native paired resource counts are unchanged: low crossing 400 draws / 328344 triangles / 55 textures / 211 programs; near 241 / 319304 / 55 / 211; bypass 104 / 144484 / 58 / 211; flood 422 / 331502 / 61 / 211. Program counts include warmed shader variants in this verification sequence.

## Performance and remaining work

Sequential GPU-fenced before/after budget runs follow all owned visual/client jobs. Each fixture has six warm pairs and 24 alternating samples. Both processes completed successfully with zero recorded page errors. Native budget target is 2560x1600; software target is 960x600. Results in milliseconds (median / P95):

| Renderer | View | Before | After |
|---|---|---|---|
| hardware | crossing | 15.0 / 16.9 | 15.4 / 17.4 |
| hardware | outflow | 10.9 / 12.7 | 11.4 / 13.2 |
| hardware | flood | 15.4 / 17.2 | 15.4 / 16.6 |
| software | crossing | 174.0 / 191.9 | 174.1 / 189.9 |
| software | outflow | 143.0 / 158.2 | 143.6 / 162.3 |
| software | flood | 198.1 / 252.6 | 197.2 / 230.1 |

Native crossing/outflow medians increased by 0.4/0.5 ms in this local run. Software medians were nearly unchanged but absolute cost remains poor. These local timing samples do not close the full-level performance gate or establish an FPS improvement. The pre-budget Node tool-process query emitted no entries after owned jobs finished; other chapter work elsewhere in the shared workspace means these are not controlled machine-wide benchmark results.

V22 remains in progress. Full flood material/shore integration, complete gallery reference composition, broader district variation, actors in motion and all seven whole-level gates remain open. Preserve the entire scope and existing E/Q, entrance-only retries and sound-led presentation.
