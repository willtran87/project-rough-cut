# Pixel graphics and effects refinement

This pass improves the existing 3D course without changing player movement, navigation, Joe's decisions, collision or evidence timing.

## Changes

- **Water:** three flat, vegetation-covered pond props become open dark water with pixel-stepped ripples, broken highlights, original-sky reflection detail and a wet shoreline. Reeds vary in height and gather around the perimeter. The authored pond footprints remain unchanged.
- **Foliage:** hedge surfaces gain broad variation, darker roots and a lighter crown while retaining the original leaf texture. Shading variation runs in the vertex stage to limit software-rendering cost.
- **Lighting:** the existing nearby point light now follows guide lanterns and building lamps as well as stations, with distance-based falloff. Glow size varies gently; Reduced Motion keeps it still. No additional lights or glow draws were introduced.
- **Ground evidence:** mowing marks have broken blades and wheel ruts; player tracks use a separate heel/toe/tread mask in the same atlas and instance pool. Marks fade near expiry instead of disappearing at full opacity.
- **Mower effects:** broken, thin, translucent ripples and a softer directional wash replace the conspicuous solid rings. Existing effect pools and their six-draw maximum remain unchanged.

Water uses one opaque draw per pond and the already loaded sky texture. It has no scene-copy/refraction pass, additional render target, or transparent water stack. Its animation freezes under Pause and Reduced Motion. All materials participate in protected scene preparation; shared art stays cached across scene replacement.

## Verification

`tools/verify-visual-polish.cjs` captures the opening, nearby Joe/evidence, pond, border and shed on hardware and software rendering. It checks water motion/comfort handling, unchanged simulation state and overlay anchoring at 2560×1600, 1280×720, 800×600 and 844×390 touch.

Evidence and the task-start source snapshot are in `output/visual-polish-20261107/`.

The hardware and software visual checks pass without browser errors. Effects acceptance (10 groups), gameplay intelligence (9 groups including 29 obstacle approaches), pixel-world acceptance (10 groups), and preparation lifecycle (5 groups including model fallback and scene replacement) pass. Release validates 90 action fixtures with no warnings or failures; image inventory remains 55 images / 17.94 MiB. Syntax and whitespace checks pass.

Protected preparation measured 8.08 seconds with Joe's primary model and 6.91 seconds with its fallback; first active submissions were 20.9 / 15.3 ms. Worst preparation-frame gaps were 233 / 250 ms. This is preparation lifecycle evidence, not an uncached-network startup comparison.

The installed web-game client completed three normal input sequences: 586 submitted scenes, 28 course units travelled, all three water surfaces active, and no error artifact. The final screenshot and state were inspected. Readiness is 56/57; the pre-existing software frame-budget gate remains open (completed-scene average 110.26 ms, p95 115.20 ms in this run). Effects retained five visible draws, maximum measured CPU update 1 ms. Human playtests and sustained device qualification remain prepared for later.

## Performance comparison

Fresh before/after browser processes, 60 moving world submissions per view, with GPU backpressure retained. Software uses the existing 960×540 cap; the viewport is 1280×720. Baseline routing includes the saved effects module, not just the scene module.

| View | Software median before → after | Software p95 before → after | Hardware after median / p95 |
| --- | --- | --- | --- |
| Opening | 100.0 → 100.0 ms | 116.7 → 133.3 ms | 16.7 / 16.7 ms |
| Border | 116.7 → 116.7 ms | 133.3 → 133.4 ms | 16.7 / 16.8 ms |
| Pond | 133.3 → 133.4 ms | 150.1 → 166.6 ms | 16.7 / 16.8 ms |

Software medians are effectively unchanged; some tail frames are slower. No throughput improvement or zero-cost claim is made. Hardware is RTX 3090 / D3D11 with shadows and original texture detail; none of its 180 samples exceeded 50 ms. These short local samples do not qualify sustained performance across devices. Existing software performance work remains open.
