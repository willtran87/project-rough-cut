# Rough Cut footing hazards v1

This three-material terrain atlas was created with OpenAI image generation on 2026-08-04 for the game's avoidable slow-footing mechanic.

## Files

- `rough-cut-footing-hazards-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-footing-hazards-v1.png` — transparent runtime atlas.

## Runtime cells

| ID | Source rectangle | Placements |
| --- | --- | --- |
| `thatch` | `x 10, y 270, w 648, h 245` | Audit Thatch, Service Thatch, Release Windrow |
| `mud` | `x 724, y 270, w 645, h 254` | Irrigation Mud, Black Irrigation Mud |
| `roots` | `x 1433, y 263, w 657, h 257` | Exposed Root Mat, Range Root Mat |

The generated material is clipped inside the existing rotated gameplay ellipse. Approach outlines, warning pulses, bypass guidance, and surface-response particles remain runtime layers because they represent live state rather than physical object art.

## Generation prompt

> Use case: stylized-concept. Asset type: production terrain-hazard sprite atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Create exactly three isolated, wide, low-profile traversable ground-hazard sprites in one horizontal row with wide empty gutters on a perfectly flat solid #ff00ff chroma-key background. Left: an irregular flattened windrow of dead golf-course thatch and wet cut-grass clumps. Center: an irregular shallow patch of black irrigation mud with glossy wet ruts and compressed turf edges. Right: an irregular mat of exposed gnarled tree roots crossing damaged golf-course turf. Use very high-detail high-resolution pixel art, crisp deliberate pixel clusters, a premium gothic survival-horror palette, and slightly elevated front three-quarter ground-plane perspective. Keep every patch wider than tall, fully isolated, and contained. No text, signs, people, tools, balls, machinery, watermark, borders, background scene, deep pits, large rocks, or #ff00ff inside the subjects.

## Transparency pass

The runtime alpha image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#f204f0`; 1,248,779 pixels became fully transparent and 35,464 received partial alpha for clean material edges.
