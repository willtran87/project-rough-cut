# Final Cut — moving headlights and shelter occlusion

November 12, 2026. Technical and visual progress on FC26 and FC64. The 72-item goal remains active; human horror comprehension and target-device performance remain unqualified.

## Delivered behavior

Two physical headlights now cast bounded local shadows from the live rig body. Their wider warm beams sweep the actual refuge walls and openings as the rig approaches. Walls block the direct lamp contribution inside shelter; moon/sky lighting still keeps the room readable. This is renderer work only: perception, warning margins, capture and shelter collision rules are unchanged.

The lamp pose inherits actual heading, sinking and roll. Output rises after startup and fades during collapse, reaching zero at eight seconds. Shadow maps refresh when the source/caster state changes, stay fixed on repeated paused renders and stop refreshing once the lamps go out. Reduced motion retains this useful spatial cue. Shadow resources and depth programs are primed during loading before play becomes available, and explicitly disposed with the scene.

Hardware uses two 512×512 PCF maps and includes machinery self-shadows. Software uses two 256×256 basic maps with architectural and gate casters; small machinery self-shadows are omitted on that tier. Both retain real shelter occlusion. Existing static instancing is preserved.

## Direct evidence

`tools/verify-final-cut-lighting.cjs` passes on D3D11/RTX 3090 and SwiftShader. It instruments the actual rendered scene, changes only the shadow contribution for an A/B control, and reads completed WebGL pixels.

- Pump floor probes, plus one bunker and one pavilion floor probe, first receive measurable direct light with occlusion disabled. With shadows enabled, all match the same lamps-off base-light samples exactly. This includes the lower refuge wall.
- The outside pump wall remains lit: its mean sampled RGB rises from about 19 to 50 on hardware and from 18.6 to 49.3 on software.
- Four rig positions move the real emitter and shadow projection by the expected distance. Rendered pixels change with the sweep; texture count stays fixed.
- Actual Escape pause freezes both pixels and shadow refresh count. The real reduced-motion checkbox preserves the same light cue.
- Actual mid-collapse browser reload restores the same pixels, lamp matrices and positions. Shutdown fades to zero and performs no further shadow refreshes.
- Captures at 2560×1600, 1280×720, 844×390 and 390×844 were opened and inspected, including interior, exterior, sweep and software samples. The lamp is offscreen in the exterior shelter view while its beam crosses the wall.

`verify-final-cut-opening.cjs` passes ten captures covering real deployment, partial cutting, crushed furniture, protected close pass, cleared strip, pause and retry. Its obsolete twelve-second boarding wait now derives from the authoritative BOARD_READY constant.

`verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/lighting/route` passes an uninterrupted ordinary Gamepad API finale after a completed-result fixture unlocks Replay: 137.249 simulated seconds, all crossings/pump/bell/trap/road, zero captures or throws, and no page errors. This remains a map-aware pilot, not a human playtest.

The installed web-game client passes two ordinary movement bursts. Latest screenshot/state inspected: playing at 6.52 seconds, zero captures, SwiftShader, two allocated 256-pixel basic shadow maps, startup intensity 12 and one shadow refresh while the rig waits. No client error artifacts were produced.

## Measured rendering cost

The final ABBA check toggles shadows off/on/on/off at the same exterior scene, warms each variant and drains queued warmup work, then measures 15 complete render-plus-full-frame-readback samples per block. It forces shadow refreshes to include the moving-light cost. No other owned browser test ran concurrently with the final timing blocks.

| Renderer / actual buffer | Off medians | On medians | Draw calls off/on |
| --- | --- | --- | --- |
| D3D11 / 1280×720 | 3.4 / 3.2 ms | 4.1 / 3.7 ms | 53 / 95 |
| SwiftShader / 960×540 | 61.6 / 62.4 ms | 80.0 / 80.9 ms | 53 / 69 |

This is about 0.6 ms added in the hardware sample and 18.5 ms in the software sample. It is a small single-view cost comparison, not sustained gameplay FPS. **Software performance remains unacceptable for a responsive shipping tier and needs further work.** It was already slow without these shadows; do not label either the baseline or this result as qualified. Earlier experiments with full software machinery casting were more expensive, but their timings also included queued warmup work and must not be treated as a controlled performance comparison.

## Verification corrections and limits

- An early test expected over one RGB level of leaked light at every distant floor probe; one measured 0.96. The final positive-control threshold is 0.5, while the occluded-versus-dark tolerance stays 0.15. Actual final occluded differences are zero.
- The first exterior probe was outside the beam cone. It now samples the actual illuminated front wall, with the observed 31-level response.
- A reload comparison initially allowed real frames to advance between readiness and the resume click. The test now freezes its deterministic clock at readiness before interacting; exact current pixels/projections pass.
- Initial benchmark maxima included warmup draws waiting in the GPU queue. Final timing drains that work before the measured blocks and reuses the readback buffer.
- The checks sample named receiver patches, not every shadow edge or every pose. Furniture, trees and actor self-shadowing are not comprehensively qualified. Different map resolutions/filtering can differ at edges.
- No first-time player has yet validated whether the sweep communicates direction or increases tension. Broader composition, the two-light reveal, recorded sound, sustained renderer budgets and physical-device acceptance remain open.

Artifacts: `output/final-cut/lighting/hardware`, `software`, `route`, `client`, plus retained experimental reports `software-pcf-baseline.json` and `software-basic-rig-baseline.json`. Production files are `web/final-cut-lighting.js` and the scene integration; tests use explicit test entry only.
