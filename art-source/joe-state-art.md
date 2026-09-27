# Joe state-pose production record

Generated September 26, 2026 with the built-in image generator, using the existing directional walk sheet as the visual reference. The production brief requested the same groundskeeper and red mower on true transparency, in a four-column by three-row grid: listening, investigating, searching and charging; right side, rear and left side. Preserve the sweater, trousers, weathered mower, lighting, and ground contact; no labels, scenery or opaque background.

- Reference: `joe-state-reference.png`.
- Generated original: `joe-states-generated.png` (1448 × 1086 RGBA).
- Preparation: `python tools/prepare-joe-states.py`.
- Aligned master: `runtime-png/rough-cut-joe-state-directions-v1.png` (1536 × 1152 RGBA).
- Runtime encoder: `python tools/optimize-runtime-art.py`.
- Runtime output: `../web/assets/optimized/rough-cut-joe-state-directions-v1.webp`.

Each view uses one common scale so a leaning posture does not become taller than an upright one. Cells are 384 pixels square, grounded at y=360; the runtime crop excludes the top/bottom gutters. The user's explicit authorization covers local image processing.

Stationary Joe uses the authored state poses. Moving Joe keeps the original four-frame, distance-driven walk cycle with state-dependent lean, rather than sliding a stationary pose. Side-view wheel hubs rotate with distance. Front views retain the existing state animation strips. This is an incremental 2.5D animation pass; the renderer still changes among four viewing directions, not a skeletal 3D model.
